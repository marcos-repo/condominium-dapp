import { Profile } from "./Web3Service";

export type LoginResult = {
    account: string;
    profile: number;
};


export function getLoginData() : LoginResult | undefined {
    const loginDataStorage = localStorage.getItem("loginData");
    return loginDataStorage ? 
                    JSON.parse(loginDataStorage) as LoginResult : 
                    undefined;
}

export function isManager() : boolean {
    const loginData = getLoginData();
    return loginData !== undefined ? loginData.profile === Profile.MANAGER : false;
}

export function logOut(){
    localStorage.removeItem("loginData");
}