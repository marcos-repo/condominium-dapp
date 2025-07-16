import { ethers } from "ethers";
import type { LoginResult } from "../routes/Router";

function getProvider(): ethers.BrowserProvider {
    if(!window.ethereum) {
        throw new Error ("MetaMask não encontrada.");
    }

    return new ethers.BrowserProvider(window.ethereum);
}

export async function login() : Promise<string> {
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);

    if(!accounts || !accounts.length) {
        throw new Error ("MetaMask não encontrada/autorizada.");
    }

    const result =  {
        account: accounts[0],
        isAdmin: true
    } as LoginResult;

    localStorage.setItem("loginData", JSON.stringify(result) );

    return accounts[0];
}