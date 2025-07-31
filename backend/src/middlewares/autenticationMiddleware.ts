import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = `${process.env.JWT_SECRET}`;

export default (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers['authorization'];
    const queryToken = req.query.token as string;
    if(token || queryToken) {
        try {
            const decoded = jwt.verify(token || queryToken, JWT_SECRET);
            if(decoded) {
                res.locals.token = decoded;
                next();
                return;
            }
            console.error('Erro ao decodificar token');
        } catch (error: any) {
            console.error(error);
        }
    }
    else {
        console.error("Nenhum token fornecido")
    }

    res.sendStatus(401);
}