import { Interpret } from "./MarkUp";

let interpretShown = false;

const rootElem = document.querySelector<HTMLDivElement>("#root");
const textBoxElem = document.querySelector<HTMLTextAreaElement>("#textBox");

const toggleDisplay = () => {
  interpretShown = !interpretShown;
  if (!rootElem || !textBoxElem) return;
  console.log(interpretShown);
  rootElem.hidden = !interpretShown;
  textBoxElem.hidden = interpretShown;
  if (interpretShown === true) {
    // Shown is true, we want to make false
    if (textBoxElem.value) {
      console.log("VALUE", JSON.stringify(textBoxElem.value + "\n\n"));
      const output = Interpret(textBoxElem.value + "\n\n");
      console.log(output);
      rootElem.innerHTML = output;
    }
  }
};

document?.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter" && e.shiftKey) {
    toggleDisplay();
    e.preventDefault();
  }
});
