import React, { useEffect, useRef, useState } from 'react';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import { PaperPlaneTilt } from '@phosphor-icons/react';
import EmojiPicker from 'emoji-picker-react';
import { IconButton, TextField } from '@mui/material';
import { socket } from '../Utils/socket';

export default function InputField({ roomId, currentUser, settings }) {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const typingRef = useRef(false);
  const stopTimerRef = useRef(null);

  useEffect(() => {
    if (roomId) socket.emit('conversation:join', { conversationId: roomId });
    typingRef.current = false;
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  }, [roomId]);

  const emitTypingStart = () => {
    if (settings && settings.typingIndicators === false) return;
    if (!roomId || typingRef.current) return;
    typingRef.current = true;
    socket.emit('typing:start', { conversationId: roomId });
  };

  const emitTypingStop = () => {
    if (settings && settings.typingIndicators === false) return;
    if (!roomId || !typingRef.current) return;
    typingRef.current = false;
    socket.emit('typing:stop', { conversationId: roomId });
  };

  const scheduleTypingStop = () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      emitTypingStop();
    }, 900);
  };

  const send = () => {
    const text = message.trim();
    if (!roomId || !text) return;

    const optimisticMessage = {
      _id: `tmp_${Date.now()}`,
      conversationId: roomId,
      sender: currentUser?._id,
      text,
      createdAt: new Date().toISOString(),
      optimistic: true
    };

    window.dispatchEvent(new CustomEvent('chat:optimistic-message', { detail: optimisticMessage }));
    socket.emit('message:send', { conversationId: roomId, text });
    setMessage('');
    emitTypingStop();
  };

  return (
    <div className='convoInputs'>
      <div className="convoInputIntractions">
        {showEmoji && (
          <EmojiPicker
            style={{ position: 'absolute', height: '330px', bottom: 70, left: 5, overflow: 'auto', borderRadius: '20px', borderBottomLeftRadius: '0', backgroundColor: 'var(--primary-blue4)' }}
            onEmojiClick={(emojiData) => {
              setMessage((prev) => prev + emojiData.emoji);
              emitTypingStart();
              scheduleTypingStop();
            }}
          />
        )}

        <IconButton onClick={() => setShowEmoji((v) => !v)}><TagFacesIcon /></IconButton>

        <TextField
          className="convoInputForMessage"
          multiline
          maxRows={4}
          placeholder="Type a message"
          name="message"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (e.target.value.trim()) {
              emitTypingStart();
              scheduleTypingStop();
            } else {
              emitTypingStop();
            }
          }}
          onBlur={emitTypingStop}
          onKeyUp={(event) => {
            if (settings?.enterToSend !== false && event.key === 'Enter' && !event.shiftKey) send();
          }}
        />
      </div>

      <IconButton onClick={send}><PaperPlaneTilt style={{ color: 'var(--primary-text-light)' }} size={28} /></IconButton>
    </div>
  );
}
