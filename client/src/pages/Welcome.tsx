import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Welcome = () => {
    const [step, setStep] = useState<'role' | 'form'>('role');
    const [role, setRole] = useState<'student' | 'teacher'>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleRoleSelect = (selectedRole: 'student' | 'teacher') => {
        setRole(selectedRole);
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password, role);
            }
            navigate('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 'role') {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.badgeCenter}>INTERVUE</div>
                    <h1 className={styles.title}>
                        Welcome to the <span className={styles.highlight}>Live Polling System</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Please select your role to continue participating in the polling
                    </p>
                    
                    <div className={styles.roleSelector}>
                        <button
                            type="button"
                            className={styles.roleBtn}
                            onClick={() => handleRoleSelect('student')}
                        >
                            I'm a Student
                        </button>
                        <button
                            type="button"
                            className={styles.roleBtn}
                            onClick={() => handleRoleSelect('teacher')}
                        >
                            I'm a Teacher
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badgeCenter}>
                    {role === 'teacher' ? 'TEACHER' : 'STUDENT'}
                </div>
                <h1 className={styles.title}>Let's Get Started</h1>
                <p className={styles.subtitle}>
                    {role === 'teacher' 
                        ? "You'll have the ability to create a poll, ask your students and get live results."
                        : "Enter your details to join the polling session."
                    }
                </p>
                
                {error && <div className={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
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
                    )}
                    
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
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button type="submit" disabled={submitting} className={styles.button}>
                        {submitting ? 'Please wait...' : 'Submit'}
                    </button>
                </form>
                
                <p className={styles.link}>
                    {isLogin ? (
                        <>Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className={styles.linkBtn}>Register</button></>
                    ) : (
                        <>Already have an account? <button type="button" onClick={() => setIsLogin(true)} className={styles.linkBtn}>Sign In</button></>
                    )}
                </p>
                
                <button 
                    type="button" 
                    onClick={() => setStep('role')} 
                    className={styles.backBtn}
                >
                    ← Back to role selection
                </button>
            </div>
        </div>
    );
};

export default Welcome;
