//     Underscore.js 1.1.4
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.1.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects implementing `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (_.isNumber(obj.length)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial && index === 0) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator = iterator || _.identity;
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) return breaker;
    });
    return result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method ? value[method] : value).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator = iterator || _.identity;
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return iterable;
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    var values = slice.call(arguments, 1);
    return _.filter(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  _.bind = function(func, obj) {
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj || {}, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher = hasher || _.identity;
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Internal function used to implement `_.throttle` and `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i=funcs.length-1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    return _.filter(_.keys(obj), function(key){ return _.isFunction(obj[key]); }).sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) obj[prop] = source[prop];
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };

  // Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
  // that does not equal itself.
  _.isNaN = function(obj) {
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();
/*!
 * The MIT License
 *
 * Copyright (c) 2011 Eirik Brandtzæg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Eirik Brandtzæg <eirikb@eirikb.no>
 * @Version 0.6
 */

var OGE = {};

/**
 * Direction object
 *
 * @constructur
 * @param {number} cos Cosine
 * @param {number} sin Sines
 * @return {OGE.Direction}
 */
OGE.Direction = function(cos, sin) {
	this.cos = typeof(cos) != 'undefined' ? cos: 0;
	this.sin = typeof(sin) != 'undefined' ? sin: 0;

};

/**
 * Rotate the direction based on degrees (not radians)
 * Will update cos and sin accordingly
 * To rotate 'the other way', use negative numbers
 *
 * @param {number} degrees Amount of degrees to roate cos and sin
 * @return this
 */
OGE.Direction.prototype.rotate = function(degrees) {
	var radian = degrees * (Math.PI / 180);
	this.cos = Math.cos(Math.acos(this.cos) + radian);
	this.sin = Math.sin(Math.asin(this.sin) + radian);
	return this;
};

/**
 * Clone this direction
 * 
 * @return new OGE.Direction with same cos and sin
 */
OGE.Direction.prototype.clone = function() {
	return new OGE.Direction(this.cos, this.sin);
};

/**
 * Zone object
 * Note that x and y in zone is within the grid of zones,
 * unlike in bodies where it is the actual coordinates
 * Zones store links to bodies within them
 *
 * @constructur
 * @param {number} x X-gridcoordinate in world
 * @param {number} y Y-gridcoordinate in world
 * @return {OGE.Zone}
 */
OGE.Zone = function(x, y) {
	this.x = typeof(x) != 'undefined' ? x: 0;
	this.y = typeof(y) != 'undefined' ? y: 0;

	this.bodies = [];
};

/**
 * Add a body to the zone
 *
 * @param {OGE.Body} body Body to add
 */
OGE.Zone.prototype.addBody = function(body) {
	for (var i = 0; i < this.bodies.length; i++) {
		if (this.bodies[i] === body) {
			return;
		}
	}
	this.bodies.push(body);
};

/**
 * Remove body from the zone
 *
 * @param {OGE.Body} body Body to remove
 */
OGE.Zone.prototype.removeBody = function(body) {
	for (var i = 0; i < this.bodies.length; i++) {
		if (this.bodies[i] === body) {
			this.bodies.splice(i, 1);
			break;
		}
	}
};

/**
 * Body object
 *
 * @constructur
 * @param {number} x X-coordinate on world
 * @param {number} y Y-coordinate on world
 * @param {number} width Width of body
 * @param {number} height Height of body
 * @return {OGE.Body}
 */
OGE.Body = function(x, y, width, height) {
	this.x = typeof(x) != 'undefined' ? x: 0;
	this.y = typeof(y) != 'undefined' ? y: 0;
	this.width = typeof(width) != 'undefined' ? width: 1;
	this.height = typeof(height) != 'undefined' ? height: 1;

	this.speed = 0;
	this.direction = null;
	this.slide = false;
	this.active = false;

	this.onCollisions = [];
};

/**
 * Remove all onCollision events
 */
OGE.Body.prototype.clearEvents = function() {
	this.onCollisions = [];
};

/**
 * Add event for onCollision
 * Will trigger when body colide with another body
 *
 * @param {Function} onCollisionEvent event
 */
OGE.Body.prototype.onCollision = function(onCollisionEvent) {
	this.onCollisions.push(onCollisionEvent);
};

/**
 * Collide two bodies (this and given body)
 * Will trigger all onCollision events
 * 
 * @param {OGE.Body} body Body this body has collided with
 * @return false if one of onCollision events return false, true if not
 */
OGE.Body.prototype.collide = function(body) {
	var collide = true;
	for (var i = 0; i < this.onCollisions.length; i++) {
		if (this.onCollisions[i](body) === false) {
			collide = false;
		}
	}
	return collide;
};

/**
 * Collide two bodies (this and given body)
 * Will trigger all onCollision events
 * 
 * @param {OGE.Body} body Body this body has collided with
 * @return false if one of onCollision events return false, true if not
 */
OGE.Body.prototype.collide = function(body) {
	var collide = true;
	for (var i = 0; i < this.onCollisions.length; i++) {
		if (this.onCollisions[i](body) === false) {
			collide = false;
		}
	}
	return collide;
};

/**
 * Check if this body intersects with a given body/location
 *
 * @param {OGE.Body} bodyOrX Body to chech intersection with,
 *                   this can also be {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return true if the bodies intersect, false if not
 */
OGE.Body.prototype.intersects = function(bodyOrX, y, width, height) {
	var x, body;
	x = body = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}

	return this.x < x + width && this.x + this.width > x && this.y < y + height && this.y + this.height > y;
};

/**
 * Check how much this body intersects with nother body
 * Will not check if they actually intersect,
 * so can return negative number @see #intersects 
 *
 * @param {OGE.Body} bodyOrX Body to chech intersection with,
 *                   this can also be {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return How much the two bodies intersect, can be negative
 */
OGE.Body.prototype.intersection = function(bodyOrX, y, width, height) {
	var x, body;
	x = body = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}

	var sx, ex, sy, ey;
	sx = this.x > x ? this.x: x;
	ex = this.x + this.width < x + width ? this.x + this.width: x + width;
	sy = this.y > y ? this.y: y;
	ey = this.y + this.height < y + height ? this.y + this.width: y + height;
	return (ex - sx) * (ey - sy);
};

/**
 * World object, contain everything
 *
 * @constructur
 * @param {number} width Width of map
 * @param {number} height Height of map
 * @param {number} zoneSize How large each zone should be (default 10)
 * @return {OGE.World}
 */
OGE.World = function(width, height, zoneSize) {
	this.width = typeof(width) != 'undefined' ? width: 640;
	this.height = typeof(height) != 'undefined' ? height: 480;
	this.zoneSize = typeof(zoneSize) != 'undefined' ? zoneSize: 10;
	this.activeBodies = [];

	var xZones = width / this.zoneSize + 1 << 0;
	var yZones = height / this.zoneSize + 1 << 0;
	this.zones = [];

	for (var x = 0; x < xZones; x++) {
		this.zones[x] = [];
		for (var y = 0; y < yZones; y++) {
			this.zones[x][y] = new OGE.Zone(x, y);
		}
	}

	// Private functions
};

/**
 * Add a body to the world, will be added to zones
 * Bodies can be added over other bodies (x, y)
 *
 * @param {OGE.Body} body Body to add
 * @param {boolean} active Set if the body is active or not (movable)
 * @return true if body was added, false if not (out of bounds)
 */
OGE.World.prototype.addBody = function(body, active) {
	if (this.addBodyToZones(body) !== true) {
		return false;
	}

	if (arguments.length >= 2) {
		body.active = active;
	}

	if (body.active) {
		this.activeBodies.push(body);
	}

	return true;
};

/**
 * Removes a body from the world (and zones it is)
 * Important: Removes all listeners to onActivate/onDeactivate
 *
 * @param {OGE.Body} body Body to remove
 */
OGE.World.prototype.removeBody = function(body) {
	this.removeBodyFromZones(body);
	for (var i = 0; i < this.activeBodies.length; i++) {
		if (this.activeBodies[i] === body) {
			this.activeBodies.splice(i, 1);
			break;
		}
	}

};

/**
 * Get all bodies from a given location (either OGE.Body or x,y)
 * Given location can be outside the bounds of the World
 *
 * @param {OGE.Body} bodyOrX Uses this to find other bodies (x, y, width, height)
 *                           This can also be the {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return Array of OGE.Body found, including the given body
 */
OGE.World.prototype.getBodies = function(bodyOrX, y, width, height) {
	var body, x;
	body = x = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}
	x = x < 0 ? 0: x;
	x = x + width > this.width ? this.width - width: x;
	y = y < 0 ? 0: y;
	y = y + height > this.height ? this.height - height: y;

	var bodies = [];
	var zones = this.getZones(x, y, width, height);
	for (var i = 0; i < zones.length; i++) {
		var bodies2 = zones[i].bodies;
		for (var j = 0; j < bodies2.length; j++) {
			var b = bodies2[j];
			var contains = false;
			for (var k = 0; k < bodies.length; k++) {
				if (bodies[k] === b) {
					contains = true;
					break;
				}
			}
			if (!contains) {
				bodies.push(b);
			}
		}
	}

	return bodies;
};

/**
 * Get all zones from a given location (either OGE.Body or x,y)
 * Given location can not be outside the bounds of the World
 *
 * @param {OGE.Body} bodyOrX Uses this to find other bodies (x, y, width, height)
 *                           This can also be the {number} x
 * @param {number} y Y (optional)
 * @param {number} width Width (optional)
 * @param {number} height Height (optional)
 * @return Array of OGE.Zone found, including the given body
 */
OGE.World.prototype.getZones = function(bodyOrX, y, width, height) {
	var body, x;
	body = x = bodyOrX;
	if (arguments.length === 1) {
		x = body.x;
		y = body.y;
		width = body.width;
		height = body.height;
	}

	if (x >= 0 && x + width - 1 < this.width && y >= 0 && y + height - 1 < this.height) {
		var x1 = x / this.zoneSize << 0;
		var x2 = (x + width) / this.zoneSize << 0;
		var y1 = y / this.zoneSize << 0;
		var y2 = (y + height) / this.zoneSize << 0;

		var pos = 0;
		var z = [];
		for (x = x1; x <= x2; x++) {
			for (y = y1; y <= y2; y++) {
				z[pos++] = this.zones[x][y];
			}
		}
		return z;
	} else {
		return [];
	}
};

/**
 * Does one 'step' in the world, as in time passes
 * Will move all active bodies
 *
 * @param {number} steps Amount of steps to do
 */
OGE.World.prototype.step = function(steps) {
	steps = arguments.length === 0 ? 1: steps;
	for (var step = 0; step < steps; step++) {
		for (var i = 0; i < this.activeBodies.length; i++) {
			var body = this.activeBodies[i];
			if (body.speed > 0 && body.direction !== null) {
				this.moveBody(body);
			}
		}
	}
};

// Originally private methods
OGE.World.prototype.addBodyToZones = function(body) {
	var zones = this.getZones(body);
	if (zones.length === 0) {
		return false;
	}
	for (var i = 0; i < zones.length; i++) {
		zones[i].addBody(body);
	}
	return true;
};

OGE.World.prototype.removeBodyFromZones = function(body) {
	var zones = this.getZones(body);
	for (var i = 0; i < zones.length; i++) {
		zones[i].removeBody(body);
	}
};

OGE.World.prototype.moveBody = function(body, direction, steps) {
	var lastX, lastY, bodies;
	if (arguments.length === 1) {
		direction = body.direction;
		steps = body.speed;
	}

	for (var i = 0; i < steps; i++) {
		lastX = body.x;
		lastY = body.y;
		this.removeBodyFromZones(body);
		body.x += direction.cos;
		body.y += direction.sin;

		bodies = this.getBodies(body);
		for (var j = 0; j < bodies.length; j++) {
			var body2 = bodies[j];
			if (body !== body2 && ! body2.intersects(lastX, lastY, body.width, body.height) && body2.intersects(body)) {
				var collide1 = body.collide(body2) === true;
				var collide2 = body2.collide(body) === true;
				if (collide1 && collide2) {
					body.x = lastX;
					body.y = lastY;
					this.addBodyToZones(body);
					if (body.slide && j >= 0) {
						this.slideBody(body, direction);
					} else {
						return;
					}
				}
			}
		}
		this.addBodyToZones(body);
	}
};

OGE.World.prototype.slideBody = function(body, direction) {
	var self = this;
	var getIntersection = function(direction) {
		var ignoreBodies = [],
		bodies = self.getBodies(body),
		intersection,
		i,
		j,
		x,
		y,
		body2,
		ignore;
		for (i = 0; i < bodies.length; i++) {
			body2 = bodies[i];
			if (body2 !== body && body2.intersects(body)) {
				ignoreBodies.push(body2);
			}
		}
		intersection = 0;
		x = body.x + direction.cos * 1.9 << 0;
		if (x !== body.x) {
			x = body.x + (x > body.x ? 1: - 1);
		}
		y = body.y + direction.sin * 1.9 << 0;
		if (y !== body.y) {
			y = body.y + (y > body.y ? 1: - 1);
		}
		bodies = self.getBodies(x, y, body.width, body.height);
		for (i = 0; i < bodies.length; i++) {
			body2 = bodies[i];
			if (body2 !== body && body2.intersects(x, y, body.width, body.height)) {
				ignore = false;
				for (j = 0; j < ignoreBodies.length; j++) {
					if (body2 === ignoreBodies[j]) {
						ignore = true;
						break;
					}
				}
				if (!ignore) {
					intersection += body2.intersection(x, y, body.width, body.height);
				}
			}
		}
		return intersection << 0;
	};

	var intersection1 = getIntersection(direction.clone().rotate( - 45));
	var intersection2 = getIntersection(direction.clone().rotate(45));
	if (intersection1 < intersection2) {
		this.moveBody(body, direction.clone().rotate( - 90), 1);
	} else if (intersection1 > intersection2) {
		this.moveBody(body, direction.clone().rotate(90), 1);
	}
};

/*!
 * The MIT License
 *
 * Copyright (c) 2011 Eirik Brandtzæg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Eirik Brandtzæg <eirikb@eirikb.no>
 * @Version 0.6
 */

// Prevent protoype inheritance from calling constructors twice when using apply
// Thanks to eboyjr (##javascript @ freenode)
Object.construct_prototype = function(o) {
	var f = function() {};
	f.prototype = o.prototype;
	return new f();
};

/**
 * Player object
 *
 * @constructur
 * @return {Player}
 */
Player = function(x, y, width, height, nick) {
	this.nick = nick;
	if (arguments.length === 1) {
		this.nick = arguments[0];
		x = 0;
	}
	OGE.Body.apply(this, arguments);
	this.speed = 3;
	this.slide = true;
	this.bombSize = 1;
	this.bombPower = 1;
	this.life = 3;
	this.armor = 0;
	this.bombs = 1;
    this.power = 1;
};

Player.prototype = Object.construct_prototype(OGE.Body);

Player.prototype.serialize = function() {
	return {
		nick: this.nick,
		x: this.x,
		y: this.y,
		width: this.width,
		height: this.height,
		speed: this.speed,
		armor: this.armor
	};
};

Player.deserialize = function(data) {
	return _.extend(new Player(data.x, data.y, data.width, data.height, data.nick), data);
};

/**
 * Box object
 *
 * @constructur
 * @return {Box}
 */
Box = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.armor = 1;
};

Box.prototype = Object.construct_prototype(OGE.Body);

/**
 * Bomb object
 *
 * @constructur
 * @return {Bomb}
 */
Bomb = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.size = 1;
	this.timer = 4;
	this.power = 1;
};

Bomb.prototype = Object.construct_prototype(OGE.Body);

/**
 * Fire object
 *
 * @constructur
 * @return {Fire}
 */
Fire = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
	this.timer = 10;
	this.power = 1;
};

Fire.prototype = Object.construct_prototype(OGE.Body);

/**
 * Powerup object
 *
 * @constructur
 * @return {Powerup}
 */
Powerup = function(x, y, width, height) {
	OGE.Body.apply(this, arguments);
};

Powerup.prototype = Object.construct_prototype(OGE.Body);

/**
 * Game object
 *
 * @constructur
 * @return {Game}
 */
Game = function(width, height) {
	this.world = new OGE.World(width, height, 16);
	this.players = [];
	this.bombs = [];
	this.fires = [];
	this.blocks = [];
	this.bricks = [];

	this.maxPlayers = 4;
};

Game.prototype.getBomb = function(x, y) {
	for (var i = 0; i < this.bombs.length; i++) {
		if (this.bombs[i].x === x && this.bombs[i].y === y) {
			return this.bombs[i];
		}
	}
	return null;
};

Game.prototype.removeBodies = function(bodies, type) {
	var self = this;
	_.each(bodies, function(body) {
		if (body instanceof type) {
			self.removeBody(body);
		}
	});
};

Game.prototype.explodeBomb = function(bomb, data) {
	if (arguments.length === 1) {
		data = {
			x: bomb.x,
			y: bomb.y,
			bodies: [],
			fires: [],
            bombs: []
		};
	}
	var w = bomb.size * bomb.width,
	h = bomb.size * bomb.height,
	self = this,
	insertFire = function(x, y, firevar) {
		var d = function(e) {
			return e.x === x && e.y === y;
		};
		if (typeof _.detect(data.bodies, d) === 'undefined') {
			var fire = {
				x: x,
				y: y,
				firevar: firevar
			};
			var oldFire = _.detect(data.fires, d);
			if (typeof oldFire !== 'undefined') {
				if (oldFire.firevar !== 'c' && _.contains('c', 'v', 'h', fire.firevar)) {
					data.fires = _.without(data.fires, oldFire);
					data.fires.push(fire);
				}
			} else {
				data.fires.push(fire);
			}
		}
	};
    data.bombs.push(bomb);
	insertFire(bomb.x, bomb.y, 'c');
	var checkHit = function(xDir, yDir, firevar1, firevar2) {
		var xDiff = xDir * bomb.width,
		sx = bomb.x + xDiff,
		ex = bomb.x + bomb.size * xDiff,
		yDiff = yDir * bomb.height,
		sy = bomb.y + yDiff,
		ey = bomb.y + bomb.size * yDiff;
		actualCheck = function(x, y, firevar) {
			if (x >= 0 && y >= 0 && x < self.world.width && y < self.world.height) {
				var b = self.world.getBodies(x, y, bomb.width, bomb.height);
				for (var i = 0; i < b.length; i++) {
					var body = b[i];
					if (body !== bomb && body.intersects(x + 2, y + 2, bomb.width - 2, bomb.height - 2)) {
						if (body.armor > bomb.power) {
							return false;
						} else {
							if (! (body instanceof Bomb) && ! _.contains(data.bodies, body)) {
								data.bodies.push(body);
							}
							if (body.armor === bomb.power) {
								return false;
							}
						}
						if ((body instanceof Bomb) && !_.contains(data.bombs, body)) {
							self.explodeBomb(body, data);
						}
					}
				}
				insertFire(x, y, firevar);
			}
			return true;
		};

		for (var x = sx; x !== ex + xDiff; x += xDiff) {
			if (!actualCheck(x, bomb.y, x !== ex ? firevar1: firevar2)) {
				break;
			}
		}
		for (var y = sy; y !== ey + yDiff; y += yDiff) {
			if (!actualCheck(bomb.x, y, y !== ey ? firevar1: firevar2)) {
				break;
			}
		}
	};

	checkHit( - 1, 0, 'h', 'l');
	checkHit(1, 0, 'h', 'r');
	checkHit(0, - 1, 'v', 'u');
	checkHit(0, 1, 'v', 'd');

	return data;
};

Game.prototype.addBody = function(body, active) {
	if (!this.world.addBody(body, active)) {
		return false;
	}
	if (body instanceof Player) {
		if (this.players.length == this.maxPlayers) {
			return false;
		} else if (this.players.length === 0) {
			this.owner = body;
		}
		this.players.push(body);
	} else if (body instanceof Bomb) {
		this.bombs.push(body);
	}
	return true;
};

Game.prototype.serialize = function() {
	var self = this;
	var data = {
		width: this.world.width,
		height: this.world.height
	};
	var serializeboxes = function(name, attrs) {
		if (self[name].length > 0) {
			var size = self[name][0].width;
			data[name] = {};
			data[name].size = size;
			data[name].pos = [];
			data[name].attrs = {};
			_.each(self[name], function(box) {
				var pos = box.y / size * Math.floor(self.world.width / size) + box.x / size;
				data[name].pos.push(pos);
				_.each(attrs, function(attr) {
					data[name].attrs[attr] = box[attr];
				});
			});
		}
	};
	if (this.players.length > 0) {
		data.players = [];
		_.each(this.players, function(player) {
			data.players.push(player.serialize());
		});
	}

	serializeboxes('blocks', ['armor']);
	serializeboxes('bricks');
	return data;
};

Game.prototype.removeBody = function(body) {
	this.world.removeBody(body);
	this.players = _.without(this.players, body);
	this.bombs = _.without(this.bombs, body);
	this.blocks = _.without(this.blocks, body);
	this.bricks = _.without(this.bricks, body);
};

Game.prototype.getPlayer = function(nick) {
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].nick === nick) {
			return this.players[i];
		}
	}
};

Game.prototype.createBlocks = function(size) {
	for (var y = 1; y < this.world.height / size - 2; y += 2) {
		for (var x = 1; x < this.world.width / size - 2; x += 2) {
			var b = new Box(x * size, y * size, size, size);
			b.armor = 2;
			this.blocks.push(b);
			this.addBody(b);
		}
	}
	return this;
};

Game.prototype.createBricks = function(size, percentage) {
	var w = this.world.width / size;
	var h = this.world.height / size;
	for (var y = 0; y < h - 1; y++) {
		for (var x = 0; x < w - 1; x++) {
			if (Math.random() * 100 < percentage && ! (x % 2 === 1 && y % 2 === 1)) {
				if ((x > 1 || y > 1) && (x > 1 || y < h - 2) && (x < w - 2 || y > 1) && (x < w - 2 || y < h - 2)) {
					var c = new Box(x * size, y * size, size, size);
					this.bricks.push(c);
					this.addBody(c);
				}
			}
		}
	}
	return this;
};

Game.deserialize = function(data) {
	var game = new Game(data.width, data.height);
	var deserializeBoxes = function(name) {
		if (data[name].pos.length > 0) {
			var size = data[name].size;
			var boxPrY = Math.floor(data.width / size);
			_.each(data[name].pos, function(pos) {
				var x = pos % boxPrY * size;
				var y = Math.floor(pos / boxPrY) * size;
				var box = new Box(x, y, size, size);
				_.each(data[name].attrs, function(i, attr) {
					box[attr] = data[name].attrs[attr];
				});
				game[name].push(box);
				game.addBody(box);
			});
		}
	};
	deserializeBoxes('blocks');
	deserializeBoxes('bricks');
	if (data.players && data.players.length > 0) {
		_.each(data.players, function(p) {
			game.addBody(Player.deserialize(p), true);
		});
	}
	return game;
};

