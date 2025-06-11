"use client"

import { useState, useEffect } from "react"
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
  Alert,
  CircularProgress,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import CloseIcon from "@mui/icons-material/Close"
import AddIcon from "@mui/icons-material/Add"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import SearchIcon from "@mui/icons-material/Search"

// Mock auth hook - replace with your actual auth implementation
const useAuth = () => ({
  user: { tenent_id: "1" }, // Replace with your actual auth logic
})

function EmployeeList() {
  const { user } = useAuth()

  // State management
  const [employees, setEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [openForm, setOpenForm] = useState(false)
  const [formMode, setFormMode] = useState("add") // 'add' or 'edit'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Simplified form data - only 6 essential fields
  const [formData, setFormData] = useState({
    EmpId: "",
    Name: "",
    Password: "",
    Mobile: "",
    EmailId: "",
    Role: "",
  })

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("")
        setSuccess("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `https://namami-infotech.com/SANCHAR/src/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Employees response:", data)

      if (data.success) {
        setEmployees(data.data || [])
      } else {
        setError(data.message || "Failed to fetch employees")
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Failed to fetch employees. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleOpenForm = (mode, employee = null) => {
    setFormMode(mode)
    setError("")
    setSuccess("")

    if (mode === "edit" && employee) {
      setFormData({
        EmpId: employee.EmpId,
        Name: employee.Name,
        Password: "", // Don't populate password for security
        Mobile: employee.Mobile,
        EmailId: employee.EmailId,
        Role: employee.Role,
      })
    } else {
      // Reset form for add mode
      setFormData({
        EmpId: "",
        Name: "",
        Password: "",
        Mobile: "",
        EmailId: "",
        Role: "",
      })
    }
    setOpenForm(true)
  }

  const validateForm = () => {
    const requiredFields = ["EmpId", "Name", "Mobile", "EmailId", "Role"]

    // Add password requirement for new employees
    if (formMode === "add") {
      requiredFields.push("Password")
    }

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, " $1").trim()}`)
        return false
      }
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(formData.Mobile)) {
      setError("Mobile number must be exactly 10 digits")
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.EmailId)) {
      setError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")

    // Prepare data with defaults for PHP backend
    const submitData = {
      EmpId: formData.EmpId.trim(),
      Name: formData.Name.trim(),
      Password: formData.Password,
      Mobile: formData.Mobile.trim(),
      EmailId: formData.EmailId.trim(),
      Role: formData.Role,
      // Default values that PHP backend expects
      OTP: "123456",
      IsOTPExpired: 1,
      IsGeofence: 0,
      Tenent_Id: user.tenent_id,
      IsActive: 1,
    }

    console.log("Submitting data:", submitData)

    const url =
      formMode === "add"
        ? "https://namami-infotech.com/SANCHAR/src/employee/add_employee.php"
        : "https://namami-infotech.com/SANCHAR/src/employee/edit_employee.php"

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Response:", result)

      if (result.success) {
        setSuccess(`Employee ${formMode === "add" ? "added" : "updated"} successfully!`)
        handleCloseForm()
        fetchEmployees() // Refresh the list
      } else {
        setError(result.message || "Operation failed")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Failed to submit form. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCloseForm = () => {
    setOpenForm(false)
    setFormData({
      EmpId: "",
      Name: "",
      Password: "",
      Mobile: "",
      EmailId: "",
      Role: "",
    })
  }

  const handleToggleEmployeeStatus = async (employee) => {
    if (!employee?.EmpId) {
      setError("Invalid employee data")
      return
    }

    setLoading(true)
    setError("")

    try {
      const action = employee.IsActive ? "disable" : "enable"

      const response = await fetch("https://namami-infotech.com/SANCHAR/src/employee/disable_employee.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          EmpId: employee.EmpId,
          action: action,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setSuccess(`Employee ${action}d successfully!`)
        fetchEmployees() // Refresh the list
      } else {
        setError(result.message || "Failed to update employee status")
      }
    } catch (error) {
      console.error("Error toggling status:", error)
      setError("Failed to update employee status")
    } finally {
      setLoading(false)
    }
  }

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return Object.keys(employee).some((key) => {
      const value = employee[key]
      return value != null && value.toString().toLowerCase().includes(lowerCaseSearchTerm)
    })
  })

  return (
    <div style={{ padding: "20px" }}>
      {/* Alert Messages */}
      {error && (
        <Alert severity="error" style={{ marginBottom: "16px" }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" style={{ marginBottom: "16px" }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Header Section */}
      <Grid container spacing={2} alignItems="center" style={{ marginBottom: "20px" }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon style={{ marginRight: "8px", color: "#666" }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} md={4} style={{ textAlign: "right" }}>
          <Button
            variant="contained"
            style={{ backgroundColor: "#F69320", color: "white" }}
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm("add")}
            disabled={loading}
          >
            Add Employee
          </Button>
        </Grid>
      </Grid>

      {/* Employee Table */}
      <Box sx={{ overflowX: "auto" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead style={{ backgroundColor: "#F69320" }}>
              <TableRow>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Employee ID</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Mobile</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Email</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Role</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell style={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <CircularProgress />
                    <Typography variant="body2" style={{ marginTop: "10px" }}>
                      Loading employees...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <Typography variant="body1" color="textSecondary">
                      No employees found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees
                  .sort((a, b) => a.Name.localeCompare(b.Name))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <TableRow key={employee.EmpId} hover>
                      <TableCell style={{ fontWeight: "500" }}>{employee.EmpId}</TableCell>
                      <TableCell>{employee.Name}</TableCell>
                      <TableCell>{employee.Mobile}</TableCell>
                      <TableCell>{employee.EmailId}</TableCell>
                      <TableCell>{employee.Role}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          style={{
                            color: employee.IsActive ? "#4caf50" : "#f44336",
                            fontWeight: "500",
                          }}
                        >
                          {employee.IsActive ? "Active" : "Inactive"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenForm("edit", employee)}
                            disabled={loading}
                            title="Edit Employee"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            style={{
                              color: employee.IsActive ? "#f44336" : "#4caf50",
                            }}
                            onClick={() => handleToggleEmployeeStatus(employee)}
                            disabled={loading}
                            title={employee.IsActive ? "Disable Employee" : "Enable Employee"}
                          >
                            {employee.IsActive ? <CloseIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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

      {/* Add/Edit Employee Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle style={{ backgroundColor: "#f5f5f5" }}>
          {formMode === "add" ? "Add New Employee" : "Edit Employee"}
        </DialogTitle>
        <DialogContent style={{ paddingTop: "20px" }}>
          <form onSubmit={handleFormSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.EmpId}
                  onChange={(e) => setFormData({ ...formData, EmpId: e.target.value })}
                  required
                  disabled={formMode === "edit"}
                  helperText={formMode === "edit" ? "Employee ID cannot be changed" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                />
              </Grid>
              {formMode === "add" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    required
                    helperText="Minimum 6 characters recommended"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={formData.Mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "") // Only allow digits
                    if (value.length <= 10) {
                      setFormData({ ...formData, Mobile: value })
                    }
                  }}
                  required
                  helperText="10 digits only"
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.EmailId}
                  onChange={(e) => setFormData({ ...formData, EmailId: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={formData.Role}
                  onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                  required
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Project Manager">Project Manager</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Customer Support">Customer Support</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions style={{ padding: "16px 24px" }}>
          <Button onClick={handleCloseForm} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            style={{ backgroundColor: "#F69320", color: "white" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : formMode === "add" ? "Add Employee" : "Update Employee"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default EmployeeList
