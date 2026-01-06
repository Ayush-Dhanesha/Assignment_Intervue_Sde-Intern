import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const KickedOut = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleReturnToWelcome = () => {
        logout();
        navigate('/welcome');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.kickedBadge}>KICKED</div>
                <h1 className={styles.title}>You've been Kicked out!</h1>
                <p className={styles.subtitle}>
                    You have been removed from the polling session by the teacher. 
                    Please contact your teacher if you think this was a mistake.
                </p>
                <button onClick={handleReturnToWelcome} className={styles.button}>
                    Return to Welcome
                </button>
            </div>
        </div>
    );
};

export default KickedOut;
