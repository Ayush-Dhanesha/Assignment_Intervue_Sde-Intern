import { useState, useEffect } from 'react';
import { Poll } from '../types';
import styles from './ActivePoll.module.css';

interface Props {
    poll: Poll;
    onVote: (pollId: string, optionIndex: number) => void;
    onStop?: (pollId: string) => void;
    userId: string;
}

const ActivePoll = ({ poll, onVote, onStop, userId }: Props) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(poll.duration);

    useEffect(() => {
        const voted = poll.options.some(opt => 
            (opt.votedBy || []).includes(userId)
        );
        setHasVoted(voted);

        if (voted) {
            const votedIndex = poll.options.findIndex(opt => 
                (opt.votedBy || []).includes(userId)
            );
            setSelectedOption(votedIndex);
        }
    }, [poll, userId]);

    useEffect(() => {
        if (!poll.startedAt) return;

        const startTime = new Date(poll.startedAt).getTime();
        const endTime = startTime + poll.duration * 1000;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [poll.startedAt, poll.duration]);

    const handleVote = () => {
        if (selectedOption !== null && !hasVoted) {
            onVote(poll._id, selectedOption);
            setHasVoted(true);
        }
    };

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.timer}>
                    <span className={styles.timerIcon}>⏱️</span>
                    <span className={styles.timerValue}>{timeLeft}s</span>
                </div>
                {onStop && (
                    <button onClick={() => onStop(poll._id)} className={styles.stopBtn}>
                        End Poll
                    </button>
                )}
            </div>

            <div className={styles.question}>{poll.question}</div>

            <div className={styles.options}>
                {poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 
                        ? Math.round((option.votes / totalVotes) * 100) 
                        : 0;
                    const isSelected = selectedOption === index;

                    return (
                        <button
                            key={index}
                            onClick={() => !hasVoted && setSelectedOption(index)}
                            disabled={hasVoted}
                            className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                        >
                            <div className={styles.optionCheckbox}>
                                {isSelected && '✓'}
                            </div>
                            <div 
                                className={styles.optionProgress}
                                style={{ width: hasVoted ? `${percentage}%` : '0%' }}
                            />
                            <span className={styles.optionText}>{option.text}</span>
                            {hasVoted && (
                                <span className={styles.optionVotes}>
                                    {percentage}%
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {!hasVoted && (
                <button
                    onClick={handleVote}
                    disabled={selectedOption === null}
                    className={styles.voteBtn}
                >
                    Submit
                </button>
            )}

            {hasVoted && (
                <>
                    <p className={styles.votedMessage}>
                        Wait for the teacher to ask a new question.
                    </p>
                </>
            )}

            <div className={styles.stats}>
                <span>{totalVotes} votes</span>
            </div>
        </div>
    );
};

export default ActivePoll;
