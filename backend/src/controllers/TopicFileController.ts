import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { ethers } from "ethers";

export async function getTopicFile(req: Request, res: Response, next: NextFunction) {
    res.sendStatus(200);
}

export async function getTopicFiles(req: Request, res: Response, next: NextFunction) {
    res.sendStatus(200);
}

export async function addTopicFile(req: Request, res: Response, next: NextFunction) {
    res.sendStatus(201);
}

export async function deleteTopicFile(req: Request, res: Response, next: NextFunction) {
    res.sendStatus(204);
}

export async function deleteTopicFiles(req: Request, res: Response, next: NextFunction) {
    res.sendStatus(204);
}


export default {
    getTopicFile,
    getTopicFiles,
    addTopicFile,
    deleteTopicFile,
    deleteAllTopicFiles: deleteTopicFiles
}