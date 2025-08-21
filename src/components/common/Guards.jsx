import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

export function AuthGuard() {
    const token = localStorage.getItem("token");
    let user = !!token ? jwtDecode(token) : null;
    console.log("UI consle AuthGuard user = = > ", user)
    let isAuth = user?.role === "owner" || user?.role === "member"
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export function OnwerGuard() {
    const token = localStorage.getItem("token");
    let user = jwtDecode(token);
    console.log("UI console OnwerGuard user = = > ", user)
    let isOwner = user?.role === "owner"
    return isOwner ? <Outlet /> : <Navigate to="/403" replace />;
}

export function MemberGuard() {
    const token = localStorage.getItem("token");
    let user = jwtDecode(token);
    console.log("UI console MemberGuard user = = > ", user)
    let isMember = user?.role === "dealer"
    return isMember ? <Outlet /> : <Navigate to="/403" replace />;
}
