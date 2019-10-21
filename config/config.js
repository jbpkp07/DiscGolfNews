"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
function getFullPath(relativePath) {
    return path_1.default.join(__dirname, relativePath);
}
exports.config = {
    port: process.env.PORT || "3000",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost/discGolfNews",
    publicAssetsPath: getFullPath("../public/assets")
};
