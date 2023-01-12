import { assertParse, is } from "typia";
import { parse as parseDOM } from "node-html-parser";
import { Client, CombinedError, createClient } from "@urql/core";
import { stripHtml } from "string-strip-html";

import { BaseProvider } from "./base";

import { Challenge, InputType } from "../utils/types";
import { LeetCodeQuestionDocument } from "../queries/leetcode";
import type { LeetCodeQuestionQuery, LeetCodeQuestionQueryVariables } from "../queries.data";
import { QuestionMetadata } from "./leetcode.types";

const URL_CHECK_REGEX = /(https?:\/\/)?leetcode\.com\/problems\/([a-z0-9-]+)\/?$/;

export class LeetCodeProvider extends BaseProvider {
    private readonly client: Client;

    public constructor() {
        super(false);

        this.client = createClient({
            url: "https://leetcode.com/graphql",
            requestPolicy: "network-only",
            fetchOptions: () => {
                return {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                    },
                };
            },
        });
    }

    public checkUrl(url: string): boolean {
        return URL_CHECK_REGEX.test(url);
    }

    public getId(url: string): string | number {
        const match = URL_CHECK_REGEX.exec(url);
        if (!match) {
            throw new Error("Failed to parse challenge ID.");
        }

        return match[2];
    }

    public beforeExecute(sourceCode: string, input: InputType, challenge: Challenge): string {
        let entryPointName = "solution";
        if (challenge.initialCode) {
            const match = challenge.initialCode.match(/function ([a-zA-Z0-9]+)\(/);
            if (match) {
                entryPointName = match[1];
            }
        }

        return [sourceCode, `console.info(${entryPointName}(...global.input))`].join("\n\n");
    }

    public async retrieve(url: string): Promise<Challenge> {
        const titleSlug = this.getId(url);
        if (!is<string>(titleSlug)) {
            throw new Error("Failed to parse challenge ID.");
        }

        try {
            const { error, data } = await this.client
                .query<LeetCodeQuestionQuery, LeetCodeQuestionQueryVariables>(LeetCodeQuestionDocument, { titleSlug })
                .toPromise();

            if (error) {
                throw error;
            }

            if (!data?.question) {
                throw new Error("Failed to retrieve challenge data.");
            }

            const codeSnippet = data.question.codeSnippets.find(item => item.langSlug === "typescript");
            if (!codeSnippet) {
                throw new Error("This challenge does not support TypeScript.");
            }

            const document = parseDOM(data.question.content);
            const testCases = [...document.querySelectorAll("pre")].filter(item => {
                if (!item.parentNode) {
                    return false;
                }

                if (!item.previousElementSibling) {
                    return false;
                }

                const title = item.previousElementSibling.querySelector("strong.example");
                if (!title) {
                    return false;
                }

                return true;
            });

            const metadata = assertParse<QuestionMetadata>(data.question.metaData);
            const testCaseSummaries = testCases.map(item => stripHtml(item.textContent.trim()).result);
            const inputs: InputType[] = [];
            const outputs: string[] = [];
            for (const summary of testCaseSummaries) {
                const [input, output] = summary.split("\n").map(item => {
                    return item.trim().replace(/^[A-Za-z]*?: /, "");
                });

                const inputParameters = input.split(/, /).map(item => item.split(" = "));
                const data: InputType = [];
                for (const [key, value] of inputParameters) {
                    const index = metadata.params.findIndex(item => item.name === key);
                    if (index === -1) {
                        throw new Error(`Failed to find parameter "${key}".`);
                    }

                    data[index] = value;
                }

                inputs.push(data);
                outputs.push(output.replace("Output: ", ""));
            }

            return {
                id: data.question.questionId,
                title: data.question.questionTitle,
                description: stripHtml(data.question.content).result,
                provider: this,
                initialCode: codeSnippet.code,
                input: inputs,
                output: outputs,
            };
        } catch (e) {
            if (e instanceof CombinedError) {
                if (e.networkError) {
                    throw e.networkError;
                } else if (e.graphQLErrors && e.graphQLErrors.length > 0) {
                    throw e.graphQLErrors[0];
                }
            }

            throw e;
        }
    }
}
