var TextBox = document.querySelector("#textBox");
var RootDiv = document.querySelector("#root");
;
var MarkupNodeType;
(function (MarkupNodeType) {
    MarkupNodeType["H1"] = "h1";
    MarkupNodeType["H2"] = "h2";
    MarkupNodeType["H3"] = "h3";
    MarkupNodeType["P"] = "p";
    MarkupNodeType["BR"] = "br";
})(MarkupNodeType || (MarkupNodeType = {}));
;
var createHtmlSkeleton = function (tag, innerHtml) {
    var newSkeleton = {
        innerHtml: innerHtml !== null && innerHtml !== void 0 ? innerHtml : "",
        children: [],
        tag: tag !== null && tag !== void 0 ? tag : "",
        appendChild: function (child) {
            newSkeleton.children.push(child);
        }
    };
    return newSkeleton;
};
var FileToString = function (filePath) {
    var fileString = "";
    return fileString;
};
var NodeParser = function (inputString) {
    var lineList = inputString.split("\n");
    var nodeList = new Array();
    lineList.forEach(function (line) {
        if (line.startsWith("###")) {
            nodeList.push({ data: line.substr(3), type: MarkupNodeType.H3 });
        }
        else if (line.startsWith("##")) {
            nodeList.push({ data: line.substr(2), type: MarkupNodeType.H2 });
        }
        else if (line.startsWith("#")) {
            nodeList.push({ data: line.substr(1), type: MarkupNodeType.H1 });
        }
        else if (line === "") {
            nodeList.push({ data: "", type: MarkupNodeType.BR });
        }
        else {
            nodeList.push({ data: line, type: MarkupNodeType.P });
        }
    });
    return nodeList;
};
var Interp = function (inputProg) {
    var RootElem = createHtmlSkeleton("div");
    inputProg.forEach(function (value) {
        var newElem = createHtmlSkeleton(value.type, value.data);
        RootElem.appendChild(newElem);
    });
    return RootElem;
};
var SkeletonToHTML = function (rootElem) {
    var newRoot = document.createElement(rootElem.tag);
    newRoot.innerHTML = rootElem.innerHtml;
    rootElem.children.forEach(function (child) {
        newRoot.appendChild(SkeletonToHTML(child));
    });
    return newRoot;
};
var SwapModes = function () {
    displayMode = !displayMode;
    TextBox.hidden = displayMode;
    RootDiv.hidden = !displayMode;
    document.title = "MarkUp - " + (displayMode ? "Viewer" : "Interpreter");
};
var displayMode = false;
window.addEventListener("keydown", function (e) {
    if (e.altKey && e.key == "Enter") {
        if (displayMode) {
            RootDiv.firstChild.remove();
            SwapModes();
            return;
        }
        var textBoxInput = TextBox.value;
        var nodes = NodeParser(textBoxInput);
        var htmlInterp = Interp(nodes);
        var interpedElem = SkeletonToHTML(htmlInterp);
        RootDiv.appendChild(interpedElem);
        SwapModes();
    }
});
