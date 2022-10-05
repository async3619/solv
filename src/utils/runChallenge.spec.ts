import * as fs from "fs-extra";

import { BaekjoonProvider } from "../providers/baekjoon";

import { runChallenge, runTestCase } from "./runChallenge";

const SAMPLE_CODE = `
function solution(input: string[]) {
    console.log(input);
}

(callback => {
    if (typeof process !== "undefined" && "env" in process && "arguments" in process.env && process.env.arguments) {
        solution(process.env.arguments);
        return;
    }

    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const input: string[] = [];
    rl.on("line", line => {
        input.push(line);
    }).on("close", function () {
        callback(input);
        process.exit();
    });
})(solution);
`.trim();

describe("runTestCase", () => {
    it("should runs given source code file", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(SAMPLE_CODE);
        (fs.writeFile as any) = () => Promise.resolve();

        await runTestCase(0, "Test", "Test", "./test.ts", new BaekjoonProvider());
    });

    it("should throws an error when output is not match", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(SAMPLE_CODE);
        (fs.writeFile as any) = () => Promise.resolve();
        expect.assertions(1);

        await expect(runTestCase(0, "Test", "Wrong Answer", "./test.ts", new BaekjoonProvider())).rejects.toThrow(
            "Output was not matched with test case #1",
        );
    });

    it("should throws an error when given source thrown", async () => {
        jest.mock("fs-extra");

        (fs.readFile as any) = () =>
            Promise.resolve(`
                throw new Error("Test Error.");
            `);

        (fs.writeFile as any) = () => Promise.resolve();
        expect.assertions(1);

        await expect(runTestCase(0, "Test", "Wrong Answer", "./test.ts", new BaekjoonProvider())).rejects.toThrow(
            "Test case failed with an error",
        );
    });
});

describe("runChallenge", () => {
    const installHook = (code: string) => {
        const buffer: string[] = [];
        console.log = (content: string) => buffer.push(content);
        console.info = (content: string) => buffer.push(content);

        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(code);
        (fs.writeFile as any) = () => Promise.resolve();

        return buffer;
    };

    it("should runs given challenge properly", async () => {
        const buffer: string[] = installHook(SAMPLE_CODE);
        await runChallenge(
            {
                id: 0,
                title: "Test",
                provider: new BaekjoonProvider(),
                input: ["Test"],
                output: ["Output"],
            },
            "./test.ts",
            null,
        );

        expect(buffer.join("\n").replace(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]/g, "")).toMatchSnapshot();
    });

    it("should shows error message whenever test case throws an error", async () => {
        const buffer: string[] = installHook(`throw new Error("Test Error.");`);
        await runChallenge(
            {
                id: 0,
                title: "Test",
                provider: new BaekjoonProvider(),
                input: ["Test"],
                output: ["Output"],
            },
            "./test.ts",
            null,
        );

        expect(buffer.join("\n").replace(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]/g, "")).toMatchSnapshot();
    });

    it("should shows debug message whenever test case leave debugging log", async () => {
        const buffer: string[] = installHook(`console.debug("Test Log")`);
        await runChallenge(
            {
                id: 0,
                title: "Test",
                provider: new BaekjoonProvider(),
                input: ["Test"],
                output: ["Output"],
            },
            "./test.ts",
            null,
        );

        expect(buffer.join("\n").replace(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]/g, "")).toMatchSnapshot();
    });

    it("should runs custom test case only when its given", async () => {
        const buffer: string[] = installHook(SAMPLE_CODE);
        await runChallenge(
            {
                id: 0,
                title: "Test",
                provider: new BaekjoonProvider(),
                input: ["Test"],
                output: ["Output"],
            },
            "./test.ts",
            {
                cases: [
                    {
                        id: 0,
                        provider: "baekjoon",
                        items: [
                            {
                                input: "Test",
                                output: "Output",
                            },
                        ],
                    },
                ],
            },
        );

        expect(buffer.join("\n").replace(/\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]/g, "")).toMatchSnapshot();
    });
});
