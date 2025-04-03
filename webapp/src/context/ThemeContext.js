import { createContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const ThemeContext = createContext();

// Define light and dark theme palettes
const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2196f3",
        },
        secondary: {
            main: "#f50057",
        },
        background: {
            default: "#f5f5f5",
            paper: "#ffffff",
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#90caf9",
        },
        secondary: {
            main: "#f48fb1",
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e",
        },
    },
});

export const ThemeProvider = ({ children }) => {
    // Try to get the saved theme preference from localStorage, default to 'dark'
    const [mode, setMode] = useState("dark");

    // Initialize theme from localStorage on component mount
    useEffect(() => {
        const savedMode = localStorage.getItem("themeMode");
        if (savedMode) {
            setMode(savedMode);
        }
    }, []);

    // Toggle theme function
    const toggleTheme = () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("themeMode", newMode);
        console.log(theme);
    };

    // Select the appropriate theme based on mode
    const theme = mode === "light" ? lightTheme : darkTheme;

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}

export default ThemeContext;