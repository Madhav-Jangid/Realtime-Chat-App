import React, { useMemo, useState } from 'react';
import { useEffect } from 'react';
import '../css/SettingsTab.css';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer } from '@mui/material';
import SideBar from './Sidebar';
import { Gear, Trash, UserMinus } from '@phosphor-icons/react';
import { api } from '../Utils/api';
import { applyThemeFromSettings, defaultSettings, getSettings, saveSettings } from '../Utils/settings';
import { toastError, toastSuccess } from '../Utils/toast';

export default function SettingsTab({ users, conversations, currentUser, onRefreshData, onSettingsChange }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getSettings);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState('');

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

  const conversationByFriend = useMemo(() => {
    const map = new Map();
    for (const conversation of conversations || []) {
      const other = (conversation.members || []).find((m) => m._id !== currentUser?._id);
      if (other?._id) {
        map.set(other._id, conversation);
      }
    }
    return map;
  }, [conversations, currentUser?._id]);

  const persistSettings = (next) => {
    setSettings(next);
    saveSettings(next);
    applyThemeFromSettings(next);
    document.body.classList.toggle('compact-mode', Boolean(next.compactMode));
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    onSettingsChange?.(next);
  };

  const toggle = async (key) => {
    setMessage('');
    setError('');
    if (key === 'desktopNotifications') {
      const nextValue = !settings.desktopNotifications;
      if (nextValue && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setError('Desktop notification permission is blocked in browser settings.');
          toastError('Desktop notification permission denied');
          return;
        }
      }
    }
    const next = { ...settings, [key]: !settings[key] };
    persistSettings(next);
  };

  const handleUnfriend = async (friendId, username) => {
    if (!window.confirm(`Unfriend ${username || 'this user'}?`)) return;
    setBusyId(`unfriend-${friendId}`);
    setMessage('');
    setError('');
    try {
      await api.unfriend(friendId);
      setMessage(`Removed ${username || 'friend'} from your friends list.`);
      toastSuccess(`Removed ${username || 'friend'}`);
      onRefreshData?.();
    } catch (e) {
      setError(e.message || 'Failed to unfriend user');
      toastError(e.message || 'Failed to unfriend user');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteChat = async (conversationId, username) => {
    if (!window.confirm(`Delete chat with ${username || 'this user'}? This cannot be undone.`)) return;
    setBusyId(`chat-${conversationId}`);
    setMessage('');
    setError('');
    try {
      await api.deleteConversation(conversationId);
      setMessage(`Deleted chat with ${username || 'user'}.`);
      toastSuccess(`Deleted chat with ${username || 'user'}`);
      onRefreshData?.();
    } catch (e) {
      setError(e.message || 'Failed to delete chat');
      toastError(e.message || 'Failed to delete chat');
    } finally {
      setBusyId('');
    }
  };

  const resetSettings = () => {
    persistSettings({ ...defaultSettings });
    setMessage('Settings reset to defaults.');
    toastSuccess('Settings reset');
  };

  return (
    <div className='allUsers settingsTab'>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <SideBar active={open} drawer={true} />
      </Drawer>
      <h3 className='mainHeading'>
        <IconButton id='shortNavIcon' onClick={() => setOpen(true)}><MenuIcon /></IconButton>
        <Gear />
        <span>Settings</span>
      </h3>

      {message ? <p className='settingsMessage'>{message}</p> : null}
      {error ? <p className='settingsError'>{error}</p> : null}
      {savedAt ? <p className='settingsSavedAt'>Saved at {savedAt}</p> : null}

      <section className='settingsCard'>
        <h4>Preferences</h4>
        {Object.entries({
          darkMode: 'Dark mode',
          desktopNotifications: 'Desktop notifications',
          soundAlerts: 'Sound alerts',
          enterToSend: 'Enter to send',
          readReceipts: 'Read receipts',
          typingIndicators: 'Typing indicators',
          compactMode: 'Compact mode',
          autoDownloadMedia: 'Auto-download media'
        }).map(([key, label]) => (
          <label key={key} className='settingsRow'>
            <span>{label}</span>
            <button
              type='button'
              className={`toggleSwitch ${settings[key] ? 'on' : 'off'}`}
              onClick={() => toggle(key)}
              aria-pressed={Boolean(settings[key])}
              aria-label={label}
            >
              <span className='toggleThumb' />
            </button>
          </label>
        ))}
        <div className='settingsActions'>
          <button type='button' className='secondaryBtn' onClick={resetSettings}>Reset to defaults</button>
        </div>
      </section>

      <section className='settingsCard'>
        <h4>Friends</h4>
        {users?.length ? users.map((friend) => (
          <div className='dangerRow' key={friend._id}>
            <div>
              <strong>{friend.username || friend.name || 'Unknown User'}</strong>
            </div>
            <button
              className='dangerBtn'
              disabled={busyId === `unfriend-${friend._id}`}
              onClick={() => handleUnfriend(friend._id, friend.username || friend.name)}
            >
              <UserMinus size={16} /> {busyId === `unfriend-${friend._id}` ? 'Removing...' : 'Unfriend'}
            </button>
          </div>
        )) : <p className='emptyState'>No friends found.</p>}
      </section>

      <section className='settingsCard'>
        <h4>Chats</h4>
        {users?.length ? users.map((friend) => {
          const conversation = conversationByFriend.get(friend._id);
          if (!conversation?._id) return null;
          return (
            <div className='dangerRow' key={conversation._id}>
              <div>
                <strong>{friend.username || friend.name || 'Unknown User'}</strong>
              </div>
              <button
                className='dangerBtn deleteBtn'
                disabled={busyId === `chat-${conversation._id}`}
                onClick={() => handleDeleteChat(conversation._id, friend.username || friend.name)}
              >
                <Trash size={16} /> {busyId === `chat-${conversation._id}` ? 'Deleting...' : 'Delete Chat'}
              </button>
            </div>
          );
        }) : <p className='emptyState'>No chats available.</p>}
      </section>
    </div>
  );
}
