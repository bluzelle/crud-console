#!/usr/bin/env node
const {BluzelleClient} = require('bluzelle');
const {parseLine} = require('./LineParser');
const {pipe, join, filter, reduce, extend, defaults, memoize} = require('lodash/fp');
const uuidv1 = require('uuid/v1');

const commandQueue = [];

const {host, port, uuid} = defaults({
    host: 'test.network.bluzelle.com',
    port: '51010',
    uuid: uuidv1()
}, require('optimist').argv);


const getBluzelle = memoize(() => new BluzelleClient(`ws://${host}:${port}`, uuid));

const getReadLine = memoize(() => require('readline')
    .createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    }).on('line', line => commandQueue.push(line))
);

const showHeader = () =>
    console.log(`
crud-client (${host}:${port}/${uuid})
TYPE "help" for a list of commands
`);

const readyPrompt = () => {
    getReadLine().prompt();
    waitInput();
};


const init = pipe(
    showHeader,
    readyPrompt
);


const processCommand = async ([cmd, ...args]) => {
    getCommands()[cmd] ? await getCommands()[cmd](args) : console.log(`${cmd} is not a command`);
    setTimeout(readyPrompt)
};

const processBluzelleCommand = (cmd, args) => getBluzelle()[cmd](...args)
    .then(console.log)
    .catch(e => {
        console.log(e);
    });


const waitInput = async () => commandQueue.length ? (
    await processCommand(parseLine(commandQueue.shift()))
) : setTimeout(waitInput, 100);

const exit = () => process.exit(0);

const subscribeFn = async ([key]) =>
    await getBluzelle().subscribe(key, val => {
        console.log(`\n${key} updated: ${val}`);
        process.stdout.write('> ');
    });


const getCommands = memoize(pipe(
    getBluzelle,
    Object.getPrototypeOf,
    Object.getOwnPropertyNames,
    filter(name => ['constructor'].includes(name) === false),
    filter(name => (/^_/.test(name) === false)),
    reduce((cmds, name) => extend({[name]: processBluzelleCommand.bind(null, name)}, cmds), {}),
    extend({
        help: () => showHelp(),
        exit: exit
    }),
    obj => (obj.subscribe = subscribeFn) && obj
));

const showHelp = pipe(
    getCommands,
    Object.keys,
    names => names.sort(),
    join('\n'),
    console.log
);

init();