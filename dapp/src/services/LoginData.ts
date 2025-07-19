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

export function isCouncil() : boolean {
    const loginData = getLoginData();
    return loginData !== undefined ? loginData.profile === Profile.COUNSELOR : false;
}

export function isResident() : boolean {
    const loginData = getLoginData();
    return loginData !== undefined ? loginData.profile === Profile.RESIDENT : false;
}

export function getProfile() : Profile {
    const loginData = getLoginData();
    return loginData !== undefined ? loginData.profile : Profile.RESIDENT;
}

export function getLoginAccount() : string | undefined {
    const loginData = getLoginData();
    return loginData !== undefined ? loginData.account : undefined;
}

export function logOut(){
    localStorage.removeItem("loginData");
}