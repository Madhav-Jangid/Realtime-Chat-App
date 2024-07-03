import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Users } from '@phosphor-icons/react'
import { IconButton } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

export default function AllGroups({ heading }) {

    const { user } = useUser();

    const fetchFriendRequests = async (email) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/getFriendRequests/${email}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.friendRequests;
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            return [];
        }
    };

    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        const loadFriendRequests = async () => {
            const requests = await fetchFriendRequests(user?.primaryEmailAddress?.emailAddress);
            setFriendRequests(requests);
        };

        loadFriendRequests();
    }, [user]);


    const acceptFriendRequest = async (user, to) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/acceptFriendRequest/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, to }),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return null;
        }
    };

    const handleAccept = async (user) => {
        const result = await acceptFriendRequest(user?.primaryEmailAddress?.emailAddress, user);
        if (result && result.status) {
            const updatedRequests = await fetchFriendRequests(user?.primaryEmailAddress?.emailAddress);
            setFriendRequests(updatedRequests);
        }
    };


    return (
        <div className='allUsers'>
            <h3 className='mainHeading'>
                <Users />
                <span>{heading}</span>
            </h3>
            <ul>
                {friendRequests.map((request, index) => (
                    <li key={index} className='reqContainer'>
                        <p>{request.user} on {new Date(request.date).toLocaleString()}</p>
                        {!request.isAccepted ?
                            <div className='reqContainerIcons'>
                                <IconButton onClick={() => handleAccept(request.user)}>
                                    <DoneIcon />
                                </IconButton>
                                <IconButton>
                                    <CloseIcon />
                                </IconButton>
                            </div>
                            : 'Accepted'}
                    </li>
                ))}
            </ul>

        </div>

    )
}
