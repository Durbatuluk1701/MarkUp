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
    console.log(interpretShown);
    rootElem.hidden = interpretShown;
    textBoxElem.hidden = !interpretShown;
    if (interpretShown === true) {
        // Shown is true, we want to make false
        if (textBoxElem.value) {
            console.log("VALUE", JSON.stringify(textBoxElem.value + "\n"));
            const output = (0, MarkUp_1.Interpret)(textBoxElem.value + "\n");
            console.log(output);
            rootElem.innerHTML = output;
        }
    }
};
document === null || document === void 0 ? void 0 : document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.shiftKey) {
        toggleDisplay();
        e.preventDefault();
    }
});
//# sourceMappingURL=MarkUpInterp.js.map