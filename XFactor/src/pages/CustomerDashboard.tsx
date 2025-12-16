import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, CircularProgress, Grid, Card, CardContent } from '@mui/material';
import { CalendarMonth, Schedule, Person } from '@mui/icons-material';

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);

            // Fetch appointments
            const { data: appointmentsData } = await supabase
                .from('appointments')
                .select('*')
                .eq('customer_id', user.id)
                .order('appointment_date', { ascending: true });

            setAppointments(appointmentsData || []);
            setLoading(false);
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 12, pt: 15 }}>
            <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper' }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome, <span style={{ color: '#FF0000' }}>{profile?.full_name || 'Customer'}</span>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your appointments and book new services
                </Typography>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CalendarMonth sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{appointments.length}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Schedule sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">Upcoming</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">Customer</Typography>
                                    <Typography variant="body2" color="text.secondary">Account Type</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">My Appointments</Typography>
                {appointments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            You have no appointments yet
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/')}>
                            Book Your First Service
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        {appointments.map((apt) => (
                            <Card key={apt.id} sx={{ mb: 2, p: 2 }}>
                                <Typography variant="h6">Appointment on {apt.appointment_date}</Typography>
                                <Typography color="text.secondary">Time: {apt.start_time}</Typography>
                                <Typography color="text.secondary">Status: {apt.status}</Typography>
                            </Card>
                        ))}
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
