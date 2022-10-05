import fetch from "node-fetch";
import * as fs from "fs-extra";
import * as path from "path";

import { ProgrammersProvider } from "./programmers";

describe("Programmers Provider", () => {
    it("should determine valid url", () => {
        const provider = new ProgrammersProvider();
        expect(provider.checkUrl("https://school.programmers.co.kr/learn/courses/30/lessons/12937")).toBeTruthy();
    });

    it("should returns correct name", () => {
        const provider = new ProgrammersProvider();
        expect(provider.getName()).toBe("Programmers");
    });

    it("should determine invalid url", () => {
        const provider = new ProgrammersProvider();

        expect(provider.checkUrl("https://school.programmers.co.kr/learn/courses/30/lessons/")).toBeFalsy();
        expect(provider.checkUrl("https://school.programmers.co.kr/learn/lessons/12937")).toBeFalsy();
        expect(provider.checkUrl("https://school.programmers.co.kr/lessons/12937")).toBeFalsy();
    });

    it("should serialize output value properly", function () {
        const provider = new ProgrammersProvider();
        expect(provider.serializeOutput(123)).toBe("123");
        expect(provider.serializeOutput("123")).toBe(`"123"`);
    });

    it("should modify source code before run properly", () => {
        const provider = new ProgrammersProvider();
        expect(provider.beforeExecute("")).toMatchSnapshot();
    });

    it("should fail to parse challenge information from url when its corrupted", async () => {
        jest.mock("node-fetch");

        const provider = new ProgrammersProvider();
        const runTestWithMockedResponse = async (
            response: string,
            message: string,
            url = "https://school.programmers.co.kr/learn/courses/30/lessons/12937",
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
            await fs.readFile(path.join(__dirname, "./__snapshots__/programmers.0.html")).then(res => res.toString()),
            "Failed to parse challenge input / output samples.",
        );
        await runTestWithMockedResponse(
            await fs.readFile(path.join(__dirname, "./__snapshots__/programmers.1.html")).then(res => res.toString()),
            "Failed to find challenge output sample table.",
        );
        await runTestWithMockedResponse(
            await fs.readFile(path.join(__dirname, "./__snapshots__/programmers.2.html")).then(res => res.toString()),
            "Failed to parse initial code information.",
        );
        await runTestWithMockedResponse(
            await fs.readFile(path.join(__dirname, "./__snapshots__/programmers.3.html")).then(res => res.toString()),
            "Failed to retrieve challenge id.",
            "https://school.programmers.co.kr/learn/courses/30/lessons/",
        );
    });

    it("should parse challenge information from url properly", async () => {
        jest.dontMock("node-fetch");

        const provider = new ProgrammersProvider();
        const challenge = await provider.retrieve("https://school.programmers.co.kr/learn/courses/30/lessons/12937");

        expect(challenge).toMatchSnapshot();
    });
});
