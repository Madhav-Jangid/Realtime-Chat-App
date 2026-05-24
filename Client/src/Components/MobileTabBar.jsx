import React from 'react';
import { Bell, ChatTeardropDots, Gear, Users } from '@phosphor-icons/react';
import { NavLink } from 'react-router-dom';

export default function MobileTabBar() {
  return (
    <nav className='mobileTabBar' aria-label='Mobile primary navigation'>
      <NavLink to='/chats' className={({ isActive }) => `mobileTabItem ${isActive ? 'active' : ''}`} aria-label='Chats'>
        <ChatTeardropDots size={20} />
        <span>Chats</span>
      </NavLink>
      <NavLink to='/friend-requests' className={({ isActive }) => `mobileTabItem ${isActive ? 'active' : ''}`} aria-label='Friend requests'>
        <Users size={20} />
        <span>Requests</span>
      </NavLink>
      <NavLink to='/notifications' className={({ isActive }) => `mobileTabItem ${isActive ? 'active' : ''}`} aria-label='Notifications'>
        <Bell size={20} />
        <span>Alerts</span>
      </NavLink>
      <NavLink to='/settings' className={({ isActive }) => `mobileTabItem ${isActive ? 'active' : ''}`} aria-label='Settings'>
        <Gear size={20} />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
