import * as chalk from "chalk";
import * as path from "path";
import * as fs from "fs-extra";
import * as chokidar from "chokidar";
import * as prompts from "prompts";

import { program, ActionParameters } from "@caporal/core";

import { TARGET_PROVIDERS } from "./providers";
import { breakLine, clearConsole, drawLine, drawLogo } from "./cli";
import logger from "./logger";

import { truncate } from "./utils/truncate";
import { runChallenge } from "./utils/runChallenge";

async function main({ args, options: { source } }: ActionParameters) {
    try {
        clearConsole();
        drawLogo();
        breakLine();
        drawLine(35);
        breakLine();

        const targetUrl = args.url as string;
        const provider = TARGET_PROVIDERS.find(provider => provider.checkUrl(targetUrl));
        if (!provider) {
            logger.warn("there was no matched coding challenge service on records. abort.");
            return;
        }

        logger.info(`it seems a code challenge of \`${chalk.yellow(provider.getName())}\` service.`);
        logger.info("trying to fetch and parse challenge information...");

        const challenge = await provider.retrieve(targetUrl);
        const { title, description } = challenge;

        let targetPath: string;
        if (source) {
            targetPath = source as string;
            targetPath = path.isAbsolute(targetPath) ? targetPath : path.join(process.cwd(), targetPath);
        } else {
            targetPath = path.join(process.cwd(), `./${provider.getName().toLowerCase()}_${challenge.id}.ts`);
        }

        logger.info(`use following url: ${targetUrl}`);
        logger.info(`use following source code path: ${targetPath}`);

        if (fs.existsSync(targetPath)) {
            const { overwrite } = await prompts({
                type: "confirm",
                name: "overwrite",
                message: `Given source file '${targetPath}' seems already existing, overwrite it?`,
                initial: true,
            });

            if (overwrite) {
                await fs.unlink(targetPath);
                await fs.writeFile(targetPath, challenge.initialCode || "");
            }
        } else {
            await fs.writeFile(targetPath, challenge.initialCode || "");
        }

        logger.info("successfully retrieved challenge information:");
        logger.info(` - title: ${truncate(title, 100)}`);
        if (description) {
            logger.info(` - description: ${truncate(description, 100).replace(/\n/g, "")}`);
        }

        logger.info(` - for more information, you can visit: ${targetUrl}`);
        logger.info(`now start watching changes of '${targetPath}' ...`);

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
    } catch (e) {
        if (!(e instanceof Error)) {
            throw e;
        }

        logger.error(e.message);
        console.error(e.stack);
    }
}

program
    .argument("<url>", "Specify a website url to solve")
    .option("--source, -s <path>", "Specify source code path to watch", {
        required: false,
    })
    .action(main);

program.run().then();