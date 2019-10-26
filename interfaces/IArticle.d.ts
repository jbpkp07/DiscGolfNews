import { Schema } from "mongoose";

import { INoteDoc } from "./INoteDoc";

export interface IArticle {

    title: string;
    excerpt: string;
    link: string;
    notes: Array<INoteDoc>;
    showSaveBtn?: boolean;
    showDeleteBtn?: boolean;
    showNotesBtn?: boolean;
}