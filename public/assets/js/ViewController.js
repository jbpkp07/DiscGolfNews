"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
class ViewController {
    constructor() {
        this.saveBtns = $("div[data-type=save]");
        this.deleteBtns = $("div[data-type=delete]");
        this.notesBtns = $("div[data-type=notes]");
        this.notesDeleteBtns = $("span[data-type=noteDelete]");
        this.assignListeners();
    }
    assignListeners() {
        this.saveBtns.one("click", (event) => {
            this.saveArticle(event);
        });
        this.deleteBtns.one("click", (event) => {
            this.deleteArticle(event);
        });
        this.notesBtns.on("click", (event) => {
            this.showNotes(event);
        });
        this.notesDeleteBtns.on("click", (event) => {
            this.deleteNote(event);
        });
    }
    saveArticle(event) {
        const htmlData = event.target.dataset;
        const article = {
            title: htmlData.title,
            excerpt: htmlData.excerpt,
            link: htmlData.link,
            notes: []
        };
        const ajaxConfig = {
            type: "POST",
            data: article
        };
        $.ajax("/api/save", ajaxConfig)
            .then((response) => {
            if (response === "OK") {
                location.reload();
            }
            else {
                alert(response);
                location.reload();
            }
        })
            .fail((error) => {
            console.log(error);
        });
    }
    deleteArticle(event) {
        const htmlData = event.target.dataset;
        const articleId = htmlData.id;
        const ajaxConfig = {
            type: "DELETE"
        };
        $.ajax(`/api/delete/${articleId}`, ajaxConfig)
            .then((response) => {
            if (response === "OK") {
                location.reload();
            }
            else {
                alert(response);
                location.reload();
            }
        })
            .fail((error) => {
            console.log(error);
        });
    }
    showNotes(event) {
        const htmlData = event.target.dataset;
        const articleId = htmlData.id;
        const modalOptions = {
            fadeDuration: 250,
            fadeDelay: 0
        };
        const modalElement = $(`.modal[data-id=${articleId}]`);
        const notesContainerElement = $(`.notesContainer[data-id=${articleId}]`);
        const noteInputElement = $(`.noteInput[data-id=${articleId}]`);
        const saveNoteBtnElement = $(`.saveNote[data-id=${articleId}]`);
        // @ts-ignore
        modalElement.modal(modalOptions).promise().then(() => {
            noteInputElement.trigger("focus");
            saveNoteBtnElement.on("click", (evt) => {
                evt.preventDefault();
                const note = {
                    // @ts-ignore
                    note: noteInputElement.val().trim()
                };
                if (note.note.length !== 0) {
                    noteInputElement.val("");
                    this.saveNote(note, articleId).then((notes) => {
                        this.refreshNotesModal(notesContainerElement, notes);
                    });
                }
            });
        });
    }
    async saveNote(note, articleId) {
        return new Promise((resolve, _reject) => {
            const ajaxConfig = {
                type: "POST",
                data: note
            };
            $.ajax(`/api/savenote/${articleId}`, ajaxConfig)
                .then((notes) => {
                resolve(notes);
            })
                .fail((error) => {
                console.log(error);
                resolve();
            });
        });
    }
    deleteNote(event) {
        const htmlData = event.target.dataset;
        const noteId = htmlData.id;
        const notesContainerElement = $(`.noteDeleteBtn[data-id=${noteId}]`).parents(".notesContainer");
        const articleId = notesContainerElement.attr("data-id");
        let ajaxConfig = {
            type: "DELETE"
        };
        $.ajax(`/api/deletenote/${articleId}/${noteId}`, ajaxConfig)
            .then(() => {
            ajaxConfig = {
                type: "GET"
            };
            $.ajax(`/api/getnotes/${articleId}`, ajaxConfig)
                .then((notes) => {
                this.refreshNotesModal(notesContainerElement, notes);
            })
                .fail((error) => {
                console.log(error);
            });
        })
            .fail((error) => {
            console.log(error);
        });
    }
    refreshNotesModal(notesContainerElement, notes) {
        notesContainerElement.empty();
        for (const noteObj of notes) {
            const noteElement = $("<span>")
                .addClass("note")
                .attr("data-id", `${noteObj.idForClient}`)
                .text(noteObj.note);
            const noteDeleteElement = $("<span>")
                .addClass("btn noteDeleteBtn")
                .attr("data-type", "noteDelete")
                .attr("data-id", `${noteObj.idForClient}`)
                .text("X");
            const divWrapper = $("<div>").append(noteElement, noteDeleteElement);
            notesContainerElement.append(divWrapper);
        }
        this.resetNoteDeleteButtonListeners();
    }
    resetNoteDeleteButtonListeners() {
        this.notesDeleteBtns.off("click");
        this.notesDeleteBtns = $("span[data-type=noteDelete]");
        this.notesDeleteBtns.on("click", (event) => {
            this.deleteNote(event);
        });
    }
}
