import { AxiosResponse, default as axios } from "axios";
import cheerio from "cheerio";
import { default as express } from "express";
import mongoose from "mongoose";
// import { terminal } from "terminal-kit";

import { config } from "../config/config.js";
import { DgNewsDatabase } from "../db/DgNewsDatabase";
import { IArticle } from "../interfaces/IArticle";
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

        this.getHomePage();

        this.apiScrapeNews();

        // this.postAPIBurgers();

        // this.putAPIBurgers();

        // this.deleteAPIBurgers();
    }

    private getHomePage(): void {

        this.router.get("/", (_request: express.Request, response: express.Response) => {

            const article: IArticle = {

                title: "Article 123",
                excerpt: "Best article ever",
                link: "blah2.com",
                notes: []
            };

            const note1: INote = {

                note: "This is the first note"
            };

            const note2: INote = {

                note: "This is the second note"
            };

            this.dgNewsDatabase.saveNewArticle(article).then(async (newArticle: mongoose.Document) => {


                await this.dgNewsDatabase.saveNewNote(note1, newArticle._id);

                await this.dgNewsDatabase.saveNewNote(note2, newArticle._id);


            }).catch((error: string) => {

                console.log(error);

            }).finally(() => {

                // this.dgNewsDatabase.deleteArticle("5dad7aa78ff38016d4663043").then(() => {


                this.dgNewsDatabase.getAllArticles().then((allArticles: mongoose.Document[]) => {

                    response.json(allArticles);

                }).catch((error: string) => {
                    console.log(error);
                    response.status(500).send(error);
                });


                // }).catch((error: string) => {
                //     response.status(500).send(error);
                // });




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
        });
    }

    private apiScrapeNews(): void {

        this.router.get("/scrape", (_request: express.Request, response: express.Response) => {

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

                    this.dgNewsDatabase.saveNewArticle(art).then((result) => {
                        
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
        });
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