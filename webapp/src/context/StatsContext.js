import { createContext, useState } from "react";

const StatsContext = createContext({});

export const StatsProvider = ({ children }) => {
    const [updateStats, setUpdateStats] = useState(false);

    const triggerStatsUpdate = () => {
        setUpdateStats(prev => !prev);
    };

    return (
        <StatsContext.Provider value={{ updateStats, setUpdateStats, triggerStatsUpdate }}>
            {children}
        </StatsContext.Provider>
    );
};

export default StatsContext;
