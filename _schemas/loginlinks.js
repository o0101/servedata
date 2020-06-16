import {T} from 'jtype-system';


T.def('LoginLink', {
  _owner: T`ID`,
  _id: T`ID`,
  userid: T`ID`,
  expired: T`MaybeBoolean`
}, {
  verify: s => (s.userid+'').length < 200
});

export default function validate(loginLink) {
  return T.errors(T`LoginLink`, loginLink);
}

export function validatePartial(partialLoginLink) {
  return T.partialMatch(T`LoginLink`, partialLoginLink);
}
