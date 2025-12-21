import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AttachMoney, CalendarToday, Cancel, People, CheckCircle, HourglassEmpty, PlayArrow, EventAvailable } from '@mui/icons-material';
import dayjs from 'dayjs';


export default function Reports() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        inProgressBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        activeWorkers: 0,
    });

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Verify Admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                navigate('/dashboard');
                return;
            }

            // Date Range Logic
            let startDate = dayjs().subtract(1, 'month');
            if (timeRange === 'week') startDate = dayjs().subtract(1, 'week');
            if (timeRange === 'year') startDate = dayjs().subtract(1, 'year');

            // Fetch Appointments
            const { data: appointments } = await supabase
                .from('appointments')
                .select('*, services(name, price)')
                .gte('appointment_date', startDate.format('YYYY-MM-DD'))
                .order('appointment_date', { ascending: true });

            // Fetch Active Workers
            const { count: workerCount } = await supabase
                .from('workers')
                .select('*', { count: 'exact', head: true })
                .eq('is_available', true);

            if (appointments) {
                let revenue = 0;
                let pending = 0;
                let confirmed = 0;
                let inProgress = 0;
                let completed = 0;
                let cancelled = 0;
                let total = appointments.length;

                appointments.forEach(apt => {
                    const price = apt.total_price || apt.services?.price || 0;

                    // Track status counts
                    switch (apt.status) {
                        case 'pending':
                            pending++;
                            break;
                        case 'confirmed':
                            confirmed++;
                            break;
                        case 'in_progress':
                            inProgress++;
                            break;
                        case 'completed':
                            completed++;
                            revenue += price; // Only count revenue from completed appointments
                            break;
                        case 'cancelled':
                            cancelled++;
                            break;
                    }
                });

                setStats({
                    totalRevenue: revenue,
                    totalBookings: total,
                    pendingBookings: pending,
                    confirmedBookings: confirmed,
                    inProgressBookings: inProgress,
                    completedBookings: completed,
                    cancelledBookings: cancelled,
                    activeWorkers: workerCount || 0
                });
            }
            setLoading(false);
        };

        fetchReports();
    }, [navigate, timeRange]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                gap: 2,
                mb: 4
            }}>
                <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                    Analytics & Reports
                </Typography>

                <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        label="Time Range"
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <MenuItem value="week">Last 7 Days</MenuItem>
                        <MenuItem value="month">Last 30 Days</MenuItem>
                        <MenuItem value="year">Last Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
                {/* Total Revenue */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <AttachMoney sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>₹{stats.totalRevenue.toLocaleString()}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Revenue</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pending */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <HourglassEmpty sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.pendingBookings}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Pending</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Confirmed */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <EventAvailable sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.confirmedBookings}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Confirmed</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* In Progress */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <PlayArrow sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.inProgressBookings}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>In Progress</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Completed */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.completedBookings}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Completed</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Cancelled */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <Cancel sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.cancelledBookings}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Cancelled</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Bookings */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <CalendarToday sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.totalBookings}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Bookings</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Workers */}
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                            <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                <People sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.activeWorkers}</Typography>
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Active Workers</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </Box>
    );
}
