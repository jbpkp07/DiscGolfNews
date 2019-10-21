import { Schema } from "mongoose";

export interface IArticle {

    title: string;
    excerpt: string;
    link: string;
    notes: Array<Schema.Types.ObjectId>;
}