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

const steps = ['Select Salon', 'Select Service', 'Select Professional', 'Date & Time', 'Confirm'];

const MotionPaper = motion(Paper);

export default function BookingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0); // Start at 0
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs().set('hour', 10).set('minute', 0));
    const [accessDenied, setAccessDenied] = useState(false);

    // Data State
    const [salons, setSalons] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);

    // Selection State
    const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [selectedWorker, setSelectedWorker] = useState<any | null>(null);

    // Initial Load: Check for pre-selected service from Home page
    useEffect(() => {
        if (location.state?.service) {
            const preService = location.state.service;
            setSelectedService(preService);
            // If service has a salon_id, we should try to find that salon and set it.
            // But we need to fetch salons first.
            // For now, let's just assume we fast-forward to Step 2 (Professional)
            // But we ideally need the salon context for the worker filter.
            setActiveStep(2);
        }
    }, [location.state]);

    // Fetch Salons on Mount
    useEffect(() => {
        const fetchSalons = async () => {
            const { data } = await supabase.from('salons').select('*').eq('is_active', true);
            if (data) setSalons(data);
        };
        fetchSalons();
    }, []);

    // Fetch Services when Salon Changes (or if starting from scratch)
    useEffect(() => {
        const fetchServices = async () => {
            let query = supabase.from('services').select('*').eq('is_active', true);

            // If we selected a salon, valid services are those at this salon OR global services (null salon_id)
            if (selectedSalon) {
                // RLS or Filter logic: salon_id is null OR salon_id = selectedSalon.id
                query = query.or(`salon_id.is.null,salon_id.eq.${selectedSalon.id}`);
            }

            const { data } = await query;
            if (data) setServices(data);
        };
        fetchServices();
    }, [selectedSalon]);


    // Fetch Workers when Salon IS Selected
    useEffect(() => {
        const fetchWorkers = async () => {
            let query = supabase
                .from('workers')
                .select(`
                    id, 
                    salon_id,
                    rating,
                    profile:profiles(full_name, avatar_url)
                `)
                .eq('is_available', true);

            // Filter by Salon
            if (selectedSalon) {
                query = query.eq('salon_id', selectedSalon.id);
            }

            // Note: If we pre-selected a service that belongs to a specific salon,
            // we should ideally enforce that salon selection.
            // For this iteration, if no salon is selected, we might show all workers? 
            // Or better, force salon selection first.

            const { data } = await query;
            if (data) setWorkers(data);
        };

        // Only fetch if step is appropriate or preparing
        fetchWorkers();
    }, [selectedSalon]);


    // Check User Role
    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return; // Allow guest to browse, prompt login at end

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile && profile.role !== 'customer') {
                setAccessDenied(true);
                setTimeout(() => navigate('/dashboard'), 3000);
            }
        };
        checkUserRole();
    }, [navigate]);


    if (accessDenied) {
        return (
            <Container maxWidth="md" sx={{ py: 12, pt: 15 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Access Restricted</Typography>
                    <Typography>Appointment booking is only available for customers.</Typography>
                    <Typography sx={{ mt: 2 }}>Redirecting to dashboard...</Typography>
                </Alert>
            </Container>
        );
    }

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            // CONFIRMATION STEP
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please login to book an appointment');
                navigate('/login');
                return;
            }

            const { error } = await supabase
                .from('appointments')
                .insert({
                    customer_id: user.id,
                    service_id: selectedService?.id,
                    salon_id: selectedSalon?.id, // Track Salon ID
                    worker_id: selectedWorker?.id || null,
                    appointment_date: selectedDate?.format('YYYY-MM-DD'),
                    start_time: selectedTime?.format('HH:mm'),
                    end_time: selectedTime?.add(selectedService?.duration_minutes || 60, 'minute').format('HH:mm'),
                    status: 'pending',
                    total_price: selectedService?.price,
                });

            if (error) {
                alert('Error booking: ' + error.message);
                return;
            }

            alert('Booking Confirmed!');
            navigate('/dashboard');
        } else {
            // Validation before moving next
            if (activeStep === 0 && !selectedSalon) return alert('Please select a salon');
            if (activeStep === 1 && !selectedService) return alert('Please select a service');

            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    return (
        <Box sx={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'grid', placeItems: 'center', zIndex: 1, pt: '80px', overflow: 'auto', px: 2
        }}>
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Typography variant="h2" align="center" gutterBottom fontWeight="800">
                    Book Appointment
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 8 }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                <MotionPaper
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    {/* STEP 0: SELECT SALON */}
                    {activeStep === 0 && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                Select a Salon
                            </Typography>
                            <Grid container spacing={2}>
                                {salons.map((salon) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={salon.id}>
                                        <Paper
                                            onClick={() => setSelectedSalon(salon)}
                                            sx={{
                                                p: 3,
                                                cursor: 'pointer',
                                                border: selectedSalon?.id === salon.id ? '2px solid #FF0000' : '1px solid rgba(255,255,255,0.1)',
                                                bgcolor: selectedSalon?.id === salon.id ? 'rgba(255,0,0,0.1)' : 'background.paper'
                                            }}
                                        >
                                            <Typography variant="h6">{salon.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{salon.city}, {salon.state}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* STEP 1: SELECT SERVICE */}
                    {activeStep === 1 && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                Select a Service
                            </Typography>
                            <Grid container spacing={2}>
                                {services.map((svc) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={svc.id}>
                                        <Paper
                                            onClick={() => setSelectedService(svc)}
                                            sx={{
                                                p: 3,
                                                cursor: 'pointer',
                                                border: selectedService?.id === svc.id ? '2px solid #FF0000' : '1px solid rgba(255,255,255,0.1)',
                                                bgcolor: selectedService?.id === svc.id ? 'rgba(255,0,0,0.1)' : 'background.paper'
                                            }}
                                        >
                                            <Typography variant="h6">{svc.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {svc.duration_minutes} min • ₹{svc.price}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                            {services.length === 0 && <Typography align="center">No services found for this salon.</Typography>}
                        </Box>
                    )}

                    {/* STEP 2: SELECT PROFESSIONAL */}
                    {activeStep === 2 && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                Select a Professional
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Paper
                                        onClick={() => setSelectedWorker(null)}
                                        sx={{
                                            p: 3, textAlign: 'center', cursor: 'pointer',
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
                                                p: 3, textAlign: 'center', cursor: 'pointer',
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
                            {workers.length === 0 && <Typography align="center" sx={{ mt: 2 }}>No specific professionals found at this location.</Typography>}
                        </Box>
                    )}

                    {/* STEP 3: DATE & TIME */}
                    {activeStep === 3 && (
                        <Box>
                            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                Schedule for <span style={{ color: '#FF0000' }}>{selectedService?.name}</span>
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
                                                    bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #333',
                                                    width: '100%', maxWidth: '100%'
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
                                                    slotProps={{ textField: { fullWidth: true, sx: { '& .MuiInputBase-root': { bgcolor: 'background.paper' } } } }}
                                                />
                                            </Box>
                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
                                                <TextField
                                                    fullWidth multiline rows={4}
                                                    placeholder="Any specific instructions?"
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </LocalizationProvider>
                        </Box>
                    )}

                    {/* STEP 4: CONFIRM */}
                    {activeStep === 4 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                Confirm Booking
                            </Typography>
                            <Box sx={{ my: 4, p: 3, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Salon</Typography>
                                        <Typography variant="h6">{selectedSalon?.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{selectedSalon?.address}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Service</Typography>
                                        <Typography variant="h6">{selectedService?.name}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Professional</Typography>
                                        <Typography variant="h6">{selectedWorker ? selectedWorker.profile.full_name : 'Any Professional'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                                        <Typography variant="h6">
                                            {selectedDate?.format('ddd, MMM D')} at {selectedTime?.format('h:mm A')}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Total Estimate</Typography>
                                        <Typography variant="h6" color="primary.main">₹{selectedService?.price.toFixed(2)}</Typography>
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
