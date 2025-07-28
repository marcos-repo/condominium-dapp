import { Request, Response, NextFunction } from "express";
import { login, LoginData } from "../controllers/AuthController";
import { Profile } from "../models/Resident";

export function onlyManager (req: Request, res: Response, next: NextFunction)  {
    const token = res.locals.token;

    if(!token) {
        res.sendStatus(403);
        return;
    }

    const loginData = res.locals.token as LoginData & {profile: Profile};
    if(loginData.profile === Profile.MANAGER) {
        next();
        return;
    }

    res.sendStatus(403);
}

export function onlyCounselor (req: Request, res: Response, next: NextFunction)  {
    const token = res.locals.token;
    if(!token) {
        res.sendStatus(403);
        return;
    }

    const loginData = res.locals.token as LoginData & {profile: Profile};
    if(loginData.profile !== Profile.RESIDENT) {
        next();
        return;
    }

    res.sendStatus(403);
}