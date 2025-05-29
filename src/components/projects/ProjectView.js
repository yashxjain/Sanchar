"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { useParams } from "react-router-dom"
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Checkbox,
  Alert,
  Grid,
  CircularProgress,
  Divider,
  Snackbar,
} from "@mui/material"
import { CheckCircle, LocationOn, Person, Work, Add, CalendarToday, Search } from "@mui/icons-material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { styled } from "@mui/material/styles"

const milestones = [
  {
    label: "Civil Work",
    value: "2",
    color: "#2196f3",
    bgColor: "#e3f2fd",
  },
  {
    label: "Installation",
    value: "3",
    color: "#9c27b0",
    bgColor: "#f3e5f5",
  },
  {
    label: "Antenna Tunning",
    value: "4",
    color: "#4caf50",
    bgColor: "#e8f5e8",
  },
  {
    label: "Final Check & Completion Certificate",
    value: "5",
    color: "#ff9800",
    bgColor: "#fff3e0",
  },
]

const StyledCard = styled(Card)(({ theme }) => ({
  margin: "0 auto",
  borderRadius: 16,
  border: `2px solid #ffcc80`,
  boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)",
}))

const MilestoneButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "milestoneColor" && prop !== "milestoneBg",
})(({ theme, isSelected, milestoneColor, milestoneBg }) => ({
  width: "100%",
  padding: "16px",
  textAlign: "left",
  justifyContent: "flex-start",
  borderRadius: 12,
  border: `2px solid ${isSelected ? milestoneColor : theme.palette.divider}`,
  backgroundColor: isSelected ? milestoneBg : "transparent",
  color: isSelected ? milestoneColor : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: milestoneBg,
    borderColor: milestoneColor,
  },
  textTransform: "none",
  height: "auto",
  minHeight: 80,
}))

const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ff9800",
  color: "white",
  borderRadius: 25,
  padding: "12px 32px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#f57c00",
  },
  "&:disabled": {
    backgroundColor: "#ffcc80",
  },
}))

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "isSelected",
})(({ theme, isSelected }) => ({
  borderRadius: 8,
  margin: "4px 0",
  backgroundColor: isSelected ? "#fff3e0" : "transparent",
  border: `1px solid ${isSelected ? "#ff9800" : "transparent"}`,
  "&:hover": {
    backgroundColor: "#fff3e0",
  },
}))

export default function TaskAssignment() {
  const { ActivityId } = useParams() || { ActivityId: "1" }
  const [milestone, setMilestone] = useState("")
  const [stations, setStations] = useState([])
  const [selectedStations, setSelectedStations] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [technician, setTechnician] = useState(null)
  const [date, setDate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submissionResults, setSubmissionResults] = useState([])
  const [stationSearch, setStationSearch] = useState("")

  // Snackbar state for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  useEffect(() => {
    // Fetch stations
    fetch(`https://namami-infotech.com/SANCHAR/src/tender/tender_stations.php?ActivityId=${ActivityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.stations)) {
          const stationObjects = data.stations.map((stationName, index) => ({
            id: (index + 1).toString(),
            name: stationName,
            location: `Location for ${stationName}`,
          }))
          setStations(stationObjects)
        } else {
          setStations([])
        }
      })
      .catch(() => setStations([]))

    // Fetch technicians
    fetch("https://namami-infotech.com/SANCHAR/src/employee/list_employee.php?Tenent_Id=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTechnicians(data.data)
        } else {
          setTechnicians([])
        }
      })
      .catch(() => setTechnicians([]))
  }, [ActivityId])

  const handleStationToggle = (station) => {
    setSelectedStations((prev) => {
      const isSelected = prev.some((s) => s.id === station.id)
      if (isSelected) {
        return prev.filter((s) => s.id !== station.id)
      } else {
        return [...prev, station]
      }
    })
  }

  const handleTechnicianChange = (event) => {
    const selectedTechnician = technicians.find((t) => t.EmpId === event.target.value)
    setTechnician(selectedTechnician || null)
  }

  const handleSubmit = async () => {
    if (!milestone || selectedStations.length === 0 || !technician || !date) {
      showNotification("Please fill in all required fields before assigning the task.", "error")
      return
    }

    setIsLoading(true)
    setSubmissionResults([])

    const selectedMilestone = milestones.find((m) => m.value === milestone)
    const results = []

    try {
      for (const station of selectedStations) {
        const taskData = {
          Milestone: selectedMilestone.label,
          MenuId: milestone,
          EmpName: technician.Name,
          EmpId: technician.EmpId,
          Station: station.name,
          TargetDate: format(date, "yyyy-MM-dd"),
        }

        try {
          const response = await fetch("https://namami-infotech.com/SANCHAR/src/task/add_task.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
          })

          const result = await response.json()

          results.push({
            station: station.name,
            success: result.success || response.ok,
            message: result.message || (response.ok ? "Task created successfully" : "Failed to create task"),
            data: taskData,
          })
        } catch (error) {
          results.push({
            station: station.name,
            success: false,
            message: `Error: ${error.message}`,
            data: taskData,
          })
        }
      }

      setSubmissionResults(results)

      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      if (successCount === results.length) {
        showNotification(`All ${successCount} tasks assigned successfully!`, "success")
      } else if (successCount > 0) {
        showNotification(`${successCount} tasks assigned successfully, ${failCount} failed.`, "warning")
      } else {
        showNotification("All task assignments failed.", "error")
      }

      if (successCount === results.length) {
        setMilestone("")
        setSelectedStations([])
        setTechnician(null)
        setDate(null)
      }
    } catch (error) {
      showNotification("An error occurred while assigning tasks.", "error")
      console.error("Submission error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMilestone = milestones.find((m) => m.value === milestone)
  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(stationSearch.toLowerCase()),
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", padding: "1px" }}
      >
        <StyledCard>
          <CardHeader
            sx={{
              textAlign: "center",
              pb: 2,
              background: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
            }}
            title={
              <Typography
                variant="h4"
                component="div"
                sx={{
                  background: "linear-gradient(45deg, #ff9800, #f57c00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                Assign Task to Technician
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="text.secondary">
                Complete the form to assign tasks to multiple stations
              </Typography>
            }
          />

          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Milestone Selection */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#ff9800" }}>
                  Select Milestone
                </Typography>
                <Grid container spacing={2}>
                  {milestones.map((item) => (
                    <Grid item xs={12} sm={6} key={item.value}>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <MilestoneButton
                          isSelected={milestone === item.value}
                          milestoneColor={item.color}
                          milestoneBg={item.bgColor}
                          onClick={() => setMilestone(item.value)}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {item.label}
                              </Typography>
                              <Chip
                                label={`Phase ${item.value-1}`}
                                size="small"
                                sx={{
                                  mt: 1,
                                  backgroundColor: item.bgColor,
                                  color: item.color,
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                            {milestone === item.value && <CheckCircle sx={{ color: item.color, fontSize: 28 }} />}
                          </Box>
                        </MilestoneButton>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider sx={{ borderColor: "#ffcc80" }} />

              <Grid container spacing={3}>
                {/* Station Selection */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#ff9800" }}>
                    Select Stations ({selectedStations.length} selected)
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Search stations..."
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ color: "#ff9800", mr: 1 }} />,
                    }}
                    sx={{ mb: 2 }}
                  />

                  <Paper
                    sx={{
                      maxHeight: 280,
                      overflow: "auto",
                      border: "2px solid #ffcc80",
                      borderRadius: 2,
                    }}
                  >
                    <List dense>
                      {filteredStations.length > 0 ? (
                        filteredStations.map((station) => {
                          const isSelected = selectedStations.some((s) => s.id === station.id)
                          return (
                            <StyledListItem
                              key={station.id}
                              button
                              onClick={() => handleStationToggle(station)}
                              isSelected={isSelected}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  checked={isSelected}
                                  sx={{
                                    color: "#ff9800",
                                    "&.Mui-checked": {
                                      color: "#ff9800",
                                    },
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "#fff3e0", color: "#ff9800" }}>
                                  <LocationOn />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body2" fontWeight="medium">
                                    {station.name}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary">
                                    {station.location}
                                  </Typography>
                                }
                              />
                            </StyledListItem>
                          )
                        })
                      ) : (
                        <ListItem>
                          <ListItemText
                            primary={
                              <Typography variant="body2" color="text.secondary" textAlign="center">
                                No stations found matching your search
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>

                  {selectedStations.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" fontWeight="medium" color="#ff9800">
                        Selected Stations:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                        {selectedStations.map((station) => (
                          <Chip
                            key={station.id}
                            label={station.name}
                            onDelete={() => handleStationToggle(station)}
                            size="small"
                            sx={{
                              backgroundColor: "#fff3e0",
                              color: "#ff9800",
                              "& .MuiChip-deleteIcon": {
                                color: "#ff9800",
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Technician and Date Selection */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Technician Selection */}
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#ff9800" }}>
                        Select Technician
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel>Select Technician</InputLabel>
                        <Select
                          value={technician?.EmpId || ""}
                          label="Select Technician"
                          onChange={handleTechnicianChange}
                        >
                          {technicians.map((tech) => (
                            <MenuItem key={tech.EmpId} value={tech.EmpId}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Avatar src={tech.Avatar || undefined} sx={{ width: 32, height: 32 }}>
                                  {!tech.Avatar && <Person />}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {tech.Name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {tech.Designation}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {technician && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            mt: 2,
                            bgcolor: "#fff3e0",
                            border: "2px solid #ffcc80",
                            borderRadius: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              src={technician.Avatar || undefined}
                              sx={{ width: 48, height: 48, border: "2px solid #ff9800" }}
                            >
                              {!technician.Avatar && <Person />}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {technician.Name}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                <Work fontSize="small" />
                                <Typography variant="body2">{technician.Designation}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      )}
                    </Box>

                    {/* Date Selection */}
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#ff9800" }}>
                        Target Completion Date
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Target Completion Date"
                          value={date}
                          onChange={(newValue) => setDate(newValue)}
                          minDate={new Date()}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: <CalendarToday sx={{ color: "#ff9800", mr: 1 }} />,
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Task Summary */}
              {milestone && selectedStations.length > 0 && technician && date && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: "#fff3e0",
                    border: "2px solid #ffcc80",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" textAlign="center" gutterBottom sx={{ color: "#ff9800", fontWeight: 600 }}>
                    Task Assignment Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Milestone:</strong> {selectedMilestone?.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Technician:</strong> {technician.Name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Stations:</strong> {selectedStations.length} selected
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Target Date:</strong> {format(date, "PPP")}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography
                    variant="body2"
                    sx={{ mt: 2, fontStyle: "italic", textAlign: "center", color: "text.secondary" }}
                  >
                    This will create {selectedStations.length} separate task(s) for each station.
                  </Typography>
                </Paper>
              )}

              {/* Submission Results */}
              {submissionResults.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#ff9800" }}>
                    Submission Results
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {submissionResults.map((result, index) => (
                      <Alert key={index} severity={result.success ? "success" : "error"}>
                        <strong>{result.station}:</strong> {result.message}
                      </Alert>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                <OrangeButton
                  onClick={handleSubmit}
                  disabled={isLoading || !milestone || selectedStations.length === 0 || !technician || !date}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Add />}
                  size="large"
                >
                  {isLoading ? "Assigning Tasks..." : `Assign ${selectedStations.length || 0} Task(s)`}
                </OrangeButton>
              </Box>
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
