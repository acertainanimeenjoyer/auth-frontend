import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const defaultRoom = 'general';

// tiny emoji picker
const EMOJIS = ['😀','😎','🔥','🚀','✨','❤️','😂','👍','🙌','🤝'];

export default function ChatRoom({ room = defaultRoom }) {
  const socket = useSocket();
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [presence, setPresence] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [text, setText] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef(null);
  const scrollerRef = useRef(null);

  // Load history via REST
  useEffect(() => {
    let cancel = false;
    if (!token) return;
    axios.get(`/api/messages/${room}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!cancel) setMessages(res.data || []); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [room, token]);

  // Socket room join/leave + listeners
  useEffect(() => {
    if (!socket) return;
    socket.emit('joinRoom', room);

    const onNew = (msg) => setMessages(prev => [...prev, msg]);
    const onPresence = (list) => setPresence(list);
    const onTyping = ({ userId, username, isTyping }) =>
      setTypingUsers(prev => ({ ...prev, [userId]: isTyping ? username : undefined }));

    socket.on('message:new', onNew);
    socket.on('presence:update', onPresence);
    socket.on('typing', onTyping);

    return () => {
      socket.emit('leaveRoom', room);
      socket.off('message:new', onNew);
      socket.off('presence:update', onPresence);
      socket.off('typing', onTyping);
    };
  }, [socket, room]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages]);

  const typingDisplay = useMemo(() => {
    const names = Object.values(typingUsers).filter(Boolean);
    if (!names.length) return '';
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.slice(0,2).join(', ')}${names.length > 2 ? ' and others' : ''} are typing...`;
  }, [typingUsers]);

  const sendMessage = () => {
    const content = text.trim();
    if (!content || !socket) return;
    socket.emit('message:send', { room, content });
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      socket?.emit('typing', { room, isTyping: true });
      // Stop typing after short delay
      clearTimeout(handleKeyDown._t);
      handleKeyDown._t = setTimeout(() => socket?.emit('typing', { room, isTyping: false }), 800);
    }
  };

  const addEmoji = (ch) => {
    setText(t => t + ch);
    setPickerOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ maxWidth: 800, margin: '16px auto', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: 12, background: '#f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
        <div><strong>Room:</strong> {room}</div>
        <div style={{ fontSize: 12, color: '#374151' }}>
          Online: {presence.length} {presence.length ? '— ' + presence.map(p => p.username).join(', ') : ''}
        </div>
      </div>

      <div ref={scrollerRef} style={{ height: 420, overflowY: 'auto', padding: 12, background: '#fff' }}>
        {messages.map(m => (
          <div key={m._id || Math.random()} style={{ margin: '8px 0' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              <strong>{m.sender?.username || 'You'}</strong> · {new Date(m.timestamp || Date.now()).toLocaleTimeString()}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{formatMessage(m.content)}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: 8, borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
        {typingDisplay && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{typingDisplay}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setPickerOpen(v => !v)} style={btn()}>
            😊
          </button>
          {pickerOpen && (
            <div style={{ position: 'absolute', marginTop: 40, background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => addEmoji(e)} style={emojiBtn()}>{e}</button>
              ))}
            </div>
          )}
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={2}
            style={{ flex: 1, resize: 'none', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          />
          <button type="button" onClick={sendMessage} style={btn({ bg: '#2563eb' })}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function btn({ bg = '#e5e7eb', color = '#111827' } = {}) {
  return { padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: bg, color, cursor: 'pointer' };
}
function emojiBtn() {
  return { padding: 6, borderRadius: 6, border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' };
}
function formatMessage(text) {
  // super-light formatting: linkify URLs
  const parts = String(text).split(/(\bhttps?:\/\/[^\s]+)/g);
  return parts.map((p, i) => {
    if (/^https?:\/\//.test(p)) {
      return <a key={i} href={p} target="_blank" rel="noreferrer">{p}</a>;
    }
    return <span key={i}>{p}</span>;
  });
}
