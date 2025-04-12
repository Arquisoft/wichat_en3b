import { useState } from "react";
import { alpha, AppBar, Box, Button, Container, MenuItem, Select } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import { Outlet, NavLink } from 'react-router';
import useAuth from "../hooks/useAuth";
import axios from "../utils/axios";
import { useTranslation } from "react-i18next";
import LanguageSelect from "./LanguageSelect";
import SettingsDialog from "./SettingsDialog";
import useTheme from "../hooks/useTheme";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";

const StyledNavlink = ({ theme, to, label, icon }) => {
    return (
        <NavLink to={to}>
            <Button sx={{
                color: theme.palette.primary.contrastText,
                gap: "0.5rem",
                "&:hover": { backgroundColor: alpha(theme.palette.primary.contrastText, 0.1) }
            }}>
                {icon} {label}
            </Button>
        </NavLink>
    );
}

const Layout = () => {
    const { auth, setAuth } = useAuth();
    const { theme, themes, selectTheme } = useTheme();
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.post("/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error(error);
        } finally {
            setAuth({});
        }
    }

    const { t } = useTranslation();

    return (
        <Container component="main" disableGutters sx={{
            minWidth: "100vw",
            minHeight: "100vh",
            p: 0,
            background: theme.palette.gradient.bg
        }}>
            <AppBar position="static" sx={{
                display: "flex",
                flexDirection: "row",
                padding: "0.5rem",
                background: theme.palette.gradient.main.right,
            }}>
                <StyledNavlink to="/home" label={t("home")} icon={<HomeIcon />} theme={theme} />
                
                <IconButton
                    onClick={() => setSettingsOpen(true)}
                    sx={{ color: "primary.contrastText" }}
                >
                    <SettingsIcon />
                </IconButton>

                <Box sx={{ ml: "auto" }}>
                    <>
                        <Select
                            onChange={(e) => selectTheme(e.target.value)}
                            sx={{ color: "primary.contrastText", "& .MuiSelect-icon": { color: "primary.contrastText" } }}
                            variant="outlined"
                            size="small"
                        >
                            {Object.keys(themes).map((themeKey) => (
                                <MenuItem key={themeKey} value={themeKey}>
                                    {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)} {/* Capitalize theme names */}
                                </MenuItem>
                            ))}
                        </Select>
                        {auth.username ? (
                            <Button
                                onClick={handleLogout}
                                sx={{
                                    color: "primary.contrastText",
                                    gap: "0.5rem",
                                    "&:hover": {
                                        backgroundColor: alpha(theme.palette.primary.contrastText, 0.1)
                                    }
                                }}
                            >
                                {t("logout")}
                            </Button>
                        ) : (
                            <>
                                <StyledNavlink to="/login" label={t("login")} theme={theme} />
                                <StyledNavlink to="/signup" label={t("signUp")} theme={theme} />
                            </>
                        )}
                    </>
                </Box>
            </AppBar>

            <Outlet />
            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </Container>
    );
}

export default Layout;