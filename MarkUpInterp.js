"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MarkUp_1 = require("./MarkUp");
let interpretShown = false;
const rootElem = document.querySelector("#root");
const textBoxElem = document.querySelector("#textBox");
const toggleDisplay = () => {
    interpretShown = !interpretShown;
    if (!rootElem || !textBoxElem)
        return;
    rootElem.hidden = !interpretShown;
    textBoxElem.hidden = interpretShown;
    if (interpretShown === true) {
        if (textBoxElem.value) {
            const output = (0, MarkUp_1.Interpret)(textBoxElem.value + "\n\n");
            rootElem.appendChild(output);
        }
    }
    else {
        textBoxElem.focus();
    }
};
document === null || document === void 0 ? void 0 : document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.shiftKey) {
        toggleDisplay();
        e.preventDefault();
    }
    else if (e.key === "Tab") {
        if (textBoxElem) {
            textBoxElem.value += "\t";
            e.preventDefault();
        }
    }
});
//# sourceMappingURL=MarkUpInterp.js.map