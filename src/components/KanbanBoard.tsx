import { Box, Paper, Typography, Card, CardContent, Chip, Button } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Database } from '../types/database.types';
import { AccessTime, Person, Event } from '@mui/icons-material';
import dayjs from 'dayjs';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row'] | null; // Customer profile
    services: Database['public']['Tables']['services']['Row'] | null;
};

interface KanbanBoardProps {
    appointments: Appointment[];
    onStatusChange: (appointmentId: string, newStatus: string) => void;
    onReschedule?: (appointment: Appointment) => void;
    currentWorkerId?: string; // If provided, helps identify "my" vs "unassigned" tasks
}

const COLUMNS = {
    pending: { title: 'Pending (FCFS)', color: '#E60000' },
    confirmed: { title: 'Confirmed', color: '#E60000' },
    in_progress: { title: 'In Progress', color: '#E60000' },
    completed: { title: 'Completed', color: '#E60000' },
    cancelled: { title: 'Cancelled', color: '#E60000' },
};

export default function KanbanBoard({ appointments, onStatusChange, onReschedule, currentWorkerId }: KanbanBoardProps) {

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        onStatusChange(draggableId, newStatus);
    };

    // Group appointments by status
    const columns = Object.keys(COLUMNS).reduce((acc, status) => {
        acc[status] = appointments.filter(apt => apt.status === status);
        return acc;
    }, {} as Record<string, Appointment[]>);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box sx={{
                display: 'flex',
                gap: 2,
                pb: 2,
                minHeight: '500px',
                flexWrap: 'wrap', // Allow wrapping
                justifyContent: 'center', // Center when wrapped
                alignItems: 'flex-start'
            }}>
                {Object.entries(COLUMNS).map(([status, config]) => (
                    <Box key={status} sx={{
                        width: '100%',
                        maxWidth: 320, // Limit width of each column
                        minWidth: 280,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Paper
                            sx={{
                                p: 2,
                                mb: 2,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                borderTop: `4px solid ${config.color}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                {config.title}
                            </Typography>
                            <Chip size="small" label={columns[status].length} />
                        </Paper>

                        <Droppable droppableId={status}>
                            {(provided) => (
                                <Box
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    sx={{
                                        flexGrow: 1,
                                        bgcolor: 'rgba(255,255,255,0.02)',
                                        borderRadius: 2,
                                        p: 1
                                    }}
                                >
                                    {columns[status].map((apt, index) => (
                                        <Draggable key={apt.id} draggableId={apt.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        mb: 2,
                                                        bgcolor: 'background.paper',
                                                        '&:hover': { boxShadow: 3 }
                                                    }}
                                                >
                                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {apt.services?.name || 'Service'}
                                                            </Typography>
                                                            {/* Show "Unassigned" indicator or "Direct Request" */}
                                                            {status === 'pending' && !apt.worker_id && (
                                                                <Chip label="Unassigned" color="warning" size="small" variant="outlined" />
                                                            )}
                                                            {status === 'pending' && apt.worker_id === currentWorkerId && (
                                                                <Chip label="Direct Request" color="info" size="small" variant="outlined" />
                                                            )}
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Person fontSize="small" />
                                                            {apt.profiles?.full_name || 'Customer'}
                                                        </Typography>

                                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Event fontSize="small" />
                                                            {dayjs(apt.appointment_date).format('MMM D')}
                                                        </Typography>

                                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <AccessTime fontSize="small" />
                                                            {dayjs(apt.start_time, 'HH:mm:ss').format('h:mm A')} - {dayjs(apt.end_time, 'HH:mm:ss').format('h:mm A')}
                                                        </Typography>

                                                        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {/* PENDING ACTIONS */}
                                                            {status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="primary"
                                                                        onClick={() => onStatusChange(apt.id, 'confirmed')}
                                                                    >
                                                                        Accept
                                                                    </Button>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to cancel this appointment?'))
                                                                                onStatusChange(apt.id, 'cancelled');
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {/* CONFIRMED ACTIONS */}
                                                            {status === 'confirmed' && (
                                                                <>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="secondary"
                                                                        onClick={() => onStatusChange(apt.id, 'in_progress')}
                                                                    >
                                                                        Start Job
                                                                    </Button>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => {
                                                                            if (confirm('Cancel this confirmed appointment?'))
                                                                                onStatusChange(apt.id, 'cancelled');
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {/* IN PROGRESS ACTIONS */}
                                                            {status === 'in_progress' && (
                                                                <Button
                                                                    fullWidth
                                                                    variant="contained"
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => onStatusChange(apt.id, 'completed')}
                                                                >
                                                                    Complete Job
                                                                </Button>
                                                            )}

                                                            {/* RESCHEDULE (Shared) */}
                                                            {onReschedule && ['pending', 'confirmed'].includes(status) && (
                                                                <Button
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => onReschedule(apt)}
                                                                >
                                                                    Reschedule
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </Box>
                ))}
            </Box>
        </DragDropContext>
    );
}
