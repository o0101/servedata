import {
  USER_TABLE, SESSION_TABLE, 
  LOGINLINKS_TABLE,
  COOKIE_NAME, 
} from '../server.js';

export default function action({loginId}, {getTable, newItem, setItem}, req, res) {
  const linkTable = getTable(LOGINLINKS_TABLE);
  const userTable = getTable(USER_TABLE);

  let loginLink;
  let user;

  try {
    loginLink = linkTable.get(loginId);
  } catch(e) {
    return res.status(401).send(`That login link does not exist`);
  }

  if ( loginLink.expired ) {
    return res.status(401).send(`That login link is expired`);
  }

  setItem({table:linkTable, id:loginLink._id, item: {expired:true}}); 

  try {
    user = userTable.get(loginLink.userid);
  } catch(e) {
    return res.status(401).send(`That login link is trying to log in a user that does not exist`);
  }

  const session = newItem({table:getTable(SESSION_TABLE), item: {userid:user._id}});
  res.cookie(COOKIE_NAME, session._id);

  return {session};
}
