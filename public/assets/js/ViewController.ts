import { IArticle } from "../../../interfaces/IArticle";
import { INote } from "../../../interfaces/INote";

// @ts-ignore
class ViewController {

    private readonly saveBtns: JQuery = $("div[data-type=save]");

    private readonly deleteBtns: JQuery = $("div[data-type=delete]");

    private readonly notesBtns: JQuery = $("div[data-type=notes]");

    private notesDeleteBtns: JQuery = $("span[data-type=noteDelete]");

    public constructor() {

        this.assignListeners();
    }

    private assignListeners(): void {

        this.saveBtns.one("click", (event: JQuery.ClickEvent) => {

            this.saveArticle(event);
        });

        this.deleteBtns.one("click", (event: JQuery.ClickEvent) => {

            this.deleteArticle(event);
        });

        this.notesBtns.on("click", (event: JQuery.ClickEvent) => {

            this.showNotes(event);
        });

        this.notesDeleteBtns.on("click", (event: JQuery.ClickEvent) => {

            this.deleteNote(event);
        });
    }

    private saveArticle(event: JQuery.ClickEvent): void {

        const htmlData: any = event.target.dataset;

        const article: IArticle = {

            title: htmlData.title,
            excerpt: htmlData.excerpt,
            link: htmlData.link,
            notes: []
        };

        const ajaxConfig: object = {

            type: "POST",
            data: article
        };

        $.ajax("/api/save", ajaxConfig)

            .then((response: any) => {

                if (response === "OK") {

                    location.reload();
                }
                else {

                    alert(response);

                    location.reload();
                }
            })
            .fail((error: string) => {

                console.log(error);
            });
    }

    private deleteArticle(event: JQuery.ClickEvent): void {

        const htmlData: any = event.target.dataset;

        const articleId: string = htmlData.id;

        const ajaxConfig: object = {

            type: "DELETE"
        };

        $.ajax(`/api/delete/${articleId}`, ajaxConfig)

            .then((response: any) => {

                if (response === "OK") {

                    location.reload();
                }
                else {

                    alert(response);

                    location.reload();
                }
            })
            .fail((error: string) => {

                console.log(error);
            });
    }

    private showNotes(event: JQuery.ClickEvent): void {

        const htmlData: any = event.target.dataset;

        const articleId: string = htmlData.id;

        const modalOptions: object = {

            fadeDuration: 250,
            fadeDelay: 0
        };

        const modalElement: JQuery = $(`.modal[data-id=${articleId}]`);
        const notesContainerElement: JQuery = $(`.notesContainer[data-id=${articleId}]`);
        const noteInputElement: JQuery = $(`.noteInput[data-id=${articleId}]`);
        const saveNoteBtnElement: JQuery = $(`.saveNote[data-id=${articleId}]`);

        // @ts-ignore
        modalElement.modal(modalOptions).promise().then(() => {

            noteInputElement.trigger("focus");

            saveNoteBtnElement.on("click", (evt: JQuery.ClickEvent) => {

                evt.preventDefault();

                const note: INote = {
                    // @ts-ignore
                    note: noteInputElement.val().trim()
                };

                if (note.note.length !== 0) {

                    noteInputElement.val("");

                    this.saveNote(note, articleId).then((notes: INote[]) => {

                        this.refreshNotesModal(notesContainerElement, notes);
                    });
                }
            });
        });
    }

    private async saveNote(note: INote, articleId: string): Promise<INote[]> {

        return new Promise((resolve: Function, _reject: Function): void => {

            const ajaxConfig: object = {

                type: "POST",
                data: note
            };

            $.ajax(`/api/savenote/${articleId}`, ajaxConfig)

                .then((notes: INote[]) => {

                    resolve(notes);
                })
                .fail((error: string) => {

                    console.log(error);

                    resolve();
                });
        });
    }

    private deleteNote(event: JQuery.ClickEvent): void {

        const htmlData: any = event.target.dataset;

        const noteId: string = htmlData.id;

        const notesContainerElement: JQuery = $(`.noteDeleteBtn[data-id=${noteId}]`).parents(".notesContainer");

        const articleId: any = notesContainerElement.attr("data-id");

        let ajaxConfig: object = {

            type: "DELETE"
        };

        $.ajax(`/api/deletenote/${articleId}/${noteId}`, ajaxConfig)

            .then(() => {

                ajaxConfig = {

                    type: "GET"
                };

                $.ajax(`/api/getnotes/${articleId}`, ajaxConfig)

                    .then((notes: INote[]) => {

                        this.refreshNotesModal(notesContainerElement, notes);
                    })
                    .fail((error: string) => {

                        console.log(error);
                    });
            })
            .fail((error: string) => {

                console.log(error);
            });
    }

    private refreshNotesModal(notesContainerElement: JQuery, notes: INote[]): void {

        notesContainerElement.empty();

        for (const noteObj of notes) {

            const noteElement: JQuery = $("<span>")
                .addClass("note")
                .attr("data-id", `${noteObj.idForClient}`)
                .text(noteObj.note);

            const noteDeleteElement: JQuery = $("<span>")
                .addClass("btn noteDeleteBtn")
                .attr("data-type", "noteDelete")
                .attr("data-id", `${noteObj.idForClient}`)
                .text("X");

            const divWrapper: JQuery = $("<div>").append(noteElement, noteDeleteElement);

            notesContainerElement.append(divWrapper);
        }

        this.resetNoteDeleteButtonListeners();
    }

    private resetNoteDeleteButtonListeners(): void {

        this.notesDeleteBtns.off("click");

        this.notesDeleteBtns = $("span[data-type=noteDelete]");

        this.notesDeleteBtns.on("click", (event: JQuery.ClickEvent) => {

            this.deleteNote(event);
        });
    }
} 
