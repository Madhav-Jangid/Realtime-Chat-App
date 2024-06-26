import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../Components/Sidebar';
import '../css/ChatPage.css';
import "../css/Allusers.css";
import '../css/Responsive.css';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import AllChats from '../Components/AllChats';
import AllGroups from '../Components/AllGroups';
import AllNotifications from '../Components/AllNotifications';
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '../features/selectedUser/selectedUserSlice';
import Conversation from '../Converstaion/Conversation';
import { Drawer, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { UserButton } from '@clerk/clerk-react';


export default function ChatPage({ currentUser }) {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const dispatch = useDispatch();

    const [users, setUsers] = useState(null);
    const { username } = useParams();
    const location = useLocation();
    const navigate = useNavigate();


    const searchUserByEmail = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/fetchClerkUsers`);

            if (!response.ok) {
                // console.log(response);
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (data) {
                setUsers([data].flat());
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        if (!users) {
            searchUserByEmail();
        }
    }, [users])

    const [urlUser, setUrlUser] = useState(null);
    const [highlight, setHighlight] = useState(false);

    const handleUsernameChange = async (urlUser) => {
        const urlUserData = users?.filter(user =>
            user.username.toLowerCase().includes(urlUser?.toLowerCase())
        );
        if (urlUserData && urlUserData.length > 0) {
            // console.log(urlUserData?.[0]);
            setUrlUser(urlUserData);
            dispatch(setSelectedUser(urlUserData[0]));
            setHighlight(true);
        } else {
            console.log('No Data Found');
            setUrlUser(null);
        }
    };

    useEffect(() => {
        const urlUserFromPath = location.pathname.split('/').pop();
        if (location.pathname.includes('/chats/')) {
            handleUsernameChange(urlUserFromPath);
        } else {
            console.log('no user found');
        }
    }, [location, users]); // Include `location` and `users` in the dependency array




    return (
        <section className='chatPage'>
            <Sidebar active={null} drawer={false} />
            
       
            <Routes>
                <Route path='/chats/*' element={
                    <AllChats
                        highlight={highlight}
                        heading={'Messages'}
                        users={users}
                    />
                } />
                <Route path='/chats' element={
                    <AllChats
                        highlight={highlight}
                        heading={'Messages'}
                        users={users}
                    />
                } />
                <Route path='/groups' element={
                    <AllGroups
                        heading={'Groups'}
                        users={users}
                    />
                } />
                <Route path='/notifications' element={
                    <AllNotifications
                        heading={'Notifications'}
                        users={users}
                    />
                } />

            </Routes>
            <Conversation />
        </section>
    )
}
