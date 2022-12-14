import { parse as parseDOM } from "node-html-parser";
import { decode } from "html-entities";

import { Challenge } from "../utils/types";

import { BaseProvider } from "./base";

const INITIAL_CODE = `
function solution(input: string[]) {
    // ...
}

solution((global?.process?.env?.arguments || require("fs").readFileSync("/dev/stdin").toString()).trim().split("\\n"));
`.trim();

export class BaekjoonProvider extends BaseProvider {
    private readonly urlRegex = /^https?:\/\/(www\.)?acmicpc\.net\/problem\/[1-9]([0-9]*)$/;

    public constructor() {
        super(true);
    }

    public checkUrl(url: string) {
        return this.urlRegex.test(url);
    }
    public getId(url: string): string | number {
        const targetUrl = new URL(url);
        const id = targetUrl.pathname.split("/").slice(-1)[0];

        return parseInt(id);
    }

    public async retrieve(url: string): Promise<Challenge> {
        const targetUrl = new URL(url);
        const htmlCode = await this.fetch(url);
        const document = parseDOM(htmlCode);

        const titleDOM = document.querySelector("#problem_title");
        const descriptionDOM = document.querySelector("#problem_description");
        const inputDescriptionDOM = document.querySelector("#problem_input");
        const outputDescriptionDOM = document.querySelector("#problem_output");
        const ioItem = document.querySelectorAll(".sampledata");

        const ioText: [boolean, string][] = [];
        for (const item of ioItem) {
            ioText.push([item.id.includes("-input-"), item.innerHTML.trim()]);
        }

        if (
            !titleDOM?.textContent ||
            !descriptionDOM?.textContent ||
            !inputDescriptionDOM?.textContent ||
            !outputDescriptionDOM?.textContent
        ) {
            throw new Error("Failed to parse challenge information.");
        }

        const id = targetUrl.pathname.split("/").slice(-1)[0];
        if (!id) {
            throw new Error("Failed to retrieve challenge id.");
        }

        return {
            id,
            title: titleDOM.textContent.trim(),
            description: descriptionDOM.textContent.trim(),
            inputDescription: inputDescriptionDOM.textContent.trim(),
            outputDescription: outputDescriptionDOM.textContent.trim(),
            input: ioText.filter(([i]) => i).map(([, t]) => t),
            output: ioText.filter(([i]) => !i).map(([, t]) => decode(t).replace(/\r\n/g, "\n")),
            provider: this,
            initialCode: INITIAL_CODE,
        };
    }
}
