import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box, useMediaQuery } from '@mui/material';
import BuyerList from '../components/buyer/BuyerList';
import AddNewBuyer from '../components/buyer/AddNewBuyer';
import AddContactStation from '../components/buyer/AddContactStation';
import ContactList from '../components/buyer/ContactList';

function Buyer() {
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
                   
                    {window.location.href.includes('/buyer') && <BuyerList />} 
                    {window.location.href.includes('/new-buyer') && <AddNewBuyer />} 
                    {window.location.href.includes('/contact') && <AddContactStation />} 
                    {window.location.href.includes('/directory') && <ContactList />} 
                                  
                </Box>
            </Box>
        </Box>
    );
}

export default Buyer;
