import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Grid,
  TablePagination,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CheckBox } from "@mui/icons-material";
import { useAuth } from "../auth/AuthContext";
function EmployeeList() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    EmpId: "",
    Name: "",
    Password: "",
    Mobile: "",
    EmailId: "",
    Role: "",
    OTP: "",
    IsOTPExpired: 1,
    IsGeofence: 0,
    Tenent_Id: "",
    IsActive: 1,
   
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchEmployees();
    fetchOffices();
  });

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `https://namami-infotech.com/SANCHAR/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
      );
      console.log("Employees response:", response.data); // Debugging line
      if (response.data.success) {
        setEmployees(response.data.data);
      } else {
        console.error("Error fetching employees:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchOffices = async () => {
    try {
      const response = await axios.get(
        "https://namami-infotech.com/SANCHAR/src/employee/get_office.php",
      );
      console.log("Offices response:", response.data); // Debugging line
      if (response.data.success) {
        setOffices(response.data.data);
      } else {
        console.error("Error fetching offices:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = (mode, employee = null) => {
    setFormMode(mode);
    if (mode === "edit" && employee) {
      setFormData({
        EmpId: employee.EmpId,
        Name: employee.Name,
        Password: "", // Assuming Password is not updated on edit
        Mobile: employee.Mobile,
        EmailId: employee.EmailId,
        Role: employee.Role,
        OTP: employee.OTP,
        IsOTPExpired: employee.IsOTPExpired || 1,
        IsGeofence: employee.IsGeofence || 0,
        Tenent_Id: user.tenent_id,
        IsActive: employee.IsActive || 1,
        
      });
    } else {
      setFormData({
        EmpId: "",
        Name: "",
        Password: "",
        Mobile: "",
        EmailId: "",
        Role: "",
        OTP: "123456",
        IsOTPExpired: 1,
        IsGeofence: 0,
        Tenent_Id: user.tenent_id,
        IsActive: 1,
        OfficeId: "25",
        OfficeName: "",
        LatLong: "",
        Distance: "",
        OfficeIsActive: 1,
        
      });
    }
    setOpenForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Ensure all required fields are populated
    const requiredFields = [
      "EmpId",
      "Name",
      "Mobile",
      "EmailId",
      "Role",
      "OfficeName",
      "LatLong",
      "Distance",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in all required fields. Missing: ${field}`);
        return;
      }
    }

    const formattedFormData = {
      EmpId: formData.EmpId,
      Name: formData.Name,
      Password: formData.Password,
      Mobile: formData.Mobile,
      EmailId: formData.EmailId,
      Role: formData.Role,
      OTP: formData.OTP || "123456", // Provide a default OTP if not provided
      IsOTPExpired: formData.IsOTPExpired || 1,
      IsGeofence: formData.IsGeofence || 0,
      Tenent_Id: user.tenent_id,
      IsActive: formData.IsActive || 1,
      
    };

    console.log("Formatted Form Data:", formattedFormData); // Log formatted data

    const url =
      formMode === "add"
        ? "https://namami-infotech.com/SANCHAR/src/employee/add_employee.php"
        : "https://namami-infotech.com/SANCHAR/src/employee/edit_employee.php";

    try {
      const response = await axios.post(url, formattedFormData);
      console.log("Response:", response.data); // Log response data
      alert(response.data);

      if (response.data.success) {
        handleCloseForm();
        fetchEmployees();
      } else {
        console.error("Error:", response.data.message);
      }
      handleCloseForm();
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message,
      );
      alert(
        `Error: ${error.response ? error.response.data.message : error.message}`,
      );
    }
  };

  const handleOfficeChange = (event) => {
    const selectedOfficeIds = event.target.value; // Array of selected IDs

    console.log("Selected Office IDs:", selectedOfficeIds); // Debugging line

    // Find the selected offices' details
    const selectedOffices = offices.filter((o) =>
      selectedOfficeIds.includes(o.Id),
    );

    console.log("Selected Offices:", selectedOffices); // Debugging line

    setFormData((prevFormData) => ({
      ...prevFormData,
      OfficeId: selectedOfficeIds.join(","), // Store IDs as comma-separated string
      OfficeName: selectedOffices.map((o) => o.OfficeName).join(","), // Store names as comma-separated string
      LatLong: selectedOffices.map((o) => o.LatLong).join("|"), // Store lat-long as a pipe-separated string
      Distance: selectedOffices.map((o) => o.Distance).join(","), // Store distances as comma-separated string
    }));
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleToggleEmployeeStatus = async (employee) => {
    if (!employee || !employee.EmpId) {
      console.error("Please provide both Employee ID and action");
      return;
    }

    try {
      const action = employee.IsActive ? "disable" : "enable";
      const response = await axios.post(
        "https://namami-infotech.com/SANCHAR/src/employee/disable_employee.php",
        {
          EmpId: employee.EmpId,
          action: action,
        },
      );

      if (response.data.success) {
        fetchEmployees(); // Refresh the employee list after the update
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return Object.keys(employee).some((key) => {
      const value = employee[key];
      return (
        value != null &&
        value.toString().toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
  });

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search Employee"
            margin="normal"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: "#F69320" }}
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm("add")}
          >
            Add Employee
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ overflowX: "auto", mt: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead style={{ backgroundColor: "#F69320" }}>
              <TableRow>
                <TableCell style={{ color: "white" }}>EmpID</TableCell>
                <TableCell style={{ color: "white" }}>Name</TableCell>
                <TableCell style={{ color: "white" }}>Mobile</TableCell>
                <TableCell style={{ color: "white" }}>Email</TableCell>
                <TableCell style={{ color: "white" }}>Role</TableCell>
                {/* <TableCell style={{ color: "white" }}>RM</TableCell> */}
                {/* <TableCell style={{ color: "white" }}>Shift</TableCell> */}
                <TableCell style={{ color: "white" }}>Status</TableCell>
                <TableCell style={{ color: "white" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .sort((a, b) => a.Name.localeCompare(b.Name))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((employee) => (
                  <TableRow key={employee.EmpId}>
                    <TableCell
                      
                      style={{ textDecoration: "none" }}
                    >
                      {employee.EmpId}
                    </TableCell>

                    <TableCell
                      
                      style={{ textDecoration: "none" }}
                    >
                      {employee.Name}
                    </TableCell>
                    <TableCell
                     
                      style={{ textDecoration: "none" }}
                    >
                      {employee.Mobile}
                    </TableCell>
                    <TableCell
                      
                      style={{ textDecoration: "none" }}
                    >
                      {employee.EmailId}
                    </TableCell>
                    <TableCell
                     
                      style={{ textDecoration: "none" }}
                    >
                      {employee.Role}
                    </TableCell>
                    {/* <TableCell>{employee.RM}</TableCell> */}
                    {/* <TableCell>{employee.Shift}</TableCell> */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={employee.IsActive ? "green" : "red"}
                      >
                        {employee.IsActive ? "Active" : "Inactive"}
                      </Typography>
                    </TableCell>
                    <TableCell style={{ display: "flex" }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenForm("edit", employee)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color={employee.IsActive ? "error" : "success"}
                        onClick={() => handleToggleEmployeeStatus(employee)}
                      >
                        {employee.IsActive ? (
                          <CloseIcon />
                        ) : (
                          <CheckCircleIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>
          {formMode === "add" ? "Add Employee" : "Edit Employee"}
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleFormSubmit} style={{ marginTop: "10px" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.EmpId}
                  onChange={(e) =>
                    setFormData({ ...formData, EmpId: e.target.value })
                  }
                  required
                  disabled={formMode === "edit"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.Password}
                  onChange={(e) =>
                    setFormData({ ...formData, Password: e.target.value })
                  }
                  required
                  disabled={formMode === "edit"}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mobile"
                  value={formData.Mobile}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 10) {
                      setFormData({ ...formData, Mobile: value });
                    }
                  }}
                  required
                  type="number"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.EmailId}
                  onChange={(e) =>
                    setFormData({ ...formData, EmailId: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={formData.Role}
                  onChange={(e) =>
                    setFormData({ ...formData, Role: e.target.value })
                  }
                  required
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Project Manager">Project Manager</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Customer Support">Customer Support</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <DialogActions>
              <Button onClick={handleCloseForm} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Submit
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={openDetail} onClose={handleCloseDetail}>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>{/* You can add employee details here */}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EmployeeList;
