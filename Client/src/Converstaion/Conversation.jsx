import React, { Suspense, useEffect, useMemo, useState } from 'react';
import './Conversation.css';
import InputFeild from './InputFeild';
import TopNavConvo from './TopNavConvo';
import { useSelector } from 'react-redux';
import { selectSelectedUser } from '../features/selectedUser/selectedUserSlice';
import { CircularProgress } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { socket } from '../Utils/socket';
const ConvoDiv = React.lazy(() => import('./ConvoDiv'));

export default function Conversation({ currentUser, settings }) {
  const location = useLocation();
  const selectedUser = useSelector(selectSelectedUser);
  const [roomId, setRoomId] = useState('');
  const [isContainUser, setIsContainUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchNavToken, setSearchNavToken] = useState(null);
  const [searchMeta, setSearchMeta] = useState({ totalCount: 0, activeIndex: -1 });

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/chats/') && pathname.split('/chats/')[1]) {
      setIsContainUser(true);
      setRoomId(pathname.split('/chats/')[1].split('/')[0]);
    } else {
      setIsContainUser(false);
      setRoomId('');
      setIsTyping(false);
    }
    setSearchQuery('');
    setSearchMeta({ totalCount: 0, activeIndex: -1 });
  }, [location]);

  useEffect(() => {
    setIsTyping(false);
    if (!roomId || !selectedUser?._id) return;

    const onTyping = ({ conversationId, userId, isTyping: typing }) => {
      if (conversationId !== roomId) return;
      if (userId !== selectedUser._id) return;
      setIsTyping(Boolean(typing));
    };

    socket.on('typing:update', onTyping);
    return () => socket.off('typing:update', onTyping);
  }, [roomId, selectedUser?._id]);

  const displayName = useMemo(() => currentUser?.name || 'User', [currentUser]);

  return selectedUser?.username && isContainUser ? (
    <div className='convoComponent'>
      <TopNavConvo
        selectedUser={selectedUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchMeta={searchMeta}
        onSearchPrev={() => setSearchNavToken({ direction: 'prev', at: Date.now() })}
        onSearchNext={() => setSearchNavToken({ direction: 'next', at: Date.now() })}
      />
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }} id="conversation" className="conversation"><CircularProgress /><p>Loading...</p></div>}>
        <ConvoDiv
          key={roomId}
          selectedUser={selectedUser}
          roomId={roomId}
          currentUser={currentUser}
          isTyping={isTyping}
          settings={settings}
          searchQuery={searchQuery}
          searchNavToken={searchNavToken}
          onSearchMetaChange={setSearchMeta}
        />
      </Suspense>
      <InputFeild roomId={roomId} currentUser={currentUser} settings={settings} />
    </div>
  ) : (
    <div className="CommonComponent">
      <div className="welcome-container defaultChatView">
        <img className="defaultChatImage" height={280} style={{ objectFit: 'contain' }} src="/Chating.png" alt="Couples chatting" />
        <h1 className="app-name">Hi, {displayName}</h1>
        <p className="defaultChatSubtext">Pick a chat and start talking.</p>
        <div className="defaultChatActions">
          <Link to="/chats" className="defaultChatBtn primary">Open Chats</Link>
          <Link to="/friend-requests" className="defaultChatBtn">Friend Requests</Link>
          <Link to="/settings" className="defaultChatBtn">Settings</Link>
        </div>
        <ul className="defaultChatTips">
          <li>Simple. Fast. Private.</li>
        </ul>
      </div>
    </div>
  );
}
