// interface AbstractMarkUpNode {
//     data: string;
//     type: MarkupNodeType;
// };

// enum MarkupNodeType {
//     H1 = "h1",
//     H2 = "h2",
//     H3 = "h3",
//     P = "p",
//     BR = "br",
// };

// const TextBox = document.querySelector("#textBox") as HTMLInputElement;
// const RootDiv = document.querySelector("#root") as HTMLDivElement;
// let displayMode = false;

// const FileToString = (filePath: string): string => {
//     // Read file to string
//     let fileString = "" // File read into one big string
//     return fileString;
// }

// const NodeParser = (inputString: string): AbstractMarkUpNode[] => {
//     // We need to parse line by line (probably at least for now)
//     let lineList = inputString.split("\n");
//     let nodeList = new Array<AbstractMarkUpNode>();
//     lineList.forEach((line: string) => {
//         if (line.startsWith("###")) {
//             // H3
//             nodeList.push({ data: line.substr(3), type: MarkupNodeType.H3 })
//         } else if (line.startsWith("##")) {
//             // H2
//             nodeList.push({ data: line.substr(2), type: MarkupNodeType.H2 })
//         } else if (line.startsWith("#")) {
//             // H1
//             nodeList.push({ data: line.substr(1), type: MarkupNodeType.H1 })
//         } else if (line === "") {
//             // Break
//             nodeList.push({ data: "", type: MarkupNodeType.BR })
//         } else {
//             nodeList.push({ data: line, type: MarkupNodeType.P });
//         }
//     })
//     return nodeList;
// }

// const Interp = (inputProg: AbstractMarkUpNode[]): HTMLElement => {
//     const RootElem = document.createElement("div");
//     RootElem.id = "interpRoot";
//     inputProg.forEach((value: AbstractMarkUpNode) => {
//         let newElem = document.createElement(value.type);
//         newElem.innerText = value.data;
//         RootElem.appendChild(newElem);
//     })
//     return RootElem;
// }

// const SwapModes = () => {
//     displayMode = !displayMode;
//     TextBox.hidden = displayMode;
//     RootDiv.hidden = !displayMode;
//     document.title = "MarkUp - " + (displayMode ? "Viewer" : "Interpreter");
// }

// window.addEventListener("keydown", (e) => {
//     if (e.ctrlKey && e.key == "Enter") {
//         if (displayMode) {
//             // Restore and return
//             RootDiv.firstChild.remove();
//             SwapModes();
//             return;
//         }
//        let textBoxInput = TextBox.value;
//        let nodes = NodeParser(textBoxInput);
//        let htmlInterp = Interp(nodes);
//        RootDiv.appendChild(htmlInterp);
//        SwapModes();
//     }
// })
