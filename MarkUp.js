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
        name: "CODE_BLOCK",
        description: /\`[^`]+\`/,
        precedence: 13,
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
            return document.createElement("hr");
        },
    },
    {
        type: "Rule",
        name: "Head1",
        pattern: [["HASH", "STR", "BR"]],
        callback: (r) => {
            const strToken = r.match[1];
            if (strToken.type === "Token") {
                const ret_elem = document.createElement("h1");
                ret_elem.textContent = strToken.match;
                return ret_elem;
                // return `<h1>${strToken.match}</h1>`;
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
                const ret_elem = document.createElement("h2");
                ret_elem.textContent = strToken.match;
                return ret_elem;
                // return `<h2>${strToken.match}</h2>`;
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
                const ret_elem = document.createElement("h3");
                ret_elem.textContent = strToken.match;
                return ret_elem;
                // return `<h3>${strToken.match}</h3>`;
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
            const ret_elem = document.createElement("div");
            return ret_elem;
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
                const ret_elem = document.createElement("blockquote");
                ret_elem.textContent = `${subProgRule.callback(context)}`;
                return ret_elem;
                // return `<blockquote>${subProgRule.callback(context)}</blockquote>`;
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
                const ret_elem = document.createElement("li");
                ret_elem.textContent = `${textToken.callback(context)}`;
                return ret_elem;
                // return `<li>${textToken.callback(context)}</li>`;
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
                const ret_elem = document.createElement("ul");
                ret_elem.textContent = `${textToken.callback(context)}`;
                return ret_elem;
                // return `<li>${textToken.callback(context)}</li>`;
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
                // Return a bold element
                const ret_elem = document.createElement("b");
                ret_elem.textContent = strToken.match;
                return ret_elem;
                // return `<b>${strToken.match}</b>`;
            }
            else {
                throw new Error("Bold: Expecting a STR, when we instead got an extended rule.");
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
                const ret_elem = document.createElement("a");
                ret_elem.href = strHrefToken.match;
                ret_elem.textContent = strNameToken.match;
                return ret_elem;
                // return `<a href="${strHrefToken.match}">${strNameToken.match}</a>`;
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
                const ret_elem = document.createElement("em");
                ret_elem.textContent = strToken.match;
                return ret_elem;
                // return `<em>${strToken.match}</em>`;
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
            ["ESCAPE_SEQ", "LBRACKET"],
            ["ESCAPE_SEQ", "RBRACKET"],
            ["ESCAPE_SEQ", "LPAREN"],
            ["ESCAPE_SEQ", "RPAREN"],
            ["ESCAPE_DOLLAR"],
            ["KATEX"],
            ["STR"],
            ["Italic"],
            ["Bold"],
            ["CODE_BLOCK"],
            ["Link"],
            // ["EMPTY"],
        ],
        callback: (r, context) => {
            const ret_anchor = document.createElement("div");
            for (const rule of r.match) {
                if (rule.type === "Token") {
                    // We are a token, we should be a STR or ESCAPED
                    if (rule.name === "ESCAPE_DOLLAR") {
                        const ret_elem = document.createElement("p");
                        ret_elem.textContent = "$";
                        ret_anchor.appendChild(ret_elem);
                        // return "$";
                    }
                    else if (rule.name === "ESCAPE_SEQ") {
                        if (r.match[1].type === "Token") {
                            // Should always hold
                            const ret_elem = document.createElement("p");
                            ret_elem.textContent = r.match[1].match;
                            ret_anchor.appendChild(ret_elem);
                            // return r.match[1].match;
                        }
                    }
                    else if (rule.name === "KATEX") {
                        const katexSlice = rule.match;
                        console.log(katex_1.default);
                        console.log(katexSlice);
                        // @ts-ignore: Unreachable code error
                        window.katex = katex_1.default;
                        const katexVal = katexSlice.slice(1, katexSlice.length - 1);
                        const katex_root_node = document.createElement("div");
                        katex_1.default.render(katexVal, katex_root_node);
                        ret_anchor.appendChild(katex_root_node);
                        console.log(`Rendering Latex for: ${katexVal}`);
                        console.log(katexVal.length);
                    }
                    else if (rule.name === "CODE_BLOCK") {
                        const ret_elem = document.createElement("code");
                        ret_elem.textContent = rule.match.slice(1, rule.match.length - 1);
                        ret_anchor.appendChild(ret_elem);
                        // const codeSlice = rule.match.slice(1, rule.match.length - 1);
                        // outputs += `<code>${codeSlice}</code>`;
                    }
                    else if (rule.name === "STR") {
                        const ret_elem = document.createElement("p");
                        ret_elem.textContent = rule.match;
                        ret_anchor.appendChild(ret_elem);
                        continue;
                    }
                    else {
                        throw new Error(`We should only be a STR, but instead were a '${rule.name}'`);
                    }
                }
                else if (rule.type === "Rule") {
                    const currentOutput = rule.callback(context);
                    ret_anchor.appendChild(currentOutput);
                }
            }
            return ret_anchor;
        },
    },
    {
        type: "Rule",
        name: "Text",
        pattern: [["BreakFreeText", "Text"], ["EMPTY"]],
        callback: (r, context) => {
            const ret_anchor = document.createElement("div");
            for (const rule of r.match) {
                if (rule.type === "Rule") {
                    const currentOutput = rule.callback(context);
                    ret_anchor.appendChild(currentOutput);
                }
            }
            return ret_anchor;
        },
    },
    {
        type: "Rule",
        name: "NonEmptyText",
        pattern: [["BreakFreeText", "Text"]],
        callback: (r, context) => {
            const ret_anchor = document.createElement("div");
            for (const rule of r.match) {
                if (rule.type === "Rule") {
                    const currentOutput = rule.callback(context);
                    ret_anchor.appendChild(currentOutput);
                }
            }
            return ret_anchor;
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
            const ret_anchor = document.createElement("div");
            const openItems = context.openItems;
            let previousBR = context.previousBR;
            for (const rule of r.match) {
                if (rule.type === "Rule") {
                    // const ruleOutput =
                    if (rule.name === "OrderedListElem") {
                        // If the next item is a an ordered list element
                        if (openItems[0] === "OrderedListElem") {
                            // If we are in the middle of an ordered list
                            ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                        }
                        else {
                            if (openItems[0] === "UnorderedListElem") {
                                // The other one was open!
                                const ulElem = document.createElement("ul");
                                ret_anchor.appendChild(ulElem);
                                openItems.pop();
                            }
                            // We are just starting an ordered list
                            openItems.push("OrderedListElem");
                            const olElem = document.createElement("ol");
                            ret_anchor.appendChild(olElem);
                            ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                        }
                    }
                    else if (rule.name === "UnorderedListElem") {
                        // If the next item is a an un-ordered list element
                        if (openItems[0] === "UnorderedListElem") {
                            // If we are in the middle of an un-ordered list
                            ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                        }
                        else {
                            if (openItems[0] === "OrderedListElem") {
                                // The other one was open!
                                const olElem = document.createElement("ol");
                                ret_anchor.appendChild(olElem);
                                openItems.pop();
                            }
                            // We are just starting an un-ordered list
                            openItems.push("UnorderedListElem");
                            const ulElem = document.createElement("ul");
                            ret_anchor.appendChild(ulElem);
                            ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                        }
                    }
                    else if (rule.name === "Prog") {
                        // We could be in between
                        ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                    }
                    else {
                        // We are in the middle of neither
                        // Check if we have possibly switched off one to the other
                        switch (openItems[0]) {
                            case "UnorderedListElem":
                                openItems.pop();
                                const ret_elem = document.createElement("ul");
                                ret_anchor.appendChild(ret_elem);
                                ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                                break;
                            case "OrderedListElem":
                                openItems.pop();
                                const ret_elem2 = document.createElement("ol");
                                ret_anchor.appendChild(ret_elem2);
                                ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                                break;
                            default:
                                ret_anchor.appendChild(rule.callback({ openItems: openItems, previousBR: previousBR }));
                                break;
                        }
                    }
                }
                else if (rule.type === "Token" && rule.name === "BR") {
                    // We are a BR
                    if (previousBR === true) {
                        // Add a break
                        const brElem = document.createElement("br");
                        ret_anchor.appendChild(brElem);
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
            return ret_anchor;
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