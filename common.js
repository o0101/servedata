// imports
  import path from 'path';
  import fs from 'fs';
  import {fileURLToPath} from 'url';

// debug
  console.log({sd_mode:process.env.SD_MODE});

  export const DEBUG = {
    BUILD: process.env.SD_MODE == 'dev' ? 'src' : 'dist',
    CONSOLE_ERROR: true,
    WARN: true,
    ERROR: true,
    INFO: true
  };

// constants
  export const DEFAULT_PORT = 80;
  export const PORT = process.env.SD_PORT || Number(process.argv[2] || DEFAULT_PORT);
  export const APP_ROOT = path.dirname(fileURLToPath(import.meta.url));
  export const COOKIE_NAME = process.env.SD_COOKIE_NAME ? process.env.SD_COOKIE_NAME : fs.readFileSync(path.resolve(APP_ROOT, "cookie_name")).toString('utf8').trim();
  export const VIEWS = process.env.SD_VIEWS ? path.resolve(process.env.SD_VIEWS) : path.resolve(APP_ROOT, "_views");
  export const STATIC = process.env.SD_STATIC_FILES ? path.resolve(process.env.SD_STATIC_FILES) : path.resolve(APP_ROOT, "public");
  export const MAX_REQUEST_SIZE = "4kb";
  export const MAX_RECORD_SIZE_BYTES = "3000";

// mail sending related constants
  export const MAIL_SENDER = 'cris@dosycorp.com';
  export const MAIL_HOST = 'smtp.gmail.com';
  export const MAIL_PORT = 465;

// database related constants
  export const INIT_SCRIPT = process.env.SD_INIT_SCRIPT ? path.resolve(process.env.SD_INIT_SCRIPT) : path.resolve(APP_ROOT, "sd_init.js");
  export const USER_TABLE = process.env.SD_USER_TABLE ? process.env.SD_USER_TABLE : "users";
  export const SESSION_TABLE = process.env.SD_SESSION_TABLE ? process.env.SD_SESSION_TABLE : "sessions";
  export const PERMISSION_TABLE = process.env.SD_PERMISSION_TABLE ? process.env.SD_SESSION_TABLE : "permissions";
  export const GROUP_TABLE = process.env.SD_GROUP_TABLE ? process.env.SD_GROUP_TABLE : "groups";
  export const LOGINLINK_TABLE = process.env.SD_LOGINLINK_TABLE ? process.env.SD_LOGINLINK_TABLE : "loginlinks";
  export const DEPOSIT_TABLE = process.env.SD_DEPOSIT_TABLE ? process.env.SD_DEPOSIT_TABLE : "deposits";
  export const NOUSER_ID = 'nouser';

// payment related constants
  export const PAYMENT_MODE = 'live';
  export const SYSTEM_PAYMENT_ACCOUNT = 'system_class_payment_account';
  export const PAYMENT_TYPES = [
    "card",
  ];
