import { default as express } from "express";
import exphbs from "express-handlebars";
import { terminal } from "terminal-kit";

import { config } from "./config/config.js";
import { Controller } from "./controller/Controller.js";
import { DgNewsDatabase } from "./db/DgNewsDatabase.js";
import { printHeader } from "./utility/printHeaderFunctions.js";

const dgNewsDatabase: DgNewsDatabase = new DgNewsDatabase();

const controller: Controller = new Controller(dgNewsDatabase);

const app: express.Application = express();

app.use(express.static(config.publicAssetsPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(controller.router);
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

printHeader();

dgNewsDatabase.connect().then(() => {

    app.listen(config.port, () => {
    
        terminal.white("  Webserver listening on port ► ").brightGreen(`${config.port}\n\n`);
    });

}).catch((error: string) => {

    terminal.red(error);
});