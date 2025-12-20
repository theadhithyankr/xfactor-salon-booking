import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, CircularProgress, Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { CalendarMonth, AccessTime, AttachMoney } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

export default function MyBookings() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Confirmation Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

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
                .order('appointment_date', { ascending: true })
                .order('start_time', { ascending: true });

            setAppointments(appointmentsData || []);
            setLoading(false);
        };

        fetchAppointments();
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    // Helper to parse proposal
    const getProposal = (notes: string | null) => {
        if (!notes) return null;
        const match = notes.match(/RESCHEDULE_PROPOSAL: ({.*})/);
        try {
            return match ? JSON.parse(match[1]) : null;
        } catch (e) {
            return null;
        }
    };

    const handleAcceptProposal = async (appointment: any) => {
        const proposal = getProposal(appointment.notes);
        if (!proposal) return;

        const cleanNotes = appointment.notes.replace(/\n?RESCHEDULE_PROPOSAL: \{.*\}/g, '');

        const { error } = await supabase
            .from('appointments')
            .update({
                appointment_date: proposal.date,
                start_time: proposal.time,
                end_time: proposal.end_time || proposal.time, // Fallback if missing
                notes: cleanNotes,
                status: 'confirmed'
            })
            .eq('id', appointment.id);

        if (error) {
            showNotification('Error accepting proposal: ' + error.message, 'error');
        } else {
            showNotification('Reschedule confirmed!', 'success');
            // Refresh list or update local
            setAppointments(appointments.map(apt =>
                apt.id === appointment.id ? {
                    ...apt,
                    appointment_date: proposal.date,
                    start_time: proposal.time,
                    end_time: proposal.end_time,
                    notes: cleanNotes,
                    status: 'confirmed'
                } : apt
            ));
        }
    };

    const handleDeclineProposal = async (appointment: any) => {
        const cleanNotes = appointment.notes.replace(/\n?RESCHEDULE_PROPOSAL: \{.*\}/g, '');

        const { error } = await supabase
            .from('appointments')
            .update({ notes: cleanNotes })
            .eq('id', appointment.id);

        if (error) {
            showNotification('Error declining proposal: ' + error.message, 'error');
        } else {
            setAppointments(appointments.map(apt =>
                apt.id === appointment.id ? { ...apt, notes: cleanNotes } : apt
            ));
        }
    };

    const handleCancelClick = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setConfirmMessage('Are you sure you want to cancel this appointment?');
        setConfirmAction(() => async () => {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) {
                showNotification('Error cancelling appointment: ' + error.message, 'error');
            } else {
                showNotification('Appointment cancelled', 'success');
                setAppointments(prev => prev.map(apt =>
                    apt.id === id ? { ...apt, status: 'cancelled' } : apt
                ));
            }
        });
        setConfirmOpen(true);
    };

    const handleDeleteClick = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        setConfirmMessage('Are you sure you want to delete this booking record permanently?');
        setConfirmAction(() => async () => {
            const { error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id);

            if (error) {
                showNotification('Error deleting appointment: ' + error.message, 'error');
            } else {
                showNotification('Appointment deleted', 'success');
                setAppointments(prev => prev.filter(apt => apt.id !== id));
            }
        });
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (confirmAction) {
            await confirmAction();
        }
        setConfirmOpen(false);
        setConfirmAction(null);
    };

    const formatTime12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 12, pt: 15 }}>
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
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                        gap: 3
                    }}>
                        {appointments.map((appointment, index) => (
                            <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{ height: '100%', display: 'flex' }}
                            >
                                <Card sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        boxShadow: '0 8px 24px rgba(255, 0, 0, 0.15)',
                                    },
                                    transition: 'all 0.3s ease'
                                }}>
                                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
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

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
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
                                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    ({appointment.services.duration_minutes} min)
                                                </Typography>
                                            )}
                                        </Box>

                                        {appointment.notes && (
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Notes:</strong> {appointment.notes.replace(/RESCHEDULE_PROPOSAL: \{.*\}/g, '')}
                                                </Typography>

                                                {/* Proposal UI */}
                                                {getProposal(appointment.notes) && (
                                                    <Box sx={{ mt: 2, p: 2, border: '1px dashed #FF0000', borderRadius: 1, bgcolor: 'rgba(255,0,0,0.05)' }}>
                                                        <Typography variant="subtitle2" color="error" gutterBottom fontWeight="bold">
                                                            Worker Proposed New Time:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                                            {new Date(getProposal(appointment.notes).date).toLocaleDateString()} at {formatTime12Hour(getProposal(appointment.notes).time)}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="primary"
                                                                onClick={() => handleAcceptProposal(appointment)}
                                                            >
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="inherit"
                                                                onClick={() => handleDeclineProposal(appointment)}
                                                            >
                                                                Decline
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                    </CardContent>
                                    <CardActions sx={{ p: 2, justifyContent: 'flex-end', mt: 'auto' }}>
                                        {['pending', 'confirmed'].includes((appointment.status || '').toLowerCase().trim()) && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={(e) => handleCancelClick(appointment.id, e)}
                                            >
                                                Cancel
                                            </Button>
                                        )}

                                        {['cancelled', 'completed'].includes((appointment.status || '').toLowerCase().trim()) && (
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                onClick={(e) => handleDeleteClick(appointment.id, e)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </motion.div>
                        ))}
                    </Box>
                )}
            </motion.div>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
            >
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} variant="contained" color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
}
