"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const terminal_kit_1 = require("terminal-kit");
const config_js_1 = require("./config/config.js");
const Controller_js_1 = require("./controller/Controller.js");
const DgNewsDatabase_js_1 = require("./db/DgNewsDatabase.js");
const dgNewsDatabase = new DgNewsDatabase_js_1.DgNewsDatabase();
const controller = new Controller_js_1.Controller(dgNewsDatabase);
const app = express_1.default();
app.use(express_1.default.static(config_js_1.config.publicAssetsPath));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(controller.router);
app.engine("handlebars", express_handlebars_1.default({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
dgNewsDatabase.connect().then(() => {
    // printHeader();
    app.listen(config_js_1.config.port, () => {
        terminal_kit_1.terminal.white("  Webserver listening on port ► ").brightGreen(`${config_js_1.config.port}\n\n`);
    });
}).catch((error) => {
    terminal_kit_1.terminal.red(error);
});
