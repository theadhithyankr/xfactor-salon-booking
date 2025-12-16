import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import { Box } from '@mui/material';
import { supabase } from '../lib/supabase';

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkRoleAndRedirect = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile && (profile.role === 'worker' || profile.role === 'admin')) {
                navigate('/dashboard');
            }
        };

        checkRoleAndRedirect();
    }, [navigate]);

    return (
        <Box>
            <Hero />
            <ServicesSection />
        </Box>
    );
}
