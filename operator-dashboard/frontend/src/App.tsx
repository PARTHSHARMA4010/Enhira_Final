import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import AddUser from "./pages/AddUser";
import UploadCSV from "./pages/UploadCSV";
import SendSMS from "./pages/SendSMS";
import UpiPayment from "./pages/UpiPayment";
import QueryBuilderPage from "./pages/QueryBuilderPage";
import { theme } from "./theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* <NavBar /> */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddUser />} />
          <Route path="/csv" element={<UploadCSV />} />
          <Route path="/sms" element={<SendSMS />} />
          <Route path="/upi" element={<UpiPayment />} />
          <Route path="/query" element={<QueryBuilderPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
