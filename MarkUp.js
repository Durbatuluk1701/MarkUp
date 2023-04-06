"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpret = void 0;
const index_1 = require("ts-parso/index");
const katex_1 = __importDefault(require("katex"));
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
        description: /[^*_`\n\$\[\]\(\)\\]+/,
        precedence: 0,
    },
    {
        name: "KATEX",
        description: /\$[^\$]+\$/,
        precedence: 3,
    },
    {
        name: "ESCAPE_DOLLAR",
        description: /\\\$/,
        precedence: 15,
    },
    {
        name: "BR",
        description: /\n/,
        precedence: 10,
    },
];
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
            if (strToken.type === "Token") {
                return `<h1>${strToken.match}</h1>`;
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
            if (strToken.type === "Token") {
                return `<h2>${strToken.match}</h2>`;
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
            if (strToken.type === "Token") {
                return `<h3>${strToken.match}</h3>`;
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
            ["GT", "BreakFreeText", "BR"],
            ["GT", "BlockQuote"],
        ],
        callback: (r, context) => {
            const subProgRule = r.match[1];
            if (subProgRule.type === "Rule") {
                return `<blockquote>${subProgRule.callback(context)}</blockquote>`;
            }
            throw new Error("Error in 'BlockQuote', subProg is not a rule");
        },
    },
    {
        type: "Rule",
        name: "OrderedListElem",
        pattern: [["NUM_DOT", "Text", "BR"]],
        callback: (r, context) => {
            const textToken = r.match[1];
            if (textToken.type === "Rule") {
                return `<li>${textToken.callback(context)}</li>`;
            }
            else {
                throw new Error("OrderedListElem: Expecting a Text, when we instead got a Token.");
            }
        },
    },
    {
        type: "Rule",
        name: "UnorderedListElem",
        pattern: [["DASH", "Text", "BR"]],
        callback: (r, context) => {
            const textToken = r.match[1];
            if (textToken.type === "Rule") {
                return `<li>${textToken.callback(context)}</li>`;
            }
            else {
                throw new Error("UnorderedListElem: Expecting a Text, when we instead got a Token.");
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
            if (strToken.type === "Token") {
                return `<b>${strToken.match}</b>`;
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
            if (strToken.type === "Token") {
                return `<code>${strToken.match}</code>`;
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
            if (strNameToken.type === "Token" && strHrefToken.type === "Token") {
                return `<a href="${strHrefToken.match}">${strNameToken.match}</a>`;
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
            if (strToken.type === "Token") {
                return `<em>${strToken.match}</em>`;
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
            ["ESCAPE_SEQ", "STAR"],
            ["ESCAPE_SEQ", "ESCAPE_SEQ"],
            ["ESCAPE_SEQ", "HASH"],
            ["ESCAPE_SEQ", "UNDER"],
            ["ESCAPE_SEQ", "BACKTICK"],
            ["ESCAPE_DOLLAR"],
            ["KATEX"],
            ["STR"],
            ["Italic"],
            ["Bold"],
            ["Code"],
            ["Link"],
            // ["EMPTY"],
        ],
        callback: (r, context) => {
            let outputs = "";
            for (const rule of r.match) {
                if (rule.type === "Token") {
                    // We are a token, we should be a STR or ESCAPED
                    if (rule.name === "ESCAPE_DOLLAR") {
                        return "$";
                    }
                    else if (rule.name === "ESCAPE_SEQ") {
                        if (r.match[1].type === "Token") {
                            // Should always hold
                            return r.match[1].match;
                        }
                    }
                    else if (rule.name === "KATEX") {
                        const katexSlice = rule.match;
                        outputs += katex_1.default.renderToString(katexSlice.slice(1, katexSlice.length - 1), { output: "mathml" });
                    }
                    else if (rule.name === "STR") {
                        outputs += rule.match;
                        continue;
                    }
                    else {
                        throw new Error(`We should only be a STR, but instead were a '${rule.name}'`);
                    }
                }
                else if (rule.type === "Rule") {
                    const currentOutput = rule.callback(context);
                    outputs += currentOutput;
                }
            }
            return outputs;
        },
    },
    {
        type: "Rule",
        name: "Text",
        pattern: [["BreakFreeText", "Text"], ["EMPTY"]],
        callback: (r, context) => {
            let outputs = "";
            for (const rule of r.match) {
                if (rule.type === "Rule") {
                    const currentOutput = rule.callback(context);
                    outputs += currentOutput;
                }
            }
            return outputs;
        },
    },
    {
        type: "Rule",
        name: "NonEmptyText",
        pattern: [["BreakFreeText", "Text"]],
        callback: (r, context) => {
            let outputs = "";
            for (const rule of r.match) {
                if (rule.type === "Rule") {
                    const currentOutput = rule.callback(context);
                    outputs += currentOutput;
                }
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
            ["BR", "Prog"],
            ["EMPTY"], // IMPORTANT THAT THIS BE HERE
            // TODO: Make more flexible so Empty need not be the last rule
        ],
        callback: (r, context) => {
            let outputs = "";
            const openItems = context.openItems;
            let previousBR = context.previousBR;
            for (const rule of r.match) {
                if (rule.type === "Rule") {
                    // const ruleOutput =
                    if (rule.name === "OrderedListElem") {
                        // If the next item is a an ordered list element
                        if (openItems[0] === "OrderedListElem") {
                            // If we are in the middle of an ordered list
                            outputs += rule.callback({
                                openItems: openItems,
                                previousBR: previousBR,
                            });
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
                            outputs += rule.callback({
                                openItems: openItems,
                                previousBR: previousBR,
                            });
                        }
                    }
                    else if (rule.name === "UnorderedListElem") {
                        // If the next item is a an un-ordered list element
                        if (openItems[0] === "UnorderedListElem") {
                            // If we are in the middle of an un-ordered list
                            outputs += rule.callback({
                                openItems: openItems,
                                previousBR: previousBR,
                            });
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
                            outputs += rule.callback({
                                openItems: openItems,
                                previousBR: previousBR,
                            });
                        }
                    }
                    else if (rule.name === "Prog") {
                        // We could be in between
                        outputs += rule.callback({
                            openItems: openItems,
                            previousBR: previousBR,
                        });
                    }
                    else {
                        // We are in the middle of neither
                        // Check if we have possibly switched off one to the other
                        switch (openItems[0]) {
                            case "UnorderedListElem":
                                openItems.pop();
                                outputs += "</ul>";
                                outputs += rule.callback({
                                    openItems: openItems,
                                    previousBR: previousBR,
                                });
                                break;
                            case "OrderedListElem":
                                openItems.pop();
                                outputs += "</ol>";
                                outputs += rule.callback({
                                    openItems: openItems,
                                    previousBR: previousBR,
                                });
                                break;
                            default:
                                outputs += rule.callback({
                                    openItems: openItems,
                                    previousBR: previousBR,
                                });
                                break;
                        }
                    }
                }
                else if (rule.type === "Token" && rule.name === "BR") {
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
                        continue;
                    }
                }
                else {
                    throw new Error(`ERROR: Prog should never encounter a raw token, but did: '${rule.name}'`);
                }
            }
            return outputs;
        },
    },
];
const Interpret = (str) => {
    const tokens = (0, index_1.Tokenize)(str, token_desc_list);
    const progRule = gram.find((val) => val.name === "Prog");
    if (progRule) {
        const ruleRes = (0, index_1.Parser)(4, tokens, gram, progRule);
        if (ruleRes && ruleRes.type === "Rule") {
            return ruleRes.callback({ openItems: [] });
        }
        else {
            throw new Error("Return of parser failed");
        }
    }
    else {
        throw new Error("Could not interpret markup");
    }
};
exports.Interpret = Interpret;
//# sourceMappingURL=MarkUp.js.map