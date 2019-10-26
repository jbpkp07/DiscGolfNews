import mongoose, { Model, Schema } from "mongoose";

import { INoteDoc } from "../../interfaces/INoteDoc";

const NoteSchema: Schema = new Schema({

    note: {
        type: String,
        required: true
    }
});

export const Notes: Model<INoteDoc> = mongoose.model("Note", NoteSchema);