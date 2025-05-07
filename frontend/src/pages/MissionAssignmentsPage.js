import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MissionAssignmentService from '../services/MissionAssignmentService';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';

const MissionAssignmentsPage = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [formData, setFormData] = useState({
        missionId: '',
        auditorId: '',
        role: 'AUDITOR',
        responsibilities: '',
        status: 'ASSIGNED'
    });

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            let response;
            if (user.role === 'ROLE_AUDITOR') {
                response = await MissionAssignmentService.getAssignmentsByAuditor(user.username);
            } else {
                response = await MissionAssignmentService.getAssignmentsByMission(user.currentMissionId);
            }
            setAssignments(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch assignments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (assignment = null) => {
        if (assignment) {
            setSelectedAssignment(assignment);
            setFormData({
                missionId: assignment.missionId,
                auditorId: assignment.auditorId,
                role: assignment.role,
                responsibilities: assignment.responsibilities,
                status: assignment.status
            });
        } else {
            setSelectedAssignment(null);
            setFormData({
                missionId: '',
                auditorId: '',
                role: 'AUDITOR',
                responsibilities: '',
                status: 'ASSIGNED'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAssignment(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedAssignment) {
                await MissionAssignmentService.updateAssignment(selectedAssignment.id, formData);
            } else {
                await MissionAssignmentService.assignAuditor(formData);
            }
            handleCloseDialog();
            fetchAssignments();
        } catch (err) {
            setError('Failed to save assignment');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this assignment?')) {
            try {
                await MissionAssignmentService.removeAssignment(id);
                fetchAssignments();
            } catch (err) {
                setError('Failed to remove assignment');
                console.error(err);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Mission Assignments
                </Typography>
                {user.role !== 'ROLE_AUDITOR' && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog()}
                    >
                        New Assignment
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mission</TableCell>
                            <TableCell>Auditor</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Responsibilities</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                                <TableCell>{assignment.missionTitle}</TableCell>
                                <TableCell>{assignment.auditorName}</TableCell>
                                <TableCell>{assignment.role}</TableCell>
                                <TableCell>{assignment.responsibilities}</TableCell>
                                <TableCell>{assignment.status}</TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => handleOpenDialog(assignment)}
                                        sx={{ mr: 1 }}
                                    >
                                        Edit
                                    </Button>
                                    {user.role !== 'ROLE_AUDITOR' && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(assignment.id)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedAssignment ? 'Edit Assignment' : 'New Assignment'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Mission ID"
                            name="missionId"
                            value={formData.missionId}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Auditor ID"
                            name="auditorId"
                            value={formData.auditorId}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            select
                            label="Role"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                        >
                            <MenuItem value="AUDITOR">Auditor</MenuItem>
                            <MenuItem value="LEAD_AUDITOR">Lead Auditor</MenuItem>
                            <MenuItem value="REVIEWER">Reviewer</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Responsibilities"
                            name="responsibilities"
                            value={formData.responsibilities}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                            margin="normal"
                        >
                            <MenuItem value="ASSIGNED">Assigned</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedAssignment ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default MissionAssignmentsPage; 