"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ArticleSchema = new mongoose_1.Schema({
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
        unique: true // only adds unique news articles
    },
    notes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Note"
        }]
});
exports.Articles = mongoose_1.default.model("Article", ArticleSchema);
