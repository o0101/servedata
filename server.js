import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import {config, getTable} from 'stubdb';

const CONSOLE_ERROR = true;
const DEFAULT_PORT = 8667;
const PORT = process.env.SERVEDATA_PORT || Number(process.argv[2] || DEFAULT_PORT);
const JSON_ERROR = msg => JSON.stringify({error:msg});
const HTML_ERROR = msg => `<h1>Error</h1><p>${msg}</p>`;
const APP_ROOT = path.dirname(path.resolve(process.mainModule.filename));
const ROOT = path.resolve(APP_ROOT, "..", "db-servedata");
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

export default function servedata() {
  config({root:ROOT});
  const app = express();
  app.use(bodyParser.urlencoded({extended:true}));

  const X = (req, res) => {
    const way = `${req.method} ${req.route.path}`;
    const data = {...req.params, item: req.body, _search: req.query};
    if ( data.table ) {
      data.table = _getTable(data.table);
    }
    const result = DISPATCH[way](data);
    res.end(result);
  }

  app.use(express.static(path.resolve(__dirname, 'public')));

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

function catchError(err, req, res, next) {
  const errExists = !! err;
  const stack = errExists ? err.stack || '' : '';
  const msg = errExists ? err.message || '' : '';
  const Err = {
    err,
    stack,
    msg,
    path: req.path
  };
  Log(Err, CONSOLE_ERROR);
  if ( req.path.startsWith('/form') ) {
    res.end(HTML_ERROR(msg));
  } else if ( req.path.startsWith('/json') ) {
    res.end(JSON_ERROR(msg));
  } else {
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
    if ( a[prop] < b[prop] ) {
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
  table.put(id, item);
  item._id = id;
  return item;
}

function setItem({table, id, item}) {
  console.log(item);
  item._id = id;
  table.put(id, item);
  return item;
}

function runStoredAction() {
  throw new Error("Not implemented");
}

function withView(f) {
  return (...args) => {
    const raw = f(...args);
    const tempJsonView = JSON.stringify(raw);
    return tempJsonView;
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
