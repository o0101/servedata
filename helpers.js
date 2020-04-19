import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// debug
  export const DEBUG = {
    CONSOLE_ERROR: true,
    AUTH: true,
    WARN: true,
    ERROR: true,
    INFO: true
  };

// constants
  export const DEFAULT_PORT = 8080;
  export const PORT = process.env.SERVEDATA_PORT || Number(process.argv[2] || DEFAULT_PORT);

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

