import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Paper, Grid, Button,
    TextField, Stack, Step, Stepper, StepLabel, Alert, Chip
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import dayjs, { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const steps = ['Select Salon', 'Select Services', 'Select Professional', 'Date & Time', 'Confirm'];

const MotionPaper = motion(Paper);

export default function BookingPage() {
    const location = useLocation();
    // Force Re-render
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0); // Start at 0
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs().set('hour', 10).set('minute', 0));
    const [accessDenied, setAccessDenied] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Data State
    const [salons, setSalons] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);

    // Selection State
    const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
    const [selectedServices, setSelectedServices] = useState<any[]>([]); // Array for multiple services
    const [selectedWorker, setSelectedWorker] = useState<any | null>(null);

    // Initial Load: Check for pre-selected service from Home page
    useEffect(() => {
        if (location.state?.service) {
            const preService = location.state.service;
            setSelectedServices([preService]); // Add to array
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

    const toggleService = (service: any) => {
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const getTotalDuration = () => {
        return selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
    };

    const getTotalPrice = () => {
        return selectedServices.reduce((sum, s) => sum + s.price, 0);
    };

    const checkAvailability = async () => {
        if (!selectedSalon || !selectedDate || !selectedTime) return false;

        const totalDuration = getTotalDuration();

        // 1. Check Salon Hours
        if (selectedSalon.opening_time && selectedSalon.closing_time) {
            const timeStr = selectedTime.format('HH:mm:ss');
            // Check end time of the ENTIRE duration
            const endTime = selectedTime.add(totalDuration, 'minute').format('HH:mm:ss');

            const opening = selectedSalon.opening_time;
            const closing = selectedSalon.closing_time;

            if (timeStr < opening || endTime > closing) {
                const open12 = dayjs(opening, 'HH:mm:ss').format('h:mm A');
                const close12 = dayjs(closing, 'HH:mm:ss').format('h:mm A');
                alert(`Please select a time range between ${open12} and ${close12}. Your total service time is ${totalDuration} mins.`);
                return false;
            }
        }

        // 2. Check Worker Availability (Conflict)
        if (selectedWorker) {
            const startStr = selectedTime.format('HH:mm:ss');
            const endStr = selectedTime.add(totalDuration, 'minute').format('HH:mm:ss');
            const dateStr = selectedDate.format('YYYY-MM-DD');

            const { data: conflicts } = await supabase
                .from('appointments')
                .select('id')
                .eq('worker_id', selectedWorker.id)
                .eq('appointment_date', dateStr)
                .or(`and(start_time.lte.${startStr},end_time.gt.${startStr}),and(start_time.lt.${endStr},end_time.gte.${endStr})`);

            if (conflicts && conflicts.length > 0) {
                alert('This professional is already booked at this time. Please choose another slot.');
                return false;
            }
        }

        return true;
    };

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            // CONFIRMATION STEP
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please login to book an appointment');
                navigate('/login');
                return;
            }

            // Create Sequential Appointments
            let currentStartTime = selectedTime;

            for (const service of selectedServices) {
                if (!currentStartTime) break; // Should not happen

                // Calculate End Time for THIS service
                const serviceDuration = service.duration_minutes || 60;
                const endTime = currentStartTime.add(serviceDuration, 'minute');

                const { error } = await supabase
                    .from('appointments')
                    .insert({
                        customer_id: user.id,
                        service_id: service.id,
                        salon_id: selectedSalon?.id,
                        worker_id: selectedWorker?.id || null,
                        appointment_date: selectedDate?.format('YYYY-MM-DD'),
                        start_time: currentStartTime.format('HH:mm'),
                        end_time: endTime.format('HH:mm'),
                        status: 'pending',
                        total_price: service.price,
                        notes: `Sequential booking. ${selectedServices.length > 1 ? '(Multi-service)' : ''}`
                    });

                if (error) {
                    alert('Error booking service: ' + service.name + '. ' + error.message);
                    return;
                }

                // Advance start time for next service
                currentStartTime = endTime;
            }

            setBookingSuccess(true);
        } else {
            // Validation before moving next
            if (activeStep === 0 && !selectedSalon) return alert('Please select a salon');
            if (activeStep === 1 && selectedServices.length === 0) return alert('Please select at least one service');
            if (activeStep === 3) {
                const isAvailable = await checkAvailability();
                if (!isAvailable) return;
            }

            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    return (
        <Box sx={{
            minHeight: '100dvh',
            width: '100dvw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            pt: { xs: '80px', md: '100px' },
            pb: { xs: '100px', md: 4 }, // Extra padding for sticky footer on mobile
            bgcolor: 'background.default'
        }}>
            <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 3 } }}>
                {!bookingSuccess && (
                    <>
                        <Typography variant="h3" align="center" gutterBottom fontWeight="800" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                            Book Appointment
                        </Typography>

                        {/* Desktop Stepper */}
                        <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 8 }}>
                            <Stepper activeStep={activeStep} alternativeLabel>
                                {steps.map((label) => (
                                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                                ))}
                            </Stepper>
                        </Box>

                        {/* Mobile Step Indicator - REMOVED (Replaced by MobileStepper at bottom) */}
                    </>
                )}

                <MotionPaper
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    sx={{
                        p: { xs: 2, md: 4 },
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {bookingSuccess ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2, color: '#4caf50' }} />
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                Booking Successful!
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                Your appointments have been scheduled sequentially. <br />
                                You can view them in your dashboard.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/dashboard')}
                                sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
                            >
                                Go to Dashboard
                            </Button>
                        </Box>
                    ) : (
                        <>
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
                                                        border: selectedSalon?.id === salon.id ? '2px solid #FF0000' : '1px solid rgba(0,0,0,0.1)',
                                                        bgcolor: selectedSalon?.id === salon.id ? 'rgba(255,0,0,0.05)' : 'background.paper',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { transform: 'scale(1.02)' }
                                                    }}
                                                    elevation={selectedSalon?.id === salon.id ? 4 : 1}
                                                >
                                                    <Typography variant="h6">{salon.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{salon.city}, {salon.state}</Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* STEP 1: SELECT SERVICES (Multiple) */}
                            {activeStep === 1 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
                                        Select Services
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                                        Click to select multiple services
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {services.map((svc) => {
                                            const isSelected = selectedServices.some(s => s.id === svc.id);
                                            return (
                                                <Grid size={{ xs: 12, md: 6 }} key={svc.id}>
                                                    <Paper
                                                        onClick={() => toggleService(svc)}
                                                        sx={{
                                                            p: 2,
                                                            cursor: 'pointer',
                                                            border: isSelected ? '2px solid #FF0000' : '1px solid rgba(0,0,0,0.1)',
                                                            bgcolor: isSelected ? 'rgba(255,0,0,0.05)' : 'background.paper',
                                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        elevation={isSelected ? 4 : 1}
                                                    >
                                                        <Box>
                                                            <Typography variant="h6" fontSize="1rem">{svc.name}</Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {svc.duration_minutes} min • ₹{svc.price}
                                                            </Typography>
                                                        </Box>
                                                        {isSelected && <Chip label="Selected" color="primary" size="small" />}
                                                    </Paper>
                                                </Grid>
                                            );
                                        })}
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
                                                    border: selectedWorker === null ? '2px solid #FF0000' : '1px solid rgba(0,0,0,0.1)',
                                                    bgcolor: selectedWorker === null ? 'rgba(255,0,0,0.05)' : 'background.paper'
                                                }}
                                                elevation={selectedWorker === null ? 4 : 1}
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
                                                        border: selectedWorker?.id === worker.id ? '2px solid #FF0000' : '1px solid rgba(0,0,0,0.1)',
                                                        bgcolor: selectedWorker?.id === worker.id ? 'rgba(255,0,0,0.05)' : 'background.paper'
                                                    }}
                                                    elevation={selectedWorker?.id === worker.id ? 4 : 1}
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
                                        Schedule
                                    </Typography>
                                    <Typography align="center" variant="subtitle1" sx={{ mb: 2 }}>
                                        Duration: {getTotalDuration()} mins
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
                                                        <Typography variant="subtitle1" gutterBottom>Select Start Time</Typography>
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
                                    <Box sx={{ my: 4, p: 3, bgcolor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2, display: 'inline-block', textAlign: 'left', minWidth: { xs: '100%', md: '400px' } }}>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Salon</Typography>
                                                <Typography variant="h6">{selectedSalon?.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{selectedSalon?.address}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Selected Services</Typography>
                                                {selectedServices.map((s) => (
                                                    <Typography key={s.id} variant="body1">• {s.name} ({s.duration_minutes}m)</Typography>
                                                ))}
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
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Duration: {getTotalDuration()} mins
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Total Estimate</Typography>
                                                <Typography variant="h6" color="primary.main">₹{getTotalPrice().toFixed(2)}</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Box>
                            )}

                            {/* Desktop Buttons */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', mt: 6, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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

                            {/* Mobile Stepper (Standard MUI Component) */}
                            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                <MobileStepper
                                    variant="dots"
                                    steps={steps.length}
                                    position="bottom"
                                    activeStep={activeStep}
                                    sx={{ bgcolor: 'background.paper', borderTop: '1px solid rgba(0,0,0,0.1)' }}
                                    nextButton={
                                        <Button
                                            size="small"
                                            onClick={handleNext}
                                            disabled={activeStep === steps.length} // logic might need tweak if logic is same as handleNext checks
                                        >
                                            {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
                                            <KeyboardArrowRight />
                                        </Button>
                                    }
                                    backButton={
                                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                            <KeyboardArrowLeft />
                                            Back
                                        </Button>
                                    }
                                />
                            </Box>
                        </>
                    )}
                </MotionPaper>
            </Container>
        </Box>
    );
}
