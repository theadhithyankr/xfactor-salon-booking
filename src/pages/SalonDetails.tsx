
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, Paper,
    Chip, TextField, InputAdornment, Button, CircularProgress,
    FormControl, Select, MenuItem, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Search, AccessTime, FilterList } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type Service = Database['public']['Tables']['services']['Row'];
type Salon = Database['public']['Tables']['salons']['Row'];

export default function SalonDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [salon, setSalon] = useState<Salon | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    useEffect(() => {
        if (id) {
            fetchSalonData();
        }
    }, [id]);

    const fetchSalonData = async () => {
        try {
            // Fetch Salon Info
            const { data: salonData, error: salonError } = await supabase
                .from('salons')
                .select('*')
                .eq('id', id)
                .single();

            if (salonError) throw salonError;
            setSalon(salonData);

            // Fetch Active Services for this Salon
            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('*')
                .eq('salon_id', id)
                .eq('is_active', true)
                .order('name');

            if (servicesError) throw servicesError;
            setServices(servicesData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (serviceId: string) => {
        // Navigate to booking page with pre-selected salon and service
        navigate(`/ book ? salonId = ${id}& serviceId=${serviceId} `);
    };

    // Filter Logic
    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(services.map(s => s.category).filter((c): c is string => c !== null)))];

    const formatTime12h = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm} `;
    };

    if (loading) {
        return (
            <Box sx={{
                position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pt: '80px'
            }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!salon) {
        return (
            <Container sx={{ pt: '120px', textAlign: 'center' }}>
                <Typography variant="h5">Salon not found</Typography>
                <Button onClick={() => navigate('/salons')} sx={{ mt: 2 }}>Back to Salons</Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100dvh', pt: '80px', pb: 8, bgcolor: 'background.default' }}>
            {/* HERO SECTION */}
            <Box sx={{
                bgcolor: 'background.paper',
                pt: { xs: 3, md: 5 }, pb: { xs: 3, md: 4 }, px: 2, mb: 4,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ fontSize: { xs: '2rem', md: '3.5rem' } }}
                        >
                            {salon.name}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                            {salon.address}, {salon.city}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {salon.opening_time && salon.closing_time && (
                                <Chip
                                    icon={<AccessTime sx={{ fontSize: '1rem !important' }} />}
                                    label={`${formatTime12h(salon.opening_time.slice(0, 5))} - ${formatTime12h(salon.closing_time.slice(0, 5))} `}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                            {/* Gender Chip */}
                            {(() => {
                                const g = (salon as any).gender || salon.target_gender;
                                const validGenders = ['male', 'female', 'unisex'];
                                if (!g || !validGenders.includes(g.toLowerCase())) return null;
                                return (
                                    <Chip
                                        label={g === 'unisex' ? 'Unisex' : `${g} Only`}
                                        color="default"
                                        variant="outlined"
                                        size="small"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                );
                            })()}
                        </Box>
                    </Box>

                    {/* FILTERS SECTION (Moved here) */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder="Search services..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                            }}
                            sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'background.default' }}
                        />
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                label="Category"
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                sx={{ bgcolor: 'background.default' }}
                                startAdornment={<InputAdornment position="start"><FilterList fontSize="small" /></InputAdornment>}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat} sx={{ textTransform: 'capitalize' }}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Container>
            </Box>

            {/* SERVICES LIST - DESKTOP TABLE */}
            <Container maxWidth="lg" sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} sx={{ width: '100%', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" fontWeight="bold">Available Services ({filteredServices.length})</Typography>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Service</strong></TableCell>
                                <TableCell><strong>Category</strong></TableCell>
                                <TableCell><strong>Duration</strong></TableCell>
                                <TableCell><strong>Price</strong></TableCell>
                                <TableCell align="right"><strong>Action</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>No services found matching filters.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredServices.map((service) => (
                                    <TableRow key={service.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {service.image_url && (
                                                    <Box
                                                        component="img"
                                                        src={service.image_url}
                                                        alt={service.name}
                                                        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
                                                    />
                                                )}
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">{service.name}</Typography>
                                                    {service.description && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {service.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={service.category} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                        </TableCell>
                                        <TableCell>
                                            {service.duration_minutes} min
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="bold" color="primary">₹{service.price}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleBookNow(service.id)}
                                            >
                                                Book
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            {/* SERVICES LIST - MOBILE CARDS (Like ManageServices) */}
            <Container maxWidth="lg" sx={{ display: { xs: 'block', md: 'none' } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Services ({filteredServices.length})</Typography>

                    {filteredServices.length === 0 ? (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No services found.</Typography>
                    ) : (
                        filteredServices.map((service) => (
                            <Paper key={service.id} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {service.image_url && (
                                        <Box
                                            component="img"
                                            src={service.image_url}
                                            alt={service.name}
                                            sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                                        />
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                                    {service.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                        {service.category}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                ₹{service.price}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {service.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                        {service.description}
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{service.duration_minutes} min</Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleBookNow(service.id)}
                                    >
                                        Book Now
                                    </Button>
                                </Box>
                            </Paper>
                        ))
                    )}
                </Box>
            </Container>
        </Box >
    );
}
