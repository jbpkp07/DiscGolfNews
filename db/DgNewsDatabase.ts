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

    public set scrapedArticles(articles: IArticle[]) {

        this._scrapedArticles = articles;
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
            
            this.Articles.findOne({ link: article.link }).exec().then((result: mongoose.Document | null) => {

                if (result === null) {

                    resolve(false); // NOT in database
                }
                else {

                    resolve(true); // is in database
                }

            }).catch((error: string) => {

                reject(error);
            });
        });
    }

    public async getAllArticles(): Promise<mongoose.Document[]> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.find().populate("notes").exec().then((articles: mongoose.Document[]): void => {

                resolve(articles);

            }).catch((error: string) => {

                reject(error);
            });
        });
    }

    public async getNotesForArticle(articleId: string): Promise<mongoose.Document[]> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ _id: articleId }).populate("notes").exec().then((article: any): void => {

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

            this.isArticleInDatabase(article).then((isInDatabase: boolean) => {

                if (!isInDatabase) { // checks to make sure article is unique (validation is also done in the Articles Model)

                    this.Articles.create(article).then((newArticle: mongoose.Document): void => {

                        resolve(newArticle);

                    }).catch((error: string) => {

                        reject(error);
                    });
                }
                else {

                    reject("DgNewsDatabase:saveNewArticle()   Article not added: Already in database.");
                }

            }).catch((error: string) => {

                reject(error);
            });
        });
    }

    public async saveNewNote(note: INote, articleId: string): Promise<mongoose.Document> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Notes.create(note).then((newNote: mongoose.Document): void => {

                const options: object[] = [

                    { _id: articleId },
                    { $push: { notes: newNote._id } },
                    { new: true, useFindAndModify: false }
                ];

                this.Articles.findOneAndUpdate(options[0], options[1], options[2]).exec().then((updatedArticle: mongoose.Document | null) => {

                    resolve(updatedArticle);

                }).catch((error: string) => {

                    reject(error);
                });

            }).catch((error: string) => {

                reject(error);
            });
        });
    }

    public async deleteArticle(articleId: string): Promise<void> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Articles.findOne({ _id: articleId }).exec().then((article: any) => {

                if (article !== null) {

                    const promises: Promise<void>[] = [];

                    article.notes.forEach((noteId: string) => {

                        promises.push(this.deleteNote(noteId));
                    });

                    Promise.all(promises).then(() => {

                        this.Articles.findByIdAndDelete(article._id).exec().then(() => {

                            resolve();

                        }).catch((error: string) => {

                            reject(error);
                        });
                    });
                }
                else {

                    reject("DgNewsDatabase:deleteArticle()   Article not found: Could not delete.");
                }

            }).catch((error: string) => {

                reject(error);
            });
        });
    }

    public async deleteNote(noteId: string): Promise<void> {

        return new Promise((resolve: Function, reject: Function): void => {

            this.Notes.findByIdAndDelete(noteId).exec().then(() => {

                resolve();

            }).catch((error: string) => {

                reject(error);
            });
        });
    }

    public async filterForUnsavedArticles(articles: IArticle[]): Promise<IArticle[]> {

        return new Promise((resolve: Function, reject: Function): void => {
      
            const filteredArticles: IArticle[] = [];
            const promises: Promise<boolean>[] = [];

            for (const article of articles) {

                promises.push(this.isArticleInDatabase(article));
            }

            Promise.all(promises).then((isSaved: boolean[]): void => {
                
                for (let i: number = 0; i < isSaved.length; i++) {

                    if (!isSaved[i]) {

                        filteredArticles.push(articles[i]);
                    }
                }

                resolve(filteredArticles);

            }).catch((error: string) => {
                
                reject(error);
            });
        });
    }
}