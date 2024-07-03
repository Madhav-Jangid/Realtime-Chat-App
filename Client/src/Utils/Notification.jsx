import React from 'react';
import addNotification from 'react-push-notification';

export default function Notification({ title, subtitle, message, onClick }) {
    const options = {
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
        vibrate: 3,
        silent: false
    };

    // Function to trigger the notification
    const triggerNotification = () => {
        addNotification(options);
    };

    return triggerNotification; // Notification component doesn't render anything directly
}
