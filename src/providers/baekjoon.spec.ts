import fetch from "node-fetch";
import * as fs from "fs-extra";
import * as path from "path";

import { BaekjoonProvider } from "./baekjoon";

describe("Baekjoon Provider", () => {
    it("should determine valid url", () => {
        const provider = new BaekjoonProvider();
        expect(provider.checkUrl("https://www.acmicpc.net/problem/1018")).toBeTruthy();
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
            response: string,
            message: string,
            url = "https://www.acmicpc.net/problem/1018",
        ) => {
            const originalFetch = fetch;
            (fetch as any) = jest.fn().mockResolvedValue({
                ok: true,
                text() {
                    return Promise.resolve(response);
                },
            });

            await expect(provider.retrieve(url)).rejects.toThrow(message);

            (fetch as any) = originalFetch;
        };

        await runTestWithMockedResponse("", "Failed to parse challenge information.");
        await runTestWithMockedResponse(
            await fs.readFile(path.join(__dirname, "./__snapshots__/baekjoon.0.html")).then(res => res.toString()),
            "Failed to retrieve challenge id.",
            "https://www.acmicpc.net/problem/",
        );
    });

    it("should parse challenge information from url properly", async () => {
        const provider = new BaekjoonProvider();
        const challenge = await provider.retrieve("https://www.acmicpc.net/problem/1018");

        expect(challenge).toMatchSnapshot();
    });
});
