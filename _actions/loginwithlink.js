import {
  USER_TABLE, SESSION_TABLE, COOKIE_NAME, GROUP_TABLE,
  addUser
} from '../server.js';

export default function action({username, password, email}, {getTable, newItem}, req, res) {
  const user = addUser({username, email, password}, 'users');

  const session = newItem({table:getTable(SESSION_TABLE), item: {userid:user._id}});
  res.cookie(COOKIE_NAME, session._id);

  const loginLink = newItem({table:getTable(LOGINLINKS_TABLE), item: {userid:user._id, href:newLoginLink()}});

  // email the loginLink to email

  return {session};
}
