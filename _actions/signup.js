import {
  LOGINLINKS_TABLE, SESSION_TABLE, COOKIE_NAME,
  addUser, newLoginLink
} from '../server.js';

export default function action({username, password, email}, {getTable, newItem}, req, res) {
  const user = addUser({username, email, password, verified: false}, 'users');

  /**
  const session = newItem({table:getTable(SESSION_TABLE), item: {userid:user._id}});
  res.cookie(COOKIE_NAME, session._id);
  **/

  const loginLink = newItem({table:getTable(LOGINLINKS_TABLE), item: {userid:user._id, href:newLoginLink(req)}});

  // email the loginLink to email
  console.log({emailTask:loginLink});

  return {username, email};
}
