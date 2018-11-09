#!/usr/bin/env node
const {BluzelleClient} = require('bluzelle');
const {defaults} = require('lodash');
const carrier = require('carrier');

const commandQueue = [];

carrier.carry(process.stdin, line => commandQueue.push(line));

const {host, port, namespace} = defaults(require('optimist').argv, {
    host: 'test.network.bluzelle.com',
    port: '51010',
    namespace: undefined
});

console.log(`crud-client (${host}:${port}/${namespace})`);
global.bluzelle = new BluzelleClient(`ws://${host}:${port}`, namespace);


const processCommand = ([cmd, ...rest]) => bluzelle[cmd](...rest)
        .then(console.log)
        .then(() => setTimeout(readyPrompt))
        .catch(e => {
            console.log(e);
            setTimeout(readyPrompt);
        });

const readyPrompt = () => {
    process.stdout.write('? ');
    waitInput();
};

const waitInput = async () => commandQueue.length ? (
    await processCommand(commandQueue.shift().split(' '))
) : setTimeout(waitInput, 100);

readyPrompt();
