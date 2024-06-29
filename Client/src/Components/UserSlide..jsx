import React, { useEffect, useState } from 'react';
import { IconButton, tableSortLabelClasses } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import parse from 'html-react-parser';

export default function UserSlide({ user, add, serverUser, highlight }) {

    const { user: currentUser } = useUser();


    const navigate = useNavigate();
    const location = useLocation();

    const handleUserClick = () => {
        navigate(`/chats/${user.username}`)
    };

    const [lastMessage, setLastMessage] = useState('');
    const [roomId, setRoomId] = useState('');


    function concatenateAndSortByCharacter(email1, email2) {
        let concatenatedEmails = email1 + email2;
        let charArray = concatenatedEmails.split('');
        charArray.sort();
        let sortedEmails = charArray.join('');
        return sortedEmails;
    }


    useEffect(() => {
        if (user?.email_addresses?.[0].email_address && currentUser?.primaryEmailAddress.emailAddress) {
            let selectedUserEmail = user?.email_addresses[0].email_address;
            let userEmail = currentUser?.primaryEmailAddress.emailAddress;
            let conversationId = concatenateAndSortByCharacter(selectedUserEmail, userEmail)
            setRoomId(conversationId);
        }
    }, [currentUser, user]);


    const fetchConversation = async (roomId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId: roomId }),
            });
            if (!response.ok) {
                console.log('Error:', response.status, response.statusText);
                return;
            } else {
                const conversationData = await response.json();
                if (conversationData && conversationData.conversation.length > 0) {
                    const lastMessage = conversationData.conversation[conversationData.conversation.length - 1];
                    setLastMessage(lastMessage.message);
                }
            }
        } catch (error) {
            console.error('Error fetching session:', error);
        }
    };




    useEffect(() => {
        fetchConversation(roomId);
    }, [roomId])

    return (
        <div style={highlight && user.username === location.pathname.split('/').pop() ? {
            backgroundColor: 'var(--primary-blue1)'
        } : null}
            id={user.email_addresses[0].email_address} className='userSlide' onClick={(e) => {
                if(serverUser?.friendList?.includes(user?.email_addresses[0].email_address)){
                    handleUserClick();
                }else{
                    alert(`Sorry, ${user.username} is not a friend.`);
                }
            }}>
            <img height={35} width={35} className='avatarImage' src={user.image_url} alt={`${user.username}'s_Image`} />

            <div className='userDetails'>
                <h3>{user.username}</h3>
                {lastMessage && <h5>{parse(lastMessage)}</h5>}
            </div>
            {
                add && !serverUser?.friendList?.includes(user?.email_addresses[0].email_address) ?
                    <IconButton onClick={() => {
                        if (user?.email_addresses[0].email_address) {
                            alert(user.username);
                        } else {
                            console.log('id Hani');
                        }
                    }}>
                        <PersonAddIcon></PersonAddIcon>
                    </IconButton> : null
            }
        </div>
    )
}