import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, MenuItem, Avatar,
    Tabs, Tab, Alert, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

export default function ManageWorkers() {
    const navigate = useNavigate();
    const [workers, setWorkers] = useState<any[]>([]);
    const [salons, setSalons] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]); // Potential workers
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<any | null>(null);

    // Form Mode: 'promote' (existing user) or 'create' (new user)
    const [createMode, setCreateMode] = useState<'promote' | 'create'>('promote');

    const [formData, setFormData] = useState({
        profile_id: '',
        salon_id: '',
        specialization: '',
        bio: '',
        is_available: true,
        // New User Fields
        email: '',
        password: '',
        full_name: '',
        phone: ''
    });

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
        // We select *, then profile fields.
        const { data: workersData } = await supabase
            .from('workers')
            .select(`
                *,
                profile:profiles(*),
                salon:salons(name)
            `)
            .order('created_at', { ascending: false });

        if (workersData) setWorkers(workersData);

        // 2. Fetch Salons
        const { data: salonsData } = await supabase
            .from('salons')
            .select('id, name')
            .eq('is_active', true)
            .order('name');

        if (salonsData) setSalons(salonsData);

        // 3. Fetch Customers for promotion
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
            setCreateMode('promote');
            setFormData({
                profile_id: worker.profile_id,
                salon_id: worker.salon_id || '',
                specialization: worker.specialization || '',
                bio: worker.bio || '',
                is_available: worker.is_available,
                email: '', password: '', full_name: '', phone: ''
            });
        } else {
            setEditingWorker(null);
            setCreateMode('create');
            setFormData({
                profile_id: '',
                salon_id: '',
                specialization: '',
                bio: '',
                is_available: true,
                email: '', password: '', full_name: '', phone: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingWorker(null);
    };

    // Helper to Create New Auth User without logging out Admin
    const createNewUser = async () => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        // Create a temporary client with in-memory storage to avoid overwriting Admin session
        const tempClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
                storage: {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { }
                }
            }
        });

        const { data, error } = await tempClient.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: 'worker'
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error('User creation failed (no user returned)');

        return data.user.id;
    };

    const handleSave = async () => {
        try {
            if (editingWorker) {
                // UPDATE EXISTING WORKER
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
                // CREATE NEW WORKER
                let targetProfileId = formData.profile_id;

                if (createMode === 'create') {
                    // 1. Create User Logic
                    if (!formData.email || !formData.password || !formData.full_name) {
                        return alert("Email, Password, and Name are required.");
                    }
                    targetProfileId = await createNewUser();

                    // Allow trigger to propagation or Upsert profile manually to ensure data is there
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: targetProfileId,
                            full_name: formData.full_name,
                            phone: formData.phone, // Ensure phone is saved
                            role: 'worker',
                            updated_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error("Profile Upsert Error", profileError);
                        alert("Worker account created, but Profile update failed (likely permission issue). The worker will appear as 'Unknown'. Please run the 'fix_permissions.sql' script in Supabase.");
                    }
                } else {
                    // Promote Existing
                    if (!targetProfileId) return alert("Please select a user.");
                    // Update Role
                    await supabase.from('profiles').update({ role: 'worker' }).eq('id', targetProfileId);
                }

                if (!formData.salon_id) return alert('Please select a salon');

                // 2. Insert Worker Record
                const { error: workerError } = await supabase
                    .from('workers')
                    .insert([{
                        profile_id: targetProfileId,
                        salon_id: formData.salon_id,
                        specialization: formData.specialization,
                        bio: formData.bio,
                        is_available: true,
                        rating: 5.0,
                        total_reviews: 0
                    }]);

                if (workerError) throw workerError;
            }

            fetchData();
            handleCloseDialog();
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + (error.message || "Unknown error"));
        }
    };

    const handleDelete = async (worker: any) => {
        if (!confirm(`Are you sure you want to remove ${worker.profile?.full_name || 'this worker'}? This will downgrade them to 'customer'.`)) return;

        try {
            const { error: deleteError } = await supabase
                .from('workers')
                .delete()
                .eq('id', worker.id);

            if (deleteError) throw deleteError;

            if (worker.profile_id) {
                await supabase
                    .from('profiles')
                    .update({ role: 'customer' })
                    .eq('id', worker.profile_id);
            }

            fetchData();
        } catch (error: any) {
            alert('Error deleting worker: ' + error.message);
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

                {/* DESKTOP TABLE VIEW */}
                <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' } }}>
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
                                                    {worker.profile?.full_name || 'Unknown'}
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

                {/* MOBILE CARD VIEW */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                    {workers.map((worker) => (
                        <Paper key={worker.id} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar src={worker.profile?.avatar_url} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {worker.profile?.full_name || 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {worker.salon?.name || 'Unassigned'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip
                                    label={worker.is_available ? 'Using' : 'Off'}
                                    color={worker.is_available ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, px: 1 }}>
                                <Typography variant="body2">
                                    <strong>Role:</strong> {worker.specialization || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {worker.profile?.phone || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Rating:</strong> {worker.rating?.toFixed(1)} ({worker.total_reviews} reviews)
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Button startIcon={<Edit />} size="small" onClick={() => handleOpenDialog(worker)}>
                                    Edit
                                </Button>
                                <Button startIcon={<Delete />} size="small" color="error" onClick={() => handleDelete(worker)}>
                                    Delete
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>

                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

                            {!editingWorker && (
                                <Tabs
                                    value={createMode}
                                    onChange={(_, val) => setCreateMode(val)}
                                    variant="fullWidth"
                                    sx={{ mb: 2 }}
                                >
                                    <Tab label="New Account" value="create" />
                                    <Tab label="Promote User" value="promote" />
                                </Tabs>
                            )}

                            {/* USER SELECTION (Promote) */}
                            {!editingWorker && createMode === 'promote' && (
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

                            {/* NEW USER FIELDS (Create) or EDIT FIELDS (Edit) */}
                            {((!editingWorker && createMode === 'create') || editingWorker) && (
                                <>
                                    {!editingWorker && (
                                        <>
                                            <Alert severity="info" sx={{ mb: 1 }}>
                                                Creates a new database user. You can set the password here.
                                            </Alert>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                            <TextField
                                                fullWidth
                                                label="Password"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                helperText="Min 6 characters"
                                            />
                                        </>
                                    )}
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </>
                            )}

                            {/* WORKER DETAILS (Common) */}
                            <TextField
                                select
                                fullWidth
                                label="Assign Salon"
                                value={formData.salon_id}
                                onChange={(e) => setFormData({ ...formData, salon_id: e.target.value })}
                                sx={{ mt: 1 }}
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
                            {editingWorker ? 'Update' : (createMode === 'create' ? 'Create User & Worker' : 'Promote & Save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
