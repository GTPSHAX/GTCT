const express = require("express");
const web = express();
const cnf = require("../../config.json");
const print = require("../plugins/print");
const axios = require("axios");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require("fs");
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
web.post('/growtopia/*', async (req, res) => {
    print.info(`[${req.ip}] Connected with : ${req.url}`)
    switch (req.url) {
        case "/growtopia/server_data.php":
            const server = await axios.get("https://api.ipify.org?format=json");
            let ip = (cnf.server.server_data.ip.toUpperCase() == "AUTO" ? server.data.ip : cnf.server.server_data?.ip);
            let port = cnf.server.server_data.port;

            cnf.addon.redirect.forEach(client => {
                if (req.ip == client.ClientIP) {
                    ip = (client.ENetIP.toUpperCase() == "AUTO" ? server.data.ip : client.ENetIP);
                    port = client.ENetPort;
                    print.info(`[${req.ip}] Redirect to ENetIP: ${ip}, ENetPort: ${port}`);
                }
            });

            const content = `server|${ip}
port|${port}
type|${cnf.server.server_data.type}
#maint|${cnf.server.server_data.maint}
beta_server|${cnf.server.server_data.beta.server}
beta_port|${cnf.server.server_data.beta.port}
beta_type|${cnf.server.server_data.beta.type}
beta2_server|${cnf.server.server_data.beta2.server}
beta2_port|${cnf.server.server_data.beta2.port}
beta2_type|${cnf.server.server_data.beta2.type}
beta3_server|${cnf.server.server_data.beta3.server}
beta3_port|${cnf.server.server_data.beta3.port}
beta3_type|${cnf.server.server_data.beta3.type}
loginurl|${cnf.server.server_data.loginUrl}
meta|${cnf.server.server_data.meta}
RTENDMARKERBS1001`;
            res.send(content);
            break;
    
        default:
            res.sendStatus(404);
            break;
    }
});
web.post('/player/login/dashboard', (req, res) => {
    try {
        res.sendFile(path.resolve(__dirname, "../../website/index.html"));
        print.info(`[CLIENT] Login ${req.url} With IP : ${req.ip}`);
    } catch (error) {
        print.error(error);
        res.sendStatus(404);
    }
});
web.get("/public/*", (req, res)=>{
    try {
        res.sendFile(path.resolve(__dirname, "../../website/"+req.url.split("public/")[1]));
    } catch (error) {
        print.error(error);
        res.sendStatus(404);
    }
})
web.post('/player/growid/login/validate', (req, res) => {
    try {
        const token = Buffer.from(
            `_token=${req.body._token}&growId=GROWPLUS&password=GROWPLUS`,
        ).toString('base64');
    
        res.send(
            `{"status":"success","message":"Account Validated.","token":"${cnf.server.returnToken ? token : ""}","url":"","accountType":"growtopia"}`,
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
web.get("/cache/*", (req, res) => {
    try {
        if (!fs.existsSync(path.resolve(__dirname, "../../website"+req.url))) {
            print.error(`[${req.ip}] Missing RTTEX: ${req.url}`);
            if (cnf.addon.auto_redirect) res.redirect(cnf.addon.auto_redirect + req.url);
            else res.sendStatus(404);
            return;
        }
        if (cnf.server.logs.sending_rttex) print.info(`[${req.ip}] Sending RTTEX: ${req.url}`);

        res.setHeader('Content-Disposition', 'attachment; filename=' + req.url.split("/")[req.url.split("/").length - 1]);
        res.setHeader('Content-Type', 'application/zip');
        const fileStream = fs.createReadStream(path.resolve(__dirname, "../../website"+req.url));
        fileStream.pipe(res);
        fileStream.on('error', (err) => {
            console.error('Error streaming file:', err);
            res.status(500).send('File download failed');
        });

        //res.sendFile(path.resolve(__dirname, "../../website"+req.url))
    } catch (error) {
        print.error(error);
        res.sendStatus(404);
    }
});
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