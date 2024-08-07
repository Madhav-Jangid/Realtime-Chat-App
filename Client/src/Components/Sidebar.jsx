import React, { useEffect, useState } from 'react';
import '../css/SideBar.css';
import { IconButton } from '@mui/material';
import { Bell, CaretLeft, CaretRight, ChatTeardropDots, Gear, Users, WechatLogo } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { UserButton } from '@clerk/clerk-react';


export default function SideBar({ active, drawer }) {
    const location = useLocation();

    const [width, setWidth] = useState(80);
    const [isNavOpened, setIsNavOpened] = useState(true);

    const ShowLeftnav = () => {
        if (isNavOpened) {
            setWidth(280);
        } else {
            setWidth(80);
        }
        setIsNavOpened(!isNavOpened);
    };

    useEffect(() => {
        if (active) {
            ShowLeftnav()
        }
    }, [active])

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
        <div className={`SideNavBar ${!isNavOpened ? null : 'closedNav'}`} style={active ? { display: 'block', width: 280 } : { width: width }}>
            <div className="sideNavIcons">
                <ul className='topIcon'>
                    <li>
                        <WechatLogo size={40} />
                        <span>{process.env.REACT_APP_APP_NAME}</span>
                    </li>

                    <Link data-content="Chats" className={location.pathname.endsWith('chats') || location.pathname.includes('chats') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/chats'}>
                        <li className='newNavLink'>
                            <IconButton>
                                <ChatTeardropDots className='phosphor-icon' />
                            </IconButton>
                            <span>Chats</span>
                        </li>
                    </Link>

                    <Link data-content="Friend Requests" className={location.pathname.endsWith('friend-requests') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/friend-requests'}>
                        <li className='newNavLink'>
                            <IconButton>
                                <Users className='phosphor-icon' />
                            </IconButton>
                            <span>Friend Requests</span>
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


                <>
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

                        <div className='sideNavUserIcon'>
                            {isNavOpened ? <UserButton /> : <UserButton showName />}
                        </div>
                    </ul>
                </>
            </div>
            {!drawer &&
                <IconButton onClick={() => ShowLeftnav()} className='CaretRightButton'>
                    {isNavOpened ? <CaretRight className='CaretRight' /> : <CaretLeft className='CaretRight' />}
                </IconButton>
            }
        </div>
    );
}
