import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel, Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useNotification } from '../context/NotificationContext';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

type Salon = {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    description: string;
    opening_time: string;
    closing_time: string;
    target_gender?: 'male' | 'female' | 'unisex';
    image_url?: string;
    is_active?: boolean;
    latitude?: number;
    longitude?: number;
};

const LocationMarker = ({ position, setPosition, onLocationSelect }: { position: { lat: number, lng: number }, setPosition: (lat: number, lng: number) => void, onLocationSelect: (lat: number, lng: number) => void }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng.lat, e.latlng.lng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);

    return position ? (
        <Marker position={[position.lat, position.lng]} />
    ) : null;
};

export default function ManageSalons() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [salons, setSalons] = useState<Salon[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Salon>({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        description: '',
        opening_time: '09:00',
        closing_time: '21:00',
        target_gender: 'unisex',
        is_active: true,
        image_url: '',
        latitude: 12.9716, // Default to Bangalore (or any central location)
        longitude: 77.5946

    });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Confirmation Dialog

    // Confirmation Dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => {
        checkAdminAccess();
        fetchSalons();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            navigate('/dashboard');
        }
    };

    const fetchSalons = async () => {
        const { data, error } = await supabase
            .from('salons')
            .select('*')
            .order('name');

        if (!error && data) {
            setSalons(data);
        }
        setLoading(false);
    };

    const handleOpenDialog = (salon?: Salon) => {
        if (salon) {
            setEditingSalon(salon);
            setFormData({
                ...salon,
                opening_time: salon.opening_time || '09:00',
                closing_time: salon.closing_time || '21:00'
            });
        } else {
            setEditingSalon(null);
            setFormData({
                name: '',
                address: '',
                city: '',
                state: '',
                zip_code: '',
                phone: '',
                description: '',
                opening_time: '09:00',
                closing_time: '21:00',
                target_gender: 'unisex',
                is_active: true,
                image_url: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingSalon(null);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('salon_images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('salon_images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: data.publicUrl });
        } catch (error: any) {
            showNotification('Error uploading image: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSearchLocation = async (query: string) => {
        if (!query) return;
        setIsSearching(true);

        // Check for Google Maps URL
        if (query.includes('google.com/maps')) {
            try {
                let lat: number | null = null;
                let lng: number | null = null;

                // Pattern 1: !3d and !4d (Most accurate for specific place)
                const latMatch = query.match(/!3d(-?\d+\.\d+)/);
                const lngMatch = query.match(/!4d(-?\d+\.\d+)/);

                if (latMatch && lngMatch) {
                    lat = parseFloat(latMatch[1]);
                    lng = parseFloat(lngMatch[1]);
                }
                // Pattern 2: @lat,lng (Viewport center - Fallback)
                else {
                    const atMatch = query.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                    if (atMatch) {
                        lat = parseFloat(atMatch[1]);
                        lng = parseFloat(atMatch[2]);
                    }
                }

                if (lat && lng) {
                    setFormData({ ...formData, latitude: lat, longitude: lng });
                    handleLocationSelect(lat, lng);
                    setSearchResults([]); // Clear dropdown as we found a direct match
                    return;
                }
            } catch (e) {
                console.error("Error parsing Google Maps URL", e);
            }
        }
        else if (query.includes('goo.gl') || query.includes('maps.app.goo.gl')) {
            showNotification("Short URLs cannot be expanded automatically. Please click the link, open it in browser, and paste the full URL here.", "info");
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching location:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLocationSelect = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();

            const addressBy = data.address;
            setFormData(prev => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                address: addressBy.road || addressBy.suburb || addressBy.hamlet || prev.address,
                city: addressBy.city || addressBy.town || addressBy.village || addressBy.county || prev.city,
                state: addressBy.state || prev.state,
                zip_code: addressBy.postcode || prev.zip_code
            }));

        } catch (error) {
            console.error("Error reverse geocoding:", error);
        }
    };

    const handleSave = async () => {
        try {
            if (editingSalon) {
                const { error } = await supabase
                    .from('salons')
                    .update(formData)
                    .eq('id', editingSalon.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('salons')
                    .insert([formData]);

                if (error) throw error;
            }

            fetchSalons();
            handleCloseDialog();
        } catch (error: any) {
            showNotification('Error saving salon: ' + error.message, 'error');
        }
    };

    const handleDeleteClick = (id: string) => {
        setConfirmMessage('Are you sure you want to delete this salon?');
        setConfirmAction(() => async () => {
            try {
                const { error } = await supabase
                    .from('salons')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchSalons();
                showNotification('Salon deleted successfully', 'success');
            } catch (error: any) {
                showNotification('Error deleting salon: ' + error.message, 'error');
            }
        });
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (confirmAction) {
            await confirmAction();
        }
        setConfirmOpen(false);
        setConfirmAction(null);
    };

    const handleToggleActive = async (salon: Salon) => {
        try {
            const { error } = await supabase
                .from('salons')
                .update({ is_active: !salon.is_active })
                .eq('id', salon.id);

            if (error) throw error;
            fetchSalons();
        } catch (error: any) {
            showNotification('Error updating salon: ' + error.message, 'error');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: '100dvh',
            pt: '80px',
            pb: 4,
            px: { xs: 2, md: 4 },
            bgcolor: 'background.default'
        }}>
            <Container maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    mb: 4
                }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                        Manage Salons
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        size="large"
                        fullWidth
                        sx={{ width: { sm: 'auto' } }}
                    >
                        Add Salon
                    </Button>
                </Box>

                {/* DESKTOP TABLE VIEW */}
                <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Image</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Location</strong></TableCell>
                                <TableCell><strong>Phone</strong></TableCell>
                                <TableCell><strong>Hours</strong></TableCell>
                                <TableCell><strong>Gender</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {salons.map((salon) => (
                                <TableRow key={salon.id}>
                                    <TableCell>
                                        {salon.image_url && (
                                            <Box
                                                component="img"
                                                src={salon.image_url}
                                                alt={salon.name}
                                                sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{salon.name}</TableCell>
                                    <TableCell>{salon.city}, {salon.state}</TableCell>
                                    <TableCell>{salon.phone}</TableCell>
                                    <TableCell>
                                        {salon.opening_time ? dayjs(`2000-01-01 ${salon.opening_time}`).format('h:mm A') : 'N/A'} -
                                        {salon.closing_time ? dayjs(`2000-01-01 ${salon.closing_time}`).format('h:mm A') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={salon.target_gender || 'unisex'}
                                            size="small"
                                            color={salon.target_gender === 'male' ? 'info' : salon.target_gender === 'female' ? 'secondary' : 'default'}
                                            variant="outlined"
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={salon.is_active ? 'Active' : 'Inactive'}
                                            color={salon.is_active ? 'success' : 'default'}
                                            size="small"
                                            onClick={() => handleToggleActive(salon)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(salon)}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(salon.id!)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* MOBILE CARD VIEW */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                    {salons.map((salon) => (
                        <Paper key={salon.id} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                {salon.image_url && (
                                    <Box
                                        component="img"
                                        src={salon.image_url}
                                        alt={salon.name}
                                        sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                                    />
                                )}
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">{salon.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{salon.city}, {salon.state}</Typography>
                                        </Box>
                                        <Chip
                                            label={salon.is_active ? 'Active' : 'Inactive'}
                                            color={salon.is_active ? 'success' : 'default'}
                                            size="small"
                                            onClick={() => handleToggleActive(salon)}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {salon.phone}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Hours:</strong> {salon.opening_time ? dayjs(`2000-01-01 ${salon.opening_time}`).format('h:mm A') : 'N/A'} - {salon.closing_time ? dayjs(`2000-01-01 ${salon.closing_time}`).format('h:mm A') : 'N/A'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Button startIcon={<Edit />} size="small" onClick={() => handleOpenDialog(salon)}>
                                    Edit
                                </Button>
                                <Button startIcon={<Delete />} size="small" color="error" onClick={() => handleDeleteClick(salon.id!)}>
                                    Delete
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {editingSalon ? 'Edit Salon' : 'Add New Salon'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {/* Image Upload */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    {formData.image_url && (
                                        <Box
                                            component="img"
                                            src={formData.image_url}
                                            alt="Preview"
                                            sx={{ width: 100, height: 100, borderRadius: 2, objectFit: 'cover', border: '1px solid #333' }}
                                        />
                                    )}
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Salon Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>


                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </Grid>

                            {/* MAP PICKER */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>Pick Location</Typography>

                                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                    <Autocomplete
                                        fullWidth
                                        freeSolo
                                        options={searchResults}
                                        getOptionLabel={(option) => typeof option === 'string' ? option : option.display_name}
                                        filterOptions={(x) => x}
                                        loading={isSearching}
                                        onInputChange={(event, newInputValue, reason) => {
                                            if (reason === 'input') {
                                                setSearchQuery(newInputValue);
                                            }
                                        }}
                                        onChange={(event, newValue: any) => {
                                            if (typeof newValue === 'string') {
                                                handleSearchLocation(newValue);
                                            } else if (newValue) {
                                                const lat = parseFloat(newValue.lat);
                                                const lon = parseFloat(newValue.lon);
                                                setFormData({ ...formData, latitude: lat, longitude: lon });
                                                handleLocationSelect(lat, lon);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Search Location or Paste Google Maps Link"
                                                placeholder="e.g. Indiranagar or https://www.google.com/maps/..."
                                                variant="outlined"
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val.includes('google.com/maps') || val.includes('goo.gl')) {
                                                        handleSearchLocation(val);
                                                    } else {
                                                        // Debounce manual typing if needed, 
                                                        // but onInputChange handles the state update.
                                                        // This manual onChange catches paste events more reliably for some browsers.
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSearchLocation(searchQuery);
                                                    }
                                                }}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Box>


                                <Paper variant="outlined" sx={{ height: 300, width: '100%', overflow: 'hidden' }}>
                                    {dialogOpen && (
                                        <MapContainer
                                            center={[formData.latitude || 12.9716, formData.longitude || 77.5946]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <LocationMarker
                                                position={{ lat: formData.latitude || 12.9716, lng: formData.longitude || 77.5946 }}
                                                setPosition={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                                                onLocationSelect={handleLocationSelect}
                                            />
                                        </MapContainer>
                                    )}
                                </Paper>
                                <Typography variant="caption" color="text.secondary">
                                    Click on the map to set location. Lat: {formData.latitude?.toFixed(4)}, Lng: {formData.longitude?.toFixed(4)}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="City"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="State"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    fullWidth
                                    label="ZIP Code"
                                    value={formData.zip_code}
                                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="Opening Time"
                                        value={dayjs(`2000-01-01 ${formData.opening_time}`)}
                                        onChange={(newValue) => setFormData({ ...formData, opening_time: newValue?.format('HH:mm') || '09:00' })}
                                        ampm={true}
                                        slotProps={{
                                            textField: { fullWidth: true }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 3 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="Closing Time"
                                        value={dayjs(`2000-01-01 ${formData.closing_time}`)}
                                        onChange={(newValue) => setFormData({ ...formData, closing_time: newValue?.format('HH:mm') || '21:00' })}
                                        ampm={true}
                                        slotProps={{
                                            textField: { fullWidth: true }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        value={formData.target_gender || 'unisex'}
                                        label="Gender"
                                        onChange={(e) => setFormData({ ...formData, target_gender: e.target.value as any })}
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="unisex">Unisex</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" disabled={uploading}>
                            {editingSalon ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Confirmation Dialog */}
                <Dialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                >
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {confirmMessage}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirm} variant="contained" color="error" autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box >
    );
}
