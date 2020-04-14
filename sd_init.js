import {NOUSER_ID, DB_ROOT, GROUP_TABLE, USER_TABLE, SESSION_TABLE, PERMISSION_TABLE} from './server.js';
import Perms from './permissions.js';

export default function init({getTable, config}) {
  // config  
  config({root:DB_ROOT});

  // basic tables
  const utable = getTable(USER_TABLE);
  const stable = getTable(SESSION_TABLE);
  const ptable = getTable(PERMISSION_TABLE);
  const gtable = getTable(GROUP_TABLE);

  // basic perms

  utable.put(NOUSER_ID, {userid:NOUSER_ID, groups:['nouser']});
  gtable.put('nousers', {name:'nousers', users: [NOUSER_ID], description:'not logged in users'});

  for( const [scope, perm] of Perms ) {
    ptable.put(scope, perm);
  }

  console.log("Init called");
}
