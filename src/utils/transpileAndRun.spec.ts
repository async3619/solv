import * as fs from "fs-extra";

import { BaekjoonProvider } from "../providers/baekjoon";
import { transpileAndRun } from "./transpileAndRun";

describe("transpileAndRun", () => {
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

        const result = await transpileAndRun("Test", "Hello World!", "__MOCKED__", new BaekjoonProvider());
        expect(result).toStrictEqual(["Hello World!", "Debug message."]);
    });

    it("should pass given input data to code context", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () =>
            Promise.resolve(`
function solution(input: string[]) {
    console.log(input);
}

(callback => {
    if (typeof process !== "undefined" && "env" in process && "arguments" in process.env && process.env.arguments) {
        solution(process.env.arguments.split("\\n"));
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
        `);

        expect(await transpileAndRun("Test", "Hello World!", "__MOCKED__", new BaekjoonProvider())).toMatchSnapshot();
    });

    it("should catches error", async () => {
        jest.mock("fs-extra");
        (fs.readFile as any) = () => Promise.resolve(`throw new Error("Test error")`);

        const result = await transpileAndRun("Test", "Hello World!", "__MOCKED__", new BaekjoonProvider());
        expect(result).toMatchSnapshot();
    });
});
