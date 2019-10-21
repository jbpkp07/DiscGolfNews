import mongoose, { Model, Schema } from "mongoose";

const ArticleSchema: mongoose.Schema = new Schema({

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
        ref: "Note"
    }]
});

export const Articles: Model<mongoose.Document> = mongoose.model("Article", ArticleSchema);