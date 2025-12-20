import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Grid, CircularProgress
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

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
    image_url?: string;
};

export default function ManageSalons() {
    const navigate = useNavigate();
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
        is_active: true,
        image_url: ''
    });

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
            setFormData(salon);
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
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
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
            alert('Error saving salon: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this salon?')) return;

        try {
            const { error } = await supabase
                .from('salons')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchSalons();
        } catch (error: any) {
            alert('Error deleting salon: ' + error.message);
        }
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
            alert('Error updating salon: ' + error.message);
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
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold">
                        Manage Salons
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        size="large"
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
                                    <TableCell>{salon.opening_time} - {salon.closing_time}</TableCell>
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
                                            onClick={() => handleDelete(salon.id!)}
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
                                    <strong>Hours:</strong> {salon.opening_time} - {salon.closing_time}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Button startIcon={<Edit />} size="small" onClick={() => handleOpenDialog(salon)}>
                                    Edit
                                </Button>
                                <Button startIcon={<Delete />} size="small" color="error" onClick={() => handleDelete(salon.id!)}>
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
                                        value={dayjs(formData.opening_time, 'HH:mm')}
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
                                        value={dayjs(formData.closing_time, 'HH:mm')}
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
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained" disabled={uploading}>
                            {editingSalon ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
