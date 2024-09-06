const fs = require('fs');
const path = require("path");
const cnf = require("../config.json");
const print = require("./plugins/print");

async function readCache() {
    print.info("Caching whole cache...");
    let cache = {};

    function readDirRecursive(dirPath) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const fileStats = fs.statSync(fullPath);

            if (fileStats.isDirectory()) {
                readDirRecursive(fullPath);
            } else if (path.extname(file).slice(1)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const type = path.extname(file).slice(1);
                const relativePath = path.relative(cnf.path.cache, fullPath).replace(/\//g, "\\");

                cache[`/cache/${relativePath.replace(/\\/g, "/")}`] = {
                    type: type,
                    content: content
                };
            }
        });
    }

    readDirRecursive(cnf.path.cache);

    print.info(`${Object.keys(cache).length} Cache Loaded`);
    return cache;
}

module.exports = {
    readCache
}