import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './components/auth/AuthContext';
import Login from './pages/Login';
import theme from './styles/theme';
import Employee from './pages/Employee';
import Holiday from './pages/Holiday';
import Policy from './pages/Policy';
import Attendance from './pages/Attendance';
import Notification from './pages/Notification';
import Leave from './pages/Leave';
import EmpProfile from './pages/User';
import PrivateRoute from './components/auth/PrivateRoute';
import EmployeeProfile from './pages/EmployeeProfile';
import VisitReport from './pages/VisitReport';
import ViewAdmission from './pages/ViewAdmission';
import Library from './pages/Library';
import AdmissionFinal from './pages/AdmissionFinal';
import FeesStructure from './pages/FeesStructure';
import FeesPayment from './pages/FeesPayment';
import StudentFees from './pages/StudentFees';
import StuLibrary from './pages/StuLibrary';
import LibraryDash from './pages/LibraryDash';
import StudentReport from './pages/StudentReport';
import Menus from './pages/Menus';
import Checkpoints from './pages/Checkpoints';
import Form from './pages/Form';
import Tendor from './pages/Tendor';
function App() {
   useEffect(() => {
        const handleRightClick = (event) => {
            event.preventDefault();
        };

        document.addEventListener('contextmenu', handleRightClick);

        return () => {
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/teachers" element={<PrivateRoute element={Employee} />} />
            <Route path="/teachers/:empId" element={<PrivateRoute element={EmployeeProfile} requiredRole="HR" />} />
            <Route path="/holiday" element={<PrivateRoute element={Holiday} />} />
            <Route path="/policy" element={<PrivateRoute element={Policy} />} />
            <Route path="/attendance" element={<PrivateRoute element={Attendance} />} />
            <Route path="/notification" element={<PrivateRoute element={Notification} />} />
            <Route path="/leave" element={<PrivateRoute element={Leave} />} />
            {/* <Route path="/admissions" element={<PrivateRoute element={Admission} />} /> */}
            <Route path="/admissions/view/:activityId" element={<PrivateRoute element={ViewAdmission} />} />
            <Route path="/admissions/finalize" element={<PrivateRoute element={AdmissionFinal} />} />
            <Route path="/profile" element={<PrivateRoute element={EmpProfile} />} />
            <Route path="/report" element={<PrivateRoute element={StudentReport} />} />
            <Route path="/library" element={<PrivateRoute element={Library} />} />
            <Route path="/library-dashboard" element={<PrivateRoute element={LibraryDash} />} />
            <Route path="/student/library/:studentId" element={<PrivateRoute element={StuLibrary} />} />
            <Route path="/fee-structure" element={<PrivateRoute element={FeesStructure} />} />
            <Route path="/fees-payment" element={<PrivateRoute element={FeesPayment} />} />
            <Route path="/fees/:studentId" element={<PrivateRoute element={StudentFees} />} />




            <Route path="/tender" element={<PrivateRoute element={Tendor} />} />

            <Route path="/create-tender" element={<PrivateRoute element={Tendor} />} />

            {/* Optional Routes */}
            <Route path="/menus" element={<PrivateRoute element={Menus} />} />
            <Route path="/add-menu" element={<PrivateRoute element={Menus} />} />

            <Route path="/checkpoints" element={<PrivateRoute element={Checkpoints} />} />
            <Route path="/add-checkpoint" element={<PrivateRoute element={Checkpoints} />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
