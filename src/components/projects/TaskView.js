"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  Alert,
} from "@mui/material"
import {
  ArrowBack,
  CalendarToday,
  CheckCircle,
  LocationOn,
  Visibility,
  ExpandMore,
  Code,
  QuestionAnswer,
  TextFields,
  DateRange,
  AttachFile,
  Category,
} from "@mui/icons-material"
import { styled } from "@mui/material/styles"

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
  borderRadius: theme.spacing(2),
}))

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#e8f5e8",
  color: "#2e7d32",
  fontWeight: 600,
}))

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  aspectRatio: "1",
  overflow: "hidden",
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  "&:hover .overlay": {
    opacity: 1,
  },
}))

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.3s ease",
}))

const MetaInfoBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}))

const CheckpointCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}))

const ValueBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}))

const SubPointCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50],
}))

const TaskView = () => {
  const { TaskId } = useParams()
  const navigate = useNavigate()

  const [taskDetails, setTaskDetails] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkpointsLoading, setCheckpointsLoading] = useState(true)
  const [menusLoading, setMenusLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://namami-infotech.com/SANCHAR/src/task/get_task_detail.php?taskId=${TaskId}`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch task details: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setTaskDetails(data.data)
        } else {
          throw new Error(data.message || "Failed to retrieve task details")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (TaskId) {
      fetchTaskDetails()
    }
  }, [TaskId])

  // Fetch menus
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setMenusLoading(true)
        const response = await fetch("https://namami-infotech.com/SANCHAR/src/menu/get_menu.php")

        if (!response.ok) {
          throw new Error(`Failed to fetch menus: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setMenus(data.data)
        } else {
          throw new Error(data.message || "Failed to retrieve menus")
        }
      } catch (err) {
        console.error("Error fetching menus:", err)
      } finally {
        setMenusLoading(false)
      }
    }

    fetchMenus()
  }, [])

  // Fetch checkpoints
  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        setCheckpointsLoading(true)
        const response = await fetch("https://namami-infotech.com/SANCHAR/src/menu/get_checkpoints.php")

        if (!response.ok) {
          throw new Error(`Failed to fetch checkpoints: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setCheckpoints(data.data)
        } else {
          throw new Error(data.message || "Failed to retrieve checkpoints")
        }
      } catch (err) {
        console.error("Error fetching checkpoints:", err)
      } finally {
        setCheckpointsLoading(false)
      }
    }

    fetchCheckpoints()
  }, [])

  // Helper function to check if a value is an image URL
  const isImageUrl = (value) => {
    return value?.includes(".jpg") || value?.includes(".jpeg") || value?.includes(".png") || value?.includes(".gif")
  }

  // Extract main checkpoint ID from ChkId (e.g., "124.1" -> 124, "120" -> 120)
  const extractMainCheckpointId = (chkId) => {
    const match = chkId.match(/^(\d+)/)
    return match ? Number.parseInt(match[1]) : null
  }

  // Check if ChkId has sub-points (e.g., "124.1", "124.2")
  const hasSubPoint = (chkId) => {
    return chkId.includes(".") && !chkId.includes(".meta")
  }

  // Get sub-point number (e.g., "124.1" -> 1, "124.2" -> 2)
  const getSubPointNumber = (chkId) => {
    const match = chkId.match(/\.(\d+)$/)
    return match ? Number.parseInt(match[1]) : null
  }

  // Get checkpoint by ID from the checkpoints API
  const getCheckpointById = (checkpointId) => {
    return checkpoints.find((cp) => cp.CheckpointId === checkpointId)
  }

  // Get menu category for a checkpoint ID
  const getMenuCategoryForCheckpoint = (checkpointId) => {
    for (const menu of menus) {
      if (menu.CheckpointId) {
        const ids = menu.CheckpointId.split(/[,;]/).map((id) => Number.parseInt(id.trim()))
        if (ids.includes(checkpointId)) {
          return menu.Cat
        }
      }
    }
    return null
  }

  // Get type icon based on TypeId
  const getTypeIcon = (typeId) => {
    switch (typeId) {
      case 4:
        return <DateRange />
      case 8:
        return <AttachFile />
      case 26:
        return <TextFields />
      default:
        return <QuestionAnswer />
    }
  }

  // Get type description
  const getTypeDescription = (typeId) => {
    const typeMap = {
      4: "Date/Time",
      8: "File Upload",
      26: "Text Input",
      1: "Single Choice",
      2: "Multiple Choice",
      3: "Text Area",
      5: "Number",
      6: "Email",
      7: "Phone",
      9: "Location",
      10: "Signature",
    }
    return typeMap[typeId] || `Type ${typeId}`
  }

  // Group task details by type
  const getMetaDetails = () => {
    return taskDetails.filter((item) => item.ChkId.includes(".meta"))
  }

  const getImageDetails = () => {
    return taskDetails.filter((item) => isImageUrl(item.Value))
  }

  const getRegularDetails = () => {
    return taskDetails.filter((item) => !item.ChkId.includes(".meta") && !isImageUrl(item.Value))
  }

  // Group checkpoints with their sub-points
  const getGroupedCheckpoints = () => {
    const grouped = {}

    taskDetails.forEach((detail) => {
      if (!detail.ChkId.includes(".meta")) {
        const mainCheckpointId = extractMainCheckpointId(detail.ChkId)

        if (!grouped[mainCheckpointId]) {
          grouped[mainCheckpointId] = {
            mainCheckpointId,
            checkpoint: getCheckpointById(mainCheckpointId),
            menuCategory: getMenuCategoryForCheckpoint(mainCheckpointId),
            items: [],
          }
        }

        grouped[mainCheckpointId].items.push({
          taskDetail: detail,
          isSubPoint: hasSubPoint(detail.ChkId),
          subPointNumber: getSubPointNumber(detail.ChkId),
          isImage: isImageUrl(detail.Value),
        })
      }
    })

    // Sort items within each group by sub-point number
    Object.values(grouped).forEach((group) => {
      group.items.sort((a, b) => {
        if (a.subPointNumber && b.subPointNumber) {
          return a.subPointNumber - b.subPointNumber
        }
        return 0
      })
    })

    return Object.values(grouped)
  }

  // Extract location from LatLong
  const getLocation = () => {
    if (taskDetails.length > 0) {
      return taskDetails[0].LatLong || "Location not available"
    }
    return "Location not available"
  }

  // Extract date from ActivityId or Datetime
  const getTaskDate = () => {
    if (taskDetails.length > 0) {
      const detail = taskDetails[0]
      if (detail.Datetime) {
        return new Date(detail.Datetime).toLocaleDateString()
      }
      if (detail.ActivityId) {
        const dateMatch = detail.ActivityId.match(/\d{4}-\d{2}-\d{2}/)
        if (dateMatch) {
          return dateMatch[0]
        }
      }
    }
    return "Date not available"
  }

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setImageDialogOpen(true)
  }

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false)
    setSelectedImage(null)
  }

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Skeleton variant="text" width={200} height={40} />
        </Box>

        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="100%" height={30} />
              <Skeleton variant="text" width="75%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={120} />
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Task Details
          </Typography>
        </Box>

        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Task
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Return to Tasks
          </Button>
        </Alert>
      </Box>
    )
  }

  const groupedCheckpoints = getGroupedCheckpoints()

  return (
    <Box sx={{ p: { xs: 0, md: 0 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Task Details #{TaskId}
        </Typography>
      </Box>

      {/* Main Content */}
      <StyledCard>
        <CardContent sx={{ p: 0 }}>
          

          

          <Box sx={{ mb: 0 }}>
          
            {groupedCheckpoints.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">No checkpoint data found for this task.</Typography>
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {groupedCheckpoints.map((group) => (
                  <Grid item xs={12} key={group.mainCheckpointId}>
                    <CheckpointCard>
                      <CardContent sx={{ p: 3 }}>
                        {/* Menu Category Badge */}
                        {group.menuCategory && (
                          <Box sx={{ mb: 2 }}>
                            <Chip
                              icon={<Category />}
                              label={group.menuCategory}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        )}

                        {/* Main Checkpoint Info */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            {group.checkpoint && getTypeIcon(group.checkpoint.TypeId)}
                            <Typography variant="h6" component="h4" fontWeight="medium" sx={{ ml: 1 }}>
                              Checkpoint {group.mainCheckpointId}
                              {group.checkpoint && ` - ${group.checkpoint.Description}`}
                            </Typography>
                          </Box>

                          {group.checkpoint && (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                              <Chip
                                size="small"
                                label={getTypeDescription(group.checkpoint.TypeId)}
                                variant="outlined"
                              />
                              {group.checkpoint.Mandatory === 1 && (
                                <Chip size="small" label="Mandatory" color="error" variant="outlined" />
                              )}
                              {group.checkpoint.Active === 1 ? (
                                <Chip size="small" label="Active" color="success" variant="outlined" />
                              ) : (
                                <Chip size="small" label="Inactive" color="default" variant="outlined" />
                              )}
                            </Box>
                          )}
                        </Box>

                        {/* Sub-points and Items */}
                        <Box>
                          {group.items.map((item, index) => (
                            <Box key={item.taskDetail.SRNo} sx={{ mb: 2 }}>
                              {item.isSubPoint && (
                                <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mb: 1 }}>
                                  {item.taskDetail.ChkId} {item.isImage ? "(Image)" : "(Data)"}
                                </Typography>
                              )}

                              {item.isImage ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                  <ImageContainer
                                    onClick={() => handleImageClick(item.taskDetail.Value)}
                                    sx={{ width: 120, height: 120 }}
                                  >
                                    <img
                                      src={item.taskDetail.Value || "/placeholder.svg"}
                                      alt={`Checkpoint ${group.mainCheckpointId} image`}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <ImageOverlay className="overlay">
                                      <IconButton size="small" sx={{ color: "white" }}>
                                        <Visibility />
                                      </IconButton>
                                    </ImageOverlay>
                                  </ImageContainer>
                                  <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                      {item.isSubPoint ? `Sub-point ${item.subPointNumber}` : "Main Image"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Captured: {item.taskDetail.Datetime || "N/A"}
                                    </Typography>
                                  </Box>
                                </Box>
                              ) : (
                                <ValueBox>
                                  <Typography variant="body1" fontWeight="medium">
                                    {item.taskDetail.Value || "No value provided"}
                                  </Typography>
                                  {item.taskDetail.Datetime && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ mt: 1, display: "block" }}
                                    >
                                      Recorded: {item.taskDetail.Datetime}
                                    </Typography>
                                  )}
                                </ValueBox>
                              )}
                            </Box>
                          ))}
                        </Box>

                        {/* Additional checkpoint info */}
                        {group.checkpoint && (group.checkpoint.Options || group.checkpoint.Validation !== "0") && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                            {group.checkpoint.Options && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <strong>Options:</strong> {group.checkpoint.Options}
                              </Typography>
                            )}
                            {group.checkpoint.Validation !== "0" && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Validation:</strong> {group.checkpoint.Validation}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </CheckpointCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

        
        </CardContent>
      </StyledCard>

      

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={handleCloseImageDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Task Image</Typography>
            <IconButton onClick={handleCloseImageDialog}>
              <ArrowBack />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedImage && (
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Task image full size"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TaskView
