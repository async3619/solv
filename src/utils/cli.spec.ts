import * as chalk from "chalk";

import { parseCommandLine, drawLine, drawLogo, breakLine, clearConsole, renderSection } from "./cli";

describe("parseCommandLine", () => {
    it("should parse command line options properly", async () => {
        const data = await parseCommandLine([
            "",
            "solv",
            "-c",
            "./test/.solv.yml",
            "-s",
            "./test/test.ts",
            "-n",
            "https://example.com",
        ]);

        expect(data.source).toBe("./test/test.ts");
        expect(data.configPath).toBe("./test/.solv.yml");
        expect(data.noOverwrite).toBe(true);
        expect(data.targetUrl).toBe("https://example.com");
    });
});

describe("drawLine", () => {
    it("should draws a line with given length", () => {
        const buffer: string[] = [];
        console.log = (content: string) => buffer.push(content);

        drawLine(15);
        drawLine(5);

        expect(buffer[0]).toBe("===============");
        expect(buffer[1]).toBe("=====");
    });

    it("should draws a line with specific character", () => {
        const buffer: string[] = [];
        console.log = (content: string) => buffer.push(content);

        drawLine(15, "-");
        drawLine(5, "*");

        expect(buffer[0]).toBe("---------------");
        expect(buffer[1]).toBe("*****");
    });
});

describe("breakLine", function () {
    it("should breaks a line properly", function () {
        const buffer: string[] = [];
        console.log = (content: string) => buffer.push(content);

        breakLine();
        expect(buffer).toHaveLength(1);
    });

    it("should breaks lines depending on given count", function () {
        const buffer: string[] = [];
        console.log = (content: string) => buffer.push(content);

        breakLine(15);
        expect(buffer).toHaveLength(15);

        breakLine(5);
        expect(buffer).toHaveLength(20);
    });
});

describe("drawLogo", () => {
    it("should draws a logo properly", function () {
        const buffer: string[] = [];
        console.log = (content: string) => buffer.push(content);

        drawLogo();

        expect(buffer[0]).toMatchSnapshot();
    });
});

describe("clearConsole", function () {
    it("should clears console properly", function () {
        let data = "";
        (process.stdout.write as any) = (d: string) => (data = d);

        clearConsole();
        expect(data).toBe("\x1Bc");
    });
});

describe("renderSection", () => {
    it("should renders a section with string value", () => {
        const buffer: string[] = [];
        console.info = (content: string) => buffer.push(content);

        renderSection("Title", "Content");

        expect(buffer.join("\n")).toMatchSnapshot();
    });

    it("should renders a section with string array", () => {
        const buffer: string[] = [];
        console.info = (content: string) => buffer.push(content);

        renderSection("Title", ['"Content1"', '["Content2"]']);

        expect(buffer.join("\n")).toMatchSnapshot();
    });

    it("should renders a section with given chalk function", () => {
        const buffer: string[] = [];
        console.info = (content: string) => buffer.push(content);

        renderSection("Title", "Content", chalk.cyan);

        expect(buffer.join("\n")).toMatchSnapshot();
    });

    it("should renders a section with no data", () => {
        const buffer: string[] = [];
        console.info = (content: string) => buffer.push(content);

        renderSection("Title", "");

        expect(buffer.join("\n")).toMatchSnapshot();
    });
});
