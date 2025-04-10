import { useEffect } from "react";
import { axiosPrivate } from "../utils/axios";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxios = () => {
    const refresh = useRefreshToken();
    const { auth, setAuth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error.config;
                if (error.response.status === 403 && !prevRequest.sent) {
                    prevRequest.sent = true;
                    let newAccessToken;
                    try {
                        newAccessToken = await refresh();
                    } catch (error) { // Logout automatically if refresh fails
                        console.log("refresh failed");
                        if (error.response.status === 403) setAuth({});
                    }
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh, setAuth]);

    return axiosPrivate;
}

export default useAxios;