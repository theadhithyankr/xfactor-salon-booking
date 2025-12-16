import { Container, Grid, Typography, Card, CardContent, CardMedia, Box } from '@mui/material';
import { motion } from 'framer-motion';

const services = [
    {
        id: 1,
        title: 'Hair Cutting',
        description: 'Expert styling tailored to your face shape and lifestyle.',
        image: 'https://images.unsplash.com/photo-1599351431202-6e0c06e7afbb?auto=format&fit=crop&q=80',
    },
    {
        id: 2,
        title: 'Shaving',
        description: 'Classic clean shaves with hot towel treatment.',
        image: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80',
    },
    {
        id: 3,
        title: 'Hair Cutting + Shaving',
        description: 'The complete grooming package for a fresh look.',
        image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80',
    },
    {
        id: 4,
        title: 'Face Massage',
        description: 'Relaxing massage to rejuvenate your skin.',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80',
    },
    {
        id: 5,
        title: 'Head Massage',
        description: 'Relieve stress with our therapeutic head massage.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac927accc9?auto=format&fit=crop&q=80',
    },
    {
        id: 6,
        title: 'Hair Wash',
        description: 'Deep cleansing wash with premium conditioners.',
        image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&q=80',
    },
    {
        id: 7,
        title: 'Beard Designing',
        description: 'Sculpt and shape your beard to perfection.',
        image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80',
    },
    {
        id: 8,
        title: 'Threading',
        description: 'Precise hair removal for eyebrows and face.',
        image: 'https://images.unsplash.com/photo-1560066984-12186d305d4d?auto=format&fit=crop&q=80',
    },
    {
        id: 9,
        title: 'Henna',
        description: 'Traditional and conditioning henna treatments.',
        image: 'https://images.unsplash.com/photo-1556760544-74068565f05c?auto=format&fit=crop&q=80',
    },
    {
        id: 10,
        title: 'Hair Colouring',
        description: 'Streax, Loreal, Fruits, Garnier - your choice of style.',
        image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&q=80',
    },
    {
        id: 11,
        title: 'Hair Spa',
        description: 'Luxurious Loreal spa treatment for healthy hair.',
        image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80',
    },
    {
        id: 12,
        title: 'Bleach',
        description: 'Skin brightening bleach treatments.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80',
    },
    {
        id: 13,
        title: 'Clean Up',
        description: '2-step or 3-step deep pore cleansing.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80',
    },
    {
        id: 14,
        title: 'Facial',
        description: 'Papaya, VLCC, Gold - premium facials for glow.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80', // Recurring spa image
    },
    {
        id: 15,
        title: 'Scrub Massage',
        description: 'Exfoliating scrub with relaxing massage.',
        image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80',
    },
    {
        id: 16,
        title: 'Hair Straightening',
        description: 'Silky smooth straightening with Loreal products.',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80',
    },
    {
        id: 17,
        title: 'Highlight Colouring',
        description: 'Add dimension with expert highlights.',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80',
    },
    {
        id: 18,
        title: 'Baby Hair Cutting',
        description: 'Gentle and care-filled haircuts for little ones.',
        image: 'https://images.unsplash.com/photo-1620331313174-d73136453180?auto=format&fit=crop&q=80',
    },
];

const MotionCard = motion(Card);

export default function ServicesSection() {
    return (
        <Box sx={{ py: 12, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                <Typography
                    variant="h2"
                    align="center"
                    gutterBottom
                    sx={{ mb: 6, fontWeight: 800, color: 'text.primary' }}
                    component={motion.h2}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Our Services
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    {services.map((service, index) => (
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
                                    borderRadius: 4,
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 30px rgba(255, 0, 0, 0.15)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                            >
                                <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                                    <CardMedia
                                        component={motion.div}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        sx={{
                                            pt: '75%', // Aspect ratio 4:3
                                            backgroundImage: `url(${service.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Typography gutterBottom variant="h6" component="h3" fontWeight="bold">
                                        {service.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {service.description}
                                    </Typography>

                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
