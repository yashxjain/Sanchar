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
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BuyerList() {
  const [tempRecords, setTempRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTempData = async () => {
      try {
        const response = await axios.get(
          "https://namami-infotech.com/SANCHAR/src/buyer/buyer_list.php",
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

  const handleSearch = (e) => {
  const value = e.target.value.toLowerCase();
  setSearchTerm(value);
  const filtered = tempRecords.filter((record) => {
    return (
      record.ZoneID?.toString().toLowerCase().includes(value) ||
      record.ZoneName?.toLowerCase().includes(value) ||
      record.DivisionID?.toString().toLowerCase().includes(value) ||
      record.DivisionName?.toLowerCase().includes(value) ||
      record.StationID?.toString().toLowerCase().includes(value) ||
      record.StationName?.toLowerCase().includes(value)
    );
  });
  setFilteredRecords(filtered);
  setPage(0);
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
      >
        <Typography variant="h5" fontWeight="bold">
          Buyer List
        </Typography>

        <Box display="flex" gap={2}>
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
            onClick={() => navigate("/new-buyer")}
          >
            New Buyer
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#F69320" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Zone ID</TableCell>
              <TableCell sx={{ color: "white" }}>Zone Name</TableCell>
              <TableCell sx={{ color: "white" }}>Division ID</TableCell>
              <TableCell sx={{ color: "white" }}>Division Name</TableCell>
              <TableCell sx={{ color: "white" }}>Station ID</TableCell>
              <TableCell sx={{ color: "white" }}>Station Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => {
                const nameEntry = record.chkData?.find(
                  (chk) => chk.ChkId === 3,
                );
                return (
                  <TableRow key={record.ID} hover>
                    <TableCell>{record.ZoneID}</TableCell>
                    <TableCell>{record.ZoneName}</TableCell>
                    <TableCell>{record.DivisionID}</TableCell>
                    <TableCell>{record.DivisionName}</TableCell>
                    <TableCell>{record.StationID}</TableCell>
                    <TableCell>{record.StationName}</TableCell>
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

export default BuyerList;
