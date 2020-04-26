const DEV = false;
  const IsBepis = Symbol('[[Bepis]]');
  const AsyncFunction = (async () => 1).__proto__.constructor;
  const Cache = new Map();

  function w(code, ...slots) {
    let pinValue = false;
    let cacheKey = null;
    code = Array.from(code).join("$").trim();

    say(code);

    if ( code.startsWith('$') ) {   // we got the pin parameter
      code = code.slice(1).trim();
      pinValue = slots.shift();
      say("Got pin parameter", pinValue);
    }

    if ( pinValue == true ) {
      // pinValue == true, the default, a singleton component
      cacheKey = `${code}:singleton`;
    } else if ( pinValue != false ) {
      // use the cache with a key, an insteance component
      cacheKey = `${code}:${pinValue}`;
    }

    let update = true;
    let existingRootElement;

    if ( cacheKey != null ) {
      if ( Cache.has(cacheKey) ) {
        const {rootElement, slots:existingSlots} = Cache.get(cacheKey);
        update = !equals(slots, existingSlots);
        if ( update ) {
          say(DEV, "Slots changed. Updating", rootElement);
        } else {
          say(DEV, "No change in slots. Not updating", rootElement);
        }
        existingRootElement = rootElement;
      }
    }

    if ( update ) {
      const root = buildTree(code, ...slots);
      let rootElement;

      if ( existingRootElement ) {
        //say(DEV,"Replace", existingRootElement, "with", rootElement);
        rootElement = treeToDOM(root);
        //rootElement = updateDOMWithTree(existingRootElement, root);
        existingRootElement.replaceWith(rootElement);
      } else {
        rootElement = treeToDOM(root);
      }
      existingRootElement = rootElement;

      Cache.set(cacheKey, {rootElement:existingRootElement, slots}); 
    }

    const inserter = point => {
      if ( !! point ) {
        say("Insert at", point, existingRootElement);
        point.insertAdjacentElement('beforeEnd', existingRootElement);
      }
      return existingRootElement;
    };

    inserter[IsBepis] = true;

    return inserter;
  }

  function buildTree(code, ...slots) {
    const N = slots.length;
    let slice = {tag: '', params: [], children: []};
    const stack = [slice];

    for( const char of code ) {
      switch(char) {
        case ' ':
        case '\t': 
        case '\n': 
        case '\r': {
          if ( ! slice.finished && slice.tag.length ) {
            slice.finished = true;
            say("Got", slice.tag, slice);
          }
        } break;

        case '$': {
          const oldSlot = slots.shift();
          slice.params.push(oldSlot);
          const paramIndex = slice.params.length-1;
          const Updator = {
            oldSlot, 
            element: null, 
            paramIndex,
            slotIndex: N - (slots.length) - 1
          };
          slice[`updator${paramIndex}`] = Updator;
        } break;

        case ',': {
          slice.finished = true;
          stack.push(slice);
          say("Saved", slice.tag);
          const newSlice = {tag: '', params: [], children: []}; 
          slice.children.push(newSlice);
          slice = newSlice;
        } break;

        case '.': {
          if ( slice.tag.length ) {
            slice.finished = true;
            // this can create an empty item that we remove after loop
            const newSlice = {tag: '', params: [], children: []}; 
            const oldSlice = stack.pop();
            oldSlice.children.push(newSlice);
            say("Reset to", oldSlice.tag);
            stack.push(oldSlice);
            slice = newSlice;
          } else {
            let oldSlice = stack.pop();
            const idx = oldSlice.children.indexOf(slice);
            oldSlice.children.splice(idx,1);
            oldSlice = stack.pop();
            oldSlice.children.push(slice);
            say("Reset to", oldSlice.tag);
            stack.push(oldSlice);
          }
        } break;

        case ':': {
          // note that no space is required between a tag and a directive
          if ( ! slice.finished && slice.tag.length ) {
            slice.finished = true;
            say("Got", slice.tag);
          }
          if ( slice.finished ) {
            const newSlice = {tag: '', params: [], children: [], directive: true}; 
            slice.children.push(newSlice);
            slice = newSlice;
          } else {
            slice.directive = true;
          }
          slice.tag += char;
          say("Directive start", slice);
        } break;

        default: {
          if ( slice.finished ) {
            const newSlice = {tag: '', params: [], children: []}; 
            slice.children.push(newSlice);
            slice = newSlice;
          }
          slice.tag += char;
        } break;
      }
    }


    // there could be an empty item
    if (! slice.tag.length ) {
      const parent = stack[0];  
      if ( parent ) {
        const idx = parent.children.indexOf(slice);
        parent.children.splice(idx,1);
      }
    }

    while ( stack.length ) {
      slice = stack.pop();
    }


    return slice;
  }

  function treeToDOM(root) {
    say("Root", root);
    const stack = [root];
    let parentElement;

    while( stack.length ) {
      const item = stack.pop();

      if ( item instanceof Element ) {
        if ( item.parentElement ) {
          parentElement = item.parentElement;
        } else break;
      } else if ( item.tag.length ) {
        if ( item.directive ) {
          say("Directive", item);
          switch(item.tag) {
            case ':text': {
              if ( item.params.length != 1 ) {
                console.warn({errorDetails:{item}});
                throw new TypeError(`Sorry, :text takes 1 parameter. ${item.params.length} given.`);
              }
              const data = getData(item.params[0]);
              if ( typeof data != "string" ) {
                console.warn({errorDetails:{item}});
                throw new TypeError(`Sorry, :text requires string data. ${data} given.`);
              }
              if ( ! parentElement ) {
                console.warn({errorDetails:{item}});
                throw new TypeError('Sorry, :text cannot insert at top level');
              }
              parentElement.insertAdjacentText('beforeEnd', data);
            } break;

            case ':map': {
              say("Got map", item);
              const [list, func] = item.params;
              if ( ! parentElement ) {
                console.warn({errorDetails:{list,func}});
                throw new TypeError(':map cannot be used top level, sorry. Wrap in Element');
              }
              if ( item.params.length == 0 ) {
                console.warn({errorDetails:{list,func}});
                throw new TypeError(':map requires at least 1 argument');
              }
              if ( !!func && !(func instanceof Function) ) {
                console.warn({errorDetails:{list,func}});
                throw new TypeError(':map second parameter, if given, must be a function');
              } else if (func instanceof AsyncFunction ) {
                console.warn({errorDetails:{list,func}});
                throw new TypeError('Sorry, :map does not support AsyncFunctions. Maybe later.');
              }
              let data = getData(list);
              try {
                data = Array.from(data);
              } catch(e) {
                console.warn({errorDetails:{list,data,func}});
                throw new TypeError("Sorry, :map requires data that can be iterated.");
              }
              const resultItems = [];
              for ( const item of data ) {
                let result;
                if ( !! func ) {
                  // create a bepis with no mount
                  console.log(func);
                  result = func(item)(/* no mount */);
                } else {
                  result = item;
                }

                if ( result instanceof Element || typeof result == "string" ) {
                  resultItems.push(result);
                  say("Result", result);
                } else {
                  console.warn({errorDetails:{list,func}});
                  throw new TypeError(":map must produce a list where each item is either an Element or a string");
                }
              }
              for ( const resultItem of resultItems ) {
                if ( resultItem instanceof Element ) {
                  say(DEV,"Append resultItem", resultItem, "to", parentElement);
                  parentElement.append(resultItem);
                } else if ( typeof resultItem == "string" ) {
                  parentElement.insertAdjacentText('beforeEnd', resultItem);
                }
              }
            } break;

            case ':comp': {
              let [maybeDataOrFunc, func] = item.params;
              if ( item.params.length == 0 ) {
                console.warn({errorDetails:{maybeDataOrFunc,func}});
                throw new TypeError(':comp requires at least 1 argument');
              }
              if ( !!func && !(func instanceof Function) ) {
                console.warn({errorDetails:{maybeDataOrFunc,func}});
                throw new TypeError(':comp second parameter, if given, must be a function');
              } else if (func instanceof AsyncFunction ) {
                console.warn({errorDetails:{maybeDataOrFunc,func}});
                throw new TypeError('Sorry, :comp does not support AsyncFunctions. Maybe later.');
              }
              if ( !func ) {
                func = x => x;
              }
              let data = getData(maybeDataOrFunc);
              let result = func(data);

              if ( result[IsBepis] ) {
                result = result();
              }

              if ( result instanceof Element ) {
                if ( parentElement ) {
                  say(DEV,"Append result", result, "to", parentElement);
                  parentElement.append(result);
                }
                parentElement = result;
                stack.push(result);
              } else if ( typeof result == "string" ) {
                if ( parentElement ) {
                  parentElement.insertAdjacentText('beforeEnd', result);
                } else {
                  console.warn({errorDetails:{maybeDataOrFunc,func, result}});
                  throw new TypeError('Sorry, :comp cannot insert text at the top level.');
                }
              } else {
                console.warn({errorDetails:{maybeDataOrFunc,func, result, data}});
                throw new TypeError(`Sorry, :comp can only insert an Element or a string. ${result} given.`);
              }
            } break;

            default: {
              console.warn({errorDetails:{item}});
              throw new TypeError(`${item.tag} is not a directive.`);
            }
          }
          if ( item.children.length ) {
            console.warn({errorDetails:{item}});
            throw new TypeError("Sorry, this directive cannot have children");
          }
        } else {
          const element = document.createElement(item.tag);
          say("Making", element);

          specify(element, ...item.params);

          if ( parentElement ) {
            say(DEV,"Append el", element, "to", parentElement);
            parentElement.append(element);
          }
          parentElement = element;

          stack.push(element);
          if ( item.children.length ) {
            stack.push(...item.children.reverse());
          }
        }
      } else {
        say("Empty item", item);
      }
    }

    while( parentElement.parentElement ) {
      parentElement = parentElement.parentElement;
    }

    say("Stack", stack, parentElement);
    return parentElement;
  }

  function specify(element, content, style) {
    // insert local content at stack top
      if ( content == null || content == undefined ) ; else if ( typeof content == "string" ) {
        element.innerText = content;
      } else if ( typeof content == "object" ) {
        Object.keys(content).forEach(attrName => {
          const attrValue = content[attrName];
          try {
            element.setAttribute(attrName, attrValue);
          } catch(e) {}
          try {
            element[attrName] = attrValue;
          } catch(e) {}
        });
      }

    // apply style
      if ( style instanceof Function ) {
        style = style(element, content);
      }
      if ( typeof style == "string" ) {
        element.setAttribute("stylist", style);  
      } else {
        Object.assign(element.style, style);
      }
  }

  function getData(maybeFunc) {
    let data;
    if ( maybeFunc instanceof Function ) {
      if ( maybeFunc instanceof AsyncFunction ) {
        console.warn({errorDetails:{maybeFunc}});
        throw new TypeError("Sorry, AsyncFunctions as data producing functions are not supported. Maybe in future.");
      }
      data = maybeFunc();
    } else {
      data = maybeFunc;
    }
    return data;
  }

  function say(...args) {
    if ( typeof args[0] == "boolean" && args[0] == true ) {
      args.shift();
      console.log(...args);
    }
  }

  function equals(arr1, arr2) {
    if (arr1.length != arr2.length) {
      return false;
    }

    let eq = true;

    for( let i = 0; i < arr1.length; i++) {
      const item1 = arr1[i];
      const item2 = arr2[i];

      if ( typeof item1 == "string" ) {
        eq = item1 == item2; 
      } else if ( item1 instanceof Function ) {
        eq = item1 == item2;
      } else if ( typeof item1 == "number" ) {
        eq = item1 == item2;
      } else if ( Array.isArray(item1) ) {
        eq = equals(item1, item2);
      } else if ( !!item1 && typeof item1 == "object" ) {
        eq = JSON.stringify(item1) == JSON.stringify(item2);
      } else  {
        eq = false;
      }

      if ( ! eq ) break;
    }

    return eq;
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

export { clone, w };
