import mongoose, { Model, Schema } from "mongoose";

const NoteSchema: mongoose.Schema = new Schema({

    note: {
        type: String,
        required: true
    }
});

export const Notes: Model<mongoose.Document> = mongoose.model("Note", NoteSchema);