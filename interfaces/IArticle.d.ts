import { Schema } from "mongoose";

export interface IArticle {

    title: string;
    link: string;
    excerpt: string;
    notes: Array<Schema.Types.ObjectId>;
}