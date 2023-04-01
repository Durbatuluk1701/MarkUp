"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("ts-parso/index");
const fs_1 = __importDefault(require("fs"));
const token_desc_list = [
    {
        name: "HASH",
        description: /#/,
        precedence: 12,
    },
    {
        name: "STAR",
        description: /\*/,
        precedence: 13,
    },
    {
        name: "UNDER",
        description: /_/,
        precedence: 13,
    },
    {
        name: "GT",
        description: />/,
        precedence: 13,
    },
    {
        name: "TAB",
        description: /\t/,
        precedence: 10,
    },
    {
        name: "BACKTICK",
        description: /`/,
        precedence: 13,
    },
    {
        name: "NUM_DOT",
        description: /\d+\./,
        precedence: 13,
    },
    {
        name: "DASH",
        description: /-/,
        precedence: 13,
    },
    {
        name: "LBRACKET",
        description: /\[/,
        precedence: 13,
    },
    {
        name: "RBRACKET",
        description: /\]/,
        precedence: 13,
    },
    {
        name: "LPAREN",
        description: /\(/,
        precedence: 13,
    },
    {
        name: "RPAREN",
        description: /\)/,
        precedence: 13,
    },
    {
        name: "ESCAPE_SEQ",
        description: /\\/,
        precedence: 14,
    },
    {
        name: "STR",
        description: /[^*_`\n\[\]\(\)\\]+/,
        precedence: 0,
    },
    {
        name: "LATEX_SNIP",
        description: /$[^$]+$/,
        precedence: 3,
    },
    {
        name: "BR",
        description: /\n/,
        precedence: 10,
    },
];
const test_str = "# Testing\n### This is a little header\nand we can **have baby** text under it\nmore *text* can be adding, how it will be parsed\nI am not quite sure.\n\nLet us see _how_ this works, __this would be bold I think__.\n Now we see that # hashes midway should be preserved.\n> Can we do blockquotes?\n>> How about nested ones\n1. This is **some stuff**\n2. More stuff\n3. Again another list item\n- Now lets try for an unordered list\n- Can we do it?\n\t- Indented list?!\n\t- Im not sure.\nNow, lets try code inside here `hello my code stuff`\n---\nA horizontal rule might be nice\nHere is a link [Duck Duck Go](https://duckduckgo.com).\n$1 + 1 = 2$\n";
const output_tokens = (0, index_1.Tokenize)(test_str, token_desc_list);
const gram = [
    {
        type: "Rule",
        name: "HorizontalRule",
        pattern: [["DASH", "DASH", "DASH"]],
        callback: (r) => {
            return "<hr>";
        },
    },
    {
        type: "Rule",
        name: "Head1",
        pattern: [["HASH", "STR", "BR"]],
        callback: (r) => {
            const strToken = r.match[1];
            if (strToken.rule.type === "Token") {
                return `<h1>${strToken.rule.match}</h1>`;
            }
            else {
                throw new Error("HEAD1: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "Head2",
        pattern: [["HASH", "HASH", "STR", "BR"]],
        callback: (r) => {
            const strToken = r.match[2];
            if (strToken.rule.type === "Token") {
                return `<h2>${strToken.rule.match}</h2>`;
            }
            else {
                throw new Error("HEAD2: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "Head3",
        pattern: [["HASH", "HASH", "HASH", "STR", "BR"]],
        callback: (r) => {
            const strToken = r.match[3];
            if (strToken.rule.type === "Token") {
                return `<h3>${strToken.rule.match}</h3>`;
            }
            else {
                throw new Error("HEAD3: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "Indent",
        pattern: [["TAB"]],
        callback: (r) => {
            return "";
        },
    },
    {
        type: "Rule",
        name: "BlockQuote",
        // TODO: Add better nesting handling
        pattern: [
            ["GT", "NonEmptyBreakFreeText", "BR"],
            ["GT", "BlockQuote"],
        ],
        callback: (r, context) => {
            const subProgRule = r.match[1].rule;
            if (subProgRule.type === "Rule") {
                return `<blockquote>${subProgRule.callback(r.match[1], context)}</blockquote>`;
            }
            throw new Error("Error in 'BlockQuote', subProg is not a rule");
        },
    },
    {
        type: "Rule",
        name: "OrderedListElem",
        pattern: [["NUM_DOT", "NonEmptyBreakFreeText", "BR"]],
        callback: (r, context) => {
            const textToken = r.match[1];
            if (textToken.rule.type === "Rule") {
                return `<li>${textToken.rule.callback(textToken, context)}</li>`;
            }
            else {
                throw new Error("OrderedListElem: Expecting a NonEmptyBreakFreeText, when we instead got a Token.");
            }
        },
    },
    {
        type: "Rule",
        name: "UnorderedListElem",
        pattern: [["DASH", "NonEmptyBreakFreeText", "BR"]],
        callback: (r, context) => {
            const textToken = r.match[1];
            if (textToken.rule.type === "Rule") {
                return `<li>${textToken.rule.callback(textToken, context)}</li>`;
            }
            else {
                throw new Error("UnorderedListElem: Expecting a NonEmptyBreakFreeText, when we instead got a Token.");
            }
        },
    },
    // {
    //   type: "Rule",
    //   name: "BlockQuote",
    //   pattern: [["GT", "Prog"]],
    //   callback: () => {},
    // },
    {
        type: "Rule",
        name: "Bold",
        pattern: [
            ["STAR", "STAR", "STR", "STAR", "STAR"],
            ["UNDER", "UNDER", "STR", "UNDER", "UNDER"],
        ],
        callback: (r) => {
            const strToken = r.match[2];
            if (strToken.rule.type === "Token") {
                return `<b>${strToken.rule.match}</b>`;
            }
            else {
                throw new Error("Bold: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "Code",
        pattern: [["BACKTICK", "STR", "BACKTICK"]],
        callback: (r) => {
            const strToken = r.match[1];
            if (strToken.rule.type === "Token") {
                return `<code>${strToken.rule.match}</code>`;
            }
            else {
                throw new Error("Code: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "Link",
        pattern: [["LBRACKET", "STR", "RBRACKET", "LPAREN", "STR", "RPAREN"]],
        callback: (r) => {
            const strNameToken = r.match[1];
            const strHrefToken = r.match[4];
            if (strNameToken.rule.type === "Token" &&
                strHrefToken.rule.type === "Token") {
                return `<a href="${strHrefToken.rule.match}">${strNameToken.rule.match}</a>`;
            }
            else {
                throw new Error("Link Element: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "Italic",
        pattern: [
            ["STAR", "STR", "STAR"],
            ["UNDER", "STR", "UNDER"],
        ],
        callback: (r) => {
            const strToken = r.match[1];
            if (strToken.rule.type === "Token") {
                return `<em>${strToken.rule.match}</em>`;
            }
            else {
                throw new Error("Italic: Expecting a STR, when we instead got an extended rule.");
            }
        },
    },
    {
        type: "Rule",
        name: "BreakFreeText",
        pattern: [
            ["STR", "BreakFreeText"],
            ["Italic", "BreakFreeText"],
            ["Bold", "BreakFreeText"],
            ["Code", "BreakFreeText"],
            ["Link", "BreakFreeText"],
            ["EMPTY"],
        ],
        callback: (r, context) => {
            let outputs = "";
            for (const rule of r.match) {
                if (rule.rule.type === "Token") {
                    // We are a token, we should be a STR
                    if (rule.rule.name === "STR") {
                        outputs += rule.rule.match;
                        continue;
                    }
                    else {
                        throw new Error(`We should only be a STR, but instead were a '${rule.rule.name}'`);
                    }
                }
                else if (rule.rule.type === "Rule") {
                    const currentOutput = rule.rule.callback(rule, context);
                    outputs += currentOutput;
                }
            }
            return outputs;
        },
    },
    {
        type: "Rule",
        name: "NonEmptyBreakFreeText",
        pattern: [
            ["ESCAPE_SEQ", "STAR"],
            ["ESCAPE_SEQ", "HASH"],
            ["ESCAPE_SEQ", "UNDER"],
            ["ESCAPE_SEQ", "BACKTICK"],
            ["STR", "BreakFreeText"],
            ["Italic", "BreakFreeText"],
            ["Bold", "BreakFreeText"],
            ["Code", "BreakFreeText"],
            ["Link", "BreakFreeText"],
        ],
        callback: (r, context) => {
            let outputs = "";
            for (const rule of r.match) {
                if (rule.rule.type === "Token") {
                    // We are a token, we should be a STR or ESCAPED
                    if (rule.rule.name === "ESCAPE_SEQ") {
                        if (r.match[1].rule.type === "Token") {
                            // Should always hold
                            return r.match[1].rule.match;
                        }
                    }
                    if (rule.rule.name === "STR") {
                        outputs += rule.rule.match;
                        continue;
                    }
                    else {
                        throw new Error(`We should only be a STR, but instead were a '${rule.rule.name}'`);
                    }
                }
                else if (rule.rule.type === "Rule") {
                    const currentOutput = rule.rule.callback(rule, context);
                    outputs += currentOutput;
                }
            }
            return outputs;
        },
    },
    {
        type: "Rule",
        name: "Text",
        pattern: [["BR", "Text"], ["BreakFreeText", "Text"], ["EMPTY"]],
        callback: (r, context) => {
            let outputs = "";
            let previousBR = false;
            for (const rule of r.match) {
                if (rule.rule.type === "Token") {
                    // We are a token, so STR or BR
                    if (rule.rule.name === "BR") {
                        // We are a BR
                        if (previousBR === true) {
                            // Add a break
                            outputs += "<br>";
                            previousBR = false;
                            continue;
                        }
                        else {
                            // We have not seen a previous BR, so set flag
                            previousBR = true;
                            outputs += "\n";
                            continue;
                        }
                    }
                    else {
                        throw new Error(`We should only be a BR, but instead were a '${rule.rule.name}'`);
                    }
                }
                else if (rule.rule.type === "Rule") {
                    const currentOutput = rule.rule.callback(rule, context);
                    outputs += currentOutput;
                }
                previousBR = false;
            }
            return outputs;
        },
    },
    {
        type: "Rule",
        name: "NonEmptyText",
        pattern: [
            ["BR", "Text"],
            ["NonEmptyBreakFreeText", "Text"],
        ],
        callback: (r, context) => {
            let outputs = "";
            let previousBR = false;
            for (const rule of r.match) {
                if (rule.rule.type === "Token") {
                    // We are a token, so STR or BR
                    if (rule.rule.name === "BR") {
                        // We are a BR
                        if (previousBR === true) {
                            // Add a break
                            outputs += "<br>";
                            previousBR = false;
                            continue;
                        }
                        else {
                            // We have not seen a previous BR, so set flag
                            previousBR = true;
                            outputs += "\n";
                            continue;
                        }
                    }
                    else {
                        throw new Error(`We should only be a BR, but instead were a '${rule.rule.name}'`);
                    }
                }
                else if (rule.rule.type === "Rule") {
                    const currentOutput = rule.rule.callback(rule, context);
                    outputs += currentOutput;
                }
                previousBR = false;
            }
            return outputs;
        },
    },
    {
        type: "Rule",
        name: "Prog",
        pattern: [
            ["HorizontalRule", "Prog"],
            ["Head1", "Prog"],
            ["Head2", "Prog"],
            ["Head3", "Prog"],
            ["Indent", "Prog"],
            ["BlockQuote", "Prog"],
            ["OrderedListElem", "Prog"],
            ["UnorderedListElem", "Prog"],
            ["NonEmptyText", "Prog"],
            ["EMPTY"], // IMPORTANT THAT THIS BE HERE
            // TODO: Make more flexible so Empty need not be the last rule
        ],
        callback: (r, context) => {
            let outputs = "";
            const openItems = context.openItems;
            for (const rule of r.match) {
                if (rule.rule.type === "Rule") {
                    // const ruleOutput =
                    if (rule.rule.name === "OrderedListElem") {
                        // If the next item is a an ordered list element
                        if (openItems[0] === "OrderedListElem") {
                            // If we are in the middle of an ordered list
                            outputs += rule.rule.callback(rule, { openItems: openItems });
                        }
                        else {
                            if (openItems[0] === "UnorderedListElem") {
                                // The other one was open!
                                outputs += "</ul>";
                                openItems.pop();
                            }
                            // We are just starting an ordered list
                            openItems.push("OrderedListElem");
                            outputs += "<ol>\n";
                            outputs += rule.rule.callback(rule, { openItems: openItems });
                        }
                    }
                    else if (rule.rule.name === "UnorderedListElem") {
                        // If the next item is a an un-ordered list element
                        if (openItems[0] === "UnorderedListElem") {
                            // If we are in the middle of an un-ordered list
                            outputs += rule.rule.callback(rule, { openItems: openItems });
                        }
                        else {
                            if (openItems[0] === "OrderedListElem") {
                                // The other one was open!
                                outputs += "</ol>";
                                openItems.pop();
                            }
                            // We are just starting an un-ordered list
                            openItems.push("UnorderedListElem");
                            outputs += "<ul>\n";
                            outputs += rule.rule.callback(rule, { openItems: openItems });
                        }
                    }
                    else if (rule.rule.name === "Prog") {
                        // We could be in between
                        outputs += rule.rule.callback(rule, { openItems: openItems });
                    }
                    else {
                        // We are in the middle of neither
                        // Check if we have possibly switched off one to the other
                        switch (openItems[0]) {
                            case "UnorderedListElem":
                                openItems.pop();
                                outputs += "</ul>";
                                outputs += rule.rule.callback(rule, { openItems: openItems });
                                break;
                            case "OrderedListElem":
                                openItems.pop();
                                outputs += "</ol>";
                                outputs += rule.rule.callback(rule, { openItems: openItems });
                                break;
                            default:
                                outputs += rule.rule.callback(rule, { openItems: openItems });
                                break;
                        }
                    }
                }
                else {
                    throw new Error(`ERROR: Prog should never encounter a raw token, but did: '${rule.rule.name}'`);
                }
            }
            return outputs;
        },
    },
];
const progRule = gram.find((val) => val.name === "Prog");
const parseOut = progRule ? (0, index_1.Parser)(3, output_tokens, gram, progRule) : "";
if (parseOut && parseOut.rule.type === "Rule") {
    console.log("SUCCESS");
    const outText = parseOut.rule.callback(parseOut, { openItems: [] });
    fs_1.default.writeFile("./testoutput.html", outText, () => { });
    // console.log(outText);
}
//# sourceMappingURL=MarkdownTest.js.map