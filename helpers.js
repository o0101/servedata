// imports
  import path from 'path';
  import fs from 'fs';
  import crypto from 'crypto';

  import {beamsplitter} from 'beamsplitter';
  import {getTable} from 'stubdb';

  import {
    USER_TABLE,
    GROUP_TABLE
  } from './common.js';

  import {newItem} from './db_helpers.js';

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

  export function addUser({username, email, password, verified}, ...groups) {
    const randomSalt = newRandom32BitSeed();
    const user = {
      username, 
      email,
      salt: randomSalt,
      passwordHash: beamsplitter(password, randomSalt).toString(16),
      groups,
      verified
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


