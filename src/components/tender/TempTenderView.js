import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  Button,
  Divider,
  Avatar,
  Dialog,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/images (1).png";

function TempTenderView() {
  const { activityId } = useParams();
  const [details, setDetails] = useState([]);
  const [checkpoints, setCheckpoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  // Checkpoint groups
  const sections = {
    "Participants Details": [15, 16],
    "Winner Tender": [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
    "List of Attached Documents": [31, 33, 35, 37, 38, 39, 40],
    Prefrences: [28, 29],
  };

  const candidateDetailsIds = [1,3, 5, 6, 7, 8, 9, 10, 11, 12];
  const studentPhotoChkId = 2; // Assume 13 is the image URL

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailsRes, checkpointsRes] = await Promise.all([
          axios.get(
            `https://namami-infotech.com/SANCHAR/src/menu/get_transaction_dtl.php?activityId=${encodeURIComponent(activityId)}`,
          ),
          axios.get(
            `https://namami-infotech.com/SANCHAR/src/menu/get_checkpoints.php`,
          ),
        ]);

        if (detailsRes.data.success && checkpointsRes.data.success) {
          const checkpointMap = {};
          checkpointsRes.data.data.forEach((cp) => {
            checkpointMap[cp.CheckpointId] = cp.Description;
          });
          setCheckpoints(checkpointMap);
          setDetails(detailsRes.data.data);
        } else {
          setError("No details or checkpoints found.");
        }
      } catch (err) {
        setError("Failed to fetch admission details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [activityId]);

  const getValueByChkId = (chkId) => {
    const item = details.find((d) => parseInt(d.ChkId) === chkId);
    return item ? item.Value : "";
  };

  
  const renderStudentDetails = () => {
    const fields = candidateDetailsIds.map((id) => ({
      label: checkpoints[id] || `Checkpoint #${id}`,
      value: getValueByChkId(id),
      isImage:
        id === studentPhotoChkId &&
        getValueByChkId(id).startsWith("https://namami-infotech.com/"),
    }));

    const imageItem = fields.find((f) => f.isImage);
    const otherFields = fields.filter((f) => !f.isImage);

    return (
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
              width: "100%",
              flexDirection: "column",
              gap: 1
            }}
          >
            <Box
              component="img"
              src={getValueByChkId(studentPhotoChkId)}
              alt="Student"
              sx={{
                width: "180px",
                height: "180px",
                objectFit: "fill",
                borderRadius: 2,
                border: "1px solid #ccc",
                boxShadow: 2,
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Tender Image
                </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={9}>
          <Grid container spacing={2}>
            {otherFields.map((f, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {f.label}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {f.value || "—"}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderSection = (title, checkpointIds) => {
    const sectionData = details.filter((item) =>
      checkpointIds.includes(parseInt(item.ChkId)),
    );
    if (sectionData.length === 0) return null;

    return (
      <Box key={title} sx={{ mb: 5 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#F69320", fontWeight: 700 }}
        >
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {sectionData.map((item, index) => {
            const isImage =
              typeof item.Value === "string" &&
              item.Value.startsWith("https://namami-infotech.com/");
            return (
              <Grid item xs={12} sm={3} key={index}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {checkpoints[item.ChkId] || `Checkpoint #${item.ChkId}`}
                </Typography>
                {isImage ? (
                  <Box
                    sx={{ mt: 1, cursor: "pointer" }}
                    onClick={() => {
                      setSelectedImage(item.Value);
                      setOpenDialog(true);
                    }}
                  >
                    <img
                      src={item.Value}
                      alt={`Checkpoint ${item.ChkId}`}
                      style={{
                        width: "50%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ mb: 1.5 }}>
                    {item.Value || "—"}
                  </Typography>
                )}
              </Grid>
            );
          })}
        </Grid>

        {/* Dialog for Image Preview */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
        >
          <Box sx={{ p: 2, textAlign: "center" }}>
            <img
              src={selectedImage}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: 8 }}
            />
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                href={selectedImage}
                download
              >
                Download Image
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    );
  };

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;
  if (error)
    return (
      <Typography color="error" sx={{ mt: 3 }}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 2, background: "#fff", pb: 10 }}>
      {/* Header with Back button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ color: "#F69320", borderColor: "#F69320" }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#F69320" }}>
              SANCHHAR RAILWAY TENDERS
            </Typography>
            <Typography variant="subtitle1">TENDER Form Details</Typography>
          </Box>
        </Box>
        <img src={logo} alt="College Logo" />
      </Box>

      {/* Main Paper */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        {/* Student Details */}
        {renderStudentDetails()}

        {/* Remaining Sections */}
        {Object.entries(sections).map(([sectionTitle, ids]) =>
          renderSection(sectionTitle, ids),
        )}
      </Paper>

      {/* Fixed Footer: ONLY Next Button */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: "flex",
          justifyContent: "flex-end",
          gap: "100px",
          backgroundColor: "#fff",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
          zIndex: 1000,
        }}
      >
        
        <Button
          variant="contained"
          sx={{ backgroundColor: "#F69320" }}
          
        >
          Move to LOA
        </Button>
      </Box>
    </Box>
  );
}

export default TempTenderView;
