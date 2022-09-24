import * as chalk from "chalk";
import * as path from "path";
import * as fs from "fs-extra";
import * as chokidar from "chokidar";

import { program, ActionParameters } from "@caporal/core";

import { TARGET_PROVIDERS } from "./providers";
import { breakLine, clearConsole, drawLine, drawLogo } from "./cli";
import logger from "./logger";

import { truncate } from "./utils/truncate";
import { runChallenge } from "./utils/runChallenge";

async function main({ args }: ActionParameters) {
    try {
        clearConsole();
        drawLogo();
        breakLine();
        drawLine(35);
        breakLine();

        const targetUrl = args.url as string;
        const targetPath = path.join(process.cwd(), args.path as string);
        const isTypescript = path.extname(targetPath) === ".ts";

        logger.info(`accepted url: ${targetUrl}`);
        logger.info(`accepted file path: ${targetPath}`);
        logger.info(`is accepted file typescript? ${isTypescript ? "true" : "false"}`);

        for (const provider of TARGET_PROVIDERS) {
            if (!provider.checkUrl(targetUrl)) {
                continue;
            }

            logger.info(`it seems a code challenge of \`${chalk.yellow(provider.getName())}\` service.`);
            logger.info("trying to fetch and parse challenge information...");

            const challenge = await provider.retrieve(targetUrl);
            const { title, description } = challenge;

            logger.info("successfully retrieved challenge information:");
            logger.info(` - title: ${truncate(title, 100)}`);
            if (description) {
                logger.info(` - description: ${truncate(description, 100).replace(/\n/g, "")}`);
            }

            logger.info(` - for more information, you can visit: ${targetUrl}`);
            logger.info(`now start watching changes of '${targetPath}' ...`);

            if (!fs.existsSync(targetPath)) {
                throw new Error(`Given file path '${targetPath}' doesn't exists.`);
            }

            await runChallenge(challenge, targetPath);
            const watcher = chokidar.watch(targetPath);

            watcher
                .on("change", () => {
                    clearConsole();
                    logger.info("File change detected, now trying to transpile and execute:");

                    runChallenge(challenge, targetPath).then();
                })
                .on("delete", () => {
                    logger.error(`'${targetPath}' seems to be deleted.`);
                    watcher.close();
                });
        }
    } catch (e) {
        if (!(e instanceof Error)) {
            throw e;
        }

        logger.error(e.message);
    }
}

program.argument("<path>", "Target source file to watch").argument("<url>", "Target website url to solve").action(main);

program.run().then();
