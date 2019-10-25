"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_js_1 = require("../config/config.js");
const Article_js_1 = require("./models/Article.js");
const Note_js_1 = require("./models/Note.js");
class DgNewsDatabase {
    constructor() {
        this.Articles = Article_js_1.Articles;
        this.Notes = Note_js_1.Notes;
        this._scrapedArticles = [];
    }
    get scrapedArticles() {
        return this._scrapedArticles;
    }
    async connect() {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true // prevents deprecation warning
        };
        return mongoose_1.default.connect(config_js_1.config.MONGODB_URI, options);
    }
    async isArticleInDatabase(article) {
        return new Promise((resolve, reject) => {
            this.Articles.findOne({ link: article.link }).exec()
                .then((result) => {
                if (result !== null) {
                    resolve(true); // is in database
                }
                else {
                    resolve(false); // NOT in database
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
    async getAllArticles() {
        return this.Articles.find().populate("notes").exec();
    }
    async getNotesForArticle(articleId) {
        return new Promise((resolve, reject) => {
            this.Articles.findOne({ _id: articleId }).populate("notes").exec()
                .then((article) => {
                if (article !== null) {
                    const notes = [];
                    article.notes.forEach((noteObj) => notes.push(noteObj.note));
                    resolve(notes);
                }
                else {
                    reject("DgNewsDatabase:getNotesForArticle()   Article not found: Could not retrieve notes.");
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
    async saveNewArticle(article) {
        return new Promise((resolve, reject) => {
            this.isArticleInDatabase(article)
                .then(async (isInDatabase) => {
                if (!isInDatabase) { // checks to make sure article is unique (validation is also done in the Articles Model)
                    return Promise.resolve();
                }
                return Promise.reject("DgNewsDatabase:saveNewArticle()   Article not added: Already in database.");
            })
                .then(async () => {
                return this.Articles.create(article);
            })
                .then((newArticle) => {
                resolve(newArticle);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async saveNewNote(note, articleId) {
        return new Promise((resolve, reject) => {
            this.Articles.findOne({ _id: articleId }).exec()
                .then(async (article) => {
                if (article === null) {
                    return Promise.reject("DgNewsDatabase:saveNewNote()   Article not found: Unable to add note.");
                }
                return this.Notes.create(note);
            })
                .then(async (newNote) => {
                const options = [
                    { _id: articleId },
                    { $push: { notes: newNote._id } },
                    { new: true, useFindAndModify: false }
                ];
                // @ts-ignore
                return this.Articles.findOneAndUpdate(...options).exec();
            })
                .then((updatedArticle) => {
                if (updatedArticle !== null) {
                    resolve(updatedArticle);
                }
                else {
                    reject("DgNewsDatabase:saveNewNote()   Note added, but Article not updated successfully.");
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async deleteArticle(articleId) {
        return new Promise((resolve, reject) => {
            let articleToDelete;
            this.Articles.findOne({ _id: articleId }).exec()
                .then(async (article) => {
                if (article !== null) {
                    articleToDelete = article;
                    return Promise.resolve();
                }
                return Promise.reject("DgNewsDatabase:deleteArticle()   Article not found: Could not delete.");
            })
                .then(async () => {
                const promises = [];
                articleToDelete.notes.forEach((noteId) => {
                    promises.push(this.deleteNote(noteId));
                });
                return Promise.all(promises);
            })
                .then(async () => {
                return this.Articles.findByIdAndDelete(articleToDelete._id).exec();
            })
                .then(() => {
                resolve();
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async deleteNote(noteId) {
        return this.Notes.findByIdAndDelete(noteId).exec();
    }
    async filterForUnsavedArticles(articles) {
        return new Promise((resolve, reject) => {
            const promises = [];
            for (const article of articles) {
                promises.push(this.isArticleInDatabase(article));
            }
            Promise.all(promises)
                .then((isSaved) => {
                this._scrapedArticles = [];
                for (let i = 0; i < isSaved.length; i++) {
                    if (!isSaved[i]) {
                        this._scrapedArticles.push(articles[i]);
                    }
                }
                resolve(this._scrapedArticles);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
}
exports.DgNewsDatabase = DgNewsDatabase;
