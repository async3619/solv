import * as listr from "listr";
import * as chalk from "chalk";

import { breakLine, drawLine } from "../cli";
import { Challenge } from "../types";

import { TestCaseFailedError } from "./TestCaseFailedError";
import { transpileAndRun } from "./transpileAndRun";

export async function runChallenge(challenge: Challenge, targetPath: string) {
    breakLine();

    let currentTestCaseIndex = 0;
    const instance = new listr(
        challenge.input.map((_, index) => ({
            title: `Running with test case #${index + 1}`,
            task: async () => {
                currentTestCaseIndex = index;
                try {
                    const { output, result } = await transpileAndRun(
                        challenge.input[index],
                        challenge.output[index],
                        targetPath,
                    );

                    if (result !== output) {
                        throw new TestCaseFailedError(index, result);
                    }
                } catch (e) {
                    if (e instanceof TestCaseFailedError) {
                        throw e;
                    } else if (e instanceof Error) {
                        throw new TestCaseFailedError(
                            index,
                            (e as any).stderr || e.message,
                            "Test case failed with an error",
                        );
                    }
                }
            },
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

        console.info("Input");
        drawLine(15);
        console.info(chalk.cyan(input));

        breakLine();

        console.info("Output (expected)");
        drawLine(15);
        console.info(chalk.green(output));

        breakLine();

        console.info("Output");
        drawLine(15);
        console.info(chalk.red(result));
    }
}
