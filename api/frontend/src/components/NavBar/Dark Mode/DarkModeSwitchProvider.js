import React, { useState, useEffect } from "react";
import DarkModeSwitchContext from './DarkModeSwitchContext'

const DarkModeSwitchProvider = ({ children }) => {
    const [switched, setSwitched] = useState(false)
    useEffect(() => {
        console.log(switched)
    }, [switched])
    return (
        <DarkModeSwitchContext.Provider value={{ switched, setSwitched }}>
            { children }
        </DarkModeSwitchContext.Provider>
    )
}

export default DarkModeSwitchProvider