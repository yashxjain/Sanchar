import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddNewBuyer() {
  const [form, setForm] = useState({
    ZoneID: "",
    ZoneName: "",
    ZoneAddress: "",
    DivisionID: "",
    DivisionName: "",
    DivisionAddress: "",
    StationID: "",
    StationName: "",
    StationAddress: "",
  });

  const [buyerData, setBuyerData] = useState([]);
  const [zoneMode, setZoneMode] = useState("existing");
  const [divisionMode, setDivisionMode] = useState("existing");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://namami-infotech.com/SANCHAR/src/buyer/buyer_list.php")
      .then((res) => {
        if (res.data.success) {
          setBuyerData(res.data.data);
        }
      })
      .catch(() => {
        setErrorMsg("Failed to load buyer data.");
      });
  }, []);

  // Unique Zones with full info including address
  const uniqueZones = [
    ...new Map(
      buyerData.map((b) => [
        b.ZoneID,
        {
          id: b.ZoneID,
          name: b.ZoneName,
          address: b.ZoneAddress || "",
        },
      ])
    ).values(),
  ];

  // Unique Divisions with full info including address
  const uniqueDivisions = [
    ...new Map(
      buyerData.map((b) => [
        b.DivisionID,
        {
          id: b.DivisionID,
          name: b.DivisionName,
          address: b.DivisionAddress || "",
        },
      ])
    ).values(),
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // When selecting existing Zone, fill ZoneID, ZoneName, ZoneAddress
  const handleZoneChange = (e, value) => {
    if (value) {
      setForm({
        ...form,
        ZoneID: value.id,
        ZoneName: value.name,
        ZoneAddress: value.address,
      });
    } else {
      setForm({ ...form, ZoneID: "", ZoneName: "", ZoneAddress: "" });
    }
  };

  // When selecting existing Division, fill DivisionID, DivisionName, DivisionAddress
  const handleDivisionChange = (e, value) => {
    if (value) {
      setForm({
        ...form,
        DivisionID: value.id,
        DivisionName: value.name,
        DivisionAddress: value.address,
      });
    } else {
      setForm({ ...form, DivisionID: "", DivisionName: "", DivisionAddress: "" });
    }
  };

  // When switching to "new" mode for Zone or Division, clear address field
  const handleZoneModeChange = (e, newMode) => {
    if (newMode !== null) {
      setZoneMode(newMode);
      if (newMode === "new") {
        setForm({ ...form, ZoneID: "", ZoneName: "", ZoneAddress: "" });
      }
    }
  };

  const handleDivisionModeChange = (e, newMode) => {
    if (newMode !== null) {
      setDivisionMode(newMode);
      if (newMode === "new") {
        setForm({ ...form, DivisionID: "", DivisionName: "", DivisionAddress: "" });
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    // Simple validation example for required fields
    if (
      !form.ZoneID ||
      !form.ZoneName ||
      !form.DivisionID ||
      !form.DivisionName ||
      !form.StationID ||
      !form.StationName
    ) {
      setErrorMsg("Please fill all required fields.");
      setLoading(false);
      return;
    }

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
    <Box p={3} component={Paper} maxWidth={800} mx="auto">
      <Typography variant="h5" mb={2} fontWeight="bold">
        Add New Buyer
      </Typography>

      <Grid container spacing={2}>
        {/* ZONE MODE TOGGLE */}
        <Grid item xs={12}>
          <ToggleButtonGroup value={zoneMode} exclusive onChange={handleZoneModeChange}>
            <ToggleButton value="existing">Existing Zone</ToggleButton>
            <ToggleButton value="new">New Zone</ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        {/* ZONE FIELDS */}
        {zoneMode === "existing" ? (
          <>
            <Grid item xs={12}>
              <Autocomplete
                options={uniqueZones}
                getOptionLabel={(option) => `${option.name} (${option.id})`}
                value={
                  form.ZoneID ? uniqueZones.find((z) => z.id === form.ZoneID) || null : null
                }
                onChange={handleZoneChange}
                renderInput={(params) => (
                  <TextField {...params} label="Select Zone" size="small" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Zone Address"
                value={form.ZoneAddress}
                InputProps={{ readOnly: true }}
                multiline
                rows={2}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={4}>
              <TextField
                name="ZoneID"
                label="Zone ID"
                value={form.ZoneID}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="ZoneName"
                label="Zone Name"
                value={form.ZoneName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="ZoneAddress"
                label="Zone Address"
                value={form.ZoneAddress}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        )}

        {/* DIVISION MODE TOGGLE */}
        <Grid item xs={12}>
          <ToggleButtonGroup value={divisionMode} exclusive onChange={handleDivisionModeChange}>
            <ToggleButton value="existing">Existing Division</ToggleButton>
            <ToggleButton value="new">New Division</ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        {/* DIVISION FIELDS */}
        {divisionMode === "existing" ? (
          <>
            <Grid item xs={12}>
              <Autocomplete
                options={uniqueDivisions}
                getOptionLabel={(option) => `${option.name} (${option.id})`}
                value={
                  form.DivisionID
                    ? uniqueDivisions.find((d) => d.id === form.DivisionID) || null
                    : null
                }
                onChange={handleDivisionChange}
                renderInput={(params) => (
                  <TextField {...params} label="Select Division" size="small" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Division Address"
                value={form.DivisionAddress}
                InputProps={{ readOnly: true }}
                multiline
                rows={2}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={4}>
              <TextField
                name="DivisionID"
                label="Division ID"
                value={form.DivisionID}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="DivisionName"
                label="Division Name"
                value={form.DivisionName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="DivisionAddress"
                label="Division Address"
                value={form.DivisionAddress}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                size="small"
              />
            </Grid>
          </>
        )}

        {/* STATION FIELDS (always new) */}
        <Grid item xs={4}>
          <TextField
            name="StationID"
            label="Station ID"
            value={form.StationID}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            name="StationName"
            label="Station Name"
            value={form.StationName}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="StationAddress"
            label="Station Address"
            value={form.StationAddress}
            onChange={handleChange}
            multiline
            rows={2}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>

      {/* MESSAGES */}
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
