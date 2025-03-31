import { createContext, useState, useContext } from "react";

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
    const [updateStats, setUpdateStats] = useState(false);

    const triggerStatsUpdate = () => {
        setUpdateStats(prev => !prev);
    };

    return (
        <StatsContext.Provider value={{ updateStats, triggerStatsUpdate }}>
            {children}
        </StatsContext.Provider>
    );
};

export const useStats = () => useContext(StatsContext);
