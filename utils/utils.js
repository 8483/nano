// const flatpickr = require("flatpickr");
// const Macedonian = require("flatpickr/dist/l10n/mk.js").default.mk;

// Instantiate datepicker
// flatpickr("#input-journal-date", {
//     dateFormat: "d.m.Y",
//     allowInput: true,
//     "locale": Macedonian
// });

// module.exports = function () {
//     this.sum = function (a, b) {
//         return a + b
//     };
//     this.multiply = function (a, b) {
//         return a * b
//     };
//     //etc
// }

// require('tools.js')();
// sum(1,2);


module.exports = function () {

    // Make an input into a formatted date input
    this.makeDateField = function (divId) {
        var date = document.getElementById(divId);

        function checkValue(str, max) {
            // if input is valid (not zero)
            if (str.charAt(0) !== "0" || str == "00") {
                var num = parseInt(str);
                // if not a number, return 1
                if (isNaN(num) || num <= 0 || num > max) num = 1;

                // add a leading 0
                str =
                    num > parseInt(max.toString().charAt(0)) &&
                    num.toString().length == 1 ?
                    "0" + num :
                    num.toString();
            }
            return str;
        }

        date.addEventListener("input", function (e) {
            this.type = "text";
            var input = this.value;

            // When deleting, when a . is encountered, jump 2 characters
            if (/\.$/.test(input)) input = input.substr(0, input.length - 2);

            // Split at / and remove /
            var values = input.split(".").map(function (v) {
                return v.replace(/\D/g, "");
            });

            // Check parts if they exceed the ranges
            if (values[0]) values[0] = checkValue(values[0], 31);
            if (values[1]) values[1] = checkValue(values[1], 12);

            var output = values.map(function (v, i) {
                return v.length == 2 && i < 2 ? v + "." : v;
            });

            // Join array (. included inside)
            this.value = output.join("").substr(0, 10);
        });
    }

    // on Enter, jump from one field to another
    this.onEnterFocus = function (from, to) {
        document.getElementById(from).addEventListener("keypress", e => {
            if (e.key === "Enter") {
                inputFocusAndSelectText(to);
            }
        });
    }

    // Select the text inside an input. Fixes caret being moved to start of text.
    this.inputFocusAndSelectText = function (id) {
        let input = document.getElementById(id);
        // Selecting the range on a button causes an error
        if (input.nodeName === "INPUT") {
            input.addEventListener("focus", e => {
                var len = e.target.value.length;
                e.target.setSelectionRange(0, len);
            });
        }
        input.focus();
    }

    // Return the value of an HTML ID
    this.value = function (id) {
        return document.getElementById(id).value;
    }

    this.isInt = function (n) {
        return Number(n) === n && n % 1 === 0;
    }

    this.isFloat = function (n) {
        return Number(n) === n && n % 1 !== 0;
    }

    // Convert a null value to an empty string for displaying purposes.
    this.nullToEmpty = function (value) {
        return value != null ? value : "";
    }

    // Re-arrange a date string into an MySQL valid date: "30.11.2018" becomes "20181130"
    this.toDate = function (value) {
        let parts = value.split(".")
        return parts[2] + parts[1] + parts[0];
    }

    // Get the data-* value for a given input id and key
    this.getDatalistValue = function (id, key) {
        // The input
        let el = document.getElementById(id)

        // The selected option found by the datalist id and the value of the selected option
        const option = document.querySelector(`#${el.list.id} option[value='${el.value}']`);

        return option.dataset[key]
    }

}

// TODO: Number formatting function .toLocaleString();