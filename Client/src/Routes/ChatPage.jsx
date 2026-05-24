import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../Components/Sidebar';
import '../css/ChatPage.css';
import '../css/Allusers.css';
import '../css/Responsive.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AllChats from '../Components/AllChats';
import AllGroups from '../Components/AllGroups';
import AllNotifications from '../Components/AllNotifications';
import SettingsTab from '../Components/SettingsTab';
import MobileTabBar from '../Components/MobileTabBar';
import { useDispatch } from 'react-redux';
import { clearSelectedUser, setSelectedUser } from '../features/selectedUser/selectedUserSlice';
import Conversation from '../Converstaion/Conversation';
import { api } from '../Utils/api';
import { socket } from '../Utils/socket';
import { getSettings } from '../Utils/settings';

export default function ChatPage({ currentUser }) {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [settings, setSettings] = useState(getSettings);
  const [highlight, setHighlight] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 600);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isConversationRoute = location.pathname.startsWith('/chats/');

  useEffect(() => {
    if (!currentUser?._id) return;

    let active = true;
    const loadData = async () => {
      try {
        const [friends, convos] = await Promise.all([api.getFriends(), api.getConversations()]);
        if (!active) return;
        setUsers(friends || []);
        setConversations(convos || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const refreshSidebarData = async () => {
    try {
      const [friends, convos] = await Promise.all([api.getFriends(), api.getConversations()]);
      setUsers(friends || []);
      setConversations(convos || []);
      if (location.pathname.startsWith('/chats/')) {
        const activeConversationId = location.pathname.split('/chats/')[1]?.split('/')[0];
        if (activeConversationId && !(convos || []).some((c) => c._id === activeConversationId)) {
          dispatch(clearSelectedUser());
          navigate('/chats');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!currentUser?._id) return;

    const onMessageNew = (msg) => {
      if (settings?.soundAlerts && msg.sender !== currentUser._id) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YRAAAAAA');
          audio.volume = 0.15;
          audio.play().catch(() => {});
        } catch (_error) {}
      }
      if (
        settings?.desktopNotifications &&
        msg.sender !== currentUser._id &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(process.env.REACT_APP_APP_NAME || 'New message', {
            body: msg.text || 'You received a new message'
          });
        } catch (_error) {}
      }
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === msg.conversationId);
        if (idx < 0) return prev;

        const item = prev[idx];
        const nextUnread = msg.sender === currentUser._id ? item.unreadCount || 0 : (item.unreadCount || 0) + 1;

        const updated = {
          ...item,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: nextUnread
        };

        const clone = [...prev];
        clone.splice(idx, 1);
        return [updated, ...clone];
      });
    };

    const onMessageUpdated = ({ conversationId, text, editedAt, updatedAt }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === conversationId);
        if (idx < 0) return prev;
        const item = prev[idx];

        const updated = {
          ...item,
          lastMessage: text || item.lastMessage,
          lastMessageAt: editedAt || updatedAt || item.lastMessageAt
        };

        const clone = [...prev];
        clone[idx] = updated;
        return clone;
      });
    };

    const onMessageDeleted = ({ conversationId }) => {
      api.getConversations()
        .then((fresh) => setConversations(fresh || []))
        .catch(console.error);
    };

    const onSeenUpdate = ({ conversationId, seenByUserId }) => {
      if (!conversationId || seenByUserId !== currentUser._id) return;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === conversationId);
        if (idx < 0) return prev;
        const item = prev[idx];
        const updated = { ...item, unreadCount: 0 };
        const clone = [...prev];
        clone[idx] = updated;
        return clone;
      });
    };

    socket.on('message:new', onMessageNew);
    socket.on('message:updated', onMessageUpdated);
    socket.on('message:deleted', onMessageDeleted);
    socket.on('message:seen:update', onSeenUpdate);

    return () => {
      socket.off('message:new', onMessageNew);
      socket.off('message:updated', onMessageUpdated);
      socket.off('message:deleted', onMessageDeleted);
      socket.off('message:seen:update', onSeenUpdate);
    };
  }, [currentUser?._id, settings?.soundAlerts, settings?.desktopNotifications]);

  const conversationToOtherUser = useMemo(() => {
    const map = new Map();
    for (const convo of conversations) {
      const other = (convo.members || []).find((m) => m._id !== currentUser?._id);
      if (other) map.set(convo._id, other);
    }
    return map;
  }, [conversations, currentUser?._id]);

  useEffect(() => {
    if (!location.pathname.startsWith('/chats/')) {
      setHighlight(false);
      dispatch(clearSelectedUser());
      return;
    }

    const conversationId = location.pathname.split('/chats/')[1]?.split('/')[0];
    if (!conversationId) {
      setHighlight(false);
      dispatch(clearSelectedUser());
      return;
    }

    const selected = conversationToOtherUser.get(conversationId);
    if (selected) {
      dispatch(setSelectedUser(selected));
      setHighlight(true);
      document.title = `Chats | ${selected.username || selected.name || 'User'}`;

      setConversations((prev) => prev.map((c) => c._id === conversationId ? { ...c, unreadCount: 0 } : c));
    } else {
      dispatch(clearSelectedUser());
      setHighlight(false);
    }
  }, [location, conversationToOtherUser, dispatch]);

  return (
    <>
      <section className='chatPage'>
        <Sidebar active={null} drawer={false} />
        {(!isMobile || !isConversationRoute) ? (
          <Routes>
            <Route
              path='/chats/*'
              element={
                <AllChats
                  highlight={highlight}
                  heading={'Messages'}
                  users={users}
                  currentUser={currentUser}
                  conversations={conversations}
                  onRefreshData={refreshSidebarData}
                />
              }
            />
            <Route
              path='/chats'
              element={
                <AllChats
                  highlight={highlight}
                  heading={'Messages'}
                  users={users}
                  currentUser={currentUser}
                  conversations={conversations}
                  onRefreshData={refreshSidebarData}
                />
              }
            />
            <Route path='/friend-requests' element={<AllGroups heading={'Friend Requests'} />} />
            <Route path='/notifications' element={<AllNotifications heading={'Notifications'} />} />
            <Route
              path='/settings'
              element={
                <SettingsTab
                  users={users}
                  conversations={conversations}
                  currentUser={currentUser}
                  onRefreshData={refreshSidebarData}
                  onSettingsChange={setSettings}
                />
              }
            />
          </Routes>
        ) : null}
        {(!isMobile || isConversationRoute) ? <Conversation currentUser={currentUser} settings={settings} /> : null}
      </section>
      {isMobile ? <MobileTabBar /> : null}
    </>
  );
}
