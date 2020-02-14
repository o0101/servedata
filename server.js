import express from 'express';

const app = express();
const X = (req, res) => res.end();

// JSON
app.get('/json/table/:table/:id', X);
app.get('/json/list/table/:table/:id/order/:props', X);
app.get('/json/search/table/:table/:id/order/:props', X);
app.post('/json/table/:table', X);    // auto id
app.put('/json/table/:table/:id', X); // given id
app.patch('/json/table/:table/:id', X); // update 
app.post('/json/action/:action', X);
app.get('/json/query/:query', X);


// FORM
// render (from ./views/:view.js)
app.get('/form/table/:table/:id/with/:view', X);
app.get('/form/list/table/:table/with/:view/order/:props', X);
app.get('/form/search/table/:table/with/:view', X);
// saved query (in ./queries/:query.js)
app.get('/form/query/:query/with/:view', X);

app.post('/form/table/:table/new', X);
app.post('/form/table/:table/:id', X);
app.post('/form/action/:action', X);


app.listen(PORT, err => {

});



