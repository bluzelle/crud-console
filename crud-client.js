#!/usr/bin/env node
const Prompt = require('prompt-base');
const {BluzelleClient} = require('bluzelle');
const {defaults} = require('lodash');


const {host, port, namespace} = defaults(require('optimist').argv, {
    host: 'test.network.bluzelle.com',
    port: '51010',
    namespace: undefined
});

console.log(`crud-client (${host}:${port}/${namespace})`);
global.bluzelle = new BluzelleClient(`ws://${host}:${port}`, namespace);


const loop = () => {
    const prompt = new Prompt({name: '', message: ''});
    prompt.run()
        .then(line => line.split(' '))
        .then(([cmd, ...rest]) => bluzelle[cmd](...rest))
        .then(console.log)
        .then(() => setTimeout(loop))
        .catch(e => {
            console.log(e);
            loop();
        });
};

loop();



