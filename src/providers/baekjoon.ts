import { parse as parseDOM } from "node-html-parser";

import { BaseProvider } from "./base";
import { Challenge } from "../types";

export class BaekjoonProvider extends BaseProvider {
    private readonly urlRegex = /^https?:\/\/(www\.)?acmicpc\.net\/problem\/([0-9]*?)$/;

    public checkUrl(url: string) {
        return this.urlRegex.test(url);
    }

    public async retrieve(url: string): Promise<Challenge> {
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

        return {
            title: titleDOM.textContent.trim(),
            description: descriptionDOM.textContent.trim(),
            inputDescription: inputDescriptionDOM.textContent.trim(),
            outputDescription: outputDescriptionDOM.textContent.trim(),
            input: ioText.filter(([i]) => i).map(([, t]) => t),
            output: ioText.filter(([i]) => !i).map(([, t]) => t),
        };
    }
}
