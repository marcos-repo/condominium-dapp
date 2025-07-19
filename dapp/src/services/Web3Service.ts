import { ethers } from "ethers";
import CondominiumABI from "../contracts/abi/Condominium.abi.json";
import { getLoginData, type LoginResult } from "./LoginData";

const CONTRACT_ADDRESS =  import.meta.env.VITE_CONTRACT_ADDRESS;

export enum Profile {
    NONE = -1,
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
};

export type Resident = {
    wallet: string;
    isCounselor: boolean;
    isManager: boolean;
    residence: number;
    nextPayment: number;
};

function getProvider(): ethers.BrowserProvider {
    if(!window.ethereum) {
        throw new Error ("MetaMask não encontrada.");
    }

    return new ethers.BrowserProvider(window.ethereum);
}

function getContract(provider? : ethers.BrowserProvider) : ethers.Contract {
    if(!provider)
        provider = getProvider();

    return new ethers.Contract(CONTRACT_ADDRESS, CondominiumABI, provider);
}

export async function login() : Promise<LoginResult> {
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);

    if(!accounts || !accounts.length) {
        throw new Error ("MetaMask não encontrada/autorizada.");
    }

    const localAccount = accounts[0];
    const contract = getContract();

    let profile: Profile = Profile.NONE;
    const resident = await contract.getResident(localAccount) as Resident;
    let isManager = resident.isManager;

    console.log("resident", resident);

    console.log("isManager | resident.residence > 0", isManager , resident.residence);
    if(!isManager && resident.residence > 0) {
        profile = resident.isCounselor ? Profile.COUNSELOR : Profile.RESIDENT;
    }
    
    else if (!isManager && !resident.residence) {
        const managerAccount : string = (await contract.getManager());
        isManager = compareEthAccounts(localAccount,  managerAccount);
    }

    console.log("compareEthAccounts(localAccount,  managerAccount)",localAccount,  await contract.getManager());

    if(isManager) {
        profile = Profile.MANAGER 
    }
    else if(getLoginData() === undefined) {
        throw new Error("Unauthorized");
    }

    const result = {
        account: localAccount,
        profile: profile
    } as LoginResult;

    localStorage.setItem("loginData", JSON.stringify(result) );

    return result;
}

function compareEthAccounts(account1: string, account2: string) : boolean {
    return account1.toLowerCase() === account2.toLowerCase()
}