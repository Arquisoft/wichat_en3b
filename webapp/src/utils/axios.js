import axios from "axios";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || "http://localhost:8000";

export default axios.create({
    baseURL: apiEndpoint
});

export const axiosPrivate = axios.create({
    baseURL: apiEndpoint,
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});