import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../services/api';

const ChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await getMessages(userId);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await sendMessage({
        receiver_id: parseInt(userId),
        message: newMessage.trim(),
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div />
      </div>

      {/* Chat Header */}
      <div style={styles.chatHeader}>
        <div style={styles.avatar}>👤</div>
        <div>
          <h3 style={styles.chatTitle}>Chat</h3>
          <p style={styles.chatSubtitle}>User #{userId}</p>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {loading && <div style={styles.loading}>Loading messages...</div>}

        {!loading && messages.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No messages yet. Say hello! 👋</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              {!isMe && <div style={styles.avatarSmall}>👤</div>}
              <div
                style={{
                  ...styles.messageBubble,
                  backgroundColor: isMe ? '#4CAF50' : '#252525',
                  borderRadius: isMe
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                }}
              >
                <p style={styles.messageText}>{msg.message}</p>
                <p style={styles.messageTime}>
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {isMe && <div style={styles.avatarSmall}>👤</div>}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          style={styles.sendBtn}
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
        >
          {sending ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#0f0f0f',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    backgroundColor: '#1a1a1a',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  backBtn: {
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  logo: { fontSize: '24px', color: '#4CAF50', margin: 0 },
  chatHeader: {
    backgroundColor: '#1a1a1a',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #333',
  },
  avatar: { fontSize: '40px' },
  chatTitle: { color: '#fff', fontSize: '18px', margin: 0 },
  chatSubtitle: { color: '#888', fontSize: '13px', margin: 0 },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  empty: { textAlign: 'center', padding: '40px' },
  emptyText: { color: '#888', fontSize: '16px' },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  avatarSmall: { fontSize: '24px' },
  messageBubble: {
    maxWidth: '60%',
    padding: '12px 16px',
  },
  messageText: { color: '#fff', fontSize: '14px', margin: 0 },
  messageTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '11px',
    margin: '4px 0 0 0',
    textAlign: 'right',
  },
  inputBar: {
    backgroundColor: '#1a1a1a',
    padding: '16px 32px',
    display: 'flex',
    gap: '12px',
    borderTop: '1px solid #333',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid #333',
    backgroundColor: '#252525',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '18px',
  },
};

export default ChatPage;