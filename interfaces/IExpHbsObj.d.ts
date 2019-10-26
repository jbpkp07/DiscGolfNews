import { IArticle } from "./IArticle";

export interface IExpHbsObj {

    articles: IArticle[];
    showNoUnsavedArticles: boolean;
    showNoSavedArticles: boolean;
    showScrapeBtn: boolean;
    showViewSavedBtn: boolean;
    showClearBtn: boolean;
    showViewScrapedBtn: boolean;
}