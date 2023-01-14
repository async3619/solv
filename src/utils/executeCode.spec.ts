import * as fs from "fs-extra";

import { BaekjoonProvider } from "../providers/baekjoon";
import { executeCode } from "./executeCode";

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

describe("executeCode", () => {
    it("should transpiles and runs given code properly", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () =>
            Promise.resolve(`
function foo(input: string[]) {
    console.log("Hello World!");
    console.debug("Debug message.");
}

foo([]);
        `);
        (fs.writeFile as any) = () => Promise.resolve();

        const result = await executeCode({} as any, "Test", "Hello World!", "__MOCKED__", new BaekjoonProvider());
        expect(result).toStrictEqual(["Hello World!", "Debug message."]);
    });

    it("should pass given input data to code context", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(SAMPLE_CODE);
        (fs.writeFile as any) = () => Promise.resolve();

        expect(
            await executeCode({} as any, "Test", "Hello World!", "__MOCKED__", new BaekjoonProvider()),
        ).toMatchSnapshot();
    });

    it("should pass JSON serialized input data", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(SAMPLE_CODE);
        (fs.writeFile as any) = () => Promise.resolve();

        expect(
            await executeCode({} as any, [`["Test", "Test2"]`], "Hello World!", "__MOCKED__", new BaekjoonProvider()),
        ).toMatchSnapshot();
    });

    it("should catches error", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(`throw new Error("Test error")`);
        (fs.writeFile as any) = () => Promise.resolve();

        const result = await executeCode({} as any, "Test", "Hello World!", "__MOCKED__", new BaekjoonProvider());
        expect(result).toMatchSnapshot();
    });
});
