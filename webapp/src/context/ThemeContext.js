import { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";

const ThemeContext = createContext();

// Define light and dark theme palettes
const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2196f3",
            transparent: "rgba(33, 150, 243, 0.1)",
        },
        secondary: {
            main: "#7e57c2",
        },
        background: {
            default: "#fff",
            paper: "#eee",
            transparent: "rgba(255, 255, 255, 0.5)",
            translucent: "rgba(255, 255, 255, 0.8)",
        },
        text: {
            primary: "rgba(0, 0, 0, 0.87)",
        },
        gradient: {
            bg: "linear-gradient(to bottom right,rgb(200, 240, 255), rgb(255, 240, 200))",
            main: {
                right: "linear-gradient(to right, #3f51b5, #7e57c2)",
                left: "linear-gradient(to left, #3f51b5, #7e57c2)",
            },
            hover: {
                right: "linear-gradient(to right,rgba(63, 81, 181, 0.8),rgba(126, 87, 194, 0.8))",
                left: "linear-gradient(to left,rgba(63, 81, 181, 0.8),rgba(126, 87, 194, 0.8))",
            }
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#c1121f",
            transparent: "rgba(193, 18, 31, 0.1)",
        },
        secondary: {
            main: "#2a9d8f",
        },
        background: {
            default: "#121212",
            paper: "#222",
            transparent: "rgba(0, 0, 0, 0.3)",
            translucent: "rgba(0, 0, 0, 0.5)",
        },
        text: {
            primary: "#fff",
        },
        gradient: {
            bg: "linear-gradient(to bottom right, rgb(202, 29, 52), rgb(92, 210, 189))",
            main: {
                right: "linear-gradient(to right,rgb(8, 154, 168),rgb(255, 200, 0))",
                left: "linear-gradient(to left,rgb(138, 88, 30),rgb(29, 149, 39))",
            },
            hover: {
                right: "linear-gradient(to right,rgba(8, 155, 168, 0.8),rgba(255, 200, 0, 0.8))",
                left: "linear-gradient(to left,rgba(138, 88, 30, 0.8),rgba(29, 149, 39, 0.8))",
            }
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
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    )
}

export default ThemeContext;