import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function About() {
    const [stats, setStats] = useState({
        services: '0+',
        satisfaction: '100%',
        support: '24/7'
    });

    const [textContent, setTextContent] = useState({
        intro: 'Loading...',
        mission: 'Loading...'
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        // Fetch dynamic content
        const { data } = await supabase
            .from('app_content')
            .select('*');

        const newStats = {
            services: '18+',
            satisfaction: '100%',
            support: '24/7'
        };

        const newText = {
            intro: '',
            mission: ''
        };

        if (data) {
            data.forEach((item: any) => {
                if (item.key === 'stat_services') newStats.services = item.value;
                if (item.key === 'stat_satisfaction') newStats.satisfaction = item.value;
                if (item.key === 'stat_support') newStats.support = item.value;
                if (item.key === 'text_intro') newText.intro = item.value;
                if (item.key === 'text_mission') newText.mission = item.value;
            });
        }

        setStats(newStats);
        setTextContent(newText);
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
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper sx={{ p: 6, borderRadius: 4 }}>
                        <Typography variant="h2" gutterBottom fontWeight="bold" align="center" sx={{ mb: 4 }}>
                            About <span style={{ color: '#FF0000' }}>XFactor</span>
                        </Typography>

                        <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
                            Your Premium Salon Booking Experience
                        </Typography>

                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                            {textContent.intro || "XFactor is a modern salon booking platform..."}
                        </Typography>

                        <Grid container spacing={4} sx={{ mt: 4 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.services}</Typography>
                                    <Typography variant="h6" color="text.secondary">Services</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.satisfaction}</Typography>
                                    <Typography variant="h6" color="text.secondary">Satisfaction</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">{stats.support}</Typography>
                                    <Typography variant="h6" color="text.secondary">Support</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h5" gutterBottom fontWeight="bold">Our Mission</Typography>
                            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                {textContent.mission || "To revolutionize the salon industry..."}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h5" gutterBottom fontWeight="bold">Why Choose Us?</Typography>
                            <Typography variant="body1" component="div" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    <li>Expert stylists and professionals</li>
                                    <li>Premium quality products (Loreal, VLCC, Streax)</li>
                                    <li>Easy online booking system</li>
                                    <li>Competitive pricing</li>
                                    <li>Hygienic and modern facilities</li>
                                </ul>
                            </Typography>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
}
