import {T} from 'jtype-system';

// common types required for compound types
// we define them once here 
// to avoid trying to redefine in each file that uses them

// regexes 
  const UsernameRegExp = /^[a-zA-Z][a-zA-Z0-9]{4,16}$/

  /* eslint-disable no-control-regex */

  const EmailRegExp = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  /* eslint-enable no-control-regex */

  const HexRegExp = /^[a-f0-9]{8,100}$/i;

T.defOr('MaybeBoolean', T`Boolean`, T`None`);
T.defOr('ID', T`String`, T`Number`);

T.def('URL', null, {
  verify: i => { 
    try { 
      return new URL(i); 
    } catch(e) { 
      return false; 
    }
  },
  help: "A valid URL"
});

// user field types
  T.defCollection('GroupArray',  {
    container: T`Array`,
    member: T`String`
  });

  T.def('Username', null, {verify: i => UsernameRegExp.test(i) && i.length < 200, help:"Alphanumeric between 5 and 16 characters"});
  T.def('Email', null, {verify: i => EmailRegExp.test(i) && i.length < 200, help: "A valid email address"});
  T.def('Hash', null, {verify: i => HexRegExp.test(i) && i.length < 200, help: "A hexadecimal hash value, between 8 and 100 characters"});

// deposit field types

  T.def('IntegerSign', null, {verify: i => Number.isInteger(i) && i == Math.sign(i)});
