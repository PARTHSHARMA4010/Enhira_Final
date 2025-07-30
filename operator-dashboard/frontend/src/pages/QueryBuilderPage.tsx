/* QueryBuilderPage.tsx – “no-Grid” version
   ------------------------------------------------------------------ */
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Autocomplete,
  TextField,
  MenuItem,
  Select,
  Button,
  Tooltip,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GetAppIcon from "@mui/icons-material/GetApp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useState, useEffect } from "react";
import { QueryBuilder, type RuleGroupType } from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ------------------------------------------------------------------ */
/* field definitions (keep in-sync with backend allow-list)           */
const schemaFields = [
  { name: 'userid', label: 'User ID' },
  { name: 'fullusername', label: 'Full Name' },
  { name: 'location', label: 'Location' },
  { name: 'scan_count', label: 'Scans', inputType: 'number' },
  { name: 'upi_id', label: 'UPI ID' },
  { name: 'joiningdt', label: 'Joining Date', inputType: 'date' },
  { name: 'remarks', label: 'Remarks' },
];

/* Axios with toast on error ---------------------------------------- */
const api = axios.create({ baseURL: "http://127.0.0.1:8000" });

function useToast() {
  const [msg, setMsg] = useState("");
  return {
    Toast: (
      <Snackbar
        open={!!msg}
        autoHideDuration={4000}
        onClose={() => setMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error">{msg}</Alert>
      </Snackbar>
    ),
    setMsg,
  };
}

export default function QueryBuilderPage() {
  /* toast ---------------------------------------------------------------- */
  const { Toast, setMsg } = useToast();
  // @ts-ignore allow interceptor to access setter
  window.__setGlobalToast = setMsg;
  api.interceptors.response.use(
    (r) => r,
    (err) => {
      setMsg(err.response?.data?.detail || err.message || "Unknown error");
      return Promise.reject(err);
    }
  );

  /* state ---------------------------------------------------------------- */
  const [selectedFields, setSelectedFields] = useState<string[]>(
    schemaFields.map((f) => f.name)
  );
  const [ruleGroup, setRuleGroup] = useState<RuleGroupType>({
    combinator: "and",
    rules: [],
  });
  const [sortBy, setSortBy] = useState("userid");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState(100);
  const [sql, setSql] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;

  /* hydrate last run ----------------------------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("qb:lastResults");
    if (saved) {
      const { sql, rows } = JSON.parse(saved);
      setSql(sql);
      setRows(rows);
    }
  }, []);

  /* API call ------------------------------------------------------------- */
  const runQuery = async () => {
    const body = {
      fields: selectedFields,
      filters: (ruleGroup.rules as any[]).filter(
        (r) => r.field && r.operator && r.value !== "" && r.value !== undefined
      ),
      sort_by: sortBy,
      sort_order: sortOrder,
      limit,
    };
    const { data } = await api.post("/run-query", body);
    setSql(data.query);
    setRows(data.results);
    setPage(1);
    localStorage.setItem("qb:lastResults", JSON.stringify(data));
  };

  /* helpers -------------------------------------------------------------- */
  const copySql = () => sql && navigator.clipboard.writeText(sql);
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Results");
    saveAs(
      new Blob([XLSX.write(wb, { type: "array", bookType: "xlsx" })]),
      "query_results.xlsx"
    );
  };
  const saveQuery = () =>
    localStorage.setItem(
      "qb:saved",
      JSON.stringify({ selectedFields, ruleGroup, sortBy, sortOrder, limit })
    );
  const loadQuery = () => {
    const s = localStorage.getItem("qb:saved");
    if (!s) return;
    const obj = JSON.parse(s);
    setSelectedFields(obj.selectedFields);
    setRuleGroup(obj.ruleGroup);
    setSortBy(obj.sortBy);
    setSortOrder(obj.sortOrder);
    setLimit(obj.limit);
  };
  const resetAll = () => {
    setSelectedFields(schemaFields.map((f) => f.name));
    setRuleGroup({ combinator: "and", rules: [] });
    setSortBy("userid");
    setSortOrder("asc");
    setLimit(100);
    setSql("");
    setRows([]);
  };

  /* --------------------------------------------------------------------- */
  /* UI                                                                    */
  return (
    <Box sx={{ p: 3, background: "#EEF2F6", minHeight: "100vh" }}>
      {Toast}

      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center">
        Visual SQL Query Builder
      </Typography>

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardHeader title="Build query for operator data" />
        <CardContent>
          {/* SECTION with flex-wrap instead of Grid ----------------- */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            useFlexGap
          >
            {/* column 1 – Select Fields ---------------------------- */}
            <Box flex={1}>
              <Typography fontWeight={600} mb={1}>
                ① Select Fields
              </Typography>

              <Autocomplete
                multiple
                options={schemaFields}
                value={schemaFields.filter((f) =>
                  selectedFields.includes(f.name)
                )}
                getOptionLabel={(o) => o.label}
                onChange={(_, v) => setSelectedFields(v.map((x) => x.name))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.name}
                      label={option.label}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} size="small" label="Fields" />
                )}
              />

              <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
                <TextField
                  select
                  label="Sort by"
                  size="small"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  {schemaFields.map((f) => (
                    <MenuItem key={f.name} value={f.name}>
                      {f.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Select
                  size="small"
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                >
                  <MenuItem value="asc">ASC</MenuItem>
                  <MenuItem value="desc">DESC</MenuItem>
                </Select>

                <TextField
                  label="Limit"
                  size="small"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  sx={{ width: 100 }}
                />
              </Stack>
            </Box>

            {/* column 2 – Add Filters ----------------------------- */}
            <Box flex={1}>
              <Typography fontWeight={600} mb={1}>
                ② Add Filters
              </Typography>
              <QueryBuilder
                fields={schemaFields}
                query={ruleGroup}
                onQueryChange={(q) => setRuleGroup(q)}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* BUTTON BAR -------------------------------------------------------- */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        flexWrap="wrap"
        mb={2}
      >
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={runQuery}
        >
          Run Query
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<GetAppIcon />}
          onClick={exportExcel}
          disabled={!rows || rows.length === 0}
        >
          Export Excel
        </Button>
        <Button variant="outlined" startIcon={<SaveIcon />} onClick={saveQuery}>
          Save Query
        </Button>
        <Button
          variant="outlined"
          startIcon={<FolderOpenIcon />}
          onClick={loadQuery}
        >
          Load Saved
        </Button>
        <Tooltip title="Copy SQL to clipboard">
          <IconButton onClick={copySql} disabled={!sql}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset all">
          <IconButton color="error" onClick={resetAll}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* SQL preview ------------------------------------------------------- */}
      {sql && (
        <Paper
          elevation={0}
          sx={{
            background: "#263238",
            color: "#ECEFF1",
            p: 2,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            mb: 3,
          }}
        >
          {sql}
        </Paper>
      )}

      {/* RESULTS ---------------------------------------------------------- */}
      {rows && rows.length > 0 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader
            title={`Query Results (${rows.length} row${
              rows.length !== 1 ? "s" : ""
            })`}
          />
          <Divider />
          <CardContent>
            <TableContainer sx={{ maxHeight: 540 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {Object.keys(rows[0]).map((c) => (
                      <TableCell
                        key={c}
                        sx={{ fontWeight: 700, background: "#F5F5F5" }}
                      >
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .slice(
                      (page - 1) * rowsPerPage,
                      page * rowsPerPage
                    )
                    .map((r, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#FAFAFA" },
                        }}
                      >
                        {Object.values(r).map((v, j) => (
                          <TableCell key={j}>{String(v)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {rows.length > rowsPerPage && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={Math.ceil(rows.length / rowsPerPage)}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  shape="rounded"
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
