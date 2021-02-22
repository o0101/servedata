import {T} from 'jtype-system';

const DateNow = '1603295504185';    // all transactions should occur after this date

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

T.def('TimeStamp', null, {
  verify: t => Number.isInteger(t) && t > DateNow
});
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

// transaction field types

  // I think checking match does not work for sub types so we can't do this (yet...)
  // T.defSub(T`String`, null, {...}, 'Currency');

  T.def('Currency', null, {
    verify: s => s.length == 3
  });

  T.defEnum('TransactionType', 'onetime-payment', 'subscription');

  T.def('TransactionDescription', {
    code: T.maybe(T`Integer`),
    // can't use 'defSub' yet for checks (vanillatype: todo/issues#26)
    // so just throw a String check in the verify
    detail: T.def('DetailText', null, {
      verify: s => T.check(T`String`, s) && s.length <= 400,
      help: 'A string less than 400 characters'
    })
  });

  T.def('IntegerSign', null, {verify: i => Number.isInteger(i) && i == Math.sign(i)});
