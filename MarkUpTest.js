"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MarkUp_1 = require("./MarkUp");
const fs_1 = __importDefault(require("fs"));
const test_str = "# Testing\n";
// "### This is a little header\nand we can **have baby** text under it\nmore *text* can be adding, how it will be parsed\nI am not quite sure.\n\nLet us see _how_ this works, __this would be bold I think__.\nNow we see that # hashes midway should be preserved.\n> Can we do blockquotes?\n>> How about nested ones\n1. This is **some stuff**\n2. More stuff\n3. Again another list item\n- Now lets try for an unordered list\n- Can we do it?\n\t- Indented list?!\n\t- Im not sure.\nNow, lets try code inside here `hello my code stuff`\n---\nA horizontal rule might be nice\nHere is a link [Duck Duck Go](https://duckduckgo.com).\n$x + y = y + x \\implies \\text{Commutativity holds}$\n";
const output = (0, MarkUp_1.Interpret)(test_str);
console.log(output);
fs_1.default.writeFile("./testoutput.html", output, () => { });
//# sourceMappingURL=MarkUpTest.js.map