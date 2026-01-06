import { Poll } from '../types';
import styles from './PollCard.module.css';

interface Props {
    poll: Poll;
    questionNumber?: number;
    isTeacher: boolean;
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onDelete: (id: string) => void;
}

const PollCard = ({ poll, questionNumber, isTeacher, onStart, onStop, onDelete }: Props) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const getStatusClass = () => {
        if (poll.isActive) return styles.live;
        if (poll.endedAt) return styles.ended;
        return styles.draft;
    };

    const getStatusText = () => {
        if (poll.isActive) return 'Live';
        if (poll.endedAt) return 'Ended';
        return 'Draft';
    };

    return (
        <div className={`${styles.card} ${poll.isActive ? styles.active : ''}`}>
            <div className={styles.header}>
                <span className={styles.questionLabel}>
                    Question {questionNumber || ''}
                </span>
                <div className={styles.status}>
                    <span className={`${styles.statusDot} ${getStatusClass()}`} />
                    <span>{getStatusText()}</span>
                </div>
            </div>

            <div className={styles.question}>{poll.question}</div>

            <div className={styles.options}>
                {poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 
                        ? Math.round((option.votes / totalVotes) * 100) 
                        : 0;
                    
                    return (
                        <div key={index} className={styles.option}>
                            <span className={styles.optionMarker}>{index + 1}</span>
                            <div className={styles.optionContent}>
                                <div className={styles.optionInfo}>
                                    <span>{option.text}</span>
                                    <span>{percentage}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progress}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.footer}>
                <span className={styles.totalVotes}>{totalVotes} votes</span>
                
                {isTeacher && (
                    <div className={styles.actions}>
                        {poll.isActive ? (
                            <button
                                onClick={() => onStop(poll._id)}
                                className={styles.stopBtn}
                            >
                                End Poll
                            </button>
                        ) : !poll.endedAt && (
                            <button
                                onClick={() => onStart(poll._id)}
                                className={styles.startBtn}
                            >
                                Go Live
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(poll._id)}
                            className={styles.deleteBtn}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollCard;
