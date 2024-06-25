import React, { useState } from 'react';
import '../css/SideBar.css';
import { IconButton } from '@mui/material';
import { Bell, CaretLeft, CaretRight, ChatTeardropDots, Gear, Users, WechatLogo } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { UserButton } from '@clerk/clerk-react';


export default function SideBar({ active }) {
    const location = useLocation();

    const [width, setWidth] = useState(80);
    const [isNavOpened, setIsNavOpened] = useState(true);

    const ShowLeftnav = () => {
        if (isNavOpened) {
            setWidth(250);
        } else {
            setWidth(80);
        }
        setIsNavOpened(!isNavOpened);
    };

    const [theme, setTheme] = useState(false);
    const toggleTheme = () => {
        if (theme) {
            document.body.classList.remove('dark');
        } else {
            document.body.classList.add('dark');
        }
        setTheme(!theme);
    };

    return (
        <div className={`SideNavBar ${!isNavOpened ? null : 'closedNav'}`} style={{ width: width }}>
            <nav className="sideNavIcons">
                <ul className='topIcon'>
                    <li className={`profileDivImage ${active === 'profile' ? 'activeNavLink' : 'nonActiveNavLink'}`}>
                        <WechatLogo size={40} />
                        <span>{process.env.REACT_APP_APP_NAME}</span>
                    </li>

                    <Link data-content="Chats" className={location.pathname.endsWith('chats') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/chats'}>
                        <li className='newNavLink'>
                            <IconButton>
                                <ChatTeardropDots className='phosphor-icon' />
                            </IconButton>
                            <span>Chats</span>
                        </li>
                    </Link>

                    <Link data-content="Groups" className={location.pathname.endsWith('groups') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/groups'}>
                        <li className='newNavLink'>
                            <IconButton>
                                <Users className='phosphor-icon' />
                            </IconButton>
                            <span>Groups</span>
                        </li>
                    </Link>

                    <Link data-content="Notifications" className={location.pathname.endsWith('notifications') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/notifications'}>
                        <li className='newNavLink'>
                            <IconButton>
                                <Bell className='phosphor-icon' />
                            </IconButton>
                            <span>Notifications</span>
                        </li>
                    </Link>

                    <Link data-content="Settings" className={location.pathname.endsWith('settings') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/settings'}>
                        <li className='newNavLink'>
                            <IconButton>
                                <Gear className='phosphor-icon' />
                            </IconButton>
                            <span>Settings</span>
                        </li>
                    </Link>
                </ul>

                <ul className='bottomIcons'>


                    <li onClick={() => {
                        setTheme(!theme);
                        toggleTheme();
                    }} style={isNavOpened ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : { display: 'block' }}>
                        <IconButton >
                            {!theme ?
                                <DarkModeIcon /> :
                                <WbSunnyIcon />
                            }
                        </IconButton>
                        {!isNavOpened ? <span>{!theme ? 'Dark Theme' : 'Light Theme'}</span> : null}
                    </li>


                    <UserButton />


                </ul>
            </nav>
            <IconButton onClick={() => ShowLeftnav()} className='CaretRightButton'>
                {isNavOpened ? <CaretRight className='CaretRight' /> : <CaretLeft className='CaretRight' />}
            </IconButton>
        </div>
    );
}
