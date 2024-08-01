import React from 'react';
import { Link } from 'react-router-dom';
import "../css/Homepage.css";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Button } from '@mui/material';
import ChillChatLogo from '../Utils/Images/ChillChat_Logo.png';


export default function NavBar() {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <nav>
            <h1><Link to={'/'}>{process.env.REACT_APP_APP_NAME}</Link></h1>
            <ul className='shortNavContent'>Workflow</ul>
            <ul className='shortNavContent'>Features</ul>
            <div className='shortNavContent'>
                <ul><Link to={'/login'}>Sign Up</Link></ul>
                <ul><Link to={'/signup'}>Join Today</Link></ul>
            </div>
            <IconButton
                id="demo-positioned-button"
                aria-controls={open ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                className='menuButton'>
                <DragHandleIcon />
            </IconButton>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleClose}>Workflow</MenuItem>
                <MenuItem onClick={handleClose}>Features</MenuItem>
                <MenuItem onClick={handleClose}> <Button varient="outlined">Sign Up</Button></MenuItem>
            </Menu>
        </nav>
    )
}
