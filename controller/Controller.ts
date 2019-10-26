import { AxiosResponse, default as axios } from "axios";
import cheerio from "cheerio";
import { default as express } from "express";
import { terminal } from "terminal-kit";

import { config } from "../config/config.js";
import { DgNewsDatabase } from "../db/DgNewsDatabase";
import { IArticle } from "../interfaces/IArticle";
import { IArticleDoc } from "../interfaces/IArticleDoc";
import { IExpHbsObj } from "../interfaces/IExpHbsObj";
import { INote } from "../interfaces/INote";


export class Controller {

    public router: express.Router;

    private readonly dgNewsDatabase: DgNewsDatabase;

    public constructor(dgNewsDatabase: DgNewsDatabase) {

        this.dgNewsDatabase = dgNewsDatabase;

        this.router = express.Router();

        this.assignRouteListeners();
    }

    private assignRouteListeners(): void {

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

        this.router.route("/api/deletenote/:id")
            .delete(this.deleteNote.bind(this));
    }

    private homePage(_request: express.Request, response: express.Response): void {

        const articles: IArticle[] = this.dgNewsDatabase.unSavedArticles;

        for (const article of articles) {

            if (article.title.length > config.maxLengthTitleExcerpt) {

                article.title = `${article.title.substring(0, config.maxLengthTitleExcerpt - 3)}...`;
            }

            if (article.excerpt.length > config.maxLengthTitleExcerpt) {

                article.excerpt = `${article.excerpt.substring(0, config.maxLengthTitleExcerpt - 3)}...`;
            }

            article.showSaveBtn = true;
            article.showDeleteBtn = false;
            article.showNotesBtn = false;
        }

        const expHbsObj: IExpHbsObj = {

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

    private savedPage(_request: express.Request, response: express.Response): void {

        this.dgNewsDatabase.getAllArticles()

            .then((articles: IArticleDoc[]) => {

                for (const article of articles) {

                    if (article.title.length > config.maxLengthTitleExcerpt) {

                        article.title = `${article.title.substring(0, config.maxLengthTitleExcerpt - 3)}...`;
                    }

                    if (article.excerpt.length > config.maxLengthTitleExcerpt) {

                        article.excerpt = `${article.excerpt.substring(0, config.maxLengthTitleExcerpt - 3)}...`;
                    }

                    article.showSaveBtn = false;
                    article.showDeleteBtn = true;
                    article.showNotesBtn = true;
                }

                const expHbsObj: IExpHbsObj = {

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
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private clearSavedArticles(_request: express.Request, response: express.Response): void {

        this.dgNewsDatabase.deleteAllArticles()

            .then(() => {

                response.redirect("/saved");
            })
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private scrapeNews(_request: express.Request, response: express.Response): void {

        axios.get(config.ultiWorldDgURL)

            .then(async (res: AxiosResponse) => {

                const $: CheerioStatic = cheerio.load(res.data);

                const articles: IArticle[] = [];

                $(config.ultiWorldDgContainerElement).each((_i: number, element: CheerioElement) => {

                    const heading: Cheerio = $(element).find(config.ultiWorldDgHeadingElement);
                    const excerpt: Cheerio = $(element).find(config.ultiWorldDgExcerptElement);

                    const article: IArticle = {

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
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private saveArticle(request: express.Request, response: express.Response): void {

        const article: IArticle = request.body;

        article.notes = []; // add empty notes array

        this.dgNewsDatabase.saveNewArticle(article)

            .then(async () => {

                return this.dgNewsDatabase.refilterUnsavedArticles();
            })
            .then(() => {

                response.sendStatus(200);

            }).catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private saveNote(request: express.Request, response: express.Response): void {

        const note: INote = request.body;

        const articleId: string = request.params.id;

        this.dgNewsDatabase.saveNewNote(note, articleId)

            .then(async () => {

                return this.dgNewsDatabase.getNotesForArticle(articleId);
            })
            .then((notes: INote[]) => {

                response.json(notes);
            })
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private getNotes(request: express.Request, response: express.Response): void {

        const articleId: string = request.params.id;

        this.dgNewsDatabase.getNotesForArticle(articleId)

            .then((notes: INote[]) => {

                response.json(notes);
            })
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private deleteArticle(request: express.Request, response: express.Response): void {

        const articleId: string = request.params.id;

        this.dgNewsDatabase.deleteArticle(articleId)

            .then(() => {

                response.sendStatus(200);
            })
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }

    private deleteNote(request: express.Request, response: express.Response): void {

        const noteId: string = request.params.id;

        this.dgNewsDatabase.deleteNote(noteId)

            .then(() => {

                response.sendStatus(200);
            })
            .catch((error: string) => {

                terminal.red(error);
                response.status(500).send(error);
            });
    }
}