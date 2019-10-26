import { Document } from "mongoose";

import { INote } from "./INote";

export interface INoteDoc extends INote, Document { }