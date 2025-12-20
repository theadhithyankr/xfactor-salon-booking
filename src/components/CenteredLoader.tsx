import { Box, CircularProgress } from '@mui/material';

export default function CenteredLoader() {
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999 // Ensure it's on top
        }}>
            <CircularProgress color="primary" />
        </Box>
    );
}
