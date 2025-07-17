import { ethers } from "ethers";
import type { LoginResult } from "../routes/Router";
import CondominiumABI from "../contracts/abi/Condominium.abi.json";

const CONTRACT_ADDRESS =  import.meta.env.VITE_CONTRACT_ADDRESS;

export enum Profile {
    RESIDENT = 0,
    COUNSELOR = 1,
    MANAGER = 2
}

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

    const localAccount = accounts[0].toLowerCase();
    const contract = getContract();
    const manager : string = (await contract.getManager()).toLowerCase();
    const isManager = manager === localAccount;

    const result =  {
        account: localAccount,
        profile: isManager ? 
                    Profile.MANAGER : 
                    Profile.RESIDENT
    } as LoginResult;

    localStorage.setItem("loginData", JSON.stringify(result) );

    return result;
}