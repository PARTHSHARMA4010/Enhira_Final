import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import api from "../api";

export default function UploadCSV() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await api.post("/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(`Uploaded ${res.data.operators.length} rows`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        CSV Upload
      </Typography>
      <Button variant="contained" component="label">
        Choose CSV
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </Button>
      {file && (
        <Typography variant="body2" mt={1}>
          {file.name}
        </Typography>
      )}
      <Box mt={2}>
        <Button disabled={!file} variant="outlined" onClick={onUpload}>
          Upload
        </Button>
      </Box>
      {loading && <LinearProgress sx={{ mt: 2, width: 200 }} />}
      <Snackbar
        open={!!msg}
        autoHideDuration={3000}
        onClose={() => setMsg("")}
      >
        <Alert severity="success">{msg}</Alert>
      </Snackbar>
    </Box>
  );
}
