import { useContext } from "react";
import StatsContext from "../context/StatsContext";

const useStats = () => {
    return useContext(StatsContext);
}

export default useStats;