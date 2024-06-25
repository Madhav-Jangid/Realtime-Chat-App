import React from 'react';
import { IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '../features/selectedUser/selectedUserSlice';
import { useLocation, useNavigate } from 'react-router-dom';

export default function UserSlide({ user, add, serverUser, highlight }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleUserClick = () => {
        // dispatch(setSelectedUser(user));
        navigate(`/chats/${user.username}`)
    };



    return (
        <div style={highlight && user.username === location.pathname.split('/').pop() ? {
            backgroundColor: 'var(--primary-blue1)'
        } : null}
            id={user.email_addresses[0].email_address} className='userSlide' onClick={handleUserClick}>
            <img height={35} width={35} className='avatarImage' src={user.image_url} alt={`${user.username}'s_Image`} />

            <div className='userDetails'>
                <h3>{user.username}</h3>
                {
                    user.id ?
                        <h5>{user.id}</h5> :
                        null
                }
            </div>
            {
                add && !serverUser?.friendList?.includes(user?.email_addresses[0].email_address) ?
                    <IconButton onClick={() => {
                        if (user?.email_addresses[0].email_address) {
                            console.log(user.username);
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