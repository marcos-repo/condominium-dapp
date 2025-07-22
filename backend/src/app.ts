import express, {Request, Response, NextFunction } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorMiddleware from './middlewares/errorMiddleware';

const app = express();

app.use(morgan('tiny'));
app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json());

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('OK');
})

app.use(errorMiddleware);

export default app;