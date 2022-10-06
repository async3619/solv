import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as yaml from "yaml";

import { BaseProvider } from "../providers/base";
import { Challenge } from "./types";
import { getVersion } from "./cli";

const CACHE_DIR = path.join(os.homedir(), ".solv", "caches");

export type CachedChallenge = Omit<Challenge, "provider"> & { version: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stripFields({ provider, ...rest }: Challenge) {
    return { ...rest };
}

export async function retrieveChallenge(
    url: string,
    provider: BaseProvider,
    noCache = false,
    cacheDir: string = CACHE_DIR,
): Promise<Challenge> {
    if (noCache) {
        return provider.retrieve(url);
    } else {
        const targetPath = path.join(CACHE_DIR, `${provider.getName().toLowerCase()}_${provider.getId(url)}.yml`);
        await fs.ensureDir(cacheDir);

        if (!fs.existsSync(targetPath)) {
            const challenge = await provider.retrieve(url);
            const cachedChallenge: CachedChallenge = {
                ...stripFields(challenge),
                version: getVersion(),
            };

            await fs.writeFile(targetPath, yaml.stringify(cachedChallenge));
            return challenge;
        } else {
            const content = await fs.readFile(targetPath).then(buf => buf.toString());
            const challenge: CachedChallenge = yaml.parse(content);
            if (challenge.version !== getVersion()) {
                await fs.unlink(targetPath);
                return retrieveChallenge(url, provider, noCache, cacheDir);
            }

            return provider.hydrateCache(challenge);
        }
    }
}
