import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import bodyParser from 'body-parser';

import morgan from 'morgan';
import dbConnect from "./dbConfig/index.js"

import rootRouter from "./routes/index.js"
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

dbConnect();

app.use(morgan('dev'))

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//routes
app.use(rootRouter);

//errorhandler
app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(`Service running of port ${PORT}`);
})



