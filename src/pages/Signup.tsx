import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MotionPaper = motion(Paper);

export default function Signup() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign up the user (create auth user)
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                        role: 'customer', // Default to customer for all public signups
                    },
                },
            });

            if (authError) throw authError;

            // 2. If the trigger doesn't automatically set the correct role (our schema defaults to customer),
            // we might need to manually update it or trust the trigger logic we discussed.
            // For this demo, let's assume the trigger or a separate function handles profile creation.
            // BUT, our "handle_new_user" trigger HARDCODES 'customer'.
            // So if the user selected 'worker' or 'admin', we need to update it MANUALLY after signup
            // IF the policy allows it. 

            // NOTE: Our RLS "Users can update own profile (non-role fields)" prevents changing role.
            // So normally, 'admin' role assignment is a backend/admin task.
            // However, for this DEMO/MVP, we might want to bypass or allow it for testing.

            // Let's rely on the metadata for now, but acknowledge that for high security, 
            // role assignment usually happens via admin console or specific functions.

            alert('Signup successful! Please check your email to confirm.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
            <Container maxWidth="sm">
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ p: 4, width: '100%', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                        Create Account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSignup}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            margin="normal"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            margin="normal"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 3 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>

                        <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none' }}
                                >
                                    Login
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </MotionPaper>
            </Container>
        </Box>
    );
}
