// BuyerForm.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddNewBuyer() {
  const [form, setForm] = useState({
    ZoneID: "",
    ZoneName: "",
    DivisionID: "",
    DivisionName: "",
    StationID: "",
    StationName: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await axios.post(
        "https://namami-infotech.com/SANCHAR/src/buyer/add_buyer.php",
        form
      );

      if (response.data.success) {
        setSuccessMsg("Buyer added successfully!");
        setTimeout(() => navigate("/buyer"), 1000);
      } else {
        setErrorMsg(response.data.message || "Failed to add buyer.");
      }
    } catch (error) {
      setErrorMsg("API error: Failed to add buyer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} component={Paper} maxWidth={600} mx="auto">
      <Typography variant="h5" mb={2} fontWeight="bold">
        Add New Buyer
      </Typography>

      <Grid container spacing={2}>
        {[
          { name: "ZoneID", label: "Zone ID" },
          { name: "ZoneName", label: "Zone Name" },
          { name: "DivisionID", label: "Division ID" },
          { name: "DivisionName", label: "Division Name" },
          { name: "StationID", label: "Station ID" },
          { name: "StationName", label: "Station Name" },
        ].map((field) => (
          <Grid item xs={12} sm={6} key={field.name}>
            <TextField
              fullWidth
              name={field.name}
              label={field.label}
              value={form[field.name]}
              onChange={handleChange}
              size="small"
            />
          </Grid>
        ))}
      </Grid>

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {successMsg}
        </Alert>
      )}

      <Box mt={3}>
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          style={{ backgroundColor: "#F69320" }}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Box>
    </Box>
  );
}

export default AddNewBuyer;
