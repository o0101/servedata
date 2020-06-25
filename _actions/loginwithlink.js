import {
  COOKIE_NAME,
  USER_TABLE, SESSION_TABLE, 
  LOGINLINK_TABLE,
} from '../common.js';

export default function action({id}, {_getTable, newItem, setItem}, req, res) {
  const linkTable = _getTable(LOGINLINK_TABLE);
  const userTable = _getTable(USER_TABLE);

  let loginLink;
  let user;

  try {
    loginLink = linkTable.get(id);
  } catch(e) {
    throw {status:401, error:`That login link does not exist`};
  }

  if ( loginLink.expired ) {
    throw {status:401, error:`That login link is expired`};
  }

  setItem({table:linkTable, id:loginLink._id, item: {expired:true}}); 

  try {
    user = userTable.get(loginLink.userid);
  } catch(e) {
    throw {status:401, error:`That login link is trying to log in a user that does not exist.`};
  }

  if ( user.newEmail ) {
    setItem({table:userTable, id:user._id, item:{email: user.newEmail, newEmail: null, verified:true}});
  } else {
    setItem({table:userTable, id:user._id, item:{verified:true}});
  }

  const session = newItem({table: _getTable(SESSION_TABLE), userid: user._id, item: {userid:user._id}});
  res.cookie(COOKIE_NAME, session._id);

  return {session, id:user._id};
}
