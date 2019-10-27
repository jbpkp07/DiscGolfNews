"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const express_1 = __importDefault(require("express"));
const terminal_kit_1 = require("terminal-kit");
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
        this.router.route("/clear")
            .get(this.clearSavedArticles.bind(this));
        this.router.route("/api/scrape")
            .get(this.scrapeNews.bind(this));
        this.router.route("/api/save")
            .post(this.saveArticle.bind(this));
        this.router.route("/api/getnotes/:id")
            .get(this.getNotes.bind(this));
        this.router.route("/api/savenote/:id")
            .post(this.saveNote.bind(this));
        this.router.route("/api/delete/:id")
            .delete(this.deleteArticle.bind(this));
        this.router.route("/api/deletenote/:aid/:nid")
            .delete(this.deleteNote.bind(this));
    }
    homePage(_request, response) {
        const articles = this.dgNewsDatabase.unSavedArticles;
        for (const article of articles) {
            if (article.title.length > config_js_1.config.maxLengthTitleExcerpt) {
                article.title = `${article.title.substring(0, config_js_1.config.maxLengthTitleExcerpt - 3)}...`;
            }
            if (article.excerpt.length > config_js_1.config.maxLengthTitleExcerpt) {
                article.excerpt = `${article.excerpt.substring(0, config_js_1.config.maxLengthTitleExcerpt - 3)}...`;
            }
            article.showSaveBtn = true;
            article.showDeleteBtn = false;
            article.showNotesBtn = false;
        }
        const expHbsObj = {
            articles,
            showNoUnsavedArticles: (articles.length === 0),
            showNoSavedArticles: false,
            showScrapeBtn: true,
            showViewSavedBtn: true,
            showClearBtn: false,
            showViewScrapedBtn: false
        };
        response.render("index", expHbsObj);
    }
    savedPage(_request, response) {
        this.dgNewsDatabase.getAllArticles()
            .then((articles) => {
            for (const article of articles) {
                if (article.title.length > config_js_1.config.maxLengthTitleExcerpt) {
                    article.title = `${article.title.substring(0, config_js_1.config.maxLengthTitleExcerpt - 3)}...`;
                }
                if (article.excerpt.length > config_js_1.config.maxLengthTitleExcerpt) {
                    article.excerpt = `${article.excerpt.substring(0, config_js_1.config.maxLengthTitleExcerpt - 3)}...`;
                }
                article.showSaveBtn = false;
                article.showDeleteBtn = true;
                article.showNotesBtn = true;
            }
            const expHbsObj = {
                articles,
                showNoUnsavedArticles: false,
                showNoSavedArticles: (articles.length === 0),
                showScrapeBtn: false,
                showViewSavedBtn: false,
                showClearBtn: true,
                showViewScrapedBtn: true
            };
            response.render("index", expHbsObj);
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    clearSavedArticles(_request, response) {
        this.dgNewsDatabase.deleteAllArticles()
            .then(() => {
            response.redirect("/saved");
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    scrapeNews(_request, response) {
        axios_1.default.get(config_js_1.config.ultiWorldDgURL)
            .then(async (res) => {
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
            return this.dgNewsDatabase.filterForUnsavedArticles(articles);
        })
            .then(() => {
            response.redirect("/");
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    saveArticle(request, response) {
        const article = request.body;
        article.notes = []; // add empty notes array
        this.dgNewsDatabase.saveNewArticle(article)
            .then(async () => {
            return this.dgNewsDatabase.refilterUnsavedArticles();
        })
            .then(() => {
            response.sendStatus(200);
        }).catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    saveNote(request, response) {
        const note = request.body;
        const articleId = request.params.id;
        this.dgNewsDatabase.saveNewNote(note, articleId)
            .then(async () => {
            return this.dgNewsDatabase.getNotesForArticle(articleId);
        })
            .then((notes) => {
            response.json(notes);
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    getNotes(request, response) {
        const articleId = request.params.id;
        this.dgNewsDatabase.getNotesForArticle(articleId)
            .then((notes) => {
            response.json(notes);
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    deleteArticle(request, response) {
        const articleId = request.params.id;
        this.dgNewsDatabase.deleteArticle(articleId)
            .then(() => {
            response.sendStatus(200);
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
    deleteNote(request, response) {
        const articleId = request.params.aid;
        const noteId = request.params.nid;
        this.dgNewsDatabase.deleteNote(articleId, noteId)
            .then(() => {
            response.sendStatus(200);
        })
            .catch((error) => {
            terminal_kit_1.terminal.red(error);
            response.status(500).send(error);
        });
    }
}
exports.Controller = Controller;
