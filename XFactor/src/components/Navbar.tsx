import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setUserRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        setUserRole(data?.role || null);
    };

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
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <Button
                            onClick={() => navigate('/')}
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                                fontSize: '1rem',
                                '&:hover': {
                                    color: 'primary.main',
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            Home
                        </Button>

                        <Button
                            onClick={() => navigate('/salons')}
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                                fontSize: '1rem',
                                '&:hover': {
                                    color: 'primary.main',
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            Salons
                        </Button>

                        <Button
                            onClick={() => navigate('/about')}
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                                fontSize: '1rem',
                                '&:hover': {
                                    color: 'primary.main',
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            About
                        </Button>

                        {/* Show "My Bookings" for customers only */}
                        {user && userRole === 'customer' && (
                            <Button
                                onClick={() => navigate('/my-bookings')}
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'transparent',
                                    },
                                }}
                            >
                                My Bookings
                            </Button>
                        )}

                        {/* Show "Dashboard" for workers and admins only */}
                        {user && (userRole === 'worker' || userRole === 'admin') && (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    color: 'text.primary',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'transparent',
                                    },
                                }}
                            >
                                Dashboard
                            </Button>
                        )}

                        {user ? (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 2 }}>
                                <IconButton onClick={() => navigate(userRole === 'customer' ? '/my-bookings' : '/dashboard')}>
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                        {user.email?.charAt(0).toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleLogout}
                                    size="small"
                                >
                                    Logout
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
                                <Button
                                    variant="text"
                                    color="primary"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/book')}
                                >
                                    Book Now
                                </Button>
                            </Box>
                        )}

                        {/* Book Now for logged-in customers */}
                        {user && userRole === 'customer' && (
                            <Button
                                variant="contained"
                                onClick={() => navigate('/book')}
                            >
                                Book Now
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
