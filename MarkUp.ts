import { Parser, Tokenize } from "ts-parso/index";
import katex from "katex";

const token_desc_list: TokenDescription[] = [
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

const gram: Grammar<string> = [
  {
    type: "Rule",
    name: "HorizontalRule",
    pattern: [["DASH", "DASH", "DASH"]],
    callback: (r: RuleMatch<string>) => {
      return "<hr>";
    },
  },
  {
    type: "Rule",
    name: "Head1",
    pattern: [["HASH", "STR", "BR"]],
    callback: (r: RuleMatch<string>) => {
      const strToken = r.match[1];
      if (strToken.rule.type === "Token") {
        return `<h1>${strToken.rule.match}</h1>`;
      } else {
        throw new Error(
          "HEAD1: Expecting a STR, when we instead got an extended rule."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "Head2",
    pattern: [["HASH", "HASH", "STR", "BR"]],
    callback: (r: RuleMatch<string>) => {
      const strToken = r.match[2];
      if (strToken.rule.type === "Token") {
        return `<h2>${strToken.rule.match}</h2>`;
      } else {
        throw new Error(
          "HEAD2: Expecting a STR, when we instead got an extended rule."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "Head3",
    pattern: [["HASH", "HASH", "HASH", "STR", "BR"]],
    callback: (r: RuleMatch<string>) => {
      const strToken = r.match[3];
      if (strToken.rule.type === "Token") {
        return `<h3>${strToken.rule.match}</h3>`;
      } else {
        throw new Error(
          "HEAD3: Expecting a STR, when we instead got an extended rule."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "Indent",
    pattern: [["TAB"]],
    callback: (r: RuleMatch<string>) => {
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
    callback: (r: RuleMatch<string>, context) => {
      const subProgRule = r.match[1].rule;
      if (subProgRule.type === "Rule") {
        return `<blockquote>${subProgRule.callback(
          r.match[1],
          context
        )}</blockquote>`;
      }
      throw new Error("Error in 'BlockQuote', subProg is not a rule");
    },
  },
  {
    type: "Rule",
    name: "OrderedListElem",
    pattern: [["NUM_DOT", "Text", "BR"]],
    callback: (r: RuleMatch<string>, context) => {
      const textToken = r.match[1];
      if (textToken.rule.type === "Rule") {
        return `<li>${textToken.rule.callback(textToken, context)}</li>`;
      } else {
        throw new Error(
          "OrderedListElem: Expecting a Text, when we instead got a Token."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "UnorderedListElem",
    pattern: [["DASH", "Text", "BR"]],
    callback: (r: RuleMatch<string>, context) => {
      const textToken = r.match[1];
      if (textToken.rule.type === "Rule") {
        return `<li>${textToken.rule.callback(textToken, context)}</li>`;
      } else {
        throw new Error(
          "UnorderedListElem: Expecting a Text, when we instead got a Token."
        );
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
    callback: (r: RuleMatch<string>) => {
      const strToken = r.match[2];
      if (strToken.rule.type === "Token") {
        return `<b>${strToken.rule.match}</b>`;
      } else {
        throw new Error(
          "Bold: Expecting a STR, when we instead got an extended rule."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "Code",
    pattern: [["BACKTICK", "STR", "BACKTICK"]],
    callback: (r: RuleMatch<string>) => {
      const strToken = r.match[1];
      if (strToken.rule.type === "Token") {
        return `<code>${strToken.rule.match}</code>`;
      } else {
        throw new Error(
          "Code: Expecting a STR, when we instead got an extended rule."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "Link",
    pattern: [["LBRACKET", "STR", "RBRACKET", "LPAREN", "STR", "RPAREN"]],
    callback: (r: RuleMatch<string>) => {
      const strNameToken = r.match[1];
      const strHrefToken = r.match[4];
      if (
        strNameToken.rule.type === "Token" &&
        strHrefToken.rule.type === "Token"
      ) {
        return `<a href="${strHrefToken.rule.match}">${strNameToken.rule.match}</a>`;
      } else {
        throw new Error(
          "Link Element: Expecting a STR, when we instead got an extended rule."
        );
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
    callback: (r: RuleMatch<string>) => {
      const strToken = r.match[1];
      if (strToken.rule.type === "Token") {
        return `<em>${strToken.rule.match}</em>`;
      } else {
        throw new Error(
          "Italic: Expecting a STR, when we instead got an extended rule."
        );
      }
    },
  },
  {
    type: "Rule",
    name: "BreakFreeText",
    pattern: [
      ["ESCAPE_SEQ", "STAR"],
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
    callback: (r: RuleMatch<string>, context) => {
      let outputs = "";
      for (const rule of r.match) {
        if (rule.rule.type === "Token") {
          // We are a token, we should be a STR or ESCAPED
          if (rule.rule.name === "ESCAPE_DOLLAR") {
            return "$";
          } else if (rule.rule.name === "ESCAPE_SEQ") {
            if (r.match[1].rule.type === "Token") {
              // Should always hold
              return r.match[1].rule.match;
            }
          } else if (rule.rule.name === "KATEX") {
            const katexSlice = rule.rule.match;
            outputs += katex.renderToString(
              katexSlice.slice(1, katexSlice.length - 1),
              { output: "mathml" }
            );
          } else if (rule.rule.name === "STR") {
            outputs += rule.rule.match;
            continue;
          } else {
            throw new Error(
              `We should only be a STR, but instead were a '${rule.rule.name}'`
            );
          }
        } else if (rule.rule.type === "Rule") {
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
    pattern: [["BreakFreeText", "Text"], ["EMPTY"]],
    callback: (r: RuleMatch<string>, context) => {
      let outputs = "";
      for (const rule of r.match) {
        if (rule.rule.type === "Rule") {
          const currentOutput = rule.rule.callback(rule, context);
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
    callback: (r: RuleMatch<string>, context) => {
      let outputs = "";
      for (const rule of r.match) {
        if (rule.rule.type === "Rule") {
          const currentOutput = rule.rule.callback(rule, context);
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
    callback: (r: RuleMatch<string>, context) => {
      let outputs = "";
      const openItems: string[] = context.openItems;
      let previousBR = context.previousBR;
      for (const rule of r.match) {
        if (rule.rule.type === "Rule") {
          // const ruleOutput =
          if (rule.rule.name === "OrderedListElem") {
            // If the next item is a an ordered list element
            if (openItems[0] === "OrderedListElem") {
              // If we are in the middle of an ordered list
              outputs += rule.rule.callback(rule, {
                openItems: openItems,
                previousBR: previousBR,
              });
            } else {
              if (openItems[0] === "UnorderedListElem") {
                // The other one was open!
                outputs += "</ul>";
                openItems.pop();
              }
              // We are just starting an ordered list
              openItems.push("OrderedListElem");
              outputs += "<ol>\n";
              outputs += rule.rule.callback(rule, {
                openItems: openItems,
                previousBR: previousBR,
              });
            }
          } else if (rule.rule.name === "UnorderedListElem") {
            // If the next item is a an un-ordered list element
            if (openItems[0] === "UnorderedListElem") {
              // If we are in the middle of an un-ordered list
              outputs += rule.rule.callback(rule, {
                openItems: openItems,
                previousBR: previousBR,
              });
            } else {
              if (openItems[0] === "OrderedListElem") {
                // The other one was open!
                outputs += "</ol>";
                openItems.pop();
              }
              // We are just starting an un-ordered list
              openItems.push("UnorderedListElem");
              outputs += "<ul>\n";
              outputs += rule.rule.callback(rule, {
                openItems: openItems,
                previousBR: previousBR,
              });
            }
          } else if (rule.rule.name === "Prog") {
            // We could be in between
            outputs += rule.rule.callback(rule, {
              openItems: openItems,
              previousBR: previousBR,
            });
          } else {
            // We are in the middle of neither

            // Check if we have possibly switched off one to the other
            switch (openItems[0]) {
              case "UnorderedListElem":
                openItems.pop();
                outputs += "</ul>";
                outputs += rule.rule.callback(rule, {
                  openItems: openItems,
                  previousBR: previousBR,
                });
                break;
              case "OrderedListElem":
                openItems.pop();
                outputs += "</ol>";
                outputs += rule.rule.callback(rule, {
                  openItems: openItems,
                  previousBR: previousBR,
                });
                break;

              default:
                outputs += rule.rule.callback(rule, {
                  openItems: openItems,
                  previousBR: previousBR,
                });
                break;
            }
          }
        } else if (rule.rule.type === "Token" && rule.rule.name === "BR") {
          // We are a BR
          if (previousBR === true) {
            // Add a break
            outputs += "<br>";
            previousBR = false;
            continue;
          } else {
            // We have not seen a previous BR, so set flag
            previousBR = true;
            continue;
          }
        } else {
          throw new Error(
            `ERROR: Prog should never encounter a raw token, but did: '${rule.rule.name}'`
          );
        }
      }
      return outputs;
    },
  },
];

export const Interpret = (str: string): string => {
  const tokens = Tokenize(str, token_desc_list);
  const progRule = gram.find((val) => val.name === "Prog");
  if (progRule) {
    const ruleRes = Parser(4, tokens, gram, progRule);
    if (ruleRes && ruleRes.rule.type === "Rule") {
      return ruleRes.rule.callback(ruleRes, { openItems: [] });
    } else {
      throw new Error("Return of parser failed");
    }
  } else {
    throw new Error("Could not interpret markup");
  }
};
