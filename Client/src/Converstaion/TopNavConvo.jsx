import React from 'react';
import IconButton from '@mui/material/IconButton';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';

export default function TopNavConvo({ selectedUser }) {

    console.log(selectedUser);
    return (
        <div className='convoTopNav'>
            <div className='convoUserDetails'>
                <img className='avatarImage' src={selectedUser.image_url
} alt={`${selectedUser.username}'s_Image`} />
                <h3>{selectedUser.username || 'User'}</h3>
            </div>
            <div className='convoChatOptions'>
                <IconButton>
                    <VideocamOutlinedIcon />
                </IconButton>
                <IconButton>
                    <CallOutlinedIcon />
                </IconButton>
                <IconButton>
                    <SearchOutlinedIcon />
                </IconButton>
                <span className='dropDown'></span>
                <IconButton>
                    <ArrowDropDownOutlinedIcon />
                </IconButton>
            </div>
        </div>
    )
}
