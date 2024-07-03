import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Bell } from '@phosphor-icons/react';


export default function AllNotifications({ heading }) {

    const { user } = useUser();

    const fetchNotifications = async (email) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/getNotifications/${email}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    };

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const loadNotifications = async () => {
            const notifications = await fetchNotifications(user?.primaryEmailAddress?.emailAddress);
            setNotifications(notifications);
        };

        loadNotifications();
    }, [user]);


    return (
        <div className='allUsers notification'>
            <h3 className='mainHeading'>
                <Bell />
                <span>{heading}</span>
            </h3>
            <ul>
                {notifications.map((notification, index) => (
                    <li key={index} className='notiContainer'>
                        <p>{notification.message} on {new Date(notification.date).toLocaleString()}</p>
                        <p className='notiContainerStatus' style={notification.isRead ? 
                            {
                                backgroundColor: "#64fe66",
                                color: '#000'
                            } : {
                                backgroundColor: "#fd4b4b",
                                color: '#fff'
                            }
                        }>{notification.isRead ? 'Accepted' : 'Not Accepted'}</p>
                    </li>
                ))}
            </ul>
        </div>
    )

}
