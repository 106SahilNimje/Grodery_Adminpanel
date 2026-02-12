import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    background: {
      default: "#f6f8fb",
    },
    primary: {
      main: "#16a34a",
    },
    success: {
      main: "#16a34a",
    },
    warning: {
      main: "#facc15",
    },
    error: {
      main: "#ef4444",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});
