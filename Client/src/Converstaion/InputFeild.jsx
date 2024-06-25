import React, { useEffect, useState } from 'react';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import { PaperPlaneTilt, Paperclip } from '@phosphor-icons/react';
import EmojiPicker from 'emoji-picker-react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { setNewMessage } from '../features/newMessage/newMessageSlice';

// import io from 'socket.io-client';

export default function InputFeild({ selectedUser, roomId, user }) {
    // const socket = io(process.env.REACT_APP_BACKEND_URL);
    const dispatch = useDispatch();

    const [message, setMessage] = useState('');

    const [showEmoji, setShowEmoji] = useState(false);

    const handelEmojiclickFunction = () => {
        setShowEmoji(showEmoji => !showEmoji);
    }

    const handleEmojiClick = (emojiData) => {
        const emojiValue = emojiData.emoji;
        setMessage((prevMessage) => prevMessage + emojiValue);
    };

    const [imageUrl, setImageUrl] = useState(null);
    const [messageLink, setMessageLink] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };



    function initializeChatData(conversationId) {
        const initialData = {
            conversationId: conversationId,
            conversation: []
        };
        localStorage.setItem(`chatData_${conversationId}`, JSON.stringify(initialData));
    }

    // Function to get chat data for a specific conversation from localStorage
    function getChatData(conversationId) {
        const chatData = localStorage.getItem(`chatData_${conversationId}`);
        return chatData ? JSON.parse(chatData) : null;
    }

    const dispatchNewMessage = (message) => {
        dispatch(setNewMessage({
            ...message,
            date: message.date.toISOString() // Convert Date object to ISO string
        }));
    };


    // Function to add a new message to a specific conversation in localStorage
    function addMessageToChat(conversationId, from, message) {
        const chatData = getChatData(conversationId);
        if (chatData) {
            const newMessage = {
                from: from,
                message: message,
                date: new Date()
            };
            dispatchNewMessage(newMessage);
            chatData.conversation.push(newMessage);
            localStorage.setItem(`chatData_${conversationId}`, JSON.stringify(chatData));
        }
    }




    const SendMessageToUser = async () => {
        const messageToSend = imageUrl ? `${message}#$IMG$#${imageUrl}` : message;
    
        initializeChatData(roomId);
        addMessageToChat(roomId, user?.primaryEmailAddress.emailAddress, messageToSend);
    
        setMessage('');
        setImageUrl(null);
    
        try {
            const chatData = getChatData(roomId);
    
            if (!chatData || !chatData.conversation || chatData.conversation.length === 0) {
                console.log('No messages to send.');
                return;
            }
    
            // Create an array to collect promises for each message sending
            const sendPromises = [];
    
            // Iterate through each message in conversation
            for (let i = 0; i < chatData.conversation.length; i++) {
                const storedMessage = chatData.conversation[i];
    
                // Send message to backend
                const sendPromise = fetch(`${process.env.REACT_APP_BACKEND_URL}/conversation/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chatId: roomId,
                        currentUser: storedMessage.from,
                        message: storedMessage.message,
                    }),
                }).then(async (response) => {
                    if (response.ok) {
                        console.log(`Message "${storedMessage.message}" sent successfully.`);
                        // Remove sent message from local storage
                        chatData.conversation.splice(i, 1);
                        localStorage.setItem(`chatData_${roomId}`, JSON.stringify(chatData));
                    } else {
                        console.error(`Failed to send message "${storedMessage.message}".`);
                    }
                }).catch(error => {
                    console.error(`Error sending message "${storedMessage.message}":`, error);
                });
    
                sendPromises.push(sendPromise);
            }
    
            // Wait for all messages to be sent before clearing local storage
            await Promise.all(sendPromises);
    
            // After all messages are sent and local storage is updated, check if conversation is empty and clear local storage
            if (chatData.conversation.length === 0) {
                localStorage.removeItem(`chatData_${roomId}`);
                console.log('Conversation cleared from local storage.');
            }
    
        } catch (error) {
            console.error('Error sending messages:', error);
        }
    };
    
    


    useEffect(() => {
        try {
            if (selectedUser && roomId && user) {
            } else {
                console.log('Unavailable Props or currentUser already set');
            }
        } catch (error) {
            console.error(error);
        }
    }, [user, roomId, selectedUser]);

    return (
        <>
            <div className={imageUrl ? 'convoInputs withImage' : 'convoInputs'}>
                {imageUrl ?
                    <div className="tempImageDisplayer">
                        <IconButton onClick={(e) => setImageUrl(null)}>
                            <CloseIcon />
                        </IconButton>
                        <img src={imageUrl} alt={'selectedImage'} />
                    </div> : null
                }
                {showEmoji && (
                    <EmojiPicker
                        style={{
                            position: 'absolute',
                            height: '330px',
                            bottom: 70,
                            left: 5,
                            resize: 'horizontal',
                            overflow: 'auto',
                            borderRadius: '20px',
                            borderBottomLeftRadius: '0',
                            backgroundColor: 'var(--primary-blue4)',
                        }}
                        onEmojiClick={handleEmojiClick}
                    />
                )}

                <IconButton onClick={handelEmojiclickFunction}>
                    <TagFacesIcon />
                </IconButton>

                <input style={{ display: 'none' }} id='fileInput' type="file" accept="image/*" onChange={handleFileChange} />

                <IconButton>
                    <label for={'fileInput'} >
                        <Paperclip />
                    </label>
                </IconButton>



                <input
                    type="text"
                    placeholder={`Type a message for ${selectedUser.username}`}
                    name='message'
                    value={message}
                    onChange={(e) => { setMessage(e.target.value) }}
                    onKeyUp={(event) => {
                        if (event.keyCode === 13) {
                            SendMessageToUser();
                        }
                    }}
                />

                <IconButton onClick={SendMessageToUser}>
                    <PaperPlaneTilt style={{ color: 'var(--primary-text-light)' }} size={28} />
                </IconButton>
            </div >
        </>

    )
}
