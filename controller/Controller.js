"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class Controller {
    constructor(dgNewsDatabase) {
        this.dgNewsDatabase = dgNewsDatabase;
        this.router = express_1.default.Router();
        this.assignRouteListeners();
    }
    assignRouteListeners() {
        this.getHomePage();
        // this.postAPIBurgers();
        // this.putAPIBurgers();
        // this.deleteAPIBurgers();
    }
    getHomePage() {
        this.router.get("/", (_request, response) => {
            const article = {
                title: "Article 123",
                excerpt: "Best article ever",
                link: "blah2.com",
                notes: []
            };
            const note1 = {
                note: "This is the first note"
            };
            const note2 = {
                note: "This is the second note"
            };
            this.dgNewsDatabase.addNewArticle(article).then((newArticle) => {
                this.dgNewsDatabase.addNewNote(note1, newArticle._id);
                this.dgNewsDatabase.addNewNote(note2, newArticle._id);
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                // this.dgNewsDatabase.deleteArticle("5dad7aa78ff38016d4663043").then(() => {
                this.dgNewsDatabase.getAllArticles().then((allArticles) => {
                    response.json(allArticles);
                }).catch((error) => {
                    console.log(error);
                    response.status(500).send(error);
                });
                // }).catch((error: string) => {
                //     response.status(500).send(error);
                // });
            });
            // const handleBarsOBJ: any = {};
            // response.render("index", handleBarsOBJ);
            // const handleBarsOBJ = {};
            // const burgersPromise = this.burgersDatabase.getAllBurgers();
            // burgersPromise.then((burgers) => {
            //     handleBarsOBJ.burgers = burgers;
            // });
            // const ingredientsPromise = this.burgersDatabase.getAllIngredients();
            // ingredientsPromise.then((ingredients) => {
            //     handleBarsOBJ.ingredients = ingredients;
            // });
            // Promise.all([burgersPromise, ingredientsPromise]).then(() => {
            //     response.render("index", handleBarsOBJ);
            // }).catch((error) => {
            //     response.status(500).send(error);
            // });
        });
    }
}
exports.Controller = Controller;
