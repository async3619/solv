import { parse as parseDOM } from "node-html-parser";

import { BaseProvider } from "./base";

import { findSiblingElement } from "../utils/findSiblingElement";
import { parseSampleTable } from "../utils/parseSampleTable";
import { Challenge } from "../utils/types";

export class ProgrammersProvider extends BaseProvider {
    public constructor() {
        super(false);
    }

    public checkUrl(url: string): boolean {
        return /(https?:\/\/)?(school\.)?programmers\.co\.kr\/learn\/courses\/([0-9]*?)\/lessons\/[0-9]([0-9]*?)$/.test(
            url,
        );
    }

    public serializeOutput(outputItem: any): string {
        return typeof outputItem === "string" ? `"${outputItem}"` : JSON.stringify(outputItem);
    }

    public beforeExecute(sourceCode: string): string {
        return [sourceCode, `console.info(solution(...global.input))`].join("\n\n");
    }

    public async retrieve(url: string): Promise<Challenge> {
        const targetUrl = new URL(url);
        targetUrl.searchParams.set("language", "javascript");

        const htmlCode = await this.fetch(targetUrl.toString());

        const document = parseDOM(htmlCode);
        const descriptionDOM = document.querySelector("#tour2 > div > div");
        const titleDOM = document.querySelector("#tab > li");
        if (!titleDOM?.textContent || !descriptionDOM?.textContent) {
            throw new Error("Failed to parse challenge information.");
        }

        const headers = document.querySelectorAll(".guide-section h5");
        const ioSampleHeaderRegex = /^입출력 ?예$/;
        const ioSampleHeaderDOM = headers.find(header => ioSampleHeaderRegex.test(header.textContent.trim()));
        if (!ioSampleHeaderDOM) {
            throw new Error("Failed to parse challenge input / output samples.");
        }

        const ioSampleTable = findSiblingElement(ioSampleHeaderDOM, node => node.tagName === "TABLE");
        if (!ioSampleTable) {
            throw new Error("Failed to find challenge output sample table.");
        }

        const initialCode = document
            .querySelector(`input[type="hidden"][name^="initial_code_"]`)
            ?.getAttribute("value");

        if (!initialCode) {
            throw new Error("Failed to parse initial code information.");
        }

        const id = targetUrl.pathname.split("/").at(-1);
        if (!id) {
            throw new Error("Failed to retrieve challenge id.");
        }

        return {
            ...parseSampleTable(ioSampleTable),
            id,
            title: titleDOM.textContent.trim(),
            description: descriptionDOM.textContent.trim(),
            provider: this,
            initialCode,
        };
    }
}
