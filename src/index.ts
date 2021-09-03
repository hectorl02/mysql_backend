import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import routes from "./routes";
routes;
const PORT = process.env.PORT || 3000;
import { createAdmin } from "./libs/initialSetup";

createConnection()
  .then(async () => {
    // create express app
    const app = express();
    createAdmin();

    // midlewares
    app.use(cors());
    app.use(helmet());

    app.use(express.json());

    // Routes
    //
    app.use("/", routes);

    // start express server
    app.listen(PORT, () =>
      console.log(
        "Express server has started on port 3000. Open http://localhost:3000 to see results"
      )
    );
  })
  .catch((error) => console.log(error));
