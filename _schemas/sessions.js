import {T} from 'jtype-system';

T.defOr('Userid', T`String`, T`Number`);

T.def('Session', {
  userid: T`Userid`
}, {
  verify: s => (s.userid+'').length < 200
});

export default function validate(session) {
  return T.errors(T`Session`, session);
}
