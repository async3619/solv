import { truncate } from "./truncate";

describe("truncate", () => {
    it("should truncates string properly", () => {
        const string = new Array(151).fill("*").join("");
        const short = new Array(100).fill("*").join("");

        expect(truncate(string, 150)).toBe(`${string.slice(0, 150)}...`);
        expect(truncate(short, 150)).toBe(short);
    });
});
