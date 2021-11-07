const TextBox = document.querySelector("#textBox") as HTMLInputElement;
const RootDiv = document.querySelector("#root") as HTMLDivElement;

interface AbstractMarkUpNode {
    data: string;
    type: MarkupNodeType;
};

interface HtmlSkeleton {
    innerHtml: string;
    children: HtmlSkeleton[];
    tag: string;
    appendChild: (child: HtmlSkeleton) => void;
}

enum MarkupNodeType {
    H1 = "h1",
    H2 = "h2",
    H3 = "h3",
    P = "p",
    BR = "br",
};

const createHtmlSkeleton = (tag?: string , innerHtml?: string): HtmlSkeleton => {
    const newSkeleton: HtmlSkeleton = {
        innerHtml: innerHtml ?? "",
        children: [],
        tag: tag ?? "",
        appendChild: (child: HtmlSkeleton) => {
            newSkeleton.children.push(child);
        }
    }
    return newSkeleton;
}

const FileToString = (filePath: string): string => {
    // Read file to string
    let fileString = "" // File read into one big string
    return fileString;
}

const NodeParser = (inputString: string): AbstractMarkUpNode[] => {
    // We need to parse line by line (probably at least for now)
    let lineList = inputString.split("\n");
    let nodeList = new Array<AbstractMarkUpNode>();
    lineList.forEach((line: string) => {
        if (line.startsWith("###")) {
            // H3
            nodeList.push({ data: line.substr(3), type: MarkupNodeType.H3 })
        } else if (line.startsWith("##")) {
            // H2
            nodeList.push({ data: line.substr(2), type: MarkupNodeType.H2 })
        } else if (line.startsWith("#")) {
            // H1
            nodeList.push({ data: line.substr(1), type: MarkupNodeType.H1 })
        } else if (line === "") {
            // Break
            nodeList.push({ data: "", type: MarkupNodeType.BR })
        } else {
            nodeList.push({ data: line, type: MarkupNodeType.P });
        }
    })
    return nodeList;
}

const Interp = (inputProg: AbstractMarkUpNode[]): HtmlSkeleton => {
    const RootElem = createHtmlSkeleton("div");
    inputProg.forEach((value: AbstractMarkUpNode) => {
        let newElem = createHtmlSkeleton(value.type, value.data);
        RootElem.appendChild(newElem);
    })
    return RootElem;
}

const SkeletonToHTML = (rootElem: HtmlSkeleton): HTMLElement => {
    const newRoot = document.createElement(rootElem.tag);
    newRoot.innerHTML = rootElem.innerHtml;
    rootElem.children.forEach((child) => {
        newRoot.appendChild(SkeletonToHTML(child));
    })
    return newRoot;
}

const SwapModes = () => {
    displayMode = !displayMode;
    TextBox.hidden = displayMode;
    RootDiv.hidden = !displayMode;
    document.title = "MarkUp - " + (displayMode ? "Viewer" : "Interpreter");
}


let displayMode = false;
window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key == "Enter") {
        if (displayMode) {
            // Restore and return
            RootDiv.firstChild.remove();
            SwapModes();
            return;
        }
       let textBoxInput = TextBox.value;
       let nodes = NodeParser(textBoxInput);
       let htmlInterp = Interp(nodes);
       let interpedElem = SkeletonToHTML(htmlInterp);
       RootDiv.appendChild(interpedElem);
       SwapModes();
    }
})