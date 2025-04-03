import { createContext, useState, useEffect } from "react";
import { createTheme } from "@mui/material/styles";
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
            gradient: {
                bg: "linear-gradient(to bottom right,rgb(200, 240, 255), rgb(255, 240, 200))",
                main: {
                    right: "linear-gradient(to right, #3f51b5, #7e57c2)",
                    left: "linear-gradient(to left, #3f51b5, #7e57c2)",
                }
            },
            paper: "#ffffff",
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#214a8e",
        },
        secondary: {
            main: "#2f50057",
        },
        background: {
            default: "#f5f5f5",
            gradient: {
                bg: "linear-gradient(to bottom right, rgb(39, 47, 50), rgb(50, 47, 39))",
                main: {
                    right: "linear-gradient(to right, #1e3a8a, #4c1d95)",
                    left: "linear-gradient(to left, #1e3a8a, #4c1d95)",
                }
            },
            paper: "#121212",
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
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <CssBaseline />
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext;