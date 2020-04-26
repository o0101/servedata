const BROWSER_SIDE      = (() => {try{ return self.DOMParser && true; } catch(e) { return false; }})();

  const BuiltIns = [
    Symbol, Boolean, Number, String, Object, Set, Map, WeakMap, WeakSet,
    Uint8Array, Uint16Array, Uint32Array, Float32Array, Float64Array,
    Int8Array, Int16Array, Int32Array, 
    Uint8ClampedArray, 
    ...(BROWSER_SIDE ? [
      Node,NodeList,Element,HTMLElement, Blob, ArrayBuffer,
      FileList, Text, Document, DocumentFragment,
      Error, File, Event, EventTarget, URL
    ] : [ Buffer ])
  ];

  const isNone = instance => instance == null || instance == undefined;

  const typeCache = new Map();

  Object.assign(T, {
    check, sub, verify, validate, 
    partialMatch,
    def, defSub, defTuple, defCollection, defOr, option, defOption, maybe, or, 
    guard, errors
  });
  
  T[Symbol.for('jtype-system.typeCache')] = typeCache;

  defineSpecials();
  mapBuiltins();

  function T(parts, ...vals) {
    const cooked = vals.reduce((prev,cur,i) => prev+cur+parts[i+1], parts[0]);
    const typeName = cooked;
    if ( !typeCache.has(typeName) ) throw new TypeError(`Cannot use type ${typeName} before it is defined.`);
    return typeCache.get(typeName).type;
  }

  function partialMatch(type, instance) {
    return validate(type, instance, {partial:true});
  }

  function validate(type, instance, {partial: partial = false} = {}) {
    guardType(type);
    guardExists(type);
    const typeName = type.name;

    const {spec,kind,verify,verifiers,sealed,native} = typeCache.get(typeName);

    const specKeyPaths = spec ? allKeyPaths(spec).sort() : [];
    const specKeyPathSet = new Set(specKeyPaths);

    const bigErrors = [];

    switch(kind) {
      case "def": {
        let allValid = true;
        if ( !! spec ) {
          const keyPaths = partial ? allKeyPaths(instance, specKeyPathSet) : specKeyPaths;
          allValid = !isNone(instance) && keyPaths.every(kp => {
            // Allow lookup errors if the type match for the key path can include None

            const {resolved, errors:lookupErrors} = lookup(instance,kp,() => checkTypeMatch(lookup(spec,kp).resolved, T`None`));
            bigErrors.push(...lookupErrors);

            if ( lookupErrors.length ) return false;

            const keyType = lookup(spec,kp).resolved;
            if ( !keyType || !(keyType instanceof Type) ) {
              bigErrors.push({
                error: `Key path '${kp}' is not present in the spec for type '${typeName}'`
              });
              return false;
            }

            const {valid, errors: validationErrors} = validate(keyType, resolved);
            bigErrors.push(...validationErrors);

            return valid;
          });
        }
        let verified = true;
        if ( partial && ! spec && !!verify ) {
          throw new TypeError(`Type checking with option 'partial' is not a valid option for types that` + 
            ` only use a verify function but have no spec`);
        } else if ( !!verify ) {
          try {
            verified = verify(instance);
            if ( ! verified ) {
              if ( verifiers ) {
                throw {
                  error:`Value '${JSON.stringify(instance)}' violated at least 1 verify function in:\n${
                    verifiers.map(f => '\t'+f.toString()).join('\n')
                  }`
                };
              } else if ( type.isSumType ) {
                throw {
                  error: `Value '${JSON.stringify(instance)}' did not match any of: ${[...type.types.keys()].map(t => t.name)}`,
                  verify, verifiers
                }
              } else {
                throw {error:`Value '${instance}' violated verify function in: ${verify.toString()}`};
              }
            }
          } catch(e) {
            bigErrors.push(e);
            verified = false;
          }
        }
        let sealValid = true;
        if ( !!sealed && !! spec ) {
          const type_key_paths = specKeyPaths;
          const all_key_paths = allKeyPaths(instance, specKeyPathSet).sort();
          sealValid  = all_key_paths.join(',') == type_key_paths.join(',');
          if ( ! sealValid ) {
            if ( all_key_paths.length < type_key_paths.length ) {
              sealValid = true;
            } else {
              const errorKeys = [];
              const tkp = new Set(type_key_paths); 
              for( const k of all_key_paths ) {
                if ( ! tkp.has(k) ) {
                  errorKeys.push({
                    error: `Key path '${k}' is not in the spec for type ${typeName}`
                  });
                }
              }
              if ( errorKeys.length ) {
                bigErrors.push(...errorKeys);
              }
            }
          }
        }
        return {valid: allValid && verified && sealValid, errors: bigErrors, partial}
      } case "defCollection": {
        const {valid:containerValid, errors:containerErrors} = validate(spec.container, instance);
        let membersValid = true;
        let verified = true;

        bigErrors.push(...containerErrors);
        if ( partial ) {
          throw new TypeError(`Type checking with option 'partial' is not a valid option for Collection types`);
        } else {
          if ( containerValid ) {
             membersValid= [...instance].every(member => {
              const {valid, errors} = validate(spec.member, member);
              bigErrors.push(...errors);
              return valid;
            });
          }
          if ( !!verify ) {
            try {
              verified = verify(instance);
            } catch(e) {
              bigErrors.push(e);
              verified = false;
            }
          }
        }
          
        return {valid:containerValid && membersValid && verified, errors:bigErrors};
      } default: {
        throw new TypeError(`Checking for type kind ${kind} is not yet implemented.`);
      }
    }
  }

  function check(...args) {
    return validate(...args).valid;
  }

  function lookup(obj, keyPath, canBeNone) {
    if ( isNone(obj) ) throw new TypeError(`Lookup requires a non-unset object.`);

    if ( !keyPath ) throw new TypeError(`keyPath must not be empty`);


    const keys = keyPath.split(/\./g);
    const pathComplete = [];
    const errors = [];

    let resolved = obj;

    while(keys.length) {
      const nextKey = keys.shift();
      resolved = resolved[nextKey];
      pathComplete.push(nextKey);
      if ( (resolved === null || resolved === undefined) ) {
        if ( keys.length ) {
          errors.push({
            error: 
              `Lookup on key path '${keyPath}' failed at '` + 
              pathComplete.join('.') +
              `' when ${resolved} was found at '${nextKey}'.` 
          });
        } else if ( !!canBeNone && canBeNone() ) ; else {
          errors.push({
            error: 
              `Resolution on key path '${keyPath}' failed` + 
              `when ${resolved} was found at '${nextKey}' and the Type of this` +
              `key's value cannot be None.`
          });
        }
        break;
      }
    }
    return {resolved,errors};
  }

  function checkTypeMatch(typeA, typeB) {
    guardType(typeA);
    guardExists(typeA);
    guardType(typeB);
    guardExists(typeB);

    if ( typeA === typeB ) {
      return true;
    } else if ( typeA.isSumType && typeA.types.has(typeB) ) {
      return true;
    } else if ( typeB.isSumType && typeB.types.has(typeA) ) {
      return true;
    } else if ( typeA.name.startsWith('?') && typeB == T`None` ) {
      return true;
    } else if ( typeB.name.startsWith('?') && typeA == T`None` ) {
      return true;
    }

    if ( typeA.name.startsWith('>') || typeB.name.startsWith('>') ) ;

    return false;
  }

  function option(type) {
    return T`?${type.name}`;
  }

  function sub(type) {
    return T`>${type.name}`;
  }

  function defSub(type, spec, {verify} = {}) {
    guardType(type);
    guardExists(type);

    if ( ! verify ) {
      verify = () => true;
    } 

    if ( type.native ) {
      spec.verifiers = [ verify ];
      verify = i => i instanceof type.native.constructor && verify(i);
      spec.verifiers.push(verify);
    }

    return def(`>${type.name}`, spec, {verify});
  }

  function exists(name) {
    return typeCache.has(name);
  }

  function guardRedefinition(name) {
    if ( exists(name) ) throw new TypeError(`Type ${name} cannot be redefined.`);
  }

  function allKeyPaths(o, specKeyPaths) {
    const isTypeSpec = ! specKeyPaths;
    const keyPaths = new Set();
    return recurseObject(o, keyPaths, '');

    function recurseObject(o, keyPathSet, lastLevel = '') {
      const levelKeys = Object.getOwnPropertyNames(o); 
      const keyPaths = levelKeys
        .map(k => lastLevel + (lastLevel.length ? '.' : '') + k);
      levelKeys.forEach((k,i) => {
        const v = o[k];
        if ( isTypeSpec ) {
          if ( v instanceof Type ) {
            keyPathSet.add(keyPaths[i]);
          } else if ( typeof v == "object" ) {
            if ( ! Array.isArray(v) ) {
              recurseObject(v, keyPathSet, keyPaths[i]);
            } else {
              throw new TypeError(`We don't support Types that use Arrays as structure, just yet.`); 
            }
          } else {
            throw new TypeError(`Spec cannot contain leaf values that are not valid Types`);
          }
        } else {
          if ( specKeyPaths.has(keyPaths[i]) ) {
            keyPathSet.add(keyPaths[i]); 
          } else if ( typeof v == "object" ) {
            if ( ! Array.isArray(v) ) {
              recurseObject(v, keyPathSet, keyPaths[i]);
            } else {
              throw new TypeError(`We don't support Instances that use Arrays as structure, just yet.`); 
            }
          } else {
            //console.warn("Spec has no such key",  keyPaths[i]);
            keyPathSet.add(keyPaths[i]);
          }
        }
      });
      return [...keyPathSet];
    }
  }

  function defOption(type) {
    guardType(type);
    const typeName = type.name;
    return T.def(`?${typeName}`, null, {verify: i => isUnset(i) || T.check(type,i)});
  }

  function maybe(type) {
    try {
      return defOption(type);
    } catch(e) {
      // console.log(`Option Type ${type.name} already declared.`, e);
    }
    return T`?${type.name}`;
  }

  function verify(...args) { return check(...args); }

  function defCollection(name, {container, member}, {sealed,verify} = {}) {
    if ( !name ) throw new TypeError(`Type must be named.`); 
    if ( !container || !member ) throw new TypeError(`Type must be specified.`);
    guardRedefinition(name);

    const kind = 'defCollection';
    const t = new Type(name);
    const spec = {kind, spec: { container, member}, verify, sealed, type: t};
    typeCache.set(name, spec);
    return t;
  }

  function defTuple(name, {pattern}) {
    if ( !name ) throw new TypeError(`Type must be named.`); 
    if ( !pattern ) throw new TypeError(`Type must be specified.`);
    const kind = 'def';
    const specObj = {};
    pattern.forEach((type,key) => specObj[key] = type);
    const t = new Type(name);
    const spec = {kind, spec: specObj, type:t};
    typeCache.set(name, spec);
    return t;
  }

  function Type(name, mods = {}) {
    if ( ! new.target ) throw new TypeError(`Type with new only.`);
    Object.defineProperty(this,'name', {get: () => name});
    this.typeName = name;

    if ( mods.types ) {
      const {types} = mods;
      const typeSet = new Set(types);
      Object.defineProperty(this,'isSumType', {get: () => true});
      Object.defineProperty(this,'types', {get: () => typeSet});
    }
    
  }

  Type.prototype.toString = function () {
    return `${this.name} Type`;
  };

  function def(name, spec, {verify, sealed, types, verifiers, native} = {}) {
    if ( !name ) throw new TypeError(`Type must be named.`); 
    guardRedefinition(name);

    if ( name.startsWith('?') ) {
      if ( !! spec ) {
        throw new TypeError(`Option type can not have a spec.`);
      } 

      if ( ! verify(null) ) {
        throw new TypeError(`Option type must be OK to be unset.`);
      }
    }

    const kind = 'def';
    if ( sealed === undefined ) {
      sealed = true;
    }
    const t = new Type(name, {types});
    const cache = {spec,kind,verify,verifiers,sealed,types,native,type:t};
    typeCache.set(name, cache);
    return t;
  }

  function or(...types) { // anonymous standin for defOr
    // could we do this with `name|name2|...` etc ?  we have to sort names so probably can
    throw new TypeError(`Or is not implemented yet.`);
  }

  function defOr(name, ...types) {
    return T.def(name, null, {types, verify: i => types.some(t => check(t,i))});
  }

  function guard(type, instance) {
    guardType(type);
    guardExists(type);
    const {valid, errors} = validate(type, instance);
    if ( ! valid ) throw new TypeError(`Type ${type} requested, but item is not of that type: ${errors.join(', ')}`);
  }

  function guardType(t) {
    //console.log(t);
    if ( !(t instanceof Type) ) throw new TypeError(`Type must be a valid Type object.`);
  }

  function guardExists(t) {
    const name = originalName(t);
    if ( ! exists(name) ) throw new TypeError(`Type must exist. Type ${name} has not been defined.`);
  }

  function errors(...args) {
    return validate(...args).errors;
  }

  function mapBuiltins() {
    BuiltIns.forEach(t => def(originalName(t), null, {native: t, verify: i => originalName(i.constructor) === originalName(t)}));  
    BuiltIns.forEach(t => defSub(T`${originalName(t)}`));  
  }

  function defineSpecials() {
    T.def(`Any`, null, {verify: i => true});
    T.def(`Some`, null, {verify: i => !isUnset(i)});
    T.def(`None`, null, {verify: i => isUnset(i)});
    T.def(`Function`, null, {verify: i => i instanceof Function});
    T.def(`Integer`, null, {verify: i => Number.isInteger(i)});
    T.def(`Array`, null, {verify: i => Array.isArray(i)});
    T.def(`Iterable`, null, {verify: i => i[Symbol.iterator] instanceof Function});
  }

  function isUnset(i) {
    return i === null || i === undefined;
  }

  function originalName(t) {
    if (!!t && t.name) {
      return t.name;
    } 
    const oName = Object.prototype.toString.call(t).replace(/\[object |\]/g, '');
    if ( oName.endsWith('Constructor') ) {
      return oName.replace(/Constructor$/,'');
    }
    return oName;
  }

const FULL_LABEL = 'c3s-unique-';
const LABEL_LEN = 3;
const LABEL = FULL_LABEL.slice(0,LABEL_LEN);
const PREFIX_LEN = 10 + LABEL_LEN;
const PREFIX_BASE = 36;

T.defCollection("Prefix", {
  container: T`Array`,
  member: T`String`
}, {verify: i => i.length > 0 });

let counter = 1;

Object.assign(c3s,{scope,rescope});

function c3s(parts, ...values) {
  // not sure what this does yet
  // but as an object c3s exports scope and rescope to allow components
  // to request stylesheets be scoped to them
}

function generateUniquePrefix() {
  counter += 3;
  const number = counter*Math.random()*performance.now()*(+ new Date); 
  const prefixString = (LABEL + number.toString(PREFIX_BASE).replace(/\./,'')).slice(0,PREFIX_LEN);
  return { prefix: [prefixString] };
}

function findStyleSheet(url) {
  url = getURL(url);
  const ssFound = Array.from(document.styleSheets).find(({href}) => href == url);
  if ( !ssFound ) {
    const qsFound = document.querySelector(`link[href="${url}"]`);
    return qsFound && qsFound;
  } else return ssFound.ownerNode;
}

function isStyleSheetAccessible(ss) {
  try {
    Array.from(ss.sheet.cssRules);
    return true;
  } catch(e) {
    return false;
  }
}

// it may actually be better to clone the sheet using
// a style element rather than cloning using the link 
// which may both rely on and recause a network request
function cloneStyleSheet(ss) {
  const newNode = ss.cloneNode(true);
  newNode.dataset.scoped = true;
  document.head.insertAdjacentElement('beforeEnd', newNode);
  ss.remove();
  return newNode;
}

function prefixAllRules(ss, prefix, combinator = ' ') {
  let lastRuleIndex = ss.cssRules.length - 1;
  let i = lastRuleIndex;

  while(i >= 0) {
    lastRuleIndex = ss.cssRules.length - 1;
    const lastRule = ss.cssRules[lastRuleIndex];
    if ( ! lastRule ) {
      console.warn("No such last rule", lastRuleIndex);
      continue;
    }
    if ( lastRule.type == CSSRule.STYLE_RULE ) {
      prefixStyleRule(lastRule, ss, lastRuleIndex, prefix, combinator);
    } else if ( lastRule.type == CSSRule.MEDIA_RULE ) {
      const rules = Array.from(lastRule.cssRules);
      const lastIndex = rules.length - 1;
      for ( const rule of rules ) {
        prefixStyleRule(rule, lastRule, lastIndex, prefix, combinator);
      }
      ss.deleteRule(lastRuleIndex);
      try {
        let index = 0;
        if ( ss.cssRules.length && ss.cssRules[0].type == CSSRule.NAMESPACE_RULE ) {
          index = 1;
        }
        ss.insertRule(lastRule.cssText, index);
      } catch(e) {
        console.log(e, lastRule.cssText, lastRule, ss);
        //throw e;
      }
    } else {
      ss.deleteRule(lastRuleIndex);
      let index = 0;
      if ( ss.cssRules.length && ss.cssRules[0].type == CSSRule.NAMESPACE_RULE ) {
        index = 1;
      }
      ss.insertRule(lastRule.cssText, index);
    }
    i--;
  }
}

function prefixStyleRule(lastRule, ss, lastRuleIndex, prefix, combinator) {
  let newRuleText = lastRule.cssText;
  const {selectorText} = lastRule;
  const selectors = selectorText.split(/\s*,\s*/g);
  const modifiedSelectors = selectors.map(sel => {
    // we also need to insert prefix BEFORE any descendent combinators
    const firstDescendentIndex = sel.indexOf(' ');
    if ( firstDescendentIndex > -1 ) {
      const firstSel = sel.slice(0, firstDescendentIndex);
      const restSel = sel.slice(firstDescendentIndex);
      // we also need to insert prefix BEFORE any pseudo selectors 
        // NOTE: the following indexOf test will BREAK if selector contains a :
        // such as [ns\\:name="scoped-name"]
      const firstPseudoIndex = firstSel.indexOf(':');
      if ( firstPseudoIndex > -1 ) {
        const [pre, post] = [ firstSel.slice(0, firstPseudoIndex ), firstSel.slice(firstPseudoIndex) ];
        return `${pre}${prefix}${post}${restSel}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
      } else return `${firstSel}${prefix}${restSel}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
    } else {
      const firstPseudoIndex = sel.indexOf(':');
      if ( firstPseudoIndex > -1 ) {
        const [pre, post] = [ sel.slice(0, firstPseudoIndex ), sel.slice(firstPseudoIndex) ];
        return `${pre}${prefix}${post}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
      } else return `${sel}${prefix}` + (combinator == '' ? '' : `, ${prefix}${combinator}${sel}`);
    }
  });
  const ruleBlock = newRuleText.slice(newRuleText.indexOf('{'));
  const newRuleSelectorText = modifiedSelectors.join(', ');
  newRuleText = `${newRuleSelectorText} ${ruleBlock}`;
  ss.deleteRule(lastRuleIndex);
  try {
    let index = 0;
    if ( ss.cssRules.length && ss.cssRules[0].type == CSSRule.NAMESPACE_RULE ) {
      index = 1;
    }
    ss.insertRule(newRuleText, index);
  } catch(e) {
    console.log(e, newRuleText, selectorText, lastRuleIndex, ss);
    //throw e;
  }
}

async function scopeStyleSheet(url,prefix,combinator = ' ') {
  const ss = findStyleSheet(url);

  if ( ! ss ) {
    throw new TypeError(`Stylesheet with URI ${url} cannot be found.`);
  }

  const isKnownAccessible = isStyleSheetAccessible(ss);

  if ( ! isKnownAccessible ) {
    return new Promise(res => {
      ss.onload = () => {
        const isAccessible = isStyleSheetAccessible(ss);
        if ( ! isAccessible ) {
          throw new TypeError(`Non CORS sheet at ${url} cannot have its rules accessed so cannot be scoped.`);
        }
        const scopedSS = cloneStyleSheet(ss);
        scopedSS.onload = () => {
          prefixAllRules(scopedSS.sheet,prefix, combinator);
        };
        res(scopedSS);
      };
    });
  } else {
    const scopedSS = cloneStyleSheet(ss);
    scopedSS.onload = () => {
      prefixAllRules(scopedSS.sheet,prefix, combinator);
    };
    return scopedSS;
  }
}

function scope(url) {
  const prefix = generateUniquePrefix().prefix[0];
  return {scopedSheet: scopeStyleSheet(url,'.' + prefix), prefix};
}

// used when the first scoping didn't work and we need to add more prefix to increase specificity
// if this ever occurs
// which is why we use '' combinator to add to the prefix of the already scoped sheet
function rescope({scopedSheet, prefix:existingPrefix}) {
  const prefix = generateUniquePrefix().prefix[0];
  const combinator = '';
  prefixAllRules(scopedSS,prefix,combinator);
  return {scopedSheet: scopedSS, prefix: prefix + existingPrefix};
}

function getURL(uri) {
  const link = document.createElement('a');
  link.href = uri;
  return link.href;
}

const InsertListeners = [];
const RemovedListeners = [];

const inserted = new Set();
const removed = new Set();
let monitoring = false;

function addInsertListener(listener) {
  if ( inserted.has( listener ) ) return;
  InsertListeners.push(listener);
  inserted.add(listener);
}

function addRemovedListener(listener) {
  if ( removed.has(listener) ) return;
  RemovedListeners.push(listener);
  removed.add(listener);
}

function monitorChanges() {
  if ( monitoring ) return;
  // demo of watching for any new nodes that declare stylists
  const mo = new MutationObserver((mutations)=> {
    let AddedElements = [];
    let RemovedElements = [];
    for ( const mutation of mutations ) {
      const addedElements = Array.from(mutation.addedNodes).filter(x => x.nodeType == Node.ELEMENT_NODE && x.hasAttribute('stylist'));
      const removedElements = Array.from(mutation.removedNodes).filter(x => x.nodeType == Node.ELEMENT_NODE && x.hasAttribute('stylist'));
      AddedElements.push(...addedElements);
      addedElements.forEach(el => AddedElements.push(...el.querySelectorAll('[stylist]')));
      RemovedElements.push(...removedElements);
    }
    const AddedSet = new Set(AddedElements);
    const FilterOut = new Set();
    RemovedElements.forEach(el => AddedSet.has(el) && FilterOut.add(el));
    AddedElements = AddedElements.filter(el => !FilterOut.has(el));
    RemovedElements = RemovedElements.filter(el => !FilterOut.has(el));

    if ( RemovedElements.length ) {
      for ( const listener of RemovedListeners ) {
        try {
          listener(...RemovedElements);
        } catch(e) {
          console.warn("Removed listener error", e, listener);
        }
      }
    }
    if ( AddedElements.length ) {
      for ( const listener of InsertListeners ) {
        try {
          listener(...AddedElements);  
        } catch(e) {
          console.warn("Insert listener error", e, listener);
        }
      }
    } 
  });
  mo.observe(document.documentElement, {childList:true, subtree:true});
  monitoring = true;
}

const stylistFunctions = new Map();
const mappings = new Map();
const memory = {state: {}};
let initialized = false;

function setState(newState) {
  const clonedState = clone(newState);
  Object.assign(memory.state,newState);
}

function restyleElement(el) {
  if ( ! el ) return;
  el.classList.forEach(className => className.startsWith('c3s') && restyleClass(className));
}

function restyleClass(className) {
  const {element,stylist} = mappings.get(className);
  associate(className, element, stylist, memory.state);
}

function restyleAll() {
  mappings.forEach(({element,stylist}, className) => {
    associate(className, element, stylist, memory.state);
  });
}

function initializeDSS(state, functionsObject) {
  setState(state);
  /** 
    to REALLY prevent FOUC put this style tag BEFORE any DSS-styled markup
    and before any scripts that add markup, 
    and before the initializeDSS call
  **/
  if ( ! document.querySelector('[data-role="prevent-fouc"]') ) {
    document.head.insertAdjacentHTML('beforeEnd', `
      <style data-role="prevent-fouc">
        [stylist]:not([associated]) {
          display: none !important;
        }
      </style>
    `);
  }
  addMoreStylistFunctions(functionsObject); 
  addInsertListener(associateStylistFunctions);
  addRemovedListener(unassociateStylistFunctions);
  monitorChanges();
  if ( ! initialized ) {
    const initialEls = Array.from(document.querySelectorAll('[stylist]'));
    associateStylistFunctions(...initialEls);
    initialized = true;
  }

  return;

  function associateStylistFunctions(...els) {
    els = els.filter(el => el.hasAttribute('stylist'));
    if ( els.length == 0 ) return;
    for ( const el of els ) {
      const stylistNames = (el.getAttribute('stylist') || '').split(/\s+/g);
      for ( const stylistName of stylistNames ) {
        const stylist = stylistFunctions.get(stylistName);
        if ( ! stylist ) throw new TypeError(`Stylist named by ${stylistName} is unknown.`);
        const className = randomClass();
        el.classList.add(className);
        associate(className, el, stylist, state);
      }
    }
  }
}

// an object whose properties are functions that are stylist functions
function addMoreStylistFunctions(functionsObject) {
  const toRegister = [];
  for ( const funcName of Object.keys(functionsObject) ) {
    const value = functionsObject[funcName];
    if ( typeof value !== "function" ) throw new TypeError("Functions object must only contain functions.");
    // this prevents a bug where we miss an existing style element in 
    // a check for a style element based on the stylist.name property
    if ( value.name !== funcName ) throw new TypeError(`Stylist function must be actual function named ${funcName} (it was ${value.name})`);

    // don't overwrite exisiting names
    if ( !stylistFunctions.has(funcName) ) {
      toRegister.push(() => stylistFunctions.set(funcName,value));
    }
  }
  while(toRegister.length) toRegister.pop()();
}

function randomClass() {
  const {prefix:[className]} = generateUniquePrefix();
  return className;
}

function associate(className, element, stylist, state) {
  const styleText = (stylist(element, state) || '');
  let styleElement = document.head.querySelector(`style[data-prefix="${className}"]`);
  let changes = false;
  let prefixed = true;
  let prefixedStyleText;

  if (!mappings.has(className)) {
    mappings.set(className, {element,stylist});
  }

  if ( !styleElement ) {
    prefixed = false;
    const styleMarkup = `
      <style data-stylist="${stylist.name}" data-prefix="${className}">
        ${styleText}
      </style>
    `;
    document.head.insertAdjacentHTML('beforeEnd', styleMarkup);
    styleElement = document.head.querySelector(`style[data-prefix="${className}"]`);
  } else {
    prefixedStyleText = Array.from(styleElement.sheet.cssRules)
      .filter(rule => !rule.parentRule)
      .map(rule => rule.cssText)
      .join('\n');
  }

  // I don't know why this has to happen, but it does
  if ( styleElement.innerHTML != styleText ) {
    styleElement.innerHTML = styleText;
    changes = true;
  }

  // only prefix if we have not already
  if ( !prefixed || changes ) {
    const styleSheet = styleElement.sheet;
    prefixAllRules(styleSheet, "." + className, '');
    element.setAttribute('associated', 'true');
    prefixedStyleText = Array.from(styleSheet.cssRules)
      .filter(rule => !rule.parentRule)
      .map(rule => rule.cssText)
      .join('\n');
    styleElement.innerHTML = prefixedStyleText;
  }

}

function disassociate(className, element) {
  const styleSheet = document.querySelector(`style[data-prefix="${className}"]`); 
  mappings.delete(className);
  if ( !! styleSheet ) {
    element.classList.remove(className);
    styleSheet.remove();
  }
}

function unassociateStylistFunctions(...els) {
  els = els.filter(el => el.hasAttribute('stylist'));
  if ( els.length == 0 ) return;
  for ( const el of els ) {
    el.classList.forEach(className => className.startsWith('c3s') && disassociate(className, el));
  }
}

function clone(o) {
  return JSON.parse(JSON.stringify(o)); 
}

export { addMoreStylistFunctions, initializeDSS, restyleAll, restyleClass, restyleElement, setState };
