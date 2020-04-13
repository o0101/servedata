import {NOUSER_ID, DB_ROOT, USER_TABLE, SESSION_TABLE, PERMISSION_TABLE} from './server.js';

export default function init({getTable, config}) {
  // config  
  config({root:DB_ROOT});

  // basic tables
  const utable = getTable(USER_TABLE);
  const stable = getTable(SESSION_TABLE);
  const ptable = getTable(PERMISSION_TABLE);

  // basic perms
  const scope0_a = `${NOUSER_ID}:action/create_session`;
  const scope0_u = `${NOUSER_ID}:table/users`;
  const scope0_s = `${NOUSER_ID}:table/sessions`;
  const permissions = {create:true, view:true};

  utable.put(NOUSER_ID, {userid:NOUSER_ID});

  ptable.put(scope0_a, {create:true});
  ptable.put(scope0_u, {create:true});
  ptable.put(scope0_s, {create:true});

  console.log("Init called");
}
