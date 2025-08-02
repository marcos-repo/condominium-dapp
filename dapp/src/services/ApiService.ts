import { keccak256, toUtf8Bytes } from "ethers";
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

export type ApiResident = {
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
    await axios.delete(`${API_URL}/residents/${wallet}`);
}

export async function uploadTopicFile(topicTitle: string, file: File): Promise<void> {
    const hash = keccak256(toUtf8Bytes(topicTitle));
    console.log("hash - uploadTopicFile - front",hash);

    const formData = new FormData();
    formData.append("file", file);

    await axios.post(
        `${API_URL}/topicFiles/${hash}`,
        formData, {
            headers: {
                "Content-Type" : "multipart/form-data"
            }
        }
    );

    
}

export async function getTopicFiles(topicTitle: string): Promise<string[]> {
    
    const hash = keccak256(toUtf8Bytes(topicTitle));
    console.log("hash - getTopicFiles - front",hash);

    const response = await axios.get(`${API_URL}/topicFiles/${hash}`);
    return response.data as string[];
}

export async function deleteTopicFiles(topicTitle: string, fileName: string): Promise<void> {
    const hash = keccak256(toUtf8Bytes(topicTitle));
    console.log("hash - deleteTopicFiles - front",hash);
    
    await axios.delete(`${API_URL}/topicFiles/${hash}/${fileName}`);
}