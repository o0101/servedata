// imports
  import fetch from 'node-fetch';

  import {discohash} from 'bebb4185'
  import {T} from 'jtype-system';

  import './types.js';
  import {PORT} from './common.js';
  import {loadSchemas} from './db_helpers.js';
  import {initializeDB,servedata} from './server.js';

const DEBUG = false;
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
    type: 'WrappedSession'
  },
  input => ({
    endpoint: '/json/action/logout',
    options: {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${input.session._id}`
      }
    },
    type: 'WrappedSession'
  }),
  {
    endpoint: '/json/action/login',
    options: {
      method: 'POST',
      body: {
        username: 'test10',
        password: 'abc123'
      }
    },
    type: 'Err'
  },
  {
    endpoint: '/json/action/signup',
    options: {
      method: 'POST',
      body: {
        email: 'cris7fe@gmail.com',
        email2: 'cris7fe@gmail.com',
        username: 'test10' + (Math.random()*1000).toFixed(0).toString(36),
        password: 'abc123'
      }
    },
    type: 'SignupResponse'
  },
  CreateDepositTest(),
];

let publicIP;

export async function functionTest() {
  await testAll(Tests);
  console.log("Function test done");
}

export async function speedTest() {
  const tests = [];
  for( let i = 0; i < 1000; i ++ ) {
    tests.push(CreateDepositTest()); 
  }
  await testAll(tests);
  console.log("Speed test done");
}

async function testAll(tests, silent = false) {
  await initializeDB();
  const server = await servedata({secure: false});

  publicIP = await fetch('http://ifconfig.me/ip').then(r => r.text());
  await loadSchemas();
  createTestTypes();
  console.log("Running tests...");
  const timeNow = Date.now();
  const Results = [];
  let fails = 0;
  let lastResult;

  for( const Test of tests ) {
    let endpoint, options, type;
    if ( Test instanceof Function ) {
      ({endpoint,options,type} = Test(lastResult));
    } else {
      ({endpoint,options,type} = Test);
    }
    options.headers = options.headers || {};
    Object.assign(options.headers, {
      'Content-type': 'application/json'
    });
    const testRun = {
      endpoint, options, type, 
      result: await test({endpoint, options}, type)
    };
    lastResult = testRun.result.jsonResponse;
    if ( !testRun.result.valid ) {
      DEBUG && console.log(JSON.stringify({testFail: testRun},null,2));
      fails ++;
    } else {
      DEBUG && console.log(JSON.stringify({testPass: testRun},null,2));
    }
  }

  const timeAtEnd = Date.now();
  const testDuration = timeAtEnd - timeNow;
  const perTestDurationMilliseconds = (testDuration/tests.length).toFixed(2);
  const testDurationSeconds = (testDuration/1000).toFixed(2);
  console.log("Done!");

  if ( !silent ) {
    console.log(JSON.stringify({testDurationSeconds, perTestDurationMilliseconds, Results, tests: tests.length, fails}, null, 2));
  }

  server.close();

  return {Results, fails};
}

async function test({endpoint, options}, typeName) {
  if ( !endpoint.startsWith('/json') ) {
    throw new TypeError(`Tests can only be run on JSON endpoints`);
  }
  const endpointUrl = new URL(endpoint, `http://${publicIP}:${PORT}`);
  options.body = JSON.stringify(options.body);
  const response = await fetch(endpointUrl, options).then(r => r.text());
  try {
    const jsonResponse = JSON.parse(response);
    const {valid, errors} = T.validate(T`${typeName}`, jsonResponse);
    if ( ! valid ) {
      const testError = {context:`Error validating JSON response at ${typeName}`, jsonResponse, error: 'Validation error'};
      errors.push(testError);
    }
    return {valid, errors, jsonResponse, response};
  } catch(e) {
    const testError = {context:`Error validating JSON response at ${typeName}`, response, error: e};
    DEBUG && console.log(testError);
    return {valid: false, errors: [testError]};
  }
}

function createTestTypes() {
  T.defOr('MaybeInteger', T`Integer`, T`None`)
  T.def('Err', {
    error: T`String`,
    status: T`MaybeInteger`
  });
  T.def('WrappedSession', {
    id: T.defOption(T`String`),
    session: T`Session`
  });
  T.defOr('MaybeSession', T`WrappedSession`, T`Err`);
  T.def('SignupResponse', {
    email: T`Email`,
    username: T`Username`
  });
  T.def('WrappedSelection', {
    selection: T`Object`
  });
  T.defOr('MaybeDCR', T`Deposit`, T`Err`);
}

function CreateDepositTest() {
  return {
    endpoint: '/json/table/deposits',
    options: {
      method: 'POST',
      body: {
        _id: Math.random().toString(36),
        _owner: Math.random().toString(36),
        account: 'abc123',
        txID: discohash('xxxyyy', Math.round(Math.random()*10000)).toString(16),
        amount100ths: Math.round(Math.random()*1000),
        valence: Math.random() > 0.78 ? -1 : 1
      }
    },
    type: 'MaybeDCR'
  };
}
