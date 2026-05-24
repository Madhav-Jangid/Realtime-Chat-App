import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { CircularProgress, Drawer, IconButton } from '@mui/material';
import { ChatTeardropDots } from '@phosphor-icons/react';
import CancelIcon from '@mui/icons-material/Cancel';
import { UserButton } from '@clerk/clerk-react';
import SideBar from './Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import { api } from '../Utils/api';
const UserSlide = React.lazy(() => import('./UserSlide.'));

export default function AllChats({ heading, users, highlight, currentUser, conversations }) {
  const [name, setName] = useState(() => sessionStorage.getItem('chat_search_term') || '');
  const [searchedUser, setSearchedUser] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);

  const friendConversationMap = useMemo(() => {
    const map = new Map();
    for (const convo of conversations || []) {
      const other = (convo.members || []).find((m) => m._id !== currentUser?._id);
      if (other?._id) {
        map.set(other._id, {
          conversationId: convo._id,
          lastMessage: convo.lastMessage || '',
          lastMessageAt: convo.lastMessageAt || null,
          unreadCount: convo.unreadCount || 0
        });
      }
    }
    return map;
  }, [conversations, currentUser?._id]);

  useEffect(() => {
    setSearchedUser(Boolean(name));
  }, [name]);

  useEffect(() => {
    sessionStorage.setItem('chat_search_term', name);
  }, [name]);

  useEffect(() => {
    let cancelled = false;
    async function runSearch() {
      if (!name.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const data = await api.searchUsers(name.trim());
        if (!cancelled) setSearchResults(data || []);
      } catch (e) {
        console.error(e);
      }
    }

    const t = setTimeout(runSearch, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [name]);

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className='allUsers'>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <SideBar active={open} drawer={true} />
      </Drawer>

      <h3 className='mainHeading'>
        <IconButton id='shortNavIcon' onClick={toggleDrawer(true)}><MenuIcon /></IconButton>
        <ChatTeardropDots />
        <span>{heading}</span>
        <div id='userProfileButton'><UserButton showName /></div>
      </h3>

      <div className='searchUserInputFeild'>
        <input type='text' placeholder='Search or start a new chat' value={name} onChange={(e) => {
          setName(e.target.value);
          setSearchedUser(Boolean(e.target.value));
        }} />
        {searchedUser && <IconButton className='crossIcon' onClick={() => {
          setName('');
          setSearchedUser(false);
          setSearchResults([]);
        }}><CancelIcon /></IconButton>}
      </div>

      {searchedUser ? (
        searchResults?.length ? searchResults.map((user) => {
          const convoMeta = friendConversationMap.get(user._id) || {};
          return (
            <Suspense key={user._id} fallback={null}>
              <UserSlide user={user} add={true} conversationId={convoMeta.conversationId || ''} lastMessage={convoMeta.lastMessage || ''} lastMessageAt={convoMeta.lastMessageAt} unreadCount={convoMeta.unreadCount || 0} highlight={highlight} />
            </Suspense>
          );
        }) : <div className='noResultsMessage' style={{ textAlign: 'center', marginTop: '2rem' }}>No users found.</div>
      ) : (
        users ? (
          users.length ? users.map((user) => {
            const convoMeta = friendConversationMap.get(user._id) || {};
            return (
              <Suspense key={user._id} fallback={null}>
                <UserSlide highlight={highlight} user={user} add={false} conversationId={convoMeta.conversationId || ''} lastMessage={convoMeta.lastMessage || ''} lastMessageAt={convoMeta.lastMessageAt} unreadCount={convoMeta.unreadCount || 0} />
              </Suspense>
            );
          }) : <div className='noMessages'><span>You can add friends by searching and sending friend requests.</span></div>
        ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '70%' }}><CircularProgress /></div>
      )}
    </div>
  );
}
