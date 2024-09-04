const print = {
    info(msg) {
        console.log(`[\x1b[34mINFO\x1b[0m] ${msg}`);
    },
    success(msg) {
        console.log(`[\x1b[32mSUCCESS\x1b[0m] ${msg}`);
    },
    fail(msg) {
        console.log(`[\x1b[31mFAILED\x1b[0m] ${msg}`);
    },
    error(msg) {
        console.log(`[\x1b[41m\x1b[37mERROR\x1b[0m] ${msg}`);
    },
    msg(msg) {
        console.log(`[\x1b[33mMESSAGE\x1b[0m] ${msg}`);
    }
};

module.exports = print;