import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Paper, Grid, Button,
    TextField, Stack, Step, Stepper, StepLabel, Alert
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const steps = ['Select Service', 'Select Professional', 'Date & Time', 'Confirm'];

const MotionPaper = motion(Paper);

export default function BookingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs().set('hour', 10).set('minute', 0));
    const [accessDenied, setAccessDenied] = useState(false);

    // New state for worker selection
    const [workers, setWorkers] = useState<any[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<any | null>(null);

    // Get service from navigation state
    const service = location.state?.service || null;
    const serviceName = service?.name || 'General Service';
    const servicePrice = service?.price || 0;
    const serviceDuration = service?.duration_minutes || 60;

    // Fetch workers on mount
    useEffect(() => {
        const fetchWorkers = async () => {
            // In a real app, we might filter by salon_id if passed in state, or service capabilities.
            const { data } = await supabase
                .from('workers')
                .select(`
                    id, 
                    rating,
                    profile:profiles(full_name, avatar_url)
                `)
                .eq('is_available', true);

            if (data) {
                setWorkers(data);
            }
        };
        fetchWorkers();
    }, []);

    // ... (keep checkUserRole effect) ...

    const checkUserRole = async () => {
        // ... (keep existing logic)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Not logged in - allow them to proceed, will be caught at booking time
            return;
        }

        // Fetch user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile && profile.role !== 'customer') {
            setAccessDenied(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        }
    };

    useEffect(() => {
        checkUserRole();
    }, [navigate]);

    if (accessDenied) {
        // ... (keep existing access denied UI)
        return (
            <Container maxWidth="md" sx={{ py: 12, pt: 15 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Access Restricted</Typography>
                    <Typography>
                        Appointment booking is only available for customers.
                        {' '}Workers and admins cannot book appointments.
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Redirecting to your dashboard...
                    </Typography>
                </Alert>
            </Container>
        );
    }

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            // Check for user login
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please login to book an appointment');
                navigate('/login');
                return;
            }

            // Insert into Supabase
            const { error } = await supabase
                .from('appointments')
                .insert({
                    customer_id: user.id,
                    service_id: service?.id || null,
                    worker_id: selectedWorker?.id || null, // Add selected worker ID
                    appointment_date: selectedDate?.format('YYYY-MM-DD'),
                    start_time: selectedTime?.format('HH:mm'),
                    end_time: selectedTime?.add(serviceDuration, 'minute').format('HH:mm'),
                    status: 'pending',
                    total_price: servicePrice,
                });

            if (error) {
                alert('Error booking appointment: ' + error.message);
                return;
            }

            alert('Booking Confirmed! You can view it in your dashboard.');
            navigate('/dashboard');
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

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
            px: 2
        }}>
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography variant="h2" align="center" gutterBottom fontWeight="800">
                    Book Appointment
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 8 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <MotionPaper
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    {activeStep === 0 && (
                        <Box>
                            <Typography variant="h5" gutterBottom>Select a Service</Typography>
                            <Typography color="text.secondary">
                                Please go back to the home page to select a service. (This checks strictly for flow)
                            </Typography>
                            <Button onClick={() => navigate('/')} sx={{ mt: 2 }} variant="outlined">
                                Back to Home
                            </Button>
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                Select a Professional
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper
                                        onClick={() => setSelectedWorker(null)}
                                        sx={{
                                            p: 3,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: selectedWorker === null ? '2px solid #FF0000' : '1px solid rgba(255,255,255,0.1)',
                                            bgcolor: selectedWorker === null ? 'rgba(255,0,0,0.1)' : 'background.paper'
                                        }}
                                    >
                                        <Typography variant="h6">Any Professional</Typography>
                                        <Typography variant="body2" color="text.secondary">Maximum availability</Typography>
                                    </Paper>
                                </Grid>
                                {workers.map((worker) => (
                                    <Grid size={{ xs: 12, md: 4 }} key={worker.id}>
                                        <Paper
                                            onClick={() => setSelectedWorker(worker)}
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                border: selectedWorker?.id === worker.id ? '2px solid #FF0000' : '1px solid rgba(255,255,255,0.1)',
                                                bgcolor: selectedWorker?.id === worker.id ? 'rgba(255,0,0,0.1)' : 'background.paper'
                                            }}
                                        >
                                            <Typography variant="h6">{worker.profile?.full_name || 'Worker'}</Typography>
                                            <Typography variant="body2" color="text.secondary">Rating: {worker.rating || 'New'}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {activeStep === 2 && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                Schedule for <span style={{ color: '#FF0000' }}>{serviceName}</span>
                            </Typography>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Grid container spacing={4}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="subtitle1" gutterBottom>Select Date</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <DateCalendar
                                                value={selectedDate}
                                                onChange={(newValue) => setSelectedDate(newValue)}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 2,
                                                    border: '1px solid #333',
                                                    width: '100%',
                                                    maxWidth: '100%'
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box>
                                                <Typography variant="subtitle1" gutterBottom>Select Time</Typography>
                                                <TimePicker
                                                    label="Time"
                                                    value={selectedTime}
                                                    onChange={(newValue) => setSelectedTime(newValue)}
                                                    ampm={true}
                                                    slotProps={{
                                                        textField: {
                                                            fullWidth: true,
                                                            sx: {
                                                                '& .MuiInputBase-root': {
                                                                    bgcolor: 'background.paper'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Notes
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    placeholder="Any specific instructions? (e.g., sensitive skin, specific style)"
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </LocalizationProvider>
                        </Box>
                    )}

                    {activeStep === 3 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                Confirm Booking
                            </Typography>
                            <Box sx={{ my: 4, p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Service</Typography>
                                        <Typography variant="h6">{serviceName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Professional</Typography>
                                        <Typography variant="h6">{selectedWorker ? selectedWorker.profile.full_name : 'Any Professional'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Date</Typography>
                                        <Typography variant="h6">{selectedDate?.format('dddd, MMMM D, YYYY')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Time</Typography>
                                        <Typography variant="h6">{selectedTime?.format('h:mm A')}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Total Estimate</Typography>
                                        <Typography variant="h6" color="primary.main">₹{servicePrice.toFixed(2)}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            size="large"
                            sx={{ px: 6 }}
                        >
                            {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
                        </Button>
                    </Box>
                </MotionPaper>
            </Container>
        </Box>
    );
}
