import fetch from "node-fetch";
import * as fs from "fs-extra";
import * as path from "path";

import { ProgrammersProvider } from "./programmers";

describe("Programmers Provider", () => {
    it("should get valid id from url", function () {
        const provider = new ProgrammersProvider();
        expect(provider.getId("https://school.programmers.co.kr/learn/courses/30/lessons/12937")).toBe(12937);
    });

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
            filePath: string,
            message: string,
            url = "https://school.programmers.co.kr/learn/courses/30/lessons/12937",
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
            "Failed to parse challenge input / output samples.",
            "Failed to find challenge output sample table.",
            "Failed to parse initial code information.",
            "Failed to retrieve challenge id.",
            "Failed to parse challenge information.",
            "Failed to parse challenge information.",
        ];

        for (let i = 0; i < messages.length; i++) {
            await runTestWithMockedResponse(
                `./__snapshots__/programmers.${i}.html`,
                messages[i],
                "https://school.programmers.co.kr/learn/courses/30/lessons/",
            );
        }
    });

    it("should parse challenge information from url properly", async () => {
        jest.dontMock("node-fetch");

        const provider = new ProgrammersProvider();
        const challenge = await provider.retrieve("https://school.programmers.co.kr/learn/courses/30/lessons/12937");

        expect(challenge).toMatchSnapshot();
    });
});
