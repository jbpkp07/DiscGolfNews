import { terminal } from "terminal-kit";

const xCoord: number = 1;
const yCoord: number = 15;

export function printHeader(): void {

    terminal.reset();
    terminal.clear();
    terminal("\n");
    terminal.brightBlue(" ┌─────────────────────────────────────────────────────────────────────────────┐\n");
    terminal.brightBlue(" │").brightCyan("                               Disc Golf News                                ").brightBlue("│\n");
    terminal.brightBlue(" │").brightCyan("                                    v1.0                                     ").brightBlue("│\n");
    terminal.brightBlue(" │").brightCyan("                          written by: Jeremy Barnes                          ").brightBlue("│\n");
    terminal.brightBlue(" ├─────────────────────────────────────────────────────────────────────────────┤\n");
    terminal.brightBlue(" │").brightCyan(" Usage       : ").brightWhite("node server.js").gray(" or ").brightWhite("npm start").gray(" will start this webserver.").brightBlue("        │\n");
    terminal.brightBlue(" │                                                                             │\n");
    terminal.brightBlue(" │").brightCyan(" Description : ").gray("Welcome to Disc Golf News, a Node.js / Express.js webapp!").brightBlue("     │\n");
    terminal.brightBlue(" │").gray("               This screen means the webserver is running...").brightBlue("                 │\n");
    terminal.brightBlue(" │                                                                             │\n");
    terminal.brightBlue(" │").brightCyan(" To Exit     : ").gray("Pressing ").brightWhite("[CTRL + C]").gray(" will stop this webserver and exit.").brightBlue("        │\n");
    terminal.brightBlue(" └─────────────────────────────────────────────────────────────────────────────┘");
    terminal("\n\n");
}

export function moveCursorToTop(): void {

    terminal.moveTo(xCoord, yCoord);
}

export function clearScreenBelowHeader(): void {

    moveCursorToTop();

    terminal.eraseDisplayBelow();
}