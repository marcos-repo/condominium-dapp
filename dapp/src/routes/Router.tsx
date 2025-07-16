import {Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Topics from '../pages/Topics';
import type { JSX } from 'react';


export type LoginResult = {
    account: string;
    isAdmin: boolean;
};

export function getLoginData() : LoginResult | undefined {
    const loginDataStorage = localStorage.getItem("loginData");
    return loginDataStorage ? 
                    JSON.parse(loginDataStorage) as LoginResult : 
                    undefined;
}

function Router() {

    type Props = {
        children: JSX.Element
    };

    function PrivateRoute({children}: Props) {
        const loginData = getLoginData();

        return loginData == undefined ? <Navigate to="/" /> : children
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
            </Routes>
        </BrowserRouter>
    )
}

export default Router;