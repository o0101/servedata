import path from 'path';
import fs from 'fs';
import url from 'url';

import {config, getTable} from 'stubdb';
import {beamsplitter} from 'beamsplitter';

import {
  DEBUG,
  newRandom32BitSeed,
  nextKey,
  formatError
} from './helpers.js';


// cache 
  export const SchemaValidators = {};
  export const Tables = new Map();


//constants
  export const APP_ROOT = path.dirname(path.resolve(process.mainModule.filename));
  export const COOKIE_NAME = process.env.SD_COOKIE_NAME ? process.env.SD_COOKIE_NAME : fs.readFileSync(path.resolve(APP_ROOT, "cookie_name")).toString('utf8').trim();
  export const DB_ROOT = path.resolve(APP_ROOT, "db-servedata");
  export const SCHEMAS = process.env.SD_SCHEMAS ? path.resolve(process.env.SD_SCHEMAS) : path.resolve(APP_ROOT, "_schemas");
  export const ACTIONS = process.env.SD_ACTIONS ? path.resolve(process.env.SD_ACTIONS) : path.resolve(APP_ROOT, "_actions");
  export const QUERIES = process.env.SD_QUERIES ? path.resolve(process.env.SD_QUERIES) : path.resolve(APP_ROOT, "_queries");
  export const VIEWS = process.env.SD_VIEWS ? path.resolve(process.env.SD_VIEWS) : path.resolve(APP_ROOT, "_views");
  export const STATIC = process.env.SD_STATIC_FILES ? path.resolve(process.env.SD_STATIC_FILES) : path.resolve(APP_ROOT, "public");
  export const INIT_SCRIPT = process.env.SD_INIT_SCRIPT ? path.resolve(process.env.SD_INIT_SCRIPT) : path.resolve(APP_ROOT, "sd_init.js");
  export const USER_TABLE = process.env.SD_USER_TABLE ? process.env.SD_USER_TABLE : "users";
  export const SESSION_TABLE = process.env.SD_SESSION_TABLE ? process.env.SD_SESSION_TABLE : "sessions";
  export const PERMISSION_TABLE = process.env.SD_PERMISSION_TABLE ? process.env.SD_SESSION_TABLE : "permissions";
  export const GROUP_TABLE = process.env.SD_GROUP_TABLE ? process.env.SD_GROUP_TABLE : "groups";
  export const LOGINLINK_TABLE = process.env.SD_LOGINLINK_TABLE ? process.env.SD_LOGINLINK_TABLE : "loginlinks";
  export const DEPOSIT_TABLE = process.env.SD_DEPOSIT_TABLE ? process.env.SD_DEPOSIT_TABLE : "deposits";
  export const NOUSER_ID = 'nouser';
  export const PermNames = [
    'excise',
    'view',
    'alter',
    'create'
  ];
  export const SearchControl = new Set([
    "_keywords",
    "_and"
  ]);

// database adapters
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
        _search[attr] !== null
      );

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

  export async function runStoredAction({action, item}, req, res) {
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

  export function _getTable(table) {
    if ( !Tables.has(table) ) {
      Tables.set(table, getTable(table));
    }
    return Tables.get(table);
  }
  export function addUser({username, email, password}, ...groups) {
    const randomSalt = newRandom32BitSeed();
    const user = {
      username, 
      email,
      salt: randomSalt,
      passwordHash: beamsplitter(password, randomSalt).toString(16),
      groups
    }
    const userObject = newItem({table:getTable(USER_TABLE), item:user});
    const gtable = getTable(GROUP_TABLE);
    for( const group of groups ) {
      const groupObject = gtable.get(group);
      groupObject.users[userObject._id] = true;
      gtable.put(group, groupObject);
    }
    return userObject;
  }
  export async function loadSchemas() {
    const entries = fs.readdirSync(SCHEMAS);

    for( const file of entries ) {
      if ( file.startsWith('.') || ! file.endsWith('.js') ) continue;
      const {default:validator} = await import(path.resolve(SCHEMAS, file));  
      const tableName = file.replace(/\.js$/, '');
      SchemaValidators[tableName] = validator;
    }
  }

  export function newLoginLink(req, loginId) {
    return {
      formAction: url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: '/form/action/loginwithlink/with/app'
      }),
      linkHref: url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: `/form/table/${LOGINLINK_TABLE}/${loginId}/with/loginlink`,
      })
    };
  }

  export function blankPerms() {
    const perm = {};
    for( const name of PermNames ) {
      perm[name] = false;
    }
    return perm;
  }

  export function grant(perms, new_perms) {
    for( const name of PermNames ) {
      perms[name] |= new_perms[name];
    }
  }


