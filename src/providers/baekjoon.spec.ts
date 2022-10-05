import fetch from "node-fetch";
import * as fs from "fs-extra";
import * as path from "path";

import { BaekjoonProvider } from "./baekjoon";

describe("Baekjoon Provider", () => {
    it("should determine valid url", () => {
        const provider = new BaekjoonProvider();
        expect(provider.checkUrl("https://www.acmicpc.net/problem/1018")).toBeTruthy();
    });

    it("should returns correct name", () => {
        const provider = new BaekjoonProvider();
        expect(provider.getName()).toBe("Baekjoon");
    });

    it("should determine invalid url", () => {
        const provider = new BaekjoonProvider();

        expect(provider.checkUrl("https://www.acmicpc.net/1018")).toBeFalsy();
        expect(provider.checkUrl("https://www.acmicpc.net/p/1018")).toBeFalsy();
        expect(provider.checkUrl("https://www.acmicpc.net/problem/")).toBeFalsy();
    });

    it("should fail to parse challenge information from url when its corrupted", async () => {
        jest.mock("node-fetch");

        const provider = new BaekjoonProvider();
        const runTestWithMockedResponse = async (
            filePath: string,
            message: string,
            url = "https://www.acmicpc.net/problem/1018",
        ) => {
            const originalFetch = fetch;
            (fetch as any) = jest.fn().mockResolvedValue({
                ok: true,
                text() {
                    return fs.readFile(path.join(__dirname, filePath)).then(res => res.toString());
                },
            });

            await expect(provider.retrieve(url)).rejects.toThrow(message);

            (fetch as any) = originalFetch;
        };

        const messages = [
            "Failed to parse challenge information.",
            "Failed to parse challenge information.",
            "Failed to parse challenge information.",
            "Failed to parse challenge information.",
            "Failed to retrieve challenge id.",
        ];

        for (let i = 0; i < messages.length; ++i) {
            await runTestWithMockedResponse(
                `./__snapshots__/baekjoon.${i}.html`,
                messages[i],
                "https://www.acmicpc.net/problem/",
            );
        }
    });

    it("should parse challenge information from url properly", async () => {
        const provider = new BaekjoonProvider();
        const challenge = await provider.retrieve("https://www.acmicpc.net/problem/1018");

        expect(challenge).toMatchSnapshot();
    });
});
