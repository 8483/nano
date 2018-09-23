// const flatpickr = require("flatpickr");
// const Macedonian = require("flatpickr/dist/l10n/mk.js").default.mk;

// Instantiate datepicker
// flatpickr("#input-journal-date", {
//     dateFormat: "d.m.Y",
//     allowInput: true,
//     "locale": Macedonian
// });

// Make an input into a formatted date input
function makeDateField(divId) {
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
                num.toString().length == 1
                    ? "0" + num
                    : num.toString();
        }
        return str;
    }

    date.addEventListener("input", function(e) {
        this.type = "text";
        var input = this.value;

        // When deleting, when a . is encountered, jump 2 characters
        if (/\.$/.test(input)) input = input.substr(0, input.length - 2);

        // Split at / and remove /
        var values = input.split(".").map(function(v) {
            return v.replace(/\D/g, "");
        });

        // Check parts if they exceed the ranges
        if (values[0]) values[0] = checkValue(values[0], 31);
        if (values[1]) values[1] = checkValue(values[1], 12);

        var output = values.map(function(v, i) {
            return v.length == 2 && i < 2 ? v + "." : v;
        });

        // Join array (. included inside)
        this.value = output.join("").substr(0, 10);
    });
}

// Highlight clicked table row. Send a "SET_ITEM" update action.
function addTableRowClickListeners(tableId, action) {
    document.querySelectorAll(`${tableId} tr`).forEach(el =>
        el.addEventListener("click", e => {
            rowClickHandler(e);
        })
    );
    function rowClickHandler(e) {
        let rowId = e.target.parentElement.dataset.id;
        update({ action: action, payload: rowId });
    }
}

// on Enter, jumpr from one to another field
function onEnterFocus(from, to) {
    document.getElementById(from).addEventListener("keypress", e => {
        let key = e.which || e.keyCode;
        if (key === 13) {
            console.log(e);
            document.getElementById(to).focus();
        }
    });
}
