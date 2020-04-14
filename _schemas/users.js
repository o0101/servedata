import {T} from 'jtype-system';

T.def('User', {
  username: T`Username`,
  email: T`Email`,
  passwordHash: T`Hash`,
  groups: T`GroupArray`,
  verified: T`Boolean`
});

export default function validate(user) {
  return T.errors(T`User`, user);
}
