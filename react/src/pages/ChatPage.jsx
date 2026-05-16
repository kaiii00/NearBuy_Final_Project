import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessages, sendMessage, getStores, uploadChatMedia, getPublicProfile } from '../services/api';

const ChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [storeName, setStoreName] = useState('');
  const [otherUserPhoto, setOtherUserPhoto] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storesRes = await getStores();
        const store = storesRes.data.find(s => String(s.ownerId) === String(userId));
        if (store) setStoreName(store.name);

        const profileRes = await getPublicProfile(userId);
        if (profileRes.data.profilePhoto)
          setOtherUserPhoto(`http://localhost:8080${profileRes.data.profilePhoto}`);
        if (profileRes.data.displayName)
          setOtherUserName(profileRes.data.displayName);
      } catch (err) {}
    };
    fetchUserInfo();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === '0') return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchMessages = async () => {
    if (!userId || userId === '0') return;
    try {
      const res = await getMessages(userId);
      setMessages(res.data);
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        const key = `chat_seen_${user.id}_${userId}`;
        localStorage.setItem(key, latest.createdAt);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : 'image';
    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !mediaFile) return;
    setSending(true);
    try {
      let mediaUrl = null;
      let finalMediaType = null;

      if (mediaFile) {
        const uploadRes = await uploadChatMedia(mediaFile);
        mediaUrl = uploadRes.data.url;
        finalMediaType = uploadRes.data.mediaType;
      }

      await sendMessage({
        receiverId: parseInt(userId),
        message: newMessage.trim(),
        mediaUrl,
        mediaType: finalMediaType,
      });

      setNewMessage('');
      clearMedia();
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
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={styles.logo}>🛒 NearBuy</h1>
        <div />
      </div>

      {/* Chat Header */}
      <div style={styles.chatHeader}>
        {otherUserPhoto ? (
          <img src={otherUserPhoto} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4CAF50' }} />
        ) : (
          <div style={styles.avatar}>👤</div>
        )}
        <div>
          <h3 style={styles.chatTitle}>{otherUserName || storeName || `User #${userId}`}</h3>
          {storeName && <p style={styles.chatSubtitle}>🏪 {storeName}</p>}
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
          const isMe = Number(msg.senderId) === Number(user.id);
          return (
            <div key={msg.id} style={{ ...styles.messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && (
                otherUserPhoto
                  ? <img src={otherUserPhoto} alt="av" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={styles.avatarSmall}>👤</div>
              )}
              <div style={{
                ...styles.messageBubble,
                backgroundColor: isMe ? '#4CAF50' : '#252525',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              }}>
                {/* Media */}
                {msg.mediaUrl && msg.mediaType === 'image' && (
                  <img
                    src={`http://localhost:8080${msg.mediaUrl}`}
                    alt="media"
                    style={styles.mediaImage}
                    onClick={() => window.open(`http://localhost:8080${msg.mediaUrl}`, '_blank')}
                  />
                )}
                {msg.mediaUrl && msg.mediaType === 'video' && (
                  <video controls style={styles.mediaVideo}>
                    <source src={`http://localhost:8080${msg.mediaUrl}`} />
                  </video>
                )}
                {/* Text */}
                {msg.message && <p style={styles.messageText}>{msg.message}</p>}
                <p style={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {isMe && <div style={styles.avatarSmall}>👤</div>}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div style={styles.previewBar}>
          {mediaType === 'image'
            ? <img src={mediaPreview} alt="preview" style={styles.previewImage} />
            : <video src={mediaPreview} style={styles.previewImage} controls />
          }
          <button style={styles.clearPreviewBtn} onClick={clearMedia}>✕</button>
        </div>
      )}

      {/* Input Bar */}
      <div style={styles.inputBar}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <button style={styles.attachBtn} onClick={() => fileInputRef.current.click()} title="Attach image or video">
          📎
        </button>
        <input
          style={styles.input}
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          style={{ ...styles.sendBtn, opacity: sending || (!newMessage.trim() && !mediaFile) ? 0.5 : 1 }}
          onClick={handleSend}
          disabled={sending || (!newMessage.trim() && !mediaFile)}
        >
          {sending ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', backgroundColor: '#0f0f0f', color: '#fff', display: 'flex', flexDirection: 'column' },
  navbar: { backgroundColor: '#1a1a1a', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  backBtn: { backgroundColor: 'transparent', color: '#4CAF50', border: '1px solid #4CAF50', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  logo: { fontSize: '24px', color: '#4CAF50', margin: 0 },
  chatHeader: { backgroundColor: '#1a1a1a', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #333' },
  avatar: { fontSize: '40px' },
  chatTitle: { color: '#fff', fontSize: '18px', margin: 0 },
  chatSubtitle: { color: '#888', fontSize: '13px', margin: 0 },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' },
  loading: { textAlign: 'center', color: '#888', padding: '40px' },
  empty: { textAlign: 'center', padding: '40px' },
  emptyText: { color: '#888', fontSize: '16px' },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  avatarSmall: { fontSize: '24px' },
  messageBubble: { maxWidth: '60%', padding: '12px 16px' },
  messageText: { color: '#fff', fontSize: '14px', margin: 0 },
  messageTime: { color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: '4px 0 0 0', textAlign: 'right' },
  mediaImage: { maxWidth: '100%', maxHeight: '260px', borderRadius: '10px', display: 'block', marginBottom: '6px', cursor: 'pointer' },
  mediaVideo: { maxWidth: '100%', maxHeight: '260px', borderRadius: '10px', display: 'block', marginBottom: '6px' },
  previewBar: { backgroundColor: '#1a1a1a', padding: '10px 32px', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' },
  previewImage: { height: '80px', borderRadius: '8px', objectFit: 'cover' },
  clearPreviewBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '13px' },
  inputBar: { backgroundColor: '#1a1a1a', padding: '16px 32px', display: 'flex', gap: '12px', borderTop: '1px solid #333', alignItems: 'center' },
  attachBtn: { backgroundColor: '#252525', border: '1px solid #333', borderRadius: '50%', width: '48px', height: '48px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #333', backgroundColor: '#252525', color: '#fff', fontSize: '14px', outline: 'none' },
  sendBtn: { backgroundColor: '#4CAF50', color: '#fff', border: 'none', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', transition: 'opacity 0.2s' },
};

export default ChatPage;