/* src/pages/Dashboard.tsx
   – polished UI (sidebar, header, glass-card) that ALWAYS renders rows      */

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  TextField,
  MenuItem as MUIMenuItem,
  Slider,
  Button,
  Stack,
  Snackbar,
  Alert,
  Paper,
  styled,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SmsIcon from "@mui/icons-material/Sms";
import PaymentsIcon from "@mui/icons-material/Payments";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogoutIcon from "@mui/icons-material/Logout";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../api";

/* ─── DB → FE model ───────────────────────────────────────────── */
interface User {
  userid: string;
  fullusername: string;
  location: string;
  otp: string;
  mobileno: string;
  aadharcard: string;
  bank_acc_no: string;
  bank_ifsc_no: string;
  upi_id: string;
  remarks: string;
  joiningdt: string;
  scan_count: number;
}

/* ─── styled card (glass) ─────────────────────────────────────── */
const GlassCard = styled(Paper)(({ theme }) => ({
  backdropFilter: "blur(6px)",
  background:
    theme.palette.mode === "light"
      ? "rgba(255,255,255,0.8)"
      : "rgba(30,30,30,0.5)",
  borderRadius: 12,
  padding: theme.spacing(3),
}));
const drawerWidth = 220;
type MenuEntry = { label: string; icon: React.ReactNode };

/* ============================================================= */
export default function Dashboard() {
  const [rows, setRows] = useState<User[]>([]);
  const [toast, setToast] = useState("");

  /* user-menu anchor */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /* filter state */
  const [loc, setLoc] = useState("All");
  const [q, setQ] = useState("");
  const [min, setMin] = useState(0);

  /* ─── fetch once (and be safe wrt payload shape) ───────────── */
  useEffect(() => {
    api
      .get("/users")
      .then((r) => {
        const arr =
          Array.isArray(r.data)                ? r.data :
          Array.isArray(r.data.results)        ? r.data.results :
          Array.isArray(r.data.data)           ? r.data.data : [];
        setRows(arr as User[]);
      })
      .catch((e) => setToast(e.message));
  }, []);

  /* ─── filters ──────────────────────────────────────────────── */
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (loc === "All" || r.location === loc) &&
          (r.scan_count ?? 0) >= min &&
          (q === "" ||
            r.fullusername.toLowerCase().includes(q.toLowerCase()) ||
            r.mobileno.includes(q))
      ),
    [rows, loc, q, min]
  );

  /* ─── columns ─────────────────────────────────────────────── */
  const columns: GridColDef[] = [
    { field: "fullusername", headerName: "Name", flex: 1, minWidth: 160 },
    { field: "mobileno", headerName: "Phone", minWidth: 130 },
    { field: "location", headerName: "Location", minWidth: 110 },
    {
      field: "scan_count",
      headerName: "Scans",
      type: "number",
      minWidth: 100,
      align: "right",
      headerAlign: "right",
    },
    { field: "joiningdt", headerName: "Join Date", minWidth: 110 },
    {
      field: "remarks",
      headerName: "Status",
      minWidth: 140,
      renderCell: (p) =>
        p.value?.toLowerCase().includes("inactive") ? (
          <Typography color="error">Inactive</Typography>
        ) : (
          <Typography color="success.main">Active</Typography>
        ),
      sortable: false,
    },
  ];

  /* ─── CSV → server ─────────────────────────────────────────── */
  const uploadCSV = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    try {
      await api.post("/upload-csv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToast("CSV processed ✅ (refresh to see new rows)");
    } catch (err: any) {
      setToast(err.response?.data?.detail || err.message);
    }
  };

  /* ─── Excel export ─────────────────────────────────────────── */
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(filtered),
      "operators"
    );
    saveAs(
      new Blob([XLSX.write(wb, { type: "array", bookType: "xlsx" })]),
      "operators.xlsx"
    );
  };

  /* sidebar */
  const menu: MenuEntry[] = [
    { label: "Operators", icon: <PeopleIcon /> },
    { label: "Messages", icon: <SmsIcon /> },
    { label: "Payments", icon: <PaymentsIcon /> },
    { label: "Settings", icon: <SettingsIcon /> },
  ];

  /* ─── RENDER ───────────────────────────────────────────────── */
  return (
    <Box
      sx={{
        display: "flex",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1650&q=80)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: "none",
            // marginLeft:5, 
            backdropFilter: "blur(6px)",
            background: "rgba(255,255,255,0.85)",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={700} color="primary">
            Enhira Ops
          </Typography>
        </Toolbar>
        <List>
          {menu.map(({ label, icon }) => (
            <ListItemButton
              key={label}
              selected={label === "Operators"}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* MAIN */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Top bar */}
        <AppBar
  position="sticky"
  elevation={0}
  sx={{
    ml: `${drawerWidth - 195}px`,  // Shift 25px to the left
    backdropFilter: "blur(6px)",
    background: "rgba(255,255,255,0.7)",
  }}
>

  <Toolbar sx={{ justifyContent: "flex-end", px: 2 }}>
  <Stack direction="row" spacing={2} alignItems="center" ml="auto" marginRight={4}>
    <Typography color="text.secondary">Admin • John Doe</Typography>
    <IconButton>
      <Badge badgeContent={3} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
      <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
    </IconButton>
  </Stack>
</Toolbar>


        </AppBar>

        {/* Avatar menu */}
        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <GlassCard>
            <Typography variant="h5" fontWeight={700} mb={2}>
              Operator Management
            </Typography>

            {/* Filters */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              mb={2}
              alignItems="center"
            >
              <TextField
                select
                size="small"
                label="Location"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                sx={{ width: 180 }}
              >
                <MUIMenuItem value="All">All Locations</MUIMenuItem>
                {Array.from(new Set(rows.map((r) => r.location))).map((l) => (
                  <MUIMenuItem key={l} value={l}>
                    {l}
                  </MUIMenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                label="Name or Phone"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{ flex: 1, minWidth: 220 }}
              />

              <Box sx={{ display: "flex", alignItems: "center", width: 180 }}>
                <Typography variant="body2" pr={1}>
                  Scan ≥
                </Typography>
                <Slider
                  size="small"
                  min={0}
                  max={200}
                  value={min}
                  onChange={(_, v) => setMin(v as number)}
                />
                <Typography variant="body2" pl={1}>
                  {min}
                </Typography>
              </Box>

              <label htmlFor="csv">
                <input
                  hidden
                  id="csv"
                  type="file"
                  accept=".csv"
                  onChange={uploadCSV}
                />
                <Button
                  component="span"
                  startIcon={<UploadFileIcon />}
                  variant="contained"
                >
                  Upload CSV
                </Button>
              </label>

              <Button variant="outlined" onClick={exportExcel}>
                Export Excel
              </Button>
            </Stack>

            {/* Grid */}
            <Paper sx={{ height: 500 }}>
              <DataGrid
                rows={filtered}
                columns={columns}
                getRowId={(r) => r.userid || r.mobileno}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "rgba(0,0,0,0.04)",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    bgcolor: "transparent",
                  },
                }}
              />
            </Paper>
          </GlassCard>
        </Box>
      </Box>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info">{toast}</Alert>
      </Snackbar>
    </Box>
  );
}


// import { useEffect, useState } from "react";
// import {
//   Box,
//   CircularProgress,
//   Typography,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
// } from "@mui/material";
// import api from "../api";

// interface User {
//   userid: string;
//   fullusername: string;
//   location: string;
//   scan_count: number;
//   upi_id: string;
// }

// export default function Dashboard() {
//   const [rows, setRows] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     api
//       .get<User[]>("/users")
//       .then((r) => setRows(r.data))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <CircularProgress sx={{ m: 4 }} />;

//   return (
//     <Box p={3}>
//       <Typography variant="h5" gutterBottom>
//         All Operators
//       </Typography>
//       <TableContainer component={Paper}>
//         <Table size="small">
//           <TableHead>
//             <TableRow>
//               {["ID", "Name", "Location", "Scans", "UPI"].map((h) => (
//                 <TableCell key={h}>{h}</TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {rows.map((u) => (
//               <TableRow key={u.userid}>
//                 <TableCell>{u.userid}</TableCell>
//                 <TableCell>{u.fullusername}</TableCell>
//                 <TableCell>{u.location}</TableCell>
//                 <TableCell>{u.scan_count}</TableCell>
//                 <TableCell>{u.upi_id}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// } 