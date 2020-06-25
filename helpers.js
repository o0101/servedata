// imports
  import url from 'url';
  import crypto from 'crypto';

  import {beamsplitter} from 'beamsplitter';

  import {
    USER_TABLE,
    GROUP_TABLE,
  } from './common.js';

  import {newItem, _getTable} from './db_helpers.js';

  import {PermNames} from './permissions.js';

// error helpers
  export const JSON_ERROR = msg => JSON.stringify({error:msg});
  export const HTML_ERROR = msg => `<h1>Error</h1><p>${msg}</p>`;

// helpers
  export function Log(obj, stdErr = false) {
    console.log(JSON.stringify(obj));
    if( stdErr ) {
      console.error(obj);
    }
  }

  export function guardNumber(x) {
    const parsed = Number(x);
    if ( Number.isNaN(parsed) ) {
      throw new Error(`Value ${x} is not a number.`);
    }
    return parsed;
  }

  export function nextKey() {
    const v = crypto.randomBytes(5).readUIntBE(0,5);
    return v.toString(36);
  }

  export function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  export function formatError(e) {
    if ( e instanceof Error ) {
      return {error: e.stack.split(/\s*\n\s*/g)};
    } else if ( ! e.error ) {
      return {error: e};
    } else return e;
  }

  export function newRandom32BitSeed() {
    return crypto.randomBytes(4).readUInt32BE();
  }

  export function hashPassword(password) {
    const randomSalt = newRandom32BitSeed();
    const passwordHash = beamsplitter(password, randomSalt).toString(16);
    return {randomSalt, passwordHash};
  }

  export function addUser({username, email, password, stripeCustomerID, verified}, ...groups) {
    const {passwordHash, randomSalt} = hashPassword(password);
    const user = {
      username, 
      email,
      salt: randomSalt,
      passwordHash,
      groups,
      stripeCustomerID,
      verified
    }
    const userObject = newItem({table:_getTable(USER_TABLE), item:user, ownerId: true});
    const gtable = _getTable(GROUP_TABLE);
    for( const group of groups ) {
      const groupObject = gtable.get(group);
      groupObject.users[userObject._id] = true;
      gtable.put(group, groupObject);
    }
    return userObject;
  }

  export function noPerms() {
    const perm = {};

    return perm;
  }

  export function grantAllPerms() {
    const perm = {};

    for( const name of PermNames ) {
      perm[name] = true;
    }

    return perm;
  }

  export function denyAllPerms() {
    const perm = {};

    for( const name of PermNames ) {
      perm[name] = false;
    }

    return perm;
  }

  export function grant(perms, new_perms) {
    for( const name of PermNames ) {
      if ( new_perms[name] == undefined ) continue;
      perms[name] = new_perms[name];
    }
  }

  export function route(req, pathname) {
    return url.format({
      pathname,
      host: req.get('host'),
      protocol: req.protocol
    });
  }

