import * as util from "util";
import { serialize } from "./serialize";

describe("serialize", () => {
    it("should serializes string data", () => {
        expect(serialize("Test")).toBe("Test");
    });

    it("should serializes non-string data", () => {
        jest.mock("util");

        let lastData: any = null;
        (util.inspect as any) = (item: any) => (lastData = item);

        serialize(123);
        expect(lastData).toBe(123);
    });

    it("should serializes data with json flag set", () => {
        expect(serialize({}, true)).toBe("{}");
        expect(serialize(123, true)).toStrictEqual("123");
        expect(serialize("123", true)).toMatchSnapshot();
    });
});
