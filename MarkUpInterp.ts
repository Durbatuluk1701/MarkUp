import { Interpret } from "./MarkUp";

let interpretShown = false;

const rootElem = document.querySelector<HTMLDivElement>("#root");
const textBoxElem = document.querySelector<HTMLTextAreaElement>("#textBox");

const toggleDisplay = () => {
  interpretShown = !interpretShown;
  if (!rootElem || !textBoxElem) return;
  rootElem.hidden = !interpretShown;
  textBoxElem.hidden = interpretShown;
  if (interpretShown === true) {
    // Shown is true, we want to make false
    if (textBoxElem.value) {
      const output = Interpret(textBoxElem.value + "\n\n");
      rootElem.innerHTML = output;
    }
  }
};

document?.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" && e.shiftKey) {
    toggleDisplay();
    e.preventDefault();
  } else if (e.key === "Tab") {
    if (textBoxElem) {
      textBoxElem.value += "\t";
      e.preventDefault();
    }
  }
});
