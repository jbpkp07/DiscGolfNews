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
    }
    async connect() {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        };
        return mongoose_1.default.connect(config_js_1.config.MONGODB_URI, options);
    }
    async getAllArticles() {
        return new Promise((resolve, reject) => {
            this.Articles.find().populate("notes").exec().then((articles) => {
                resolve(articles);
            }).catch((error) => {
                reject(error);
            });
        });
    }
    async addNewArticle(article) {
        return new Promise((resolve, reject) => {
            this.Articles.findOne({ link: article.link }).exec().then((result) => {
                if (result === null) { // checks to make sure article is unique (validation is also done in the Articles Model)
                    this.Articles.create(article).then((newArticle) => {
                        resolve(newArticle);
                    }).catch((error) => {
                        reject(error);
                    });
                }
                else {
                    reject("Article not added: Already in database.");
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
    async addNewNote(note, articleId) {
        return new Promise((resolve, reject) => {
            this.Notes.create(note).then((newNote) => {
                const options = [
                    { _id: articleId },
                    { $push: { notes: newNote._id } },
                    { new: true, useFindAndModify: false }
                ];
                this.Articles.findOneAndUpdate(options[0], options[1], options[2]).exec().then((updatedArticle) => {
                    resolve(updatedArticle);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }
    async deleteArticle(articleId) {
        return new Promise((resolve, reject) => {
            this.Articles.findOne({ _id: articleId }).exec().then((article) => {
                if (article !== null) {
                    const promises = [];
                    article.notes.forEach((noteId) => {
                        promises.push(this.deleteNote(noteId));
                    });
                    Promise.all(promises).then(() => {
                        this.Articles.findByIdAndDelete(article._id).exec().then(() => {
                            resolve();
                        }).catch((error) => {
                            reject(error);
                        });
                    });
                }
                else {
                    reject("Article not found: Could not delete.");
                }
            }).catch((error) => {
                reject(error);
            });
        });
    }
    async deleteNote(noteId) {
        return new Promise((resolve, reject) => {
            this.Notes.findByIdAndDelete(noteId).exec().then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        });
    }
}
exports.DgNewsDatabase = DgNewsDatabase;
