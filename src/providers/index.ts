import { BaseProvider } from "./base";

import { BaekjoonProvider } from "./baekjoon";
import { ProgrammersProvider } from "./programmers";

export const TARGET_PROVIDERS: BaseProvider[] = [new BaekjoonProvider(), new ProgrammersProvider()];
