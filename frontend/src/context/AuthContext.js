// src/context/AuthContext.js
import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/auth/me");
                setUser(res.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post("/api/auth/login", { email, password });
        setUser(res.data.user);
    };

    const signup = async (userData) => {
        const res = await axios.post("/api/auth/signup", userData);
        setUser(res.data.user);
    };

    const logout = async () => {
        await axios.post("/api/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
