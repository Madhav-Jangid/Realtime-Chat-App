import React, { useEffect, useState } from 'react';
import { Users } from '@phosphor-icons/react';
import { IconButton } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../Utils/api';
import { toastError, toastSuccess } from '../Utils/toast';

export default function AllGroups({ heading }) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const requests = await api.getFriendRequests();
      setFriendRequests(requests || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setError(error.message || 'Failed to load friend requests');
      setFriendRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (requestId) => {
    const removed = friendRequests.find((r) => r._id === requestId);
    setBusyId(`accept-${requestId}`);
    setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
    try {
      await api.acceptFriendRequest(requestId);
      toastSuccess('Friend request accepted');
    } catch (err) {
      if (removed) setFriendRequests((prev) => [removed, ...prev]);
      toastError(err.message || 'Failed to accept request');
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (requestId) => {
    const removed = friendRequests.find((r) => r._id === requestId);
    setBusyId(`reject-${requestId}`);
    setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
    try {
      await api.rejectFriendRequest(requestId);
      toastSuccess('Friend request rejected');
    } catch (err) {
      if (removed) setFriendRequests((prev) => [removed, ...prev]);
      toastError(err.message || 'Failed to reject request');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className='allUsers'>
      <h3 className='mainHeading'>
        <Users />
        <span>{heading}</span>
      </h3>
      {error ? <div className='tabErrorState'><p>{error}</p><button onClick={load}>Retry</button></div> : null}
      {loading ? <div className='tabLoadingState'>Loading requests...</div> : null}
      <ul>
        {!loading && !error && friendRequests.length === 0 ? <li className='tabEmptyState'>No pending friend requests.</li> : null}
        {friendRequests.map((request) => (
          <li key={request._id} className='reqContainer'>
            <p>
              <strong>{request?.sender?.username || request?.sender?.name}</strong>
              {' '}sent a request on {new Date(request.createdAt).toLocaleString()}
            </p>
            <div className='reqContainerIcons'>
              <IconButton disabled={Boolean(busyId)} onClick={() => handleAccept(request._id)} aria-label='Accept friend request'><DoneIcon /></IconButton>
              <IconButton disabled={Boolean(busyId)} onClick={() => handleReject(request._id)} aria-label='Reject friend request'><CloseIcon /></IconButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
