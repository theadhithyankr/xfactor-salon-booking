import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Select, MenuItem, FormControl, InputLabel,
    Grid, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

type Service = {
    id?: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category: 'haircut' | 'styling' | 'coloring' | 'treatment' | 'other';
    target_gender: 'male' | 'female' | 'unisex';
    image_url?: string;
    is_active: boolean;
};

export default function ManageServices() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<Service>({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 30,
        category: 'haircut',
        target_gender: 'unisex',
        image_url: '',
        is_active: true
    });

    // Confirmation Dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

    useEffect(() => {
        checkAdminAccess();
        fetchServices();
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

    const fetchServices = async () => {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('name');

        if (!error && data) {
            setServices(data);
        }
        setLoading(false);
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData(service);
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                price: 0,
                duration_minutes: 30,
                category: 'haircut',
                target_gender: 'unisex',
                image_url: '',
                is_active: true
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingService(null);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `service_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Reusing salon_images bucket as discussed
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

    const handleSave = async () => {
        try {
            if (editingService) {
                // Update existing service
                const { error } = await supabase
                    .from('services')
                    .update(formData)
                    .eq('id', editingService.id);

                if (error) throw error;
            } else {
                // Create new service
                const { error } = await supabase
                    .from('services')
                    .insert([formData]);

                if (error) throw error;
            }

            fetchServices();
            handleCloseDialog();
        } catch (error: any) {
            showNotification('Error saving service: ' + error.message, 'error');
        }
    };

    const handleDeleteClick = (id: string) => {
        setConfirmMessage('Are you sure you want to delete this service?');
        setConfirmAction(() => async () => {
            try {
                const { error } = await supabase
                    .from('services')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchServices();
                showNotification('Service deleted successfully', 'success');
            } catch (error: any) {
                showNotification('Error deleting service: ' + error.message, 'error');
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

    const handleToggleActive = async (service: Service) => {
        try {
            const { error } = await supabase
                .from('services')
                .update({ is_active: !service.is_active })
                .eq('id', service.id);

            if (error) throw error;
            fetchServices();
        } catch (error: any) {
            showNotification('Error updating service: ' + error.message, 'error');
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
                        Manage Services
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        size="large"
                    >
                        Add Service
                    </Button>
                </Box>

                {/* DESKTOP TABLE VIEW */}
                <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Image</strong></TableCell>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Category</strong></TableCell>
                                <TableCell><strong>Gender</strong></TableCell>
                                <TableCell><strong>Price</strong></TableCell>
                                <TableCell><strong>Duration</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        {service.image_url && (
                                            <Box
                                                component="img"
                                                src={service.image_url}
                                                alt={service.name}
                                                sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{service.name}</TableCell>
                                    <TableCell>
                                        <Chip label={service.category} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={service.target_gender}
                                            size="small"
                                            color={service.target_gender === 'male' ? 'info' : service.target_gender === 'female' ? 'secondary' : 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>₹{service.price.toFixed(2)}</TableCell>
                                    <TableCell>{service.duration_minutes} min</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={service.is_active ? 'Active' : 'Inactive'}
                                            color={service.is_active ? 'success' : 'default'}
                                            size="small"
                                            onClick={() => handleToggleActive(service)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(service)}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(service.id!)}
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
                    {services.map((service) => (
                        <Paper key={service.id} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
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
                                            <Typography variant="h6" fontWeight="bold">{service.name}</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">{service.category}</Typography>
                                                <Typography variant="body2" color="text.secondary">•</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{service.target_gender}</Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={service.is_active ? 'Active' : 'Inactive'}
                                            color={service.is_active ? 'success' : 'default'}
                                            size="small"
                                            onClick={() => handleToggleActive(service)}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                    <strong>Price:</strong> ₹{service.price.toFixed(2)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Duration:</strong> {service.duration_minutes} min
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Button startIcon={<Edit />} size="small" onClick={() => handleOpenDialog(service)}>
                                    Edit
                                </Button>
                                <Button startIcon={<Delete />} size="small" color="error" onClick={() => handleDeleteClick(service.id!)}>
                                    Delete
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {editingService ? 'Edit Service' : 'Add New Service'}
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
                                    label="Service Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
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
                                <TextField
                                    fullWidth
                                    label="Price (₹)"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Duration (minutes)"
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={formData.category}
                                        label="Category"
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        <MenuItem value="haircut">Haircut</MenuItem>
                                        <MenuItem value="styling">Styling</MenuItem>
                                        <MenuItem value="coloring">Coloring</MenuItem>
                                        <MenuItem value="treatment">Treatment</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>

                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        value={formData.target_gender}
                                        label="Gender"
                                        onChange={(e) => setFormData({ ...formData, target_gender: e.target.value as any })}
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="unisex">Unisex</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* The original image_url TextField is removed as per instructions */}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained">
                            {editingService ? 'Update' : 'Create'}
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
