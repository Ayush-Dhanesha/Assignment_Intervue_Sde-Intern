import { useState, useEffect } from 'react';
import { Student } from '../types';
import api from '../services/api';
import styles from './StudentList.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const StudentList = ({ isOpen, onClose }: Props) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchStudents = async () => {
            try {
                setLoading(true);
                const response = await api.get('/students');
                setStudents(response.data);
            } catch (error) {
                console.error('Failed to fetch students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [isOpen]);

    const handleKick = async (studentId: string) => {
        try {
            await api.post(`/students/${studentId}/kick`);
            setStudents(prev => prev.map(s => 
                s._id === studentId ? { ...s, isKicked: true } : s
            ));
        } catch (error) {
            console.error('Failed to kick student:', error);
        }
    };

    const handleUnkick = async (studentId: string) => {
        try {
            await api.post(`/students/${studentId}/unkick`);
            setStudents(prev => prev.map(s => 
                s._id === studentId ? { ...s, isKicked: false } : s
            ));
        } catch (error) {
            console.error('Failed to restore student:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Manage Students</h3>
                    <button onClick={onClose} className={styles.closeBtn}>×</button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <p className={styles.loading}>Loading students...</p>
                    ) : students.length === 0 ? (
                        <p className={styles.empty}>No students registered yet.</p>
                    ) : (
                        <div className={styles.list}>
                            {students.map(student => (
                                <div key={student._id} className={styles.studentCard}>
                                    <div className={styles.studentInfo}>
                                        <span className={styles.studentName}>{student.name}</span>
                                        <span className={styles.studentEmail}>{student.email}</span>
                                    </div>
                                    <div className={styles.studentActions}>
                                        {student.isKicked ? (
                                            <button
                                                onClick={() => handleUnkick(student._id)}
                                                className={styles.restoreBtn}
                                            >
                                                Restore
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleKick(student._id)}
                                                className={styles.kickBtn}
                                            >
                                                Kick
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentList;
