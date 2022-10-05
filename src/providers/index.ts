import { BaseProvider } from "./base";

import { BaekjoonProvider } from "./baekjoon";
import { ProgrammersProvider } from "./programmers";

const TARGET_PROVIDERS: BaseProvider[] = [new BaekjoonProvider(), new ProgrammersProvider()];

export function getProvider(targetUrl: string) {
    const provider = TARGET_PROVIDERS.find(provider => provider.checkUrl(targetUrl));
    if (!provider) {
        throw new Error("there was no matched coding challenge service provider on records. abort.");
    }

    return provider;
}
