import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setNewMessage, clearNewMessage } from '../features/newMessage/newMessageSlice';

export default function ConvoDiv({ selectedUser, roomId, user }) {
    const dispatch = useDispatch();
    const newMessage = useSelector(state => state.newMessage); // Assuming newMessage state from Redux

    const [conversation, setConversation] = useState([]);

    useEffect(() => {
        fetchConversation(roomId);
    }, [roomId]); // Fetch conversation on roomId change

    useEffect(() => {
        if (newMessage) {
            // Add new message to conversation and update state
            setConversation(prevConversation => [...prevConversation, newMessage]);
            // Clear new message from Redux
            dispatch(clearNewMessage());
        }
    }, [newMessage, dispatch]);

    const formatStringForRendering = (inputString) => {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = inputString?.match(urlRegex);

        if (match) {
            const url = match[0];
            const message = inputString.replace(url, `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
            return <span dangerouslySetInnerHTML={{ __html: message }} />;
        } else {
            return <span>{inputString}</span>;
        }
    };

    const extractTimeFromDate = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const amOrPm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const newDate = extractDateFromDate(dateString);
        return `| ${newDate} | ${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amOrPm}`;
    };

    const extractDateFromDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-based, so we add 1
        const year = date.getFullYear();
        return `${day < 10 ? '0' + day : day}-${month < 10 ? '0' + month : month}-${year}`;
    };

    const fetchConversation = async (roomId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversationId: roomId }),
            });
            if (!response.ok) {
                console.log('Error:', response.status, response.statusText);
                return;
            } else {
                const conversationData = await response.json();
                if (conversationData && conversationData.conversation.length > 0) {
                    setConversation(conversationData.conversation);
                } else {
                    setConversation([]); // Set empty array if no conversation data
                    const conversationDiv = document.getElementById('conversation');
                    conversationDiv.innerHTML = `<div id="deaultConvo">No conversation with ${selectedUser.username}</div>`;
                }
            }
        } catch (error) {
            console.error('Error fetching session:', error);
        }
    };

    const parseMessage = (inputString) => {
        const delimiter = '#$IMG$#';
        const [message, url] = inputString?.split(delimiter); // Assuming inputString has the correct format

        return { message, url }; // Return object with message and url properties
    };

    return (
        <div id="conversation" name="conversation" className="conversation">
            {conversation && conversation.map((message, index) => {
                const { message: messageText, url } = parseMessage(message?.message);
                const linkMessage = formatStringForRendering(messageText);
                const from = message.from;
                const email = user?.primaryEmailAddress.emailAddress;

                return (
                    <div key={index} className={from === email ? 'messageFromCurrentUser' : 'messageFromSecondUser'}>
                        <div className="avatarContainer">
                            <img src={from === email ? user.imageUrl : selectedUser.image_url} alt={from === email ? user.username + ' image' : selectedUser.username + ' image'} />
                        </div>
                        <div className="textMessageCont">
                            {/* <h6>{from === email ? user.username : selectedUser.username}</h6> */}
                            <h4>{linkMessage}</h4>
                            {url &&
                                <>
                                    <img loading="lazy" src={url} alt={messageText} />
                                    <h4>{messageText}</h4>
                                </>
                            }
                            <span>{extractTimeFromDate(message.date)}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
