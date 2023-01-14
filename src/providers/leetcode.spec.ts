import { LeetCodeProvider } from "./leetcode";
import { CombinedError } from "@urql/core";

describe("LeetCode Provider", function () {
    let provider: LeetCodeProvider;

    beforeEach(function () {
        provider = new LeetCodeProvider();
    });

    it("should determine valid url", function () {
        expect(provider.checkUrl("https://leetcode.com/problems/valid-parentheses/")).toBeTruthy();
    });

    it("should determine invalid url", function () {
        expect(provider.checkUrl("https://leetcode.com/problems/")).toBeFalsy();
        expect(provider.checkUrl("https://leetcode.com/")).toBeFalsy();
    });

    it("should get id from url", function () {
        expect(provider.getId("https://leetcode.com/problems/valid-parentheses/")).toBe("valid-parentheses");
    });

    it("should throw error when trying to get id from invalid url", function () {
        expect(() => provider.getId("https://leetcode.com/problems/")).toThrow();
    });

    it("should fetch problem information", async function () {
        const problem = await provider.retrieve("https://leetcode.com/problems/valid-parentheses/");

        expect({
            ...problem,
            provider: null,
        }).toMatchSnapshot();
    });

    it("should throw error when trying to fetch problem information from invalid url", async function () {
        await expect(provider.retrieve("https://leetcode.com/problems/")).rejects.toThrow();
    });

    it("should throw error when trying to fetch problem information from invalid problem", async function () {
        await expect(provider.retrieve("https://leetcode.com/problems/invalid-problem/")).rejects.toThrow();
    });

    it("should throw error when network error occurs", async function () {
        Object.defineProperty(provider, "client", {
            // mock urql client
            value: {
                query: () => ({
                    toPromise: () => Promise.reject(new Error("Network error")),
                }),
            },
        });

        await expect(provider.retrieve("https://leetcode.com/problems/valid-parentheses/")).rejects.toThrow();

        Object.defineProperty(provider, "client", {
            // mock urql client
            value: {
                query: () => ({
                    toPromise: () =>
                        Promise.reject(
                            new CombinedError({
                                networkError: new Error("Network error"),
                            }),
                        ),
                }),
            },
        });

        await expect(provider.retrieve("https://leetcode.com/problems/valid-parentheses/")).rejects.toThrow();
    });

    it("should bootstrap source code before executing", async function () {
        const problem = await provider.retrieve("https://leetcode.com/problems/valid-parentheses/");
        const functionName = "thisIsFunctionName";

        problem.initialCode = `function ${functionName}() {}`;

        const sourceCode = provider.beforeExecute("// this is source code", [], problem);
        expect(sourceCode).toBe(
            ["// this is source code", "console.info(thisIsFunctionName(...global.input))"].join("\n\n"),
        );
    });
});
