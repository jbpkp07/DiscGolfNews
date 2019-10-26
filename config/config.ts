import path from "path";

import { IConfig } from "../interfaces/IConfig";

function getFullPath(relativePath: string): string {

    return path.join(__dirname, relativePath);
}

export const config: IConfig = {

    port: process.env.PORT || "3000",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost/discGolfNews",
    ultiWorldDgURL: "https://discgolf.ultiworld.com/category/news",
    ultiWorldDgContainerElement: "li.component-list__item.snippet-excerpt",
    ultiWorldDgHeadingElement: "h3.snippet-excerpt__heading > a",
    ultiWorldDgExcerptElement: "p.snippet-excerpt__excerpt.excerpt",
    publicAssetsPath: getFullPath("../public/assets"),
    maxLengthTitleExcerpt: 120
};