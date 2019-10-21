import path from "path";

import { IConfig } from "../interfaces/IConfig";

function getFullPath(relativePath: string): string {

    return path.join(__dirname, relativePath);
}

export const config: IConfig = {

    port: process.env.PORT || "3000",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost/discGolfNews",
    publicAssetsPath: getFullPath("../public/assets")
};