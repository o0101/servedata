import {
  NOUSER_ID, 
  GROUP_TABLE, USER_TABLE, SESSION_TABLE, PERMISSION_TABLE,
} from './common.js';
import {
  addUser
} from './helpers.js';
import {
  DB_ROOT, 
  newItem,
  setItem,
} from './db_helpers.js';
import Perms from './permissions.js';

export default function init({getTable, newItem, config, dropTable}) {
  // config  
  config({root:DB_ROOT});

  // basic tables
  const utable = getTable(USER_TABLE);
  const stable = getTable(SESSION_TABLE);
  const ptable = getTable(PERMISSION_TABLE);
  const gtable = getTable(GROUP_TABLE);

  // add basic users 'no user', 'test user' (regular user), 'useradmin' (user admin), 
  // and 'globaladmin' (global admin)

  const noUser = {
    _owner: NOUSER_ID,
    username: 'nouser',
    email: 'no-one@nowhere.nothing',
    salt: 0,
    passwordHash: '0000000000000000',
    groups:['nousers'],
    verified: false
  };
  setItem({table:utable, id:NOUSER_ID, item:noUser});
  gtable.put('nousers', {name:'nousers', users: [NOUSER_ID], description:'not logged in users'});

  gtable.put('users', {name:'users', users: [], description:'regular users'});
  gtable.put('useradmins', {name:'useradmins', users: [], description:'user administrators'});
  gtable.put('globaladmins', {name:'globaladmins', users: [], description:'global administrators'});

  addUser({username:'test9', email:'cris7fe@gmail.com', password:'abc123', verified: true}, 'users');
  addUser({username:'useradmin', email:'cris7fe@gmail.com', password:'abc123', verified: true}, 'users', 'useradmins');
  addUser({username:'globaladmin', email:'cris7fe@gmail.com', password:'abc123', verified: true}, 'users', 'globaladmins');

  // add perms

  for( const [scope, perm] of Perms ) {
    ptable.put(scope, perm);
  }

  console.log("Init called");
}
