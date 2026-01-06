import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import api from '../services/api';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role: string) => Promise<void>;
    logout: () => void;
    setUserKicked: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const setUserKicked = useCallback(() => {
        setUser(prev => prev ? { ...prev, isKicked: true } : null);
        localStorage.setItem('user', JSON.stringify({ ...user, isKicked: true }));
    }, [user]);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            connectSocket(savedToken);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !user) return;

        const handleKicked = ({ studentId }: { studentId: string }) => {
            if (user.id === studentId) {
                setUserKicked();
            }
        };

        socket.on('studentKicked', handleKicked);

        return () => {
            socket.off('studentKicked', handleKicked);
        };
    }, [user, setUserKicked]);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        connectSocket(newToken);
    };

    const register = async (name: string, email: string, password: string, role: string) => {
        const response = await api.post('/auth/register', { name, email, password, role });
        const { token: newToken, user: newUser } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        connectSocket(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        disconnectSocket();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, setUserKicked, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
