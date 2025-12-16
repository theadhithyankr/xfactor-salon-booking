import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
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
                // Redirect customers to My Bookings
                if (data.role === 'customer') {
                    navigate('/my-bookings');
                }
            }
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    // Only workers and admins see dashboards
    if (role === 'worker') return <WorkerDashboard />;
    if (role === 'admin') return <AdminDashboard />;

    // Customers are redirected above
    return null;
}
