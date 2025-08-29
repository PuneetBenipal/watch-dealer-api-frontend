import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { jwtDecode } from "jwt-decode";
import API from "../api";
import { CustomToast } from '../components/Alerts/CustomToast';

export const useAuth = () => {
    const { authState, update } = useContext(AuthContext);

    const validateToken = async () => {
        const token = localStorage.getItem('token');
        try {
            if (!token) throw new Error("Token is expered. Please login again.")
            const res = await API.get('/api/auth/verify');

            update({ user: res.data.user, company: res.data.company });
        } catch (error) {
            console.log('Token invalid, clearing session');
            // localStorage.removeItem('token');
            update({ user: null, company: null });
            CustomToast("error", error.message);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await API.post('/api/auth/login', { email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            setAuth(token);

            CustomToast("success", "Login is Successful");
            
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard';
            
            return { success: true, user: userData };
        } catch (error) {
            CustomToast("error", error.response?.data?.msg);
            return { success: false, error: error.response?.data?.msg };
        }
    };

    const registerAgent = async (email, password, fullName) => {
        try {
            const response = await API.post('/api/auth/agent-register', { email, password, fullName });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setAuth(token);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Registration error:', error);

        }
    };

    const registerDealer = async (userData) => {
        try {
            const response = await API.post('/api/auth/dealer-register', userData);
            const { token, user: userResponse } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userResponse));

            setAuth(token);
            CustomToast('success', 'Register is Successful');
            const nextPage = "/account"
            return nextPage;
        } catch (error) {
            console.error('Company Admin registration error:', error);
            CustomToast('error', error.response?.data?.msg);
        }
    };

    const registerAdmin = async (email, password, fullName, superAdminCode) => {
        try {
            const response = await API.post('/api/auth/super-admin/register', {
                email,
                password,
                fullName,
                superAdminCode,
            });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            update({ user: userData, jwtToken: token })

            return { success: true, user: userData };
        } catch (error) {
            console.error('Super Admin registration error:', error);
            throw error.response.data.error;
        }
    };

    const setAuth = (token) => {
        try {
            // const token = localStorage.getItem("token");
            if (!token) throw new Error("Token is invalid");
            const user = jwtDecode(token);
            console.log("UI console user", user)
            update({ user: user, jwtToken: token });

        } catch (error) {
            console.log("UI console useAuth error", error)
            update({ user: {}, jwtToken: "" });
        }
    }

    const logout = () => {
        // Clear authentication state
        setAuth(null);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
    };


    const user = authState.user;
    const company = authState.company;
    const isAuth = !!authState.jwtToken;

    return {
        authState,
        setAuth,
        update,
        user,
        company,
        isAuth,
        login,
        registerAgent,
        logout,
        registerDealer,
        registerAdmin
    }

};

export default useAuth; 