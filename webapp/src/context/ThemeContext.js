import { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, alpha } from "@mui/material/styles";
import { cyan, deepPurple, grey, red, teal, yellow } from "@mui/material/colors";
import { CssBaseline, darken, lighten } from "@mui/material";

const ThemeContext = createContext();

const createGradient = (color1, color2) => ({
    right: `linear-gradient(to right, ${color1}, ${color2})`,
    left: `linear-gradient(to left, ${color1}, ${color2})`,
});

const createHoverGradient = (color1, color2, opacity = 0.8) => ({
    right: `linear-gradient(to right, ${alpha(color1, opacity)}, ${alpha(color2, opacity)})`,
    left: `linear-gradient(to left, ${alpha(color1, opacity)}, ${alpha(color2, opacity)})`,
});

const themes = {
    classic: createTheme({
        palette: {
            mode: "light",
            primary: {
                main: "#5254bc",
            },
            secondary: {
                main: "#8653bd",
            },
            background: {
                default: "#fff",
                paper: grey[100],
            },
            text: {
                primary: grey[900],
                secondary: grey[700],
            },
            gradient: {
                bg: `linear-gradient(to bottom right, ${cyan[100]}, ${yellow[100]})`,
                main: createGradient("#5254bc", darken("#8653bd", 0.1)),
                hover: createHoverGradient("#5254bc", darken("#8653bd", 0.1))
            }
        },
    }),
    blue: createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: "#023e7d",
            },
            secondary: {
                main: "#4299E1",
            },
            background: {
                default: "#1A202C",
                paper: "#2D3748",
            },
            text: {
                primary: "#f5f5f5",
                secondary: "#a0aec0",
            },
            gradient: {
                bg: "linear-gradient(to bottom right, #2D3748, #1A202C)",
                main: createGradient(lighten("#023e7d", 0.1), darken("#023e7d", 0.2)),
                hover: createHoverGradient(lighten("#023e7d", 0.1), darken("#023e7d", 0.2))
            }
        },
    }),
    green: createTheme({
        palette: {
            mode: "light",
            primary: {
                main: "#588157",
            },
            secondary: {
                main: "#3c6e71",
            },
            background: {
                default: "#fff",
                paper: grey[100],
            },
            text: {
                primary: grey[900],
                secondary: grey[700],
            },
            gradient: {
                bg: "linear-gradient(to bottom, #faedcd, #ddb892)",
                main: createGradient("#588157", "#31572c"),
                hover: createHoverGradient("#588157", "#31572c")
            }
        },
    }),
};

export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState("classic"); // Default theme

    useEffect(() => {
        const savedMode = localStorage.getItem("themeMode");
        // Ensure savedMode is a valid key in your themes object
        if (savedMode && themes[savedMode]) {
            setMode(savedMode);
        } else if (!themes[mode]) {
            // Fallback if the initial state is somehow invalid
            setMode("classic");
        }
    }, [mode]);

    const selectTheme = (newTheme) => {
        if (themes[newTheme]) { // Ensure the selected theme exists
            setMode(newTheme);
            localStorage.setItem("themeMode", newTheme);
        } else {
            console.warn(`Theme "${newTheme}" not found.`);
        }
    };

    const theme = themes[mode] || themes.classic; // Fallback to light theme if mode is somehow invalid

    return (
        <ThemeContext.Provider value={{ theme, themes, selectTheme, currentTheme: mode }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeContext;