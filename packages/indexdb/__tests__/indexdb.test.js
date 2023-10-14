'use strict';

const indexdb = require('..');
const assert = require('assert').strict;

assert.strictEqual(indexdb(), 'Hello from indexdb');
console.info('indexdb tests passed');
