import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';

export default function About() {
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
                            XFactor is a modern salon booking platform designed to make your grooming experience seamless and enjoyable.
                            We connect customers with skilled professionals, offering a wide range of services from classic haircuts to
                            premium spa treatments.
                        </Typography>

                        <Grid container spacing={4} sx={{ mt: 4 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">18+</Typography>
                                    <Typography variant="h6" color="text.secondary">Services</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">100%</Typography>
                                    <Typography variant="h6" color="text.secondary">Satisfaction</Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">24/7</Typography>
                                    <Typography variant="h6" color="text.secondary">Support</Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 6 }}>
                            <Typography variant="h5" gutterBottom fontWeight="bold">Our Mission</Typography>
                            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                To revolutionize the salon industry by providing a platform that makes booking appointments
                                effortless, transparent, and convenient for both customers and service providers.
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
