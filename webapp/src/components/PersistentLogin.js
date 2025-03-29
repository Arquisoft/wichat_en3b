import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";
import { Typography } from "@mui/material";

const PersistentLogin = () => {
    const { auth, persist } = useAuth();
    const refresh = useRefreshToken();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (error) {
                console.error(error);
            } finally {
                isMounted && setLoading(false);
            }
        }

        !auth.accessToken ? verifyRefreshToken() : setLoading(false);

        return () => isMounted = false;
    }, []);

    return (
        <>
            {!persist
                ? <Outlet />
                : loading
                    ? <Typography>Loading...</Typography>
                    : <Outlet />
            }
        </>
    );
};

export default PersistentLogin;