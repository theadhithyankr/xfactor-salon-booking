import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Grid, Card, CardContent, CardMedia, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { LocationOn, Phone, AccessTime } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Salon = Database['public']['Tables']['salons']['Row'];

const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    const formattedMinute = m < 10 ? `0${m}` : m;
    return `${formattedHour}:${formattedMinute} ${ampm}`;
};

export default function Salons() {
    const [salons, setSalons] = useState<Salon[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleCardClick = (salonId: string) => {
        navigate(`/salons/${salonId}`);
    };

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        try {
            const { data, error } = await supabase
                .from('salons')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setSalons(data || []);
        } catch (error) {
            console.error('Error fetching salons:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
            }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100dvh',
            pt: '80px',
            pb: 4,
            px: { xs: 2, md: 4 },
            bgcolor: 'background.default'
        }}>
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h2" gutterBottom fontWeight="bold" align="center" sx={{ mb: 6 }}>
                        Our <span style={{ color: '#FF0000' }}>Salons</span>
                    </Typography>

                    {salons.length === 0 ? (
                        <Paper sx={{ p: 6, textAlign: 'center' }}>
                            <Typography variant="h5" color="text.secondary">
                                No salons available at the moment.
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                We're working on adding more locations. Check back soon!
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={4}>
                            {salons.map((salon, index) => (
                                <Grid key={salon.id} size={{ xs: 12, md: 6 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{ height: '100%' }}
                                    >
                                        <Card sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 24px rgba(255, 0, 0, 0.15)',
                                            },
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => handleCardClick(salon.id)}>
                                            <CardMedia
                                                sx={{ height: 200 }}
                                                image={salon.image_url || 'https://images.unsplash.com/photo-1521590832896-bc78b4bdc03c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                                                title={salon.name}
                                            />
                                            <CardContent sx={{ p: 4, flexGrow: 1 }}>
                                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                                    {salon.name}
                                                </Typography>

                                                {salon.description && (
                                                    <Typography variant="body1" color="text.secondary" paragraph>
                                                        {salon.description}
                                                    </Typography>
                                                )}

                                                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LocationOn color="primary" />
                                                        <Typography variant="body1">
                                                            {salon.address}, {salon.city}
                                                            {salon.state && `, ${salon.state}`}
                                                            {salon.zip_code && ` - ${salon.zip_code}`}
                                                        </Typography>
                                                    </Box>

                                                    {salon.phone && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Phone color="primary" />
                                                            <Typography variant="body1">{salon.phone}</Typography>
                                                        </Box>
                                                    )}

                                                    {salon.opening_time && salon.closing_time && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <AccessTime color="primary" />
                                                            <Typography variant="body1">
                                                                {formatTime(salon.opening_time)} - {formatTime(salon.closing_time)}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </motion.div>
            </Container>
        </Box>
    );
}
