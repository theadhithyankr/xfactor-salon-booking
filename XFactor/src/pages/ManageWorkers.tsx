import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Grid, CircularProgress, MenuItem, Avatar,
    InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Person, Search } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ManageWorkers() {
    const navigate = useNavigate();
    const [workers, setWorkers] = useState<any[]>([]);
    const [salons, setSalons] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]); // Potential workers
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        profile_id: '',
        salon_id: '',
        specialization: '',
        bio: '',
        hourly_rate: '',
        is_available: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        checkAdminAccess();
        fetchData();
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

    const fetchData = async () => {
        setLoading(true);
        // 1. Fetch Workers
        const { data: workersData } = await supabase
            .from('workers')
            .select(`
                *,
                profile:profiles(*),
                salon:salons(name)
            `)
            .order('created_at', { ascending: false });

        if (workersData) setWorkers(workersData);

        // 2. Fetch Salons (for dropdown)
        const { data: salonsData } = await supabase
            .from('salons')
            .select('id, name')
            .eq('is_active', true)
            .order('name');

        if (salonsData) setSalons(salonsData);

        // 3. Fetch Customers (Profiles who are NOT workers or admins)
        // Note: For large apps, this should be a search, not fetch all. 
        // But for MVP, fetch all customers is fine.
        const { data: customersData } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'customer')
            .order('full_name');

        if (customersData) setCustomers(customersData);

        setLoading(false);
    };

    const handleOpenDialog = (worker?: any) => {
        if (worker) {
            setEditingWorker(worker);
            setFormData({
                profile_id: worker.profile_id, // Read-only in edit
                salon_id: worker.salon_id || '',
                specialization: worker.specialization || '',
                bio: worker.bio || '',
                hourly_rate: '', // Not in schema, maybe use 'rating' field as proxy? No, stick to specialization.
                is_available: worker.is_available
            });
        } else {
            setEditingWorker(null);
            setFormData({
                profile_id: '',
                salon_id: '',
                specialization: '',
                bio: '',
                hourly_rate: '',
                is_available: true
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingWorker(null);
    };

    const handleSave = async () => {
        try {
            if (editingWorker) {
                // UPDATE
                const { error } = await supabase
                    .from('workers')
                    .update({
                        salon_id: formData.salon_id,
                        specialization: formData.specialization,
                        bio: formData.bio,
                        is_available: formData.is_available
                    })
                    .eq('id', editingWorker.id);

                if (error) throw error;
            } else {
                // CREATE (Promote)
                if (!formData.profile_id) return alert('Please select a user');
                if (!formData.salon_id) return alert('Please select a salon');

                // 1. Create Worker Record
                const { error: workerError } = await supabase
                    .from('workers')
                    .insert([{
                        profile_id: formData.profile_id,
                        salon_id: formData.salon_id,
                        specialization: formData.specialization,
                        bio: formData.bio,
                        is_available: true,
                        rating: 5.0, // Default start rating
                        total_reviews: 0
                    }]);

                if (workerError) throw workerError;

                // 2. Update Profile Role
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ role: 'worker' })
                    .eq('id', formData.profile_id);

                if (profileError) {
                    // Start rollback? Ideally transaction, but Supabase client JS doesn't support easy transactions.
                    console.error("Role update failed", profileError);
                    alert("Worker created but role update failed. Please check database.");
                }
            }

            fetchData();
            handleCloseDialog();
        } catch (error: any) {
            alert('Error saving worker: ' + error.message);
        }
    };

    const handleDelete = async (worker: any) => {
        if (!confirm(`Are you sure you want to remove ${worker.profile?.full_name} from workers? This will downgrade them to 'customer'.`)) return;

        try {
            // 1. Delete Worker Record
            const { error: deleteError } = await supabase
                .from('workers')
                .delete()
                .eq('id', worker.id);

            if (deleteError) throw deleteError;

            // 2. Downgrade Profile Role
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'customer' })
                .eq('id', worker.profile_id);

            if (profileError) throw profileError;

            fetchData();
        } catch (error: any) {
            alert('Error deleting worker: ' + error.message);
        }
    };

    // Filter customers for dropdown (exclude ones that are already workers if any slippage)
    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            display: 'grid', placeItems: 'center', zIndex: 1, pt: '80px', overflow: 'auto', px: 2
        }}>
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold">
                        Manage Workers
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        size="large"
                    >
                        Add Worker
                    </Button>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Profile</strong></TableCell>
                                <TableCell><strong>Salon</strong></TableCell>
                                <TableCell><strong>Specialization</strong></TableCell>
                                <TableCell><strong>Rating</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={worker.profile?.avatar_url} />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {worker.profile?.full_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {worker.profile?.phone || 'No phone'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{worker.salon?.name || 'Unassigned'}</TableCell>
                                    <TableCell>{worker.specialization || 'N/A'}</TableCell>
                                    <TableCell>{worker.rating?.toFixed(1)} ({worker.total_reviews})</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={worker.is_available ? 'Available' : 'Unavailable'}
                                            color={worker.is_available ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenDialog(worker)} color="primary">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(worker)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>

                            {/* USER SELECTION (Only for Create) */}
                            {!editingWorker && (
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Select User to Promote</Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        label="User"
                                        value={formData.profile_id}
                                        onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
                                        helperText="Only 'Customer' users are listed"
                                    >
                                        {customers.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.full_name} ({c.phone || 'No Phone'})
                                            </MenuItem>
                                        ))}
                                        {customers.length === 0 && <MenuItem disabled>No eligible customers found</MenuItem>}
                                    </TextField>
                                </Box>
                            )}

                            {/* SALON SELECTION */}
                            <TextField
                                select
                                fullWidth
                                label="Assign Salon"
                                value={formData.salon_id}
                                onChange={(e) => setFormData({ ...formData, salon_id: e.target.value })}
                            >
                                {salons.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                fullWidth
                                label="Specialization"
                                placeholder="e.g. Haircut, Colorist, Nail Artist"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            />

                            <TextField
                                fullWidth
                                label="Bio"
                                multiline
                                rows={3}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />

                            {editingWorker && (
                                <TextField
                                    select
                                    fullWidth
                                    label="Availability Status"
                                    value={formData.is_available ? 'true' : 'false'}
                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
                                >
                                    <MenuItem value="true">Available</MenuItem>
                                    <MenuItem value="false">Unavailable</MenuItem>
                                </TextField>
                            )}

                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleSave} variant="contained">
                            {editingWorker ? 'Update' : 'Promote & Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
