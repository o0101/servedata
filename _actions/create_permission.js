import {COOKIE_NAME} from '../server.js';

export default function action({userid}, {getTable, newItem}, req, res) {
  const utable = getTable('users');
  const stable = getTable('sessions');
  const ptable = getTable('permissions');
  const session = newItem({table:stable, item: {userid}});
  res.cookie(COOKIE_NAME, session._id);
  const scope = `${userid}:/form/table/pencil/new/with/pencil`;
  const permissions = {create:true};
  utable.put(userid, {userid});
  ptable.put(scope, permissions);
  return {session, permissions, scope};
}
