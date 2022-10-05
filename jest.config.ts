import { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ["html", "json"],
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    testPathIgnorePatterns: ["<rootDir>/dist/"],
};

export = config;
