import { useState, FormEvent } from 'react';
import api from '../services/api';
import { Poll } from '../types';
import styles from './CreatePoll.module.css';

interface Props {
    onCreated: (poll: Poll) => void;
    onCancel: () => void;
}

const CreatePoll = ({ onCreated, onCancel }: Props) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [duration, setDuration] = useState(60);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
            if (correctIndex === index) {
                setCorrectIndex(0);
            } else if (correctIndex > index) {
                setCorrectIndex(correctIndex - 1);
            }
        }
    };

    const updateOption = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        const validOptions = options.filter(o => o.trim());
        if (validOptions.length < 2) {
            setError('At least 2 options required');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/polls', {
                question,
                options: validOptions,
                duration,
                correctIndex
            });
            onCreated(response.data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to create poll');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.badge}>TEACHER</span>
            </div>
            <h3 className={styles.title}>Let's Get Started</h3>
            <p className={styles.subtitle}>
                You'll have the ability to create a poll, ask your students and get live results.
            </p>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label>Enter your question</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type your question here..."
                        required
                    />
                </div>

                <div className={styles.field}>
                    <div className={styles.optionsHeader}>
                        <span className={styles.optionsLabel}>Edit Options</span>
                        <span className={styles.correctLabel}>Is Correct?</span>
                    </div>
                    <div className={styles.optionsList}>
                        {options.map((option, index) => (
                            <div key={index} className={styles.optionRow}>
                                <span className={styles.optionNumber}>{index + 1}</span>
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setCorrectIndex(index)}
                                    className={`${styles.correctCheck} ${correctIndex === index ? styles.checked : ''}`}
                                >
                                    {correctIndex === index && '✓'}
                                </button>
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className={styles.removeBtn}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {options.length < 6 && (
                        <button
                            type="button"
                            onClick={addOption}
                            className={styles.addBtn}
                        >
                            + Add another option
                        </button>
                    )}
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <label>Duration (seconds)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={10}
                            max={300}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={styles.submitBtn}
                    >
                        {submitting ? 'Creating...' : 'Ask Question'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePoll;
