"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terminal_kit_1 = require("terminal-kit");
const xCoord = 1;
const yCoord = 15;
function printHeader() {
    terminal_kit_1.terminal.reset();
    terminal_kit_1.terminal.clear();
    terminal_kit_1.terminal("\n");
    terminal_kit_1.terminal.brightBlue(" ┌─────────────────────────────────────────────────────────────────────────────┐\n");
    terminal_kit_1.terminal.brightBlue(" │").brightCyan("                               Disc Golf News                                ").brightBlue("│\n");
    terminal_kit_1.terminal.brightBlue(" │").brightCyan("                                    v1.0                                     ").brightBlue("│\n");
    terminal_kit_1.terminal.brightBlue(" │").brightCyan("                          written by: Jeremy Barnes                          ").brightBlue("│\n");
    terminal_kit_1.terminal.brightBlue(" ├─────────────────────────────────────────────────────────────────────────────┤\n");
    terminal_kit_1.terminal.brightBlue(" │").brightCyan(" Usage       : ").brightWhite("node server.js").gray(" or ").brightWhite("npm start").gray(" will start this webserver.").brightBlue("        │\n");
    terminal_kit_1.terminal.brightBlue(" │                                                                             │\n");
    terminal_kit_1.terminal.brightBlue(" │").brightCyan(" Description : ").gray("Welcome to Disc Golf News, a Node.js / Express.js webapp!").brightBlue("     │\n");
    terminal_kit_1.terminal.brightBlue(" │").gray("               This screen means the webserver is running...").brightBlue("                 │\n");
    terminal_kit_1.terminal.brightBlue(" │                                                                             │\n");
    terminal_kit_1.terminal.brightBlue(" │").brightCyan(" To Exit     : ").gray("Pressing ").brightWhite("[CTRL + C]").gray(" will stop this webserver and exit.").brightBlue("        │\n");
    terminal_kit_1.terminal.brightBlue(" └─────────────────────────────────────────────────────────────────────────────┘");
    terminal_kit_1.terminal("\n\n");
}
exports.printHeader = printHeader;
function moveCursorToTop() {
    terminal_kit_1.terminal.moveTo(xCoord, yCoord);
}
exports.moveCursorToTop = moveCursorToTop;
function clearScreenBelowHeader() {
    moveCursorToTop();
    terminal_kit_1.terminal.eraseDisplayBelow();
}
exports.clearScreenBelowHeader = clearScreenBelowHeader;
