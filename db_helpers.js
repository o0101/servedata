// imports
  import path from 'path';
  import fs from 'fs';

  import {config, getIndexedTable} from 'stubdb';

  import {
    INIT_SCRIPT, 
    DEBUG,
    APP_ROOT,
    MAX_RECORD_SIZE_BYTES
  } from './common.js';
  import {
    guardNumber,
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
      "_and",
      "_exact"
    ]);

  // validation
    const ALLOW = {allow:true};
    const VALIDATE_MAX_RECORD_SIZE = ({recordString,key}) => {
      if ( recordString.length > MAX_RECORD_SIZE_BYTES ) {
        return {
          allow: false,
          reasons: `Record for key ${key} exceeds max record size bytes ${MAX_RECORD_SIZE_BYTES}`
        };
      } else {
        return ALLOW;
      }
    };

// scope
  let IndexProps;

// database helpers and adapters 
  export async function initialize() {
    const {init:initialize, IndexProps:props} = await import(INIT_SCRIPT);
    await loadSchemas();
    IndexProps = new Map([...Object.entries(props)]);
    initialize({_getTable, config});
  }

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

  export function getItem({table, id}, greenlights) {
    return table.get(id, greenlights);
  }

  export function getList({table}, greenlights) {
    return table.getAll(greenlights);
  }

  export function getListSorted({table, prop}, greenlights) {
    const list = table.getAll(greenlights);
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

  export function getSearchResult({table, _search}, greenlights) {
    let result = [];

    if ( _search._keywords ) {
      const {_keywords} = _search;
      const list = getList({table}, greenlights);
      result = list.filter(item => JSON.stringify(item).includes(_keywords));
    } else {
      const attrs = Object.keys(_search).filter(attr => 
        !SearchControl.has(attr) && 
        _search[attr] !== undefined && 
        _search[attr] !== null &&
        _search[attr] !== ''
      );

      const partialEntry = attrs.reduce((pe, attr) => (pe[attr] = _search[attr], pe), {});
      const {errors, valid:attributesValid} = SchemaValidators[table.tableInfo.name].partialMatch(partialEntry, "get");

      if ( !attributesValid ) {
        throw new TypeError(`Search on table ${table.tableInfo.name} has attribute errors in the provided query: \n${
          JSON.stringify({query:partialEntry, errors}, null, 2)
        }`);
      }

      if ( _search._exact ) {
        const results = new Set();
        for ( const attr of attrs ) {
          const attrResults = table.getAllMatchingKeysFromIndex(attr, _search[attr]);
          if ( _search._and ) {
            if ( results.size ) {
              const attrResultSet = new Set(attrResults);
              [...results.keys()].forEach(key => {
                if ( ! attrResultSet.has(key) )  {
                  results.delete(key);
                }
              });
            } else {
              attrResults.forEach(key => results.add(key));
            }
          } else {
            attrResults.forEach(key => results.add(key));
          }
        }
        if ( ! _search._keysonly ) {
          [...results.keys()].forEach(key => {
            result.push(table.get(key));
          });
        }
      } else {
        const list = getList({table}, greenlights);
        const MATCHER = (a,b) => (a+'').includes(b+'');

        if ( _search._and ) {
          result = list.filter(item => attrs.every(attr => {
            try {
              return MATCHER(item[attr], _search[attr]);
            } catch(e) {
              DEBUG.WARN && console.warn(e);
              DEBUG.INFO && console.log({item,attr,_search});
              return false;
            }
          }));
        } else {
          result = list.filter(item => attrs.some(attr => MATCHER(item[attr],_search[attr])));
        }
      }
    }

    return result;
  }

  export function getStoredQueryResult() {
    throw new Error("Not implemented");
  }

  export function newItem({table, userid:userid = null, ownerId:ownerId = null, item}, greenlights = []) {
    const id = nextKey();
    item._id = id;
    if ( userid ) {
      item._owner = userid;
    }
    if ( ownerId ) {
      item._owner = id;
    }
    if ( ! item._owner ) {
      throw new TypeError(`Item must have owner ${JSON.stringify({table,item})}`);
    }
    const errors = SchemaValidators[table.tableInfo.name](item);
    if ( errors.length ) {
      throw new TypeError(`Addition to table ${table.tableInfo.name} has errors: ${JSON.stringify(errors.map(formatError),null,2)}`);
    }
    greenlights.push(VALIDATE_MAX_RECORD_SIZE);
    table.put(id, item, greenlights);
    return item;
  }

  export function setItem({table, id, item}, greenlights = []) {
    item._id = id;
    let existingItem;
    // for setItem greenlights are only on the 'put' not the 'get'
    try {
      existingItem = table.get(id);
    } catch(e) {
      DEBUG.INFO && console.log(`could not get ${id}`, e);
      existingItem = {};
    }
    item = Object.assign(existingItem, item);
    const errors = SchemaValidators[table.tableInfo.name](item);
    if ( errors.length ) {
      throw new TypeError(`Addition to table ${table.tableInfo.name} has errors: ${JSON.stringify(errors.map(formatError),null,2)}`);
    }
    greenlights.push(VALIDATE_MAX_RECORD_SIZE);
    table.put(id, item, greenlights);
    return item;
  }

  export async function getSelectionData({selection, id}, greenlights) {
    const selectionFileName = path.resolve(SELECTIONS, `${selection}.js`); 
    const {select} = await import(selectionFileName);
    const result = select({id}, greenlights);
    return result;
  }

  export async function displaySelectionData({selection, id}, greenlights) {
    const selectionFileName = path.resolve(SELECTIONS, `${selection}.js`); 
    const {select,display} = await import(selectionFileName);
    const result = display(select({id}, greenlights));
    return result;
  }

  export async function runStoredAction({action, item}, req, res, greenlights) {
    const actionFileName = path.resolve(ACTIONS, `${action}.js`); 
    const {default:Action} = await import(actionFileName);
    const result = Action(item, {_getTable, getItem, newItem, setItem, getSearchResult}, req, res, greenlights);
    return result;
  }

  export function _getTable(table) {
    if ( !Tables.has(table) ) {
      const props = IndexProps.get(table);
      DEBUG.INFO && console.log(props, IndexProps, table);
      Tables.set(table, getIndexedTable(table, IndexProps.get(table)));
      // tables refresh every 30 seconds
        // the reason we do this is, if there's some problem and 
        // say the table directory has been deleted (um, ok)
        // re getting the table reconstructs a new table directory
        // obviously we might want to know about this situation, instead of 
        // just making it silently fix here
        // but I think monitoring on disk deletions could be purview of another process, not the server,
        // and adding a check if the directory exists into every access only increases load on the ops we do
        // so just removing a table after 30 seconds from the cache, so it can be refreshed on next db op is a good idea
        // this makes the table cache self healing and helps increase the reliability of the server
        // without adding undue pressure to any ops
      setTimeout(() => Tables.delete(table), 30000);
    }
    return Tables.get(table);
  }

