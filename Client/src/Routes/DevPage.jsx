import React from 'react';
import addNotification from 'react-push-notification';

const DevPage = () => {
    const triggerNotification = ({ title, subtitle, message, onClick }) => {
        // Use react-push-notification for styled notifications
        addNotification({
            title: title,
            subtitle: subtitle,
            message: message,
            onClick: onClick,
            theme: 'red',
            duration: 3000,
            backgroundTop: 'green',
            backgroundBottom: 'darkgreen',
            colorTop: 'green',
            colorBottom: 'darkgreen',
            closeButton: 'Go away',
            native: true,
            vibrate: 10,
            silent: false
        });

        // Use browser's Notification API for native notifications
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: '/path/to/icon.png' // Optional icon path
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, {
                        body: message,
                        icon: '/path/to/icon.png' // Optional icon path
                    });
                }
            });
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={(e) => triggerNotification({
                title: 'New Notification',
                subtitle: 'Optional subtitle',
                message: 'This is a notification message.',
                onClick: () => {
                    console.log('Notification clicked!');
                }
            })}>Show Notification</button>

            <h1>hello</h1>
        </div>
    );
};

export default DevPage;
