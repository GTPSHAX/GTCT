const express = require("express");
const web = express();
const cnf = require("../../config.json");
const pros = require("../process");
const fs = require("fs");
const { randomInt } = require("crypto");

const cache = pros.readCache();
const allowed = {
    host: ["www.growtopia1.com", "www.growtopia2.com", "growtopia1.com", "growtopia2.com"]
};

web.get('/player/login/dashboard', (req, res) => {
    console.log(req.headers)
});
web.get('/cache/*', (req, res) => {
    console.log(req.url.replace(/\//g, "\\"));
    let target = cache[req.url.replace(/\//g, "\\")];
    if (target) {
        res.set('Content-Type', 'text/html')
        res.send(Buffer.from(target.content))
        return;
    }
    if (cnf.website.auto_redirect.status) res.redirect(cnf.website.auto_redirect.url+req.url);
    else target = randomInt(99, 599), res.sendStatus(target == 200 ? 400 : target);
});


module.exports = web;