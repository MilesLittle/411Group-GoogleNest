import React, { createContext, useState } from "react";
export const AuthContext = createContext({})
export default ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [authenticated, setAuthenticated] = useState(false)
    return (
        <AuthContext.Provider value={{currentUser, setCurrentUser, authenticated, setAuthenticated}}>
            { children }
        </AuthContext.Provider>
    );
}
