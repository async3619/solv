import * as chalk from "chalk";
import * as fs from "fs-extra";
import * as chokidar from "chokidar";
import * as prompts from "prompts";
import * as yaml from "yaml";

import { getProvider } from "./providers";

import { breakLine, clearConsole, drawLine, drawLogo, parseCommandLine } from "./utils/cli";
import { normalizeFilePath } from "./utils/normalizeFilePath";
import { retrieveChallenge } from "./utils/retrieveChallenge";
import { runChallenge } from "./utils/runChallenge";
import { Config } from "./utils/types";
import { truncate } from "./utils/truncate";
import logger from "./utils/logger";

async function main() {
    const { targetUrl, configPath, noCache, noOverwrite, source, noTranspile } = await parseCommandLine(process.argv);

    try {
        drawLogo();
        breakLine();
        drawLine(35);
        breakLine();

        const provider = getProvider(targetUrl);
        logger.info(`it seems a code challenge of \`${chalk.yellow(provider.getName())}\` service.`);
        logger.info("trying to fetch and parse challenge information...");

        const challenge = await retrieveChallenge(targetUrl, provider, noCache);
        const { title, description, id, initialCode } = await retrieveChallenge(targetUrl, provider, noCache);
        const targetPath = normalizeFilePath(source || `./${provider.getName().toLowerCase()}_${id}.ts`);
        logger.info(`use following url: ${targetUrl}`);
        logger.info(`use following source code path: ${targetPath}`);

        let config: Config | null = null;
        const configFilePath = normalizeFilePath(configPath || "./.solv.yml");
        if (fs.existsSync(configFilePath)) {
            logger.info(`use custom configuration file: ${configFilePath}`);

            const configData = await fs.readFile(configFilePath).then(res => res.toString());
            config = yaml.parse(configData);
        }

        if (fs.existsSync(targetPath)) {
            if (!noOverwrite) {
                const { overwrite } = await prompts({
                    type: "confirm",
                    name: "overwrite",
                    message: `Given source file '${targetPath}' seems already existing, overwrite it?`,
                    initial: true,
                });

                if (overwrite) {
                    await fs.unlink(targetPath);
                    await fs.writeFile(targetPath, initialCode || "");
                }
            }
        } else {
            await fs.writeFile(targetPath, initialCode || "");
        }

        logger.info("successfully retrieved challenge information:");
        logger.info(` - title: ${truncate(title, 100)}`);
        if (description) {
            logger.info(` - description: ${truncate(description, 100).replace(/\n/g, "")}`);
        }

        logger.info(` - for more information, you can visit: ${targetUrl}`);
        logger.info(`now start watching changes of '${targetPath}' ...`);

        await runChallenge(challenge, targetPath, config, noTranspile);
        const watcher = chokidar.watch(targetPath);

        watcher
            .on("change", () => {
                clearConsole();
                logger.info("File change detected, now trying to transpile and execute:");

                runChallenge(challenge, targetPath, config, noTranspile).then();
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
        if (e.stack) {
            console.error(e.stack.split("\n").slice(1).join("\n"));
        }
    }
}

main();
