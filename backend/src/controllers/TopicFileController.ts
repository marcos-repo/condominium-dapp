import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { ethers, keccak256, toUtf8Bytes } from "ethers";

function checkTitleOrHash(titleOrHash: string): string {
    if(!titleOrHash)
        throw new Error("Título ou Hash obrigatórios.");

    const regEx = /^(0x)?[a-f0-9]{64}$/gi;
    if(!regEx.test(titleOrHash)) {
        const hash =  keccak256(toUtf8Bytes(titleOrHash));
        return hash;
    }
        

    return titleOrHash;
}

export async function getTopicFile(req: Request, res: Response, next: NextFunction) {
    const hash = checkTitleOrHash(req.params.hash);
    const fileName = req.params.fileName;
    const filePath = path.resolve(__dirname, "..", "..", "files", hash, fileName);

    if(!fs.existsSync(filePath)) {
        res.sendStatus(404);
        return;
    }

    res.download(filePath);
}

export async function getTopicFiles(req: Request, res: Response, next: NextFunction) {
    const hash = checkTitleOrHash(req.params.hash);
    const folder = path.resolve(__dirname, "..", "..", "files", hash);

    if(fs.existsSync(folder)) {
        const files = fs.readdirSync(folder);
        res.json(files);
        
        return;
    }
    
    res.json([]);
}

export async function addTopicFile(req: Request, res: Response, next: NextFunction) {

    const hash = checkTitleOrHash(req.params.hash);
    const file = req.file;
    if(!file) {
        next(new Error("Nenhum arquivo encontrado."));
        return;
    }

    const folder = path.resolve(__dirname, "..", "..", "files");
    const oldPath = path.join(folder, file.filename);

    const newFolder = path.join(folder, hash);
    if(!fs.existsSync(newFolder))
        fs.mkdirSync(newFolder);

    const newPath = path.join(newFolder, file.originalname);
    fs.renameSync(oldPath, newPath);
    
    res.sendStatus(201);
}

export async function deleteTopicFile(req: Request, res: Response, next: NextFunction) {
    const hash = checkTitleOrHash(req.params.hash);
    const fileName = req.params.fileName;
    const filePath = path.resolve(__dirname, "..", "..", "files", hash, fileName);

    if(!fs.existsSync(filePath)) {
        res.sendStatus(404);
        return;
    }

    fs.unlinkSync(filePath);

    res.sendStatus(204);
}

export async function deleteAllTopicFiles(req: Request, res: Response, next: NextFunction) {
    const hash = checkTitleOrHash(req.params.hash);
    const folder = path.resolve(__dirname, "..", "..", "files", hash);
    const files = fs.readdirSync(folder);

    files.map(file => fs.unlinkSync(path.join(folder, file)));
    fs.rmdirSync(folder);


    res.sendStatus(204);
}


export default {
    getTopicFile,
    getTopicFiles,
    addTopicFile,
    deleteTopicFile,
    deleteAllTopicFiles
}