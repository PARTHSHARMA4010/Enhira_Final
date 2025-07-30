import { AppBar, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const NavBar = () => (
  <AppBar position="static">
    <Toolbar sx={{ gap: 2 }}>
      {[
        ["Dashboard", "/"],
        ["Add User", "/add"],
        ["CSV Upload", "/csv"],
        ["Send SMS", "/sms"],
        ["UPI Payment", "/upi"],
        ["Query Builder", "/query"],
      ].map(([label, path]) => (
        <Button
          key={path}
          color="inherit"
          component={RouterLink}
          to={path}
          size="small"
        >
          {label}
        </Button>
      ))}
    </Toolbar>
  </AppBar>
);

export default NavBar;
