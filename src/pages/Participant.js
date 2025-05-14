import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import ParticipantList from '../components/participant/ParticipantList';
import AddNewParticipant from '../components/participant/AddNewParticipant';

function Participant() {
    const isMobile = useMediaQuery('(max-width:600px)');
    const drawerWidth = isMobile ? 0 : 100;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar with fixed width */}
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
                <Sidebar />
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
                <Navbar />
                <Box sx={{ mt: 1, p: 1 }}>
                   
                    {window.location.href.includes('/participant') && <ParticipantList />} 
                    {window.location.href.includes('/new-participant') && <AddNewParticipant />} 
            
                </Box>
            </Box>
        </Box>
    );
}

export default Participant;
