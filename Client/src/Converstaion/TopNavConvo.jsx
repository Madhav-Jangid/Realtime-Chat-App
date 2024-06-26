import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import { ArrowLeft } from '@phosphor-icons/react';
import { Link, Navigate } from 'react-router-dom';
import "../css/Responsive.css"
import { Menu, MenuItem } from '@mui/material';

export default function TopNavConvo({ selectedUser }) {

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className='convoTopNav'>
            <div className='convoUserDetails'>
                <Link id='backButtonForChat' to={'/chats'}>
                    <IconButton>
                        <ArrowLeft />
                    </IconButton>
                </Link>
                <img className='avatarImage' src={selectedUser.image_url
                } alt={`${selectedUser.username}'s_Image`} />
                <h3>{selectedUser.username || 'User'}</h3>
            </div>
            <div className='convoChatOptions'>
                <div className='ShortMenu'>
                    <IconButton
                        id="demo-positioned-button"
                        aria-controls={open ? 'demo-positioned-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        <ArrowDropDownOutlinedIcon />
                    </IconButton>
                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem onClick={handleClose}>
                            <VideocamOutlinedIcon />
                            &nbsp;&nbsp; Video Call
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <CallOutlinedIcon />
                            &nbsp;&nbsp;Voice Call
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <SearchOutlinedIcon />
                            &nbsp;&nbsp;Search
                        </MenuItem>
                    </Menu>

                </div>

                <div className='longMenu'>
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
        </div >
    )
}
