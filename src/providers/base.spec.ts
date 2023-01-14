import fetch from "node-fetch";

import { BaekjoonProvider } from "./baekjoon";

describe("Base Provider", () => {
    it("should serialize output properly", () => {
        const provider = new BaekjoonProvider();
        expect(typeof provider.serializeOutput(123)).toBe("string");
        expect(provider.serializeOutput([1, 2, 3])).toBe("[1,2,3]");
        expect(provider.serializeOutput("123")).toBe("123");
    });

    it("should modify source code before run properly", () => {
        const provider = new BaekjoonProvider();
        expect(provider.beforeExecute("123", "123", {} as any)).toBe("123");
    });

    it("should throws an error when it failed to fetch url", async () => {
        const originalFetch = fetch;
        (fetch as any) = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
            statusText: "Not Found",
        });

        await expect(new BaekjoonProvider().retrieve("https://www.acmicpc.net/problem/1018")).rejects.toThrow(
            `Failed to fetch (404) - Not Found`,
        );

        (fetch as any) = originalFetch;
    });
});
