import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, Grid, Card, CardContent } from '@mui/material';
import { People, Store, Assessment, CalendarMonth } from '@mui/icons-material';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSalons: 0,
        totalAppointments: 0,
        totalWorkers: 0
    });

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

            // Fetch stats
            const [users, salons, appointments, workers] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('salons').select('*', { count: 'exact', head: true }),
                supabase.from('appointments').select('*', { count: 'exact', head: true }),
                supabase.from('workers').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                totalUsers: users.count || 0,
                totalSalons: salons.count || 0,
                totalAppointments: appointments.count || 0,
                totalWorkers: workers.count || 0
            });
        };

        fetchData();
    }, [navigate]);

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            placeItems: 'center',
            zIndex: 1, // Ensure it sits below navbar but visible
            pt: '80px', // Push down content just enough so it's not hidden by navbar if screen is small
            overflow: 'auto', // Allow scrolling if content is taller than screen
        }}>
            <Container maxWidth="lg">
                <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper' }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                        {profile?.full_name || 'Administrator'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Manage users, salons, and system settings
                    </Typography>
                </Paper>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{stats.totalUsers}</Typography>
                                        <Typography variant="body2" color="text.secondary">Total Users</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Store sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{stats.totalSalons}</Typography>
                                        <Typography variant="body2" color="text.secondary">Salons</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CalendarMonth sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{stats.totalAppointments}</Typography>
                                        <Typography variant="body2" color="text.secondary">Appointments</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Assessment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">{stats.totalWorkers}</Typography>
                                        <Typography variant="body2" color="text.secondary">Workers</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Admin Controls</Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => navigate('/admin/services')}
                            >
                                Manage Services
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={() => navigate('/admin/salons')}
                            >
                                Manage Salons
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Button variant="contained" fullWidth size="large">
                                View Reports
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}
