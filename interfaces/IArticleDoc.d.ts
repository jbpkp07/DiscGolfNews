import { Document } from "mongoose";

import { IArticle } from "./IArticle";

export interface IArticleDoc extends IArticle, Document { }