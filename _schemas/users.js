import {T} from 'jtype-system';

// regexes 
  const UsernameRegExp = /^[a-zA-Z][a-zA-Z0-9]{4,16}$/
  const EmailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  const HexRegExp = /^[a-f0-9]{8,32}$/i;

// user object field types
  T.defCollection('GroupArray',  {
    container: T`Array`,
    member: T`String`
  });

  T.def('Username', null, {verify: i => UsernameRegExp.test(i) && i.length < 200});
  T.def('Email', null, {verify: i => EmailRegExp.test(i) && i.length < 200});
  T.def('Hash', null, {verify: i => HexRegExp.test(i) && i.length < 200});

T.def('User', {
  username: T`Username`,
  email: T`Email`,
  password: T`Hash`,
  groups: T`GroupArray`
});

export default function validate(user) {
  return T.errors(T`User`, user);
}
