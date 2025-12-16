import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <AppBar position="fixed" color="inherit" elevation={0} sx={{ top: 0 }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ height: 80 }}>
                    {/* Logo */}
                    <Typography
                        variant="h4"
                        noWrap
                        component={motion.div}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #FF0000 30%, #FFFFFF 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer',
                            letterSpacing: '-1px',
                        }}
                        onClick={() => navigate('/')}
                    >
                        XFactor
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Nav Items */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {['Services', 'Salons', 'About'].map((item, index) => (
                            <Button
                                key={item}
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'transparent',
                                    },
                                }}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {item}
                            </Button>
                        ))}
                        {user && (
                            <Button
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    fontSize: '0.95rem',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'transparent',
                                    },
                                }}
                            >
                                Dashboard
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ ml: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {user.email?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleLogout}
                                    component={motion.button}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="text"
                                    color="primary"
                                    component={motion.button}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.href = '/login'}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="contained"
                                    component={motion.button}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.location.href = '/book'}
                                >
                                    Book Now
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
