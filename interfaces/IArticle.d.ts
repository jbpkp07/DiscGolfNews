import { Schema } from "mongoose";

export interface IArticle {

    _id?: string,
    title: string;
    link: string;
    excerpt: string;
    notes: Array<Schema.Types.ObjectId>;
}