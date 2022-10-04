import * as Listr from "listr";
import * as chalk from "chalk";

import { breakLine, drawLine } from "../cli";
import { Challenge, Config, InputOutput, InputType } from "../types";

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
    isCustom = false,
) {
    try {
        const data = await transpileAndRun(input, output, targetPath, provider);
        if (data instanceof Error) {
            throw data;
        }

        if (data[0] !== output) {
            throw new TestCaseFailedError(index, data, undefined, isCustom);
        }
    } catch (e) {
        if (e instanceof TestCaseFailedError) {
            throw e;
        } else if (e instanceof Error) {
            throw new TestCaseFailedError(
                index,
                [(e as any).stderr || e.stack, ""],
                "Test case failed with an error",
                isCustom,
            );
        }
    }
}

export async function runChallenge(challenge: Challenge, targetPath: string, config: Config | null) {
    breakLine();

    const items = challenge.input.map<InputOutput>((input, i) => ({
        input,
        output: challenge.output[i],
    }));

    const customCases: InputOutput[] = [];
    if (config) {
        const cases = config.cases
            .filter(
                ({ id, provider }) =>
                    id.toString() === challenge.id.toString() &&
                    challenge.provider.getName().toLowerCase() === provider,
            )
            .map(p => p.items)
            .flat();

        customCases.push(
            ...cases.map<InputOutput>(({ input, output }) => ({
                input,
                output,
                isCustom: true,
            })),
        );
    }

    let currentTestCaseIndex = 0;
    const instance = new Listr([
        ...customCases.map(({ input, output, isCustom }, index) => ({
            title: `Running with custom test case #${index + 1}`,
            task: () => runTestCase(index, input, output, targetPath, challenge.provider, isCustom),
        })),
        ...items.map(({ input, output, isCustom }, index) => ({
            title: `Running with test case #${index + 1}`,
            task: () => runTestCase(index, input, output, targetPath, challenge.provider, isCustom),
        })),
    ]);

    try {
        await instance.run();
    } catch (e) {
        let result = [""];
        if (e instanceof TestCaseFailedError) {
            currentTestCaseIndex = e.testCaseIndex;
            result = e.result;
        } else if (e instanceof Error) {
            if ("stderr" in e) {
                result = (e as any).stderr;
            } else {
                result = [e.message];
            }
        }

        const input = challenge.input[currentTestCaseIndex];
        const output = challenge.output[currentTestCaseIndex];

        breakLine(2);
        renderSection("Input", input, chalk.cyan);
        renderSection("Output (expected)", output, chalk.green);
        renderSection("Output", result[0], chalk.red);

        if (result.length > 1 && result[1]) {
            renderSection("Debug", result[1], chalk.magenta);
        }
    }
}
