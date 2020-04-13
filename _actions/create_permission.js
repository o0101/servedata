import {COOKIE_NAME, NOUSER_ID} from '../server.js';

export default function action({userid}, {getTable, newItem}, req, res) {
  const utable = getTable('users');
  const stable = getTable('sessions');
  const ptable = getTable('permissions');
  const session = newItem({table:stable, item: {userid}});
  res.cookie(COOKIE_NAME, session._id);
  const scope0_a = `${NOUSER_ID}:action/create_permission`;
  const scope0_u = `${NOUSER_ID}:table/users`;
  const scope0_s = `${NOUSER_ID}:table/sessions`;
  const scope1 = `${userid}:table/pencil`;
  const scope2 = `${userid}:action/newbox`;
  utable.put(NOUSER_ID, {userid:NOUSER_ID});
  utable.put(userid, {userid});
  ptable.put(scope0_u, {create:true});
  ptable.put(scope0_s, {create:true});
  ptable.put(scope0_a, {create:true});
  const permissions = {create:true, view:true};
  ptable.put(scope1, permissions);
  ptable.put(scope2, permissions);
  const scope = JSON.stringify([scope1, scope2]);
  return {session, permissions, scope};
}
