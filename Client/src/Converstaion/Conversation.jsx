import React, { Suspense, useEffect, useState } from 'react';
import './Conversation.css';
import InputFeild from './InputFeild';
import TopNavConvo from './TopNavConvo';
import { useUser } from '@clerk/clerk-react';
import { useSelector } from 'react-redux';
import { selectSelectedUser } from '../features/selectedUser/selectedUserSlice';
import { CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
const ConvoDiv = React.lazy(() => import('./ConvoDiv'));

export default function Conversation() {
    
    const location = useLocation();
    
    const [isContainUser, setIsContainUser] = useState(false);
    
    const { user } = useUser();
    const [roomId, setRoomId] = useState('');
    const selectedUser = useSelector(selectSelectedUser);

    function concatenateAndSortByCharacter(email1, email2) {
        let concatenatedEmails = email1 + email2;
        let charArray = concatenatedEmails.split('');
        charArray.sort();
        let sortedEmails = charArray.join('');
        return sortedEmails;
    }

    useEffect(() => {
        if (selectedUser?.email_addresses?.[0].email_address && user?.primaryEmailAddress.emailAddress) {
            setIsContainUser(true);
            let selectedUserEmail = selectedUser?.email_addresses[0].email_address;
            let userEmail = user?.primaryEmailAddress.emailAddress;
            let conversationId = concatenateAndSortByCharacter(selectedUserEmail, userEmail)
            setRoomId(conversationId);
        }
    }, [selectedUser, user]);



    const checkUrlForChatUser = () => {
        const pathname = location.pathname;
        if (pathname.startsWith('/chats')) {
            const chatUser = pathname.split('/chats')[1];
            if (chatUser && chatUser.trim().length > 0 && chatUser !== '/') {
                console.log('Chat user found:', chatUser);
                return
            }
        }
        setIsContainUser(false)
    };

    useEffect(() => {
        checkUrlForChatUser();
    }, [location]);

    return (
        <>
            {
                selectedUser?.username && isContainUser ?
                    <div 
                    style={window.innerWidth < 601 ? {
                        zIndex: '50',
                    } : {
                        zIndex: '1',
                    }}
                     className='convoComponent'>
                        <TopNavConvo selectedUser={selectedUser} />
                        <Suspense fallback={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: 10
                            }} id="conversation" name="conversation" className="conversation">
                                <CircularProgress />
                                <p>Loading...</p>
                            </div>}>
                            <ConvoDiv selectedUser={selectedUser} roomId={roomId} user={user} />
                        </Suspense>
                        <InputFeild selectedUser={selectedUser} roomId={roomId} user={user} />
                    </div > :

                    <div className="CommonComponent">
                        <div className="welcome-container">
                            <h1 className="app-name">Welcome {user.fullName} to {process.env.REACT_APP_APP_NAME}</h1>
                            <p className="tagline">Where Conversations Come to Life!</p>
                            <div className="features">
                                <p>Explore the features:</p>
                                <ul>
                                    <li>📱 Instant Messaging</li>
                                    <li>📸 Photo and Media Sharing</li>
                                    <li>🎉 Group Chats</li>
                                    <li>🔒 Enhanced Security</li>
                                </ul>
                            </div>
                            <p className="call-to-action">Ready to embark on a journey of endless conversations? Sign up now and let the chatting begin!</p>
                        </div>
                    </div>
            }
        </>
    )
}
