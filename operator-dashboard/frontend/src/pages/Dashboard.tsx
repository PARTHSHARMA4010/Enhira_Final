import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import api from "../api";

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

export default function Dashboard() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<User[]>("/users")
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        All Operators
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {[
                "User ID",
                "Full Name",
                "Location",
                "OTP",
                "Mobile No",
                "Aadhar",
                "Bank Acc No",
                "IFSC",
                "UPI ID",
                "Remarks",
                "Joining Date",
                "Scan Count",
              ].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.userid}>
                <TableCell>{u.userid}</TableCell>
                <TableCell>{u.fullusername}</TableCell>
                <TableCell>{u.location}</TableCell>
                <TableCell>{u.otp}</TableCell>
                <TableCell>{u.mobileno}</TableCell>
                <TableCell>{u.aadharcard}</TableCell>
                <TableCell>{u.bank_acc_no}</TableCell>
                <TableCell>{u.bank_ifsc_no}</TableCell>
                <TableCell>{u.upi_id}</TableCell>
                <TableCell>{u.remarks}</TableCell>
                <TableCell>{u.joiningdt}</TableCell>
                <TableCell>{u.scan_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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