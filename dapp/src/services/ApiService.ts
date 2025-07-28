import axios from "./AxiosService";
import type { Profile } from "./Web3Service";

const API_URL = import.meta.env.VITE_API_URL;

export async function loginApi(wallet: string, secret: string, timestamp: number) : Promise<string | undefined> {

    const response = await axios.post(`${API_URL}/login`, {wallet, secret, timestamp});

    if (typeof response.data === 'object' && response.data !== null && 'token' in response.data) {
        return response.data.token as string;
    }

    return undefined;
}

type ApiResident = {
    wallet: string;
    name: string;
    profile: Profile;
    phone?: string;
    email?: string;
}

export async function getApiResident(wallet: string): Promise<ApiResident> {
    const response = await axios.get(`${API_URL}/residents/${wallet}`);
    return response.data as ApiResident;
}

export async function addApiResident(resident: ApiResident): Promise<ApiResident> {
    const response = await axios.post(`${API_URL}/residents/`, resident);
    return response.data as ApiResident;
}

export async function updateApiResident(wallet: string, resident: ApiResident): Promise<ApiResident> {
    const response = await axios.patch(`${API_URL}/residents/${wallet}`, resident);
    return response.data as ApiResident;
}

export async function deleteApiResident(wallet: string): Promise<void> {
    await axios.patch(`${API_URL}/residents/${wallet}`);
}