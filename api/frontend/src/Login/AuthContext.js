import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const AuthContext = createContext({})
export default ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [authenticated, setAuthenticated] = useState(false)

    return (
        <AuthContext.Provider value={{currentUser, setCurrentUser, authenticated, setAuthenticated}}>
            { children }
        </AuthContext.Provider>
    );
}
