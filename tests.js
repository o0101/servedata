import fetch from 'node-fetch';
import './types.js';
import {loadSchemas, SchemaValidators} from './db_helpers.js';
import {initializeDB,servedata} from './server.js';

const Tests = [


];

testAll();

async function testAll(silent = false) {
  await initializeDB();
  await servedata();
  console.log("Running tests...");
  await loadSchemas();
  const Results = [];
  const fails = 0;
  for( const {endpoint, options, type} of Tests ) {
    const testRun = {
      endpoint, options, type, 
      result: await test({endpoint, options}, type)
    };
    if ( !testRun.result.valid ) {
      fails ++;
    }
  }

  console.log("Done!");

  if ( !silent ) {
    console.log(JSON.stringify({Results, tests: Tests.length, fails}, null, 2));
  }

  return {Results, fails};
}

async function test({endpoint, options}, type) {
  if ( !endpoint.startsWith('/json') ) {
    throw new TypeError(`Tests can only be run on JSON endpoints`);
  }
  const jsonResponse = await fetch(endpoint, options).then(r => r.json());
  const {valid, errors} = T.validate(type, jsonResponse);
  return {valid, errors};
}
