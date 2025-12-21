import { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Card, CardContent, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AttachMoney, CalendarToday, Cancel, People } from '@mui/icons-material';
import dayjs from 'dayjs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function Reports() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        cancelledBookings: 0,
        activeWorkers: 0,
    });
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [serviceData, setServiceData] = useState<any[]>([]);

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
                // 1. Calculate Summary Stats
                let revenue = 0;
                let cancelled = 0;
                let total = appointments.length;

                // 2. Prepare Chart Data
                const revMap: any = {};
                const statusMap: any = {};
                const serviceMap: any = {};

                appointments.forEach(apt => {
                    const price = apt.total_price || apt.services?.price || 0;

                    // Status Count
                    statusMap[apt.status] = (statusMap[apt.status] || 0) + 1;

                    // Service Count
                    const serviceName = apt.services?.name || 'Unknown';
                    serviceMap[serviceName] = (serviceMap[serviceName] || 0) + 1;

                    if (apt.status === 'completed') {
                        revenue += price;
                        // Revenue Trend
                        const date = dayjs(apt.appointment_date).format('MMM D');
                        revMap[date] = (revMap[date] || 0) + price;
                    } else if (apt.status === 'cancelled') {
                        cancelled++;
                    }
                });

                setStats({
                    totalRevenue: revenue,
                    totalBookings: total,
                    cancelledBookings: cancelled,
                    activeWorkers: workerCount || 0
                });

                // Transform Maps to Arrays for Recharts
                setRevenueData(Object.keys(revMap).map(key => ({ date: key, amount: revMap[key] })));
                setStatusData(Object.keys(statusMap).map(key => ({ name: key, value: statusMap[key] })));
                setServiceData(Object.keys(serviceMap).map(key => ({ name: key, value: serviceMap[key] })));
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
        <Box sx={{ minHeight: '100dvh', pt: '80px', pb: 4, px: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: { xs: 2, md: 0 }
                    }}>
                        Analytics & Reports
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
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
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                    <AttachMoney sx={{ fontSize: 32, color: 'white' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">₹{stats.totalRevenue.toLocaleString()}</Typography>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Revenue</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                    <CalendarToday sx={{ fontSize: 32, color: 'white' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{stats.totalBookings}</Typography>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Bookings</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                    <Cancel sx={{ fontSize: 32, color: 'white' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{stats.cancelledBookings}</Typography>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Cancellations</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
                            color: 'white',
                            borderRadius: 4,
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
                                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', mr: 2, display: 'flex' }}>
                                    <People sx={{ fontSize: 32, color: 'white' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{stats.activeWorkers}</Typography>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Active Workers</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} justifyContent="center">
                    {/* Revenue Trend */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: { xs: 300, md: 400 }, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Typography variant="h6" gutterBottom>Revenue Trend</Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis prefix="₹" />
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Revenue" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Booking Status */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: { xs: 300, md: 400 }, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Typography variant="h6" gutterBottom>Booking Status</Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Top Services */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: { xs: 300, md: 400 }, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <Typography variant="h6" gutterBottom>Popular Services</Typography>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={serviceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#82ca9d" name="Bookings" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
