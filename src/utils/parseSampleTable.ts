import * as _ from "lodash";
import { HTMLElement, Node, NodeType } from "node-html-parser";
import { decode } from "html-entities";

import { Challenge } from "./types";

function getAllChildren(element: Node, tagName: string, depth = 0) {
    const result: Node[] = [element];
    for (const node of element.childNodes) {
        result.push(...getAllChildren(node, tagName, depth + 1));
    }

    return depth === 0
        ? _.chain(result)
              .filter(e => element !== e)
              .filter(e => e.nodeType === NodeType.ELEMENT_NODE)
              .filter(e => (e as HTMLElement).tagName === tagName)
              .value()
        : result;
}

export function parseSampleTable(table: HTMLElement): Pick<Challenge, "output" | "input"> {
    const head = table.querySelector("thead");
    const body = table.querySelector("tbody");
    if (!head || !body) {
        throw new Error("Given element is not a valid sample table object.");
    }

    const result: Pick<Challenge, "output" | "input"> = {
        input: [],
        output: [],
    };

    const columns = getAllChildren(head, "TH").map(node => node.textContent.trim());
    const rows = _.chain(getAllChildren(body, "TD"))
        .map(node => node.textContent.trim())
        .chunk(columns.length)
        .value();

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const inputValues: string[] = [];
        for (let j = 0; j < columns.length; j++) {
            if (j === columns.length - 1) {
                result.output.push(decode(row[j]));
                continue;
            }

            inputValues.push(row[j]);
        }

        result.input.push(inputValues);
    }

    return result;
}
