import {
  USER_TABLE, SESSION_TABLE, 
  LOGINLINK_TABLE,
  COOKIE_NAME, 
} from '../db_helpers.js';

export default function action({id}, {getTable, newItem, setItem}, req, res) {
  const linkTable = getTable(LOGINLINK_TABLE);
  const userTable = getTable(USER_TABLE);

  let loginLink;
  let user;

  try {
    loginLink = linkTable.get(id);
  } catch(e) {
    res.status(401).send(`That login link does not exist`);
    throw e;
  }

  if ( loginLink.expired ) {
    res.status(401).send(`That login link is expired`);
    throw e;
  }

  setItem({table:linkTable, id:loginLink._id, item: {expired:true}}); 

  try {
    user = userTable.get(loginLink.userid);
  } catch(e) {
    res.status(401).send(`That login link is trying to log in a user that does not exist`);
    throw e;
  }

  const session = newItem({table:getTable(SESSION_TABLE), item: {userid:user._id}});
  res.cookie(COOKIE_NAME, session._id);

  return {session};
}
