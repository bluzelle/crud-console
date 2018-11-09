#!/usr/bin/env node
const {BluzelleClient} = require('bluzelle');
const {parseLine} = require('./LineParser');
const {pipe, join, filter, reduce, extend, defaults, memoize} = require('lodash/fp');

const commandQueue = [];

const {host, port, namespace} = defaults({
    host: 'test.network.bluzelle.com',
    port: '51010',
    namespace: undefined
}, require('optimist').argv);


const init = pipe(
    initBluzelle,
    initReadLine,
    showHeader
);

const initBluzelle = () =>
    global.bluzelle = new BluzelleClient(`ws://${host}:${port}`, namespace);


const initReadLine = () => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });

    rl.on('line', line => commandQueue.push(line));
};

const showHeader = () =>
console.log(`
crud-client (${host}:${port}/${namespace})
TYPE "help" for a list of commands
`);

const processCommand = async ([cmd, ...args]) => {
    getCommands()[cmd] ? await getCommands()[cmd](args) : console.log(`${cmd} is not a command`);
    setTimeout(readyPrompt)
};

const processBluzelleCommand = (cmd, args) => bluzelle[cmd](...args)
        .then(console.log)
        .catch(e => {
            console.log(e);
        });

const readyPrompt = () => {
    rl.prompt();
    waitInput();
};

const waitInput = async () => commandQueue.length ? (
    await processCommand(parseLine(commandQueue.shift()))
) : setTimeout(waitInput, 100);

const showHelp = pipe(
    getCommands,
    Object.keys,
    names => names.sort(),
    join('\n'),
    console.log
);

const exit = () => process.exit(0);

const getCommands = memoize(pipe(
    bluzelle,
    Object.getPrototypeOf,
    Object.getOwnPropertyNames,
    filter(name => ['constructor'].includes(name) === false),
    filter(name => (/^_/.test(name) === false)),
    reduce((cmds, name) => extend({[name]: processBluzelleCommand.bind(null, name)}, cmds), {}),
    extend({
        help:  showHelp,
        exit: exit
    })
));

init();