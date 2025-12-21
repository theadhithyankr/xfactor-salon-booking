import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, Button, TextField,
    Grid, CircularProgress
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

export default function ManageContent() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAdminAccess();
        fetchContent();
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

    const fetchContent = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('app_content')
            .select('*')
            .order('key');

        if (error) {
            console.error(error);
            showNotification('Error fetching content. Make sure table "app_content" exists.', 'error');
        } else {
            setContents(data || []);
        }
        setLoading(false);
    };

    const handleChange = (key: string, newValue: string) => {
        setContents(prev => prev.map(item =>
            item.key === key ? { ...item, value: newValue } : item
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = contents.map(item => ({
                key: item.key,
                value: item.value,
                label: item.label
            }));

            const { error } = await supabase
                .from('app_content')
                .upsert(updates);

            if (error) throw error;

            showNotification('Content updated successfully', 'success');
        } catch (error: any) {
            console.error(error);
            showNotification('Error saving content: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
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
            <Container maxWidth="md">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', md: '3rem' } }}>
                        Manage Site Content
                    </Typography>
                </Box>

                <Paper sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        About Page Statistics
                    </Typography>

                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {contents.map((item) => (
                            <Grid size={{ xs: 12 }} key={item.key}>
                                <TextField
                                    fullWidth
                                    label={item.label || item.key}
                                    value={item.value}
                                    multiline={item.key.startsWith('text_')}
                                    rows={item.key.startsWith('text_') ? 4 : 1}
                                    onChange={(e) => handleChange(item.key, e.target.value)}
                                    helperText={`Key: ${item.key}`}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            size="large"
                            fullWidth
                            sx={{ width: { sm: 'auto' } }}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
