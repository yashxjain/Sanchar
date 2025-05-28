"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  CalendarToday,
  CheckCircle,
  Schedule,
  LocationOn,
  Person,
  Work,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material"
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Chip,
  Divider,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { styled } from "@mui/material/styles"
import { toast } from "react-toastify"
import { useParams } from "react-router-dom"

const milestones = [
  {
    label: "Civil Work",
    value: "1",
    icon: (
      <Badge badgeContent="1" color="primary" overlap="circular">
        <Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24 }} />
      </Badge>
    ),
    color: "primary",
  },
  {
    label: "Installation",
    value: "2",
    icon: (
      <Badge badgeContent="2" color="secondary" overlap="circular">
        <Avatar sx={{ bgcolor: "secondary.main", width: 24, height: 24 }} />
      </Badge>
    ),
    color: "secondary",
  },
  {
    label: "Antenna Tunning",
    value: "3",
    icon: (
      <Badge badgeContent="3" color="success" overlap="circular">
        <Avatar sx={{ bgcolor: "success.main", width: 24, height: 24 }} />
      </Badge>
    ),
    color: "success",
  },
  {
    label: "Final Check & Completion Certificate",
    value: "4",
    icon: (
      <Badge badgeContent="4" color="warning" overlap="circular">
        <Avatar sx={{ bgcolor: "warning.main", width: 24, height: 24 }} />
      </Badge>
    ),
    color: "warning",
  },
]

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: "700px",
  margin: "auto",
  boxShadow: theme.shadows[10],
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(10px)",
}))

const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: "#fb923c",
  },
})

const StyledTab = styled(Tab)({
  "&.Mui-selected": {
    color: "#fb923c",
  },
})

const OrangeButton = styled(Button)({
  backgroundColor: "#fb923c",
  "&:hover": {
    backgroundColor: "#ea580c",
  },
})

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function TaskAssignment() {
    const {ActivityId} = useParams()
    console.log("ActivityId:", ActivityId)
  const [milestone, setMilestone] = useState("")
  const [stations, setStations] = useState([])
  const [station, setStation] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [technician, setTechnician] = useState(null)
  const [date, setDate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  useEffect(() => {
    // Fetch stations
    fetch(`https://namami-infotech.com/SANCHAR/src/tender/tender_stations.php?ActivityId=${ActivityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.stations)) {
          // Convert string array to Station objects
          const stationObjects = data.stations.map((stationName, index) => ({
            id: (index + 1).toString(),
            name: stationName,
            location: `Location for ${stationName}`, // You can modify this based on your needs
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
  }, ActivityId)

  const handleSubmit = () => {
    if (!milestone || !station || !technician || !date) {
      toast.error("Please fill in all required fields before assigning the task.")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Prepare submission data
      const submitData = {
        milestone,
        station: station.id,
        technician: technician.EmpId,
        tentativeDate: format(date, "yyyy-MM-dd"),
      }

      console.log("Assign Task Data:", submitData)

      toast.success(
        `${technician.Name} has been assigned to ${station.name} for ${
          milestones.find((m) => m.value === milestone)?.label
        }.`,
      )

      // Reset form
      setActiveTab(0)
      setMilestone("")
      setStation(null)
      setTechnician(null)
      setDate(null)
    }, 1500)
  }

  const canProceed = () => {
    if (activeTab === 0 && !milestone) return false
    if (activeTab === 1 && !station) return false
    if (activeTab === 2 && !technician) return false
    if (activeTab === 3 && !date) return false
    return true
  }

  const handleNext = () => {
    if (canProceed()) {
      setActiveTab((prev) => Math.min(prev + 1, 3))
    } else {
      toast.error("Please make a selection before proceeding.")
    }
  }

  const handleBack = () => {
    setActiveTab((prev) => Math.max(prev - 1, 0))
  }

  const handleStationChange = (event) => {
    const selectedStation = stations.find((s) => s.id === event.target.value)
    setStation(selectedStation || null)
  }

  const handleTechnicianChange = (event) => {
    const selectedTechnician = technicians.find((t) => t.EmpId === event.target.value)
    setTechnician(selectedTechnician || null)
  }

  const selectedMilestone = milestones.find((m) => m.value === milestone)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: "100%", maxWidth: "700px", margin: "0 auto", maxHeight: "70vh", overflowY: "auto" }}
    >
      <StyledCard>
        <CardHeader
          title={
            <Typography
              variant="h4"
              component="div"
              sx={{
                textAlign: "center",
                background: "linear-gradient(to right, #f97316, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
              }}
            >
              Assign Task to Technician
            </Typography>
          }
          subheader="Complete the form to assign a new task"
          subheaderTypographyProps={{ textAlign: "center" }}
        />

        <StyledTabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ px: 2 }}
        >
          <StyledTab label={activeTab === 0 ? "Milestone" : "1"} disabled={activeTab !== 0 && !milestone} />
          <StyledTab label={activeTab === 1 ? "Station" : "2"} disabled={activeTab !== 1 && !station} />
          <StyledTab label={activeTab === 2 ? "Technician" : "3"} disabled={activeTab !== 2 && !technician} />
          <StyledTab label={activeTab === 3 ? "Date" : "4"} disabled={activeTab !== 3 && !date} />
        </StyledTabs>

        <CardContent>
          <TabPanel value={activeTab} index={0}>
            <Typography variant="subtitle1" gutterBottom>
              Select Milestone
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
              {milestones.map((item) => (
                <motion.div key={item.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      py: 2,
                      px: 3,
                      borderColor: milestone === item.value ? `${item.color}.main` : undefined,
                      backgroundColor: milestone === item.value ? `${item.color}.light` : undefined,
                    }}
                    onClick={() => setMilestone(item.value)}
                    startIcon={item.icon}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      <Typography variant="body1" fontWeight="medium">
                        {item.label}
                      </Typography>
                      <Chip
                        label={`Phase ${item.value}`}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: `${item.color}.light`,
                          color: `${item.color}.dark`,
                        }}
                      />
                    </Box>
                    {milestone === item.value && <CheckCircle sx={{ ml: "auto", color: `${item.color}.main` }} />}
                  </Button>
                </motion.div>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="station-label">Select Station</InputLabel>
              <Select
                labelId="station-label"
                id="station-select"
                value={station?.id || ""}
                label="Select Station"
                onChange={handleStationChange}
              >
                <MenuItem disabled value="">
                  <em>Select station...</em>
                </MenuItem>
                {stations.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    <ListItemText
                      primary={s.name}
                      secondary={s.location}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {station && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 2, bgcolor: "orange.50", border: "1px solid", borderColor: "orange.100" }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "orange.100", color: "orange.500" }}>
                      <LocationOn />
                    </Avatar>
                    <Box>
                      <Typography fontWeight="medium">{station.name}</Typography>
                      {station.location && (
                        <Typography variant="body2" color="text.secondary">
                          {station.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="technician-label">Select Technician</InputLabel>
              <Select
                labelId="technician-label"
                id="technician-select"
                value={technician?.EmpId || ""}
                label="Select Technician"
                onChange={handleTechnicianChange}
              >
                <MenuItem disabled value="">
                  <em>Select technician...</em>
                </MenuItem>
                {technicians.map((tech) => (
                  <MenuItem key={tech.EmpId} value={tech.EmpId}>
                    <ListItemAvatar>
                      <Avatar src={tech.Avatar || undefined}>{!tech.Avatar && <Person />}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={tech.Name}
                      secondary={tech.Designation}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {technician && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, bgcolor: "orange.50", border: "1px solid", borderColor: "orange.100" }}
                >
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Avatar
                      src={technician.Avatar || undefined}
                      sx={{ width: 56, height: 56, border: "2px solid", borderColor: "orange.200" }}
                    >
                      {!technician.Avatar && <Person fontSize="large" />}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="medium">{technician.Name}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary", mt: 0.5 }}>
                        <Work fontSize="small" />
                        <Typography variant="body2">{technician.Designation}</Typography>
                      </Box>

                      {technician.Skills && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                          {technician.Skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" />
                          ))}
                        </Box>
                      )}

                      {technician.Rating && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                          {[...Array(5)].map((_, i) => (
                            <Box
                              key={i}
                              component="span"
                              sx={{
                                color: i < Math.floor(technician.Rating || 0) ? "amber.400" : "grey.300",
                                fontSize: "1rem",
                              }}
                            >
                              ★
                            </Box>
                          ))}
                          <Typography variant="caption" color="text.secondary">
                            {technician.Rating}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Tentative Completion Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                minDate={new Date()}
                renderInput={(params) => <TextField {...params} fullWidth />}
                components={{
                  OpenPickerIcon: CalendarToday,
                }}
              />
            </LocalizationProvider>

            {date && milestone && station && technician && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Paper
                  elevation={0}
                  sx={{ p: 3, mt: 3, bgcolor: "orange.50", border: "1px solid", borderColor: "orange.100" }}
                >
                  <Typography fontWeight="medium" textAlign="center" gutterBottom>
                    Task Summary
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <List dense>
                    <ListItem>
                      {selectedMilestone?.icon}
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <Typography component="span" color="text.secondary">
                              Milestone:{" "}
                            </Typography>
                            <Typography component="span" fontWeight="medium">
                              {selectedMilestone?.label}
                            </Typography>
                          </Typography>
                        }
                        sx={{ ml: 2 }}
                      />
                    </ListItem>

                    <ListItem>
                      <LocationOn color="primary" />
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <Typography component="span" color="text.secondary">
                              Station:{" "}
                            </Typography>
                            <Typography component="span" fontWeight="medium">
                              {station.name}
                            </Typography>
                          </Typography>
                        }
                        sx={{ ml: 2 }}
                      />
                    </ListItem>

                    <ListItem>
                      <Person color="primary" />
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <Typography component="span" color="text.secondary">
                              Technician:{" "}
                            </Typography>
                            <Typography component="span" fontWeight="medium">
                              {technician.Name}
                            </Typography>
                          </Typography>
                        }
                        sx={{ ml: 2 }}
                      />
                    </ListItem>

                    <ListItem>
                      <Schedule color="primary" />
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <Typography component="span" color="text.secondary">
                              Due Date:{" "}
                            </Typography>
                            <Typography component="span" fontWeight="medium">
                              {format(date, "PPP")}
                            </Typography>
                          </Typography>
                        }
                        sx={{ ml: 2 }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </motion.div>
            )}
          </TabPanel>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
          <Button variant="outlined" disabled={activeTab === 0} onClick={handleBack} startIcon={<ChevronLeft />}>
            Back
          </Button>

          {activeTab !== 3 ? (
            <OrangeButton variant="contained" onClick={handleNext} endIcon={<ChevronRight />}>
              Next
            </OrangeButton>
          ) : (
            <OrangeButton
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isLoading ? "Assigning..." : "Assign Task"}
            </OrangeButton>
          )}
        </CardActions>
      </StyledCard>
    </motion.div>
  )
}
