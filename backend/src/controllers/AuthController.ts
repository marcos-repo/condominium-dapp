import { Request, Response, NextFunction } from "express";
import Resident from "../models/Resident";
import ResidentRepository from "../repositories/ResidentRepository";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";


export type LoginData = {
    timestamp: number;
    wallet: string;
    secret: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES : number = parseInt(process.env.JWT_EXPIRES || "1800");

export async function login(req: Request, res: Response, next: NextFunction) {

    const data = req.body as LoginData;
    if(data.timestamp < (Date.now() - (30 * 1000))){
        res.status(401).send('Acesso expirado.');
        return;
    }

    const message = `Autenticando em Condominium App. Timestamp: ${data.timestamp}`;

    const signer = ethers.verifyMessage(message, data.secret);

    if(signer.toUpperCase() === data.wallet.toUpperCase()) {
        const resident = await ResidentRepository.getResident(data.wallet);
        if(!resident) {
            res.status(401).send('Acesso inválido');
            return;
        }

        const payload = { 
            ...data, 
            profile: resident.profile 
        };

        const options = { expiresIn: JWT_EXPIRES }
        const token = jwt.sign(payload, JWT_SECRET, options);

        res.json({token});
        return;
    }

    res.status(401).send('Carteira e assinatura inválidas.');
}


export default {
    login
}