import {COOKIE_NAME, SESSION_TABLE} from '../common.js';

export default function action(_, {_getTable, setItem}, req, res) {
  const stable = _getTable(SESSION_TABLE);

  const {session} = req.authorization;

  setItem({table:stable, id:session._id, item:{loggedOut:true}});
  
  res.clearCookie(COOKIE_NAME);

  return {session};
}
