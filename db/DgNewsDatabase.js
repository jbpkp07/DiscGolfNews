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
        this._unSavedArticles = [];
    }
    get unSavedArticles() {
        const unSavedArticlesCopy = this._unSavedArticles.map((article) => (Object.assign({}, article))); // deep copy of objects
        return unSavedArticlesCopy;
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
                    for (const noteDoc of article.notes) {
                        const note = {
                            idForClient: noteDoc._id,
                            note: noteDoc.note
                        };
                        notes.push(note);
                    }
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
                    return this.Articles.create(article);
                }
                return Promise.reject("DgNewsDatabase:saveNewArticle()   Article not added: Already in database.");
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
                if (article !== null) {
                    return this.Notes.create(note);
                }
                return Promise.reject("DgNewsDatabase:saveNewNote()   Article not found: Unable to add note.");
            })
                .then(async (newNote) => {
                const options = [
                    { _id: articleId },
                    { $push: { notes: newNote._id } },
                    { new: true, useFindAndModify: false }
                ];
                // @ts-ignore  (Typescript doesn't like the spread operator "...")
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
            this.Articles.findOne({ _id: articleId }).populate("notes").exec()
                .then(async (article) => {
                if (article !== null) {
                    articleToDelete = article;
                    const promises = [];
                    articleToDelete.notes.forEach((noteObj) => {
                        promises.push(this.deleteNote(noteObj._id));
                    });
                    return Promise.all(promises);
                }
                return Promise.reject("DgNewsDatabase:deleteArticle()   Article not found: Could not delete.");
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
    async deleteAllArticles() {
        return new Promise((resolve, reject) => {
            this.getAllArticles()
                .then(async (articles) => {
                const promises = [];
                for (const article of articles) {
                    promises.push(this.deleteArticle(article._id));
                }
                return Promise.all(promises);
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
                this._unSavedArticles = [];
                for (let i = 0; i < isSaved.length; i++) {
                    if (!isSaved[i]) {
                        this._unSavedArticles.push(articles[i]);
                    }
                }
                resolve(this._unSavedArticles);
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async refilterUnsavedArticles() {
        return this.filterForUnsavedArticles(this._unSavedArticles);
    }
}
exports.DgNewsDatabase = DgNewsDatabase;
