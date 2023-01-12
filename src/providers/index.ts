import { BaseProvider } from "./base";

import { BaekjoonProvider } from "./baekjoon";
import { ProgrammersProvider } from "./programmers";
import { LeetCodeProvider } from "./leetcode";

const TARGET_PROVIDERS: BaseProvider[] = [new BaekjoonProvider(), new ProgrammersProvider(), new LeetCodeProvider()];

export function getProvider(targetUrl: string) {
    const provider = TARGET_PROVIDERS.find(provider => provider.checkUrl(targetUrl));
    if (!provider) {
        throw new Error("there was no matched coding challenge service provider on records. abort.");
    }

    return provider;
}
