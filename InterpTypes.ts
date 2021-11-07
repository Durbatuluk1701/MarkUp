interface AbstractMarkUpNode {
    data: string;
    type: MarkupNodeType;
};

enum MarkupNodeType {
    H1 = "h1",
    H2 = "h2",
    H3 = "h3",
    P = "p",
    BR = "br",
};

export { AbstractMarkUpNode, MarkupNodeType };