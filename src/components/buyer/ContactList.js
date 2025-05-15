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
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ContactList() {
  const [tempRecords, setTempRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();

  // Options for Type filter
  const typeOptions = ["Zone", "Division", "Station"];

  useEffect(() => {
    const fetchTempData = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/SANCHAR/src/buyer/contact_station_list.php"
        );
        if (response.data.success) {
          setTempRecords(response.data.data);
          setFilteredRecords(response.data.data);
        } else {
          setError("No data found.");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTempData();
  }, []);

  // Apply filters: searchTerm + typeFilter
  useEffect(() => {
    let filtered = tempRecords;

    // Filter by Type if selected
    if (typeFilter) {
      filtered = filtered.filter(
        (record) => record.Type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Filter by searchTerm
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
  }, [searchTerm, typeFilter, tempRecords]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <CircularProgress />;
  // if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Contact List
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
            sx={{ width: 300 }}
          />

          <Button
            variant="contained"
            style={{ backgroundColor: "#F69320" }}
            onClick={() => navigate("/contact")}
          >
            Add Contact
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#F69320" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Type </TableCell>
              <TableCell sx={{ color: "white" }}>Type ID</TableCell>
              <TableCell sx={{ color: "white" }}>Contact Person</TableCell>
              <TableCell sx={{ color: "white" }}>Mobile</TableCell>
              <TableCell sx={{ color: "white" }}>Mail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => {
                return (
                  <TableRow key={record.ID} hover>
                    <TableCell>{record.Type}</TableCell>
                    <TableCell>{record.TypeId}</TableCell>
                    <TableCell>{record.ContactPerson}</TableCell>
                    <TableCell>{record.ContactNumber}</TableCell>
                    <TableCell>{record.ContactMail}</TableCell>
                  </TableRow>
                );
              })}
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
      />
    </Box>
  );
}

export default ContactList;
