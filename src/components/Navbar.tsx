import { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, Container, Avatar, IconButton,
    Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon, Home, Store, Info, CalendarMonth, Dashboard as DashboardIcon, Login, Logout, Spa, People, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { mode, toggleColorMode } = useThemeContext();

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
        setMobileOpen(false);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: 'Home', path: '/', icon: <Home />, show: !user || userRole === 'customer' },
        { label: 'Salons', path: '/salons', icon: <Store />, show: true },
        { label: 'About', path: '/about', icon: <Info />, show: !user || userRole === 'customer' },
        { label: 'My Bookings', path: '/my-bookings', icon: <CalendarMonth />, show: user && userRole === 'customer' },
        { label: 'My Schedule', path: '/dashboard', icon: <DashboardIcon />, show: user && userRole === 'worker' },
        { label: 'Admin Dashboard', path: '/dashboard', icon: <DashboardIcon />, show: user && userRole === 'admin' },
        // Admin specific controls
        { label: 'Manage Services', path: '/admin/services', icon: <Spa />, show: user && userRole === 'admin' },
        { label: 'Manage Salons', path: '/admin/salons', icon: <Business />, show: user && userRole === 'admin' },
        { label: 'Manage Workers', path: '/admin/workers', icon: <People />, show: user && userRole === 'admin' },
    ];

    const drawerContent = (
        <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    XFactor
                </Typography>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {navItems.filter(item => item.show).map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleColorMode}>
                        <ListItemIcon>
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </ListItemIcon>
                        <ListItemText primary={mode === 'dark' ? "Light Mode" : "Dark Mode"} />
                    </ListItemButton>
                </ListItem>
                {user ? (
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon><Logout color="error" /></ListItemIcon>
                            <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
                        </ListItemButton>
                    </ListItem>
                ) : (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                                <ListItemIcon><Login /></ListItemIcon>
                                <ListItemText primary="Login" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate('/book'); setMobileOpen(false); }} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, m: 1, borderRadius: 1 }}>
                                <ListItemText primary="Book Now" sx={{ textAlign: 'center' }} />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="fixed" color="inherit" elevation={0} sx={{ top: 0 }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ height: 80, display: 'flex', justifyContent: 'flex-start' }}>

                        {/* HAMBURGER MENU (Mobile Only) */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            disableRipple
                            sx={{
                                mr: 2,
                                display: { md: 'none' },
                                backgroundColor: 'transparent !important',
                                border: 'none !important',
                                outline: 'none !important',
                                boxShadow: 'none !important',
                                borderRadius: 0,
                                '&:hover': {
                                    backgroundColor: 'transparent !important',
                                    border: 'none !important'
                                },
                                '&:active': {
                                    backgroundColor: 'transparent !important'
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* LOGO */}
                        <Typography
                            variant="h4"
                            noWrap
                            component={motion.div}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            sx={{
                                fontWeight: 800,
                                background: mode === 'dark'
                                    ? 'linear-gradient(45deg, #FF0000 30%, #FFFFFF 90%)'
                                    : 'linear-gradient(45deg, #E60000 30%, #000000 90%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                cursor: 'pointer',
                                letterSpacing: '-1px',
                            }}
                            onClick={() => navigate(user && (userRole === 'admin' || userRole === 'worker') ? '/dashboard' : '/')}
                        >
                            XFactor
                        </Typography>

                        <Box sx={{ flexGrow: 1 }} />

                        {/* DESKTOP MENU (Hidden on Mobile) */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
                            {navItems.filter(item => item.show).map((item) => (
                                <Button
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                                        fontWeight: 500,
                                        fontSize: '1rem',
                                        '&:hover': {
                                            color: 'primary.main',
                                            backgroundColor: 'transparent',
                                        },
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}

                            {user ? (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 2 }}>
                                    <IconButton onClick={toggleColorMode} color="inherit">
                                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                                    </IconButton>
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
                                    <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                                    </IconButton>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/book')}
                                    >
                                        Book Now
                                    </Button>
                                </Box>
                            )}
                        </Box>



                    </Toolbar>
                </Container>
            </AppBar>

            {/* MOBILE DRAWER */}
            <Box component="nav">
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>
        </>
    );
}
