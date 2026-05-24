import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useLocation, useNavigate } from 'react-router-dom';
import DoneIcon from '@mui/icons-material/Done';
import { api } from '../Utils/api';

function formatLastTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function UserSlide({ user, add, conversationId, highlight, lastMessage, lastMessageAt, unreadCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestStatus, setRequestStatus] = useState(false);

  const isFriend = user?.isFriend || !add;

  const handleUserClick = () => {
    if (isFriend && conversationId) navigate(`/chats/${conversationId}`);
  };

  useEffect(() => {
    setRequestStatus(false);
  }, [user?._id]);

  const sendFriendRequest = async () => {
    try {
      await api.sendFriendRequest(user._id);
      setRequestStatus(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const activeConversationId = location.pathname.split('/chats/')[1]?.split('/')[0];

  return (
    <div
      style={highlight && conversationId && conversationId === activeConversationId ? { backgroundColor: 'var(--primary-blue1)' } : null}
      id={user._id}
      className='userSlide'
      onClick={handleUserClick}
    >
      <img height={35} width={35} className='avatarImage' src={user.avatar || user.image_url} alt={`${user.username}'s_Image`} />
      <div className='userDetails'>
        <h3>{user.username || user.name}</h3>
        {!add ? <h5 style={{ opacity: 0.75 }}>{lastMessage || 'No messages yet'}</h5> : null}
      </div>

      {!add ? (
        <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <small className='chatTimeStamp'>{formatLastTime(lastMessageAt)}</small>
          {unreadCount > 0 ? (
            <span style={{ background: '#25d366', color: '#fff', borderRadius: 10, minWidth: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, padding: '0 6px' }}>
              {unreadCount}
            </span>
          ) : null}
        </div>
      ) : null}

      {add && !isFriend ? (
        <IconButton onClick={(e) => {
          e.stopPropagation();
          sendFriendRequest();
        }}>
          {!requestStatus ? <PersonAddIcon /> : <DoneIcon />}
        </IconButton>
      ) : null}
    </div>
  );
}

