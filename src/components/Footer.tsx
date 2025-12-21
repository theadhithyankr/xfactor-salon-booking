
import { Box, Container, Typography, Grid, IconButton } from '@mui/material';
import { Facebook, Instagram, LinkedIn, X } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Footer() {
    const location = useLocation();
    const isHidden = location.pathname === '/dashboard' || location.pathname.startsWith('/admin');

    const [content, setContent] = useState({
        desc: 'Premium salon experiences tailored just for you. Book your appointment today and discover the new you.',
        address: '123 Fashion Street, Style District, Kochi, Kerala 682001',
        phone: '+91 98765 43210',
        email: 'support@xfactor.com',
        social_facebook: 'https://facebook.com',
        social_x: 'https://x.com',
        social_instagram: 'https://instagram.com',
        social_linkedin: 'https://linkedin.com'
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        const { data } = await supabase
            .from('app_content')
            .select('*');

        if (data) {
            const newContent = { ...content };
            data.forEach((item: any) => {
                if (item.key === 'footer_desc') newContent.desc = item.value;
                if (item.key === 'footer_address') newContent.address = item.value;
                if (item.key === 'footer_phone') newContent.phone = item.value;
                if (item.key === 'footer_email') newContent.email = item.value;
                if (item.key === 'social_facebook') newContent.social_facebook = item.value;
                if (item.key === 'social_x') newContent.social_x = item.value;
                if (item.key === 'social_instagram') newContent.social_instagram = item.value;
                if (item.key === 'social_linkedin') newContent.social_linkedin = item.value;
            });
            setContent(newContent);
        }
    };

    if (isHidden) return null;

    return (
        <Box component="footer" sx={{
            bgcolor: 'background.paper',
            color: 'text.secondary',
            py: 6,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 'auto'
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand Section */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 2 }}>
                            XFactor
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
                            {content.desc}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {content.social_facebook && (
                                <IconButton component="a" href={content.social_facebook} target="_blank" aria-label="Facebook" sx={{ color: '#1877F2' }}>
                                    <Facebook />
                                </IconButton>
                            )}
                            {content.social_x && (
                                <IconButton component="a" href={content.social_x} target="_blank" aria-label="X (Twitter)" sx={{ color: '#000000' }}>
                                    <X />
                                </IconButton>
                            )}
                            {content.social_instagram && (
                                <IconButton component="a" href={content.social_instagram} target="_blank" aria-label="Instagram" sx={{ color: '#E4405F' }}>
                                    <Instagram />
                                </IconButton>
                            )}
                            {content.social_linkedin && (
                                <IconButton component="a" href={content.social_linkedin} target="_blank" aria-label="LinkedIn" sx={{ color: '#0A66C2' }}>
                                    <LinkedIn />
                                </IconButton>
                            )}
                        </Box>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 3 }}>
                            Quick Links
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>Home</Typography>
                            </Link>
                            <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>About Us</Typography>
                            </Link>
                            <Link to="/salons" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>Find a Salon</Typography>
                            </Link>
                            <Link to="/book" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography variant="body2" sx={{ '&:hover': { color: 'primary.main' } }}>Book Now</Typography>
                            </Link>
                        </Box>
                    </Grid>

                    {/* Contact Info */}
                    <Grid size={{ xs: 6, md: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 3 }}>
                            Contact Us
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body2">
                                <strong>Address:</strong><br />
                                {content.address}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Phone:</strong><br />
                                {content.phone}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Email:</strong><br />
                                {content.email}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{
                    mt: 6,
                    pt: 3,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                }}>
                    <Typography variant="body2" color="text.disabled">
                        © {new Date().getFullYear()} XFactor Salons. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
