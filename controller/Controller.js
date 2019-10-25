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
        this.router.route("/")
            .get(this.homePage.bind(this));
        this.router.route("/saved")
            .get(this.savedPage.bind(this));
        this.router.route("/api/scrape")
            .get(this.scrapeNews.bind(this));
    }
    homePage(_request, response) {
        this.dgNewsDatabase.getAllArticles()
            .then((articles) => {
            for (const article of articles) {
                if (article.title.length > 100) {
                    article.title = `${article.title.substring(0, 120)}...`;
                }
                if (article.excerpt.length > 100) {
                    article.excerpt = `${article.excerpt.substring(0, 120)}...`;
                }
            }
            const expHbsObj = {
                articles,
                showScrapeBtn: true,
                showViewSavedBtn: true,
                showClearBtn: false,
                showViewScrapedBtn: false
            };
            response.render("index", expHbsObj);
        })
            .catch((error) => {
            response.status(500).send(error);
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
        // });
    }
    savedPage(_request, response) {
        // const expHbsObj: IExpHbsObj = {
        //     showScrapeBtn: false,
        //     showViewSavedBtn: false,
        //     showClearBtn: true,
        //     showViewScrapedBtn: true
        // };
        // response.render("index", expHbsObj);
    }
    scrapeNews(_request, response) {
        // this.router.get("/scrape", (_request: express.Request, response: express.Response) => {
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
            for (const art of articles) {
                this.dgNewsDatabase.saveNewArticle(art).then((_result) => {
                }).catch(() => { });
            }
            this.dgNewsDatabase.filterForUnsavedArticles(articles).then((filteredArticles) => {
                response.json(filteredArticles);
                // response.location("/");
                // response.redirect("/");
            });
        }).catch((error) => {
            response.status(500).send(error);
        });
        // });
    }
}
exports.Controller = Controller;
