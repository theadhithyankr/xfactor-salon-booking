import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import { Box, CircularProgress } from '@mui/material';
import { supabase } from '../lib/supabase';

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRoleAndRedirect = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in, show home page
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile && (profile.role === 'worker' || profile.role === 'admin')) {
                navigate('/dashboard');
            } else {
                // Customer or no profile, show home page
                setLoading(false);
            }
        };

        checkRoleAndRedirect();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box>
            <Hero />
            <ServicesSection />
        </Box>
    );
}
