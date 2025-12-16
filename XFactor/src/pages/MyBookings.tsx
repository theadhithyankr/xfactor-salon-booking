import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, CircularProgress, Card, CardContent, Button, Chip } from '@mui/material';
import { CalendarMonth, AccessTime, AttachMoney } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function MyBookings() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Fetch appointments with service details
            const { data: appointmentsData } = await supabase
                .from('appointments')
                .select(`
                    *,
                    services (
                        name,
                        price,
                        duration_minutes
                    )
                `)
                .eq('customer_id', user.id)
                .order('appointment_date', { ascending: false });

            setAppointments(appointmentsData || []);
            setLoading(false);
        };

        fetchAppointments();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const formatTime12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 12, pt: 15 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
                    My Bookings
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    View and manage your appointments
                </Typography>

                {appointments.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom color="text.secondary">
                            No bookings yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Ready to look your best? Book your first appointment!
                        </Typography>
                        <Button variant="contained" size="large" onClick={() => navigate('/')}>
                            Browse Services
                        </Button>
                    </Paper>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {appointments.map((appointment, index) => (
                            <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card sx={{
                                    '&:hover': {
                                        boxShadow: '0 8px 24px rgba(255, 0, 0, 0.15)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                                    {appointment.services?.name || 'Service'}
                                                </Typography>
                                                <Chip
                                                    label={appointment.status?.toUpperCase() || 'PENDING'}
                                                    color={getStatusColor(appointment.status)}
                                                    size="small"
                                                />
                                            </Box>
                                            {appointment.total_price && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachMoney sx={{ color: 'primary.main' }} />
                                                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                                                        ₹{appointment.total_price.toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarMonth color="action" />
                                                <Typography variant="body1">
                                                    {new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTime color="action" />
                                                <Typography variant="body1">
                                                    {formatTime12Hour(appointment.start_time)} - {formatTime12Hour(appointment.end_time)}
                                                </Typography>
                                            </Box>
                                            {appointment.services?.duration_minutes && (
                                                <Typography variant="body2" color="text.secondary">
                                                    ({appointment.services.duration_minutes} min)
                                                </Typography>
                                            )}
                                        </Box>

                                        {appointment.notes && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Notes:</strong> {appointment.notes}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </Box>
                )}
            </motion.div>
        </Container>
    );
}
