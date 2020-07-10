const emitterFile = require('./my_emitter');
const myEmitter = emitterFile.emitter;

const fake_data = JSON.parse('{ "fake":"fake_data"}');

function auto_run() {
    console.log("Cron will auto run this");
    //Pass new data
    myEmitter.emit('update_data',fake_data);
}

exports.auto_run = auto_run;