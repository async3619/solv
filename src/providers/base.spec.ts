import { BaekjoonProvider } from "./baekjoon";

describe("Base Provider", () => {
    it("should serialize output properly", () => {
        const provider = new BaekjoonProvider();
        expect(typeof provider.serializeOutput(123)).toBe("string");
        expect(provider.serializeOutput([1, 2, 3])).toBe("[1,2,3]");
    });

    it("should modify source code before run properly", () => {
        const provider = new BaekjoonProvider();
        expect(provider.beforeExecute("123", "123")).toBe("123");
    });
});
