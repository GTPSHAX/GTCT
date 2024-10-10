const cnf = require("../config.json");
const print = require("./plugins/print");
const allowedHost = ["www.growtopia1.com", "www.growtopia2.com", "growtopia1.com", "growtopia2.com"];
// let cache = {};

// async function readCache() {
//     print.info("Caching whole cache...");

//     function readDirRecursive(dirPath) {
//         const files = fs.readdirSync(dirPath);
//         files.forEach(file => {
//             const fullPath = path.join(dirPath, file);
//             const fileStats = fs.statSync(fullPath);

//             if (fileStats.isDirectory()) {
//                 readDirRecursive(fullPath);
//             } else if (path.extname(file).slice(1)) {
//                 const content = fs.readFileSync(fullPath, 'utf8');
//                 //const type = path.extname(file).slice(1);
//                 const relativePath = path.relative(cnf.path.cache, fullPath).replace(/\\/g, "/");

//                 cache[`/cache/${relativePath}`] = content;
//             }
//         });
//     }

//     readDirRecursive(cnf.path.cache);

//     print.info(`${Object.keys(cache).length} Cache Loaded`);
// }

const clients = new Map();
const blockedIPs = new Set();
const requestLog = new Map();

async function security(ip, data) {
    const now = Date.now();
    let clientData = clients.get(ip);

    if (!clientData) {
        clientData = {
            resetTime: cnf.server.security.reset_time,
            req: {
                totals: 0,
                caches: new Set(),
            },
            warn: 0,
            lastRequestTime: now,
        };
        clients.set(ip, clientData);
    }

    const timeSinceLastRequest = now - clientData.lastRequestTime;
    if (timeSinceLastRequest < cnf.server.security.min_request_interval) {
        clientData.warn++;
    }
    clientData.lastRequestTime = now;

    clientData.req.totals++;

    if (clientData.req.caches.has(data.req.cache)) {
        clientData.warn++;
    } else {
        clientData.req.caches.add(data.req.cache);
    }

    
    if (clientData.req.totals >= cnf.server.security.limit_req) {
        clientData.warn++;
    }
    if (!allowedHost.includes(data.headers.host) && cnf.server.security.only_growtopia_request) {
        clientData.warn++;
    }
    if (!data.headers['user-agent'] || data.headers['user-agent'].length < 10) {
        clientData.warn++;
    }
    
    const recentRequests = requestLog.get(ip) || [];
    recentRequests.push(now);
    if (recentRequests.length > 10) {
        recentRequests.shift();
    }
    requestLog.set(ip, recentRequests);

    if (recentRequests.length === cnf.server.security.limit_req) {
        const timeDiff = recentRequests[9] - recentRequests[0];
        if (timeDiff < 1000) {
            clientData.warn += 2;
        }
    }
    if (clientData.warn >= cnf.server.security.max_warn) {
        blockedIPs.add(ip);
        print.security(`IP ${ip} has been blocked due to suspicious activity.`);
    }

    return !blockedIPs.has(ip);
}

setInterval(() => {
    clients.clear();
    requestLog.clear();
}, cnf.server.security.reset_time);
setInterval(() => {
    blockedIPs.clear();
}, cnf.server.security.reset_blocked_time);

module.exports = {
    security
}