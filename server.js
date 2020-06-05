// imports 
  // nodejs builtins
    import path from 'path';
    import fs from 'fs';

  // 3rd party dependencies
    import helmet from 'helmet';
    import express from 'express';
    import cookieParser from 'cookie-parser';

  // my own external dependencies
    import {config, getTable} from 'stubdb';

  // internal modules
    import './types.js';
    import {
      APP_ROOT,
      STATIC, 
      DEBUG,
      PORT
    } from './common.js';
    import {
      Log,
      guardNumber, nextKey, clone, formatError, newRandom32BitSeed,
      HTML_ERROR, JSON_ERROR,
      route,
    } from './helpers.js';
    import {
      DB_ROOT, SCHEMAS, ACTIONS, QUERIES, 
      SELECTIONS,
      SchemaValidators,
      getList,
      getListSorted,
      getSearchResult,
      getStoredQueryResult,
      getSelectionData,
      displaySelectionData,
      runStoredAction,
      initialize,
      newItem,
      setItem,
      getItem,
      _getTable,
    } from './db_helpers.js';
    import {getSession} from './_middlewares/session.js';
    import {getPermission} from './_middlewares/permission.js';
    import {catchError} from './_middlewares/error.js';
    import {withView} from './views.js';

// paths dispatch
  const DISPATCH = {
    // forms
      'GET /form/table/:table/:id/with/:view': withView(getItem),
      'GET /form/list/table/:table/with/:view/': withView(getList),
      'GET /form/list/table/:table/with/:view/sort/:prop': withView(getListSorted),
      'GET /form/search/table/:table/with/:view': withView(getSearchResult),
      'GET /form/query/:query/with/:view': withView(getStoredQueryResult),
      'GET /form/selection/:selection/:id': displaySelectionData,
      'GET /form/selection/:selection': displaySelectionData,
      'POST /form/table/:table/new/with/:view': withView(newItem),
      'POST /form/table/:table/:id/with/:view': withView(setItem),
      'POST /form/action/:action/with/:view': withView(runStoredAction),
      'POST /form/action/:action/redir/:selection': toSelection(runStoredAction),

    // JSON API
      'GET /json/table/:table/:id': getItem,
      'GET /json/list/table/:table/': getList,
      'GET /json/list/table/:table/sort/:prop': getListSorted,
      'GET /json/search/table/:table': getSearchResult,
      'GET /json/query/:query': getStoredQueryResult,
      'GET /json/selection/:selection/:id': getSelectionData,
      'GET /json/selection/:selection': getSelectionData,
      'POST /json/table/:table': newItem,
      'PATCH /json/table/:table/:id': setItem,
      'POST /json/action/:action': runStoredAction,
      // not implemented
        /*
        'PUT /json/table/:table/:id': overwriteItem,
        */
  };

process.on('unhandledRejection', (...args) => console.log(args));

export async function initializeDB() {
  await initialize();
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
    // set cache
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    //set type
      if ( req.path.startsWith('/form')) {
        res.type('html');
      } else if ( req.path.startsWith('/json')) {
        res.type('json');
      }

    next();
  });

  app.use(cookieParser());
  app.use(express.urlencoded({extended:true}));
  app.use(express.json({extended:true}));
  app.use(express.static(STATIC, {extensions:['html'], fallthrough:true}));
  app.use(getSession);

  // JSON
    // getters
      app.get('/json/table/:table/:id', X);
      app.get('/json/list/table/:table', X);
      app.get('/json/list/table/:table/sort/:prop', X);
      app.get('/json/search/table/:table', X);
    // auto id
      app.post('/json/table/:table', X);    
    // given id ( set/ overwrite (not implemented) )
    // app.put('/json/table/:table/:id', X); 
    // update  (setItem, standard implementation, subset of properties)
      app.patch('/json/table/:table/:id', X); 
    // stored procedures
      app.get('/json/query/:query', X);
      app.post('/json/action/:action', X);

  // FORM
    // getters 
      app.get('/form/table/:table/:id/with/:view', X);
      app.get('/form/list/table/:table/with/:view', X);
      app.get('/form/list/table/:table/sort/:prop/with/:view', X);
      app.get('/form/search/table/:table/with/:view', X);
      app.get('/form/selection/:selection/:id', X);
      app.get('/form/selection/:selection', X);
    // create
      app.post('/form/table/:table/new/with/:view', X);
    // update
      app.post('/form/table/:table/:id/with/:view', X);
    // stored procedure
      app.get('/form/query/:query/with/:view', X);
      app.post('/form/action/:action/with/:view', X);
      app.post('/form/action/:action/redir/:selection', X);

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

async function X(req, res, next) {
  getPermission(req, res);

  if ( ! req.authorization ) {
    next({status: 401, error: '401 Not authorized. No valid user identified.'});
  }

  // sometimes we do an action through get because 'links'
  if ( req.method == 'GET' && !req.params.action && !req.authorization.permissions.view ) {
    return next({status:401, error: '401 Not authorized. User has no view permission on this scope.'});
  }

  if ( req.method == 'POST' && !req.authorization.permissions.create ) {
    return next({status:401, error: '401 Not authorized. User has no create permission on this scope.'});
  }

  const way = `${req.method} ${req.route.path}`;
  const data = {...req.params, item: req.body, _search: req.query};

  if ( data.table ) {
    data.table = _getTable(data.table);
  }

  let result;

  try {
    if ( req.path.includes('/action/') ) {
      result = await DISPATCH[way](data, req, res);
    } else {
      result = await DISPATCH[way](data);
    }

    if ( req.path.includes('/redir/') ) {
      const {pathname} = result;
      if ( !pathname ) {
        throw new TypeError(`Redirect can only be used when task returns a 'pathname' field`);
      }

      const toUrl = route(req, pathname);

      res.redirect(toUrl);
    } else {
      if ( req.path.startsWith('/json') ) {
        result = JSON.stringify(result);
      }

      res.end(result);
    }
  } catch(e) {
    next(e);
  }
}

export function toSelection(f) {
  return async (...args) => {
    const raw = await f(...args);
    const [{selection}] = args;
    const {id} = raw;

    let pathname;

    if ( id ) {
      pathname = `/form/selection/${selection}/${id}`;
    } else {
      pathname = `/form/selection/${selection}`;
    }

    return {pathname}
  };
}
