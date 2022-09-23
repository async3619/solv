async function clearConsole() {
    process.stdout.write("\x1Bc");
}

async function main() {
    console.log("Hello World from solv.");
}

clearConsole().then(main).then();
