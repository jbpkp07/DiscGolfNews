import mongoose, { Model } from "mongoose";

import { config } from "../config/config.js";
import { IArticle } from "../interfaces/IArticle";
import { IArticleDoc } from "../interfaces/IArticleDoc";
import { INote } from "../interfaces/INote";
import { INoteDoc } from "../interfaces/INoteDoc";

import { Articles } from "./models/Article.js";
import { Notes } from "./models/Note.js";


export class DgNewsDatabase {

    private readonly Articles: Model<IArticleDoc>;
    private readonly Notes: Model<INoteDoc>;
    private _unSavedArticles: IArticle[];

    public constructor() {

        this.Articles = Articles;
        this.Notes = Notes;
        this._unSavedArticles = [];
    }

    public get unSavedArticles(): IArticle[] {

        const unSavedArticlesCopy: IArticle[] = this._unSavedArticles.map((article: IArticle) => ({ ...article })); // deep copy of objects

        return unSavedArticlesCopy;
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

                .then((result: IArticleDoc | null) => {

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

    public async getAllArticles(): Promise<IArticleDoc[]> {

        return this.Articles.find().populate("notes").exec();
    }

    public async getNotesForArticle(articleId: string): Promise<INote[]> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ _id: articleId }).populate("notes").exec()

                .then((article: IArticleDoc | null) => {

                    if (article !== null) {

                        const notes: INote[] = [];

                        for (const noteDoc of article.notes) {

                            const note: INote = {

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

                }).catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async saveNewArticle(article: IArticle): Promise<IArticleDoc> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.isArticleInDatabase(article)

                .then(async (isInDatabase: boolean) => {

                    if (!isInDatabase) { // checks to make sure article is unique (validation is also done in the Articles Model)

                        return this.Articles.create(article);
                    }

                    return Promise.reject("DgNewsDatabase:saveNewArticle()   Article not added: Already in database.");
                })
                .then((newArticle: IArticleDoc): void => {

                    resolve(newArticle);
                })
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async saveNewNote(note: INote, articleId: string): Promise<IArticleDoc> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ _id: articleId }).exec()

                .then(async (article: IArticleDoc | null) => {

                    if (article !== null) {

                        return this.Notes.create(note);
                    }

                    return Promise.reject("DgNewsDatabase:saveNewNote()   Article not found: Unable to add note.");
                })
                .then(async (newNote: INoteDoc) => {

                    const options: object[] = [

                        { _id: articleId },
                        { $push: { notes: newNote._id } },
                        { new: true, useFindAndModify: false }
                    ];

                    // @ts-ignore  (Typescript doesn't like the spread operator "...")
                    return this.Articles.findOneAndUpdate(...options).exec();
                })
                .then((updatedArticle: IArticleDoc | null) => {

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

            let articleToDelete: IArticleDoc;

            this.Articles.findOne({ _id: articleId }).populate("notes").exec()

                .then(async (article: IArticleDoc | null) => {

                    if (article !== null) {

                        articleToDelete = article;

                        const promises: Promise<INoteDoc | null>[] = [];

                        articleToDelete.notes.forEach((noteObj: INoteDoc) => {

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
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async deleteAllArticles(): Promise<void> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.getAllArticles()

                .then(async (articles: IArticleDoc[]) => {

                    const promises: Promise<void>[] = [];

                    for (const article of articles) {

                        promises.push(this.deleteArticle(article._id));
                    }

                    return Promise.all(promises);
                })
                .then(() => {

                    resolve();
                })
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async deleteNote(noteId: string): Promise<INoteDoc | null> {

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

                    this._unSavedArticles = [];

                    for (let i: number = 0; i < isSaved.length; i++) {

                        if (!isSaved[i]) {

                            this._unSavedArticles.push(articles[i]);
                        }
                    }

                    resolve(this._unSavedArticles);
                })
                .catch((error: string) => {

                    reject(error);
                });
        });
    }

    public async refilterUnsavedArticles(): Promise<IArticle[]> {

        return this.filterForUnsavedArticles(this._unSavedArticles);
    }
}