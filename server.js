import path from 'path';
import fs from 'fs';

import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';

import {config, getTable} from 'stubdb';

const CONSOLE_ERROR = true;
const DEFAULT_PORT = 8080;
const PORT = process.env.SERVEDATA_PORT || Number(process.argv[2] || DEFAULT_PORT);
const JSON_ERROR = msg => JSON.stringify({error:msg});
const HTML_ERROR = msg => `<h1>Error</h1><p>${msg}</p>`;
const APP_ROOT = path.dirname(path.resolve(process.mainModule.filename));
const ROOT = path.resolve(APP_ROOT, "db-servedata");
const ACTIONS = process.env.SD_ACTIONS ? path.resolve(process.env.SD_ACTIONS) : path.resolve(APP_ROOT, "_actions");
const QUERIES = process.env.SD_QUERIES ? path.resolve(process.env.SD_QUERIES) : path.resolve(APP_ROOT, "_queries");
const VIEWS = process.env.SD_VIEWS ? path.resolve(process.env.SD_VIEWS) : path.resolve(APP_ROOT, "_views");
const STATIC = process.env.SD_STATIC_FILES ? path.resolve(process.env.STATIC_FILES) : path.resolve(APP_ROOT, "public");
const COOKIE_NAME = process.env.SD_COOKIE_NAME ? process.env.SD_COOKIE_NAME : fs.readFileSync(path.resolve(APP_ROOT, "cookie_name")).toString('utf8');
const SESSION_TABLE = process.env.SD_SESSION_TABLE ? process.env.SD_SESSION_TABLE : "sessions";
const PERMISSION_TABLE = process.env.SD_PERMISSION_TABLE ? process.env.SD_SESSION_TABLE : "permissions";

const Tables = new Map();

const Y = (req, res) => req.path + ' ' + req.route.path;

const DISPATCH = {
  'GET /form/table/:table/:id/with/:view': withView(getItem),
  'GET /form/list/table/:table/with/:view/': withView(getList),
  'GET /form/list/table/:table/with/:view/sort/:prop': withView(getListSorted),
  'GET /form/search/table/:table/with/:view': withView(getSearchResult),
  'GET /form/query/:query/with/:view': withView(getStoredQueryResult),
  'POST /form/table/:table/new/with/:view': withView(newItem),
  'POST /form/table/:table/:id/with/:view': withView(setItem),
  'POST /form/action/:action/with/:view': withView(runStoredAction),
};

export default function servedata(opts = {}) {
  config({root:ROOT});
  const app = express();

  app.use(helmet());

  app.set('etag', false);
  app.set('trust proxy', true);

  app.use((req,res,next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  app.use(cookieParser());

  app.use(express.urlencoded({extended:true}));

  app.use(express.static(STATIC, {extensions:['html'], fallthrough:true}));

  app.use(getSession);
  app.use(getPermissions);

  const X = async (req, res, next) => {
    const way = `${req.method} ${req.route.path}`;
    const data = {...req.params, item: req.body, _search: req.query};
    if ( data.table ) {
      data.table = _getTable(data.table);
    }
    let result
    try {
      if ( req.path.startsWith('/form')) {
        res.type('html');
      } else if ( req.path.startsWith('/json')) {
        res.type('json');
      }
      if ( req.path.includes('/action/') ) {
        result = await DISPATCH[way](data, req, res);
      } else {
        result = await DISPATCH[way](data);
      }
      res.end(result);
    } catch(e) {
      next(e);
    }
  }

  // views are in './views/:view.js'
  // queries are in './queries/:query.js'
  // actions are in './actions/:action.js'

  // JSON
    // getters
    app.get('/json/table/:table/:id', X);
    app.get('/json/list/table/:table/:id/sort/:prop', X);
    app.get('/json/search/table/:table/:id/sort/:prop', X);
    // auto id
    app.post('/json/table/:table', X);    
    // given id
    app.put('/json/table/:table/:id', X); 
    // update 
    app.patch('/json/table/:table/:id', X); 
    // stored procedures
    app.post('/json/action/:action', X);
    app.get('/json/query/:query', X);

  // FORM
    // with is render (from ./views/:view.js)
    // getters 
      app.get('/form/table/:table/:id/with/:view', X);
      app.get('/form/list/table/:table/with/:view/', X);
      app.get('/form/list/table/:table/with/:view/sort/:prop', X);
      app.get('/form/search/table/:table/with/:view', X);
    // create
    app.post('/form/table/:table/new/with/:view', X);
    // update
    app.post('/form/table/:table/:id/with/:view', X);
    // stored procedure
    app.get('/form/query/:query/with/:view', X);
    app.post('/form/action/:action/with/:view', X);

  app.get('*', (req, res, next) => {
    next(new Error("404 not found"));
  });

  app.use(catchError);

  app.listen(PORT, err => {
    if ( err ) {
      throw err;
    }
    Log({serverUp:{port:PORT, up:Date.now()}});
  });
}

function getSession(req, res, next) {
  const {[COOKIE_NAME]:cookie} = req.cookies;
  const {Authorization:authHeader} = req.headers;
  const noSessionClaim = ! cookie && ! authHeader;
  const redundantClaim = cookie && authHeader;

  let token;
  let session;

  let tokenIsInvalid;
  let sessionIsExpired;
  
  switch(true) {
    case noSessionClaim:
      console.warn("No session claim");
      break;
    case redundantClaim:
      console.warn("Both cookie and header used for session. Invalid.");
      res.abort(400);
      break;
    case cookie:
      token = cookie;
      break;
    case authHeader: 
      token = authHeader;
      token = token.replace("Bearer ", "");
      break;
    default:
      // No need as the 4 possible cases are above
      throw "This should never happen"
  }

  if ( token ) {
    const sessions = _getTable(SESSION_TABLE);

    try {
      session = sessions.get(token);
    } catch(e) {
      console.warn({msg:"Token is invalid because there is no session associated with it", token, error:e});
      tokenIsInvalid = true;
    }

    if ( ! tokenIsInvalid ) {
      if ( session.expiresAt >= Date.now() ) {
        console.warn({msg:"Expired session", token, session});
        sessionIsExpired = true;
      }
    }

    const authorization = {
      token, 
      session, 
      tokenIsInvalid,
      sessionIsExpired,
      // as an object, 'permissions' properties are *not* frozen
      permissions: {}
    };

    Object.freeze(authorization);
    Object.defineProperty(req, 'authorization', { get: () => authorization, enumerable: true });

    console.log({authorization});
  }

  next();
}

function getPermissions(req, res, next) {
  if ( req.authorization ) {

  }
  next();
}

function catchError(err, req, res, next) {
  const errExists = !! err;
  const stack = errExists ? err.stack || '' : '';
  const msg = errExists ? err.message || '' : '';
  const Err = {
    err,
    stack,
    msg,
    path: req.path,
    ip: {
      rip: req.ip,
      rips: req.ips,
      rcra: req.connection.remoteAddress,
      rxff: req.headers['x-forwarded-for'],
      rxrip: req.headers['x-real-ip']
    }
  };
  Log(Err, CONSOLE_ERROR);
  if ( req.path.startsWith('/form') ) {
    res.type('html');
    res.end(HTML_ERROR(msg));
  } else if ( req.path.startsWith('/json') ) {
    res.type('json');
    res.end(JSON_ERROR(msg));
  } else {
    res.type('text');
    res.end("Error " + msg);
  }
}

function Log(obj, stdErr = false) {
  console.log(JSON.stringify(obj));
  if( stdErr ) {
    console.error(obj);
  }
}

function getItem({table, id}) {
  return table.get(id);
}

function getList({table}) {
  return table.getAll();
}

function getListSorted({table, prop}) {
  const list = table.getAll();
  list.sort((a,b) => {
    let X,Y;
    try {
      X = guardNumber(a[prop]);
      Y = guardNumber(b[prop]);
    } catch (e) {
      X = a[prop];
      Y = b[prop];
    }
    if ( X < Y ) {
      return -1;
    } else return 1;
  });
  return list;
}

function guardNumber(x) {
  const parsed = Number(x);
  if ( Number.isNaN(parsed) ) {
    throw new Error(`Value ${x} is not a number.`);
  }
  return parsed;
}

function getSearchResult({table, _search}) {
  const list = getList({table});
  const keywords = _search['keywords'];
  const result = list.filter(item => JSON.stringify(item).includes(keywords));
  return result;
}

function getStoredQueryResult() {
  throw new Error("Not implemented");
}

function newItem({table, item}) {
  const id = nextKey();
  item._id = id;
  table.put(id, item);
  return item;
}

function setItem({table, id, item}) {
  item._id = id;
  let existingItem;
  try {
    existingItem = table.get(id);
  } catch(e) {
    existingItem = {};
  }
  item = Object.assign(existingItem, item);
  table.put(id, item);
  return item;
}

async function runStoredAction({action, item}, req, res) {
  const actionFileName = path.resolve(ACTIONS, `${action}.js`); 
  try {
    const {default:Action} = await import(actionFileName);
    const result = Action(item, {getTable, newItem, setItem, getSearchResult}, req, res);
    return result;
  } catch(e) {
    console.warn(e);
    throw new Error(`Action ${action} is not defined in ${actionFileName}`);
  }
}

function withView(f) {
  return async (...args) => {
    const raw = await f(...args);
    const view = args[0].view;
    let viewFileName, View;
    //try {
      viewFileName = path.resolve(VIEWS, `${args[0].view}.js`);
      ({default:View} = await import(viewFileName));
    //} catch(e) {
    //  console.warn(`View ${view} is not in file ${viewFileName}`);
    //}
    /**
    const tempJsonView = JSON.stringify(raw);
    return tempJsonView;
    **/
    const renderedView = View(raw);
    return renderedView;
  };
}

function _getTable(table) {
  if ( !Tables.has(table) ) {
    Tables.set(table, getTable(table));
  }
  return Tables.get(table);
}

function nextKey() {
  const v = (Date.now()/1000) + Math.random();
  return v.toString(36);
}
