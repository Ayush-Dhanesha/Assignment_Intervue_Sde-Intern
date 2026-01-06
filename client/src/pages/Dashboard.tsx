import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { Poll } from '../types';
import CreatePoll from '../components/CreatePoll';
import PollCard from '../components/PollCard';
import ActivePoll from '../components/ActivePoll';
import Chat from '../components/Chat';
import StudentList from '../components/StudentList';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showStudents, setShowStudents] = useState(false);

    const fetchPolls = useCallback(async () => {
        try {
            const response = await api.get('/polls');
            setPolls(response.data);
            
            const active = response.data.find((p: Poll) => p.isActive);
            setActivePoll(active || null);
        } catch (error) {
            console.error('Failed to fetch polls:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on('pollStarted', (poll: Poll) => {
            setActivePoll(poll);
            setPolls(prev => prev.map(p => 
                p._id === poll._id ? poll : { ...p, isActive: false }
            ));
        });

        socket.on('pollEnded', (poll: Poll) => {
            if (activePoll?._id === poll._id) {
                setActivePoll(null);
            }
            setPolls(prev => prev.map(p => 
                p._id === poll._id ? poll : p
            ));
        });

        socket.on('voteUpdate', ({ pollId, options }) => {
            setPolls(prev => prev.map(p => 
                p._id === pollId ? { ...p, options } : p
            ));
            if (activePoll?._id === pollId) {
                setActivePoll(prev => prev ? { ...prev, options } : null);
            }
        });

        socket.on('pollDeleted', ({ pollId }) => {
            setPolls(prev => prev.filter(p => p._id !== pollId));
            if (activePoll?._id === pollId) {
                setActivePoll(null);
            }
        });

        return () => {
            socket.off('pollStarted');
            socket.off('pollEnded');
            socket.off('voteUpdate');
            socket.off('pollDeleted');
        };
    }, [activePoll]);

    const handlePollCreated = (poll: Poll) => {
        setPolls(prev => [poll, ...prev]);
        setShowCreate(false);
    };

    const handleStartPoll = async (pollId: string) => {
        try {
            await api.post(`/polls/${pollId}/start`);
        } catch (error) {
            console.error('Failed to start poll:', error);
        }
    };

    const handleStopPoll = async (pollId: string) => {
        try {
            await api.post(`/polls/${pollId}/stop`);
        } catch (error) {
            console.error('Failed to stop poll:', error);
        }
    };

    const handleDeletePoll = async (pollId: string) => {
        try {
            await api.delete(`/polls/${pollId}`);
        } catch (error) {
            console.error('Failed to delete poll:', error);
        }
    };

    const handleVote = async (pollId: string, optionIndex: number) => {
        try {
            await api.post(`/polls/${pollId}/vote`, { optionIndex });
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    const isTeacher = user?.role === 'teacher';

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <span className={styles.badge}>INTERVUE</span>
                        <h1>Live Polling</h1>
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>
                            {user?.name}
                        </span>
                        <button onClick={logout} className={styles.logoutBtn}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                {activePoll ? (
                    <section className={styles.activeSection}>
                        <div className={styles.sectionHeader}>
                            <h2>Question 1</h2>
                            <span className={styles.liveBadge}>● LIVE</span>
                        </div>
                        <ActivePoll
                            poll={activePoll}
                            onVote={handleVote}
                            onStop={isTeacher ? handleStopPoll : undefined}
                            userId={user?.id || ''}
                        />
                    </section>
                ) : !isTeacher ? (
                    <section className={styles.welcomeSection}>
                        <div className={styles.welcomeCard}>
                            <div className={styles.welcomeIcon}>⏳</div>
                            <h3 className={styles.welcomeTitle}>Wait for the teacher to ask questions.</h3>
                            <p className={styles.welcomeText}>Questions will appear here when your teacher starts a poll.</p>
                        </div>
                    </section>
                ) : null}

                {isTeacher && (
                    <section className={styles.createSection}>
                        {showCreate ? (
                            <CreatePoll
                                onCreated={handlePollCreated}
                                onCancel={() => setShowCreate(false)}
                            />
                        ) : (
                            <button
                                onClick={() => setShowCreate(true)}
                                className={styles.createBtn}
                            >
                                + Ask a Question
                            </button>
                        )}
                    </section>
                )}

                {polls.length > 0 && (
                    <section className={styles.pollsSection}>
                        <h2>Poll History</h2>
                        <div className={styles.pollsList}>
                            {polls.map((poll, index) => (
                                <PollCard
                                    key={poll._id}
                                    poll={poll}
                                    questionNumber={polls.length - index}
                                    isTeacher={isTeacher}
                                    onStart={handleStartPoll}
                                    onStop={handleStopPoll}
                                    onDelete={handleDeletePoll}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {isTeacher && (
                    <button 
                        className={styles.studentsToggle}
                        onClick={() => setShowStudents(true)}
                    >
                        👥 Manage Students
                    </button>
                )}
            </main>

            <button 
                className={styles.chatToggle}
                onClick={() => setShowChat(!showChat)}
            >
                💬
            </button>

            {showChat && (
                <Chat
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                />
            )}

            {showStudents && (
                <StudentList
                    isOpen={showStudents}
                    onClose={() => setShowStudents(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
