import {
  DEBUG,
  NOUSER_ID, 
  GROUP_TABLE, USER_TABLE, PERMISSION_TABLE,
  DEPOSIT_TABLE,
  SYSTEM_PAYMENT_ACCOUNT
} from './common.js';
import {
  addUser
} from './helpers.js';
import {
  DB_ROOT, 
  setItem,
} from './db_helpers.js';
import Perms from './permissions.js';

const ADMIN_EMAIL = 'your@email.com';

export const IndexProps = {
  [USER_TABLE]: ["username", "email"],
  [DEPOSIT_TABLE]: ["txID"]
};

export function init({_getTable, config}) {
  try {
    // config  
    config({root:DB_ROOT});

    // basic tables
    const utable = _getTable(USER_TABLE);
    const ptable = _getTable(PERMISSION_TABLE);
    const gtable = _getTable(GROUP_TABLE);

    // add basic users 'no user', 'test user' (regular user), 'useradmin' (user admin), 
    // and 'globaladmin' (global admin)

    const noUser = {
      _owner: NOUSER_ID,
      username: 'nouser',
      email: 'no-one@nowhere.nothing',
      salt: 0,
      passwordHash: '0000000000000000',
      groups:['nousers'],
      stripeCustomerID: SYSTEM_PAYMENT_ACCOUNT,
      verified: false
    };

    setItem({table:utable, id:NOUSER_ID, item:noUser});

    gtable.put('nousers', {name:'nousers', users: [NOUSER_ID], description:'not logged in users'});
    gtable.put('users', {name:'users', users: [], description:'regular users'});
    gtable.put('useradmins', {name:'useradmins', users: [], description:'user administrators'});
    gtable.put('globaladmins', {name:'globaladmins', users: [], description:'global administrators'});

    try {
      addUser({username:'test9', email:ADMIN_EMAIL, stripeCustomerID: SYSTEM_PAYMENT_ACCOUNT, password:'abc123', verified: true}, 'users');
    } catch(e) {
      DEBUG.INFO && console.info(e+'');
    }
    try {
      addUser({username:'useradmin', email:ADMIN_EMAIL, stripeCustomerID: SYSTEM_PAYMENT_ACCOUNT, password:'abc123', verified: true}, 'users', 'useradmins');
    } catch(e) {
      DEBUG.INFO && console.info(e+'');
    }
    try {
      addUser({username:'globaladmin', email:ADMIN_EMAIL, stripeCustomerID: SYSTEM_PAYMENT_ACCOUNT, password:'abc123', verified: true}, 'users', 'globaladmins');
    } catch(e) {
      DEBUG.INFO && console.info(e+'');
    }

    // add perms

    DEBUG.INFO && console.log({Perms});

    for( const [scope, perm] of Perms ) {
      ptable.put(scope, perm);
    }

    console.log("Init called");

    return new Map([...Object.entries(IndexProps)]);
  } catch(e) {
    console.log("Error on DB initialization", e);
  }
}
