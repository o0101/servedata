import path from 'path';
import express from 'express';

const CONSOLE_ERROR = true;
const DEFAULT_PORT = 8667;
const PORT = process.env.SERVEDATA_PORT || Number(process.argv[2] || DEFAULT_PORT);
const JSON_ERROR = msg => JSON.stringify({error:msg});
const HTML_ERROR = msg => `<h1>Error</h1><p>${msg}</p>`;
const app = express();

const X = (req, res) => res.end(req.path);

app.use(express.static(path.resolve(__dirname, 'public')));

// views are in './views/:view.js'
// queries are in './queries/:query.js'
// actions are in './actions/:action.js'

// JSON
  // getters
  app.get('/json/table/:table/:id', X);
  app.get('/json/list/table/:table/:id/order/:props', X);
  app.get('/json/search/table/:table/:id/order/:props', X);
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
    app.get('/form/list/table/:table/with/:view/order/:props', X);
    app.get('/form/search/table/:table/with/:view', X);
  // create
  app.post('/form/table/:table/new', X);
  // update
  app.post('/form/table/:table/:id', X);
  // stored procedure
  app.get('/form/query/:query/with/:view', X);
  app.post('/form/action/:action', X);

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
