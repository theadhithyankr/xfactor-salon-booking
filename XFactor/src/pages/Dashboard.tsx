import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, CircularProgress } from '@mui/material';

export default function Dashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
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
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        )
    }

    return (
        <Container maxWidth="lg" sx={{ py: 12 }}>
            <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper', borderRadius: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Dashboard
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    Welcome, <span style={{ color: '#FF0000' }}>{profile?.full_name || 'User'}</span>
                </Typography>
                <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body1"><strong>Role:</strong> {profile?.role.toUpperCase()}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {profile?.email || 'N/A (Stored in Auth)'}</Typography>
                    <Typography variant="body1"><strong>Phone:</strong> {profile?.phone}</Typography>
                </Box>
                <Button variant="outlined" color="primary" onClick={handleLogout} sx={{ mt: 4 }}>
                    Logout
                </Button>
            </Paper>

            {/* Role Based Content Render */}
            {profile?.role === 'customer' && (
                <CustomerView />
            )}
            {profile?.role === 'worker' && (
                <WorkerView />
            )}
            {profile?.role === 'admin' && (
                <AdminView />
            )}
        </Container>
    );
}

function CustomerView() {
    return (
        <Paper sx={{ p: 4, bgcolor: 'background.default', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h5" gutterBottom>My Appointments</Typography>
            <Typography color="text.secondary">You have no upcoming appointments.</Typography>
            <Button variant="contained" href="/" sx={{ mt: 2 }}>Book New Service</Button>
        </Paper>
    )
}

function WorkerView() {
    return (
        <Paper sx={{ p: 4, bgcolor: 'background.default', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h5" gutterBottom>My Schedule</Typography>
            <Typography color="text.secondary">No appointments assigned for today.</Typography>
        </Paper>
    )
}

function AdminView() {
    return (
        <Paper sx={{ p: 4, bgcolor: 'background.default', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h5" gutterBottom>Admin Controls</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" color="secondary">Manage Users</Button>
                <Button variant="contained" color="secondary">Manage Salons</Button>
                <Button variant="contained" color="secondary">View Reports</Button>
            </Box>
        </Paper>
    )
}
