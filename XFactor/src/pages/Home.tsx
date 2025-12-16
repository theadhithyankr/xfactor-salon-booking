import Hero from '../components/Hero';
import ServicesSection from '../components/ServicesSection';
import { Box } from '@mui/material';

export default function Home() {
    return (
        <Box>
            <Hero />
            <ServicesSection />
        </Box>
    );
}
