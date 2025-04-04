// src/context/AuthContext.js
import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch the authenticated user on page load
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get("http://localhost:5000/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("✅ User fetched:", res.data);
                setUser(res.data);
            } catch (error) {
                console.error("❌ Error fetching user:", error.response?.data || error.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // ✅ Login Function
    const login = async (email, password) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
        } catch (error) {
            console.error("❌ Login error:", error.response?.data || error.message);
            throw error.response?.data || error;
        }
    };

    // ✅ Signup Function
    const signup = async (userData) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", userData);
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
        } catch (error) {
            console.error("❌ Signup error:", error.response?.data || error.message);
            throw error.response?.data || error;
        }
    };

    // ✅ Logout Function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
