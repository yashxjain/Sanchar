"use client"

import { useEffect, useState } from "react"
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Button,
  Divider,
  Avatar,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../../assets/images (1).png"
import { FileText, ImageIcon, ExternalLink, Eye } from "lucide-react"

function TempTenderView() {
  const { activityId } = useParams()
  const [details, setDetails] = useState([])
  const [checkpoints, setCheckpoints] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")

  // Checkpoint groups
  const sections = {
    "Participants Details": [15, 16],
    "Winner Tender": [17, 18, 20, 21, 22, 23, 24, 25, 26, 27],
    LOA: [28, 29, 30, 31, 32, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 81, 82],
  }

  const candidateDetailsIds = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12]
  const studentPhotoChkId = 2 // Assume 13 is the image URL

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailsRes, checkpointsRes] = await Promise.all([
          axios.get(
            `https://namami-infotech.com/SANCHAR/src/menu/get_transaction_dtl.php?activityId=${encodeURIComponent(
              activityId,
            )}`,
          ),
          axios.get(`https://namami-infotech.com/SANCHAR/src/menu/get_checkpoints.php`),
        ])

        if (detailsRes.data.success && checkpointsRes.data.success) {
          const checkpointMap = {}
          checkpointsRes.data.data.forEach((cp) => {
            checkpointMap[cp.CheckpointId] = cp.Description
          })
          setCheckpoints(checkpointMap)
          setDetails(detailsRes.data.data)
        } else {
          setError("No details or checkpoints found.")
        }
      } catch (err) {
        setError("Failed to fetch admission details.")
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [activityId])

  const getValueByChkId = (chkId) => {
    const item = details.find((d) => Number.parseInt(d.ChkId) === chkId)
    return item ? item.Value : ""
  }

  // Function to check if a value is an image URL
  const isImageUrl = (url) => {
    if (!url || typeof url !== "string") return false
    return (
      url.startsWith("https://") &&
      (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif"))
    )
  }

  // Function to check if a value is a PDF URL
  const isPdfUrl = (url) => {
    if (!url || typeof url !== "string") return false
    return url.startsWith("https://") && url.includes(".pdf")
  }

  // Function to open file in new tab
  const openFileInNewTab = (url) => {
    window.open(url, "_blank")
  }

  const renderStudentDetails = () => {
    const fields = candidateDetailsIds.map((id) => {
      const value = getValueByChkId(id)
      return {
        label: checkpoints[id] || `Checkpoint #${id}`,
        value,
        isImage: isImageUrl(value),
        isPdf: isPdfUrl(value),
      }
    })

    return (
      <Card elevation={2} sx={{ mb: 2, borderRadius: "8px" }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#F69320", fontSize: "1rem" }}>
            Tender Participant Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {/* Photo Column */}
            <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  alt="Tender Image"
                  src={getValueByChkId(studentPhotoChkId)}
                  variant="rounded"
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 1,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    border: "2px solid white",
                  }}
                />
                {isImageUrl(getValueByChkId(studentPhotoChkId)) && (
                  <Tooltip title="View Full Image">
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 5,
                        right: 5,
                        backgroundColor: "rgba(255,255,255,0.8)",
                        "&:hover": { backgroundColor: "white" },
                        padding: "2px",
                      }}
                      onClick={() => openFileInNewTab(getValueByChkId(studentPhotoChkId))}
                    >
                      <Eye size={14} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, fontSize: "0.8rem" }}>
                Tender Image
              </Typography>
            </Grid>

            {/* Details Column */}
            <Grid item xs={12} sm={9}>
              <Grid container spacing={1}>
                {fields
                  .filter((f) => !f.isImage || f.label !== checkpoints[studentPhotoChkId])
                  .map((f, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "4px",
                          backgroundColor: "#f9f9f9",
                          border: "1px solid #eee",
                          height: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, color: "#555", mb: 0.5, fontSize: "0.75rem" }}
                        >
                          {f.label}
                        </Typography>
                        {f.isImage ? (
                          <Button
                            variant="outlined"
                            startIcon={<ImageIcon size={14} />}
                            size="small"
                            sx={{ mt: 0.5, fontSize: "0.7rem", padding: "2px 8px" }}
                            onClick={() => openFileInNewTab(f.value)}
                          >
                            View Image
                          </Button>
                        ) : f.isPdf ? (
                          <Button
                            variant="outlined"
                            startIcon={<FileText size={14} />}
                            size="small"
                            sx={{ mt: 0.5, fontSize: "0.7rem", padding: "2px 8px" }}
                            onClick={() => openFileInNewTab(f.value)}
                          >
                            View PDF
                          </Button>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: "break-word",
                              fontSize: "0.8rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.value || "—"}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }

  const renderSection = (title, checkpointIds) => {
    const sectionData = details.filter((item) => {
      const baseId = Number.parseInt(item.ChkId.toString().split("_")[0])
      return checkpointIds.includes(baseId)
    })

    if (sectionData.length === 0) return null

    const getLabel = (chkId) => {
      if (chkId.includes("_")) {
        const [parentId, childId] = chkId.split("_")
        const parentLabel = checkpoints[parentId] || `Checkpoint #${parentId}`
        const childLabel = checkpoints[childId] || `Checkpoint #${childId}`
        return `${childLabel} (${parentLabel})`
      } else {
        return checkpoints[chkId] || `Checkpoint #${chkId}`
      }
    }

    return (
      <Card key={title} elevation={2} sx={{ mb: 2, borderRadius: "8px" }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#F69320", fontSize: "1rem" }}>
            {title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            {sectionData.map((item, index) => {
              const isImage = isImageUrl(item.Value)
              const isPdf = isPdfUrl(item.Value)

              return (
                <Grid item xs={12} sm={6} key={index}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "4px",
                      backgroundColor: "#f9f9f9",
                      border: "1px solid #eee",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#555", fontWeight: 600, mb: 0.5, fontSize: "0.75rem" }}
                    >
                      {getLabel(item.ChkId)}
                    </Typography>
                    {isImage ? (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <Box sx={{ position: "relative", mb: 0.5 }}>
                          <Avatar
                            variant="rounded"
                            src={item.Value}
                            sx={{ width: 80, height: 80, borderRadius: "4px" }}
                          />
                          <Tooltip title="View Full Image">
                            <IconButton
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                right: 2,
                                backgroundColor: "rgba(255,255,255,0.8)",
                                "&:hover": { backgroundColor: "white" },
                                padding: "2px",
                              }}
                              onClick={() => openFileInNewTab(item.Value)}
                            >
                              <Eye size={14} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<ExternalLink size={14} />}
                          size="small"
                          sx={{ fontSize: "0.7rem", padding: "2px 8px" }}
                          onClick={() => openFileInNewTab(item.Value)}
                        >
                          Open
                        </Button>
                      </Box>
                    ) : isPdf ? (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <Chip
                          icon={<FileText size={12} />}
                          label="PDF"
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ mb: 0.5, height: "20px", "& .MuiChip-label": { fontSize: "0.7rem", px: 1 } }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<ExternalLink size={14} />}
                          size="small"
                          sx={{ fontSize: "0.7rem", padding: "2px 8px" }}
                          onClick={() => openFileInNewTab(item.Value)}
                        >
                          Open PDF
                        </Button>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: "break-word",
                          fontSize: "0.8rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.Value || "—"}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </CardContent>
      </Card>
    )
  }

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress sx={{ color: "#F69320" }} />
      </Box>
    )
  if (error)
    return (
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button variant="contained" sx={{ mt: 1, backgroundColor: "#F69320" }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    )

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, background: "#fff", pb: 4 }}>
      {/* Header with Back button */}
      <Paper
        elevation={1}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 1,
          borderRadius: "8px",
          backgroundColor: "#FFFAF0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: "#F69320",
              "&:hover": { backgroundColor: "#e67e00" },
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(246, 147, 32, 0.2)",
              fontSize: "0.8rem",
              padding: "4px 10px",
            }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#F69320", fontSize: "1rem" }}>
              SANCHHAR RAILWAY TENDERS
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
              TENDER Form Details
            </Typography>
          </Box>
        </Box>
        <img src={logo || "/placeholder.svg"} alt="College Logo" style={{ maxHeight: "40px" }} />
      </Paper>

      {/* Main Content */}
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {/* Student Details */}
        {renderStudentDetails()}

        {/* Remaining Sections */}
        {Object.entries(sections).map(([sectionTitle, ids]) => renderSection(sectionTitle, ids))}
      </Box>
    </Box>
  )
}

export default TempTenderView
