import { normalizeFilePath } from "./normalizeFilePath";

describe("normalizeFilePath", () => {
    beforeAll(() => {
        process.cwd = () => {
            return "/home/";
        };
    });

    it("should normalize given file path", () => {
        expect(normalizeFilePath("./test.txt").replace(/\\/g, "/")).toBe("/home/test.txt");
    });

    it("should not normalize given file path if given path is absolute", () => {
        expect(normalizeFilePath("/home/test.txt")).toBe("/home/test.txt");
    });
});
