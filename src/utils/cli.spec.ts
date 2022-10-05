import { parseCommandLine, drawLine, drawLogo, breakLine, clearConsole } from "./cli";

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
