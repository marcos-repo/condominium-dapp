import { ethers } from "ethers";
import CondominiumABI from "../contracts/abi/Condominium.abi.json";
import { getLoginAccount, getLoginData, getProfile, type LoginResult } from "./LoginData";
import { loginApi } from "./ApiService";

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

export enum Category {
    NONE = -1,
    DECISION = 0,
    SPENT = 1,
    CHANGE_QUOTA = 2,
    CHANGE_MANAGER = 3
}

export function getStatus(status: Status) {
    switch(status) {
        case Status.VOTING: return "EM VOTAÇÃO";
        case Status.APPROVED: return "APROVADO";
        case Status.DELETED: return "REMOVIDO";
        case Status.DENIED: return "NEGADO";
        case Status.SPENT: return "GASTO";
        default: return "AGUARDANDO";
    }
}

export function getCategory(category: Category) {
    switch(category) {
        case Category.DECISION: return "Decisão";
        case Category.SPENT: return "Despesa";
        case Category.CHANGE_QUOTA: return "Alteração de Cota";
        case Category.CHANGE_MANAGER: return "Eleição de Síndico";
        default: return "-";
    }
}

export enum Status {
    IDLE = 0,
    VOTING = 1,
    APPROVED = 2, 
    DENIED = 3,
    SPENT = 4, 
    DELETED = 5
}

export type Topic = {
    title: string;
    description: string;
    category: Category;
    amount: ethers.BigNumberish;
    responsible: string;
    status?: Status;
    createDate: ethers.BigNumberish;
    startDate: ethers.BigNumberish;
    endDate: ethers.BigNumberish;
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

async function getContractSigner(provider? : ethers.BrowserProvider) : Promise<ethers.Contract> {
    if(!provider)
        provider = getProvider();

    const signer = await provider.getSigner(getLoginAccount());

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CondominiumABI, provider);

    return contract.connect(signer) as ethers.Contract;
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

    if(!isManager && resident.residence > 0) {
        profile = resident.isCounselor ? Profile.COUNSELOR : Profile.RESIDENT;
    }    
    else if (!isManager && !resident.residence) {
        const managerAccount : string = (await contract.getManager());
        isManager = compareEthAccounts(localAccount,  managerAccount);
    }

    if(isManager) {
        profile = Profile.MANAGER 
    }
    // else if(getLoginData() === undefined) {
    //     throw new Error("Unauthorized");
    // }


    const signer = await provider.getSigner();
    const timestamp = Date.now();
    const message = `Autenticando em Condominium App. Timestamp: ${timestamp}`;
    const secret = await signer.signMessage(message);

    const token = await loginApi(localAccount, secret, timestamp);

    const result = {
        token,
        account: localAccount,
        profile
    } as LoginResult;

    localStorage.setItem("loginData", JSON.stringify(result) );

    return result;
}

export async function getAddress(): Promise<string> {
    const contract = getContract();
    return await contract.getImplementationAddress();
}

export async function upgradeContract(address: string): Promise<ethers.Transaction> {
    if(getProfile() !== Profile.MANAGER) throw new Error("Somente o síndico pode executar esta operação.");

    const contract = await getContractSigner();
    
    return await contract.init(address) as ethers.Transaction;

}

export async function addResident(wallet: string, residenceId: number): Promise<ethers.Transaction> {
    if(getProfile() === Profile.RESIDENT) throw new Error("Somente o síndico ou um Conselheiro podem executar esta operação.");

    const contract = await getContractSigner();
    
    return await contract.addResident(wallet, residenceId) as ethers.Transaction;
}

export async function removeResident(wallet: string): Promise<ethers.Transaction> {
    if(getProfile() !== Profile.MANAGER) throw new Error("Somente o síndico pode executar esta operação.");

    const contract = await getContractSigner();
    
    return await contract.removeResident(wallet) as ethers.Transaction;
}

export async function setCounselor(wallet: string, isEntering: boolean): Promise<ethers.Transaction> {
    if(getProfile() !== Profile.MANAGER) throw new Error("Somente o síndico pode executar esta operação.");

    const contract = await getContractSigner();
    
    return await contract.setCounselor(wallet, isEntering) as ethers.Transaction;
}

export type ResidentPage = {
    residents: Resident[];
    totalCount: ethers.BigNumberish;
}

export async function getResident(wallet: string): Promise<Resident> {
    const contract = getContract();
    return await contract.getResident(wallet) as Resident;
}

export async function getResidents(page: number = 1, pageSize: number = 10): Promise<ResidentPage> {
    const contract = getContract();
    const result = await contract.getResidents(page, pageSize) as ResidentPage;

    const residentsArr = [... result.residents];

    const residents = residentsArr
    .filter(r => r.residence > 0)
    .sort((a,b) => {
        return a.residence > b.residence ? 1 : -1;
    });

    return {
        residents,
        totalCount: result.totalCount
    } as ResidentPage;
}


export type TopicPage = {
    topics: Topic[];
    totalCount: ethers.BigNumberish;
}

export async function getTopic(title: string): Promise<Topic> {
    const contract = getContract();
    return await contract.getTopic(title) as Topic;
}

export async function getTopics(page: number = 1, pageSize: number = 10): Promise<TopicPage> {
    const contract = getContract();
    const result = await contract.getTopics(page, pageSize) as TopicPage;

    const topicsArr = [... result.topics];

    const topics = topicsArr;//.filter(r => r.createdDate);

    return {
        topics,
        totalCount: result.totalCount
    } as TopicPage;
}

export async function addTopic(topic: Topic): Promise<ethers.Transaction> {
    const contract = await getContractSigner();
    
    topic.amount = ethers.toBigInt(topic.amount || 0);

    return await contract.addTopic(
                                    topic.title, 
                                    topic.description, 
                                    topic.category, 
                                    topic.amount, 
                                    topic.responsible || ethers.ZeroAddress) as ethers.Transaction;
}

export async function editTopic(topicToEdit: string, description: string, amount: ethers.BigNumberish, responsible: string): Promise<ethers.Transaction> {
    if(getProfile() !== Profile.MANAGER) throw new Error("Somente o síndico ou um Conselheiro podem executar esta operação.");

    const contract = await getContractSigner();
    
    amount = ethers.toBigInt(amount || 0);
    return await contract.editTopic(topicToEdit, description, amount, responsible) as ethers.Transaction;
}

export async function removeTopic(wallet: string): Promise<ethers.Transaction> {
    if(getProfile() !== Profile.MANAGER) throw new Error("Somente o síndico pode executar esta operação.");

    const contract = await getContractSigner();
    
    return await contract.removeTopic(wallet) as ethers.Transaction;
}


function compareEthAccounts(account1: string, account2: string) : boolean {
    return account1.toLowerCase() === account2.toLowerCase()
}