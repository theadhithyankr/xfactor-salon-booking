import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Work, Schedule, Star } from '@mui/icons-material';
import { LocalizationProvider, DateCalendar, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import KanbanBoard from '../components/KanbanBoard';

import CenteredLoader from '../components/CenteredLoader';
import { useNotification } from '../context/NotificationContext';

export default function WorkerDashboard() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [profile, setProfile] = useState<any>(null);
    const [workerData, setWorkerData] = useState<any>(null);
    const [salon, setSalon] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Reschedule State
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [newDate, setNewDate] = useState<Dayjs | null>(dayjs());
    const [newTime, setNewTime] = useState<Dayjs | null>(dayjs().set('hour', 10).set('minute', 0));

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

            if (worker && worker.salon_id) {
                // Fetch Salon Details
                const { data: salonData } = await supabase
                    .from('salons')
                    .select('*')
                    .eq('id', worker.salon_id)
                    .single();
                setSalon(salonData);

                // Fetch appointments: Assigned to me OR (Unassigned AND in my salon)
                const { data: appointmentsData, error } = await supabase
                    .from('appointments')
                    .select('*, profiles(*), services(*)')
                    .eq('salon_id', worker.salon_id)
                    .or(`worker_id.eq.${worker.id},worker_id.is.null`)
                    .order('appointment_date', { ascending: true });

                if (error) console.error('Error fetching appointments:', error);

                // Filter: Show ALL active tasks, but only TODAY'S completed/cancelled tasks (Daily Reset)
                const today = dayjs().format('YYYY-MM-DD');
                const filtered = (appointmentsData || []).filter(apt => {
                    const isActive = ['pending', 'confirmed', 'in_progress'].includes(apt.status);
                    const isToday = apt.appointment_date === today;
                    return isActive || isToday;
                });

                setAppointments(filtered);
            }

            setLoading(false);
        };

        fetchData();
    }, [navigate]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        const updates: any = { status: newStatus };

        // If accepting a pending appointment (moving to confirmed/in_progress), assign to me
        if (newStatus === 'confirmed' || newStatus === 'in_progress') {
            updates.worker_id = workerData.id;
        }

        const { error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', id);

        if (error) {
            showNotification('Error updating status: ' + error.message, 'error');
        } else {
            // Update local state
            setAppointments(appointments.map(apt =>
                apt.id === id ? { ...apt, ...updates } : apt
            ));
        }
    };

    const handleRescheduleClick = (appointment: any) => {
        setSelectedAppointment(appointment);
        setNewDate(dayjs(appointment.appointment_date));
        setNewTime(dayjs(appointment.start_time, 'HH:mm:ss'));
        setRescheduleOpen(true);
    };

    const submitReschedule = async () => {
        if (!selectedAppointment || !newDate || !newTime || !salon) return;

        const dateStr = newDate.format('YYYY-MM-DD');
        const timeStr = newTime.format('HH:mm:ss');

        // Validation 1: Salon Hours
        if (timeStr < salon.opening_time || timeStr > salon.closing_time) {
            const open12 = dayjs(salon.opening_time, 'HH:mm:ss').format('h:mm A');
            const close12 = dayjs(salon.closing_time, 'HH:mm:ss').format('h:mm A');
            showNotification(`Please select a time between ${open12} and ${close12}`, 'warning');
            return;
        }

        // Validation 2: Conflict
        // Check if *THIS* worker is busy
        const workerId = selectedAppointment.worker_id || workerData.id;

        // Estimate end time
        const duration = selectedAppointment.services?.duration_minutes || 60;
        const endStr = newTime.add(duration, 'minute').format('HH:mm:ss');

        const { data: conflicts } = await supabase
            .from('appointments')
            .select('id')
            .eq('worker_id', workerId)
            .eq('appointment_date', dateStr)
            .neq('id', selectedAppointment.id) // Exclude self
            .or(`and(start_time.lte.${timeStr},end_time.gt.${timeStr}),and(start_time.lt.${endStr},end_time.gte.${endStr})`);

        if (conflicts && conflicts.length > 0) {
            showNotification('You are already booked during this time.', 'warning');
            return;
        }

        // Update Appointment Notes with Proposal
        const proposal = JSON.stringify({
            date: dateStr,
            time: timeStr,
            end_time: endStr
        });

        // Append proposal to existing notes (or create new)
        // Be careful not to duplicate proposals
        const cleanNotes = (selectedAppointment.notes || '').replace(/\nRESCHEDULE_PROPOSAL: \{.*\}/g, '');
        const newNotes = cleanNotes + `\nRESCHEDULE_PROPOSAL: ${proposal}`;

        const { error } = await supabase
            .from('appointments')
            .update({ notes: newNotes })
            .eq('id', selectedAppointment.id);

        if (error) {
            showNotification('Error sending proposal: ' + error.message, 'error');
        } else {
            showNotification('Reschedule proposal sent to customer via notes.', 'success');
            setAppointments(appointments.map(apt =>
                apt.id === selectedAppointment.id ? { ...apt, notes: newNotes } : apt
            ));
            setRescheduleOpen(false);
        }
    };

    if (loading) {
        return <CenteredLoader />;
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
            <Container maxWidth="xl">
                <Paper sx={{ p: 4, mb: 4, bgcolor: 'background.paper' }}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Worker Dashboard
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                        {profile?.full_name || 'Worker'}
                    </Typography>
                    {salon && (
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                            {salon.name}
                        </Typography>
                    )}
                </Paper>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Schedule sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold">
                                            {appointments.filter(a => a.worker_id === workerData?.id && a.status !== 'completed' && a.status !== 'cancelled').length}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">My Active Appointments</Typography>
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

                <Paper sx={{ p: 2, bgcolor: 'transparent' }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>Task Board</Typography>
                    <KanbanBoard
                        appointments={appointments}
                        onStatusChange={handleStatusChange}
                        onReschedule={handleRescheduleClick}
                        currentWorkerId={workerData?.id}
                    />
                </Paper>

                {/* Reschedule Dialog */}
                <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)}>
                    <DialogTitle>Propose New Time</DialogTitle>
                    <DialogContent sx={{ minWidth: 300, pt: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                                <DateCalendar
                                    value={newDate}
                                    onChange={(val) => setNewDate(val)}
                                />
                                <TimePicker
                                    label="New Time"
                                    value={newTime}
                                    onChange={(val) => setNewTime(val)}
                                    ampm={true}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Box>
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={submitReschedule}>Propose</Button>
                    </DialogActions>
                </Dialog>

            </Container >
        </Box >
    );
}
