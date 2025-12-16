import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Corrected import
import {
    Container, Typography, Box, Paper, Grid, Button,
    TextField, Stack, Step, Stepper, StepLabel
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';

const steps = ['Select Service', 'Date & Time', 'Confirm'];

const MotionPaper = motion(Paper);

export default function BookingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1); // Start at step 1 since service is "selected" via navigation or default
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs().set('hour', 10).set('minute', 0));

    // Mock data - in real app would come from DB
    const serviceName = location.state?.serviceName || 'General Service';

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // Handle booking submission
            alert('Booking Confirmed! (Mock)');
            navigate('/');
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    return (
        <Container maxWidth="md" sx={{ py: 12 }}>
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
                        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                            Schedule for <span style={{ color: '#FF0000' }}>{serviceName}</span>
                        </Typography>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle1" gutterBottom>Select Date</Typography>
                                    <Paper sx={{ p: 0, bgcolor: 'transparent' }}>
                                        <DateCalendar
                                            value={selectedDate}
                                            onChange={(newValue) => setSelectedDate(newValue)}
                                            sx={{
                                                bgcolor: 'background.paper',
                                                borderRadius: 2,
                                                border: '1px solid #333'
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle1" gutterBottom>Select Time</Typography>
                                    <TimePicker
                                        label="Time"
                                        value={selectedTime}
                                        onChange={(newValue) => setSelectedTime(newValue)}
                                        sx={{ width: '100%' }}
                                    />

                                    <Box sx={{ mt: 4 }}>
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
                                </Grid>
                            </Grid>
                        </LocalizationProvider>
                    </Box>
                )}

                {activeStep === 2 && (
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
                                    <Typography variant="caption" color="text.secondary">Date</Typography>
                                    <Typography variant="h6">{selectedDate?.format('dddd, MMMM D, YYYY')}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Time</Typography>
                                    <Typography variant="h6">{selectedTime?.format('h:mm A')}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Total Estimate</Typography>
                                    <Typography variant="h6" color="primary.main">$50.00</Typography>
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
    );
}
