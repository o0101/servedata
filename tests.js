// imports
  import url from 'url';
  import fetch from 'node-fetch';

  import {T} from 'jtype-system';

  import './types.js';
  import {loadSchemas, SchemaValidators} from './db_helpers.js';
  import {initializeDB,servedata} from './server.js';

const Tests = [
  {
    endpoint: '/json/action/login',
    options: {
      method: 'POST',
      body: {
        username: 'test9',
        password: 'abc123'
      }
    },
    type: 'MaybeSession'
  }
];

testAll();

async function testAll(silent = false) {
  await initializeDB();
  await servedata();
  console.log("Running tests...");
  await loadSchemas();
  createTestTypes();
  const Results = [];
  let fails = 0;

  for( const {endpoint, options, type} of Tests ) {
    options.headers = {
      'Content-type': 'application/json'
    };
    const testRun = {
      endpoint, options, type, 
      result: await test({endpoint, options}, type)
    };
    if ( !testRun.result.valid ) {
      console.log(JSON.stringify({testFail: testRun},null,2));
      fails ++;
    }
  }

  console.log("Done!");

  if ( !silent ) {
    console.log(JSON.stringify({Results, tests: Tests.length, fails}, null, 2));
  }

  return {Results, fails};
}

async function test({endpoint, options}, typeName) {
  if ( !endpoint.startsWith('/json') ) {
    throw new TypeError(`Tests can only be run on JSON endpoints`);
  }
  const endpointUrl = new URL(endpoint, 'http://localhost:8080');
  const response = await fetch(endpointUrl, options).then(r => r.text());
  try {
    const jsonResponse = JSON.parse(response);
    const {valid, errors} = T.validate(T`${typeName}`, jsonResponse);
    if ( ! valid ) {
      const testError = {context:`Error validating JSON response at ${typeName}`, jsonResponse, error: 'Validation error'};
      errors.push(testError);
    }
    return {valid, errors};
  } catch(e) {
    const testError = {context:`Error validating JSON response at ${typeName}`, response, error: e};
    console.log(testError);
    return {valid: false, errors: [testError]};
  }
}

function createTestTypes() {
  T.defOr('MaybeInteger', T`Number`, T`None`)
  T.def('Err', {
    error: T`String`,
    status: T`MaybeInteger`
  });
  console.log(T.validate(T`Err`, {error:'String'}));
  T.defOr('MaybeSession', T`Session`, T`Err`);
}
