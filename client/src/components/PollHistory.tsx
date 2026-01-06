import { useState, useEffect } from 'react';
import { Poll } from '../types';
import api from '../services/api';
import styles from './PollHistory.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const PollHistory = ({ isOpen, onClose }: Props) => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchPolls = async () => {
            try {
                setLoading(true);
                const response = await api.get('/polls');
                const endedPolls = response.data.filter((p: Poll) => p.endedAt);
                setPolls(endedPolls);
            } catch (error) {
                console.error('Failed to fetch polls:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolls();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Poll History</h3>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <p className={styles.loading}>Loading poll history...</p>
                    ) : polls.length === 0 ? (
                        <p className={styles.empty}>No completed polls yet.</p>
                    ) : (
                        <div className={styles.list}>
                            {polls.map((poll, index) => {
                                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                                
                                return (
                                    <div key={poll._id} className={styles.pollCard}>
                                        <div className={styles.pollHeader}>
                                            <span className={styles.questionLabel}>Question {polls.length - index}</span>
                                            <span className={styles.pollDate}>
                                                {new Date(poll.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <div className={styles.question}>{poll.question}</div>
                                        
                                        <div className={styles.options}>
                                            {poll.options.map((option, optIndex) => {
                                                const percentage = totalVotes > 0 
                                                    ? Math.round((option.votes / totalVotes) * 100) 
                                                    : 0;
                                                
                                                return (
                                                    <div key={optIndex} className={styles.option}>
                                                        <div className={styles.optionRow}>
                                                            <span className={`${styles.optionMarker} ${option.isCorrect ? styles.correct : ''}`}>
                                                                {optIndex + 1}
                                                            </span>
                                                            <span className={styles.optionText}>{option.text}</span>
                                                            <span className={styles.optionPercent}>{percentage}%</span>
                                                        </div>
                                                        <div className={styles.progressBar}>
                                                            <div 
                                                                className={`${styles.progress} ${option.isCorrect ? styles.correctProgress : ''}`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className={styles.pollFooter}>
                                            <span>{totalVotes} votes</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PollHistory;
