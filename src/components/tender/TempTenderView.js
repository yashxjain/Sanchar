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
    "Winner Tender": [17, 18, 20, 21, 22, 23, 24, 25, 26, 27],
    "LOA": [28,29,30,31,32,63,64,65,66,67,68,69,70,71,72,73,81,82],
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

  
 // ... imports and setup remain unchanged ...

 const renderStudentDetails = () => {
  const fields = candidateDetailsIds.map((id) => {
    const value = getValueByChkId(id);
    return {
      label: checkpoints[id] || `Checkpoint #${id}`,
      value,
    };
  });

  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        Tender Participant Details
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {/* Photo Column */}
        <Grid item xs={12} sm={3} sx={{ textAlign: "center" }}>
          <Avatar
            alt="Tender Image"
            src={getValueByChkId(studentPhotoChkId)}
            variant="rounded"
            sx={{ width: 120, height: 120, mx: "auto", mb: 1 }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Tender Image
          </Typography>
        </Grid>

        {/* Details Column */}
        <Grid item xs={12} sm={9}>
          <Grid container spacing={2}>
          {fields
  .filter((f) => !f.isNamamiLink || f.label !== checkpoints[studentPhotoChkId])
  .map((f, idx) => (
    <Grid item xs={12} sm={4} key={idx}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {f.label}
      </Typography>
      {f.isNamamiLink ? (
        <Button
          variant="outlined"
          color="primary"
          sx={{ mt: 1 }}
          onClick={() => window.open(f.value, "_blank")}
        >
          View
        </Button>
      ) : (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {f.value || "—"}
        </Typography>
      )}
    </Grid>
))}

          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};


const renderSection = (title, checkpointIds) => {
  const sectionData = details.filter((item) => {
    const baseId = parseInt(item.ChkId.toString().split("_")[0]);
    return checkpointIds.includes(baseId);
  });

  if (sectionData.length === 0) return null;

  const getLabel = (chkId) => {
    if (chkId.includes("_")) {
      const [parentId, childId] = chkId.split("_");
      const parentLabel = checkpoints[parentId] || `Checkpoint #${parentId}`;
      const childLabel = checkpoints[childId] || `Checkpoint #${childId}`;
      return `${childLabel} (${parentLabel})`;
    } else {
      return checkpoints[chkId] || `Checkpoint #${chkId}`;
    }
  };

  return (
    <Box key={title} sx={{ border: "1px solid #ccc", borderRadius: 2, mb: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {sectionData.map((item, index) => {
          const isImage =
            typeof item.Value === "string" &&
            item.Value.startsWith("https://namami-infotech.com/") &&
            (item.Value.endsWith(".jpg") || item.Value.endsWith(".png") || item.Value.endsWith(".jpeg"));

          return (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#555", fontWeight: 600 }}
                >
                  {getLabel(item.ChkId)}
                </Typography>
                {isImage ? (
                  <Avatar
                    variant="rounded"
                    src={item.Value}
                    sx={{ width: 120, height: 120, mt: 1 }}
                  />
                ) : (
                  <Typography variant="body1">{item.Value || "—"}</Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
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
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 1, backgroundColor: "#fafafa" }}>

        {/* Student Details */}
        {renderStudentDetails()}

        {/* Remaining Sections */}
        {Object.entries(sections).map(([sectionTitle, ids]) =>
          renderSection(sectionTitle, ids),
        )}
      </Paper>
    </Box>
  );
}

export default TempTenderView;
