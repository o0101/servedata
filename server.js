import path from 'path';
import fs from 'fs';

import helmet from 'helmet';
import express from 'express';
import cookieParser from 'cookie-parser';

import {config, getTable} from 'stubdb';

// constants and config
  const CONSOLE_ERROR = true;
  const DEFAULT_PORT = 8080;
  const PORT = process.env.SERVEDATA_PORT || Number(process.argv[2] || DEFAULT_PORT);
  const JSON_ERROR = msg => JSON.stringify({error:msg});
  const HTML_ERROR = msg => `<h1>Error</h1><p>${msg}</p>`;
  export const APP_ROOT = path.dirname(path.resolve(process.mainModule.filename));
  export const DB_ROOT = path.resolve(APP_ROOT, "db-servedata");
  const ACTIONS = process.env.SD_ACTIONS ? path.resolve(process.env.SD_ACTIONS) : path.resolve(APP_ROOT, "_actions");
  const QUERIES = process.env.SD_QUERIES ? path.resolve(process.env.SD_QUERIES) : path.resolve(APP_ROOT, "_queries");
  const VIEWS = process.env.SD_VIEWS ? path.resolve(process.env.SD_VIEWS) : path.resolve(APP_ROOT, "_views");
  const STATIC = process.env.SD_STATIC_FILES ? path.resolve(process.env.SD_STATIC_FILES) : path.resolve(APP_ROOT, "public");
  const INIT_SCRIPT = process.env.SD_INIT_SCRIPT ? path.resolve(process.env.SD_INIT_SCRIPT) : path.resolve(APP_ROOT, "sd_init.js");
  export const COOKIE_NAME = process.env.SD_COOKIE_NAME ? process.env.SD_COOKIE_NAME : fs.readFileSync(path.resolve(APP_ROOT, "cookie_name")).toString('utf8').trim();
  export const USER_TABLE = process.env.SD_USER_TABLE ? process.env.SD_USER_TABLE : "users";
  export const SESSION_TABLE = process.env.SD_SESSION_TABLE ? process.env.SD_SESSION_TABLE : "sessions";
  export const PERMISSION_TABLE = process.env.SD_PERMISSION_TABLE ? process.env.SD_SESSION_TABLE : "permissions";
  export const GROUP_TABLE = process.env.SD_GROUP_TABLE ? process.env.SD_GROUP_TABLE : "groups";
  export const NOUSER_ID = 'nouser';
  const PermNames = [
    'excise',
    'view',
    'alter',
    'create'
  ];

// cache
  const Tables = new Map();

// paths dispatch
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

// Logging
  const DEBUG = {
    AUTH: true,
    WARN: true,
    ERROR: true,
    INFO: false
  };

  function Log(obj, stdErr = false) {
    console.log(JSON.stringify(obj));
    if( stdErr ) {
      console.error(obj);
    }
  }

export async function initializeDB() {
  const {default:initialize} = await import(INIT_SCRIPT);
  initialize({getTable, config});
}

export function servedata({callConfig: callConfig = false} = {}) {
  if ( callConfig ) {
    DEBUG.WARN && console.warn("Calling config in servedata with default DB_ROOT");
    config({root:DB_ROOT});
  }
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

  const X = async (req, res, next) => {
    if ( DEBUG.AUTH ) {
      getPermissions(req, res);

      if ( ! req.authorization ) {
        return res.status(401).send('401 Not authorized. No valid user identified.');
      }

      if ( req.method == 'GET' && !req.authorization.permissions.view ) {
        return res.status(401).send('401 Not authorized. User has no view permission on this scope.');
      }

      if ( req.method == 'POST' && !req.authorization.permissions.create ) {
        return res.status(401).send('401 Not authorized. User has no create permission on this scope.');
      }
    }

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

// middleware helpers
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
        DEBUG.WARN && console.warn("No session claim");
        break;
      case redundantClaim:
        DEBUG.WARN && console.warn("Both cookie and header used for session. Invalid.");
        res.abort(400);
        break;
      case !!cookie:
        token = cookie;
        break;
      case !!authHeader: 
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
        DEBUG.WARN && console.warn({msg:"Token is invalid because there is no session associated with it", token, error:e});
        tokenIsInvalid = true;
      }

      if ( ! tokenIsInvalid ) {
        if ( session.expiresAt >= Date.now() ) {
          DEBUG.WARN && console.warn({msg:"Expired session", token, session});
          sessionIsExpired = true;
        }
      }
    } else if ( noSessionClaim ) {
      session = {userid:NOUSER_ID};
    }

    const authorization = {
      token, 
      session, 
      noSessionClaim,
      tokenIsInvalid,
      sessionIsExpired,
      // as an object, 'permissions' properties are *not* frozen
      permissions: blankPerms()
    };

    Object.freeze(authorization);
    Object.defineProperty(req, 'authorization', { get: () => authorization, enumerable: true });

    DEBUG.INFO && console.log({authorization});

    next();
  }

  function getPermissions(req, res) {
    let userid;
    let user;

    if ( req.authorization ) {
      const {tokenIsInvalid,sessionIsExpired} = req.authorization;

      if ( tokenIsInvalid || sessionIsExpired ) {
        req.errors = {tokenIsInvalid, sessionIsExpired};
        return;
      }

      const {userid} = req.authorization.session;

      try {
        const table = _getTable(USER_TABLE);
        user = getItem({table, id:userid});
      } catch(e) {
        DEBUG.ERROR && console.error({msg:"Session and token OK, but no user", userid});
        req.errors = {noUser:true};
        return;
      }

      const {accountDisabled, accountDeleted} = user;

      if ( accountDisabled || accountDeleted ) {
        DEBUG.WARN && console.warn({msg:"Account not active", accountDisabled, accountDeleted});
        req.errors = {accountDisabled, accountDeleted};
        return;
      }

      const Endpoint_permissions = blankPerms();
      const Instance_permissions = blankPerms();

      let active;

      switch(true) {
        case !!req.params.table:
          active = `table/${req.params.table}`;
          break;
        case !!req.params.action:
          active = `action/${req.params.action}`;
          break;
        case !!req.params.query:
          active = `query/${req.params.query}`;
          break;
      }

      for( const group of user.groups ) {
        try {
          const table = _getTable(PERMISSION_TABLE);
          const endpoint_key = `group/${group}:${active}`;
          const endpoint_permissions = getItem({table, id:endpoint_key});
          grant(Endpoint_permissions, endpoint_permissions);
        } catch(e) {
          DEBUG.INFO && console.warn(e);
        }

        try {
          const table = _getTable(PERMISSION_TABLE);
          const instance_key = `group/${group}:${active}:${req.params.id}`;
          const instance_permissions = getItem({table, id:instance_key});
          grant(Instance_permissions, instance_permissions);
        } catch(e) {
          DEBUG.INFO && console.warn(e);
        }
      }

      try {
        const table = _getTable(PERMISSION_TABLE);
        const endpoint_key = `${userid}:${active}`;
        const endpoint_permissions = getItem({table, id:endpoint_key});
        grant(Endpoint_permissions, endpoint_permissions);
      } catch(e) {
        DEBUG.INFO && console.warn(e);
      }

      try {
        const table = _getTable(PERMISSION_TABLE);
        const instance_key = `${userid}:${active}:${req.params.id}`;
        const instance_permissions = getItem({table, id:instance_key});
        grant(Instance_permissions, instance_permissions);
      } catch(e) {
        DEBUG.INFO && console.warn(e);
      }

      grant(req.authorization.permissions, Endpoint_permissions);
      grant(req.authorization.permissions, Instance_permissions);

      Object.freeze(req.authorization.permissions);
    }
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

// database adapters
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
      DEBUG.WARN && console.warn('wtf', e);
      throw new Error(`Action ${action} is not defined in ${actionFileName}`);
    }
  }

  function _getTable(table) {
    if ( !Tables.has(table) ) {
      Tables.set(table, getTable(table));
    }
    return Tables.get(table);
  }

// views
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

// helpers
  function blankPerms() {
    const perm = {};
    for( const name of PermNames ) {
      perm[name] = false;
    }
    return perm;
  }

  function grant(perms, new_perms) {
    for( const name of PermNames ) {
      perms[name] |= new_perms[name];
    }
  }

  function guardNumber(x) {
    const parsed = Number(x);
    if ( Number.isNaN(parsed) ) {
      throw new Error(`Value ${x} is not a number.`);
    }
    return parsed;
  }

  function nextKey() {
    const v = (Date.now()/1000) + Math.random();
    return v.toString(36);
  }
