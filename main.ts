import { readFile, readFileSync } from 'fs';
import { createServer } from 'http';

const server = createServer(function (request, response) {
    var filePath = 'index.html'
    var contentType = 'text/html';

    if (request.url == "/uid.bplist") {
        contentType = 'application/x-bplist; charset=UTF-8';
        filePath = 'uid.bplist'
    }

    readFile(filePath, function (error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(8125);


import { BrowserType, chromium, firefox } from 'playwright';

async function runBrowser(bt: BrowserType) {
    const url = "http://127.0.0.1:8125/"
    const browser = await bt.launch({
        headless: false
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    context.route('**/uid.bplist', async (route, request) => {
        route.continue()
        const resp = await request.response()
        if (!resp) {
            return
        }

        const body = await resp.body()
        if (!body) {
            return
        }

        printFile(body)
    });


    await page.goto(url, { waitUntil: "networkidle" });

    // Teardown
    await context.close();
    await browser.close();


}

function printFile(b: Buffer) {
    const hex = b.toString('hex')

    console.log("length:", hex.length)
    console.log("hex:")
    console.log(hex)
    console.log()
}

console.log("real file")
const real = readFileSync('uid.bplist')
printFile(real)

console.log("chromium")
await runBrowser(chromium)

console.log("firefox")
await runBrowser(firefox)

server.close()



