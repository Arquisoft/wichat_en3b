import { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, alpha } from "@mui/material/styles";
import { blue, cyan, deepPurple, grey, red, teal, yellow } from "@mui/material/colors";
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
            secondary: blue,
            background: {
                default: "#fff",
                paper: grey[50],
            },
            text: {
                primary: grey[900],
                secondary: grey[700],
            },
            gradient: {
                bg: `linear-gradient(to bottom right, ${cyan[100]}, ${yellow[100]})`,
                main: createGradient(lighten("#5254bc", 0.1), darken("#5254bc", 0.1)),
                hover: createHoverGradient(lighten("#5254bc", 0.1), darken("#5254bc", 0.1))
            }
        },
    }),
    dark: createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: red[700],
                light: red[500],
                dark: red[900],
                contrastText: '#fff',
            },
            secondary: teal,
            background: {
                default: '#121212',
                paper: '#1e1e1e',
            },
            text: {
                primary: '#fff',
                secondary: grey[500],
            },
            gradient: {
                bg: `linear-gradient(to bottom right, ${red[900]}, ${teal[700]})`,
                main: createGradient(red[700], teal[300]),
                hover: createHoverGradient(red[700], teal[300])
            }
        },
    }),
    yellow: createTheme({
        palette: {
            mode: 'light',
            primary: yellow,
            secondary: deepPurple,
            background: {
                default: grey[200],
                paper: grey[50],
            },
            text: {
                primary: grey[900],
                secondary: grey[700],
            },
            gradient: {
                bg: `linear-gradient(to bottom right, ${yellow[50]}, ${yellow[200]})`,
                main: createGradient(yellow[600], yellow[800]),
                hover: createHoverGradient(yellow[600], yellow[800]),
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