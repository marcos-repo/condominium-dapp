import express, {Request, Response, NextFunction } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorMiddleware from './middlewares/errorMiddleware';
import ResidentRouter from './routers/ResidentRouter';
import LoginRouter from './routers/LoginRouter';
import authenticationMiddleware from './middlewares/autenticationMiddleware';
import multer from 'multer';
import TopicFileRouter from './routers/TopicFileRouter';

const app = express();

app.use(morgan('tiny'));
app.use(helmet());

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

app.use(express.json());

app.use('/login/', LoginRouter);

app.use('/residents/', authenticationMiddleware, ResidentRouter);

const uploadMiddleware = multer({ dest: "files"});
app.use('topicfiles', authenticationMiddleware, uploadMiddleware.single("file"), TopicFileRouter);

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('{ status: OK }');
});

app.use(errorMiddleware);

export default app;