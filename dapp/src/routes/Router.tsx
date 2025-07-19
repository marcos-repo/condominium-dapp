import {Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Topics from '../pages/Topics';
import type { JSX } from 'react';
import { getLoginData, isCouncil, isManager, logOut } from '../services/LoginData';
import Transfer from '../pages/Transfer';
import Settings from '../pages/Settings';



function Router() {

    type Props = {
        children: JSX.Element
    };

    function PrivateRoute({children}: Props) {
        const loginData = getLoginData();

        return loginData === undefined ? <Navigate to="/" /> : children
    }

    function ManagerRoute({children}: Props) {
        const loginData = getLoginData();
        const isAuth = loginData !== undefined;
        
        if(isAuth && isManager())
            return children;

        logOut();
        return <Navigate to="/" />;
    }

    function CouncilRoute({children}: Props) {
        const loginData = getLoginData();
        const isAuth = loginData !== undefined;
        
        if(isAuth && isCouncil())
            return children;

        logOut();
        return <Navigate to="/" />;
    }

    function ResidentRoute({children}: Props) {
        const loginData = getLoginData();
        const isAuth = loginData !== undefined;
        
        if(isAuth && isResident())
            return children;

        logOut();
        return <Navigate to="/" />;
    }


    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/topics" element={
                    <PrivateRoute>
                        <Topics />
                    </PrivateRoute>
                } />
                <Route path="/transfer" element={
                    <ManagerRoute>
                        <Transfer />
                    </ManagerRoute>
                } />
                <Route path="/settings" element={
                    <ManagerRoute>
                        <Settings />
                    </ManagerRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default Router;