import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import { Box } from '@mui/material';
import { supabase } from '../lib/supabase';
import ScissorsLoader from '../components/ScissorsLoader';

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRoleAndRedirect = async () => {
            const startTime = Date.now();
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
                // Ensure minimum display time for animation (1.5s)
                const elapsed = Date.now() - startTime;
                const minDisplayTime = 1500;

                if (elapsed < minDisplayTime) {
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, minDisplayTime - elapsed);
                } else {
                    navigate('/dashboard');
                }
            } else {
                // Customer or no profile, show home page
                setLoading(false);
            }
        };

        checkRoleAndRedirect();
    }, [navigate]);

    if (loading) {
        return <ScissorsLoader />;
    }

    return (
        <Box>
            <Hero />
            <ServicesSection />
        </Box>
    );
}
