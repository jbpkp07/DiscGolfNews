"use strict";


class ViewController {

    constructor() {

        this.orderName = $("#orderName");
        this.orderCheckboxes = $("input[data-type=ingredient]");
        this.submitOrderBTN = $("#submitOrderBTN");
        this.devourBTNs = $("div[data-type=devour]");
        this.deleteBTNs = $("div[data-type=delete]");

        this.assignListeners();
    }

    assignListeners() {

        this.orderName.focus();

        this.submitOrderBTN.click((event) => {

            this.submitOrder(event);
        });

        this.devourBTNs.click((event) => {

            this.markAsDevoured(event);
        });

        this.deleteBTNs.click((event) => {

            this.markAsDeleted(event);
        });
    }

    submitOrder(event) {

        const name = this.orderName.val().trim();

        const ingredientIDs = [];

        for (const checkbox of this.orderCheckboxes) {

            if ($(checkbox).prop("checked")) {

                const id = $(checkbox).attr("data-id").trim();

                ingredientIDs.push(parseInt(id));
            }
        }

        if (this.isInputValid(name, ingredientIDs, event)) {

            event.preventDefault();

            this.clearInputFields();

            this.submitOrderBTN.off("click");

            const newBurger =
            {
                name,
                ingredientIDs: JSON.stringify(ingredientIDs) //JSON.stringify (client) then JSON.parse (server) allows empty arrays to be used for POST
            };

            $.post("/api/burgers", newBurger, () => {

                location.reload();

            }).fail((error) => {

                console.log(error.responseText);
            });
        }
    }

    markAsDevoured(event) {

        const dataset = event.currentTarget.dataset;

        if (dataset.devoured === "0") {  //captured from HTML as a string, not as number

            this.devourBTNs.off("click");

            const burger =
            {
                id: dataset.id,
                name: dataset.name,
                devoured: 1
            };

            const ajaxConfig =
            {
                type: "PUT",
                data: burger
            };

            $.ajax(`/api/burgers`, ajaxConfig).then(() => {

                location.reload();

            }).fail((error) => {

                console.log(error.responseText);
            });
        }
    }

    markAsDeleted(event) {

        const dataset = event.currentTarget.dataset;

        this.devourBTNs.off("click");

        const burger =
        {
            id: dataset.id,
            name: dataset.name,
            devoured: parseInt(dataset.devoured)
        };

        const ajaxConfig =
        {
            type: "DELETE",
            data: burger
        };

        $.ajax(`/api/burgers/${burger.id}`, ajaxConfig).then(() => {

            location.reload();

        }).fail((error) => {

            console.log(error.responseText);
        });
    }

    isInputValid(name, ingredientIDs, event) {

        if (typeof name !== "string" || name.length === 0) {

            return false;
        }

        if (name.length > 30) {

            event.preventDefault();

            alert("Burger name is too long, please keep it to at most 30 characters.");

            return false;
        }

        if (!Array.isArray(ingredientIDs) || ingredientIDs.length > this.orderCheckboxes.length) {

            return false;
        }

        if (ingredientIDs.length === 0) {

            event.preventDefault();

            alert("Please enter at least 1 ingredient for your burger.");

            return false;
        }

        for (const id of ingredientIDs) {

            if (typeof id !== "number" || id <= 0 || id > this.orderCheckboxes.length) {

                return false;
            }
        }

        return true;
    }

    clearInputFields() {

        this.orderName.val("");

        for (const checkbox of this.orderCheckboxes) {

            $(checkbox).prop("checked", false);
        }
    }
} 
