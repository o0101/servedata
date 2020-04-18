import {T} from 'jtype-system';


T.def('LoginLink', {
  userid: T`Userid`,
  href: T`URL`,
  expired: T`MaybeBoolean`
}, {
  verify: s => (s.userid+'').length < 200 && 
    s.href.length > 10 && 
    s.href.length < 200
});

export default function validate(loginLink) {
  return T.errors(T`LoginLink`, loginLink);
}
