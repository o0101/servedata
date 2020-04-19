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
      VIEWS, STATIC, 
      INIT_SCRIPT, 
      DEBUG,
      PORT
    } from './common.js';
    import {
      Log,
      guardNumber, nextKey, clone, formatError, newRandom32BitSeed,
      HTML_ERROR, JSON_ERROR,
    } from './helpers.js';
    import {
      DB_ROOT, SCHEMAS, ACTIONS, QUERIES, 
      SchemaValidators,
      getList,
      getListSorted,
      getSearchResult,
      getStoredQueryResult,
      runStoredAction,
      loadSchemas,
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
    'GET /form/table/:table/:id/with/:view': withView(getItem),
    'GET /form/list/table/:table/with/:view/': withView(getList),
    'GET /form/list/table/:table/with/:view/sort/:prop': withView(getListSorted),
    'GET /form/search/table/:table/with/:view': withView(getSearchResult),
    'GET /form/query/:query/with/:view': withView(getStoredQueryResult),
    'POST /form/table/:table/new/with/:view': withView(newItem),
    'POST /form/table/:table/:id/with/:view': withView(setItem),
    'POST /form/action/:action/with/:view': withView(runStoredAction),
  };

export async function initializeDB() {
  const {default:initialize} = await import(INIT_SCRIPT);
  await loadSchemas();
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
      getPermission(req, res);

      if ( ! req.authorization ) {
        return res.status(401).send('401 Not authorized. No valid user identified.');
      }

      // sometimes we do an action through get because 'links'
      if ( req.method == 'GET' && !req.params.action && !req.authorization.permissions.view ) {
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
      // special action 'getter' for say email links
      app.get('/form/action/:action/with/:view', X);
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

