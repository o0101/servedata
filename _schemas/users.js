import {T} from 'jtype-system';

T.def('User', {
  _id: T`ID`,
  username: T`Username`,
  email: T`Email`,
  salt: T`Integer`,
  passwordHash: T`Hash`,
  groups: T`GroupArray`,
  verified: T.maybe(T`Boolean`)
});

export default function validate(user) {
  return T.errors(T`User`, user);
}

export function validatePartial(partialUser) {
  return T.partialMatch(T`User`, partialUser).valid;
}
