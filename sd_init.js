import {NOUSER_ID, DB_ROOT, GROUP_TABLE, USER_TABLE, SESSION_TABLE, PERMISSION_TABLE} from './server.js';
import Perms from './permissions.js';

export default function init({getTable, newItem, config}) {
  // config  
  config({root:DB_ROOT});

  // basic tables
  const utable = getTable(USER_TABLE);
  const stable = getTable(SESSION_TABLE);
  const ptable = getTable(PERMISSION_TABLE);
  const gtable = getTable(GROUP_TABLE);

  // add basic users 'no user', 'test user' (regular user), 'useradmin' (user admin), 
  // and 'globaladmin' (global admin)

  utable.put(NOUSER_ID, {userid:NOUSER_ID, groups:['nousers']});
  gtable.put('nousers', {name:'nousers', users: [NOUSER_ID], description:'not logged in users'});

  newItem({table:utable, item:{name:'test', groups:['users']});
  newItem({table:utable, item:{name:'useradmin', groups:['users', 'useradmins']});
  newItem({table:utable, item:{name:'globaladmin', groups:['users', 'globaladmins']});

  // add perms

  for( const [scope, perm] of Perms ) {
    ptable.put(scope, perm);
  }

  console.log("Init called");
}
