import React, { useEffect, useState } from 'react';
import { Bell } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { api } from '../Utils/api';
import { toastError, toastSuccess } from '../Utils/toast';

const PAGE_SIZE = 20;

export default function AllNotifications({ heading }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageInfo, setPageInfo] = useState({ nextCursor: null, hasMore: false });
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async (cursor) => {
    try {
      setError('');
      if (!cursor) setLoading(true);
      const data = await api.getNotifications(cursor, PAGE_SIZE);
      setItems((prev) => (cursor ? [...prev, ...(data?.items || [])] : (data?.items || [])));
      setUnreadCount(data?.unreadCount || 0);
      setPageInfo(data?.pageInfo || { nextCursor: null, hasMore: false });
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      toastError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markOneRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setItems((prev) => prev.map((item) => item._id === id ? { ...item, isRead: true } : item));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      toastError(err.message || 'Failed to mark notification read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toastSuccess('All notifications marked as read');
    } catch (err) {
      toastError(err.message || 'Failed to mark all read');
    }
  };

  const removeOne = async (id) => {
    try {
      await api.deleteNotification(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toastSuccess('Notification removed');
    } catch (err) {
      toastError(err.message || 'Failed to remove notification');
    }
  };

  return (
    <div className='allUsers notification'>
      <h3 className='mainHeading'>
        <Bell />
        <span>{heading}</span>
        <span className='notificationsBadge'>{unreadCount} unread</span>
      </h3>
      <div className='notificationActions'>
        <button type='button' className='secondaryBtn' disabled={!unreadCount} onClick={markAllRead}>Mark all read</button>
      </div>
      {error ? <div className='tabErrorState'><p>{error}</p><button onClick={() => load()}>Retry</button></div> : null}
      {loading ? <div className='tabLoadingState'>Loading notifications...</div> : null}
      {!loading && !error && !items.length ? <div className='tabEmptyState'>No notifications yet.</div> : null}
      <ul>
        {items.map((item) => (
          <li key={item._id} className={`notiContainer ${item.isRead ? 'read' : 'unread'}`}>
            <p style={{ margin: 0, overflowWrap: 'anywhere' }}><strong>{item.title}</strong></p>
            <p style={{ margin: 0, overflowWrap: 'anywhere' }}>{item.body}</p>
            <p className='notiTime'>{new Date(item.createdAt).toLocaleString()}</p>
            <div className='notiActionsRow'>
              {!item.isRead ? <button type='button' onClick={() => markOneRead(item._id)}>Mark read</button> : null}
              {item.type === 'message.new' && item.conversationId ? <Link to={`/chats/${item.conversationId}`}>Open chat</Link> : null}
              {(item.type === 'friend.accepted' || item.type === 'friend.rejected') ? <Link to='/friend-requests'>Open requests</Link> : null}
              <button type='button' className='dangerLink' onClick={() => removeOne(item._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {pageInfo.hasMore ? (
        <div className='loadMoreWrap'>
          <button type='button' className='secondaryBtn' onClick={() => load(pageInfo.nextCursor)}>Load more</button>
        </div>
      ) : null}
    </div>
  );
}
