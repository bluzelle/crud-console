#!/usr/bin/env node
const {BluzelleClient} = require('bluzelle');
const {defaults} = require('lodash');
const {parseLine} = require('./LineParser');
const {pipe} = require('lodash/fp');


const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});



const commandQueue = [];

rl.on('line', line => commandQueue.push(line));

const {host, port, namespace} = defaults(require('optimist').argv, {
    host: 'test.network.bluzelle.com',
    port: '51010',
    namespace: undefined
});

console.log(`
crud-client (${host}:${port}/${namespace})
TYPE "help" for a list of commands
`);

global.bluzelle = new BluzelleClient(`ws://${host}:${port}`, namespace);


const processCommand = ([cmd, ...rest]) => cmd === 'help' ? showHelp() : processBluzelleCommand([cmd, ...rest]);

const processBluzelleCommand = ([cmd, ...rest]) => bluzelle[cmd](...rest)
        .then(console.log)
        .then(() => setTimeout(readyPrompt))
        .catch(e => {
            console.log(e);
            setTimeout(readyPrompt);
        });

const readyPrompt = () => {
    rl.prompt();
    waitInput();
};

const waitInput = async () => commandQueue.length ? (
    await processCommand(parseLine(commandQueue.shift()))
) : setTimeout(waitInput, 100);

readyPrompt();

const showHelp = () => pipe(
    Object.getPrototypeOf,
    Object.getOwnPropertyNames,
    list => list.filter(it => typeof bluzelle[it] === 'function'),
    list => list.filter(it => !(/^_/.test(it))),
    list => list.join('\n'),
    console.log,
    readyPrompt
)(bluzelle);
