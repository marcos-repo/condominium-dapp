import axios from 'axios';
import { getToken, logOut } from './LoginData';


const instance = axios.create({
    headers: {
        "Content-Type": "application/json",
        "Authorization": getToken() || ""
    }
});

instance.interceptors.response.use(
    response => response,
    error => {
        if(error.response && [401, 403].includes(error.response.status)) {
            console.error('Redrecionando para o login. 4xx response!');
            logOut();

            if(window.location.pathname !== '/')
                return window.location.href = '/';
        }

        return Promise.reject(error);
    }
);

export default instance;