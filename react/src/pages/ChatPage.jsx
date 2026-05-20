import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessages, sendMessage, getStores, uploadChatMedia, getPublicProfile } from '../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const PaperclipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const StoreIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Fix broken media URLs — avoids double http://localhost:8080
const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

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
          setOtherUserPhoto(resolveMediaUrl(profileRes.data.profilePhoto));
        if (profileRes.data.displayName)
          setOtherUserName(profileRes.data.displayName);
      } catch {}
    };
    fetchUserInfo();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === '0') return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    if (!userId || userId === '0') return;
    try {
      const res = await getMessages(userId);
      // DEBUG — remove after confirming media fields
      const mediaMsgs = res.data.filter(m => m.mediaUrl);
      if (mediaMsgs.length > 0) console.log('[Chat] media messages:', mediaMsgs.map(m => ({ id: m.id, mediaUrl: m.mediaUrl, mediaType: m.mediaType })));
      setMessages(res.data);
      if (res.data.length > 0) {
        const latest = res.data[res.data.length - 1];
        localStorage.setItem(`chat_seen_${user.id}_${userId}`, latest.createdAt);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const displayName = otherUserName || storeName || `User #${userId}`;
  const initials = displayName?.[0]?.toUpperCase() || 'U';

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div style={s.page}>

      {/* ── Navbar ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div style={s.logoWrap}>
            <div style={s.logoBox}>N</div>
            <span style={s.logoText}>NearBuy</span>
          </div>
        </div>
      </nav>

      {/* ── Chat shell ── */}
      <div style={s.chatShell}>

        {/* ── Chat Header ── */}
        <div style={s.chatHeader}>
          {otherUserPhoto ? (
            <img src={otherUserPhoto} alt="avatar" style={s.headerAvatarImg} />
          ) : (
            <div style={s.headerAvatar}>{initials}</div>
          )}
          <div>
            <h3 style={s.chatName}>{displayName}</h3>
            {storeName && (
              <p style={s.chatSub}>
                <StoreIcon /> {storeName}
              </p>
            )}
          </div>
          <div style={s.onlineDot} title="Active" />
        </div>

        {/* ── Messages ── */}
        <div style={s.messagesWrap}>
          {loading && (
            <div style={s.centerMsg}>
              <div style={s.spinner} />
              <span style={s.centerText}>Loading messages...</span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div style={s.centerMsg}>
              <div style={s.emptyIcon}><UserIcon /></div>
              <p style={s.centerText}>No messages yet. Say hello!</p>
            </div>
          )}

          {!loading && Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div style={s.dateSep}>
                <div style={s.dateLine} />
                <span style={s.dateLabel}>{date}</span>
                <div style={s.dateLine} />
              </div>

              {msgs.map((msg) => {
                const isMe = Number(msg.senderId) === Number(user.id);
                const mediaUrl = resolveMediaUrl(msg.mediaUrl);
                const mediaTypeLower = msg.mediaType?.toLowerCase();

                return (
                  <div key={msg.id} style={{ ...s.msgRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>

                    {/* Other user avatar */}
                    {!isMe && (
                      otherUserPhoto
                        ? <img src={otherUserPhoto} alt="av" style={s.bubbleAvatar} />
                        : <div style={s.bubbleAvatarFallback}>{initials}</div>
                    )}

                    {/* Bubble */}
                    <div style={{
                      ...s.bubble,
                      backgroundColor: isMe ? '#1e4d3a' : '#ffffff',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: isMe ? 'none' : '1px solid #e7e5e4',
                    }}>
                      {/* Media — case-insensitive type check, fallback tries img for any unknown type */}
                      {mediaUrl && (mediaTypeLower === 'image' || (!mediaTypeLower && mediaUrl)) && (
                        <img
                          src={mediaUrl}
                          alt="media"
                          style={s.mediaImg}
                          onClick={() => window.open(mediaUrl, '_blank')}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      {mediaUrl && mediaTypeLower === 'video' && (
                        <video controls style={s.mediaVideo}>
                          <source src={mediaUrl} />
                        </video>
                      )}

                      {/* Text */}
                      {msg.message && (
                        <p style={{ ...s.bubbleText, color: isMe ? '#ffffff' : '#1e293b' }}>
                          {msg.message}
                        </p>
                      )}

                      {/* Time */}
                      <p style={{ ...s.bubbleTime, color: isMe ? 'rgba(255,255,255,0.55)' : '#94a3b8', textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* My avatar */}
                    {isMe && (
                      <div style={s.myAvatar}>
                        {user.username?.[0]?.toUpperCase() || 'M'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Media Preview Bar ── */}
        {mediaPreview && (
          <div style={s.previewBar}>
            {mediaType === 'image'
              ? <img src={mediaPreview} alt="preview" style={s.previewThumb} />
              : <video src={mediaPreview} style={s.previewThumb} controls />
            }
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {mediaFile?.name}
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>
                Ready to send
              </p>
            </div>
            <button style={s.clearBtn} onClick={clearMedia}>
              <XIcon />
            </button>
          </div>
        )}

        {/* ── Input Bar ── */}
        <div style={s.inputBar}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button
            style={s.attachBtn}
            onClick={() => fileInputRef.current.click()}
            title="Attach image or video"
          >
            <PaperclipIcon />
          </button>

          <input
            style={s.textInput}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <button
            style={{
              ...s.sendBtn,
              opacity: sending || (!newMessage.trim() && !mediaFile) ? 0.45 : 1,
            }}
            onClick={handleSend}
            disabled={sending || (!newMessage.trim() && !mediaFile)}
          >
            {sending ? <div style={s.sendSpinner} /> : <SendIcon />}
          </button>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:wght@400;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    height: '100vh',
    backgroundColor: '#f7f5f1',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
  },

  // Navbar
  navbar: {
    backgroundColor: 'rgba(247,245,241,0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #e7e5e4',
    padding: '0 24px',
    height: '58px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    zIndex: 10,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: '#fff', color: '#64748b',
    border: '1px solid #e7e5e4', padding: '7px 13px',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500', fontFamily: "'DM Sans', sans-serif",
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '9px' },
  logoBox: {
    width: '32px', height: '32px', borderRadius: '8px',
    backgroundColor: '#0f172a', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff',
  },
  logoText: {
    fontSize: '17px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px',
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Chat shell — fills remaining height
  chatShell: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '780px',
    width: '100%',
    margin: '0 auto',
    padding: '16px 16px 0',
    minHeight: 0,
  },

  // Chat header
  chatHeader: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderRadius: '14px 14px 0 0',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
    position: 'relative',
  },
  headerAvatarImg: {
    width: '44px', height: '44px',
    borderRadius: '10px', objectFit: 'cover',
    border: '2px solid #eef4f1',
    flexShrink: 0,
  },
  headerAvatar: {
    width: '44px', height: '44px',
    borderRadius: '10px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '700',
    fontFamily: "'Libre Baskerville', Georgia, serif",
    flexShrink: 0,
  },
  chatName: {
    fontSize: '15px', fontWeight: '700', color: '#0f172a',
    margin: 0, fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  chatSub: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#64748b', margin: '3px 0 0',
  },
  onlineDot: {
    width: '8px', height: '8px',
    borderRadius: '50%', backgroundColor: '#10b981',
    marginLeft: 'auto', flexShrink: 0,
    boxShadow: '0 0 0 2px #eef4f1',
  },

  // Messages area
  messagesWrap: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    backgroundColor: '#faf9f7',
    border: '1px solid #e7e5e4',
    borderTop: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  // Loading / empty
  centerMsg: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    flex: 1, gap: '12px', padding: '40px 0',
  },
  centerText: { fontSize: '14px', color: '#94a3b8' },
  emptyIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: '24px', height: '24px',
    border: '2px solid #e7e5e4', borderTop: '2px solid #1e4d3a',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },

  // Date separator
  dateSep: {
    display: 'flex', alignItems: 'center', gap: '10px',
    margin: '16px 0 12px',
  },
  dateLine: { flex: 1, height: '1px', backgroundColor: '#e7e5e4' },
  dateLabel: {
    fontSize: '11px', color: '#94a3b8', fontWeight: '500',
    whiteSpace: 'nowrap', letterSpacing: '0.3px',
  },

  // Message rows
  msgRow: {
    display: 'flex', alignItems: 'flex-end',
    gap: '8px', marginBottom: '6px',
    animation: 'fadeUp 0.2s ease both',
  },
  bubbleAvatar: {
    width: '28px', height: '28px',
    borderRadius: '8px', objectFit: 'cover',
    flexShrink: 0, border: '1px solid #e7e5e4',
  },
  bubbleAvatarFallback: {
    width: '28px', height: '28px', borderRadius: '8px',
    backgroundColor: '#eef4f1', color: '#1e4d3a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', flexShrink: 0,
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },
  myAvatar: {
    width: '28px', height: '28px', borderRadius: '8px',
    backgroundColor: '#0f172a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', flexShrink: 0,
    fontFamily: "'Libre Baskerville', Georgia, serif",
  },

  // Bubble
  bubble: {
    maxWidth: '62%', padding: '10px 14px',
    boxShadow: 'none',
  },
  bubbleText: {
    fontSize: '14px', margin: 0,
    lineHeight: '1.55', wordBreak: 'break-word',
  },
  bubbleTime: {
    fontSize: '10px', margin: '5px 0 0',
    letterSpacing: '0.2px',
  },

  // Media in bubbles
  mediaImg: {
    maxWidth: '100%', maxHeight: '240px',
    borderRadius: '8px', display: 'block',
    marginBottom: '6px', cursor: 'pointer',
    objectFit: 'cover',
  },
  mediaVideo: {
    maxWidth: '100%', maxHeight: '240px',
    borderRadius: '8px', display: 'block',
    marginBottom: '6px',
  },

  // Preview bar
  previewBar: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderTop: 'none',
    padding: '10px 16px',
    display: 'flex', alignItems: 'center', gap: '12px',
    flexShrink: 0,
  },
  previewThumb: {
    height: '56px', width: '56px',
    borderRadius: '8px', objectFit: 'cover',
    border: '1px solid #e7e5e4', flexShrink: 0,
  },
  clearBtn: {
    width: '28px', height: '28px', borderRadius: '8px',
    backgroundColor: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  // Input bar
  inputBar: {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e5e4',
    borderTop: 'none',
    borderRadius: '0 0 14px 14px',
    padding: '12px 16px',
    display: 'flex', gap: '10px',
    alignItems: 'center', flexShrink: 0,
    marginBottom: '16px',
  },
  attachBtn: {
    width: '40px', height: '40px', borderRadius: '10px',
    backgroundColor: '#faf9f7', color: '#64748b',
    border: '1px solid #e7e5e4', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.15s',
  },
  textInput: {
    flex: 1, padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #e7e5e4',
    backgroundColor: '#faf9f7',
    color: '#1e293b', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  sendBtn: {
    width: '40px', height: '40px', borderRadius: '10px',
    backgroundColor: '#1e4d3a', color: '#fff',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'opacity 0.2s',
  },
  sendSpinner: {
    width: '16px', height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },
};

export default ChatPage;