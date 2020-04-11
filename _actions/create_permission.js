import {COOKIE_NAME} from '../server.js';

export default function action({userid}, {getTable, newItem}, req, res) {
  const utable = getTable('users');
  const stable = getTable('sessions');
  const ptable = getTable('permissions');
  const session = newItem({table:stable, item: {userid}});
  res.cookie(COOKIE_NAME, session._id);
  const scope1 = `${userid}:table/pencil`;
  const scope2 = `${userid}:action/newbox`;
  const permissions = {create:true, view:true};
  utable.put(userid, {userid});
  ptable.put(scope1, permissions);
  ptable.put(scope2, permissions);
  const scope = JSON.stringify([scope1, scope2]);
  return {session, permissions, scope};
}
