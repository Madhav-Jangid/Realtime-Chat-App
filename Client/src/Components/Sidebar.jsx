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
    const [isTablet, setIsTablet] = useState(() => window.innerWidth > 600 && window.innerWidth <= 900);

    useEffect(() => {
        const onResize = () => {
            const tablet = window.innerWidth > 600 && window.innerWidth <= 900;
            setIsTablet(tablet);
            if (tablet) {
                setWidth(70);
                setIsNavOpened(true);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const ShowLeftnav = () => {
        if (isTablet) return;
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

    const effectiveWidth = isTablet ? 70 : width;
    const effectiveClosed = isTablet ? true : isNavOpened;

    return (
        <div className={`SideNavBar ${effectiveClosed ? 'closedNav' : ''}`} style={active ? { display: 'block', width: 280 } : { width: effectiveWidth }}>
            <div className="sideNavIcons">
                <ul className='topIcon'>
                    <li>
                        <WechatLogo size={40} />
                        <span>{process.env.REACT_APP_APP_NAME}</span>
                    </li>

                    <Link data-content="Chats" className={location.pathname.endsWith('chats') || location.pathname.includes('chats') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/chats'}>
                        <li className='newNavLink'>
                            <IconButton aria-label='Chats'>
                                <ChatTeardropDots className='phosphor-icon' />
                            </IconButton>
                            <span>Chats</span>
                        </li>
                    </Link>

                    <Link data-content="Friend Requests" className={location.pathname.endsWith('friend-requests') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/friend-requests'}>
                        <li className='newNavLink'>
                            <IconButton aria-label='Friend requests'>
                                <Users className='phosphor-icon' />
                            </IconButton>
                            <span>Friend Requests</span>
                        </li>
                    </Link>

                    <Link data-content="Notifications" className={location.pathname.endsWith('notifications') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/notifications'}>
                        <li className='newNavLink'>
                            <IconButton aria-label='Notifications'>
                                <Bell className='phosphor-icon' />
                            </IconButton>
                            <span>Notifications</span>
                        </li>
                    </Link>

                    <Link data-content="Settings" className={location.pathname.endsWith('settings') ? 'activeNavLink' : 'nonActiveNavLink'} to={'/settings'}>
                        <li className='newNavLink'>
                            <IconButton aria-label='Settings'>
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
                        }} style={effectiveClosed ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : { display: 'block' }}>
                            <IconButton aria-label='Toggle theme'>
                                {!theme ?
                                    <DarkModeIcon /> :
                                    <WbSunnyIcon />
                                }
                            </IconButton>
                            {!effectiveClosed ? <span>{!theme ? 'Dark Theme' : 'Light Theme'}</span> : null}
                        </li>

                        <div className='sideNavUserIcon'>
                            {effectiveClosed ? <UserButton /> : <UserButton showName />}
                        </div>
                    </ul>
                </>
            </div>
            {!drawer && !isTablet &&
                <IconButton aria-label='Toggle sidebar' onClick={() => ShowLeftnav()} className='CaretRightButton'>
                    {isNavOpened ? <CaretRight className='CaretRight' /> : <CaretLeft className='CaretRight' />}
                </IconButton>
            }
        </div>
    );
}
