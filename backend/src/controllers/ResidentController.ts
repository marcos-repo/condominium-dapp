import { Request, Response, NextFunction } from "express";
import Resident from "../models/Resident";
import ResidentRepository from "../repositories/ResidentRepository";

export async function getResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const resident = await ResidentRepository.getResident(wallet);

    if(!resident)
        return res.sendStatus(404);

    res.json(resident);
    
}

export async function addResident(req: Request, res: Response, next: NextFunction) {
    const resident = req.body as Resident;
    const result = await ResidentRepository.addResident(resident);

    res.status(201).json(result);
}

export async function updateResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const resident = req.body as Resident;
    const result = await ResidentRepository.updateResident(wallet, resident);

    res.json(result);
}

export async function deleteResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const success = await ResidentRepository.deleteResident(wallet);

    if(success) 
        res.sendStatus(204);
    else
        res.sendStatus(404);
}

export default {
    getResident,
    addResident,
    updateResident,
    deleteResident
}