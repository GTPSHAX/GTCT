const express = require("express");
const web = express();
const cnf = require("../../config.json");
const print = require("../plugins/print");
const axios = require("axios");
const pros = require("../process");
const path = require("path");
const bodyParser = require('body-parser');
const allowed = {
    host: ["www.growtopia1.com", "www.growtopia2.com", "growtopia1.com", "growtopia2.com"]
};

web.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
});
web.use(bodyParser.urlencoded({ extended: true }));

// Login section
web.get('/growtopia/*', async (req, res) => {
    print.info(`[${req.ip}] Connected with : ${req.url}`)
    switch (req.url) {
        case "/growtopia/server_data.php":
            const server = await axios.get("https://api.ipify.org?format=json");
            const content = `server|${cnf.server.server_data.ip.toUpperCase() == "AUTO" ? server.data.ip : cnf.server.server_data?.ip}
port|${cnf.server.server_data.port}
type|${cnf.server.server_data.type}
loginurl|${cnf.server.server_data.loginUrl}
#maint|${cnf.server.server_data.maint}
meta|${cnf.server.server_data.meta}
RTENDMARKERBS1001`;
            res.send(content);
            break;
    
        default:
            res.sendStatus(404);
            break;
    }
});
web.get('/player/login/*', (req, res) => {
    if (req.url == "/player/login/dashboard") res.sendFile(path.resolve(__dirname, "../../website/index.html")), print.info(`[CLIENT] Login ${req.url} With IP : ${req.ip}`);
    else {
        try {
            res.sendFile(path.resolve(__dirname, "../../website/"+req.url.split("login/")[1]));
        } catch (error) {
            print.error(error);
            res.sendStatus(404);
        }
    }
});
web.post('/player/growid/login/validate', (req, res) => {
    try {
        const token = Buffer.from(
            `_token=${req.body._token}&growId=GROWPLUS&password=GROWPLUS`,
        ).toString('base64');
    
        res.send(
            `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia"}`,
        );
    } catch (error) {
        print.error(error);
        res.sendStatus(404);
    }
});
web.post('/player/validate/close', function (req, res) {
    res.send('<script>window.close();</script>');
});

// Cache Section
web.use(express.static(path.resolve (__dirname, "../../website")));

web.get("*", (req, res) => {
    if (!allowed.host.includes(req.headers.host) && cnf.server.security.only_growtopia_request) {
        res.sendStatus(404);
        return;
    }
    else if (cnf.server.logs.request)
        print.info(`[${req.ip}] Request to: ${req.url}`);
    res.send("Growtopia Cache Transfer (GTCT) © GrowPlus Community - 2024");
});

module.exports = web;