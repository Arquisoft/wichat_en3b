import axios from "../utils/axios";
import useAuth from "./useAuth";

/**
 * @returns a function that refreshes the access token
 */
const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async () => {
        const response = await axios.get("/refresh", { withCredentials: true });
        setAuth(prev => {
            return { ...prev, username: response.data.username, accessToken: response.data.accessToken };
        });
        return response.data.accessToken;
    };

    return refresh;
};

export default useRefreshToken;