import { createContext, useState, useEffect } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, alpha } from "@mui/material/styles";
import { amber, blue, blueGrey, brown, cyan, deepOrange, deepPurple, green, grey, indigo, lightBlue, lightGreen, orange, pink, purple, red, teal, yellow } from "@mui/material/colors";
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
    // light themes
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
                default: blue[50],
                paper: grey[200],
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
    desert: createTheme({
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
                paper: grey[200],
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
    temple: createTheme({
        palette: {
            mode: "light",
            primary: {
                main: grey[600],
            },
            secondary: {
                main: amber[700],
            },
            background: {
                default: grey.A100,
                paper: blueGrey[100],
            },
            text: {
                primary: grey[900],
                secondary: grey[700],
            },
            gradient: {
                bg: `linear-gradient(to bottom, ${grey[100]}, ${blueGrey[200]})`,
                main: createGradient(darken(amber[600], 0.05), red[800]),
                hover: createHoverGradient(darken(amber[600], 0.05), red[800])
            }
        },
    }),
    cherryBlossom: createTheme({
        palette: {
            mode: "light",
            primary: {
                main: pink[300],
            },
            secondary: {
                main: lightGreen[500],
            },
            background: {
                default: lighten(pink[50], 0.5),
                paper: "#fff",
            },
            text: {
                primary: grey[800],
                secondary: grey[600],
            },
            gradient: {
                bg: `linear-gradient(to top right, ${pink[100]}, ${lightGreen[100]})`,
                main: createGradient(pink[300], lightGreen[600]),
                hover: createHoverGradient(pink[300], lightGreen[600])
            }
        },
    }),
    forest: createTheme({
        palette: {
            mode: "light",
            primary: {
                main: green[800],
            },
            secondary: {
                main: brown[500],
            },
            background: {
                default: lightGreen[50],
                paper: "#fff",
            },
            text: {
                primary: brown[900],
                secondary: grey[700],
            },
            gradient: {
                bg: `linear-gradient(to top left, ${lightGreen[100]}, ${yellow[100]})`,
                main: createGradient(lightGreen[800], green[900]),
                hover: createHoverGradient(lightGreen[800], green[900])
            }
        },
    }),
    // dark themes
    deepSea: createTheme({
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
    night: createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: grey[600],
            },
            secondary: {
                main: grey[700],
            },
            background: {
                default: '#23272A',
                paper: '#2C2F33',
            },
            text: {
                primary: "#f5f5f5",
                secondary: " #a0aec0",
            },
            gradient: {
                bg: `linear-gradient(to bottom, #23272A, #2C2F33)`,
                main: createGradient(grey[800], grey[900]),
                hover: createHoverGradient(grey[700], grey[900])
            }
        },
    }),
    garnetDepth: createTheme({
        palette: {
            mode: "dark",
            primary: {
                main: pink[800],
            },
            secondary: {
                main: purple[300],
            },
            background: {
                default: '#211a2c',
                paper: '#2f2b41',
            },
            text: {
                primary: '#f5f5f5',
                secondary: '#a0aec0',
            },
            gradient: {
                bg: `linear-gradient(to bottom left, #33051e, #1e0631)`,
                main: createGradient(pink[900], darken(purple[800], 0.2)),
                hover: createHoverGradient(pink[900], darken(purple[800], 0.2))
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