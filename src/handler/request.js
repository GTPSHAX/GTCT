const express = require("express");
const web = express();
const cnf = require("../../config.json");
const pros = require("../process");
const print = require("../plugins/print");
const axios = require("axios");

let cache;
(async()=>{
    cache = await pros.readCache();
})();

const allowed = {
    host: ["www.growtopia1.com", "www.growtopia2.com", "growtopia1.com", "growtopia2.com"]
};

// Login sectionw
web.get('/growtopia/*', (req, res) => {
    print.info(`[${req.ip}] Connected with : ${req.url}`)
    switch (req.url) {
        case "/growtopia/server_data.php":
            const content = `server|${cnf.server.server_data.ip.toUpperCase() == "AUTO" ? axios.get("https://api.ipify.org?format=json").data.ip : cnf.server.server_data.ip}
port|${cnf.server.server_data.port}
type|${cnf.server.server_data.type}
loginurl|${cnf.server.server_data.loginUrl}
#maint|${cnf.server.server_data.maint}
meta|${cnf.server.server_data.meta}
RTENDMARKERBS1001`;
            break;
    
        default:
            res.sendStatus(404);
            break;
    }
});
web.get('/player/*', (req, res) => {
    print.info(`[CLIENT] Login ${req.url} With IP : ${req.ip}`)
    switch (req.url) {
        case "/player/login/dashboard":
            res.sendFile("../website/dashboard.html");
            break;
    
        default:
            res.sendStatus(404);
            break;
    }
});
web.post('/player/growid/login/validate', (req, res) => {
    const token = Buffer.from(
        `_token=${req.body._token}&growId=GROWPLUS&password=GROWPLUS`,
    ).toString('base64');

    res.send(
        `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia"}`,
    );
});
web.post('/player/validate/close', function (req, res) {
    res.send('<script>window.close();</script>');
});


// Cache Section
web.get('/cache/*', (req, res) => {
    let target = cache[req.url.replace(/\//g, "\\")];
    if (target) {
        res.set('Content-Type', target.type)
        res.send(Buffer.from(target.content))
        return;
    }
    if (cnf.addon.auto_redirect) res.redirect(cnf.addon.auto_redirect+req.url);
    else res.sendStatus(404);
});
web.get("*", (req, res) => {
    if (!allowed.host.includes(req.headers.host) && cnf.server.security.only_growtopia_request)
        res.sendStatus(404);
    else if (cnf.server.logs.request)
        print.info(`[${req.ip}] Request to: ${req.url}`)
});


module.exports = web;