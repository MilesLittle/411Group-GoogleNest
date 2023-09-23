import React, { useState, useEffect } from "react";
import DarkModeSwitchContext from './DarkModeSwitchContext'

const DarkModeSwitchProvider = ({ children }) => {
    const [switched, setSwitched] = useState(false)
    useEffect(() => {
        console.log(`Dark mode switch is ${switched}`)
        if (switched) {
            document.body.style.background = '#1a1a1a';
        } else {
            document.body.style.background = '-webkit-gradient(linear, left top, left bottom, from(#7BF1A8), to(#D1FAE1)) fixed';
        }
    }, [switched])
    return (
        <DarkModeSwitchContext.Provider value={{ switched, setSwitched }}>
            { children }
        </DarkModeSwitchContext.Provider>
    )
}

export default DarkModeSwitchProvider