import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import CustomerDashboard from './CustomerDashboard';
import WorkerDashboard from './WorkerDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
    const navigate = useNavigate();
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                navigate('/login');
            } else {
                setRole(data.role);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // Route to appropriate dashboard based on role
    if (role === 'customer') return <CustomerDashboard />;
    if (role === 'worker') return <WorkerDashboard />;
    if (role === 'admin') return <AdminDashboard />;

    return null;
}
