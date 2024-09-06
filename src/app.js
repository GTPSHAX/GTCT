const https = require('https'), http = require("http");
const fs = require("fs");

const print = require("./plugins/print");
print.msg("Growtopia Cache Transfer (GTCT) © GrowPlus Community - 2024");

print.info("Loading config...");
const cnf = require("../config.json");

print.info("Loading Certificate...");
const cert = {
    "cert": Buffer.from(fs.readFileSync("./website/cert/gt.crt", "utf-8"), "base64").toString(),
    "key": Buffer.from(fs.readFileSync("./website/cert/gt.key", "utf-8"), "base64").toString()
}

print.info("Loading handler request...");
const web = require("./handler/request");

cnf.server.ports.forEach(async port => {
    print.info("Starting "+port[1]+" server with port: " + port[0])
    if (port[1].toUpperCase() == "HTTPS") {
        https.createServer(cert, web).listen(port[0], "0.0.0.0", () => {
            print.success('Secure server running at https://localhost:'+port[0]+'/');
        });
    }
    else {
        http.createServer(web).listen(port[0], "0.0.0.0", () => {
            print.success('Server running at http://localhost:'+port[0]+'/');
        })
    }
})