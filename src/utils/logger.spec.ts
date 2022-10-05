import * as moment from "moment";
import * as chalk from "chalk";
import logger from "./logger";

describe("logger", () => {
    beforeEach(() => {
        (chalk.level as any) = 3;
    });

    it("should leaves a log depending on levels properly", async () => {
        const buffers: any[] = [];
        console.info = (...data: any[]) => buffers.push(...data);

        logger.info("Test", moment("2022-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss.SSS"));
        logger.error("Test", moment("2022-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss.SSS"));
        logger.warn("Test", moment("2022-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss.SSS"));

        expect(buffers).toMatchSnapshot();
    });

    it("should leaves a log without passing time data", async () => {
        const buffers: string[] = [];
        console.info = (...data: string[]) => buffers.push(...data);

        logger.info("Test");

        expect(buffers[0].includes("Test")).toBeTruthy();
    });
});
