/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNewMessage } from '../features/newMessage/newMessageSlice';
import { CircularProgress } from '@mui/material';
import { io } from 'socket.io-client';
import parse from 'html-react-parser';

export default function ConvoDiv({ state, selectedUser, roomId, user }) {
    const socket = io(process.env.REACT_APP_BACKEND_URL);
    const dispatch = useDispatch();
    const newMessage = useSelector((state) => state.newMessage); // Assuming newMessage state from Redux
    const [conversation, setConversation] = useState(null);
    const divRef = useRef(null);
    const [previousDate, setPreviousDate] = useState(null);

    const scrollToBottom = () => {
        if (divRef.current) {
            divRef.current.scrollTop = divRef.current.scrollHeight - divRef.current.clientHeight;
        }
    };

    const formatStringForRendering = (inputString) => {
        const urlRegex = /(https?:\/\/[^\s]+)/;
        const match = inputString?.match(urlRegex);

        if (match) {
            const url = match[0];
            const message = inputString.replace(url, `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
            return message;
        } else {
            return inputString;
        }
    };

    const extractTimeFromDate = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const amOrPm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const newDate = extractDateFromDate(dateString);
        return { date: newDate, time: `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amOrPm}` };
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

    useEffect(() => {
        fetchConversation(roomId);
    }, [roomId]);

    useEffect(() => {
        if (selectedUser) {
            setConversation(null);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (newMessage) {
            setConversation((prevConversation) => [...prevConversation, newMessage]);
            dispatch(clearNewMessage());
        }
    }, [newMessage, dispatch]);

    useEffect(() => {
        socket.on('get_message', (data) => {
            if (user.username === data.to.username) {
                let newMessage = {
                    date: new Date(),
                    from: data.from.email,
                    message: data.message,
                };
                setConversation((prevConversation) => [...prevConversation, newMessage]);
                dispatch(clearNewMessage());
            }
        });

        return () => {
            socket.off('get_message');
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [newMessage, conversation]);

    const renderMessageContent = (messageText) => {
        const messageWithLineBreaks = messageText.replace(/\n/g, '<br />');
        return `${messageWithLineBreaks}`;
    };

    return (
        <div ref={divRef} id="conversation" name="conversation" className="conversation">
            {conversation ? (
                conversation.map((message, index) => {
                    const { message: messageText, url } = parseMessage(message?.message);
                    const formattedMessage = formatStringForRendering(messageText);
                    const renderedMessage = renderMessageContent(formattedMessage);
                    const from = message.from;
                    const email = user?.primaryEmailAddress.emailAddress;
                    let date = extractTimeFromDate(message.date)?.time;

                    return (
                        <div key={index} className={from === email ? 'messageFromCurrentUser' : 'messageFromSecondUser'}>
                            <div className="avatarContainer">
                                <img src={from === email ? user.imageUrl : selectedUser.image_url} alt={from === email ? user.username + ' image' : selectedUser.username + ' image'} />
                            </div>
                            <div className="textMessageCont">
                                <h4>{parse(renderedMessage)}</h4>
                                {url && (
                                    <>
                                        <img loading="lazy" src={url} alt={parse(messageText)} />
                                        <h4>{parse(renderedMessage)}</h4>
                                    </>
                                )}
                                <span>{date}</span>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 10,
                    }}
                    id="conversation"
                    name="conversation"
                    className="conversation"
                >
                    <CircularProgress />
                    <p>Loading...</p>
                </div>
            )}
        </div>
    );
}
