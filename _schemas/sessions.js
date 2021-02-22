import {T} from 'jtype-system';

T.def('Session', {
  _owner: T`ID`,
  _id: T`ID`,
  userid: T`ID`,
  loggedOut: T`MaybeBoolean`
}, {
  verify: s => (s.userid+'').length < 200
});

export default function validate(session) {
  return T.errors(T`Session`, session);
}

export function validatePartial(partialSession) {
  return T.partialMatch(T`Session`, partialSession);
}
