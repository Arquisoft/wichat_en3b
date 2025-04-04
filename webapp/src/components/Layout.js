import { AppBar, Box, Button, Container } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import { Outlet, NavLink } from 'react-router';
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import useTheme from "../hooks/useTheme";

const StyledNavlink = ({ to, label, icon }) => {
    return (
        <NavLink to={to}>
            <Button sx={{ color: "white", gap: "0.5rem", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}>
                {icon} {label}
            </Button>
        </NavLink>
    );
}

const Layout = () => {
    const { auth, setAuth } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        try {
            await axios.post("/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error(error);
        } finally {
            setAuth({});
        }
    }

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
                <StyledNavlink to="/home" label="Home" icon={<HomeIcon />} />
                <Box sx={{ ml: "auto" }}>
                    <>
                    <Button 
                        value="check"
                        onClick={toggleTheme}
                        sx={{ color: "white", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}>
                        Toggle Theme
                    </Button>
                        {auth.username
                            ? <Button onClick={handleLogout} sx={{ color: "white", gap: "0.5rem", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}>
                                Log Out
                            </Button>
                            : <StyledNavlink to="/login" label="Login" />}
                    </>
                </Box>
            </AppBar>

            <Outlet />
        </Container>
    );
}

export default Layout;