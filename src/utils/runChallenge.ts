import * as Listr from "listr";
import * as chalk from "chalk";

import { breakLine, drawLine } from "../cli";
import { Challenge, InputType } from "../types";

import { BaseProvider } from "../providers/base";

import { TestCaseFailedError } from "./TestCaseFailedError";
import { transpileAndRun } from "./transpileAndRun";
import { serialize } from "./serialize";

function renderSection(title: string, content: InputType, chalkFunction: (target: string) => string) {
    let contentText: string | null;
    if (Array.isArray(content)) {
        contentText = content.map(item => serialize(JSON.parse(item))).join(" ");
    } else {
        contentText = content;
    }

    console.info(title);
    drawLine(15);
    console.info(chalkFunction(contentText || chalk.italic("(empty)")));
    breakLine();
}

async function runTestCase(
    index: number,
    input: InputType,
    output: string,
    targetPath: string,
    provider: BaseProvider,
) {
    try {
        const result = await transpileAndRun(input, output, targetPath, provider);
        if (result !== output) {
            throw new TestCaseFailedError(index, result);
        }
    } catch (e) {
        if (e instanceof TestCaseFailedError) {
            throw e;
        } else if (e instanceof Error) {
            throw new TestCaseFailedError(index, (e as any).stderr || e.message, "Test case failed with an error");
        }
    }
}

export async function runChallenge(challenge: Challenge, targetPath: string) {
    breakLine();

    let currentTestCaseIndex = 0;
    const instance = new Listr(
        challenge.input.map((_, index) => ({
            title: `Running with test case #${index + 1}`,
            task: () =>
                runTestCase(index, challenge.input[index], challenge.output[index], targetPath, challenge.provider),
        })),
    );

    try {
        await instance.run();
    } catch (e) {
        let result = "";
        if (e instanceof TestCaseFailedError) {
            currentTestCaseIndex = e.testCaseIndex;
            result = e.result;
        } else if (e instanceof Error) {
            if ("stderr" in e) {
                result = (e as any).stderr;
            } else {
                result = e.message;
            }
        }

        const input = challenge.input[currentTestCaseIndex];
        const output = challenge.output[currentTestCaseIndex];

        breakLine(2);
        renderSection("Input", input, chalk.cyan);
        renderSection("Output (expected)", output, chalk.green);
        renderSection("Output", result, chalk.red);
    }
}
