"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TablePagination,
  TextField,
  Box,
  Button,
  Autocomplete,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";

function ParticipantList() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();

  const typeOptions = ["Zone", "Division", "Station"];

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/SANCHAR/src/participant/participant_list.php"
        );
        if (response.data.success) {
          setRecords(response.data.data);
          setFilteredRecords(response.data.data);
        } else {
          setError("No participant data found.");
        }
      } catch (err) {
        setError("Failed to fetch participant data.");
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (typeFilter) {
      filtered = filtered.filter(
        (record) => record.Type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      const value = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.ZoneID?.toString().toLowerCase().includes(value) ||
          record.ZoneName?.toLowerCase().includes(value) ||
          record.DivisionID?.toString().toLowerCase().includes(value) ||
          record.DivisionName?.toLowerCase().includes(value) ||
          record.StationID?.toString().toLowerCase().includes(value) ||
          record.StationName?.toLowerCase().includes(value)
      );
    }

    setFilteredRecords(filtered);
    setPage(0);
  }, [searchTerm, typeFilter, records]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh" flexDirection="column">
        <CircularProgress sx={{ color: "#F69320" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading participant data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight="bold" color="#333">
          Participant List
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Autocomplete
            options={typeOptions}
            value={typeFilter}
            onChange={(event, newValue) => setTypeFilter(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Filter by Type" size="small" />
            )}
            sx={{ width: 180 }}
            clearOnEscape
          />

          <TextField
            label="Search by Station ID or Name"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <Search size={18} color="#666" style={{ marginRight: "8px" }} />,
            }}
            sx={{
              width: 300,
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#F69320",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#F69320",
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate("/new-participant")}
            sx={{
              backgroundColor: "#F69320",
              "&:hover": {
                backgroundColor: "#e08416",
              },
            }}
          >
            Add Participant
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          mb: 2,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          width: "100%",
        }}
      >
        <Table size="medium">
          <TableHead sx={{ backgroundColor: "#F69320" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Company Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Contact Person</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mobile</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No participants found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow
                    key={record.ID}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(246, 147, 32, 0.04)",
                      },
                    }}
                  >
                    <TableCell>{record.CompanyName}</TableCell>
                    <TableCell>{record.ContactPerson}</TableCell>
                    <TableCell>{record.Mobile}</TableCell>
                    <TableCell>{record.Mail}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRecords.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15]}
        sx={{
          ".MuiTablePagination-selectIcon": {
            color: "#F69320",
          },
          ".MuiTablePagination-select": {
            fontWeight: 500,
          },
          ".Mui-selected": {
            backgroundColor: "#F69320 !important",
            color: "white",
          },
        }}
      />
    </Box>
  );
}

export default ParticipantList;
