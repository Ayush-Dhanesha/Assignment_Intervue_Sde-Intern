import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await register(name, email, password, role);
            navigate('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>INTERVUE</div>
                <h1 className={styles.title}>
                    Welcome to the <span className={styles.highlight}>Live Polling System</span>
                </h1>
                <p className={styles.subtitle}>
                    Please select your role and enter your details to get started
                </p>
                
                {error && <div className={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.roleSelector}>
                        <button
                            type="button"
                            className={`${styles.roleBtn} ${role === 'student' ? styles.active : ''}`}
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            className={`${styles.roleBtn} ${role === 'teacher' ? styles.active : ''}`}
                            onClick={() => setRole('teacher')}
                        >
                            I'm a Teacher
                        </button>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="name">Your Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your name"
                        />
                    </div>
                    
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="At least 6 characters"
                        />
                    </div>
                    
                    <button type="submit" disabled={submitting} className={styles.button}>
                        {submitting ? 'Creating account...' : 'Continue'}
                    </button>
                </form>
                
                <p className={styles.link}>
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
