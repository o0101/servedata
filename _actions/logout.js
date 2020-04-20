import {COOKIE_NAME} from '../common.js';

export default function action(_, {getTable, setItem}, req, res) {
  const stable = getTable('sessions');

  const {session} = req.authorization;

  setItem({table:stable, id:session._id, item:{loggedOut:true}});
  
  res.clearCookie(COOKIE_NAME);

  return {session};
}
