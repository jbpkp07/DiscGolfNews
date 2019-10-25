import { AxiosResponse, default as axios } from "axios";
import cheerio from "cheerio";
import { default as express } from "express";
import mongoose from "mongoose";
// import { terminal } from "terminal-kit";

import { config } from "../config/config.js";
import { DgNewsDatabase } from "../db/DgNewsDatabase";
import { IArticle } from "../interfaces/IArticle";
import { IExpHbsObj } from "../interfaces/IExpHbsObj.js";

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

        this.router.route("/api/scrape")
            .get(this.scrapeNews.bind(this));
    }

    private homePage(_request: express.Request, response: express.Response): void {

        this.dgNewsDatabase.getAllArticles()

            .then((articles: any) => {

                for (const article of articles) {

                    if (article.title.length > 100) {

                        article.title = `${article.title.substring(0, 120)}...`;
                    }

                    if (article.excerpt.length > 100) {

                        article.excerpt = `${article.excerpt.substring(0, 120)}...`;
                    }
                }

                const expHbsObj: IExpHbsObj = {

                    articles,
                    showScrapeBtn: true,
                    showViewSavedBtn: true,
                    showClearBtn: false,
                    showViewScrapedBtn: false
                };
        
                response.render("index", expHbsObj);
            })
            .catch((error: string) => {

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

    private savedPage(_request: express.Request, response: express.Response): void {

        // const expHbsObj: IExpHbsObj = {

        //     showScrapeBtn: false,
        //     showViewSavedBtn: false,
        //     showClearBtn: true,
        //     showViewScrapedBtn: true
        // };

        // response.render("index", expHbsObj);
    }

    private scrapeNews(_request: express.Request, response: express.Response): void {

        // this.router.get("/scrape", (_request: express.Request, response: express.Response) => {

        axios.get(config.ultiWorldDgURL).then((res: AxiosResponse) => {

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

            for (const art of articles) {

                this.dgNewsDatabase.saveNewArticle(art).then((_result) => {

                }).catch(() => {});
            }

            this.dgNewsDatabase.filterForUnsavedArticles(articles).then((filteredArticles: IArticle[]) => {

                response.json(filteredArticles);
                // response.location("/");
                // response.redirect("/");
            });

        }).catch((error: string) => {

            response.status(500).send(error);
        });
        // });
    }

    // postAPIBurgers() {

    //     this.router.post("/api/burgers", (request, response) => {

    //         const { name } = request.body;
    //         let { ingredientIDs } = request.body;

    //         ingredientIDs = JSON.parse(ingredientIDs);  //JSON.stringify (client) then JSON.parse (server) allows empty arrays to be used for POST 

    //         if (this.validatePost(name, ingredientIDs)) {

    //             this.burgersDatabase.addNewBurger(name, ingredientIDs).then((result) => {

    //                 response.json(result);

    //             }).catch((error) => {

    //                 terminal.red(`  Unable to save new burger:\n${error}`);

    //                 response.status(500).send(error);
    //             });
    //         }
    //         else {

    //             terminal.red(`  Invalid POST data:\n`);
    //             console.log(name);
    //             console.log(ingredientIDs);

    //             response.status(422).send(`Invalid POST data:\n${name}\n${ingredientIDs}`);  //Unprocessable Entity (bad request data) 
    //         }
    //     });
    // }

    // putAPIBurgers() {

    //     this.router.put("/api/burgers", (request, response) => {

    //         const burgerToUpdate = request.body;

    //         this.burgersDatabase.updateBurger(burgerToUpdate).then(() => {

    //             response.status(200).end();

    //         }).catch((error) => {

    //             terminal.red(`  Unable to update burger:\n${error}`);

    //             response.status(500).send(error);
    //         });
    //     });
    // }

    // deleteAPIBurgers() {

    //     this.router.delete("/api/burgers/:id", (request, response) => {

    //         const id = request.params.id;

    //         this.burgersDatabase.deleteBurger(id).then(() => {

    //             response.status(200).end();

    //         }).catch((error) => {

    //             terminal.red(`  Unable to delete burger:\n${error}`);

    //             response.status(500).send(error);
    //         });
    //     });
    // }

    // validatePost(name, ingredientIDs) {

    //     if (typeof name !== "string" || name.length === 0) {

    //         return false;
    //     }

    //     if (name.length > 30) {

    //         return false;
    //     }

    //     if (!Array.isArray(ingredientIDs)) {

    //         return false;
    //     }

    //     for (const id of ingredientIDs) {

    //         if (typeof id !== "number" || id <= 0) {

    //             return false;
    //         }
    //     }

    //     return true;
    // }
}