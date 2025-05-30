"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Grid,
  Autocomplete,
  Container,
  Skeleton,
  Alert,
  Button,
  Tooltip,
  TableSortLabel,
  InputAdornment,
  Fab,
  Zoom,
} from "@mui/material"
import {
  Visibility,
  Search,
  FilterList,
  Assignment,
  Person,
  LocationOn,
  CalendarToday,
  Add,
  Refresh,
  Dashboard,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import { motion, AnimatePresence } from "framer-motion"

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
}))

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  "& .MuiTableHead-root": {
    background: "linear-gradient(135deg, #F69320 0%, #F69320 100%)",
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    color: "white",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.04)",
    transform: "scale(1.001)",
    transition: "all 0.2s ease-in-out",
  },
}))

const getStatusChipProps = (status) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { bg: "#e8f5e8", color: "#2e7d32", border: "#4caf50" }
      case "assigned":
        return { bg: "#fff3e0", color: "#f57c00", border: "#ff9800" }
      case "in progress":
        return { bg: "#e3f2fd", color: "#1565c0", border: "#2196f3" }
      case "pending":
        return { bg: "#fce4ec", color: "#c2185b", border: "#e91e63" }
      default:
        return { bg: "#f5f5f5", color: "#757575", border: "#bdbdbd" }
    }
  }

  const colors = getStatusColor()
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: "0.75rem",
  }
}

const FilterCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
  border: "1px solid #dee2e6",
}))

export default function ProjectTaskView() {
  const { TenderNo } = useParams()
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState("TargetDate")
  const [order, setOrder] = useState("asc")
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [stations, setStations] = useState([])
  const [statuses, setStatuses] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `https://namami-infotech.com/SANCHAR/src/task/project_task.php?TenderNo=${TenderNo}`,
        )
        if (response.data.success) {
          const tasksData = response.data.data
          setTasks(tasksData)
          setFilteredTasks(tasksData)

          // Extract unique values for filters
          const uniqueMilestones = [...new Set(tasksData.map((task) => task.Milestone).filter(Boolean))]
          const uniqueStations = [...new Set(tasksData.map((task) => task.Station).filter(Boolean))]
          const uniqueStatuses = [...new Set(tasksData.map((task) => task.Status).filter(Boolean))]

          setMilestones(uniqueMilestones)
          setStations(uniqueStations)
          setStatuses(uniqueStatuses)
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err)
      } finally {
        setLoading(false)
      }
    }

    if (TenderNo) fetchTasks()
  }, [TenderNo])

  useEffect(() => {
    let filtered = tasks

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((task) => {
        const searchFields = [task.Milestone, task.EmpName, task.Station].join(" ").toLowerCase()
        return searchFields.includes(searchTerm.toLowerCase())
      })
    }

    // Apply milestone filter
    if (selectedMilestone) {
      filtered = filtered.filter((task) => task.Milestone === selectedMilestone)
    }

    // Apply station filter
    if (selectedStation) {
      filtered = filtered.filter((task) => task.Station === selectedStation)
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter((task) => task.Status === selectedStatus)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[orderBy] || ""
      const bValue = b[orderBy] || ""

      if (orderBy === "TargetDate") {
        const dateA = new Date(aValue)
        const dateB = new Date(bValue)
        return order === "asc" ? dateA - dateB : dateB - dateA
      }

      return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })

    setFilteredTasks(filtered)
    setPage(0)
  }, [tasks, searchTerm, selectedMilestone, selectedStation, selectedStatus, orderBy, order])

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedMilestone(null)
    setSelectedStation(null)
    setSelectedStatus(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return isNaN(date) ? "-" : date.toLocaleDateString("en-GB")
  }

  const getTaskStats = () => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((task) => task.Status?.toLowerCase() === "completed").length
    const assigned = filteredTasks.filter((task) => task.Status?.toLowerCase() === "assigned").length
    const inProgress = filteredTasks.filter((task) => task.Status?.toLowerCase() === "in progress").length

    return { total, completed, assigned, inProgress }
  }

  const stats = getTaskStats()

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" component="h4" gutterBottom sx={{ fontWeight: 700, color: "#F69320" }}>
            <Assignment sx={{ mr: 2, verticalAlign: "middle" }} />
            Task Management Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tender No: {TenderNo}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Total Tasks
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "#1976d2" }}>
                        {stats.total}
                      </Typography>
                    </Box>
                    <Dashboard sx={{ fontSize: 40, color: "#1976d2", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Completed
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                        {stats.completed}
                      </Typography>
                    </Box>
                    <Assignment sx={{ fontSize: 40, color: "#2e7d32", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Assigned
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "#f57c00" }}>
                        {stats.assigned}
                      </Typography>
                    </Box>
                    <Person sx={{ fontSize: 40, color: "#f57c00", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        In Progress
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: "#1565c0" }}>
                        {stats.inProgress}
                      </Typography>
                    </Box>
                    <CalendarToday sx={{ fontSize: 40, color: "#1565c0", opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        </Grid>

        {/* Filters */}
        <FilterCard>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FilterList sx={{ mr: 1 }} />
              Filters & Search
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Autocomplete
                  size="small"
                  options={milestones}
                  value={selectedMilestone}
                  onChange={(event, newValue) => setSelectedMilestone(newValue)}
                  renderInput={(params) => <TextField {...params} label="Milestone" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Autocomplete
                  size="small"
                  options={stations}
                  value={selectedStation}
                  onChange={(event, newValue) => setSelectedStation(newValue)}
                  renderInput={(params) => <TextField {...params} label="Station" />}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Autocomplete
                  size="small"
                  options={statuses}
                  value={selectedStatus}
                  onChange={(event, newValue) => setSelectedStatus(newValue)}
                  renderInput={(params) => <TextField {...params} label="Status" />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" onClick={clearFilters} size="small">
                    Clear Filters
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={() => window.location.reload()}
                    size="small"
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </FilterCard>

        {/* Tasks Table */}
        <StyledCard>
          <CardContent sx={{ p: 0 }}>
            <StyledTableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#F69320" }}>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "Station"}
                        direction={orderBy === "Station" ? order : "asc"}
                        onClick={() => handleSort("Station")}
                        sx={{ color: "white !important" }}
                      >
                        <LocationOn sx={{ mr: 1, fontSize: 18 }} />
                        Station
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "Milestone"}
                        direction={orderBy === "Milestone" ? order : "asc"}
                        onClick={() => handleSort("Milestone")}
                        sx={{ color: "white !important" }}
                      >
                        <Assignment sx={{ mr: 1, fontSize: 18 }} />
                        Milestone
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "EmpName"}
                        direction={orderBy === "EmpName" ? order : "asc"}
                        onClick={() => handleSort("EmpName")}
                        sx={{ color: "white !important" }}
                      >
                        <Person sx={{ mr: 1, fontSize: 18 }} />
                        Assigned To
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === "TargetDate"}
                        direction={orderBy === "TargetDate" ? order : "asc"}
                        onClick={() => handleSort("TargetDate")}
                        sx={{ color: "white !important" }}
                      >
                        <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                        Target Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task, index) => (
                      <motion.tr
                        key={task.Id}
                        component={TableRow}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        hover
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {task.Station || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {task.Milestone || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="body2">{task.EmpName || "-"}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(task.TargetDate)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={task.Status || "Unknown"} size="small" sx={getStatusChipProps(task.Status)} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Task Details">
                            <IconButton
                              onClick={() => navigate(`/task/view/${task.Id}`)}
                              sx={{
                                color: "#1976d2",
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease-in-out",
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredTasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Alert severity="info" sx={{ maxWidth: 400, mx: "auto" }}>
                          <Typography variant="body1">No tasks found matching your criteria</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or search terms
                          </Typography>
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredTasks.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: "1px solid #e0e0e0",
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: 2,
                  paddingRight: 2,
                },
              }}
            />
          </CardContent>
        </StyledCard>

        
      </motion.div>
    </Container>
  )
}
