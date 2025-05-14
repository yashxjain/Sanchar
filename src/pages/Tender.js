import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import TenderList from '../components/admission/TenderList';
import AdmissionFormLogic from '../components/form/AdmissionFormLogic';
import DraftList from '../components/admission/DraftList';
import EditDraft from '../components/form/EditDraft';

function Tender() {
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
                   
                    {window.location.href.includes('/tender') && <TenderList />} 
                    {window.location.href.includes('/draft') && <DraftList />} 
                    {window.location.href.includes('/create-tender') && <AdmissionFormLogic />} 
                    {window.location.href.includes('/edit-draft') && <EditDraft/>} 
                                  
                </Box>
            </Box>
        </Box>
    );
}

export default Tender;
