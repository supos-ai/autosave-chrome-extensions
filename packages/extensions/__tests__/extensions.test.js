'use strict';

const extensions = require('..');
const assert = require('assert').strict;

assert.strictEqual(extensions(), 'Hello from extensions');
console.info('extensions tests passed');
