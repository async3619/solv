import * as fs from "fs-extra";
import * as yaml from "yaml";
import * as path from "path";

import { CachedChallenge, retrieveChallenge } from "./retrieveChallenge";

import { BaekjoonProvider } from "../providers/baekjoon";

describe("retrieveChallenge", () => {
    it("should retrieves challenge information correctly", async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { provider, ...data } = await retrieveChallenge(
            "https://www.acmicpc.net/problem/1018",
            new BaekjoonProvider(),
            true,
        );

        expect(data).toMatchSnapshot();
    });

    it("should creates cache for challenge information", async () => {
        jest.mock("fs-extra");

        let saved = false;
        (fs.writeFile as any) = async () => {
            saved = true;
        };
        (fs.ensureDir as any) = () => Promise.resolve();
        (fs.existsSync as any) = () => false;

        await retrieveChallenge("https://www.acmicpc.net/problem/1018", new BaekjoonProvider());
        expect(saved).toBeTruthy();
    });

    it("should reads cache if there was a valid cache file", async () => {
        jest.mock("fs-extra");

        let read = false;
        const readFile = fs.readFile;
        (fs.readFile as any) = () => {
            read = true;
            return readFile(path.join(__dirname, "__snapshots__", "cache.yml"));
        };
        (fs.ensureDir as any) = () => Promise.resolve();
        (fs.existsSync as any) = () => true;

        const data = await retrieveChallenge("https://www.acmicpc.net/problem/1018", new BaekjoonProvider());

        expect(read).toBeTruthy();
        expect(data.provider.getName()).toBe("Baekjoon");

        (fs.readFile as any) = readFile;
    });

    it("should invalidates cache if cache version is not matched", async () => {
        jest.mock("fs-extra");

        let unlinked = false;
        const readFile = fs.readFile;
        (fs.readFile as any) = async () => {
            const data = await readFile(path.join(__dirname, "__snapshots__", "cache.yml")).then(buf => buf.toString());
            const cache: CachedChallenge = yaml.parse(data);
            cache.version = "0.0.0";

            return Buffer.from(yaml.stringify(cache));
        };
        (fs.ensureDir as any) = () => Promise.resolve();
        (fs.unlink as any) = () => (unlinked = true);
        (fs.existsSync as any) = () => !unlinked;

        await retrieveChallenge("https://www.acmicpc.net/problem/1018", new BaekjoonProvider());
        expect(unlinked).toBeTruthy();
    });
});
