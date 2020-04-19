import {COOKIE_NAME, NOUSER_ID} from '../db_helpers.js';

export default function action({userid}, {getTable, newItem}, req, res) {
  const utable = getTable('users');
  const stable = getTable('sessions');
  const session = newItem({table:stable, item: {userid}});
  res.cookie(COOKIE_NAME, session._id);
  utable.put(userid, {userid});
  return {session};
}
