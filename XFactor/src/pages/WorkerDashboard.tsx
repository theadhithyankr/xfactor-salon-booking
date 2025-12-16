import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, CircularProgress, Grid, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import { Work, Schedule, Star } from '@mui/icons-material';

export default function WorkerDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [workerData, setWorkerData] = useState<any>(null);
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

            // Fetch worker data
            const { data: worker } = await supabase
                .from('workers')
                .select('*')
                .eq('profile_id', user.id)
                .single();

            setWorkerData(worker);

            // Fetch appointments assigned to this worker
            if (worker) {
                const { data: appointmentsData } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('worker_id', worker.id)
                    .order('appointment_date', { ascending: true });

                setAppointments(appointmentsData || []);
            }

            setLoading(false);
        };

        fetchData();
    }, [navigate]);

    const toggleAvailability = async () => {
        if (!workerData) return;

        const { error } = await supabase
            .from('workers')
            .update({ is_available: !workerData.is_available })
            .eq('id', workerData.id);

        if (!error) {
            setWorkerData({ ...workerData, is_available: !workerData.is_available });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            placeItems: 'center',
            zIndex: 1,
            pt: '80px',
            overflow: 'auto',
        }}>
            <Container maxWidth="lg">
                <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper' }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Worker Dashboard
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                        {profile?.full_name || 'Worker'}
                    </Typography>
                    {workerData && (
                        <FormControlLabel
                            control={<Switch checked={workerData.is_available} onChange={toggleAvailability} />}
                            label="Available for bookings"
                            sx={{ mt: 2 }}
                        />
                    )}
                </Paper>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Schedule sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{appointments.length}</Typography>
                                        <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Star sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{workerData?.rating || '0.0'}</Typography>
                                        <Typography variant="body2" color="text.secondary">Rating</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Work sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{workerData?.total_reviews || 0}</Typography>
                                        <Typography variant="body2" color="text.secondary">Reviews</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">My Schedule</Typography>
                    {appointments.length === 0 ? (
                        <Typography color="text.secondary">No appointments scheduled</Typography>
                    ) : (
                        <Box>
                            {appointments.map((apt) => (
                                <Card key={apt.id} sx={{ mb: 2, p: 2 }}>
                                    <Typography variant="h6">Appointment on {apt.appointment_date}</Typography>
                                    <Typography color="text.secondary">Time: {apt.start_time} - {apt.end_time}</Typography>
                                    <Typography color="text.secondary">Status: {apt.status}</Typography>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}
