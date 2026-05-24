import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { api } from '../Utils/api';
import { socket } from '../Utils/socket';

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PAGE_SIZE = 20;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function toDateKey(dateInput) {
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(dateInput) {
  const d = new Date(dateInput);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMessageDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfMessageDay.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays >= 2 && diffDays <= 6) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ConvoDiv({ selectedUser, roomId, currentUser, isTyping, searchQuery, onSearchMetaChange, settings }) {
  const [conversation, setConversation] = useState(null);
  const divRef = useRef(null);
  const loadSeqRef = useRef(0);
  const [editingId, setEditingId] = useState('');
  const [editingText, setEditingText] = useState('');
  const [openActionMessageId, setOpenActionMessageId] = useState('');

  const [pagination, setPagination] = useState({ nextCursor: null, hasMore: false, loadingMore: false });
  const [searchState, setSearchState] = useState({ results: [], activeIndex: -1, totalCount: 0 });
  const [unreadStartId, setUnreadStartId] = useState('');

  const seenSentRef = useRef(new Set());

  const recomputeUnreadMarker = useCallback((messages) => {
    const firstUnseen = (messages || []).find((msg) => {
      const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
      const seenBy = (msg.seenBy || []).map(String);
      return senderId !== currentUser?._id && !seenBy.includes(String(currentUser?._id || ''));
    });

    setUnreadStartId(firstUnseen?._id ? String(firstUnseen._id) : '');
  }, [currentUser?._id]);

  const scrollToMessageElement = (messageId) => {
    if (!messageId) return;
    const el = document.getElementById(`msg-${messageId}`);
    if (el) el.scrollIntoView({ block: 'center' });
  };

  useEffect(() => {
    if (!openActionMessageId) return;
    const onDocClick = (event) => {
      const target = event.target;
      if (target && target.closest('.messageActionWrap')) return;
      setOpenActionMessageId('');
    };

    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [openActionMessageId]);

  useEffect(() => {
    seenSentRef.current.clear();
    setUnreadStartId('');
    setOpenActionMessageId('');
    const seq = ++loadSeqRef.current;

    async function load() {
      if (!roomId) {
        setConversation([]);
        setPagination({ nextCursor: null, hasMore: false, loadingMore: false });
        return;
      }

      setConversation(null);
      const data = await api.getMessages(roomId, undefined, PAGE_SIZE);
      if (seq !== loadSeqRef.current) return;

      const items = [...(data?.items || [])].reverse();
      setConversation(items);
      recomputeUnreadMarker(items);
      setPagination({ nextCursor: data?.pageInfo?.nextCursor || null, hasMore: Boolean(data?.pageInfo?.hasMore), loadingMore: false });
      socket.emit('conversation:join', { conversationId: roomId });

      const firstUnseenIndex = items.findIndex((msg) => {
        const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
        const seenBy = (msg.seenBy || []).map(String);
        return senderId !== currentUser?._id && !seenBy.includes(String(currentUser?._id || ''));
      });

      if (firstUnseenIndex >= 0) {
        const firstUnseen = items[firstUnseenIndex];
        const lastSeen = items[firstUnseenIndex - 1];
        requestAnimationFrame(() => {
          if (lastSeen?._id) scrollToMessageElement(String(lastSeen._id));
          else if (firstUnseen?._id) scrollToMessageElement(String(firstUnseen._id));
        });
      } else {
        requestAnimationFrame(() => {
          const container = divRef.current;
          if (container) container.scrollTop = container.scrollHeight;
        });
      }
    }

    load().catch((err) => {
      if (seq === loadSeqRef.current) {
        console.error(err);
        setConversation([]);
        setPagination({ nextCursor: null, hasMore: false, loadingMore: false });
      }
    });
  }, [roomId, currentUser?._id, recomputeUnreadMarker]);

  useEffect(() => {
    if (settings && settings.readReceipts === false) return;
    if (!roomId || !conversation?.length) return;

    const unseenIncoming = conversation.filter((msg) => {
      const msgId = String(msg._id || '');
      if (!msgId || seenSentRef.current.has(msgId)) return false;
      const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
      const seenBy = (msg.seenBy || []).map(String);
      return senderId !== currentUser?._id && !seenBy.includes(String(currentUser?._id || ''));
    });

    unseenIncoming.forEach((msg) => {
      const msgId = String(msg._id);
      seenSentRef.current.add(msgId);
      socket.emit('message:seen', { conversationId: roomId, messageId: msgId });
    });
  }, [conversation, roomId, currentUser?._id, settings?.readReceipts]);

  const loadOlderMessages = useCallback(async () => {
    if (!roomId || !pagination.hasMore || !pagination.nextCursor || pagination.loadingMore) return;
    const container = divRef.current;
    if (!container) return;

    const prevHeight = container.scrollHeight;
    const prevTop = container.scrollTop;
    setPagination((p) => ({ ...p, loadingMore: true }));

    try {
      const page = await api.getMessages(roomId, pagination.nextCursor, 50);
      const olderDesc = page?.items || [];
      if (!olderDesc.length) {
        setPagination((p) => ({ ...p, hasMore: false, loadingMore: false }));
        return;
      }

      const olderAsc = [...olderDesc].reverse();
      setConversation((prev) => {
        const merged = [...olderAsc, ...(prev || [])];
        recomputeUnreadMarker(merged);
        return merged;
      });
      setPagination({ nextCursor: page?.pageInfo?.nextCursor || null, hasMore: Boolean(page?.pageInfo?.hasMore), loadingMore: false });

      requestAnimationFrame(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = prevTop + (newHeight - prevHeight);
      });
    } catch (error) {
      console.error(error);
      setPagination((p) => ({ ...p, loadingMore: false }));
    }
  }, [pagination.hasMore, pagination.loadingMore, pagination.nextCursor, recomputeUnreadMarker, roomId]);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop <= 80) loadOlderMessages();
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [roomId, pagination.hasMore, pagination.nextCursor, pagination.loadingMore, loadOlderMessages]);

  useEffect(() => {
    const onOptimistic = (event) => {
      const msg = event.detail;
      if (!msg || msg.conversationId !== roomId) return;
      setConversation((prev) => [...(prev || []), msg]);
    };
    window.addEventListener('chat:optimistic-message', onOptimistic);
    return () => window.removeEventListener('chat:optimistic-message', onOptimistic);
  }, [roomId]);

  useEffect(() => {
    const onNewMessage = (msg) => {
      if (msg.conversationId !== roomId) return;
      setConversation((prev) => {
        const base = prev || [];
        const dedupIndex = base.findIndex((m) => m.optimistic && (typeof m.sender === 'string' ? m.sender : m.sender?._id) === msg.sender && m.text === msg.text && Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 10000);
        let next;
        if (dedupIndex >= 0) {
          next = [...base];
          next[dedupIndex] = msg;
        } else if (base.some((m) => m._id && msg._id && m._id === msg._id)) {
          next = base;
        } else {
          next = [...base, msg];
        }
        recomputeUnreadMarker(next);
        return next;
      });
    };

    const onUpdated = ({ conversationId, messageId, text, editedAt, updatedAt }) => {
      if (conversationId !== roomId) return;
      setConversation((prev) => {
        const next = (prev || []).map((m) => String(m._id) === String(messageId) ? { ...m, text, editedAt, updatedAt } : m);
        recomputeUnreadMarker(next);
        return next;
      });
      if (editingId === messageId) {
        setEditingId('');
        setEditingText('');
      }
    };

    const onDeleted = ({ conversationId, messageId }) => {
      if (conversationId !== roomId) return;
      setConversation((prev) => {
        const next = (prev || []).filter((m) => String(m._id) !== String(messageId));
        recomputeUnreadMarker(next);
        return next;
      });
      if (editingId === messageId) {
        setEditingId('');
        setEditingText('');
      }
    };

    const onSeenUpdate = ({ conversationId, messageId, seenByUserId }) => {
      if (conversationId !== roomId) return;
      setConversation((prev) => {
        const next = (prev || []).map((m) => {
          if (String(m._id) !== String(messageId)) return m;
          const existing = (m.seenBy || []).map(String);
          if (existing.includes(String(seenByUserId))) return m;
          return { ...m, seenBy: [...existing, String(seenByUserId)] };
        });
        recomputeUnreadMarker(next);
        return next;
      });
    };

    socket.on('message:new', onNewMessage);
    socket.on('message:updated', onUpdated);
    socket.on('message:deleted', onDeleted);
    socket.on('message:seen:update', onSeenUpdate);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('message:updated', onUpdated);
      socket.off('message:deleted', onDeleted);
      socket.off('message:seen:update', onSeenUpdate);
    };
  }, [roomId, editingId, recomputeUnreadMarker, settings]);

  const startEdit = (msg) => {
    setEditingId(String(msg._id));
    setEditingText(msg.text || '');
  };

  const saveEdit = () => {
    const text = editingText.trim();
    if (!editingId || !text || !roomId) return;
    socket.emit('message:edit', { conversationId: roomId, messageId: editingId, text });
  };

  const deleteMessage = (messageId) => {
    if (!roomId || !messageId) return;
    if (!window.confirm('Delete this message?')) return;
    socket.emit('message:delete', { conversationId: roomId, messageId });
  };

  useEffect(() => {
    let cancelled = false;
    async function runSearch() {
      const q = searchQuery.trim();
      if (!roomId || !q) {
        const empty = { results: [], activeIndex: -1, totalCount: 0 };
        setSearchState(empty);
        onSearchMetaChange(empty);
        return;
      }
      try {
        const first = await api.searchMessages(roomId, q, undefined, 30);
        if (cancelled) return;
        const results = first?.items || [];
        const next = { results, activeIndex: results.length ? 0 : -1, totalCount: first?.totalCount || 0 };
        setSearchState(next);
        onSearchMetaChange(next);
      } catch (error) {
        console.error(error);
      }
    }
    runSearch();
    return () => {
      cancelled = true;
    };
  }, [roomId, searchQuery, onSearchMetaChange]);

  useEffect(() => {
    if (pagination.loadingMore) return;
    const container = divRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 140;
    if (nearBottom) container.scrollTop = container.scrollHeight;
  }, [conversation, isTyping, pagination.loadingMore]);

  const extractTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${amOrPm}`;
  };

  const renderHighlightedText = (text) => {
    const q = searchQuery.trim();
    if (!q) return text;
    const regex = new RegExp(`(${escapeRegex(q)})`, 'ig');
    const parts = String(text).split(regex);
    return parts.map((part, index) => (part.toLowerCase() === q.toLowerCase() ? <mark key={`${part}-${index}`}>{part}</mark> : part));
  };

  const renderMessageWithLinks = (text) => {
    const source = String(text || '');
    const chunks = source.split(URL_REGEX);

    return chunks.map((chunk, idx) => {
      if (!chunk) return null;
      if (/^https?:\/\//i.test(chunk)) {
        return (
          <a key={`link-${idx}`} href={chunk} target='_blank' rel='noopener noreferrer'>
            {renderHighlightedText(chunk)}
          </a>
        );
      }
      return <React.Fragment key={`txt-${idx}`}>{renderHighlightedText(chunk)}</React.Fragment>;
    });
  };

  const activeResultId = useMemo(() => searchState.results[searchState.activeIndex]?._id || null, [searchState]);

  return (
    <div ref={divRef} id='conversation' className='conversation'>
      {pagination.loadingMore ? <div style={{ textAlign: 'center', padding: '6px 0', opacity: 0.7 }}>Loading older messages...</div> : null}
      {conversation ? conversation.length === 0 ? <div id='deaultConvo'>No conversation with {selectedUser?.username}</div> : conversation.map((message, index) => {
        const senderId = typeof message.sender === 'string' ? message.sender : message.sender?._id;
        const isMine = senderId === currentUser?._id;
        const isActiveSearchMessage = activeResultId && String(message._id) === String(activeResultId);
        const currentKey = toDateKey(message.createdAt || new Date().toISOString());
        const previous = conversation[index - 1];
        const previousKey = previous ? toDateKey(previous.createdAt || new Date().toISOString()) : null;
        const showDivider = index === 0 || currentKey !== previousKey;
        const showUnreadDivider = unreadStartId && String(message._id) === String(unreadStartId);
        const isEditing = editingId && String(message._id) === editingId;

        return (
          <React.Fragment key={message._id || `${message.createdAt}-${senderId}`}>
            {showDivider ? <div className='chatDayDivider'><span>{dayLabel(message.createdAt || new Date().toISOString())}</span></div> : null}
            {showUnreadDivider ? <div className='chatUnreadDivider'><span>Unread messages</span></div> : null}
            <div id={message._id ? `msg-${message._id}` : undefined} className={isMine ? 'messageFromCurrentUser' : 'messageFromSecondUser'}>
              <div className='avatarContainer'><img src={isMine ? (currentUser?.avatar || '') : (selectedUser?.avatar || '')} alt='avatar' /></div>
              <div className='textMessageCont' style={isActiveSearchMessage ? { outline: '2px solid #ffcc00' } : undefined}>
                {!isEditing && isMine ? (
                  <div className='messageActionWrap'>
                    <button
                      className='messageActionTrigger'
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMessageId((prev) => prev === String(message._id) ? '' : String(message._id));
                      }}
                      aria-label='Message actions'
                    >
                      <KeyboardArrowDownIcon fontSize='small' />
                    </button>
                    {openActionMessageId === String(message._id) ? (
                      <div className='messageActionMenu'>
                        <button
                          className='messageActionItem'
                          onClick={() => {
                            startEdit(message);
                            setOpenActionMessageId('');
                          }}
                        >
                          Edit message
                        </button>
                        <button
                          className='messageActionItem danger'
                          onClick={() => {
                            if (message?._id) deleteMessage(String(message._id));
                            setOpenActionMessageId('');
                          }}
                        >
                          Delete message
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {isEditing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input value={editingText} onChange={(e) => setEditingText(e.target.value)} style={{ flex: 1 }} />
                    <button className='messageInlineBtn' onClick={saveEdit}>Save</button>
                    <button className='messageInlineBtn' onClick={() => { setEditingId(''); setEditingText(''); }}>Cancel</button>
                  </div>
                ) : (
                  <h4 style={message.optimistic ? { opacity: 0.7 } : undefined}>{renderMessageWithLinks(message.text)}</h4>
                )}
                <span>{extractTime(message.createdAt || new Date().toISOString())}{message.editedAt ? ' • edited' : ''}</span>
              </div>
            </div>
          </React.Fragment>
        );
      }) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }} className='conversation'><CircularProgress /><p>Loading...</p></div>}

      {settings?.typingIndicators !== false && isTyping ? <div className='messageFromSecondUser typingRow'><div className='avatarContainer'><img src={selectedUser?.avatar || ''} alt='typing avatar' /></div><div className='typingBubble'><span></span><span></span><span></span></div></div> : null}
    </div>
  );
}

