import { Box, Typography, Button, Container, Stack } from '@mui/material';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <Box
            sx={{
                position: 'relative',
                height: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2036&auto=format&fit=crop)', // High quality dark salon interior
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.3) saturate(1.2)', // Darken and saturate
                    zIndex: -1,
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '200px',
                    background: 'linear-gradient(to top, #0F0F12, transparent)',
                    zIndex: -1,
                }
            }}
        >
            <Container maxWidth="lg">
                <Stack spacing={4} maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <Typography
                            variant="h1"
                            color="white"
                            sx={{
                                fontWeight: 800,
                                textShadow: '0 0 40px rgba(0,0,0,0.5)',
                                mb: 2
                            }}
                        >
                            Redefine Your <br />
                            <Box component="span" sx={{
                                background: 'linear-gradient(45deg, #FF0000 30%, #FFFFFF 90%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Unique Style.
                            </Box>
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '600px', mb: 4, lineHeight: 1.6 }}>
                            Book appointments with the city's top-rated stylists and salons.
                            Experience premium care tailored just for you.
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    >
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    fontSize: '1.2rem',
                                    px: 4, py: 1.5,
                                }}
                            >
                                Book Appointment
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                color="inherit" // White outline
                                sx={{
                                    fontSize: '1.2rem',
                                    px: 4, py: 1.5,
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: 'white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Explore Salons
                            </Button>
                        </Stack>
                    </motion.div>
                </Stack>
            </Container>
        </Box>
    );
}
