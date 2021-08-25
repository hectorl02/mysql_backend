import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import {Request, Response} from "express";
import * as cors from 'cors';
import * as helmet from 'helmet';
const PORT = process.env.PORT || 3000;

createConnection().then(async () => {

    // create express app
    const app = express();

    // midlewares
    app.use(cors());
    app.use(helmet());

    app.use(express.json());


    // setup express app here
    // ...

    // start express server
    app.listen(PORT,() => console.log("Express server has started on port 3000. Open http://localhost:3000 to see results"))
    ;

}).catch(error => console.log(error));
