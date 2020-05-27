// imports
  import path from 'path';
  import fs from 'fs';

  import {config, getTable} from 'stubdb';

  import {
    DEBUG,
    APP_ROOT
  } from './common.js';
  import {
    newRandom32BitSeed,
    nextKey,
    formatError,
  } from './helpers.js';

// constants
  // cache 
    export const SchemaValidators = {};
    export const Tables = new Map();

  // file location constants
    export const DB_ROOT = path.resolve(APP_ROOT, "db-servedata");
    export const SCHEMAS = process.env.SD_SCHEMAS ? path.resolve(process.env.SD_SCHEMAS) : path.resolve(APP_ROOT, "_schemas");
    export const ACTIONS = process.env.SD_ACTIONS ? path.resolve(process.env.SD_ACTIONS) : path.resolve(APP_ROOT, "_actions");
    export const QUERIES = process.env.SD_QUERIES ? path.resolve(process.env.SD_QUERIES) : path.resolve(APP_ROOT, "_queries");
    export const SELECTIONS = process.env.SD_SELECTIONS ? 
      path.resolve(process.env.SD_SELECTIONS) : path.resolve(APP_ROOT, "_selections");

  // database table name constants
    export const SearchControl = new Set([
      "_keywords",
      "_and"
    ]);

// database helpers and adapters 
  export async function loadSchemas() {
    const entries = fs.readdirSync(SCHEMAS);

    for( const file of entries ) {
      if ( file.startsWith('.') || ! file.endsWith('.js') ) continue;
      const {default:validator, validatePartial:partialMatch} = await import(path.resolve(SCHEMAS, file));  
      const tableName = file.replace(/\.js$/, '');
      SchemaValidators[tableName] = validator;
      Object.assign(SchemaValidators[tableName], {partialMatch});
    }
  }

  export function getItem({table, id}) {
    return table.get(id);
  }

  export function getList({table}) {
    return table.getAll();
  }

  export function getListSorted({table, prop}) {
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

  export function getSearchResult({table, _search}) {
    const list = getList({table});
    let result;
    if ( _search._keywords ) {
      const {_keywords} = _search;
      result = list.filter(item => JSON.stringify(item).includes(_keywords));
    } else {
      const attrs = Object.keys(_search).filter(attr => 
        !SearchControl.has(attr) && 
        _search[attr] !== undefined && 
        _search[attr] !== null &&
        _search[attr] !== ''
      );

      const partialEntry = attrs.reduce((pe, attr) => (pe[attr] = _search[attr], pe), {});
      const {errors, valid:attributesValid} = SchemaValidators[table.tableInfo.name].partialMatch(partialEntry);

      if ( !attributesValid ) {
        throw new TypeError(`Search on table ${table.tableInfo.name} has attribute errors in the provided query: \n${
          JSON.stringify({query:partialEntry, errors}, null, 2)
        }`);
      }

      if ( _search._and ) {
        result = list.filter(item => attrs.every(attr => {
          try {
            return JSON.stringify(item[attr]).includes(_search[attr])
          } catch(e) {
            console.warn(e);
            console.log({item,attr,_search});
            return false;
          }
        }));
      } else {
        result = list.filter(item => attrs.some(attr => JSON.stringify(item[attr]).includes(_search[attr])));
      }
    }

    return result;
  }

  export function getStoredQueryResult() {
    throw new Error("Not implemented");
  }

  export function newItem({table, item}) {
    const id = nextKey();
    item._id = id;
    const errors = SchemaValidators[table.tableInfo.name](item);
    if ( errors.length ) {
      throw new TypeError(`Addition to table ${table.tableInfo.name} has errors: ${JSON.stringify(errors.map(formatError),null,2)}`);
    }
    table.put(id, item);
    return item;
  }

  export function setItem({table, id, item}) {
    item._id = id;
    let existingItem;
    try {
      existingItem = table.get(id);
    } catch(e) {
      console.log(`could not get ${id}`, e);
      existingItem = {};
    }
    item = Object.assign(existingItem, item);
    const errors = SchemaValidators[table.tableInfo.name](item);
    if ( errors.length ) {
      throw new TypeError(`Addition to table ${table.tableInfo.name} has errors: ${JSON.stringify(errors.map(formatError),null,2)}`);
    }
    table.put(id, item);
    return item;
  }

  export async function getSelectionData({selection, id}) {
    const selectionFileName = path.resolve(SELECTIONS, `${selection}.js`); 
    const {select} = await import(selectionFileName);
    const result = select({id});
    return result;
  }

  export async function displaySelectionData({selection, id}) {
    const selectionFileName = path.resolve(SELECTIONS, `${selection}.js`); 
    const {select,display} = await import(selectionFileName);
    const result = display(select({id}));
    return result;
  }

  export async function runStoredAction({action, item}, req, res) {
    const actionFileName = path.resolve(ACTIONS, `${action}.js`); 
    const {default:Action} = await import(actionFileName);
    const result = Action(item, {getTable, newItem, setItem, getSearchResult}, req, res);
    return result;
  }

  export function _getTable(table) {
    if ( !Tables.has(table) ) {
      Tables.set(table, getTable(table));
    }
    return Tables.get(table);
  }

