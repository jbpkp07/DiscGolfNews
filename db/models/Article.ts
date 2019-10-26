import mongoose, { Model, Schema } from "mongoose";

import { IArticleDoc } from "../../interfaces/IArticleDoc";

const ArticleSchema: Schema = new Schema({

    title: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true     // only adds unique news articles
    },
    notes: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Note"
    }]
});

export const Articles: Model<IArticleDoc> = mongoose.model("Article", ArticleSchema);
