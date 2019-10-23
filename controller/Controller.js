"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const express_1 = __importDefault(require("express"));
// import { terminal } from "terminal-kit";
const config_js_1 = require("../config/config.js");
class Controller {
    constructor(dgNewsDatabase) {
        this.dgNewsDatabase = dgNewsDatabase;
        this.router = express_1.default.Router();
        this.assignRouteListeners();
    }
    assignRouteListeners() {
        this.getHomePage();
        this.apiScrapeNews();
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
            this.dgNewsDatabase.saveNewArticle(article).then(async (newArticle) => {
                await this.dgNewsDatabase.saveNewNote(note1, newArticle._id);
                await this.dgNewsDatabase.saveNewNote(note2, newArticle._id);
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
    apiScrapeNews() {
        this.router.get("/scrape", (_request, response) => {
            axios_1.default.get(config_js_1.config.ultiWorldDgURL).then((res) => {
                const $ = cheerio_1.default.load(res.data);
                const articles = [];
                $(config_js_1.config.ultiWorldDgContainerElement).each((_i, element) => {
                    const heading = $(element).find(config_js_1.config.ultiWorldDgHeadingElement);
                    const excerpt = $(element).find(config_js_1.config.ultiWorldDgExcerptElement);
                    const article = {
                        title: heading.text().trim(),
                        link: heading.attr("href").trim(),
                        excerpt: excerpt.text().trim(),
                        notes: []
                    };
                    articles.push(article);
                });
                // for (const art of articles) {
                //     this.dgNewsDatabase.saveNewArticle(art).then((result) => {
                //     }).catch(() => {});
                // }
                this.dgNewsDatabase.filterForUnsavedArticles(articles).then((filteredArticles) => {
                    response.json(filteredArticles);
                });
            }).catch((error) => {
                response.status(500).send(error);
            });
        });
    }
}
exports.Controller = Controller;
