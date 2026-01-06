import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';
import styles from './Chat.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const Chat = ({ isOpen, onClose }: Props) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchMessages = async () => {
            try {
                const response = await api.get('/chat');
                setMessages(response.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();
    }, [isOpen]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on('newMessage', (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('chatCleared', () => {
            setMessages([]);
        });

        return () => {
            socket.off('newMessage');
            socket.off('chatCleared');
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await api.post('/chat', { message: newMessage.trim() });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleClearChat = async () => {
        if (!confirm('Are you sure you want to clear all messages?')) return;
        
        try {
            await api.delete('/chat');
        } catch (error) {
            console.error('Failed to clear chat:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Chat</h3>
                    <div className={styles.headerActions}>
                        {user?.role === 'teacher' && (
                            <button onClick={handleClearChat} className={styles.clearBtn}>
                                Clear
                            </button>
                        )}
                        <button onClick={onClose} className={styles.closeBtn}>×</button>
                    </div>
                </div>

                <div className={styles.messages}>
                    {messages.length === 0 ? (
                        <p className={styles.empty}>No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map(msg => (
                            <div 
                                key={msg._id} 
                                className={`${styles.message} ${msg.sender._id === user?.id ? styles.own : ''}`}
                            >
                                <div className={styles.messageMeta}>
                                    <span className={styles.senderName}>
                                        {msg.sender.name}
                                        {msg.sender.role === 'teacher' && (
                                            <span className={styles.teacherBadge}>Teacher</span>
                                        )}
                                    </span>
                                    <span className={styles.messageTime}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                                <p className={styles.messageText}>{msg.message}</p>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className={styles.inputArea}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        maxLength={500}
                    />
                    <button type="submit" disabled={!newMessage.trim() || sending}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
