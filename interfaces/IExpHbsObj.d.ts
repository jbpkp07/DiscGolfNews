import { IArticle } from "./IArticle";

export interface IExpHbsObj {

    articles: IArticle[];
    showScrapeBtn: boolean;
    showViewSavedBtn: boolean;
    showClearBtn: boolean;
    showViewScrapedBtn: boolean;
}