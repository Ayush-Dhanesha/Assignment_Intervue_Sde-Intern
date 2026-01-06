import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import KickedOut from './pages/KickedOut';
import './App.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/welcome" />;
    }

    if (user.isKicked) {
        return <Navigate to="/kicked" />;
    }
    
    return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    return user ? <Navigate to="/" /> : <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route 
                path="/welcome" 
                element={
                    <PublicRoute>
                        <Welcome />
                    </PublicRoute>
                } 
            />
            <Route 
                path="/kicked" 
                element={<KickedOut />} 
            />
            <Route 
                path="/" 
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } 
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
