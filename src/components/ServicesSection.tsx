import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Card, CardContent, CardMedia, Box, Button, CircularProgress } from '@mui/material';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Service = Database['public']['Tables']['services']['Row'];

const MotionCard = motion.create(Card);

interface ServicesSectionProps {
    genderFilter: string | null;
}

export default function ServicesSection({ genderFilter }: ServicesSectionProps) {
    const navigate = useNavigate();
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    // Filter whenever services or genderFilter changes
    useEffect(() => {
        if (!genderFilter) {
            setFilteredServices(services);
        } else {
            setFilteredServices(services.filter(service =>
                service.target_gender === genderFilter || service.target_gender === 'unisex'
            ));
        }
    }, [services, genderFilter]);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setServices(data || []);
            // Initial filter will be handled by the useEffect above
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookService = (service: Service) => {
        navigate('/book', { state: { service } });
    };

    if (loading) {
        return (
            <Box sx={{ py: 12, bgcolor: 'background.default', display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 12, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{ mb: 4, fontWeight: 800, color: 'text.primary' }}
                    component={motion.h2}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Our Services
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    {filteredServices.map((service, index) => (
                        <Grid key={service.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <MotionCard
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05, duration: 0.5 }}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 30px rgba(255, 0, 0, 0.15)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                                onClick={() => handleBookService(service)}
                            >
                                <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                                    <CardMedia
                                        component={motion.div}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        sx={{
                                            pt: '75%', // Aspect ratio 4:3
                                            backgroundImage: `url(${service.image_url || 'https://images.unsplash.com/photo-1560066984-12186d305d4d?auto=format&fit=crop&q=80'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Typography gutterBottom variant="h6" component="h3" fontWeight="bold">
                                        {service.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {service.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                                            ₹{service.price.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {service.duration_minutes} min
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookService(service);
                                        }}
                                    >
                                        Book Now
                                    </Button>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>



                {filteredServices.length === 0 && !loading && (
                    <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
                        No services available at the moment.
                    </Typography>
                )}
            </Container>
        </Box >
    );
}
