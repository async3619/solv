import * as Listr from "listr";
import * as chalk from "chalk";

import { Challenge, Config, InputOutput, InputType } from "./types";

import { BaseProvider } from "../providers/base";

import { breakLine, renderSection } from "./cli";
import { TestCaseFailedError } from "./TestCaseFailedError";
import { transpileAndRun } from "./transpileAndRun";
import { normalizeString } from "./normalizeString";

export async function runTestCase(
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

    const items: InputOutput[] = [];
    if (config) {
        const cases = config.cases
            .filter(
                ({ id, provider }) =>
                    id.toString() === challenge.id.toString() &&
                    challenge.provider.getName().toLowerCase() === provider,
            )
            .map(p => p.items)
            .flat();

        items.push(
            ...cases.map<InputOutput>(({ input, output }) => ({
                input: normalizeString(input),
                output: normalizeString(output),
                isCustom: true,
            })),
        );
    }

    items.push(
        ...challenge.input.map<InputOutput>((input, i) => ({
            input,
            output: challenge.output[i],
        })),
    );

    let currentTestCaseIndex = 0;
    const instance = new Listr([
        ...items.map(({ input, output, isCustom }, index) => ({
            title: `Running with ${isCustom ? "custom " : ""}test case #${index + 1}`,
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
        }

        const { input, output } = items[currentTestCaseIndex];

        breakLine(2);
        renderSection("Input", input, chalk.cyan);
        renderSection("Output (expected)", output, chalk.green);
        renderSection("Output", result[0], chalk.red);

        if (result.length > 1 && result[1]) {
            renderSection("Debug", result[1], chalk.magenta);
        }
    }
}
