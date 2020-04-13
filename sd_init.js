import {NOUSER_ID, DB_ROOT, GROUP_TABLE, USER_TABLE, SESSION_TABLE, PERMISSION_TABLE} from './server.js';

export default function init({getTable, config}) {
  // config  
  config({root:DB_ROOT});

  // basic tables
  const utable = getTable(USER_TABLE);
  const stable = getTable(SESSION_TABLE);
  const ptable = getTable(PERMISSION_TABLE);
  const gtable = getTable(GROUP_TABLE);

  // basic perms
  const scope0_as = `${NOUSER_ID}:action/create_session`;
  const scope0_au = `${NOUSER_ID}:action/create_user`;
  const scope1_d = `group/users:table/deposit`;
  const scope1_p = `group/users:table/pencil`;
  const scope1_a = `group/users:action/newbox`;
  const permissions = {create:true, view:true};

  utable.put(NOUSER_ID, {userid:NOUSER_ID, groups:['nouser']});
  gtable.put('nousers', {name:'nousers', users: [NOUSER_ID], description:'not logged in users'});
  

  ptable.put(scope0_as, {create:true});
  ptable.put(scope0_au, {create:true});
  ptable.put(scope1_d, {create:true, view:true});
  ptable.put(scope1_p, {create:true, view:true});
  ptable.put(scope1_a, {create:true});

  console.log("Init called");
}
