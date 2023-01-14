import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ["html", "json", "text"],
    collectCoverageFrom: [
        "!**/*.js",
        "src/**/*.ts",
        "!src/index.ts",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/bin/**",
    ],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    testPathIgnorePatterns: ["<rootDir>/dist/"],
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                compiler: "ttypescript",
            },
        ],
    },
};

export = config;
