import mongoose, { Model } from "mongoose";

import { config } from "../config/config.js";
import { IArticle } from "../interfaces/IArticle.js";
import { INote } from "../interfaces/INote.js";

import { Articles } from "./models/Article.js";
import { Notes } from "./models/Note.js";


export class DgNewsDatabase {

    private readonly Articles: Model<mongoose.Document>;
    private readonly Notes: Model<mongoose.Document>;
    private _scrapedArticles: IArticle[];

    public constructor() {

        this.Articles = Articles;
        this.Notes = Notes;
        this._scrapedArticles = [];
    }

    public get scrapedArticles(): IArticle[] {

        return this._scrapedArticles;
    }

    public async connect(): Promise<typeof mongoose> {

        const options: object = {

            useNewUrlParser: true,
            useUnifiedTopology: true,  // prevents deprecation warning
            useCreateIndex: true       // prevents deprecation warning
        };

        return mongoose.connect(config.MONGODB_URI, options);
    }

    public async isArticleInDatabase(article: IArticle): Promise<boolean> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ link: article.link }).exec()

                .then((result: mongoose.Document | null) => {

                    if (result !== null) {

                        resolve(true);  // is in database
                    }
                    else {

                        resolve(false); // NOT in database
                    }

                }).catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async getAllArticles(): Promise<mongoose.Document[]> {

        return this.Articles.find().populate("notes").exec();
    }

    public async getNotesForArticle(articleId: string): Promise<string[]> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ _id: articleId }).populate("notes").exec()

                .then((article: any): void => {

                    if (article !== null) {

                        const notes: string[] = [];

                        article.notes.forEach((noteObj: INote) => notes.push(noteObj.note));

                        resolve(notes);
                    }
                    else {

                        reject("DgNewsDatabase:getNotesForArticle()   Article not found: Could not retrieve notes.");
                    }

                }).catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async saveNewArticle(article: IArticle): Promise<mongoose.Document> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.isArticleInDatabase(article)

                .then(async (isInDatabase: boolean) => {

                    if (!isInDatabase) { // checks to make sure article is unique (validation is also done in the Articles Model)

                        return Promise.resolve();
                    }

                    return Promise.reject("DgNewsDatabase:saveNewArticle()   Article not added: Already in database.");
                })
                .then(async () => {

                    return this.Articles.create(article);
                })
                .then((newArticle: mongoose.Document): void => {

                    resolve(newArticle);
                })
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async saveNewNote(note: INote, articleId: string): Promise<mongoose.Document> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ _id: articleId }).exec()

                .then(async (article: mongoose.Document | null) => {

                    if (article === null) {

                        return Promise.reject("DgNewsDatabase:saveNewNote()   Article not found: Unable to add note.");
                    }

                    return this.Notes.create(note);
                })
                .then(async (newNote: mongoose.Document) => {

                    const options: object[] = [

                        { _id: articleId },
                        { $push: { notes: newNote._id } },
                        { new: true, useFindAndModify: false }
                    ];

                    // @ts-ignore
                    return this.Articles.findOneAndUpdate(...options).exec();
                })
                .then((updatedArticle: mongoose.Document | null) => {

                    if (updatedArticle !== null) {

                        resolve(updatedArticle);
                    }
                    else {

                        reject("DgNewsDatabase:saveNewNote()   Note added, but Article not updated successfully.");
                    }
                })
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async deleteArticle(articleId: string): Promise<void> {

        return new Promise((resolve: Function, reject: Function): void => {

            let articleToDelete: any;

            this.Articles.findOne({ _id: articleId }).exec()

                .then(async (article: mongoose.Document | null) => {

                    if (article !== null) {

                        articleToDelete = article;

                        return Promise.resolve();
                    }

                    return Promise.reject("DgNewsDatabase:deleteArticle()   Article not found: Could not delete.");
                })
                .then(async () => {

                    const promises: Promise<mongoose.Document | null>[] = [];

                    articleToDelete.notes.forEach((noteId: string) => {

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
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async deleteNote(noteId: string): Promise<mongoose.Document | null> {

        return this.Notes.findByIdAndDelete(noteId).exec();
    }

    public async filterForUnsavedArticles(articles: IArticle[]): Promise<IArticle[]> {

        return new Promise((resolve: Function, reject: Function): void => {

            const promises: Promise<boolean>[] = [];

            for (const article of articles) {

                promises.push(this.isArticleInDatabase(article));
            }

            Promise.all(promises)

                .then((isSaved: boolean[]): void => {

                    this._scrapedArticles = [];

                    for (let i: number = 0; i < isSaved.length; i++) {

                        if (!isSaved[i]) {

                            this._scrapedArticles.push(articles[i]);
                        }
                    }

                    resolve(this._scrapedArticles);
                })
                .catch((error: string) => {

                    reject(error);
                });
        });
    }
}