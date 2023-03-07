(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'react-dom'], factory) :
  (global = global || self, factory(global.ReactBeautifulDnd = {}, global.React, global.ReactDOM));
}(this, (function (exports, React, ReactDOM) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;
  var ReactDOM__default = 'default' in ReactDOM ? ReactDOM['default'] : ReactDOM;

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var spacesAndTabs = /[ \t]{2,}/g;
  var lineStartWithSpaces = /^[ \t]*/gm;

  var clean = function clean(value) {
    return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
  };

  var getDevMessage = function getDevMessage(message) {
    return clean("\n  %creact-beautiful-dnd\n\n  %c" + clean(message) + "\n\n  %c\uD83D\uDC77\u200D This is a development only message. It will be removed in production builds.\n");
  };

  var getFormattedMessage = function getFormattedMessage(message) {
    return [getDevMessage(message), 'color: #00C584; font-size: 1.2em; font-weight: bold;', 'line-height: 1.5', 'color: #723874;'];
  };
  var isDisabledFlag = '__react-beautiful-dnd-disable-dev-warnings';
  function log(type, message) {
    var _console;

    if (typeof window !== 'undefined' && window[isDisabledFlag]) {
      return;
    }

    (_console = console)[type].apply(_console, getFormattedMessage(message));
  }
  var warning = log.bind(null, 'warn');
  var error = log.bind(null, 'error');

  function noop() {}

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function getOptions(shared, fromBinding) {
    return _extends({}, shared, {}, fromBinding);
  }

  function bindEvents(el, bindings, sharedOptions) {
    var unbindings = bindings.map(function (binding) {
      var options = getOptions(sharedOptions, binding.options);
      el.addEventListener(binding.eventName, binding.fn, options);
      return function unbind() {
        el.removeEventListener(binding.eventName, binding.fn, options);
      };
    });
    return function unbindAll() {
      unbindings.forEach(function (unbind) {
        unbind();
      });
    };
  }

  var prefix = 'Invariant failed';
  function RbdInvariant(message) {
    this.message = message;
  }

  RbdInvariant.prototype.toString = function toString() {
    return this.message;
  };

  function invariant(condition, message) {
    if (condition) {
      return;
    }

    {
      throw new RbdInvariant(prefix + ": " + (message || ''));
    }
  }

  var ErrorBoundary = function (_React$Component) {
    _inheritsLoose(ErrorBoundary, _React$Component);

    function ErrorBoundary() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
      _this.callbacks = null;
      _this.unbind = noop;

      _this.onWindowError = function (event) {
        var callbacks = _this.getCallbacks();

        if (callbacks.isDragging()) {
          callbacks.tryAbort();
           warning("\n        An error was caught by our window 'error' event listener while a drag was occurring.\n        The active drag has been aborted.\n      ") ;
        }

        var err = event.error;

        if (err instanceof RbdInvariant) {
          event.preventDefault();

          {
            error(err.message);
          }
        }
      };

      _this.getCallbacks = function () {
        if (!_this.callbacks) {
          throw new Error('Unable to find AppCallbacks in <ErrorBoundary/>');
        }

        return _this.callbacks;
      };

      _this.setCallbacks = function (callbacks) {
        _this.callbacks = callbacks;
      };

      return _this;
    }

    var _proto = ErrorBoundary.prototype;

    _proto.componentDidMount = function componentDidMount() {
      this.unbind = bindEvents(window, [{
        eventName: 'error',
        fn: this.onWindowError
      }]);
    };

    _proto.componentDidCatch = function componentDidCatch(err) {
      if (err instanceof RbdInvariant) {
        {
          error(err.message);
        }

        this.setState({});
        return;
      }

      throw err;
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.unbind();
    };

    _proto.render = function render() {
      return this.props.children(this.setCallbacks);
    };

    return ErrorBoundary;
  }(React__default.Component);

  var dragHandleUsageInstructions = "\n  Press space bar to start a drag.\n  When dragging you can use the arrow keys to move the item around and escape to cancel.\n  Some screen readers may require you to be in focus mode or to use your pass through key\n";

  var position = function position(index) {
    return index + 1;
  };

  var onDragStart = function onDragStart(start) {
    return "\n  You have lifted an item in position " + position(start.source.index) + "\n";
  };

  var withLocation = function withLocation(source, destination) {
    var isInHomeList = source.droppableId === destination.droppableId;
    var startPosition = position(source.index);
    var endPosition = position(destination.index);

    if (isInHomeList) {
      return "\n      You have moved the item from position " + startPosition + "\n      to position " + endPosition + "\n    ";
    }

    return "\n    You have moved the item from position " + startPosition + "\n    in list " + source.droppableId + "\n    to list " + destination.droppableId + "\n    in position " + endPosition + "\n  ";
  };

  var withCombine = function withCombine(id, source, combine) {
    var inHomeList = source.droppableId === combine.droppableId;

    if (inHomeList) {
      return "\n      The item " + id + "\n      has been combined with " + combine.draggableId;
    }

    return "\n      The item " + id + "\n      in list " + source.droppableId + "\n      has been combined with " + combine.draggableId + "\n      in list " + combine.droppableId + "\n    ";
  };

  var onDragUpdate = function onDragUpdate(update) {
    var location = update.destination;

    if (location) {
      return withLocation(update.source, location);
    }

    var combine = update.combine;

    if (combine) {
      return withCombine(update.draggableId, update.source, combine);
    }

    return 'You are over an area that cannot be dropped on';
  };

  var returnedToStart = function returnedToStart(source) {
    return "\n  The item has returned to its starting position\n  of " + position(source.index) + "\n";
  };

  var onDragEnd = function onDragEnd(result) {
    if (result.reason === 'CANCEL') {
      return "\n      Movement cancelled.\n      " + returnedToStart(result.source) + "\n    ";
    }

    var location = result.destination;
    var combine = result.combine;

    if (location) {
      return "\n      You have dropped the item.\n      " + withLocation(result.source, location) + "\n    ";
    }

    if (combine) {
      return "\n      You have dropped the item.\n      " + withCombine(result.draggableId, result.source, combine) + "\n    ";
    }

    return "\n    The item has been dropped while not over a drop area.\n    " + returnedToStart(result.source) + "\n  ";
  };

  var preset = {
    dragHandleUsageInstructions: dragHandleUsageInstructions,
    onDragStart: onDragStart,
    onDragUpdate: onDragUpdate,
    onDragEnd: onDragEnd
  };

  function symbolObservablePonyfill(root) {
  	var result;
  	var Symbol = root.Symbol;

  	if (typeof Symbol === 'function') {
  		if (Symbol.observable) {
  			result = Symbol.observable;
  		} else {
  			result = Symbol('observable');
  			Symbol.observable = result;
  		}
  	} else {
  		result = '@@observable';
  	}

  	return result;
  }

  /* global window */

  var root;

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof module !== 'undefined') {
    root = module;
  } else {
    root = Function('return this')();
  }

  var result = symbolObservablePonyfill(root);

  /**
   * These are private action types reserved by Redux.
   * For any unknown actions, you must return the current state.
   * If the current state is undefined, you must return the initial state.
   * Do not reference these action types directly in your code.
   */
  var randomString = function randomString() {
    return Math.random().toString(36).substring(7).split('').join('.');
  };

  var ActionTypes = {
    INIT: "@@redux/INIT" + randomString(),
    REPLACE: "@@redux/REPLACE" + randomString(),
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
    }
  };

  /**
   * @param {any} obj The object to inspect.
   * @returns {boolean} True if the argument appears to be a plain object.
   */
  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }

  /**
   * Creates a Redux store that holds the state tree.
   * The only way to change the data in the store is to call `dispatch()` on it.
   *
   * There should only be a single store in your app. To specify how different
   * parts of the state tree respond to actions, you may combine several reducers
   * into a single reducer function by using `combineReducers`.
   *
   * @param {Function} reducer A function that returns the next state tree, given
   * the current state tree and the action to handle.
   *
   * @param {any} [preloadedState] The initial state. You may optionally specify it
   * to hydrate the state from the server in universal apps, or to restore a
   * previously serialized user session.
   * If you use `combineReducers` to produce the root reducer function, this must be
   * an object with the same shape as `combineReducers` keys.
   *
   * @param {Function} [enhancer] The store enhancer. You may optionally specify it
   * to enhance the store with third-party capabilities such as middleware,
   * time travel, persistence, etc. The only store enhancer that ships with Redux
   * is `applyMiddleware()`.
   *
   * @returns {Store} A Redux store that lets you read the state, dispatch actions
   * and subscribe to changes.
   */

  function createStore(reducer, preloadedState, enhancer) {
    var _ref2;

    if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
      throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function.');
    }

    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(createStore)(reducer, preloadedState);
    }

    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }

    var currentReducer = reducer;
    var currentState = preloadedState;
    var currentListeners = [];
    var nextListeners = currentListeners;
    var isDispatching = false;
    /**
     * This makes a shallow copy of currentListeners so we can use
     * nextListeners as a temporary list while dispatching.
     *
     * This prevents any bugs around consumers calling
     * subscribe/unsubscribe in the middle of a dispatch.
     */

    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
    }
    /**
     * Reads the state tree managed by the store.
     *
     * @returns {any} The current state tree of your application.
     */


    function getState() {
      if (isDispatching) {
        throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
      }

      return currentState;
    }
    /**
     * Adds a change listener. It will be called any time an action is dispatched,
     * and some part of the state tree may potentially have changed. You may then
     * call `getState()` to read the current state tree inside the callback.
     *
     * You may call `dispatch()` from a change listener, with the following
     * caveats:
     *
     * 1. The subscriptions are snapshotted just before every `dispatch()` call.
     * If you subscribe or unsubscribe while the listeners are being invoked, this
     * will not have any effect on the `dispatch()` that is currently in progress.
     * However, the next `dispatch()` call, whether nested or not, will use a more
     * recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all state changes, as the state
     * might have been updated multiple times during a nested `dispatch()` before
     * the listener is called. It is, however, guaranteed that all subscribers
     * registered before the `dispatch()` started will be called with the latest
     * state by the time it exits.
     *
     * @param {Function} listener A callback to be invoked on every dispatch.
     * @returns {Function} A function to remove this change listener.
     */


    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error('Expected the listener to be a function.');
      }

      if (isDispatching) {
        throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
      }

      var isSubscribed = true;
      ensureCanMutateNextListeners();
      nextListeners.push(listener);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribelistener for more details.');
        }

        isSubscribed = false;
        ensureCanMutateNextListeners();
        var index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
        currentListeners = null;
      };
    }
    /**
     * Dispatches an action. It is the only way to trigger a state change.
     *
     * The `reducer` function, used to create the store, will be called with the
     * current state tree and the given `action`. Its return value will
     * be considered the **next** state of the tree, and the change listeners
     * will be notified.
     *
     * The base implementation only supports plain object actions. If you want to
     * dispatch a Promise, an Observable, a thunk, or something else, you need to
     * wrap your store creating function into the corresponding middleware. For
     * example, see the documentation for the `redux-thunk` package. Even the
     * middleware will eventually dispatch plain object actions using this method.
     *
     * @param {Object} action A plain object representing “what changed”. It is
     * a good idea to keep actions serializable so you can record and replay user
     * sessions, or use the time travelling `redux-devtools`. An action must have
     * a `type` property which may not be `undefined`. It is a good idea to use
     * string constants for action types.
     *
     * @returns {Object} For convenience, the same action object you dispatched.
     *
     * Note that, if you use a custom middleware, it may wrap `dispatch()` to
     * return something else (for example, a Promise you can await).
     */


    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
      }

      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
      }

      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      var listeners = currentListeners = nextListeners;

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }

      return action;
    }
    /**
     * Replaces the reducer currently used by the store to calculate the state.
     *
     * You might need this if your app implements code splitting and you want to
     * load some of the reducers dynamically. You might also need this if you
     * implement a hot reloading mechanism for Redux.
     *
     * @param {Function} nextReducer The reducer for the store to use instead.
     * @returns {void}
     */


    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== 'function') {
        throw new Error('Expected the nextReducer to be a function.');
      }

      currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
      // Any reducers that existed in both the new and old rootReducer
      // will receive the previous state. This effectively populates
      // the new state tree with any relevant data from the old one.

      dispatch({
        type: ActionTypes.REPLACE
      });
    }
    /**
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */


    function observable() {
      var _ref;

      var outerSubscribe = subscribe;
      return _ref = {
        /**
         * The minimal observable subscription method.
         * @param {Object} observer Any object that can be used as an observer.
         * The observer object should have a `next` method.
         * @returns {subscription} An object with an `unsubscribe` method that can
         * be used to unsubscribe the observable from the store, and prevent further
         * emission of values from the observable.
         */
        subscribe: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            throw new TypeError('Expected the observer to be an object.');
          }

          function observeState() {
            if (observer.next) {
              observer.next(getState());
            }
          }

          observeState();
          var unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe: unsubscribe
          };
        }
      }, _ref[result] = function () {
        return this;
      }, _ref;
    } // When a store is created, an "INIT" action is dispatched so that every
    // reducer returns their initial state. This effectively populates
    // the initial state tree.


    dispatch({
      type: ActionTypes.INIT
    });
    return _ref2 = {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    }, _ref2[result] = observable, _ref2;
  }

  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */
  function warning$1(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */


    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
    } catch (e) {} // eslint-disable-line no-empty

  }

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      return dispatch(actionCreator.apply(this, arguments));
    };
  }
  /**
   * Turns an object whose values are action creators, into an object with the
   * same keys, but with every function wrapped into a `dispatch` call so they
   * may be invoked directly. This is just a convenience method, as you can call
   * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
   *
   * For convenience, you can also pass an action creator as the first argument,
   * and get a dispatch wrapped function in return.
   *
   * @param {Function|Object} actionCreators An object whose values are action
   * creator functions. One handy way to obtain it is to use ES6 `import * as`
   * syntax. You may also pass a single function.
   *
   * @param {Function} dispatch The `dispatch` function available on your Redux
   * store.
   *
   * @returns {Function|Object} The object mimicking the original object, but with
   * every action creator wrapped into the `dispatch` call. If you passed a
   * function as `actionCreators`, the return value will also be a single
   * function.
   */


  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
      throw new Error("bindActionCreators expected an object or a function, instead received " + (actionCreators === null ? 'null' : typeof actionCreators) + ". " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
    }

    var boundActionCreators = {};

    for (var key in actionCreators) {
      var actionCreator = actionCreators[key];

      if (typeof actionCreator === 'function') {
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
      }
    }

    return boundActionCreators;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      keys.push.apply(keys, Object.getOwnPropertySymbols(object));
    }

    if (enumerableOnly) keys = keys.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(source, true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(source).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /**
   * Composes single-argument functions from right to left. The rightmost
   * function can take multiple arguments as it provides the signature for
   * the resulting composite function.
   *
   * @param {...Function} funcs The functions to compose.
   * @returns {Function} A function obtained by composing the argument functions
   * from right to left. For example, compose(f, g, h) is identical to doing
   * (...args) => f(g(h(...args))).
   */
  function compose() {
    for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    if (funcs.length === 0) {
      return function (arg) {
        return arg;
      };
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce(function (a, b) {
      return function () {
        return a(b.apply(void 0, arguments));
      };
    });
  }

  /**
   * Creates a store enhancer that applies middleware to the dispatch method
   * of the Redux store. This is handy for a variety of tasks, such as expressing
   * asynchronous actions in a concise manner, or logging every action payload.
   *
   * See `redux-thunk` package as an example of the Redux middleware.
   *
   * Because middleware is potentially asynchronous, this should be the first
   * store enhancer in the composition chain.
   *
   * Note that each middleware will be given the `dispatch` and `getState` functions
   * as named arguments.
   *
   * @param {...Function} middlewares The middleware chain to be applied.
   * @returns {Function} A store enhancer applying the middleware.
   */

  function applyMiddleware() {
    for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }

    return function (createStore) {
      return function () {
        var store = createStore.apply(void 0, arguments);

        var _dispatch = function dispatch() {
          throw new Error('Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
        };

        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch() {
            return _dispatch.apply(void 0, arguments);
          }
        };
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        _dispatch = compose.apply(void 0, chain)(store.dispatch);
        return _objectSpread2({}, store, {
          dispatch: _dispatch
        });
      };
    };
  }

  /*
   * This is a dummy function to check if the function name has been altered by minification.
   * If the function has been minified and NODE_ENV !== 'production', warn the user.
   */

  function isCrushed() {}

  if ( typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
    warning$1('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var reactIs_production_min = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports,"__esModule",{value:!0});
  var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?Symbol.for("react.suspense_list"):
  60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.fundamental"):60117,w=b?Symbol.for("react.responder"):60118,x=b?Symbol.for("react.scope"):60119;function y(a){if("object"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function z(a){return y(a)===m}
  exports.typeOf=y;exports.AsyncMode=l;exports.ConcurrentMode=m;exports.ContextConsumer=k;exports.ContextProvider=h;exports.Element=c;exports.ForwardRef=n;exports.Fragment=e;exports.Lazy=t;exports.Memo=r;exports.Portal=d;exports.Profiler=g;exports.StrictMode=f;exports.Suspense=p;
  exports.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===m||a===g||a===f||a===p||a===q||"object"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===v||a.$$typeof===w||a.$$typeof===x)};exports.isAsyncMode=function(a){return z(a)||y(a)===l};exports.isConcurrentMode=z;exports.isContextConsumer=function(a){return y(a)===k};exports.isContextProvider=function(a){return y(a)===h};
  exports.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};exports.isForwardRef=function(a){return y(a)===n};exports.isFragment=function(a){return y(a)===e};exports.isLazy=function(a){return y(a)===t};exports.isMemo=function(a){return y(a)===r};exports.isPortal=function(a){return y(a)===d};exports.isProfiler=function(a){return y(a)===g};exports.isStrictMode=function(a){return y(a)===f};exports.isSuspense=function(a){return y(a)===p};
  });

  unwrapExports(reactIs_production_min);
  var reactIs_production_min_1 = reactIs_production_min.typeOf;
  var reactIs_production_min_2 = reactIs_production_min.AsyncMode;
  var reactIs_production_min_3 = reactIs_production_min.ConcurrentMode;
  var reactIs_production_min_4 = reactIs_production_min.ContextConsumer;
  var reactIs_production_min_5 = reactIs_production_min.ContextProvider;
  var reactIs_production_min_6 = reactIs_production_min.Element;
  var reactIs_production_min_7 = reactIs_production_min.ForwardRef;
  var reactIs_production_min_8 = reactIs_production_min.Fragment;
  var reactIs_production_min_9 = reactIs_production_min.Lazy;
  var reactIs_production_min_10 = reactIs_production_min.Memo;
  var reactIs_production_min_11 = reactIs_production_min.Portal;
  var reactIs_production_min_12 = reactIs_production_min.Profiler;
  var reactIs_production_min_13 = reactIs_production_min.StrictMode;
  var reactIs_production_min_14 = reactIs_production_min.Suspense;
  var reactIs_production_min_15 = reactIs_production_min.isValidElementType;
  var reactIs_production_min_16 = reactIs_production_min.isAsyncMode;
  var reactIs_production_min_17 = reactIs_production_min.isConcurrentMode;
  var reactIs_production_min_18 = reactIs_production_min.isContextConsumer;
  var reactIs_production_min_19 = reactIs_production_min.isContextProvider;
  var reactIs_production_min_20 = reactIs_production_min.isElement;
  var reactIs_production_min_21 = reactIs_production_min.isForwardRef;
  var reactIs_production_min_22 = reactIs_production_min.isFragment;
  var reactIs_production_min_23 = reactIs_production_min.isLazy;
  var reactIs_production_min_24 = reactIs_production_min.isMemo;
  var reactIs_production_min_25 = reactIs_production_min.isPortal;
  var reactIs_production_min_26 = reactIs_production_min.isProfiler;
  var reactIs_production_min_27 = reactIs_production_min.isStrictMode;
  var reactIs_production_min_28 = reactIs_production_min.isSuspense;

  var reactIs_development = createCommonjsModule(function (module, exports) {



  {
    (function() {

  Object.defineProperty(exports, '__esModule', { value: true });

  // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  // nor polyfill, then a plain number is used for performance.
  var hasSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
  var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
  var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
  var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
  var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
  var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
  // (unstable) APIs that have been removed. Can we remove the symbols?

  var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
  var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
  var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
  var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
  var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
  var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
  var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
  var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
  var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

  function isValidElementType(type) {
    return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
    type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE);
  }

  /**
   * Forked from fbjs/warning:
   * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
   *
   * Only change is we use console.warn instead of console.error,
   * and do nothing when 'console' is not supported.
   * This really simplifies the code.
   * ---
   * Similar to invariant but only logs a warning if the condition is not met.
   * This can be used to log issues in development environments in critical
   * paths. Removing the logging code for production environments will keep the
   * same logic and follow the same code paths.
   */
  var lowPriorityWarningWithoutStack = function () {};

  {
    var printWarning = function (format) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });

      if (typeof console !== 'undefined') {
        console.warn(message);
      }

      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    lowPriorityWarningWithoutStack = function (condition, format) {
      if (format === undefined) {
        throw new Error('`lowPriorityWarningWithoutStack(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(void 0, [format].concat(args));
      }
    };
  }

  var lowPriorityWarningWithoutStack$1 = lowPriorityWarningWithoutStack;

  function typeOf(object) {
    if (typeof object === 'object' && object !== null) {
      var $$typeof = object.$$typeof;

      switch ($$typeof) {
        case REACT_ELEMENT_TYPE:
          var type = object.type;

          switch (type) {
            case REACT_ASYNC_MODE_TYPE:
            case REACT_CONCURRENT_MODE_TYPE:
            case REACT_FRAGMENT_TYPE:
            case REACT_PROFILER_TYPE:
            case REACT_STRICT_MODE_TYPE:
            case REACT_SUSPENSE_TYPE:
              return type;

            default:
              var $$typeofType = type && type.$$typeof;

              switch ($$typeofType) {
                case REACT_CONTEXT_TYPE:
                case REACT_FORWARD_REF_TYPE:
                case REACT_LAZY_TYPE:
                case REACT_MEMO_TYPE:
                case REACT_PROVIDER_TYPE:
                  return $$typeofType;

                default:
                  return $$typeof;
              }

          }

        case REACT_PORTAL_TYPE:
          return $$typeof;
      }
    }

    return undefined;
  } // AsyncMode is deprecated along with isAsyncMode

  var AsyncMode = REACT_ASYNC_MODE_TYPE;
  var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
  var ContextConsumer = REACT_CONTEXT_TYPE;
  var ContextProvider = REACT_PROVIDER_TYPE;
  var Element = REACT_ELEMENT_TYPE;
  var ForwardRef = REACT_FORWARD_REF_TYPE;
  var Fragment = REACT_FRAGMENT_TYPE;
  var Lazy = REACT_LAZY_TYPE;
  var Memo = REACT_MEMO_TYPE;
  var Portal = REACT_PORTAL_TYPE;
  var Profiler = REACT_PROFILER_TYPE;
  var StrictMode = REACT_STRICT_MODE_TYPE;
  var Suspense = REACT_SUSPENSE_TYPE;
  var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

  function isAsyncMode(object) {
    {
      if (!hasWarnedAboutDeprecatedIsAsyncMode) {
        hasWarnedAboutDeprecatedIsAsyncMode = true;
        lowPriorityWarningWithoutStack$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
      }
    }

    return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
  }
  function isConcurrentMode(object) {
    return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
  }
  function isContextConsumer(object) {
    return typeOf(object) === REACT_CONTEXT_TYPE;
  }
  function isContextProvider(object) {
    return typeOf(object) === REACT_PROVIDER_TYPE;
  }
  function isElement(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function isForwardRef(object) {
    return typeOf(object) === REACT_FORWARD_REF_TYPE;
  }
  function isFragment(object) {
    return typeOf(object) === REACT_FRAGMENT_TYPE;
  }
  function isLazy(object) {
    return typeOf(object) === REACT_LAZY_TYPE;
  }
  function isMemo(object) {
    return typeOf(object) === REACT_MEMO_TYPE;
  }
  function isPortal(object) {
    return typeOf(object) === REACT_PORTAL_TYPE;
  }
  function isProfiler(object) {
    return typeOf(object) === REACT_PROFILER_TYPE;
  }
  function isStrictMode(object) {
    return typeOf(object) === REACT_STRICT_MODE_TYPE;
  }
  function isSuspense(object) {
    return typeOf(object) === REACT_SUSPENSE_TYPE;
  }

  exports.typeOf = typeOf;
  exports.AsyncMode = AsyncMode;
  exports.ConcurrentMode = ConcurrentMode;
  exports.ContextConsumer = ContextConsumer;
  exports.ContextProvider = ContextProvider;
  exports.Element = Element;
  exports.ForwardRef = ForwardRef;
  exports.Fragment = Fragment;
  exports.Lazy = Lazy;
  exports.Memo = Memo;
  exports.Portal = Portal;
  exports.Profiler = Profiler;
  exports.StrictMode = StrictMode;
  exports.Suspense = Suspense;
  exports.isValidElementType = isValidElementType;
  exports.isAsyncMode = isAsyncMode;
  exports.isConcurrentMode = isConcurrentMode;
  exports.isContextConsumer = isContextConsumer;
  exports.isContextProvider = isContextProvider;
  exports.isElement = isElement;
  exports.isForwardRef = isForwardRef;
  exports.isFragment = isFragment;
  exports.isLazy = isLazy;
  exports.isMemo = isMemo;
  exports.isPortal = isPortal;
  exports.isProfiler = isProfiler;
  exports.isStrictMode = isStrictMode;
  exports.isSuspense = isSuspense;
    })();
  }
  });

  unwrapExports(reactIs_development);
  var reactIs_development_1 = reactIs_development.typeOf;
  var reactIs_development_2 = reactIs_development.AsyncMode;
  var reactIs_development_3 = reactIs_development.ConcurrentMode;
  var reactIs_development_4 = reactIs_development.ContextConsumer;
  var reactIs_development_5 = reactIs_development.ContextProvider;
  var reactIs_development_6 = reactIs_development.Element;
  var reactIs_development_7 = reactIs_development.ForwardRef;
  var reactIs_development_8 = reactIs_development.Fragment;
  var reactIs_development_9 = reactIs_development.Lazy;
  var reactIs_development_10 = reactIs_development.Memo;
  var reactIs_development_11 = reactIs_development.Portal;
  var reactIs_development_12 = reactIs_development.Profiler;
  var reactIs_development_13 = reactIs_development.StrictMode;
  var reactIs_development_14 = reactIs_development.Suspense;
  var reactIs_development_15 = reactIs_development.isValidElementType;
  var reactIs_development_16 = reactIs_development.isAsyncMode;
  var reactIs_development_17 = reactIs_development.isConcurrentMode;
  var reactIs_development_18 = reactIs_development.isContextConsumer;
  var reactIs_development_19 = reactIs_development.isContextProvider;
  var reactIs_development_20 = reactIs_development.isElement;
  var reactIs_development_21 = reactIs_development.isForwardRef;
  var reactIs_development_22 = reactIs_development.isFragment;
  var reactIs_development_23 = reactIs_development.isLazy;
  var reactIs_development_24 = reactIs_development.isMemo;
  var reactIs_development_25 = reactIs_development.isPortal;
  var reactIs_development_26 = reactIs_development.isProfiler;
  var reactIs_development_27 = reactIs_development.isStrictMode;
  var reactIs_development_28 = reactIs_development.isSuspense;

  var reactIs = createCommonjsModule(function (module) {

  {
    module.exports = reactIs_development;
  }
  });
  var reactIs_1 = reactIs.isValidElementType;
  var reactIs_2 = reactIs.isContextConsumer;

  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;

  function toObject(val) {
  	if (val === null || val === undefined) {
  		throw new TypeError('Object.assign cannot be called with null or undefined');
  	}

  	return Object(val);
  }

  function shouldUseNative() {
  	try {
  		if (!Object.assign) {
  			return false;
  		}

  		// Detect buggy property enumeration order in older V8 versions.

  		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
  		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
  		test1[5] = 'de';
  		if (Object.getOwnPropertyNames(test1)[0] === '5') {
  			return false;
  		}

  		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
  		var test2 = {};
  		for (var i = 0; i < 10; i++) {
  			test2['_' + String.fromCharCode(i)] = i;
  		}
  		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
  			return test2[n];
  		});
  		if (order2.join('') !== '0123456789') {
  			return false;
  		}

  		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
  		var test3 = {};
  		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
  			test3[letter] = letter;
  		});
  		if (Object.keys(Object.assign({}, test3)).join('') !==
  				'abcdefghijklmnopqrst') {
  			return false;
  		}

  		return true;
  	} catch (err) {
  		// We don't expect any of the above to throw, but better to be safe.
  		return false;
  	}
  }

  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
  	var from;
  	var to = toObject(target);
  	var symbols;

  	for (var s = 1; s < arguments.length; s++) {
  		from = Object(arguments[s]);

  		for (var key in from) {
  			if (hasOwnProperty.call(from, key)) {
  				to[key] = from[key];
  			}
  		}

  		if (getOwnPropertySymbols) {
  			symbols = getOwnPropertySymbols(from);
  			for (var i = 0; i < symbols.length; i++) {
  				if (propIsEnumerable.call(from, symbols[i])) {
  					to[symbols[i]] = from[symbols[i]];
  				}
  			}
  		}
  	}

  	return to;
  };

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

  var ReactPropTypesSecret_1 = ReactPropTypesSecret;

  var printWarning = function() {};

  {
    var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
    var loggedTypeFailures = {};
    var has = Function.call.bind(Object.prototype.hasOwnProperty);

    printWarning = function(text) {
      var message = 'Warning: ' + text;
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };
  }

  /**
   * Assert that the values match with the type specs.
   * Error messages are memorized and will only be shown once.
   *
   * @param {object} typeSpecs Map of name to a ReactPropType
   * @param {object} values Runtime values that need to be type-checked
   * @param {string} location e.g. "prop", "context", "child context"
   * @param {string} componentName Name of the component for error messages.
   * @param {?Function} getStack Returns the component stack.
   * @private
   */
  function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    {
      for (var typeSpecName in typeSpecs) {
        if (has(typeSpecs, typeSpecName)) {
          var error;
          // Prop type validation may throw. In case they do, we don't want to
          // fail the render phase where it didn't fail before. So we log it.
          // After these have been cleaned up, we'll let them throw.
          try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            if (typeof typeSpecs[typeSpecName] !== 'function') {
              var err = Error(
                (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
                'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
              );
              err.name = 'Invariant Violation';
              throw err;
            }
            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
          } catch (ex) {
            error = ex;
          }
          if (error && !(error instanceof Error)) {
            printWarning(
              (componentName || 'React class') + ': type specification of ' +
              location + ' `' + typeSpecName + '` is invalid; the type checker ' +
              'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
              'You may have forgotten to pass an argument to the type checker ' +
              'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
              'shape all require an argument).'
            );
          }
          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error.message] = true;

            var stack = getStack ? getStack() : '';

            printWarning(
              'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
            );
          }
        }
      }
    }
  }

  /**
   * Resets warning cache when testing.
   *
   * @private
   */
  checkPropTypes.resetWarningCache = function() {
    {
      loggedTypeFailures = {};
    }
  };

  var checkPropTypes_1 = checkPropTypes;

  var has$1 = Function.call.bind(Object.prototype.hasOwnProperty);
  var printWarning$1 = function() {};

  {
    printWarning$1 = function(text) {
      var message = 'Warning: ' + text;
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };
  }

  function emptyFunctionThatReturnsNull() {
    return null;
  }

  var factoryWithTypeCheckers = function(isValidElement, throwOnDirectAccess) {
    /* global Symbol */
    var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

    /**
     * Returns the iterator method function contained on the iterable object.
     *
     * Be sure to invoke the function with the iterable as context:
     *
     *     var iteratorFn = getIteratorFn(myIterable);
     *     if (iteratorFn) {
     *       var iterator = iteratorFn.call(myIterable);
     *       ...
     *     }
     *
     * @param {?object} maybeIterable
     * @return {?function}
     */
    function getIteratorFn(maybeIterable) {
      var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
      if (typeof iteratorFn === 'function') {
        return iteratorFn;
      }
    }

    /**
     * Collection of methods that allow declaration and validation of props that are
     * supplied to React components. Example usage:
     *
     *   var Props = require('ReactPropTypes');
     *   var MyArticle = React.createClass({
     *     propTypes: {
     *       // An optional string prop named "description".
     *       description: Props.string,
     *
     *       // A required enum prop named "category".
     *       category: Props.oneOf(['News','Photos']).isRequired,
     *
     *       // A prop named "dialog" that requires an instance of Dialog.
     *       dialog: Props.instanceOf(Dialog).isRequired
     *     },
     *     render: function() { ... }
     *   });
     *
     * A more formal specification of how these methods are used:
     *
     *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
     *   decl := ReactPropTypes.{type}(.isRequired)?
     *
     * Each and every declaration produces a function with the same signature. This
     * allows the creation of custom validation functions. For example:
     *
     *  var MyLink = React.createClass({
     *    propTypes: {
     *      // An optional string or URI prop named "href".
     *      href: function(props, propName, componentName) {
     *        var propValue = props[propName];
     *        if (propValue != null && typeof propValue !== 'string' &&
     *            !(propValue instanceof URI)) {
     *          return new Error(
     *            'Expected a string or an URI for ' + propName + ' in ' +
     *            componentName
     *          );
     *        }
     *      }
     *    },
     *    render: function() {...}
     *  });
     *
     * @internal
     */

    var ANONYMOUS = '<<anonymous>>';

    // Important!
    // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
    var ReactPropTypes = {
      array: createPrimitiveTypeChecker('array'),
      bool: createPrimitiveTypeChecker('boolean'),
      func: createPrimitiveTypeChecker('function'),
      number: createPrimitiveTypeChecker('number'),
      object: createPrimitiveTypeChecker('object'),
      string: createPrimitiveTypeChecker('string'),
      symbol: createPrimitiveTypeChecker('symbol'),

      any: createAnyTypeChecker(),
      arrayOf: createArrayOfTypeChecker,
      element: createElementTypeChecker(),
      elementType: createElementTypeTypeChecker(),
      instanceOf: createInstanceTypeChecker,
      node: createNodeChecker(),
      objectOf: createObjectOfTypeChecker,
      oneOf: createEnumTypeChecker,
      oneOfType: createUnionTypeChecker,
      shape: createShapeTypeChecker,
      exact: createStrictShapeTypeChecker,
    };

    /**
     * inlined Object.is polyfill to avoid requiring consumers ship their own
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
     */
    /*eslint-disable no-self-compare*/
    function is(x, y) {
      // SameValue algorithm
      if (x === y) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
      } else {
        // Step 6.a: NaN == NaN
        return x !== x && y !== y;
      }
    }
    /*eslint-enable no-self-compare*/

    /**
     * We use an Error-like object for backward compatibility as people may call
     * PropTypes directly and inspect their output. However, we don't use real
     * Errors anymore. We don't inspect their stack anyway, and creating them
     * is prohibitively expensive if they are created too often, such as what
     * happens in oneOfType() for any type before the one that matched.
     */
    function PropTypeError(message) {
      this.message = message;
      this.stack = '';
    }
    // Make `instanceof Error` still work for returned errors.
    PropTypeError.prototype = Error.prototype;

    function createChainableTypeChecker(validate) {
      {
        var manualPropTypeCallCache = {};
        var manualPropTypeWarningCount = 0;
      }
      function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
        componentName = componentName || ANONYMOUS;
        propFullName = propFullName || propName;

        if (secret !== ReactPropTypesSecret_1) {
          if (throwOnDirectAccess) {
            // New behavior only for users of `prop-types` package
            var err = new Error(
              'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
              'Use `PropTypes.checkPropTypes()` to call them. ' +
              'Read more at http://fb.me/use-check-prop-types'
            );
            err.name = 'Invariant Violation';
            throw err;
          } else if ( typeof console !== 'undefined') {
            // Old behavior for people using React.PropTypes
            var cacheKey = componentName + ':' + propName;
            if (
              !manualPropTypeCallCache[cacheKey] &&
              // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3
            ) {
              printWarning$1(
                'You are manually calling a React.PropTypes validation ' +
                'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
                'and will throw in the standalone `prop-types` package. ' +
                'You may be seeing this warning due to a third-party PropTypes ' +
                'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
              );
              manualPropTypeCallCache[cacheKey] = true;
              manualPropTypeWarningCount++;
            }
          }
        }
        if (props[propName] == null) {
          if (isRequired) {
            if (props[propName] === null) {
              return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
            }
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
          }
          return null;
        } else {
          return validate(props, propName, componentName, location, propFullName);
        }
      }

      var chainedCheckType = checkType.bind(null, false);
      chainedCheckType.isRequired = checkType.bind(null, true);

      return chainedCheckType;
    }

    function createPrimitiveTypeChecker(expectedType) {
      function validate(props, propName, componentName, location, propFullName, secret) {
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== expectedType) {
          // `propValue` being instance of, say, date/regexp, pass the 'object'
          // check, but we can offer a more precise error message here rather than
          // 'of type `object`'.
          var preciseType = getPreciseType(propValue);

          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createAnyTypeChecker() {
      return createChainableTypeChecker(emptyFunctionThatReturnsNull);
    }

    function createArrayOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
        }
        var propValue = props[propName];
        if (!Array.isArray(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
        }
        for (var i = 0; i < propValue.length; i++) {
          var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);
          if (error instanceof Error) {
            return error;
          }
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createElementTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        if (!isValidElement(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createElementTypeTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        if (!reactIs.isValidElementType(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createInstanceTypeChecker(expectedClass) {
      function validate(props, propName, componentName, location, propFullName) {
        if (!(props[propName] instanceof expectedClass)) {
          var expectedClassName = expectedClass.name || ANONYMOUS;
          var actualClassName = getClassName(props[propName]);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createEnumTypeChecker(expectedValues) {
      if (!Array.isArray(expectedValues)) {
        {
          if (arguments.length > 1) {
            printWarning$1(
              'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +
              'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
            );
          } else {
            printWarning$1('Invalid argument supplied to oneOf, expected an array.');
          }
        }
        return emptyFunctionThatReturnsNull;
      }

      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        for (var i = 0; i < expectedValues.length; i++) {
          if (is(propValue, expectedValues[i])) {
            return null;
          }
        }

        var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
          var type = getPreciseType(value);
          if (type === 'symbol') {
            return String(value);
          }
          return value;
        });
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
      }
      return createChainableTypeChecker(validate);
    }

    function createObjectOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
        }
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
        }
        for (var key in propValue) {
          if (has$1(propValue, key)) {
            var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
            if (error instanceof Error) {
              return error;
            }
          }
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createUnionTypeChecker(arrayOfTypeCheckers) {
      if (!Array.isArray(arrayOfTypeCheckers)) {
         printWarning$1('Invalid argument supplied to oneOfType, expected an instance of array.') ;
        return emptyFunctionThatReturnsNull;
      }

      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (typeof checker !== 'function') {
          printWarning$1(
            'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
            'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
          );
          return emptyFunctionThatReturnsNull;
        }
      }

      function validate(props, propName, componentName, location, propFullName) {
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
            return null;
          }
        }

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
      }
      return createChainableTypeChecker(validate);
    }

    function createNodeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        if (!isNode(props[propName])) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }
        for (var key in shapeTypes) {
          var checker = shapeTypes[key];
          if (!checker) {
            continue;
          }
          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
          if (error) {
            return error;
          }
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createStrictShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }
        // We need to check all keys in case some are required but missing from
        // props.
        var allKeys = objectAssign({}, props[propName], shapeTypes);
        for (var key in allKeys) {
          var checker = shapeTypes[key];
          if (!checker) {
            return new PropTypeError(
              'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
              '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
              '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
            );
          }
          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
          if (error) {
            return error;
          }
        }
        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function isNode(propValue) {
      switch (typeof propValue) {
        case 'number':
        case 'string':
        case 'undefined':
          return true;
        case 'boolean':
          return !propValue;
        case 'object':
          if (Array.isArray(propValue)) {
            return propValue.every(isNode);
          }
          if (propValue === null || isValidElement(propValue)) {
            return true;
          }

          var iteratorFn = getIteratorFn(propValue);
          if (iteratorFn) {
            var iterator = iteratorFn.call(propValue);
            var step;
            if (iteratorFn !== propValue.entries) {
              while (!(step = iterator.next()).done) {
                if (!isNode(step.value)) {
                  return false;
                }
              }
            } else {
              // Iterator will provide entry [k,v] tuples rather than values.
              while (!(step = iterator.next()).done) {
                var entry = step.value;
                if (entry) {
                  if (!isNode(entry[1])) {
                    return false;
                  }
                }
              }
            }
          } else {
            return false;
          }

          return true;
        default:
          return false;
      }
    }

    function isSymbol(propType, propValue) {
      // Native Symbol.
      if (propType === 'symbol') {
        return true;
      }

      // falsy value can't be a Symbol
      if (!propValue) {
        return false;
      }

      // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
      if (propValue['@@toStringTag'] === 'Symbol') {
        return true;
      }

      // Fallback for non-spec compliant Symbols which are polyfilled.
      if (typeof Symbol === 'function' && propValue instanceof Symbol) {
        return true;
      }

      return false;
    }

    // Equivalent of `typeof` but with special handling for array and regexp.
    function getPropType(propValue) {
      var propType = typeof propValue;
      if (Array.isArray(propValue)) {
        return 'array';
      }
      if (propValue instanceof RegExp) {
        // Old webkits (at least until Android 4.0) return 'function' rather than
        // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
        // passes PropTypes.object.
        return 'object';
      }
      if (isSymbol(propType, propValue)) {
        return 'symbol';
      }
      return propType;
    }

    // This handles more types than `getPropType`. Only used for error messages.
    // See `createPrimitiveTypeChecker`.
    function getPreciseType(propValue) {
      if (typeof propValue === 'undefined' || propValue === null) {
        return '' + propValue;
      }
      var propType = getPropType(propValue);
      if (propType === 'object') {
        if (propValue instanceof Date) {
          return 'date';
        } else if (propValue instanceof RegExp) {
          return 'regexp';
        }
      }
      return propType;
    }

    // Returns a string that is postfixed to a warning about an invalid type.
    // For example, "undefined" or "of type array"
    function getPostfixForTypeWarning(value) {
      var type = getPreciseType(value);
      switch (type) {
        case 'array':
        case 'object':
          return 'an ' + type;
        case 'boolean':
        case 'date':
        case 'regexp':
          return 'a ' + type;
        default:
          return type;
      }
    }

    // Returns class name of the object, if any.
    function getClassName(propValue) {
      if (!propValue.constructor || !propValue.constructor.name) {
        return ANONYMOUS;
      }
      return propValue.constructor.name;
    }

    ReactPropTypes.checkPropTypes = checkPropTypes_1;
    ReactPropTypes.resetWarningCache = checkPropTypes_1.resetWarningCache;
    ReactPropTypes.PropTypes = ReactPropTypes;

    return ReactPropTypes;
  };

  var propTypes = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  {
    var ReactIs = reactIs;

    // By explicitly using `prop-types` you are opting into new development behavior.
    // http://fb.me/prop-types-in-prod
    var throwOnDirectAccess = true;
    module.exports = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
  }
  });

  var ReactReduxContext =
  /*#__PURE__*/
  React__default.createContext(null);

  {
    ReactReduxContext.displayName = 'ReactRedux';
  }

  // Default to a dummy "batch" implementation that just runs the callback
  function defaultNoopBatch(callback) {
    callback();
  }

  var batch = defaultNoopBatch; // Allow injecting another batching function later

  var setBatch = function setBatch(newBatch) {
    return batch = newBatch;
  }; // Supply a getter just to skip dealing with ESM bindings

  var getBatch = function getBatch() {
    return batch;
  };

  // well as nesting subscriptions of descendant components, so that we can ensure the
  // ancestor components re-render before descendants

  var nullListeners = {
    notify: function notify() {}
  };

  function createListenerCollection() {
    var batch = getBatch();
    var first = null;
    var last = null;
    return {
      clear: function clear() {
        first = null;
        last = null;
      },
      notify: function notify() {
        batch(function () {
          var listener = first;

          while (listener) {
            listener.callback();
            listener = listener.next;
          }
        });
      },
      get: function get() {
        var listeners = [];
        var listener = first;

        while (listener) {
          listeners.push(listener);
          listener = listener.next;
        }

        return listeners;
      },
      subscribe: function subscribe(callback) {
        var isSubscribed = true;
        var listener = last = {
          callback: callback,
          next: null,
          prev: last
        };

        if (listener.prev) {
          listener.prev.next = listener;
        } else {
          first = listener;
        }

        return function unsubscribe() {
          if (!isSubscribed || first === null) return;
          isSubscribed = false;

          if (listener.next) {
            listener.next.prev = listener.prev;
          } else {
            last = listener.prev;
          }

          if (listener.prev) {
            listener.prev.next = listener.next;
          } else {
            first = listener.next;
          }
        };
      }
    };
  }

  var Subscription =
  /*#__PURE__*/
  function () {
    function Subscription(store, parentSub) {
      this.store = store;
      this.parentSub = parentSub;
      this.unsubscribe = null;
      this.listeners = nullListeners;
      this.handleChangeWrapper = this.handleChangeWrapper.bind(this);
    }

    var _proto = Subscription.prototype;

    _proto.addNestedSub = function addNestedSub(listener) {
      this.trySubscribe();
      return this.listeners.subscribe(listener);
    };

    _proto.notifyNestedSubs = function notifyNestedSubs() {
      this.listeners.notify();
    };

    _proto.handleChangeWrapper = function handleChangeWrapper() {
      if (this.onStateChange) {
        this.onStateChange();
      }
    };

    _proto.isSubscribed = function isSubscribed() {
      return Boolean(this.unsubscribe);
    };

    _proto.trySubscribe = function trySubscribe() {
      if (!this.unsubscribe) {
        this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.handleChangeWrapper) : this.store.subscribe(this.handleChangeWrapper);
        this.listeners = createListenerCollection();
      }
    };

    _proto.tryUnsubscribe = function tryUnsubscribe() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
        this.listeners.clear();
        this.listeners = nullListeners;
      }
    };

    return Subscription;
  }();

  function Provider(_ref) {
    var store = _ref.store,
        context = _ref.context,
        children = _ref.children;
    var contextValue = React.useMemo(function () {
      var subscription = new Subscription(store);
      subscription.onStateChange = subscription.notifyNestedSubs;
      return {
        store: store,
        subscription: subscription
      };
    }, [store]);
    var previousState = React.useMemo(function () {
      return store.getState();
    }, [store]);
    React.useEffect(function () {
      var subscription = contextValue.subscription;
      subscription.trySubscribe();

      if (previousState !== store.getState()) {
        subscription.notifyNestedSubs();
      }

      return function () {
        subscription.tryUnsubscribe();
        subscription.onStateChange = null;
      };
    }, [contextValue, previousState]);
    var Context = context || ReactReduxContext;
    return React__default.createElement(Context.Provider, {
      value: contextValue
    }, children);
  }

  {
    Provider.propTypes = {
      store: propTypes.shape({
        subscribe: propTypes.func.isRequired,
        dispatch: propTypes.func.isRequired,
        getState: propTypes.func.isRequired
      }),
      context: propTypes.object,
      children: propTypes.any
    };
  }

  function _extends$1() {
    _extends$1 = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends$1.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  /**
   * Copyright 2015, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */
  var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };
  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };
  var FORWARD_REF_STATICS = {
    '$$typeof': true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    '$$typeof': true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
  TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

  function getStatics(component) {
    // React v16.11 and below
    if (reactIs.isMemo(component)) {
      return MEMO_STATICS;
    } // React v16.12 and above


    return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
  }

  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getPrototypeOf = Object.getPrototypeOf;
  var objectPrototype = Object.prototype;
  function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') {
      // don't hoist over string (html) components
      if (objectPrototype) {
        var inheritedComponent = getPrototypeOf(sourceComponent);

        if (inheritedComponent && inheritedComponent !== objectPrototype) {
          hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
      }

      var keys = getOwnPropertyNames(sourceComponent);

      if (getOwnPropertySymbols$1) {
        keys = keys.concat(getOwnPropertySymbols$1(sourceComponent));
      }

      var targetStatics = getStatics(targetComponent);
      var sourceStatics = getStatics(sourceComponent);

      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];

        if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
          var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

          try {
            // Avoid failures from read-only properties
            defineProperty(targetComponent, key, descriptor);
          } catch (e) {}
        }
      }
    }

    return targetComponent;
  }

  var hoistNonReactStatics_cjs = hoistNonReactStatics;

  // To get around it, we can conditionally useEffect on the server (no-op) and
  // useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
  // subscription callback always has the selector from the latest render commit
  // available, otherwise a store update may happen between render and the effect,
  // which may cause missed updates; we also must ensure the store subscription
  // is created synchronously, otherwise a store update may occur before the
  // subscription is created and an inconsistent state may be observed

  var useIsomorphicLayoutEffect = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  var EMPTY_ARRAY = [];
  var NO_SUBSCRIPTION_ARRAY = [null, null];

  var stringifyComponent = function stringifyComponent(Comp) {
    try {
      return JSON.stringify(Comp);
    } catch (err) {
      return String(Comp);
    }
  };

  function storeStateUpdatesReducer(state, action) {
    var updateCount = state[1];
    return [action.payload, updateCount + 1];
  }

  function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
    useIsomorphicLayoutEffect(function () {
      return effectFunc.apply(void 0, effectArgs);
    }, dependencies);
  }

  function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs) {
    // We want to capture the wrapper props and child props we used for later comparisons
    lastWrapperProps.current = wrapperProps;
    lastChildProps.current = actualChildProps;
    renderIsScheduled.current = false; // If the render was from a store update, clear out that reference and cascade the subscriber update

    if (childPropsFromStoreUpdate.current) {
      childPropsFromStoreUpdate.current = null;
      notifyNestedSubs();
    }
  }

  function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch) {
    // If we're not subscribed to the store, nothing to do here
    if (!shouldHandleStateChanges) return; // Capture values for checking if and when this component unmounts

    var didUnsubscribe = false;
    var lastThrownError = null; // We'll run this callback every time a store subscription update propagates to this component

    var checkForUpdates = function checkForUpdates() {
      if (didUnsubscribe) {
        // Don't run stale listeners.
        // Redux doesn't guarantee unsubscriptions happen until next dispatch.
        return;
      }

      var latestStoreState = store.getState();
      var newChildProps, error;

      try {
        // Actually run the selector with the most recent store state and wrapper props
        // to determine what the child props should be
        newChildProps = childPropsSelector(latestStoreState, lastWrapperProps.current);
      } catch (e) {
        error = e;
        lastThrownError = e;
      }

      if (!error) {
        lastThrownError = null;
      } // If the child props haven't changed, nothing to do here - cascade the subscription update


      if (newChildProps === lastChildProps.current) {
        if (!renderIsScheduled.current) {
          notifyNestedSubs();
        }
      } else {
        // Save references to the new child props.  Note that we track the "child props from store update"
        // as a ref instead of a useState/useReducer because we need a way to determine if that value has
        // been processed.  If this went into useState/useReducer, we couldn't clear out the value without
        // forcing another re-render, which we don't want.
        lastChildProps.current = newChildProps;
        childPropsFromStoreUpdate.current = newChildProps;
        renderIsScheduled.current = true; // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render

        forceComponentUpdateDispatch({
          type: 'STORE_UPDATED',
          payload: {
            error: error
          }
        });
      }
    }; // Actually subscribe to the nearest connected ancestor (or store)


    subscription.onStateChange = checkForUpdates;
    subscription.trySubscribe(); // Pull data from the store after first render in case the store has
    // changed since we began.

    checkForUpdates();

    var unsubscribeWrapper = function unsubscribeWrapper() {
      didUnsubscribe = true;
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;

      if (lastThrownError) {
        // It's possible that we caught an error due to a bad mapState function, but the
        // parent re-rendered without this component and we're about to unmount.
        // This shouldn't happen as long as we do top-down subscriptions correctly, but
        // if we ever do those wrong, this throw will surface the error in our tests.
        // In that case, throw the error from here so it doesn't get lost.
        throw lastThrownError;
      }
    };

    return unsubscribeWrapper;
  }

  var initStateUpdates = function initStateUpdates() {
    return [null, 0];
  };

  function connectAdvanced(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:
        export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)
      Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.
      Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */
  selectorFactory, // options object:
  _ref) {
    if (_ref === void 0) {
      _ref = {};
    }

    var _ref2 = _ref,
        _ref2$getDisplayName = _ref2.getDisplayName,
        getDisplayName = _ref2$getDisplayName === void 0 ? function (name) {
      return "ConnectAdvanced(" + name + ")";
    } : _ref2$getDisplayName,
        _ref2$methodName = _ref2.methodName,
        methodName = _ref2$methodName === void 0 ? 'connectAdvanced' : _ref2$methodName,
        _ref2$renderCountProp = _ref2.renderCountProp,
        renderCountProp = _ref2$renderCountProp === void 0 ? undefined : _ref2$renderCountProp,
        _ref2$shouldHandleSta = _ref2.shouldHandleStateChanges,
        shouldHandleStateChanges = _ref2$shouldHandleSta === void 0 ? true : _ref2$shouldHandleSta,
        _ref2$storeKey = _ref2.storeKey,
        storeKey = _ref2$storeKey === void 0 ? 'store' : _ref2$storeKey,
        _ref2$withRef = _ref2.withRef,
        withRef = _ref2$withRef === void 0 ? false : _ref2$withRef,
        _ref2$forwardRef = _ref2.forwardRef,
        forwardRef = _ref2$forwardRef === void 0 ? false : _ref2$forwardRef,
        _ref2$context = _ref2.context,
        context = _ref2$context === void 0 ? ReactReduxContext : _ref2$context,
        connectOptions = _objectWithoutPropertiesLoose(_ref2, ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"]);

    {
      if (renderCountProp !== undefined) {
        throw new Error("renderCountProp is removed. render counting is built into the latest React Dev Tools profiling extension");
      }

      if (withRef) {
        throw new Error('withRef is removed. To access the wrapped instance, use a ref on the connected component');
      }

      var customStoreWarningMessage = 'To use a custom Redux store for specific components, create a custom React context with ' + "React.createContext(), and pass the context object to React Redux's Provider and specific components" + ' like: <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' + 'You may also pass a {context : MyContext} option to connect';

      if (storeKey !== 'store') {
        throw new Error('storeKey has been removed and does not do anything. ' + customStoreWarningMessage);
      }
    }

    var Context = context;
    return function wrapWithConnect(WrappedComponent) {
      if ( !reactIs_1(WrappedComponent)) {
        throw new Error("You must pass a component to the function returned by " + (methodName + ". Instead received " + stringifyComponent(WrappedComponent)));
      }

      var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
      var displayName = getDisplayName(wrappedComponentName);

      var selectorFactoryOptions = _extends$1({}, connectOptions, {
        getDisplayName: getDisplayName,
        methodName: methodName,
        renderCountProp: renderCountProp,
        shouldHandleStateChanges: shouldHandleStateChanges,
        storeKey: storeKey,
        displayName: displayName,
        wrappedComponentName: wrappedComponentName,
        WrappedComponent: WrappedComponent
      });

      var pure = connectOptions.pure;

      function createChildSelector(store) {
        return selectorFactory(store.dispatch, selectorFactoryOptions);
      } // If we aren't running in "pure" mode, we don't want to memoize values.
      // To avoid conditionally calling hooks, we fall back to a tiny wrapper
      // that just executes the given callback immediately.


      var usePureOnlyMemo = pure ? React.useMemo : function (callback) {
        return callback();
      };

      function ConnectFunction(props) {
        var _useMemo = React.useMemo(function () {
          // Distinguish between actual "data" props that were passed to the wrapper component,
          // and values needed to control behavior (forwarded refs, alternate context instances).
          // To maintain the wrapperProps object reference, memoize this destructuring.
          var forwardedRef = props.forwardedRef,
              wrapperProps = _objectWithoutPropertiesLoose(props, ["forwardedRef"]);

          return [props.context, forwardedRef, wrapperProps];
        }, [props]),
            propsContext = _useMemo[0],
            forwardedRef = _useMemo[1],
            wrapperProps = _useMemo[2];

        var ContextToUse = React.useMemo(function () {
          // Users may optionally pass in a custom context instance to use instead of our ReactReduxContext.
          // Memoize the check that determines which context instance we should use.
          return propsContext && propsContext.Consumer && reactIs_2(React__default.createElement(propsContext.Consumer, null)) ? propsContext : Context;
        }, [propsContext, Context]); // Retrieve the store and ancestor subscription via context, if available

        var contextValue = React.useContext(ContextToUse); // The store _must_ exist as either a prop or in context.
        // We'll check to see if it _looks_ like a Redux store first.
        // This allows us to pass through a `store` prop that is just a plain value.

        var didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
        var didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);

        if ( !didStoreComeFromProps && !didStoreComeFromContext) {
          throw new Error("Could not find \"store\" in the context of " + ("\"" + displayName + "\". Either wrap the root component in a <Provider>, ") + "or pass a custom React context provider to <Provider> and the corresponding " + ("React context consumer to " + displayName + " in connect options."));
        } // Based on the previous check, one of these must be true


        var store = didStoreComeFromProps ? props.store : contextValue.store;
        var childPropsSelector = React.useMemo(function () {
          // The child props selector needs the store reference as an input.
          // Re-create this selector whenever the store changes.
          return createChildSelector(store);
        }, [store]);

        var _useMemo2 = React.useMemo(function () {
          if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY; // This Subscription's source should match where store came from: props vs. context. A component
          // connected to the store via props shouldn't use subscription from context, or vice versa.

          var subscription = new Subscription(store, didStoreComeFromProps ? null : contextValue.subscription); // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
          // the middle of the notification loop, where `subscription` will then be null. This can
          // probably be avoided if Subscription's listeners logic is changed to not call listeners
          // that have been unsubscribed in the  middle of the notification loop.

          var notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);
          return [subscription, notifyNestedSubs];
        }, [store, didStoreComeFromProps, contextValue]),
            subscription = _useMemo2[0],
            notifyNestedSubs = _useMemo2[1]; // Determine what {store, subscription} value should be put into nested context, if necessary,
        // and memoize that value to avoid unnecessary context updates.


        var overriddenContextValue = React.useMemo(function () {
          if (didStoreComeFromProps) {
            // This component is directly subscribed to a store from props.
            // We don't want descendants reading from this store - pass down whatever
            // the existing context value is from the nearest connected ancestor.
            return contextValue;
          } // Otherwise, put this component's subscription instance into context, so that
          // connected descendants won't update until after this component is done


          return _extends$1({}, contextValue, {
            subscription: subscription
          });
        }, [didStoreComeFromProps, contextValue, subscription]); // We need to force this wrapper component to re-render whenever a Redux store update
        // causes a change to the calculated child component props (or we caught an error in mapState)

        var _useReducer = React.useReducer(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates),
            _useReducer$ = _useReducer[0],
            previousStateUpdateResult = _useReducer$[0],
            forceComponentUpdateDispatch = _useReducer[1]; // Propagate any mapState/mapDispatch errors upwards


        if (previousStateUpdateResult && previousStateUpdateResult.error) {
          throw previousStateUpdateResult.error;
        } // Set up refs to coordinate values between the subscription effect and the render logic


        var lastChildProps = React.useRef();
        var lastWrapperProps = React.useRef(wrapperProps);
        var childPropsFromStoreUpdate = React.useRef();
        var renderIsScheduled = React.useRef(false);
        var actualChildProps = usePureOnlyMemo(function () {
          // Tricky logic here:
          // - This render may have been triggered by a Redux store update that produced new child props
          // - However, we may have gotten new wrapper props after that
          // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
          // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
          // So, we'll use the child props from store update only if the wrapper props are the same as last time.
          if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
            return childPropsFromStoreUpdate.current;
          } // TODO We're reading the store directly in render() here. Bad idea?
          // This will likely cause Bad Things (TM) to happen in Concurrent Mode.
          // Note that we do this because on renders _not_ caused by store updates, we need the latest store state
          // to determine what the child props should be.


          return childPropsSelector(store.getState(), wrapperProps);
        }, [store, previousStateUpdateResult, wrapperProps]); // We need this to execute synchronously every time we re-render. However, React warns
        // about useLayoutEffect in SSR, so we try to detect environment and fall back to
        // just useEffect instead to avoid the warning, since neither will run anyway.

        useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs]); // Our re-subscribe logic only runs when the store/subscription setup changes

        useIsomorphicLayoutEffectWithArgs(subscribeUpdates, [shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch], [store, subscription, childPropsSelector]); // Now that all that's done, we can finally try to actually render the child component.
        // We memoize the elements for the rendered child component as an optimization.

        var renderedWrappedComponent = React.useMemo(function () {
          return React__default.createElement(WrappedComponent, _extends$1({}, actualChildProps, {
            ref: forwardedRef
          }));
        }, [forwardedRef, WrappedComponent, actualChildProps]); // If React sees the exact same element reference as last time, it bails out of re-rendering
        // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.

        var renderedChild = React.useMemo(function () {
          if (shouldHandleStateChanges) {
            // If this component is subscribed to store updates, we need to pass its own
            // subscription instance down to our descendants. That means rendering the same
            // Context instance, and putting a different value into the context.
            return React__default.createElement(ContextToUse.Provider, {
              value: overriddenContextValue
            }, renderedWrappedComponent);
          }

          return renderedWrappedComponent;
        }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);
        return renderedChild;
      } // If we're in "pure" mode, ensure our wrapper component only re-renders when incoming props have changed.


      var Connect = pure ? React__default.memo(ConnectFunction) : ConnectFunction;
      Connect.WrappedComponent = WrappedComponent;
      Connect.displayName = displayName;

      if (forwardRef) {
        var forwarded = React__default.forwardRef(function forwardConnectRef(props, ref) {
          return React__default.createElement(Connect, _extends$1({}, props, {
            forwardedRef: ref
          }));
        });
        forwarded.displayName = displayName;
        forwarded.WrappedComponent = WrappedComponent;
        return hoistNonReactStatics_cjs(forwarded, WrappedComponent);
      }

      return hoistNonReactStatics_cjs(Connect, WrappedComponent);
    };
  }

  function is(x, y) {
    if (x === y) {
      return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true;

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;

    for (var i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param {any} obj The object to inspect.
   * @returns {boolean} True if the argument appears to be a plain object.
   */
  function isPlainObject$1(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = Object.getPrototypeOf(obj);
    if (proto === null) return true;
    var baseProto = proto;

    while (Object.getPrototypeOf(baseProto) !== null) {
      baseProto = Object.getPrototypeOf(baseProto);
    }

    return proto === baseProto;
  }

  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */
  function warning$2(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */


    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
      /* eslint-disable no-empty */
    } catch (e) {}
    /* eslint-enable no-empty */

  }

  function verifyPlainObject(value, displayName, methodName) {
    if (!isPlainObject$1(value)) {
      warning$2(methodName + "() in " + displayName + " must return a plain object. Instead received " + value + ".");
    }
  }

  function wrapMapToPropsConstant(getConstant) {
    return function initConstantSelector(dispatch, options) {
      var constant = getConstant(dispatch, options);

      function constantSelector() {
        return constant;
      }

      constantSelector.dependsOnOwnProps = false;
      return constantSelector;
    };
  } // dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
  // to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
  // whether mapToProps needs to be invoked when props have changed.
  //
  // A length of one signals that mapToProps does not depend on props from the parent component.
  // A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
  // therefore not reporting its length accurately..

  function getDependsOnOwnProps(mapToProps) {
    return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
  } // Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
  // this function wraps mapToProps in a proxy function which does several things:
  //
  //  * Detects whether the mapToProps function being called depends on props, which
  //    is used by selectorFactory to decide if it should reinvoke on props changes.
  //
  //  * On first call, handles mapToProps if returns another function, and treats that
  //    new function as the true mapToProps for subsequent calls.
  //
  //  * On first call, verifies the first result is a plain object, in order to warn
  //    the developer that their mapToProps function is not returning a valid result.
  //

  function wrapMapToPropsFunc(mapToProps, methodName) {
    return function initProxySelector(dispatch, _ref) {
      var displayName = _ref.displayName;

      var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
        return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
      }; // allow detectFactoryAndVerify to get ownProps


      proxy.dependsOnOwnProps = true;

      proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
        proxy.mapToProps = mapToProps;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
        var props = proxy(stateOrDispatch, ownProps);

        if (typeof props === 'function') {
          proxy.mapToProps = props;
          proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
          props = proxy(stateOrDispatch, ownProps);
        }

        verifyPlainObject(props, displayName, methodName);
        return props;
      };

      return proxy;
    };
  }

  function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    return typeof mapDispatchToProps === 'function' ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps') : undefined;
  }
  function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    return !mapDispatchToProps ? wrapMapToPropsConstant(function (dispatch) {
      return {
        dispatch: dispatch
      };
    }) : undefined;
  }
  function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? wrapMapToPropsConstant(function (dispatch) {
      return bindActionCreators(mapDispatchToProps, dispatch);
    }) : undefined;
  }
  var defaultMapDispatchToPropsFactories = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];

  function whenMapStateToPropsIsFunction(mapStateToProps) {
    return typeof mapStateToProps === 'function' ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps') : undefined;
  }
  function whenMapStateToPropsIsMissing(mapStateToProps) {
    return !mapStateToProps ? wrapMapToPropsConstant(function () {
      return {};
    }) : undefined;
  }
  var defaultMapStateToPropsFactories = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];

  function defaultMergeProps(stateProps, dispatchProps, ownProps) {
    return _extends$1({}, ownProps, {}, stateProps, {}, dispatchProps);
  }
  function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, _ref) {
      var displayName = _ref.displayName,
          pure = _ref.pure,
          areMergedPropsEqual = _ref.areMergedPropsEqual;
      var hasRunOnce = false;
      var mergedProps;
      return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
        var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        if (hasRunOnce) {
          if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
        } else {
          hasRunOnce = true;
          mergedProps = nextMergedProps;
          verifyPlainObject(mergedProps, displayName, 'mergeProps');
        }

        return mergedProps;
      };
    };
  }
  function whenMergePropsIsFunction(mergeProps) {
    return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
  }
  function whenMergePropsIsOmitted(mergeProps) {
    return !mergeProps ? function () {
      return defaultMergeProps;
    } : undefined;
  }
  var defaultMergePropsFactories = [whenMergePropsIsFunction, whenMergePropsIsOmitted];

  function verify(selector, methodName, displayName) {
    if (!selector) {
      throw new Error("Unexpected value for " + methodName + " in " + displayName + ".");
    } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
      if (!Object.prototype.hasOwnProperty.call(selector, 'dependsOnOwnProps')) {
        warning$2("The selector for " + methodName + " of " + displayName + " did not specify a value for dependsOnOwnProps.");
      }
    }
  }

  function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
    verify(mapStateToProps, 'mapStateToProps', displayName);
    verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
    verify(mergeProps, 'mergeProps', displayName);
  }

  function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
    return function impureFinalPropsSelector(state, ownProps) {
      return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
    };
  }
  function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
    var areStatesEqual = _ref.areStatesEqual,
        areOwnPropsEqual = _ref.areOwnPropsEqual,
        areStatePropsEqual = _ref.areStatePropsEqual;
    var hasRunAtLeastOnce = false;
    var state;
    var ownProps;
    var stateProps;
    var dispatchProps;
    var mergedProps;

    function handleFirstCall(firstState, firstOwnProps) {
      state = firstState;
      ownProps = firstOwnProps;
      stateProps = mapStateToProps(state, ownProps);
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      hasRunAtLeastOnce = true;
      return mergedProps;
    }

    function handleNewPropsAndNewState() {
      stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewProps() {
      if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewState() {
      var nextStateProps = mapStateToProps(state, ownProps);
      var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
      stateProps = nextStateProps;
      if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
      var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
      var stateChanged = !areStatesEqual(nextState, state);
      state = nextState;
      ownProps = nextOwnProps;
      if (propsChanged && stateChanged) return handleNewPropsAndNewState();
      if (propsChanged) return handleNewProps();
      if (stateChanged) return handleNewState();
      return mergedProps;
    }

    return function pureFinalPropsSelector(nextState, nextOwnProps) {
      return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
    };
  } // TODO: Add more comments
  // If pure is true, the selector returned by selectorFactory will memoize its results,
  // allowing connectAdvanced's shouldComponentUpdate to return false if final
  // props have not changed. If false, the selector will always return a new
  // object and shouldComponentUpdate will always return true.

  function finalPropsSelectorFactory(dispatch, _ref2) {
    var initMapStateToProps = _ref2.initMapStateToProps,
        initMapDispatchToProps = _ref2.initMapDispatchToProps,
        initMergeProps = _ref2.initMergeProps,
        options = _objectWithoutPropertiesLoose(_ref2, ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"]);

    var mapStateToProps = initMapStateToProps(dispatch, options);
    var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    var mergeProps = initMergeProps(dispatch, options);

    {
      verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
    return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
  }

  /*
    connect is a facade over connectAdvanced. It turns its args into a compatible
    selectorFactory, which has the signature:

      (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
    
    connect passes its args to connectAdvanced as options, which will in turn pass them to
    selectorFactory each time a Connect component instance is instantiated or hot reloaded.

    selectorFactory returns a final props selector from its mapStateToProps,
    mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
    mergePropsFactories, and pure args.

    The resulting final props selector is called by the Connect component instance whenever
    it receives new props or store state.
   */

  function match(arg, factories, name) {
    for (var i = factories.length - 1; i >= 0; i--) {
      var result = factories[i](arg);
      if (result) return result;
    }

    return function (dispatch, options) {
      throw new Error("Invalid value of type " + typeof arg + " for " + name + " argument when connecting component " + options.wrappedComponentName + ".");
    };
  }

  function strictEqual(a, b) {
    return a === b;
  } // createConnect with default args builds the 'official' connect behavior. Calling it with
  // different options opens up some testing and extensibility scenarios


  function createConnect(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$connectHOC = _ref.connectHOC,
        connectHOC = _ref$connectHOC === void 0 ? connectAdvanced : _ref$connectHOC,
        _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
        mapStateToPropsFactories = _ref$mapStateToPropsF === void 0 ? defaultMapStateToPropsFactories : _ref$mapStateToPropsF,
        _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
        mapDispatchToPropsFactories = _ref$mapDispatchToPro === void 0 ? defaultMapDispatchToPropsFactories : _ref$mapDispatchToPro,
        _ref$mergePropsFactor = _ref.mergePropsFactories,
        mergePropsFactories = _ref$mergePropsFactor === void 0 ? defaultMergePropsFactories : _ref$mergePropsFactor,
        _ref$selectorFactory = _ref.selectorFactory,
        selectorFactory = _ref$selectorFactory === void 0 ? finalPropsSelectorFactory : _ref$selectorFactory;

    return function connect(mapStateToProps, mapDispatchToProps, mergeProps, _ref2) {
      if (_ref2 === void 0) {
        _ref2 = {};
      }

      var _ref3 = _ref2,
          _ref3$pure = _ref3.pure,
          pure = _ref3$pure === void 0 ? true : _ref3$pure,
          _ref3$areStatesEqual = _ref3.areStatesEqual,
          areStatesEqual = _ref3$areStatesEqual === void 0 ? strictEqual : _ref3$areStatesEqual,
          _ref3$areOwnPropsEqua = _ref3.areOwnPropsEqual,
          areOwnPropsEqual = _ref3$areOwnPropsEqua === void 0 ? shallowEqual : _ref3$areOwnPropsEqua,
          _ref3$areStatePropsEq = _ref3.areStatePropsEqual,
          areStatePropsEqual = _ref3$areStatePropsEq === void 0 ? shallowEqual : _ref3$areStatePropsEq,
          _ref3$areMergedPropsE = _ref3.areMergedPropsEqual,
          areMergedPropsEqual = _ref3$areMergedPropsE === void 0 ? shallowEqual : _ref3$areMergedPropsE,
          extraOptions = _objectWithoutPropertiesLoose(_ref3, ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"]);

      var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
      var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
      var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
      return connectHOC(selectorFactory, _extends$1({
        // used in error messages
        methodName: 'connect',
        // used to compute Connect's displayName from the wrapped component's displayName.
        getDisplayName: function getDisplayName(name) {
          return "Connect(" + name + ")";
        },
        // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
        shouldHandleStateChanges: Boolean(mapStateToProps),
        // passed through to selectorFactory
        initMapStateToProps: initMapStateToProps,
        initMapDispatchToProps: initMapDispatchToProps,
        initMergeProps: initMergeProps,
        pure: pure,
        areStatesEqual: areStatesEqual,
        areOwnPropsEqual: areOwnPropsEqual,
        areStatePropsEqual: areStatePropsEqual,
        areMergedPropsEqual: areMergedPropsEqual
      }, extraOptions));
    };
  }
  var connect = /*#__PURE__*/
  createConnect();

  setBatch(ReactDOM.unstable_batchedUpdates);

  function areInputsEqual(newInputs, lastInputs) {
    if (newInputs.length !== lastInputs.length) {
      return false;
    }

    for (var i = 0; i < newInputs.length; i++) {
      if (newInputs[i] !== lastInputs[i]) {
        return false;
      }
    }

    return true;
  }

  function useMemoOne(getResult, inputs) {
    var initial = React.useState(function () {
      return {
        inputs: inputs,
        result: getResult()
      };
    })[0];
    var committed = React.useRef(initial);
    var isInputMatch = Boolean(inputs && committed.current.inputs && areInputsEqual(inputs, committed.current.inputs));
    var cache = isInputMatch ? committed.current : {
      inputs: inputs,
      result: getResult()
    };
    React.useEffect(function () {
      committed.current = cache;
    }, [cache]);
    return cache.result;
  }
  function useCallbackOne(callback, inputs) {
    return useMemoOne(function () {
      return callback;
    }, inputs);
  }
  var useMemo = useMemoOne;
  var useCallback = useCallbackOne;

  var origin = {
    x: 0,
    y: 0
  };
  var add = function add(point1, point2) {
    return {
      x: point1.x + point2.x,
      y: point1.y + point2.y
    };
  };
  var subtract = function subtract(point1, point2) {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    };
  };
  var isEqual = function isEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  };
  var negate = function negate(point) {
    return {
      x: point.x !== 0 ? -point.x : 0,
      y: point.y !== 0 ? -point.y : 0
    };
  };
  var patch = function patch(line, value, otherValue) {
    var _ref;

    if (otherValue === void 0) {
      otherValue = 0;
    }

    return _ref = {}, _ref[line] = value, _ref[line === 'x' ? 'y' : 'x'] = otherValue, _ref;
  };
  var distance = function distance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  };
  var closest = function closest(target, points) {
    return Math.min.apply(Math, points.map(function (point) {
      return distance(target, point);
    }));
  };
  var apply = function apply(fn) {
    return function (point) {
      return {
        x: fn(point.x),
        y: fn(point.y)
      };
    };
  };

  var prefix$1 = 'Invariant failed';
  function invariant$1(condition, message) {
      if (condition) {
          return;
      }
      throw new Error(prefix$1 + ": " + (message || ''));
  }

  var getRect = function getRect(_ref) {
    var top = _ref.top,
        right = _ref.right,
        bottom = _ref.bottom,
        left = _ref.left;
    var width = right - left;
    var height = bottom - top;
    var rect = {
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      width: width,
      height: height,
      x: left,
      y: top,
      center: {
        x: (right + left) / 2,
        y: (bottom + top) / 2
      }
    };
    return rect;
  };
  var expand = function expand(target, expandBy) {
    return {
      top: target.top - expandBy.top,
      left: target.left - expandBy.left,
      bottom: target.bottom + expandBy.bottom,
      right: target.right + expandBy.right
    };
  };
  var shrink = function shrink(target, shrinkBy) {
    return {
      top: target.top + shrinkBy.top,
      left: target.left + shrinkBy.left,
      bottom: target.bottom - shrinkBy.bottom,
      right: target.right - shrinkBy.right
    };
  };

  var shift = function shift(target, shiftBy) {
    return {
      top: target.top + shiftBy.y,
      left: target.left + shiftBy.x,
      bottom: target.bottom + shiftBy.y,
      right: target.right + shiftBy.x
    };
  };

  var noSpacing = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  var createBox = function createBox(_ref2) {
    var borderBox = _ref2.borderBox,
        _ref2$margin = _ref2.margin,
        margin = _ref2$margin === void 0 ? noSpacing : _ref2$margin,
        _ref2$border = _ref2.border,
        border = _ref2$border === void 0 ? noSpacing : _ref2$border,
        _ref2$padding = _ref2.padding,
        padding = _ref2$padding === void 0 ? noSpacing : _ref2$padding;
    var marginBox = getRect(expand(borderBox, margin));
    var paddingBox = getRect(shrink(borderBox, border));
    var contentBox = getRect(shrink(paddingBox, padding));
    return {
      marginBox: marginBox,
      borderBox: getRect(borderBox),
      paddingBox: paddingBox,
      contentBox: contentBox,
      margin: margin,
      border: border,
      padding: padding
    };
  };

  var parse = function parse(raw) {
    var value = raw.slice(0, -2);
    var suffix = raw.slice(-2);

    if (suffix !== 'px') {
      return 0;
    }

    var result = Number(value);
    !!isNaN(result) ?  invariant$1(false, "Could not parse value [raw: " + raw + ", without suffix: " + value + "]")  : void 0;
    return result;
  };

  var getWindowScroll = function getWindowScroll() {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  };

  var offset = function offset(original, change) {
    var borderBox = original.borderBox,
        border = original.border,
        margin = original.margin,
        padding = original.padding;
    var shifted = shift(borderBox, change);
    return createBox({
      borderBox: shifted,
      border: border,
      margin: margin,
      padding: padding
    });
  };
  var withScroll = function withScroll(original, scroll) {
    if (scroll === void 0) {
      scroll = getWindowScroll();
    }

    return offset(original, scroll);
  };
  var calculateBox = function calculateBox(borderBox, styles) {
    var margin = {
      top: parse(styles.marginTop),
      right: parse(styles.marginRight),
      bottom: parse(styles.marginBottom),
      left: parse(styles.marginLeft)
    };
    var padding = {
      top: parse(styles.paddingTop),
      right: parse(styles.paddingRight),
      bottom: parse(styles.paddingBottom),
      left: parse(styles.paddingLeft)
    };
    var border = {
      top: parse(styles.borderTopWidth),
      right: parse(styles.borderRightWidth),
      bottom: parse(styles.borderBottomWidth),
      left: parse(styles.borderLeftWidth)
    };
    return createBox({
      borderBox: borderBox,
      margin: margin,
      padding: padding,
      border: border
    });
  };
  var getBox = function getBox(el) {
    var borderBox = el.getBoundingClientRect();
    var styles = window.getComputedStyle(el);
    return calculateBox(borderBox, styles);
  };

  var executeClip = (function (frame, subject) {
    var result = getRect({
      top: Math.max(subject.top, frame.top),
      right: Math.min(subject.right, frame.right),
      bottom: Math.min(subject.bottom, frame.bottom),
      left: Math.max(subject.left, frame.left)
    });

    if (result.width <= 0 || result.height <= 0) {
      return null;
    }

    return result;
  });

  var offsetByPosition = function offsetByPosition(spacing, point) {
    return {
      top: spacing.top + point.y,
      left: spacing.left + point.x,
      bottom: spacing.bottom + point.y,
      right: spacing.right + point.x
    };
  };
  var getCorners = function getCorners(spacing) {
    return [{
      x: spacing.left,
      y: spacing.top
    }, {
      x: spacing.right,
      y: spacing.top
    }, {
      x: spacing.left,
      y: spacing.bottom
    }, {
      x: spacing.right,
      y: spacing.bottom
    }];
  };
  var noSpacing$1 = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };

  var scroll = function scroll(target, frame) {
    if (!frame) {
      return target;
    }

    return offsetByPosition(target, frame.scroll.diff.displacement);
  };

  var increase = function increase(target, axis, withPlaceholder) {
    if (withPlaceholder && withPlaceholder.increasedBy) {
      var _extends2;

      return _extends({}, target, (_extends2 = {}, _extends2[axis.end] = target[axis.end] + withPlaceholder.increasedBy[axis.line], _extends2));
    }

    return target;
  };

  var clip = function clip(target, frame) {
    if (frame && frame.shouldClipSubject) {
      return executeClip(frame.pageMarginBox, target);
    }

    return getRect(target);
  };

  var getSubject = (function (_ref) {
    var page = _ref.page,
        withPlaceholder = _ref.withPlaceholder,
        axis = _ref.axis,
        frame = _ref.frame;
    var scrolled = scroll(page.marginBox, frame);
    var increased = increase(scrolled, axis, withPlaceholder);
    var clipped = clip(increased, frame);
    return {
      page: page,
      withPlaceholder: withPlaceholder,
      active: clipped
    };
  });

  var scrollDroppable = (function (droppable, newScroll) {
    !droppable.frame ?  invariant(false)  : void 0;
    var scrollable = droppable.frame;
    var scrollDiff = subtract(newScroll, scrollable.scroll.initial);
    var scrollDisplacement = negate(scrollDiff);

    var frame = _extends({}, scrollable, {
      scroll: {
        initial: scrollable.scroll.initial,
        current: newScroll,
        diff: {
          value: scrollDiff,
          displacement: scrollDisplacement
        },
        max: scrollable.scroll.max
      }
    });

    var subject = getSubject({
      page: droppable.subject.page,
      withPlaceholder: droppable.subject.withPlaceholder,
      axis: droppable.axis,
      frame: frame
    });

    var result = _extends({}, droppable, {
      frame: frame,
      subject: subject
    });

    return result;
  });

  function areInputsEqual$1(newInputs, lastInputs) {
      if (newInputs.length !== lastInputs.length) {
          return false;
      }
      for (var i = 0; i < newInputs.length; i++) {
          if (newInputs[i] !== lastInputs[i]) {
              return false;
          }
      }
      return true;
  }

  function memoizeOne(resultFn, isEqual) {
      if (isEqual === void 0) { isEqual = areInputsEqual$1; }
      var lastThis;
      var lastArgs = [];
      var lastResult;
      var calledOnce = false;
      function memoized() {
          var newArgs = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              newArgs[_i] = arguments[_i];
          }
          if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
              return lastResult;
          }
          lastResult = resultFn.apply(this, newArgs);
          calledOnce = true;
          lastThis = this;
          lastArgs = newArgs;
          return lastResult;
      }
      return memoized;
  }

  function isInteger(value) {
    if (Number.isInteger) {
      return Number.isInteger(value);
    }

    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  }
  function values(map) {
    if (Object.values) {
      return Object.values(map);
    }

    return Object.keys(map).map(function (key) {
      return map[key];
    });
  }
  function findIndex(list, predicate) {
    if (list.findIndex) {
      return list.findIndex(predicate);
    }

    for (var i = 0; i < list.length; i++) {
      if (predicate(list[i])) {
        return i;
      }
    }

    return -1;
  }
  function find(list, predicate) {
    if (list.find) {
      return list.find(predicate);
    }

    var index = findIndex(list, predicate);

    if (index !== -1) {
      return list[index];
    }

    return undefined;
  }
  function toArray(list) {
    return Array.prototype.slice.call(list);
  }

  var toDroppableMap = memoizeOne(function (droppables) {
    return droppables.reduce(function (previous, current) {
      previous[current.descriptor.id] = current;
      return previous;
    }, {});
  });
  var toDraggableMap = memoizeOne(function (draggables) {
    return draggables.reduce(function (previous, current) {
      previous[current.descriptor.id] = current;
      return previous;
    }, {});
  });
  var toDroppableList = memoizeOne(function (droppables) {
    return values(droppables);
  });
  var toDraggableList = memoizeOne(function (draggables) {
    return values(draggables);
  });

  var getDraggablesInsideDroppable = memoizeOne(function (droppableId, draggables) {
    var result = toDraggableList(draggables).filter(function (draggable) {
      return droppableId === draggable.descriptor.droppableId;
    }).sort(function (a, b) {
      return a.descriptor.index - b.descriptor.index;
    });
    return result;
  });

  function tryGetDestination(impact) {
    if (impact.at && impact.at.type === 'REORDER') {
      return impact.at.destination;
    }

    return null;
  }
  function tryGetCombine(impact) {
    if (impact.at && impact.at.type === 'COMBINE') {
      return impact.at.combine;
    }

    return null;
  }

  var removeDraggableFromList = memoizeOne(function (remove, list) {
    return list.filter(function (item) {
      return item.descriptor.id !== remove.descriptor.id;
    });
  });

  var moveToNextCombine = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        draggable = _ref.draggable,
        destination = _ref.destination,
        insideDestination = _ref.insideDestination,
        previousImpact = _ref.previousImpact;

    if (!destination.isCombineEnabled) {
      return null;
    }

    var location = tryGetDestination(previousImpact);

    if (!location) {
      return null;
    }

    function getImpact(target) {
      var at = {
        type: 'COMBINE',
        combine: {
          draggableId: target,
          droppableId: destination.descriptor.id
        }
      };
      return _extends({}, previousImpact, {
        at: at
      });
    }

    var all = previousImpact.displaced.all;
    var closestId = all.length ? all[0] : null;

    if (isMovingForward) {
      return closestId ? getImpact(closestId) : null;
    }

    var withoutDraggable = removeDraggableFromList(draggable, insideDestination);

    if (!closestId) {
      if (!withoutDraggable.length) {
        return null;
      }

      var last = withoutDraggable[withoutDraggable.length - 1];
      return getImpact(last.descriptor.id);
    }

    var indexOfClosest = findIndex(withoutDraggable, function (d) {
      return d.descriptor.id === closestId;
    });
    !(indexOfClosest !== -1) ?  invariant(false, 'Could not find displaced item in set')  : void 0;
    var proposedIndex = indexOfClosest - 1;

    if (proposedIndex < 0) {
      return null;
    }

    var before = withoutDraggable[proposedIndex];
    return getImpact(before.descriptor.id);
  });

  var isHomeOf = (function (draggable, destination) {
    return draggable.descriptor.droppableId === destination.descriptor.id;
  });

  var noDisplacedBy = {
    point: origin,
    value: 0
  };
  var emptyGroups = {
    invisible: {},
    visible: {},
    all: []
  };
  var noImpact = {
    displaced: emptyGroups,
    displacedBy: noDisplacedBy,
    at: null
  };

  var isWithin = (function (lowerBound, upperBound) {
    return function (value) {
      return lowerBound <= value && value <= upperBound;
    };
  });

  var isPartiallyVisibleThroughFrame = (function (frame) {
    var isWithinVertical = isWithin(frame.top, frame.bottom);
    var isWithinHorizontal = isWithin(frame.left, frame.right);
    return function (subject) {
      var isContained = isWithinVertical(subject.top) && isWithinVertical(subject.bottom) && isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);

      if (isContained) {
        return true;
      }

      var isPartiallyVisibleVertically = isWithinVertical(subject.top) || isWithinVertical(subject.bottom);
      var isPartiallyVisibleHorizontally = isWithinHorizontal(subject.left) || isWithinHorizontal(subject.right);
      var isPartiallyContained = isPartiallyVisibleVertically && isPartiallyVisibleHorizontally;

      if (isPartiallyContained) {
        return true;
      }

      var isBiggerVertically = subject.top < frame.top && subject.bottom > frame.bottom;
      var isBiggerHorizontally = subject.left < frame.left && subject.right > frame.right;
      var isTargetBiggerThanFrame = isBiggerVertically && isBiggerHorizontally;

      if (isTargetBiggerThanFrame) {
        return true;
      }

      var isTargetBiggerOnOneAxis = isBiggerVertically && isPartiallyVisibleHorizontally || isBiggerHorizontally && isPartiallyVisibleVertically;
      return isTargetBiggerOnOneAxis;
    };
  });

  var isTotallyVisibleThroughFrame = (function (frame) {
    var isWithinVertical = isWithin(frame.top, frame.bottom);
    var isWithinHorizontal = isWithin(frame.left, frame.right);
    return function (subject) {
      var isContained = isWithinVertical(subject.top) && isWithinVertical(subject.bottom) && isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
      return isContained;
    };
  });

  var vertical = {
    direction: 'vertical',
    line: 'y',
    crossAxisLine: 'x',
    start: 'top',
    end: 'bottom',
    size: 'height',
    crossAxisStart: 'left',
    crossAxisEnd: 'right',
    crossAxisSize: 'width'
  };
  var horizontal = {
    direction: 'horizontal',
    line: 'x',
    crossAxisLine: 'y',
    start: 'left',
    end: 'right',
    size: 'width',
    crossAxisStart: 'top',
    crossAxisEnd: 'bottom',
    crossAxisSize: 'height'
  };

  var isTotallyVisibleThroughFrameOnAxis = (function (axis) {
    return function (frame) {
      var isWithinVertical = isWithin(frame.top, frame.bottom);
      var isWithinHorizontal = isWithin(frame.left, frame.right);
      return function (subject) {
        if (axis === vertical) {
          return isWithinVertical(subject.top) && isWithinVertical(subject.bottom);
        }

        return isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
      };
    };
  });

  var getDroppableDisplaced = function getDroppableDisplaced(target, destination) {
    var displacement = destination.frame ? destination.frame.scroll.diff.displacement : origin;
    return offsetByPosition(target, displacement);
  };

  var isVisibleInDroppable = function isVisibleInDroppable(target, destination, isVisibleThroughFrameFn) {
    if (!destination.subject.active) {
      return false;
    }

    return isVisibleThroughFrameFn(destination.subject.active)(target);
  };

  var isVisibleInViewport = function isVisibleInViewport(target, viewport, isVisibleThroughFrameFn) {
    return isVisibleThroughFrameFn(viewport)(target);
  };

  var isVisible = function isVisible(_ref) {
    var toBeDisplaced = _ref.target,
        destination = _ref.destination,
        viewport = _ref.viewport,
        withDroppableDisplacement = _ref.withDroppableDisplacement,
        isVisibleThroughFrameFn = _ref.isVisibleThroughFrameFn;
    var displacedTarget = withDroppableDisplacement ? getDroppableDisplaced(toBeDisplaced, destination) : toBeDisplaced;
    return isVisibleInDroppable(displacedTarget, destination, isVisibleThroughFrameFn) && isVisibleInViewport(displacedTarget, viewport, isVisibleThroughFrameFn);
  };

  var isPartiallyVisible = function isPartiallyVisible(args) {
    return isVisible(_extends({}, args, {
      isVisibleThroughFrameFn: isPartiallyVisibleThroughFrame
    }));
  };
  var isTotallyVisible = function isTotallyVisible(args) {
    return isVisible(_extends({}, args, {
      isVisibleThroughFrameFn: isTotallyVisibleThroughFrame
    }));
  };
  var isTotallyVisibleOnAxis = function isTotallyVisibleOnAxis(args) {
    return isVisible(_extends({}, args, {
      isVisibleThroughFrameFn: isTotallyVisibleThroughFrameOnAxis(args.destination.axis)
    }));
  };

  var getShouldAnimate = function getShouldAnimate(id, last, forceShouldAnimate) {
    if (typeof forceShouldAnimate === 'boolean') {
      return forceShouldAnimate;
    }

    if (!last) {
      return true;
    }

    var invisible = last.invisible,
        visible = last.visible;

    if (invisible[id]) {
      return false;
    }

    var previous = visible[id];
    return previous ? previous.shouldAnimate : true;
  };

  function getTarget(draggable, displacedBy) {
    var marginBox = draggable.page.marginBox;
    var expandBy = {
      top: displacedBy.point.y,
      right: 0,
      bottom: 0,
      left: displacedBy.point.x
    };
    return getRect(expand(marginBox, expandBy));
  }

  function getDisplacementGroups(_ref) {
    var afterDragging = _ref.afterDragging,
        destination = _ref.destination,
        displacedBy = _ref.displacedBy,
        viewport = _ref.viewport,
        forceShouldAnimate = _ref.forceShouldAnimate,
        last = _ref.last;
    return afterDragging.reduce(function process(groups, draggable) {
      var target = getTarget(draggable, displacedBy);
      var id = draggable.descriptor.id;
      groups.all.push(id);
      var isVisible = isPartiallyVisible({
        target: target,
        destination: destination,
        viewport: viewport,
        withDroppableDisplacement: true
      });

      if (!isVisible) {
        groups.invisible[draggable.descriptor.id] = true;
        return groups;
      }

      var shouldAnimate = getShouldAnimate(id, last, forceShouldAnimate);
      var displacement = {
        draggableId: id,
        shouldAnimate: shouldAnimate
      };
      groups.visible[id] = displacement;
      return groups;
    }, {
      all: [],
      visible: {},
      invisible: {}
    });
  }

  function getIndexOfLastItem(draggables, options) {
    if (!draggables.length) {
      return 0;
    }

    var indexOfLastItem = draggables[draggables.length - 1].descriptor.index;
    return options.inHomeList ? indexOfLastItem : indexOfLastItem + 1;
  }

  function goAtEnd(_ref) {
    var insideDestination = _ref.insideDestination,
        inHomeList = _ref.inHomeList,
        displacedBy = _ref.displacedBy,
        destination = _ref.destination;
    var newIndex = getIndexOfLastItem(insideDestination, {
      inHomeList: inHomeList
    });
    return {
      displaced: emptyGroups,
      displacedBy: displacedBy,
      at: {
        type: 'REORDER',
        destination: {
          droppableId: destination.descriptor.id,
          index: newIndex
        }
      }
    };
  }

  function calculateReorderImpact(_ref2) {
    var draggable = _ref2.draggable,
        insideDestination = _ref2.insideDestination,
        destination = _ref2.destination,
        viewport = _ref2.viewport,
        displacedBy = _ref2.displacedBy,
        last = _ref2.last,
        index = _ref2.index,
        forceShouldAnimate = _ref2.forceShouldAnimate;
    var inHomeList = isHomeOf(draggable, destination);

    if (index == null) {
      return goAtEnd({
        insideDestination: insideDestination,
        inHomeList: inHomeList,
        displacedBy: displacedBy,
        destination: destination
      });
    }

    var match = find(insideDestination, function (item) {
      return item.descriptor.index === index;
    });

    if (!match) {
      return goAtEnd({
        insideDestination: insideDestination,
        inHomeList: inHomeList,
        displacedBy: displacedBy,
        destination: destination
      });
    }

    var withoutDragging = removeDraggableFromList(draggable, insideDestination);
    var sliceFrom = insideDestination.indexOf(match);
    var impacted = withoutDragging.slice(sliceFrom);
    var displaced = getDisplacementGroups({
      afterDragging: impacted,
      destination: destination,
      displacedBy: displacedBy,
      last: last,
      viewport: viewport.frame,
      forceShouldAnimate: forceShouldAnimate
    });
    return {
      displaced: displaced,
      displacedBy: displacedBy,
      at: {
        type: 'REORDER',
        destination: {
          droppableId: destination.descriptor.id,
          index: index
        }
      }
    };
  }

  function didStartAfterCritical(draggableId, afterCritical) {
    return Boolean(afterCritical.effected[draggableId]);
  }

  var fromCombine = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        destination = _ref.destination,
        draggables = _ref.draggables,
        combine = _ref.combine,
        afterCritical = _ref.afterCritical;

    if (!destination.isCombineEnabled) {
      return null;
    }

    var combineId = combine.draggableId;
    var combineWith = draggables[combineId];
    var combineWithIndex = combineWith.descriptor.index;
    var didCombineWithStartAfterCritical = didStartAfterCritical(combineId, afterCritical);

    if (didCombineWithStartAfterCritical) {
      if (isMovingForward) {
        return combineWithIndex;
      }

      return combineWithIndex - 1;
    }

    if (isMovingForward) {
      return combineWithIndex + 1;
    }

    return combineWithIndex;
  });

  var fromReorder = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        isInHomeList = _ref.isInHomeList,
        insideDestination = _ref.insideDestination,
        location = _ref.location;

    if (!insideDestination.length) {
      return null;
    }

    var currentIndex = location.index;
    var proposedIndex = isMovingForward ? currentIndex + 1 : currentIndex - 1;
    var firstIndex = insideDestination[0].descriptor.index;
    var lastIndex = insideDestination[insideDestination.length - 1].descriptor.index;
    var upperBound = isInHomeList ? lastIndex : lastIndex + 1;

    if (proposedIndex < firstIndex) {
      return null;
    }

    if (proposedIndex > upperBound) {
      return null;
    }

    return proposedIndex;
  });

  var moveToNextIndex = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        isInHomeList = _ref.isInHomeList,
        draggable = _ref.draggable,
        draggables = _ref.draggables,
        destination = _ref.destination,
        insideDestination = _ref.insideDestination,
        previousImpact = _ref.previousImpact,
        viewport = _ref.viewport,
        afterCritical = _ref.afterCritical;
    var wasAt = previousImpact.at;
    !wasAt ?  invariant(false, 'Cannot move in direction without previous impact location')  : void 0;

    if (wasAt.type === 'REORDER') {
      var _newIndex = fromReorder({
        isMovingForward: isMovingForward,
        isInHomeList: isInHomeList,
        location: wasAt.destination,
        insideDestination: insideDestination
      });

      if (_newIndex == null) {
        return null;
      }

      return calculateReorderImpact({
        draggable: draggable,
        insideDestination: insideDestination,
        destination: destination,
        viewport: viewport,
        last: previousImpact.displaced,
        displacedBy: previousImpact.displacedBy,
        index: _newIndex
      });
    }

    var newIndex = fromCombine({
      isMovingForward: isMovingForward,
      destination: destination,
      displaced: previousImpact.displaced,
      draggables: draggables,
      combine: wasAt.combine,
      afterCritical: afterCritical
    });

    if (newIndex == null) {
      return null;
    }

    return calculateReorderImpact({
      draggable: draggable,
      insideDestination: insideDestination,
      destination: destination,
      viewport: viewport,
      last: previousImpact.displaced,
      displacedBy: previousImpact.displacedBy,
      index: newIndex
    });
  });

  var getCombinedItemDisplacement = (function (_ref) {
    var displaced = _ref.displaced,
        afterCritical = _ref.afterCritical,
        combineWith = _ref.combineWith,
        displacedBy = _ref.displacedBy;
    var isDisplaced = Boolean(displaced.visible[combineWith] || displaced.invisible[combineWith]);

    if (didStartAfterCritical(combineWith, afterCritical)) {
      return isDisplaced ? origin : negate(displacedBy.point);
    }

    return isDisplaced ? displacedBy.point : origin;
  });

  var whenCombining = (function (_ref) {
    var afterCritical = _ref.afterCritical,
        impact = _ref.impact,
        draggables = _ref.draggables;
    var combine = tryGetCombine(impact);
    !combine ?  invariant(false)  : void 0;
    var combineWith = combine.draggableId;
    var center = draggables[combineWith].page.borderBox.center;
    var displaceBy = getCombinedItemDisplacement({
      displaced: impact.displaced,
      afterCritical: afterCritical,
      combineWith: combineWith,
      displacedBy: impact.displacedBy
    });
    return add(center, displaceBy);
  });

  var distanceFromStartToBorderBoxCenter = function distanceFromStartToBorderBoxCenter(axis, box) {
    return box.margin[axis.start] + box.borderBox[axis.size] / 2;
  };

  var distanceFromEndToBorderBoxCenter = function distanceFromEndToBorderBoxCenter(axis, box) {
    return box.margin[axis.end] + box.borderBox[axis.size] / 2;
  };

  var getCrossAxisBorderBoxCenter = function getCrossAxisBorderBoxCenter(axis, target, isMoving) {
    return target[axis.crossAxisStart] + isMoving.margin[axis.crossAxisStart] + isMoving.borderBox[axis.crossAxisSize] / 2;
  };

  var goAfter = function goAfter(_ref) {
    var axis = _ref.axis,
        moveRelativeTo = _ref.moveRelativeTo,
        isMoving = _ref.isMoving;
    return patch(axis.line, moveRelativeTo.marginBox[axis.end] + distanceFromStartToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveRelativeTo.marginBox, isMoving));
  };
  var goBefore = function goBefore(_ref2) {
    var axis = _ref2.axis,
        moveRelativeTo = _ref2.moveRelativeTo,
        isMoving = _ref2.isMoving;
    return patch(axis.line, moveRelativeTo.marginBox[axis.start] - distanceFromEndToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveRelativeTo.marginBox, isMoving));
  };
  var goIntoStart = function goIntoStart(_ref3) {
    var axis = _ref3.axis,
        moveInto = _ref3.moveInto,
        isMoving = _ref3.isMoving;
    return patch(axis.line, moveInto.contentBox[axis.start] + distanceFromStartToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveInto.contentBox, isMoving));
  };

  var whenReordering = (function (_ref) {
    var impact = _ref.impact,
        draggable = _ref.draggable,
        draggables = _ref.draggables,
        droppable = _ref.droppable,
        afterCritical = _ref.afterCritical;
    var insideDestination = getDraggablesInsideDroppable(droppable.descriptor.id, draggables);
    var draggablePage = draggable.page;
    var axis = droppable.axis;

    if (!insideDestination.length) {
      return goIntoStart({
        axis: axis,
        moveInto: droppable.page,
        isMoving: draggablePage
      });
    }

    var displaced = impact.displaced,
        displacedBy = impact.displacedBy;
    var closestAfter = displaced.all[0];

    if (closestAfter) {
      var closest = draggables[closestAfter];

      if (didStartAfterCritical(closestAfter, afterCritical)) {
        return goBefore({
          axis: axis,
          moveRelativeTo: closest.page,
          isMoving: draggablePage
        });
      }

      var withDisplacement = offset(closest.page, displacedBy.point);
      return goBefore({
        axis: axis,
        moveRelativeTo: withDisplacement,
        isMoving: draggablePage
      });
    }

    var last = insideDestination[insideDestination.length - 1];

    if (last.descriptor.id === draggable.descriptor.id) {
      return draggablePage.borderBox.center;
    }

    if (didStartAfterCritical(last.descriptor.id, afterCritical)) {
      var page = offset(last.page, negate(afterCritical.displacedBy.point));
      return goAfter({
        axis: axis,
        moveRelativeTo: page,
        isMoving: draggablePage
      });
    }

    return goAfter({
      axis: axis,
      moveRelativeTo: last.page,
      isMoving: draggablePage
    });
  });

  var withDroppableDisplacement = (function (droppable, point) {
    var frame = droppable.frame;

    if (!frame) {
      return point;
    }

    return add(point, frame.scroll.diff.displacement);
  });

  var getResultWithoutDroppableDisplacement = function getResultWithoutDroppableDisplacement(_ref) {
    var impact = _ref.impact,
        draggable = _ref.draggable,
        droppable = _ref.droppable,
        draggables = _ref.draggables,
        afterCritical = _ref.afterCritical;
    var original = draggable.page.borderBox.center;
    var at = impact.at;

    if (!droppable) {
      return original;
    }

    if (!at) {
      return original;
    }

    if (at.type === 'REORDER') {
      return whenReordering({
        impact: impact,
        draggable: draggable,
        draggables: draggables,
        droppable: droppable,
        afterCritical: afterCritical
      });
    }

    return whenCombining({
      impact: impact,
      draggables: draggables,
      afterCritical: afterCritical
    });
  };

  var getPageBorderBoxCenterFromImpact = (function (args) {
    var withoutDisplacement = getResultWithoutDroppableDisplacement(args);
    var droppable = args.droppable;
    var withDisplacement = droppable ? withDroppableDisplacement(droppable, withoutDisplacement) : withoutDisplacement;
    return withDisplacement;
  });

  var scrollViewport = (function (viewport, newScroll) {
    var diff = subtract(newScroll, viewport.scroll.initial);
    var displacement = negate(diff);
    var frame = getRect({
      top: newScroll.y,
      bottom: newScroll.y + viewport.frame.height,
      left: newScroll.x,
      right: newScroll.x + viewport.frame.width
    });
    var updated = {
      frame: frame,
      scroll: {
        initial: viewport.scroll.initial,
        max: viewport.scroll.max,
        current: newScroll,
        diff: {
          value: diff,
          displacement: displacement
        }
      }
    };
    return updated;
  });

  function getDraggables(ids, draggables) {
    return ids.map(function (id) {
      return draggables[id];
    });
  }

  function tryGetVisible(id, groups) {
    for (var i = 0; i < groups.length; i++) {
      var displacement = groups[i].visible[id];

      if (displacement) {
        return displacement;
      }
    }

    return null;
  }

  var speculativelyIncrease = (function (_ref) {
    var impact = _ref.impact,
        viewport = _ref.viewport,
        destination = _ref.destination,
        draggables = _ref.draggables,
        maxScrollChange = _ref.maxScrollChange;
    var scrolledViewport = scrollViewport(viewport, add(viewport.scroll.current, maxScrollChange));
    var scrolledDroppable = destination.frame ? scrollDroppable(destination, add(destination.frame.scroll.current, maxScrollChange)) : destination;
    var last = impact.displaced;
    var withViewportScroll = getDisplacementGroups({
      afterDragging: getDraggables(last.all, draggables),
      destination: destination,
      displacedBy: impact.displacedBy,
      viewport: scrolledViewport.frame,
      last: last,
      forceShouldAnimate: false
    });
    var withDroppableScroll = getDisplacementGroups({
      afterDragging: getDraggables(last.all, draggables),
      destination: scrolledDroppable,
      displacedBy: impact.displacedBy,
      viewport: viewport.frame,
      last: last,
      forceShouldAnimate: false
    });
    var invisible = {};
    var visible = {};
    var groups = [last, withViewportScroll, withDroppableScroll];
    last.all.forEach(function (id) {
      var displacement = tryGetVisible(id, groups);

      if (displacement) {
        visible[id] = displacement;
        return;
      }

      invisible[id] = true;
    });

    var newImpact = _extends({}, impact, {
      displaced: {
        all: last.all,
        invisible: invisible,
        visible: visible
      }
    });

    return newImpact;
  });

  var withViewportDisplacement = (function (viewport, point) {
    return add(viewport.scroll.diff.displacement, point);
  });

  var getClientFromPageBorderBoxCenter = (function (_ref) {
    var pageBorderBoxCenter = _ref.pageBorderBoxCenter,
        draggable = _ref.draggable,
        viewport = _ref.viewport;
    var withoutPageScrollChange = withViewportDisplacement(viewport, pageBorderBoxCenter);
    var offset = subtract(withoutPageScrollChange, draggable.page.borderBox.center);
    return add(draggable.client.borderBox.center, offset);
  });

  var isTotallyVisibleInNewLocation = (function (_ref) {
    var draggable = _ref.draggable,
        destination = _ref.destination,
        newPageBorderBoxCenter = _ref.newPageBorderBoxCenter,
        viewport = _ref.viewport,
        withDroppableDisplacement = _ref.withDroppableDisplacement,
        _ref$onlyOnMainAxis = _ref.onlyOnMainAxis,
        onlyOnMainAxis = _ref$onlyOnMainAxis === void 0 ? false : _ref$onlyOnMainAxis;
    var changeNeeded = subtract(newPageBorderBoxCenter, draggable.page.borderBox.center);
    var shifted = offsetByPosition(draggable.page.borderBox, changeNeeded);
    var args = {
      target: shifted,
      destination: destination,
      withDroppableDisplacement: withDroppableDisplacement,
      viewport: viewport
    };
    return onlyOnMainAxis ? isTotallyVisibleOnAxis(args) : isTotallyVisible(args);
  });

  var moveToNextPlace = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        draggable = _ref.draggable,
        destination = _ref.destination,
        draggables = _ref.draggables,
        previousImpact = _ref.previousImpact,
        viewport = _ref.viewport,
        previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
        previousClientSelection = _ref.previousClientSelection,
        afterCritical = _ref.afterCritical;

    if (!destination.isEnabled) {
      return null;
    }

    var insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
    var isInHomeList = isHomeOf(draggable, destination);
    var impact = moveToNextCombine({
      isMovingForward: isMovingForward,
      draggable: draggable,
      destination: destination,
      insideDestination: insideDestination,
      previousImpact: previousImpact
    }) || moveToNextIndex({
      isMovingForward: isMovingForward,
      isInHomeList: isInHomeList,
      draggable: draggable,
      draggables: draggables,
      destination: destination,
      insideDestination: insideDestination,
      previousImpact: previousImpact,
      viewport: viewport,
      afterCritical: afterCritical
    });

    if (!impact) {
      return null;
    }

    var pageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
      impact: impact,
      draggable: draggable,
      droppable: destination,
      draggables: draggables,
      afterCritical: afterCritical
    });
    var isVisibleInNewLocation = isTotallyVisibleInNewLocation({
      draggable: draggable,
      destination: destination,
      newPageBorderBoxCenter: pageBorderBoxCenter,
      viewport: viewport.frame,
      withDroppableDisplacement: false,
      onlyOnMainAxis: true
    });

    if (isVisibleInNewLocation) {
      var clientSelection = getClientFromPageBorderBoxCenter({
        pageBorderBoxCenter: pageBorderBoxCenter,
        draggable: draggable,
        viewport: viewport
      });
      return {
        clientSelection: clientSelection,
        impact: impact,
        scrollJumpRequest: null
      };
    }

    var distance = subtract(pageBorderBoxCenter, previousPageBorderBoxCenter);
    var cautious = speculativelyIncrease({
      impact: impact,
      viewport: viewport,
      destination: destination,
      draggables: draggables,
      maxScrollChange: distance
    });
    return {
      clientSelection: previousClientSelection,
      impact: cautious,
      scrollJumpRequest: distance
    };
  });

  var getKnownActive = function getKnownActive(droppable) {
    var rect = droppable.subject.active;
    !rect ?  invariant(false, 'Cannot get clipped area from droppable')  : void 0;
    return rect;
  };

  var getBestCrossAxisDroppable = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        pageBorderBoxCenter = _ref.pageBorderBoxCenter,
        source = _ref.source,
        droppables = _ref.droppables,
        viewport = _ref.viewport;
    var active = source.subject.active;

    if (!active) {
      return null;
    }

    var axis = source.axis;
    var isBetweenSourceClipped = isWithin(active[axis.start], active[axis.end]);
    var candidates = toDroppableList(droppables).filter(function (droppable) {
      return droppable !== source;
    }).filter(function (droppable) {
      return droppable.isEnabled;
    }).filter(function (droppable) {
      return Boolean(droppable.subject.active);
    }).filter(function (droppable) {
      return isPartiallyVisibleThroughFrame(viewport.frame)(getKnownActive(droppable));
    }).filter(function (droppable) {
      var activeOfTarget = getKnownActive(droppable);

      if (isMovingForward) {
        return active[axis.crossAxisEnd] < activeOfTarget[axis.crossAxisEnd];
      }

      return activeOfTarget[axis.crossAxisStart] < active[axis.crossAxisStart];
    }).filter(function (droppable) {
      var activeOfTarget = getKnownActive(droppable);
      var isBetweenDestinationClipped = isWithin(activeOfTarget[axis.start], activeOfTarget[axis.end]);
      return isBetweenSourceClipped(activeOfTarget[axis.start]) || isBetweenSourceClipped(activeOfTarget[axis.end]) || isBetweenDestinationClipped(active[axis.start]) || isBetweenDestinationClipped(active[axis.end]);
    }).sort(function (a, b) {
      var first = getKnownActive(a)[axis.crossAxisStart];
      var second = getKnownActive(b)[axis.crossAxisStart];

      if (isMovingForward) {
        return first - second;
      }

      return second - first;
    }).filter(function (droppable, index, array) {
      return getKnownActive(droppable)[axis.crossAxisStart] === getKnownActive(array[0])[axis.crossAxisStart];
    });

    if (!candidates.length) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    var contains = candidates.filter(function (droppable) {
      var isWithinDroppable = isWithin(getKnownActive(droppable)[axis.start], getKnownActive(droppable)[axis.end]);
      return isWithinDroppable(pageBorderBoxCenter[axis.line]);
    });

    if (contains.length === 1) {
      return contains[0];
    }

    if (contains.length > 1) {
      return contains.sort(function (a, b) {
        return getKnownActive(a)[axis.start] - getKnownActive(b)[axis.start];
      })[0];
    }

    return candidates.sort(function (a, b) {
      var first = closest(pageBorderBoxCenter, getCorners(getKnownActive(a)));
      var second = closest(pageBorderBoxCenter, getCorners(getKnownActive(b)));

      if (first !== second) {
        return first - second;
      }

      return getKnownActive(a)[axis.start] - getKnownActive(b)[axis.start];
    })[0];
  });

  var getCurrentPageBorderBoxCenter = function getCurrentPageBorderBoxCenter(draggable, afterCritical) {
    var original = draggable.page.borderBox.center;
    return didStartAfterCritical(draggable.descriptor.id, afterCritical) ? subtract(original, afterCritical.displacedBy.point) : original;
  };
  var getCurrentPageBorderBox = function getCurrentPageBorderBox(draggable, afterCritical) {
    var original = draggable.page.borderBox;
    return didStartAfterCritical(draggable.descriptor.id, afterCritical) ? offsetByPosition(original, negate(afterCritical.displacedBy.point)) : original;
  };

  var getClosestDraggable = (function (_ref) {
    var pageBorderBoxCenter = _ref.pageBorderBoxCenter,
        viewport = _ref.viewport,
        destination = _ref.destination,
        insideDestination = _ref.insideDestination,
        afterCritical = _ref.afterCritical;
    var sorted = insideDestination.filter(function (draggable) {
      return isTotallyVisible({
        target: getCurrentPageBorderBox(draggable, afterCritical),
        destination: destination,
        viewport: viewport.frame,
        withDroppableDisplacement: true
      });
    }).sort(function (a, b) {
      var distanceToA = distance(pageBorderBoxCenter, withDroppableDisplacement(destination, getCurrentPageBorderBoxCenter(a, afterCritical)));
      var distanceToB = distance(pageBorderBoxCenter, withDroppableDisplacement(destination, getCurrentPageBorderBoxCenter(b, afterCritical)));

      if (distanceToA < distanceToB) {
        return -1;
      }

      if (distanceToB < distanceToA) {
        return 1;
      }

      return a.descriptor.index - b.descriptor.index;
    });
    return sorted[0] || null;
  });

  var getDisplacedBy = memoizeOne(function getDisplacedBy(axis, displaceBy) {
    var displacement = displaceBy[axis.line];
    return {
      value: displacement,
      point: patch(axis.line, displacement)
    };
  });

  var getRequiredGrowthForPlaceholder = function getRequiredGrowthForPlaceholder(droppable, placeholderSize, draggables) {
    var axis = droppable.axis;

    if (droppable.descriptor.mode === 'virtual') {
      return patch(axis.line, placeholderSize[axis.line]);
    }

    var availableSpace = droppable.subject.page.contentBox[axis.size];
    var insideDroppable = getDraggablesInsideDroppable(droppable.descriptor.id, draggables);
    var spaceUsed = insideDroppable.reduce(function (sum, dimension) {
      return sum + dimension.client.marginBox[axis.size];
    }, 0);
    var requiredSpace = spaceUsed + placeholderSize[axis.line];
    var needsToGrowBy = requiredSpace - availableSpace;

    if (needsToGrowBy <= 0) {
      return null;
    }

    return patch(axis.line, needsToGrowBy);
  };

  var withMaxScroll = function withMaxScroll(frame, max) {
    return _extends({}, frame, {
      scroll: _extends({}, frame.scroll, {
        max: max
      })
    });
  };

  var addPlaceholder = function addPlaceholder(droppable, draggable, draggables) {
    var frame = droppable.frame;
    !!isHomeOf(draggable, droppable) ?  invariant(false, 'Should not add placeholder space to home list')  : void 0;
    !!droppable.subject.withPlaceholder ?  invariant(false, 'Cannot add placeholder size to a subject when it already has one')  : void 0;
    var placeholderSize = getDisplacedBy(droppable.axis, draggable.displaceBy).point;
    var requiredGrowth = getRequiredGrowthForPlaceholder(droppable, placeholderSize, draggables);
    var added = {
      placeholderSize: placeholderSize,
      increasedBy: requiredGrowth,
      oldFrameMaxScroll: droppable.frame ? droppable.frame.scroll.max : null
    };

    if (!frame) {
      var _subject = getSubject({
        page: droppable.subject.page,
        withPlaceholder: added,
        axis: droppable.axis,
        frame: droppable.frame
      });

      return _extends({}, droppable, {
        subject: _subject
      });
    }

    var maxScroll = requiredGrowth ? add(frame.scroll.max, requiredGrowth) : frame.scroll.max;
    var newFrame = withMaxScroll(frame, maxScroll);
    var subject = getSubject({
      page: droppable.subject.page,
      withPlaceholder: added,
      axis: droppable.axis,
      frame: newFrame
    });
    return _extends({}, droppable, {
      subject: subject,
      frame: newFrame
    });
  };
  var removePlaceholder = function removePlaceholder(droppable) {
    var added = droppable.subject.withPlaceholder;
    !added ?  invariant(false, 'Cannot remove placeholder form subject when there was none')  : void 0;
    var frame = droppable.frame;

    if (!frame) {
      var _subject2 = getSubject({
        page: droppable.subject.page,
        axis: droppable.axis,
        frame: null,
        withPlaceholder: null
      });

      return _extends({}, droppable, {
        subject: _subject2
      });
    }

    var oldMaxScroll = added.oldFrameMaxScroll;
    !oldMaxScroll ?  invariant(false, 'Expected droppable with frame to have old max frame scroll when removing placeholder')  : void 0;
    var newFrame = withMaxScroll(frame, oldMaxScroll);
    var subject = getSubject({
      page: droppable.subject.page,
      axis: droppable.axis,
      frame: newFrame,
      withPlaceholder: null
    });
    return _extends({}, droppable, {
      subject: subject,
      frame: newFrame
    });
  };

  var moveToNewDroppable = (function (_ref) {
    var previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
        moveRelativeTo = _ref.moveRelativeTo,
        insideDestination = _ref.insideDestination,
        draggable = _ref.draggable,
        draggables = _ref.draggables,
        destination = _ref.destination,
        viewport = _ref.viewport,
        afterCritical = _ref.afterCritical;

    if (!moveRelativeTo) {
      if (insideDestination.length) {
        return null;
      }

      var proposed = {
        displaced: emptyGroups,
        displacedBy: noDisplacedBy,
        at: {
          type: 'REORDER',
          destination: {
            droppableId: destination.descriptor.id,
            index: 0
          }
        }
      };
      var proposedPageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
        impact: proposed,
        draggable: draggable,
        droppable: destination,
        draggables: draggables,
        afterCritical: afterCritical
      });
      var withPlaceholder = isHomeOf(draggable, destination) ? destination : addPlaceholder(destination, draggable, draggables);
      var isVisibleInNewLocation = isTotallyVisibleInNewLocation({
        draggable: draggable,
        destination: withPlaceholder,
        newPageBorderBoxCenter: proposedPageBorderBoxCenter,
        viewport: viewport.frame,
        withDroppableDisplacement: false,
        onlyOnMainAxis: true
      });
      return isVisibleInNewLocation ? proposed : null;
    }

    var isGoingBeforeTarget = Boolean(previousPageBorderBoxCenter[destination.axis.line] <= moveRelativeTo.page.borderBox.center[destination.axis.line]);

    var proposedIndex = function () {
      var relativeTo = moveRelativeTo.descriptor.index;

      if (moveRelativeTo.descriptor.id === draggable.descriptor.id) {
        return relativeTo;
      }

      if (isGoingBeforeTarget) {
        return relativeTo;
      }

      return relativeTo + 1;
    }();

    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy);
    return calculateReorderImpact({
      draggable: draggable,
      insideDestination: insideDestination,
      destination: destination,
      viewport: viewport,
      displacedBy: displacedBy,
      last: emptyGroups,
      index: proposedIndex
    });
  });

  var moveCrossAxis = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
        previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
        draggable = _ref.draggable,
        isOver = _ref.isOver,
        draggables = _ref.draggables,
        droppables = _ref.droppables,
        viewport = _ref.viewport,
        afterCritical = _ref.afterCritical;
    var destination = getBestCrossAxisDroppable({
      isMovingForward: isMovingForward,
      pageBorderBoxCenter: previousPageBorderBoxCenter,
      source: isOver,
      droppables: droppables,
      viewport: viewport
    });

    if (!destination) {
      return null;
    }

    var insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
    var moveRelativeTo = getClosestDraggable({
      pageBorderBoxCenter: previousPageBorderBoxCenter,
      viewport: viewport,
      destination: destination,
      insideDestination: insideDestination,
      afterCritical: afterCritical
    });
    var impact = moveToNewDroppable({
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      destination: destination,
      draggable: draggable,
      draggables: draggables,
      moveRelativeTo: moveRelativeTo,
      insideDestination: insideDestination,
      viewport: viewport,
      afterCritical: afterCritical
    });

    if (!impact) {
      return null;
    }

    var pageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
      impact: impact,
      draggable: draggable,
      droppable: destination,
      draggables: draggables,
      afterCritical: afterCritical
    });
    var clientSelection = getClientFromPageBorderBoxCenter({
      pageBorderBoxCenter: pageBorderBoxCenter,
      draggable: draggable,
      viewport: viewport
    });
    return {
      clientSelection: clientSelection,
      impact: impact,
      scrollJumpRequest: null
    };
  });

  var whatIsDraggedOver = (function (impact) {
    var at = impact.at;

    if (!at) {
      return null;
    }

    if (at.type === 'REORDER') {
      return at.destination.droppableId;
    }

    return at.combine.droppableId;
  });

  var getDroppableOver = function getDroppableOver(impact, droppables) {
    var id = whatIsDraggedOver(impact);
    return id ? droppables[id] : null;
  };

  var moveInDirection = (function (_ref) {
    var state = _ref.state,
        type = _ref.type;
    var isActuallyOver = getDroppableOver(state.impact, state.dimensions.droppables);
    var isMainAxisMovementAllowed = Boolean(isActuallyOver);
    var home = state.dimensions.droppables[state.critical.droppable.id];
    var isOver = isActuallyOver || home;
    var direction = isOver.axis.direction;
    var isMovingOnMainAxis = direction === 'vertical' && (type === 'MOVE_UP' || type === 'MOVE_DOWN') || direction === 'horizontal' && (type === 'MOVE_LEFT' || type === 'MOVE_RIGHT');

    if (isMovingOnMainAxis && !isMainAxisMovementAllowed) {
      return null;
    }

    var isMovingForward = type === 'MOVE_DOWN' || type === 'MOVE_RIGHT';
    var draggable = state.dimensions.draggables[state.critical.draggable.id];
    var previousPageBorderBoxCenter = state.current.page.borderBoxCenter;
    var _state$dimensions = state.dimensions,
        draggables = _state$dimensions.draggables,
        droppables = _state$dimensions.droppables;
    return isMovingOnMainAxis ? moveToNextPlace({
      isMovingForward: isMovingForward,
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      draggable: draggable,
      destination: isOver,
      draggables: draggables,
      viewport: state.viewport,
      previousClientSelection: state.current.client.selection,
      previousImpact: state.impact,
      afterCritical: state.afterCritical
    }) : moveCrossAxis({
      isMovingForward: isMovingForward,
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      draggable: draggable,
      isOver: isOver,
      draggables: draggables,
      droppables: droppables,
      viewport: state.viewport,
      afterCritical: state.afterCritical
    });
  });

  function isMovementAllowed(state) {
    return state.phase === 'DRAGGING' || state.phase === 'COLLECTING';
  }

  var lodash = createCommonjsModule(function (module, exports) {
  (function() {

    /** Used as a safe reference for `undefined` in pre-ES5 environments. */
    var undefined$1;

    /** Used as the semantic version number. */
    var VERSION = '4.17.15';

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /** Error message constants. */
    var CORE_ERROR_TEXT = 'Unsupported core-js use. Try https://npms.io/search?q=ponyfill.',
        FUNC_ERROR_TEXT = 'Expected a function';

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used as the maximum memoize cache size. */
    var MAX_MEMOIZE_SIZE = 500;

    /** Used as the internal argument placeholder. */
    var PLACEHOLDER = '__lodash_placeholder__';

    /** Used to compose bitmasks for cloning. */
    var CLONE_DEEP_FLAG = 1,
        CLONE_FLAT_FLAG = 2,
        CLONE_SYMBOLS_FLAG = 4;

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /** Used to compose bitmasks for function metadata. */
    var WRAP_BIND_FLAG = 1,
        WRAP_BIND_KEY_FLAG = 2,
        WRAP_CURRY_BOUND_FLAG = 4,
        WRAP_CURRY_FLAG = 8,
        WRAP_CURRY_RIGHT_FLAG = 16,
        WRAP_PARTIAL_FLAG = 32,
        WRAP_PARTIAL_RIGHT_FLAG = 64,
        WRAP_ARY_FLAG = 128,
        WRAP_REARG_FLAG = 256,
        WRAP_FLIP_FLAG = 512;

    /** Used as default options for `_.truncate`. */
    var DEFAULT_TRUNC_LENGTH = 30,
        DEFAULT_TRUNC_OMISSION = '...';

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /** Used to indicate the type of lazy iteratees. */
    var LAZY_FILTER_FLAG = 1,
        LAZY_MAP_FLAG = 2,
        LAZY_WHILE_FLAG = 3;

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0,
        MAX_SAFE_INTEGER = 9007199254740991,
        MAX_INTEGER = 1.7976931348623157e+308,
        NAN = 0 / 0;

    /** Used as references for the maximum length and index of an array. */
    var MAX_ARRAY_LENGTH = 4294967295,
        MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

    /** Used to associate wrap methods with their bit flags. */
    var wrapFlags = [
      ['ary', WRAP_ARY_FLAG],
      ['bind', WRAP_BIND_FLAG],
      ['bindKey', WRAP_BIND_KEY_FLAG],
      ['curry', WRAP_CURRY_FLAG],
      ['curryRight', WRAP_CURRY_RIGHT_FLAG],
      ['flip', WRAP_FLIP_FLAG],
      ['partial', WRAP_PARTIAL_FLAG],
      ['partialRight', WRAP_PARTIAL_RIGHT_FLAG],
      ['rearg', WRAP_REARG_FLAG]
    ];

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        asyncTag = '[object AsyncFunction]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        domExcTag = '[object DOMException]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        nullTag = '[object Null]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        proxyTag = '[object Proxy]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]',
        undefinedTag = '[object Undefined]',
        weakMapTag = '[object WeakMap]',
        weakSetTag = '[object WeakSet]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to match empty string literals in compiled template source. */
    var reEmptyStringLeading = /\b__p \+= '';/g,
        reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
        reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

    /** Used to match HTML entities and HTML characters. */
    var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g,
        reUnescapedHtml = /[&<>"']/g,
        reHasEscapedHtml = RegExp(reEscapedHtml.source),
        reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

    /** Used to match template delimiters. */
    var reEscape = /<%-([\s\S]+?)%>/g,
        reEvaluate = /<%([\s\S]+?)%>/g,
        reInterpolate = /<%=([\s\S]+?)%>/g;

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/,
        rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g,
        reHasRegExpChar = RegExp(reRegExpChar.source);

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g,
        reTrimStart = /^\s+/,
        reTrimEnd = /\s+$/;

    /** Used to match wrap detail comments. */
    var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/,
        reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/,
        reSplitDetails = /,? & /;

    /** Used to match words composed of alphanumeric characters. */
    var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Used to match
     * [ES template delimiters](http://ecma-international.org/ecma-262/7.0/#sec-template-literal-lexical-components).
     */
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /** Used to match Latin Unicode letters (excluding mathematical operators). */
    var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

    /** Used to ensure capturing order of template delimiters. */
    var reNoMatch = /($^)/;

    /** Used to match unescaped characters in compiled string literals. */
    var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

    /** Used to compose unicode character classes. */
    var rsAstralRange = '\\ud800-\\udfff',
        rsComboMarksRange = '\\u0300-\\u036f',
        reComboHalfMarksRange = '\\ufe20-\\ufe2f',
        rsComboSymbolsRange = '\\u20d0-\\u20ff',
        rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
        rsDingbatRange = '\\u2700-\\u27bf',
        rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
        rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
        rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
        rsPunctuationRange = '\\u2000-\\u206f',
        rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
        rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
        rsVarRange = '\\ufe0e\\ufe0f',
        rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;

    /** Used to compose unicode capture groups. */
    var rsApos = "['\u2019]",
        rsAstral = '[' + rsAstralRange + ']',
        rsBreak = '[' + rsBreakRange + ']',
        rsCombo = '[' + rsComboRange + ']',
        rsDigits = '\\d+',
        rsDingbat = '[' + rsDingbatRange + ']',
        rsLower = '[' + rsLowerRange + ']',
        rsMisc = '[^' + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
        rsFitz = '\\ud83c[\\udffb-\\udfff]',
        rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
        rsNonAstral = '[^' + rsAstralRange + ']',
        rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
        rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
        rsUpper = '[' + rsUpperRange + ']',
        rsZWJ = '\\u200d';

    /** Used to compose unicode regexes. */
    var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
        rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
        rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
        rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
        reOptMod = rsModifier + '?',
        rsOptVar = '[' + rsVarRange + ']?',
        rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
        rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
        rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
        rsSeq = rsOptVar + reOptMod + rsOptJoin,
        rsEmoji = '(?:' + [rsDingbat, rsRegional, rsSurrPair].join('|') + ')' + rsSeq,
        rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

    /** Used to match apostrophes. */
    var reApos = RegExp(rsApos, 'g');

    /**
     * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
     * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
     */
    var reComboMark = RegExp(rsCombo, 'g');

    /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
    var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

    /** Used to match complex or compound words. */
    var reUnicodeWord = RegExp([
      rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
      rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
      rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
      rsUpper + '+' + rsOptContrUpper,
      rsOrdUpper,
      rsOrdLower,
      rsDigits,
      rsEmoji
    ].join('|'), 'g');

    /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
    var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

    /** Used to detect strings that need a more robust regexp to match words. */
    var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

    /** Used to assign default `context` object properties. */
    var contextProps = [
      'Array', 'Buffer', 'DataView', 'Date', 'Error', 'Float32Array', 'Float64Array',
      'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Math', 'Object',
      'Promise', 'RegExp', 'Set', 'String', 'Symbol', 'TypeError', 'Uint8Array',
      'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap',
      '_', 'clearTimeout', 'isFinite', 'parseInt', 'setTimeout'
    ];

    /** Used to make template sourceURLs easier to identify. */
    var templateCounter = -1;

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] =
    cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
    cloneableTags[boolTag] = cloneableTags[dateTag] =
    cloneableTags[float32Tag] = cloneableTags[float64Tag] =
    cloneableTags[int8Tag] = cloneableTags[int16Tag] =
    cloneableTags[int32Tag] = cloneableTags[mapTag] =
    cloneableTags[numberTag] = cloneableTags[objectTag] =
    cloneableTags[regexpTag] = cloneableTags[setTag] =
    cloneableTags[stringTag] = cloneableTags[symbolTag] =
    cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
    cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] =
    cloneableTags[weakMapTag] = false;

    /** Used to map Latin Unicode letters to basic Latin letters. */
    var deburredLetters = {
      // Latin-1 Supplement block.
      '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
      '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
      '\xc7': 'C',  '\xe7': 'c',
      '\xd0': 'D',  '\xf0': 'd',
      '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
      '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
      '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
      '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
      '\xd1': 'N',  '\xf1': 'n',
      '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
      '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
      '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
      '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
      '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
      '\xc6': 'Ae', '\xe6': 'ae',
      '\xde': 'Th', '\xfe': 'th',
      '\xdf': 'ss',
      // Latin Extended-A block.
      '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
      '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
      '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
      '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
      '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
      '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
      '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
      '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
      '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
      '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
      '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
      '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
      '\u0134': 'J',  '\u0135': 'j',
      '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
      '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
      '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
      '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
      '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
      '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
      '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
      '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
      '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
      '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
      '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
      '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
      '\u0163': 't',  '\u0165': 't', '\u0167': 't',
      '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
      '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
      '\u0174': 'W',  '\u0175': 'w',
      '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
      '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
      '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
      '\u0132': 'IJ', '\u0133': 'ij',
      '\u0152': 'Oe', '\u0153': 'oe',
      '\u0149': "'n", '\u017f': 's'
    };

    /** Used to map characters to HTML entities. */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to map HTML entities to characters. */
    var htmlUnescapes = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };

    /** Used to escape characters for inclusion in compiled string literals. */
    var stringEscapes = {
      '\\': '\\',
      "'": "'",
      '\n': 'n',
      '\r': 'r',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };

    /** Built-in method references without a dependency on `root`. */
    var freeParseFloat = parseFloat,
        freeParseInt = parseInt;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer,
        nodeIsDate = nodeUtil && nodeUtil.isDate,
        nodeIsMap = nodeUtil && nodeUtil.isMap,
        nodeIsRegExp = nodeUtil && nodeUtil.isRegExp,
        nodeIsSet = nodeUtil && nodeUtil.isSet,
        nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /*--------------------------------------------------------------------------*/

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /**
     * A specialized version of `baseAggregator` for arrays.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} setter The function to set `accumulator` values.
     * @param {Function} iteratee The iteratee to transform keys.
     * @param {Object} accumulator The initial aggregated object.
     * @returns {Function} Returns `accumulator`.
     */
    function arrayAggregator(array, setter, iteratee, accumulator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        var value = array[index];
        setter(accumulator, value, iteratee(value), array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * A specialized version of `_.forEachRight` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEachRight(array, iteratee) {
      var length = array == null ? 0 : array.length;

      while (length--) {
        if (iteratee(array[length], length, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * A specialized version of `_.every` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if all elements pass the predicate check,
     *  else `false`.
     */
    function arrayEvery(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (!predicate(array[index], index, array)) {
          return false;
        }
      }
      return true;
    }

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * A specialized version of `_.includes` for arrays without support for
     * specifying an index to search from.
     *
     * @private
     * @param {Array} [array] The array to inspect.
     * @param {*} target The value to search for.
     * @returns {boolean} Returns `true` if `target` is found, else `false`.
     */
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }

    /**
     * This function is like `arrayIncludes` except that it accepts a comparator.
     *
     * @private
     * @param {Array} [array] The array to inspect.
     * @param {*} target The value to search for.
     * @param {Function} comparator The comparator invoked per element.
     * @returns {boolean} Returns `true` if `target` is found, else `false`.
     */
    function arrayIncludesWith(array, value, comparator) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }
      return false;
    }

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.reduce` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initAccum] Specify using the first element of `array` as
     *  the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1,
          length = array == null ? 0 : array.length;

      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.reduceRight` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initAccum] Specify using the last element of `array` as
     *  the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduceRight(array, iteratee, accumulator, initAccum) {
      var length = array == null ? 0 : array.length;
      if (initAccum && length) {
        accumulator = array[--length];
      }
      while (length--) {
        accumulator = iteratee(accumulator, array[length], length, array);
      }
      return accumulator;
    }

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Gets the size of an ASCII `string`.
     *
     * @private
     * @param {string} string The string inspect.
     * @returns {number} Returns the string size.
     */
    var asciiSize = baseProperty('length');

    /**
     * Converts an ASCII `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function asciiToArray(string) {
      return string.split('');
    }

    /**
     * Splits an ASCII `string` into an array of its words.
     *
     * @private
     * @param {string} The string to inspect.
     * @returns {Array} Returns the words of `string`.
     */
    function asciiWords(string) {
      return string.match(reAsciiWord) || [];
    }

    /**
     * The base implementation of methods like `_.findKey` and `_.findLastKey`,
     * without support for iteratee shorthands, which iterates over `collection`
     * using `eachFunc`.
     *
     * @private
     * @param {Array|Object} collection The collection to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @returns {*} Returns the found element or its key, else `undefined`.
     */
    function baseFindKey(collection, predicate, eachFunc) {
      var result;
      eachFunc(collection, function(value, key, collection) {
        if (predicate(value, key, collection)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      return value === value
        ? strictIndexOf(array, value, fromIndex)
        : baseFindIndex(array, baseIsNaN, fromIndex);
    }

    /**
     * This function is like `baseIndexOf` except that it accepts a comparator.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @param {Function} comparator The comparator invoked per element.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOfWith(array, value, fromIndex, comparator) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (comparator(array[index], value)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }

    /**
     * The base implementation of `_.mean` and `_.meanBy` without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {number} Returns the mean.
     */
    function baseMean(array, iteratee) {
      var length = array == null ? 0 : array.length;
      return length ? (baseSum(array, iteratee) / length) : NAN;
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined$1 : object[key];
      };
    }

    /**
     * The base implementation of `_.propertyOf` without support for deep paths.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyOf(object) {
      return function(key) {
        return object == null ? undefined$1 : object[key];
      };
    }

    /**
     * The base implementation of `_.reduce` and `_.reduceRight`, without support
     * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} accumulator The initial value.
     * @param {boolean} initAccum Specify using the first or last element of
     *  `collection` as the initial value.
     * @param {Function} eachFunc The function to iterate over `collection`.
     * @returns {*} Returns the accumulated value.
     */
    function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
      eachFunc(collection, function(value, index, collection) {
        accumulator = initAccum
          ? (initAccum = false, value)
          : iteratee(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The base implementation of `_.sortBy` which uses `comparer` to define the
     * sort order of `array` and replaces criteria objects with their corresponding
     * values.
     *
     * @private
     * @param {Array} array The array to sort.
     * @param {Function} comparer The function to define sort order.
     * @returns {Array} Returns `array`.
     */
    function baseSortBy(array, comparer) {
      var length = array.length;

      array.sort(comparer);
      while (length--) {
        array[length] = array[length].value;
      }
      return array;
    }

    /**
     * The base implementation of `_.sum` and `_.sumBy` without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {number} Returns the sum.
     */
    function baseSum(array, iteratee) {
      var result,
          index = -1,
          length = array.length;

      while (++index < length) {
        var current = iteratee(array[index]);
        if (current !== undefined$1) {
          result = result === undefined$1 ? current : (result + current);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * The base implementation of `_.toPairs` and `_.toPairsIn` which creates an array
     * of key-value pairs for `object` corresponding to the property names of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the key-value pairs.
     */
    function baseToPairs(object, props) {
      return arrayMap(props, function(key) {
        return [key, object[key]];
      });
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    /**
     * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the first unmatched string symbol.
     */
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1,
          length = strSymbols.length;

      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }

    /**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the last unmatched string symbol.
     */
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;

      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }

    /**
     * Gets the number of `placeholder` occurrences in `array`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} placeholder The placeholder to search for.
     * @returns {number} Returns the placeholder count.
     */
    function countHolders(array, placeholder) {
      var length = array.length,
          result = 0;

      while (length--) {
        if (array[length] === placeholder) {
          ++result;
        }
      }
      return result;
    }

    /**
     * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
     * letters to basic Latin letters.
     *
     * @private
     * @param {string} letter The matched letter to deburr.
     * @returns {string} Returns the deburred letter.
     */
    var deburrLetter = basePropertyOf(deburredLetters);

    /**
     * Used by `_.escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} chr The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    var escapeHtmlChar = basePropertyOf(htmlEscapes);

    /**
     * Used by `_.template` to escape characters for inclusion in compiled string literals.
     *
     * @private
     * @param {string} chr The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeStringChar(chr) {
      return '\\' + stringEscapes[chr];
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined$1 : object[key];
    }

    /**
     * Checks if `string` contains Unicode symbols.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {boolean} Returns `true` if a symbol is found, else `false`.
     */
    function hasUnicode(string) {
      return reHasUnicode.test(string);
    }

    /**
     * Checks if `string` contains a word composed of Unicode symbols.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {boolean} Returns `true` if a word is found, else `false`.
     */
    function hasUnicodeWord(string) {
      return reHasUnicodeWord.test(string);
    }

    /**
     * Converts `iterator` to an array.
     *
     * @private
     * @param {Object} iterator The iterator to convert.
     * @returns {Array} Returns the converted array.
     */
    function iteratorToArray(iterator) {
      var data,
          result = [];

      while (!(data = iterator.next()).done) {
        result.push(data.value);
      }
      return result;
    }

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /**
     * Replaces all `placeholder` elements in `array` with an internal placeholder
     * and returns an array of their indexes.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {*} placeholder The placeholder to replace.
     * @returns {Array} Returns the new array of placeholder indexes.
     */
    function replaceHolders(array, placeholder) {
      var index = -1,
          length = array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value === placeholder || value === PLACEHOLDER) {
          array[index] = PLACEHOLDER;
          result[resIndex++] = index;
        }
      }
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /**
     * Converts `set` to its value-value pairs.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the value-value pairs.
     */
    function setToPairs(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = [value, value];
      });
      return result;
    }

    /**
     * A specialized version of `_.indexOf` which performs strict equality
     * comparisons of values, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * A specialized version of `_.lastIndexOf` which performs strict equality
     * comparisons of values, i.e. `===`.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function strictLastIndexOf(array, value, fromIndex) {
      var index = fromIndex + 1;
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return index;
    }

    /**
     * Gets the number of symbols in `string`.
     *
     * @private
     * @param {string} string The string to inspect.
     * @returns {number} Returns the string size.
     */
    function stringSize(string) {
      return hasUnicode(string)
        ? unicodeSize(string)
        : asciiSize(string);
    }

    /**
     * Converts `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function stringToArray(string) {
      return hasUnicode(string)
        ? unicodeToArray(string)
        : asciiToArray(string);
    }

    /**
     * Used by `_.unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} chr The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    var unescapeHtmlChar = basePropertyOf(htmlUnescapes);

    /**
     * Gets the size of a Unicode `string`.
     *
     * @private
     * @param {string} string The string inspect.
     * @returns {number} Returns the string size.
     */
    function unicodeSize(string) {
      var result = reUnicode.lastIndex = 0;
      while (reUnicode.test(string)) {
        ++result;
      }
      return result;
    }

    /**
     * Converts a Unicode `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function unicodeToArray(string) {
      return string.match(reUnicode) || [];
    }

    /**
     * Splits a Unicode `string` into an array of its words.
     *
     * @private
     * @param {string} The string to inspect.
     * @returns {Array} Returns the words of `string`.
     */
    function unicodeWords(string) {
      return string.match(reUnicodeWord) || [];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Create a new pristine `lodash` function using the `context` object.
     *
     * @static
     * @memberOf _
     * @since 1.1.0
     * @category Util
     * @param {Object} [context=root] The context object.
     * @returns {Function} Returns a new `lodash` function.
     * @example
     *
     * _.mixin({ 'foo': _.constant('foo') });
     *
     * var lodash = _.runInContext();
     * lodash.mixin({ 'bar': lodash.constant('bar') });
     *
     * _.isFunction(_.foo);
     * // => true
     * _.isFunction(_.bar);
     * // => false
     *
     * lodash.isFunction(lodash.foo);
     * // => false
     * lodash.isFunction(lodash.bar);
     * // => true
     *
     * // Create a suped-up `defer` in Node.js.
     * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
     */
    var runInContext = (function runInContext(context) {
      context = context == null ? root : _.defaults(root.Object(), context, _.pick(root, contextProps));

      /** Built-in constructor references. */
      var Array = context.Array,
          Date = context.Date,
          Error = context.Error,
          Function = context.Function,
          Math = context.Math,
          Object = context.Object,
          RegExp = context.RegExp,
          String = context.String,
          TypeError = context.TypeError;

      /** Used for built-in method references. */
      var arrayProto = Array.prototype,
          funcProto = Function.prototype,
          objectProto = Object.prototype;

      /** Used to detect overreaching core-js shims. */
      var coreJsData = context['__core-js_shared__'];

      /** Used to resolve the decompiled source of functions. */
      var funcToString = funcProto.toString;

      /** Used to check objects for own properties. */
      var hasOwnProperty = objectProto.hasOwnProperty;

      /** Used to generate unique IDs. */
      var idCounter = 0;

      /** Used to detect methods masquerading as native. */
      var maskSrcKey = (function() {
        var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
        return uid ? ('Symbol(src)_1.' + uid) : '';
      }());

      /**
       * Used to resolve the
       * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
       * of values.
       */
      var nativeObjectToString = objectProto.toString;

      /** Used to infer the `Object` constructor. */
      var objectCtorString = funcToString.call(Object);

      /** Used to restore the original `_` reference in `_.noConflict`. */
      var oldDash = root._;

      /** Used to detect if a method is native. */
      var reIsNative = RegExp('^' +
        funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
        .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
      );

      /** Built-in value references. */
      var Buffer = moduleExports ? context.Buffer : undefined$1,
          Symbol = context.Symbol,
          Uint8Array = context.Uint8Array,
          allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined$1,
          getPrototype = overArg(Object.getPrototypeOf, Object),
          objectCreate = Object.create,
          propertyIsEnumerable = objectProto.propertyIsEnumerable,
          splice = arrayProto.splice,
          spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined$1,
          symIterator = Symbol ? Symbol.iterator : undefined$1,
          symToStringTag = Symbol ? Symbol.toStringTag : undefined$1;

      var defineProperty = (function() {
        try {
          var func = getNative(Object, 'defineProperty');
          func({}, '', {});
          return func;
        } catch (e) {}
      }());

      /** Mocked built-ins. */
      var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout,
          ctxNow = Date && Date.now !== root.Date.now && Date.now,
          ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeCeil = Math.ceil,
          nativeFloor = Math.floor,
          nativeGetSymbols = Object.getOwnPropertySymbols,
          nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined$1,
          nativeIsFinite = context.isFinite,
          nativeJoin = arrayProto.join,
          nativeKeys = overArg(Object.keys, Object),
          nativeMax = Math.max,
          nativeMin = Math.min,
          nativeNow = Date.now,
          nativeParseInt = context.parseInt,
          nativeRandom = Math.random,
          nativeReverse = arrayProto.reverse;

      /* Built-in method references that are verified to be native. */
      var DataView = getNative(context, 'DataView'),
          Map = getNative(context, 'Map'),
          Promise = getNative(context, 'Promise'),
          Set = getNative(context, 'Set'),
          WeakMap = getNative(context, 'WeakMap'),
          nativeCreate = getNative(Object, 'create');

      /** Used to store function metadata. */
      var metaMap = WeakMap && new WeakMap;

      /** Used to lookup unminified function names. */
      var realNames = {};

      /** Used to detect maps, sets, and weakmaps. */
      var dataViewCtorString = toSource(DataView),
          mapCtorString = toSource(Map),
          promiseCtorString = toSource(Promise),
          setCtorString = toSource(Set),
          weakMapCtorString = toSource(WeakMap);

      /** Used to convert symbols to primitives and strings. */
      var symbolProto = Symbol ? Symbol.prototype : undefined$1,
          symbolValueOf = symbolProto ? symbolProto.valueOf : undefined$1,
          symbolToString = symbolProto ? symbolProto.toString : undefined$1;

      /*------------------------------------------------------------------------*/

      /**
       * Creates a `lodash` object which wraps `value` to enable implicit method
       * chain sequences. Methods that operate on and return arrays, collections,
       * and functions can be chained together. Methods that retrieve a single value
       * or may return a primitive value will automatically end the chain sequence
       * and return the unwrapped value. Otherwise, the value must be unwrapped
       * with `_#value`.
       *
       * Explicit chain sequences, which must be unwrapped with `_#value`, may be
       * enabled using `_.chain`.
       *
       * The execution of chained methods is lazy, that is, it's deferred until
       * `_#value` is implicitly or explicitly called.
       *
       * Lazy evaluation allows several methods to support shortcut fusion.
       * Shortcut fusion is an optimization to merge iteratee calls; this avoids
       * the creation of intermediate arrays and can greatly reduce the number of
       * iteratee executions. Sections of a chain sequence qualify for shortcut
       * fusion if the section is applied to an array and iteratees accept only
       * one argument. The heuristic for whether a section qualifies for shortcut
       * fusion is subject to change.
       *
       * Chaining is supported in custom builds as long as the `_#value` method is
       * directly or indirectly included in the build.
       *
       * In addition to lodash methods, wrappers have `Array` and `String` methods.
       *
       * The wrapper `Array` methods are:
       * `concat`, `join`, `pop`, `push`, `shift`, `sort`, `splice`, and `unshift`
       *
       * The wrapper `String` methods are:
       * `replace` and `split`
       *
       * The wrapper methods that support shortcut fusion are:
       * `at`, `compact`, `drop`, `dropRight`, `dropWhile`, `filter`, `find`,
       * `findLast`, `head`, `initial`, `last`, `map`, `reject`, `reverse`, `slice`,
       * `tail`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, and `toArray`
       *
       * The chainable wrapper methods are:
       * `after`, `ary`, `assign`, `assignIn`, `assignInWith`, `assignWith`, `at`,
       * `before`, `bind`, `bindAll`, `bindKey`, `castArray`, `chain`, `chunk`,
       * `commit`, `compact`, `concat`, `conforms`, `constant`, `countBy`, `create`,
       * `curry`, `debounce`, `defaults`, `defaultsDeep`, `defer`, `delay`,
       * `difference`, `differenceBy`, `differenceWith`, `drop`, `dropRight`,
       * `dropRightWhile`, `dropWhile`, `extend`, `extendWith`, `fill`, `filter`,
       * `flatMap`, `flatMapDeep`, `flatMapDepth`, `flatten`, `flattenDeep`,
       * `flattenDepth`, `flip`, `flow`, `flowRight`, `fromPairs`, `functions`,
       * `functionsIn`, `groupBy`, `initial`, `intersection`, `intersectionBy`,
       * `intersectionWith`, `invert`, `invertBy`, `invokeMap`, `iteratee`, `keyBy`,
       * `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`, `matchesProperty`,
       * `memoize`, `merge`, `mergeWith`, `method`, `methodOf`, `mixin`, `negate`,
       * `nthArg`, `omit`, `omitBy`, `once`, `orderBy`, `over`, `overArgs`,
       * `overEvery`, `overSome`, `partial`, `partialRight`, `partition`, `pick`,
       * `pickBy`, `plant`, `property`, `propertyOf`, `pull`, `pullAll`, `pullAllBy`,
       * `pullAllWith`, `pullAt`, `push`, `range`, `rangeRight`, `rearg`, `reject`,
       * `remove`, `rest`, `reverse`, `sampleSize`, `set`, `setWith`, `shuffle`,
       * `slice`, `sort`, `sortBy`, `splice`, `spread`, `tail`, `take`, `takeRight`,
       * `takeRightWhile`, `takeWhile`, `tap`, `throttle`, `thru`, `toArray`,
       * `toPairs`, `toPairsIn`, `toPath`, `toPlainObject`, `transform`, `unary`,
       * `union`, `unionBy`, `unionWith`, `uniq`, `uniqBy`, `uniqWith`, `unset`,
       * `unshift`, `unzip`, `unzipWith`, `update`, `updateWith`, `values`,
       * `valuesIn`, `without`, `wrap`, `xor`, `xorBy`, `xorWith`, `zip`,
       * `zipObject`, `zipObjectDeep`, and `zipWith`
       *
       * The wrapper methods that are **not** chainable by default are:
       * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clamp`, `clone`,
       * `cloneDeep`, `cloneDeepWith`, `cloneWith`, `conformsTo`, `deburr`,
       * `defaultTo`, `divide`, `each`, `eachRight`, `endsWith`, `eq`, `escape`,
       * `escapeRegExp`, `every`, `find`, `findIndex`, `findKey`, `findLast`,
       * `findLastIndex`, `findLastKey`, `first`, `floor`, `forEach`, `forEachRight`,
       * `forIn`, `forInRight`, `forOwn`, `forOwnRight`, `get`, `gt`, `gte`, `has`,
       * `hasIn`, `head`, `identity`, `includes`, `indexOf`, `inRange`, `invoke`,
       * `isArguments`, `isArray`, `isArrayBuffer`, `isArrayLike`, `isArrayLikeObject`,
       * `isBoolean`, `isBuffer`, `isDate`, `isElement`, `isEmpty`, `isEqual`,
       * `isEqualWith`, `isError`, `isFinite`, `isFunction`, `isInteger`, `isLength`,
       * `isMap`, `isMatch`, `isMatchWith`, `isNaN`, `isNative`, `isNil`, `isNull`,
       * `isNumber`, `isObject`, `isObjectLike`, `isPlainObject`, `isRegExp`,
       * `isSafeInteger`, `isSet`, `isString`, `isUndefined`, `isTypedArray`,
       * `isWeakMap`, `isWeakSet`, `join`, `kebabCase`, `last`, `lastIndexOf`,
       * `lowerCase`, `lowerFirst`, `lt`, `lte`, `max`, `maxBy`, `mean`, `meanBy`,
       * `min`, `minBy`, `multiply`, `noConflict`, `noop`, `now`, `nth`, `pad`,
       * `padEnd`, `padStart`, `parseInt`, `pop`, `random`, `reduce`, `reduceRight`,
       * `repeat`, `result`, `round`, `runInContext`, `sample`, `shift`, `size`,
       * `snakeCase`, `some`, `sortedIndex`, `sortedIndexBy`, `sortedLastIndex`,
       * `sortedLastIndexBy`, `startCase`, `startsWith`, `stubArray`, `stubFalse`,
       * `stubObject`, `stubString`, `stubTrue`, `subtract`, `sum`, `sumBy`,
       * `template`, `times`, `toFinite`, `toInteger`, `toJSON`, `toLength`,
       * `toLower`, `toNumber`, `toSafeInteger`, `toString`, `toUpper`, `trim`,
       * `trimEnd`, `trimStart`, `truncate`, `unescape`, `uniqueId`, `upperCase`,
       * `upperFirst`, `value`, and `words`
       *
       * @name _
       * @constructor
       * @category Seq
       * @param {*} value The value to wrap in a `lodash` instance.
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * var wrapped = _([1, 2, 3]);
       *
       * // Returns an unwrapped value.
       * wrapped.reduce(_.add);
       * // => 6
       *
       * // Returns a wrapped value.
       * var squares = wrapped.map(square);
       *
       * _.isArray(squares);
       * // => false
       *
       * _.isArray(squares.value());
       * // => true
       */
      function lodash(value) {
        if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
          if (value instanceof LodashWrapper) {
            return value;
          }
          if (hasOwnProperty.call(value, '__wrapped__')) {
            return wrapperClone(value);
          }
        }
        return new LodashWrapper(value);
      }

      /**
       * The base implementation of `_.create` without support for assigning
       * properties to the created object.
       *
       * @private
       * @param {Object} proto The object to inherit from.
       * @returns {Object} Returns the new object.
       */
      var baseCreate = (function() {
        function object() {}
        return function(proto) {
          if (!isObject(proto)) {
            return {};
          }
          if (objectCreate) {
            return objectCreate(proto);
          }
          object.prototype = proto;
          var result = new object;
          object.prototype = undefined$1;
          return result;
        };
      }());

      /**
       * The function whose prototype chain sequence wrappers inherit from.
       *
       * @private
       */
      function baseLodash() {
        // No operation performed.
      }

      /**
       * The base constructor for creating `lodash` wrapper objects.
       *
       * @private
       * @param {*} value The value to wrap.
       * @param {boolean} [chainAll] Enable explicit method chain sequences.
       */
      function LodashWrapper(value, chainAll) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__chain__ = !!chainAll;
        this.__index__ = 0;
        this.__values__ = undefined$1;
      }

      /**
       * By default, the template delimiters used by lodash are like those in
       * embedded Ruby (ERB) as well as ES2015 template strings. Change the
       * following template settings to use alternative delimiters.
       *
       * @static
       * @memberOf _
       * @type {Object}
       */
      lodash.templateSettings = {

        /**
         * Used to detect `data` property values to be HTML-escaped.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        'escape': reEscape,

        /**
         * Used to detect code to be evaluated.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        'evaluate': reEvaluate,

        /**
         * Used to detect `data` property values to inject.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        'interpolate': reInterpolate,

        /**
         * Used to reference the data object in the template text.
         *
         * @memberOf _.templateSettings
         * @type {string}
         */
        'variable': '',

        /**
         * Used to import variables into the compiled template.
         *
         * @memberOf _.templateSettings
         * @type {Object}
         */
        'imports': {

          /**
           * A reference to the `lodash` function.
           *
           * @memberOf _.templateSettings.imports
           * @type {Function}
           */
          '_': lodash
        }
      };

      // Ensure wrappers are instances of `baseLodash`.
      lodash.prototype = baseLodash.prototype;
      lodash.prototype.constructor = lodash;

      LodashWrapper.prototype = baseCreate(baseLodash.prototype);
      LodashWrapper.prototype.constructor = LodashWrapper;

      /*------------------------------------------------------------------------*/

      /**
       * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
       *
       * @private
       * @constructor
       * @param {*} value The value to wrap.
       */
      function LazyWrapper(value) {
        this.__wrapped__ = value;
        this.__actions__ = [];
        this.__dir__ = 1;
        this.__filtered__ = false;
        this.__iteratees__ = [];
        this.__takeCount__ = MAX_ARRAY_LENGTH;
        this.__views__ = [];
      }

      /**
       * Creates a clone of the lazy wrapper object.
       *
       * @private
       * @name clone
       * @memberOf LazyWrapper
       * @returns {Object} Returns the cloned `LazyWrapper` object.
       */
      function lazyClone() {
        var result = new LazyWrapper(this.__wrapped__);
        result.__actions__ = copyArray(this.__actions__);
        result.__dir__ = this.__dir__;
        result.__filtered__ = this.__filtered__;
        result.__iteratees__ = copyArray(this.__iteratees__);
        result.__takeCount__ = this.__takeCount__;
        result.__views__ = copyArray(this.__views__);
        return result;
      }

      /**
       * Reverses the direction of lazy iteration.
       *
       * @private
       * @name reverse
       * @memberOf LazyWrapper
       * @returns {Object} Returns the new reversed `LazyWrapper` object.
       */
      function lazyReverse() {
        if (this.__filtered__) {
          var result = new LazyWrapper(this);
          result.__dir__ = -1;
          result.__filtered__ = true;
        } else {
          result = this.clone();
          result.__dir__ *= -1;
        }
        return result;
      }

      /**
       * Extracts the unwrapped value from its lazy wrapper.
       *
       * @private
       * @name value
       * @memberOf LazyWrapper
       * @returns {*} Returns the unwrapped value.
       */
      function lazyValue() {
        var array = this.__wrapped__.value(),
            dir = this.__dir__,
            isArr = isArray(array),
            isRight = dir < 0,
            arrLength = isArr ? array.length : 0,
            view = getView(0, arrLength, this.__views__),
            start = view.start,
            end = view.end,
            length = end - start,
            index = isRight ? end : (start - 1),
            iteratees = this.__iteratees__,
            iterLength = iteratees.length,
            resIndex = 0,
            takeCount = nativeMin(length, this.__takeCount__);

        if (!isArr || (!isRight && arrLength == length && takeCount == length)) {
          return baseWrapperValue(array, this.__actions__);
        }
        var result = [];

        outer:
        while (length-- && resIndex < takeCount) {
          index += dir;

          var iterIndex = -1,
              value = array[index];

          while (++iterIndex < iterLength) {
            var data = iteratees[iterIndex],
                iteratee = data.iteratee,
                type = data.type,
                computed = iteratee(value);

            if (type == LAZY_MAP_FLAG) {
              value = computed;
            } else if (!computed) {
              if (type == LAZY_FILTER_FLAG) {
                continue outer;
              } else {
                break outer;
              }
            }
          }
          result[resIndex++] = value;
        }
        return result;
      }

      // Ensure `LazyWrapper` is an instance of `baseLodash`.
      LazyWrapper.prototype = baseCreate(baseLodash.prototype);
      LazyWrapper.prototype.constructor = LazyWrapper;

      /*------------------------------------------------------------------------*/

      /**
       * Creates a hash object.
       *
       * @private
       * @constructor
       * @param {Array} [entries] The key-value pairs to cache.
       */
      function Hash(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;

        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      /**
       * Removes all key-value entries from the hash.
       *
       * @private
       * @name clear
       * @memberOf Hash
       */
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }

      /**
       * Removes `key` and its value from the hash.
       *
       * @private
       * @name delete
       * @memberOf Hash
       * @param {Object} hash The hash to modify.
       * @param {string} key The key of the value to remove.
       * @returns {boolean} Returns `true` if the entry was removed, else `false`.
       */
      function hashDelete(key) {
        var result = this.has(key) && delete this.__data__[key];
        this.size -= result ? 1 : 0;
        return result;
      }

      /**
       * Gets the hash value for `key`.
       *
       * @private
       * @name get
       * @memberOf Hash
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function hashGet(key) {
        var data = this.__data__;
        if (nativeCreate) {
          var result = data[key];
          return result === HASH_UNDEFINED ? undefined$1 : result;
        }
        return hasOwnProperty.call(data, key) ? data[key] : undefined$1;
      }

      /**
       * Checks if a hash value for `key` exists.
       *
       * @private
       * @name has
       * @memberOf Hash
       * @param {string} key The key of the entry to check.
       * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
       */
      function hashHas(key) {
        var data = this.__data__;
        return nativeCreate ? (data[key] !== undefined$1) : hasOwnProperty.call(data, key);
      }

      /**
       * Sets the hash `key` to `value`.
       *
       * @private
       * @name set
       * @memberOf Hash
       * @param {string} key The key of the value to set.
       * @param {*} value The value to set.
       * @returns {Object} Returns the hash instance.
       */
      function hashSet(key, value) {
        var data = this.__data__;
        this.size += this.has(key) ? 0 : 1;
        data[key] = (nativeCreate && value === undefined$1) ? HASH_UNDEFINED : value;
        return this;
      }

      // Add methods to `Hash`.
      Hash.prototype.clear = hashClear;
      Hash.prototype['delete'] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;

      /*------------------------------------------------------------------------*/

      /**
       * Creates an list cache object.
       *
       * @private
       * @constructor
       * @param {Array} [entries] The key-value pairs to cache.
       */
      function ListCache(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;

        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      /**
       * Removes all key-value entries from the list cache.
       *
       * @private
       * @name clear
       * @memberOf ListCache
       */
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }

      /**
       * Removes `key` and its value from the list cache.
       *
       * @private
       * @name delete
       * @memberOf ListCache
       * @param {string} key The key of the value to remove.
       * @returns {boolean} Returns `true` if the entry was removed, else `false`.
       */
      function listCacheDelete(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);

        if (index < 0) {
          return false;
        }
        var lastIndex = data.length - 1;
        if (index == lastIndex) {
          data.pop();
        } else {
          splice.call(data, index, 1);
        }
        --this.size;
        return true;
      }

      /**
       * Gets the list cache value for `key`.
       *
       * @private
       * @name get
       * @memberOf ListCache
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function listCacheGet(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);

        return index < 0 ? undefined$1 : data[index][1];
      }

      /**
       * Checks if a list cache value for `key` exists.
       *
       * @private
       * @name has
       * @memberOf ListCache
       * @param {string} key The key of the entry to check.
       * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
       */
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }

      /**
       * Sets the list cache `key` to `value`.
       *
       * @private
       * @name set
       * @memberOf ListCache
       * @param {string} key The key of the value to set.
       * @param {*} value The value to set.
       * @returns {Object} Returns the list cache instance.
       */
      function listCacheSet(key, value) {
        var data = this.__data__,
            index = assocIndexOf(data, key);

        if (index < 0) {
          ++this.size;
          data.push([key, value]);
        } else {
          data[index][1] = value;
        }
        return this;
      }

      // Add methods to `ListCache`.
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype['delete'] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;

      /*------------------------------------------------------------------------*/

      /**
       * Creates a map cache object to store key-value pairs.
       *
       * @private
       * @constructor
       * @param {Array} [entries] The key-value pairs to cache.
       */
      function MapCache(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;

        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      /**
       * Removes all key-value entries from the map.
       *
       * @private
       * @name clear
       * @memberOf MapCache
       */
      function mapCacheClear() {
        this.size = 0;
        this.__data__ = {
          'hash': new Hash,
          'map': new (Map || ListCache),
          'string': new Hash
        };
      }

      /**
       * Removes `key` and its value from the map.
       *
       * @private
       * @name delete
       * @memberOf MapCache
       * @param {string} key The key of the value to remove.
       * @returns {boolean} Returns `true` if the entry was removed, else `false`.
       */
      function mapCacheDelete(key) {
        var result = getMapData(this, key)['delete'](key);
        this.size -= result ? 1 : 0;
        return result;
      }

      /**
       * Gets the map value for `key`.
       *
       * @private
       * @name get
       * @memberOf MapCache
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function mapCacheGet(key) {
        return getMapData(this, key).get(key);
      }

      /**
       * Checks if a map value for `key` exists.
       *
       * @private
       * @name has
       * @memberOf MapCache
       * @param {string} key The key of the entry to check.
       * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
       */
      function mapCacheHas(key) {
        return getMapData(this, key).has(key);
      }

      /**
       * Sets the map `key` to `value`.
       *
       * @private
       * @name set
       * @memberOf MapCache
       * @param {string} key The key of the value to set.
       * @param {*} value The value to set.
       * @returns {Object} Returns the map cache instance.
       */
      function mapCacheSet(key, value) {
        var data = getMapData(this, key),
            size = data.size;

        data.set(key, value);
        this.size += data.size == size ? 0 : 1;
        return this;
      }

      // Add methods to `MapCache`.
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype['delete'] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;

      /*------------------------------------------------------------------------*/

      /**
       *
       * Creates an array cache object to store unique values.
       *
       * @private
       * @constructor
       * @param {Array} [values] The values to cache.
       */
      function SetCache(values) {
        var index = -1,
            length = values == null ? 0 : values.length;

        this.__data__ = new MapCache;
        while (++index < length) {
          this.add(values[index]);
        }
      }

      /**
       * Adds `value` to the array cache.
       *
       * @private
       * @name add
       * @memberOf SetCache
       * @alias push
       * @param {*} value The value to cache.
       * @returns {Object} Returns the cache instance.
       */
      function setCacheAdd(value) {
        this.__data__.set(value, HASH_UNDEFINED);
        return this;
      }

      /**
       * Checks if `value` is in the array cache.
       *
       * @private
       * @name has
       * @memberOf SetCache
       * @param {*} value The value to search for.
       * @returns {number} Returns `true` if `value` is found, else `false`.
       */
      function setCacheHas(value) {
        return this.__data__.has(value);
      }

      // Add methods to `SetCache`.
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;

      /*------------------------------------------------------------------------*/

      /**
       * Creates a stack cache object to store key-value pairs.
       *
       * @private
       * @constructor
       * @param {Array} [entries] The key-value pairs to cache.
       */
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }

      /**
       * Removes all key-value entries from the stack.
       *
       * @private
       * @name clear
       * @memberOf Stack
       */
      function stackClear() {
        this.__data__ = new ListCache;
        this.size = 0;
      }

      /**
       * Removes `key` and its value from the stack.
       *
       * @private
       * @name delete
       * @memberOf Stack
       * @param {string} key The key of the value to remove.
       * @returns {boolean} Returns `true` if the entry was removed, else `false`.
       */
      function stackDelete(key) {
        var data = this.__data__,
            result = data['delete'](key);

        this.size = data.size;
        return result;
      }

      /**
       * Gets the stack value for `key`.
       *
       * @private
       * @name get
       * @memberOf Stack
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function stackGet(key) {
        return this.__data__.get(key);
      }

      /**
       * Checks if a stack value for `key` exists.
       *
       * @private
       * @name has
       * @memberOf Stack
       * @param {string} key The key of the entry to check.
       * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
       */
      function stackHas(key) {
        return this.__data__.has(key);
      }

      /**
       * Sets the stack `key` to `value`.
       *
       * @private
       * @name set
       * @memberOf Stack
       * @param {string} key The key of the value to set.
       * @param {*} value The value to set.
       * @returns {Object} Returns the stack cache instance.
       */
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }

      // Add methods to `Stack`.
      Stack.prototype.clear = stackClear;
      Stack.prototype['delete'] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;

      /*------------------------------------------------------------------------*/

      /**
       * Creates an array of the enumerable property names of the array-like `value`.
       *
       * @private
       * @param {*} value The value to query.
       * @param {boolean} inherited Specify returning inherited property names.
       * @returns {Array} Returns the array of property names.
       */
      function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value),
            isArg = !isArr && isArguments(value),
            isBuff = !isArr && !isArg && isBuffer(value),
            isType = !isArr && !isArg && !isBuff && isTypedArray(value),
            skipIndexes = isArr || isArg || isBuff || isType,
            result = skipIndexes ? baseTimes(value.length, String) : [],
            length = result.length;

        for (var key in value) {
          if ((inherited || hasOwnProperty.call(value, key)) &&
              !(skipIndexes && (
                 // Safari 9 has enumerable `arguments.length` in strict mode.
                 key == 'length' ||
                 // Node.js 0.10 has enumerable non-index properties on buffers.
                 (isBuff && (key == 'offset' || key == 'parent')) ||
                 // PhantomJS 2 has enumerable non-index properties on typed arrays.
                 (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
                 // Skip index properties.
                 isIndex(key, length)
              ))) {
            result.push(key);
          }
        }
        return result;
      }

      /**
       * A specialized version of `_.sample` for arrays.
       *
       * @private
       * @param {Array} array The array to sample.
       * @returns {*} Returns the random element.
       */
      function arraySample(array) {
        var length = array.length;
        return length ? array[baseRandom(0, length - 1)] : undefined$1;
      }

      /**
       * A specialized version of `_.sampleSize` for arrays.
       *
       * @private
       * @param {Array} array The array to sample.
       * @param {number} n The number of elements to sample.
       * @returns {Array} Returns the random elements.
       */
      function arraySampleSize(array, n) {
        return shuffleSelf(copyArray(array), baseClamp(n, 0, array.length));
      }

      /**
       * A specialized version of `_.shuffle` for arrays.
       *
       * @private
       * @param {Array} array The array to shuffle.
       * @returns {Array} Returns the new shuffled array.
       */
      function arrayShuffle(array) {
        return shuffleSelf(copyArray(array));
      }

      /**
       * This function is like `assignValue` except that it doesn't assign
       * `undefined` values.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {string} key The key of the property to assign.
       * @param {*} value The value to assign.
       */
      function assignMergeValue(object, key, value) {
        if ((value !== undefined$1 && !eq(object[key], value)) ||
            (value === undefined$1 && !(key in object))) {
          baseAssignValue(object, key, value);
        }
      }

      /**
       * Assigns `value` to `key` of `object` if the existing value is not equivalent
       * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {string} key The key of the property to assign.
       * @param {*} value The value to assign.
       */
      function assignValue(object, key, value) {
        var objValue = object[key];
        if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
            (value === undefined$1 && !(key in object))) {
          baseAssignValue(object, key, value);
        }
      }

      /**
       * Gets the index at which the `key` is found in `array` of key-value pairs.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {*} key The key to search for.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
      function assocIndexOf(array, key) {
        var length = array.length;
        while (length--) {
          if (eq(array[length][0], key)) {
            return length;
          }
        }
        return -1;
      }

      /**
       * Aggregates elements of `collection` on `accumulator` with keys transformed
       * by `iteratee` and values set by `setter`.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} setter The function to set `accumulator` values.
       * @param {Function} iteratee The iteratee to transform keys.
       * @param {Object} accumulator The initial aggregated object.
       * @returns {Function} Returns `accumulator`.
       */
      function baseAggregator(collection, setter, iteratee, accumulator) {
        baseEach(collection, function(value, key, collection) {
          setter(accumulator, value, iteratee(value), collection);
        });
        return accumulator;
      }

      /**
       * The base implementation of `_.assign` without support for multiple sources
       * or `customizer` functions.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @returns {Object} Returns `object`.
       */
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }

      /**
       * The base implementation of `_.assignIn` without support for multiple sources
       * or `customizer` functions.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @returns {Object} Returns `object`.
       */
      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn(source), object);
      }

      /**
       * The base implementation of `assignValue` and `assignMergeValue` without
       * value checks.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {string} key The key of the property to assign.
       * @param {*} value The value to assign.
       */
      function baseAssignValue(object, key, value) {
        if (key == '__proto__' && defineProperty) {
          defineProperty(object, key, {
            'configurable': true,
            'enumerable': true,
            'value': value,
            'writable': true
          });
        } else {
          object[key] = value;
        }
      }

      /**
       * The base implementation of `_.at` without support for individual paths.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {string[]} paths The property paths to pick.
       * @returns {Array} Returns the picked elements.
       */
      function baseAt(object, paths) {
        var index = -1,
            length = paths.length,
            result = Array(length),
            skip = object == null;

        while (++index < length) {
          result[index] = skip ? undefined$1 : get(object, paths[index]);
        }
        return result;
      }

      /**
       * The base implementation of `_.clamp` which doesn't coerce arguments.
       *
       * @private
       * @param {number} number The number to clamp.
       * @param {number} [lower] The lower bound.
       * @param {number} upper The upper bound.
       * @returns {number} Returns the clamped number.
       */
      function baseClamp(number, lower, upper) {
        if (number === number) {
          if (upper !== undefined$1) {
            number = number <= upper ? number : upper;
          }
          if (lower !== undefined$1) {
            number = number >= lower ? number : lower;
          }
        }
        return number;
      }

      /**
       * The base implementation of `_.clone` and `_.cloneDeep` which tracks
       * traversed objects.
       *
       * @private
       * @param {*} value The value to clone.
       * @param {boolean} bitmask The bitmask flags.
       *  1 - Deep clone
       *  2 - Flatten inherited properties
       *  4 - Clone symbols
       * @param {Function} [customizer] The function to customize cloning.
       * @param {string} [key] The key of `value`.
       * @param {Object} [object] The parent object of `value`.
       * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
       * @returns {*} Returns the cloned value.
       */
      function baseClone(value, bitmask, customizer, key, object, stack) {
        var result,
            isDeep = bitmask & CLONE_DEEP_FLAG,
            isFlat = bitmask & CLONE_FLAT_FLAG,
            isFull = bitmask & CLONE_SYMBOLS_FLAG;

        if (customizer) {
          result = object ? customizer(value, key, object, stack) : customizer(value);
        }
        if (result !== undefined$1) {
          return result;
        }
        if (!isObject(value)) {
          return value;
        }
        var isArr = isArray(value);
        if (isArr) {
          result = initCloneArray(value);
          if (!isDeep) {
            return copyArray(value, result);
          }
        } else {
          var tag = getTag(value),
              isFunc = tag == funcTag || tag == genTag;

          if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
          }
          if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
            result = (isFlat || isFunc) ? {} : initCloneObject(value);
            if (!isDeep) {
              return isFlat
                ? copySymbolsIn(value, baseAssignIn(result, value))
                : copySymbols(value, baseAssign(result, value));
            }
          } else {
            if (!cloneableTags[tag]) {
              return object ? value : {};
            }
            result = initCloneByTag(value, tag, isDeep);
          }
        }
        // Check for circular references and return its corresponding clone.
        stack || (stack = new Stack);
        var stacked = stack.get(value);
        if (stacked) {
          return stacked;
        }
        stack.set(value, result);

        if (isSet(value)) {
          value.forEach(function(subValue) {
            result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
          });
        } else if (isMap(value)) {
          value.forEach(function(subValue, key) {
            result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
          });
        }

        var keysFunc = isFull
          ? (isFlat ? getAllKeysIn : getAllKeys)
          : (isFlat ? keysIn : keys);

        var props = isArr ? undefined$1 : keysFunc(value);
        arrayEach(props || value, function(subValue, key) {
          if (props) {
            key = subValue;
            subValue = value[key];
          }
          // Recursively populate clone (susceptible to call stack limits).
          assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
        return result;
      }

      /**
       * The base implementation of `_.conforms` which doesn't clone `source`.
       *
       * @private
       * @param {Object} source The object of property predicates to conform to.
       * @returns {Function} Returns the new spec function.
       */
      function baseConforms(source) {
        var props = keys(source);
        return function(object) {
          return baseConformsTo(object, source, props);
        };
      }

      /**
       * The base implementation of `_.conformsTo` which accepts `props` to check.
       *
       * @private
       * @param {Object} object The object to inspect.
       * @param {Object} source The object of property predicates to conform to.
       * @returns {boolean} Returns `true` if `object` conforms, else `false`.
       */
      function baseConformsTo(object, source, props) {
        var length = props.length;
        if (object == null) {
          return !length;
        }
        object = Object(object);
        while (length--) {
          var key = props[length],
              predicate = source[key],
              value = object[key];

          if ((value === undefined$1 && !(key in object)) || !predicate(value)) {
            return false;
          }
        }
        return true;
      }

      /**
       * The base implementation of `_.delay` and `_.defer` which accepts `args`
       * to provide to `func`.
       *
       * @private
       * @param {Function} func The function to delay.
       * @param {number} wait The number of milliseconds to delay invocation.
       * @param {Array} args The arguments to provide to `func`.
       * @returns {number|Object} Returns the timer id or timeout object.
       */
      function baseDelay(func, wait, args) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return setTimeout(function() { func.apply(undefined$1, args); }, wait);
      }

      /**
       * The base implementation of methods like `_.difference` without support
       * for excluding multiple arrays or iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {Array} values The values to exclude.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       */
      function baseDifference(array, values, iteratee, comparator) {
        var index = -1,
            includes = arrayIncludes,
            isCommon = true,
            length = array.length,
            result = [],
            valuesLength = values.length;

        if (!length) {
          return result;
        }
        if (iteratee) {
          values = arrayMap(values, baseUnary(iteratee));
        }
        if (comparator) {
          includes = arrayIncludesWith;
          isCommon = false;
        }
        else if (values.length >= LARGE_ARRAY_SIZE) {
          includes = cacheHas;
          isCommon = false;
          values = new SetCache(values);
        }
        outer:
        while (++index < length) {
          var value = array[index],
              computed = iteratee == null ? value : iteratee(value);

          value = (comparator || value !== 0) ? value : 0;
          if (isCommon && computed === computed) {
            var valuesIndex = valuesLength;
            while (valuesIndex--) {
              if (values[valuesIndex] === computed) {
                continue outer;
              }
            }
            result.push(value);
          }
          else if (!includes(values, computed, comparator)) {
            result.push(value);
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.forEach` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array|Object} Returns `collection`.
       */
      var baseEach = createBaseEach(baseForOwn);

      /**
       * The base implementation of `_.forEachRight` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array|Object} Returns `collection`.
       */
      var baseEachRight = createBaseEach(baseForOwnRight, true);

      /**
       * The base implementation of `_.every` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {boolean} Returns `true` if all elements pass the predicate check,
       *  else `false`
       */
      function baseEvery(collection, predicate) {
        var result = true;
        baseEach(collection, function(value, index, collection) {
          result = !!predicate(value, index, collection);
          return result;
        });
        return result;
      }

      /**
       * The base implementation of methods like `_.max` and `_.min` which accepts a
       * `comparator` to determine the extremum value.
       *
       * @private
       * @param {Array} array The array to iterate over.
       * @param {Function} iteratee The iteratee invoked per iteration.
       * @param {Function} comparator The comparator used to compare values.
       * @returns {*} Returns the extremum value.
       */
      function baseExtremum(array, iteratee, comparator) {
        var index = -1,
            length = array.length;

        while (++index < length) {
          var value = array[index],
              current = iteratee(value);

          if (current != null && (computed === undefined$1
                ? (current === current && !isSymbol(current))
                : comparator(current, computed)
              )) {
            var computed = current,
                result = value;
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.fill` without an iteratee call guard.
       *
       * @private
       * @param {Array} array The array to fill.
       * @param {*} value The value to fill `array` with.
       * @param {number} [start=0] The start position.
       * @param {number} [end=array.length] The end position.
       * @returns {Array} Returns `array`.
       */
      function baseFill(array, value, start, end) {
        var length = array.length;

        start = toInteger(start);
        if (start < 0) {
          start = -start > length ? 0 : (length + start);
        }
        end = (end === undefined$1 || end > length) ? length : toInteger(end);
        if (end < 0) {
          end += length;
        }
        end = start > end ? 0 : toLength(end);
        while (start < end) {
          array[start++] = value;
        }
        return array;
      }

      /**
       * The base implementation of `_.filter` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {Array} Returns the new filtered array.
       */
      function baseFilter(collection, predicate) {
        var result = [];
        baseEach(collection, function(value, index, collection) {
          if (predicate(value, index, collection)) {
            result.push(value);
          }
        });
        return result;
      }

      /**
       * The base implementation of `_.flatten` with support for restricting flattening.
       *
       * @private
       * @param {Array} array The array to flatten.
       * @param {number} depth The maximum recursion depth.
       * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
       * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
       * @param {Array} [result=[]] The initial result value.
       * @returns {Array} Returns the new flattened array.
       */
      function baseFlatten(array, depth, predicate, isStrict, result) {
        var index = -1,
            length = array.length;

        predicate || (predicate = isFlattenable);
        result || (result = []);

        while (++index < length) {
          var value = array[index];
          if (depth > 0 && predicate(value)) {
            if (depth > 1) {
              // Recursively flatten arrays (susceptible to call stack limits).
              baseFlatten(value, depth - 1, predicate, isStrict, result);
            } else {
              arrayPush(result, value);
            }
          } else if (!isStrict) {
            result[result.length] = value;
          }
        }
        return result;
      }

      /**
       * The base implementation of `baseForOwn` which iterates over `object`
       * properties returned by `keysFunc` and invokes `iteratee` for each property.
       * Iteratee functions may exit iteration early by explicitly returning `false`.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @param {Function} keysFunc The function to get the keys of `object`.
       * @returns {Object} Returns `object`.
       */
      var baseFor = createBaseFor();

      /**
       * This function is like `baseFor` except that it iterates over properties
       * in the opposite order.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @param {Function} keysFunc The function to get the keys of `object`.
       * @returns {Object} Returns `object`.
       */
      var baseForRight = createBaseFor(true);

      /**
       * The base implementation of `_.forOwn` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Object} Returns `object`.
       */
      function baseForOwn(object, iteratee) {
        return object && baseFor(object, iteratee, keys);
      }

      /**
       * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Object} Returns `object`.
       */
      function baseForOwnRight(object, iteratee) {
        return object && baseForRight(object, iteratee, keys);
      }

      /**
       * The base implementation of `_.functions` which creates an array of
       * `object` function property names filtered from `props`.
       *
       * @private
       * @param {Object} object The object to inspect.
       * @param {Array} props The property names to filter.
       * @returns {Array} Returns the function names.
       */
      function baseFunctions(object, props) {
        return arrayFilter(props, function(key) {
          return isFunction(object[key]);
        });
      }

      /**
       * The base implementation of `_.get` without support for default values.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the property to get.
       * @returns {*} Returns the resolved value.
       */
      function baseGet(object, path) {
        path = castPath(path, object);

        var index = 0,
            length = path.length;

        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return (index && index == length) ? object : undefined$1;
      }

      /**
       * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
       * `keysFunc` and `symbolsFunc` to get the enumerable property names and
       * symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Function} keysFunc The function to get the keys of `object`.
       * @param {Function} symbolsFunc The function to get the symbols of `object`.
       * @returns {Array} Returns the array of property names and symbols.
       */
      function baseGetAllKeys(object, keysFunc, symbolsFunc) {
        var result = keysFunc(object);
        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
      }

      /**
       * The base implementation of `getTag` without fallbacks for buggy environments.
       *
       * @private
       * @param {*} value The value to query.
       * @returns {string} Returns the `toStringTag`.
       */
      function baseGetTag(value) {
        if (value == null) {
          return value === undefined$1 ? undefinedTag : nullTag;
        }
        return (symToStringTag && symToStringTag in Object(value))
          ? getRawTag(value)
          : objectToString(value);
      }

      /**
       * The base implementation of `_.gt` which doesn't coerce arguments.
       *
       * @private
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is greater than `other`,
       *  else `false`.
       */
      function baseGt(value, other) {
        return value > other;
      }

      /**
       * The base implementation of `_.has` without support for deep paths.
       *
       * @private
       * @param {Object} [object] The object to query.
       * @param {Array|string} key The key to check.
       * @returns {boolean} Returns `true` if `key` exists, else `false`.
       */
      function baseHas(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      }

      /**
       * The base implementation of `_.hasIn` without support for deep paths.
       *
       * @private
       * @param {Object} [object] The object to query.
       * @param {Array|string} key The key to check.
       * @returns {boolean} Returns `true` if `key` exists, else `false`.
       */
      function baseHasIn(object, key) {
        return object != null && key in Object(object);
      }

      /**
       * The base implementation of `_.inRange` which doesn't coerce arguments.
       *
       * @private
       * @param {number} number The number to check.
       * @param {number} start The start of the range.
       * @param {number} end The end of the range.
       * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
       */
      function baseInRange(number, start, end) {
        return number >= nativeMin(start, end) && number < nativeMax(start, end);
      }

      /**
       * The base implementation of methods like `_.intersection`, without support
       * for iteratee shorthands, that accepts an array of arrays to inspect.
       *
       * @private
       * @param {Array} arrays The arrays to inspect.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of shared values.
       */
      function baseIntersection(arrays, iteratee, comparator) {
        var includes = comparator ? arrayIncludesWith : arrayIncludes,
            length = arrays[0].length,
            othLength = arrays.length,
            othIndex = othLength,
            caches = Array(othLength),
            maxLength = Infinity,
            result = [];

        while (othIndex--) {
          var array = arrays[othIndex];
          if (othIndex && iteratee) {
            array = arrayMap(array, baseUnary(iteratee));
          }
          maxLength = nativeMin(array.length, maxLength);
          caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120))
            ? new SetCache(othIndex && array)
            : undefined$1;
        }
        array = arrays[0];

        var index = -1,
            seen = caches[0];

        outer:
        while (++index < length && result.length < maxLength) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          value = (comparator || value !== 0) ? value : 0;
          if (!(seen
                ? cacheHas(seen, computed)
                : includes(result, computed, comparator)
              )) {
            othIndex = othLength;
            while (--othIndex) {
              var cache = caches[othIndex];
              if (!(cache
                    ? cacheHas(cache, computed)
                    : includes(arrays[othIndex], computed, comparator))
                  ) {
                continue outer;
              }
            }
            if (seen) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.invert` and `_.invertBy` which inverts
       * `object` with values transformed by `iteratee` and set by `setter`.
       *
       * @private
       * @param {Object} object The object to iterate over.
       * @param {Function} setter The function to set `accumulator` values.
       * @param {Function} iteratee The iteratee to transform values.
       * @param {Object} accumulator The initial inverted object.
       * @returns {Function} Returns `accumulator`.
       */
      function baseInverter(object, setter, iteratee, accumulator) {
        baseForOwn(object, function(value, key, object) {
          setter(accumulator, iteratee(value), key, object);
        });
        return accumulator;
      }

      /**
       * The base implementation of `_.invoke` without support for individual
       * method arguments.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the method to invoke.
       * @param {Array} args The arguments to invoke the method with.
       * @returns {*} Returns the result of the invoked method.
       */
      function baseInvoke(object, path, args) {
        path = castPath(path, object);
        object = parent(object, path);
        var func = object == null ? object : object[toKey(last(path))];
        return func == null ? undefined$1 : apply(func, object, args);
      }

      /**
       * The base implementation of `_.isArguments`.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an `arguments` object,
       */
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }

      /**
       * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
       */
      function baseIsArrayBuffer(value) {
        return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
      }

      /**
       * The base implementation of `_.isDate` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
       */
      function baseIsDate(value) {
        return isObjectLike(value) && baseGetTag(value) == dateTag;
      }

      /**
       * The base implementation of `_.isEqual` which supports partial comparisons
       * and tracks traversed objects.
       *
       * @private
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @param {boolean} bitmask The bitmask flags.
       *  1 - Unordered comparison
       *  2 - Partial comparison
       * @param {Function} [customizer] The function to customize comparisons.
       * @param {Object} [stack] Tracks traversed `value` and `other` objects.
       * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
       */
      function baseIsEqual(value, other, bitmask, customizer, stack) {
        if (value === other) {
          return true;
        }
        if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
          return value !== value && other !== other;
        }
        return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
      }

      /**
       * A specialized version of `baseIsEqual` for arrays and objects which performs
       * deep comparisons and tracks traversed objects enabling objects with circular
       * references to be compared.
       *
       * @private
       * @param {Object} object The object to compare.
       * @param {Object} other The other object to compare.
       * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
       * @param {Function} customizer The function to customize comparisons.
       * @param {Function} equalFunc The function to determine equivalents of values.
       * @param {Object} [stack] Tracks traversed `object` and `other` objects.
       * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
       */
      function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
        var objIsArr = isArray(object),
            othIsArr = isArray(other),
            objTag = objIsArr ? arrayTag : getTag(object),
            othTag = othIsArr ? arrayTag : getTag(other);

        objTag = objTag == argsTag ? objectTag : objTag;
        othTag = othTag == argsTag ? objectTag : othTag;

        var objIsObj = objTag == objectTag,
            othIsObj = othTag == objectTag,
            isSameTag = objTag == othTag;

        if (isSameTag && isBuffer(object)) {
          if (!isBuffer(other)) {
            return false;
          }
          objIsArr = true;
          objIsObj = false;
        }
        if (isSameTag && !objIsObj) {
          stack || (stack = new Stack);
          return (objIsArr || isTypedArray(object))
            ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
            : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
        }
        if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
          var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
              othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

          if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object,
                othUnwrapped = othIsWrapped ? other.value() : other;

            stack || (stack = new Stack);
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
          }
        }
        if (!isSameTag) {
          return false;
        }
        stack || (stack = new Stack);
        return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
      }

      /**
       * The base implementation of `_.isMap` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a map, else `false`.
       */
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }

      /**
       * The base implementation of `_.isMatch` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The object to inspect.
       * @param {Object} source The object of property values to match.
       * @param {Array} matchData The property names, values, and compare flags to match.
       * @param {Function} [customizer] The function to customize comparisons.
       * @returns {boolean} Returns `true` if `object` is a match, else `false`.
       */
      function baseIsMatch(object, source, matchData, customizer) {
        var index = matchData.length,
            length = index,
            noCustomizer = !customizer;

        if (object == null) {
          return !length;
        }
        object = Object(object);
        while (index--) {
          var data = matchData[index];
          if ((noCustomizer && data[2])
                ? data[1] !== object[data[0]]
                : !(data[0] in object)
              ) {
            return false;
          }
        }
        while (++index < length) {
          data = matchData[index];
          var key = data[0],
              objValue = object[key],
              srcValue = data[1];

          if (noCustomizer && data[2]) {
            if (objValue === undefined$1 && !(key in object)) {
              return false;
            }
          } else {
            var stack = new Stack;
            if (customizer) {
              var result = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result === undefined$1
                  ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack)
                  : result
                )) {
              return false;
            }
          }
        }
        return true;
      }

      /**
       * The base implementation of `_.isNative` without bad shim checks.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a native function,
       *  else `false`.
       */
      function baseIsNative(value) {
        if (!isObject(value) || isMasked(value)) {
          return false;
        }
        var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
        return pattern.test(toSource(value));
      }

      /**
       * The base implementation of `_.isRegExp` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
       */
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }

      /**
       * The base implementation of `_.isSet` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a set, else `false`.
       */
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }

      /**
       * The base implementation of `_.isTypedArray` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
       */
      function baseIsTypedArray(value) {
        return isObjectLike(value) &&
          isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
      }

      /**
       * The base implementation of `_.iteratee`.
       *
       * @private
       * @param {*} [value=_.identity] The value to convert to an iteratee.
       * @returns {Function} Returns the iteratee.
       */
      function baseIteratee(value) {
        // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
        // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
        if (typeof value == 'function') {
          return value;
        }
        if (value == null) {
          return identity;
        }
        if (typeof value == 'object') {
          return isArray(value)
            ? baseMatchesProperty(value[0], value[1])
            : baseMatches(value);
        }
        return property(value);
      }

      /**
       * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       */
      function baseKeys(object) {
        if (!isPrototype(object)) {
          return nativeKeys(object);
        }
        var result = [];
        for (var key in Object(object)) {
          if (hasOwnProperty.call(object, key) && key != 'constructor') {
            result.push(key);
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       */
      function baseKeysIn(object) {
        if (!isObject(object)) {
          return nativeKeysIn(object);
        }
        var isProto = isPrototype(object),
            result = [];

        for (var key in object) {
          if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
            result.push(key);
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.lt` which doesn't coerce arguments.
       *
       * @private
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is less than `other`,
       *  else `false`.
       */
      function baseLt(value, other) {
        return value < other;
      }

      /**
       * The base implementation of `_.map` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} iteratee The function invoked per iteration.
       * @returns {Array} Returns the new mapped array.
       */
      function baseMap(collection, iteratee) {
        var index = -1,
            result = isArrayLike(collection) ? Array(collection.length) : [];

        baseEach(collection, function(value, key, collection) {
          result[++index] = iteratee(value, key, collection);
        });
        return result;
      }

      /**
       * The base implementation of `_.matches` which doesn't clone `source`.
       *
       * @private
       * @param {Object} source The object of property values to match.
       * @returns {Function} Returns the new spec function.
       */
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }

      /**
       * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
       *
       * @private
       * @param {string} path The path of the property to get.
       * @param {*} srcValue The value to match.
       * @returns {Function} Returns the new spec function.
       */
      function baseMatchesProperty(path, srcValue) {
        if (isKey(path) && isStrictComparable(srcValue)) {
          return matchesStrictComparable(toKey(path), srcValue);
        }
        return function(object) {
          var objValue = get(object, path);
          return (objValue === undefined$1 && objValue === srcValue)
            ? hasIn(object, path)
            : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
        };
      }

      /**
       * The base implementation of `_.merge` without support for multiple sources.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @param {number} srcIndex The index of `source`.
       * @param {Function} [customizer] The function to customize merged values.
       * @param {Object} [stack] Tracks traversed source values and their merged
       *  counterparts.
       */
      function baseMerge(object, source, srcIndex, customizer, stack) {
        if (object === source) {
          return;
        }
        baseFor(source, function(srcValue, key) {
          stack || (stack = new Stack);
          if (isObject(srcValue)) {
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
          }
          else {
            var newValue = customizer
              ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
              : undefined$1;

            if (newValue === undefined$1) {
              newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
          }
        }, keysIn);
      }

      /**
       * A specialized version of `baseMerge` for arrays and objects which performs
       * deep merges and tracks traversed objects enabling objects with circular
       * references to be merged.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @param {string} key The key of the value to merge.
       * @param {number} srcIndex The index of `source`.
       * @param {Function} mergeFunc The function to merge values.
       * @param {Function} [customizer] The function to customize assigned values.
       * @param {Object} [stack] Tracks traversed source values and their merged
       *  counterparts.
       */
      function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
        var objValue = safeGet(object, key),
            srcValue = safeGet(source, key),
            stacked = stack.get(srcValue);

        if (stacked) {
          assignMergeValue(object, key, stacked);
          return;
        }
        var newValue = customizer
          ? customizer(objValue, srcValue, (key + ''), object, source, stack)
          : undefined$1;

        var isCommon = newValue === undefined$1;

        if (isCommon) {
          var isArr = isArray(srcValue),
              isBuff = !isArr && isBuffer(srcValue),
              isTyped = !isArr && !isBuff && isTypedArray(srcValue);

          newValue = srcValue;
          if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
              newValue = objValue;
            }
            else if (isArrayLikeObject(objValue)) {
              newValue = copyArray(objValue);
            }
            else if (isBuff) {
              isCommon = false;
              newValue = cloneBuffer(srcValue, true);
            }
            else if (isTyped) {
              isCommon = false;
              newValue = cloneTypedArray(srcValue, true);
            }
            else {
              newValue = [];
            }
          }
          else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
              newValue = toPlainObject(objValue);
            }
            else if (!isObject(objValue) || isFunction(objValue)) {
              newValue = initCloneObject(srcValue);
            }
          }
          else {
            isCommon = false;
          }
        }
        if (isCommon) {
          // Recursively merge objects and arrays (susceptible to call stack limits).
          stack.set(srcValue, newValue);
          mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
          stack['delete'](srcValue);
        }
        assignMergeValue(object, key, newValue);
      }

      /**
       * The base implementation of `_.nth` which doesn't coerce arguments.
       *
       * @private
       * @param {Array} array The array to query.
       * @param {number} n The index of the element to return.
       * @returns {*} Returns the nth element of `array`.
       */
      function baseNth(array, n) {
        var length = array.length;
        if (!length) {
          return;
        }
        n += n < 0 ? length : 0;
        return isIndex(n, length) ? array[n] : undefined$1;
      }

      /**
       * The base implementation of `_.orderBy` without param guards.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
       * @param {string[]} orders The sort orders of `iteratees`.
       * @returns {Array} Returns the new sorted array.
       */
      function baseOrderBy(collection, iteratees, orders) {
        var index = -1;
        iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(getIteratee()));

        var result = baseMap(collection, function(value, key, collection) {
          var criteria = arrayMap(iteratees, function(iteratee) {
            return iteratee(value);
          });
          return { 'criteria': criteria, 'index': ++index, 'value': value };
        });

        return baseSortBy(result, function(object, other) {
          return compareMultiple(object, other, orders);
        });
      }

      /**
       * The base implementation of `_.pick` without support for individual
       * property identifiers.
       *
       * @private
       * @param {Object} object The source object.
       * @param {string[]} paths The property paths to pick.
       * @returns {Object} Returns the new object.
       */
      function basePick(object, paths) {
        return basePickBy(object, paths, function(value, path) {
          return hasIn(object, path);
        });
      }

      /**
       * The base implementation of  `_.pickBy` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The source object.
       * @param {string[]} paths The property paths to pick.
       * @param {Function} predicate The function invoked per property.
       * @returns {Object} Returns the new object.
       */
      function basePickBy(object, paths, predicate) {
        var index = -1,
            length = paths.length,
            result = {};

        while (++index < length) {
          var path = paths[index],
              value = baseGet(object, path);

          if (predicate(value, path)) {
            baseSet(result, castPath(path, object), value);
          }
        }
        return result;
      }

      /**
       * A specialized version of `baseProperty` which supports deep paths.
       *
       * @private
       * @param {Array|string} path The path of the property to get.
       * @returns {Function} Returns the new accessor function.
       */
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }

      /**
       * The base implementation of `_.pullAllBy` without support for iteratee
       * shorthands.
       *
       * @private
       * @param {Array} array The array to modify.
       * @param {Array} values The values to remove.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns `array`.
       */
      function basePullAll(array, values, iteratee, comparator) {
        var indexOf = comparator ? baseIndexOfWith : baseIndexOf,
            index = -1,
            length = values.length,
            seen = array;

        if (array === values) {
          values = copyArray(values);
        }
        if (iteratee) {
          seen = arrayMap(array, baseUnary(iteratee));
        }
        while (++index < length) {
          var fromIndex = 0,
              value = values[index],
              computed = iteratee ? iteratee(value) : value;

          while ((fromIndex = indexOf(seen, computed, fromIndex, comparator)) > -1) {
            if (seen !== array) {
              splice.call(seen, fromIndex, 1);
            }
            splice.call(array, fromIndex, 1);
          }
        }
        return array;
      }

      /**
       * The base implementation of `_.pullAt` without support for individual
       * indexes or capturing the removed elements.
       *
       * @private
       * @param {Array} array The array to modify.
       * @param {number[]} indexes The indexes of elements to remove.
       * @returns {Array} Returns `array`.
       */
      function basePullAt(array, indexes) {
        var length = array ? indexes.length : 0,
            lastIndex = length - 1;

        while (length--) {
          var index = indexes[length];
          if (length == lastIndex || index !== previous) {
            var previous = index;
            if (isIndex(index)) {
              splice.call(array, index, 1);
            } else {
              baseUnset(array, index);
            }
          }
        }
        return array;
      }

      /**
       * The base implementation of `_.random` without support for returning
       * floating-point numbers.
       *
       * @private
       * @param {number} lower The lower bound.
       * @param {number} upper The upper bound.
       * @returns {number} Returns the random number.
       */
      function baseRandom(lower, upper) {
        return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
      }

      /**
       * The base implementation of `_.range` and `_.rangeRight` which doesn't
       * coerce arguments.
       *
       * @private
       * @param {number} start The start of the range.
       * @param {number} end The end of the range.
       * @param {number} step The value to increment or decrement by.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Array} Returns the range of numbers.
       */
      function baseRange(start, end, step, fromRight) {
        var index = -1,
            length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
            result = Array(length);

        while (length--) {
          result[fromRight ? length : ++index] = start;
          start += step;
        }
        return result;
      }

      /**
       * The base implementation of `_.repeat` which doesn't coerce arguments.
       *
       * @private
       * @param {string} string The string to repeat.
       * @param {number} n The number of times to repeat the string.
       * @returns {string} Returns the repeated string.
       */
      function baseRepeat(string, n) {
        var result = '';
        if (!string || n < 1 || n > MAX_SAFE_INTEGER) {
          return result;
        }
        // Leverage the exponentiation by squaring algorithm for a faster repeat.
        // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
        do {
          if (n % 2) {
            result += string;
          }
          n = nativeFloor(n / 2);
          if (n) {
            string += string;
          }
        } while (n);

        return result;
      }

      /**
       * The base implementation of `_.rest` which doesn't validate or coerce arguments.
       *
       * @private
       * @param {Function} func The function to apply a rest parameter to.
       * @param {number} [start=func.length-1] The start position of the rest parameter.
       * @returns {Function} Returns the new function.
       */
      function baseRest(func, start) {
        return setToString(overRest(func, start, identity), func + '');
      }

      /**
       * The base implementation of `_.sample`.
       *
       * @private
       * @param {Array|Object} collection The collection to sample.
       * @returns {*} Returns the random element.
       */
      function baseSample(collection) {
        return arraySample(values(collection));
      }

      /**
       * The base implementation of `_.sampleSize` without param guards.
       *
       * @private
       * @param {Array|Object} collection The collection to sample.
       * @param {number} n The number of elements to sample.
       * @returns {Array} Returns the random elements.
       */
      function baseSampleSize(collection, n) {
        var array = values(collection);
        return shuffleSelf(array, baseClamp(n, 0, array.length));
      }

      /**
       * The base implementation of `_.set`.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to set.
       * @param {*} value The value to set.
       * @param {Function} [customizer] The function to customize path creation.
       * @returns {Object} Returns `object`.
       */
      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }
        path = castPath(path, object);

        var index = -1,
            length = path.length,
            lastIndex = length - 1,
            nested = object;

        while (nested != null && ++index < length) {
          var key = toKey(path[index]),
              newValue = value;

          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined$1;
            if (newValue === undefined$1) {
              newValue = isObject(objValue)
                ? objValue
                : (isIndex(path[index + 1]) ? [] : {});
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }

      /**
       * The base implementation of `setData` without support for hot loop shorting.
       *
       * @private
       * @param {Function} func The function to associate metadata with.
       * @param {*} data The metadata.
       * @returns {Function} Returns `func`.
       */
      var baseSetData = !metaMap ? identity : function(func, data) {
        metaMap.set(func, data);
        return func;
      };

      /**
       * The base implementation of `setToString` without support for hot loop shorting.
       *
       * @private
       * @param {Function} func The function to modify.
       * @param {Function} string The `toString` result.
       * @returns {Function} Returns `func`.
       */
      var baseSetToString = !defineProperty ? identity : function(func, string) {
        return defineProperty(func, 'toString', {
          'configurable': true,
          'enumerable': false,
          'value': constant(string),
          'writable': true
        });
      };

      /**
       * The base implementation of `_.shuffle`.
       *
       * @private
       * @param {Array|Object} collection The collection to shuffle.
       * @returns {Array} Returns the new shuffled array.
       */
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }

      /**
       * The base implementation of `_.slice` without an iteratee call guard.
       *
       * @private
       * @param {Array} array The array to slice.
       * @param {number} [start=0] The start position.
       * @param {number} [end=array.length] The end position.
       * @returns {Array} Returns the slice of `array`.
       */
      function baseSlice(array, start, end) {
        var index = -1,
            length = array.length;

        if (start < 0) {
          start = -start > length ? 0 : (length + start);
        }
        end = end > length ? length : end;
        if (end < 0) {
          end += length;
        }
        length = start > end ? 0 : ((end - start) >>> 0);
        start >>>= 0;

        var result = Array(length);
        while (++index < length) {
          result[index] = array[index + start];
        }
        return result;
      }

      /**
       * The base implementation of `_.some` without support for iteratee shorthands.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} predicate The function invoked per iteration.
       * @returns {boolean} Returns `true` if any element passes the predicate check,
       *  else `false`.
       */
      function baseSome(collection, predicate) {
        var result;

        baseEach(collection, function(value, index, collection) {
          result = predicate(value, index, collection);
          return !result;
        });
        return !!result;
      }

      /**
       * The base implementation of `_.sortedIndex` and `_.sortedLastIndex` which
       * performs a binary search of `array` to determine the index at which `value`
       * should be inserted into `array` in order to maintain its sort order.
       *
       * @private
       * @param {Array} array The sorted array to inspect.
       * @param {*} value The value to evaluate.
       * @param {boolean} [retHighest] Specify returning the highest qualified index.
       * @returns {number} Returns the index at which `value` should be inserted
       *  into `array`.
       */
      function baseSortedIndex(array, value, retHighest) {
        var low = 0,
            high = array == null ? low : array.length;

        if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
          while (low < high) {
            var mid = (low + high) >>> 1,
                computed = array[mid];

            if (computed !== null && !isSymbol(computed) &&
                (retHighest ? (computed <= value) : (computed < value))) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return high;
        }
        return baseSortedIndexBy(array, value, identity, retHighest);
      }

      /**
       * The base implementation of `_.sortedIndexBy` and `_.sortedLastIndexBy`
       * which invokes `iteratee` for `value` and each element of `array` to compute
       * their sort ranking. The iteratee is invoked with one argument; (value).
       *
       * @private
       * @param {Array} array The sorted array to inspect.
       * @param {*} value The value to evaluate.
       * @param {Function} iteratee The iteratee invoked per element.
       * @param {boolean} [retHighest] Specify returning the highest qualified index.
       * @returns {number} Returns the index at which `value` should be inserted
       *  into `array`.
       */
      function baseSortedIndexBy(array, value, iteratee, retHighest) {
        value = iteratee(value);

        var low = 0,
            high = array == null ? 0 : array.length,
            valIsNaN = value !== value,
            valIsNull = value === null,
            valIsSymbol = isSymbol(value),
            valIsUndefined = value === undefined$1;

        while (low < high) {
          var mid = nativeFloor((low + high) / 2),
              computed = iteratee(array[mid]),
              othIsDefined = computed !== undefined$1,
              othIsNull = computed === null,
              othIsReflexive = computed === computed,
              othIsSymbol = isSymbol(computed);

          if (valIsNaN) {
            var setLow = retHighest || othIsReflexive;
          } else if (valIsUndefined) {
            setLow = othIsReflexive && (retHighest || othIsDefined);
          } else if (valIsNull) {
            setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
          } else if (valIsSymbol) {
            setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
          } else if (othIsNull || othIsSymbol) {
            setLow = false;
          } else {
            setLow = retHighest ? (computed <= value) : (computed < value);
          }
          if (setLow) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return nativeMin(high, MAX_ARRAY_INDEX);
      }

      /**
       * The base implementation of `_.sortedUniq` and `_.sortedUniqBy` without
       * support for iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @returns {Array} Returns the new duplicate free array.
       */
      function baseSortedUniq(array, iteratee) {
        var index = -1,
            length = array.length,
            resIndex = 0,
            result = [];

        while (++index < length) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          if (!index || !eq(computed, seen)) {
            var seen = computed;
            result[resIndex++] = value === 0 ? 0 : value;
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.toNumber` which doesn't ensure correct
       * conversions of binary, hexadecimal, or octal string values.
       *
       * @private
       * @param {*} value The value to process.
       * @returns {number} Returns the number.
       */
      function baseToNumber(value) {
        if (typeof value == 'number') {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        return +value;
      }

      /**
       * The base implementation of `_.toString` which doesn't convert nullish
       * values to empty strings.
       *
       * @private
       * @param {*} value The value to process.
       * @returns {string} Returns the string.
       */
      function baseToString(value) {
        // Exit early for strings to avoid a performance hit in some environments.
        if (typeof value == 'string') {
          return value;
        }
        if (isArray(value)) {
          // Recursively convert values (susceptible to call stack limits).
          return arrayMap(value, baseToString) + '';
        }
        if (isSymbol(value)) {
          return symbolToString ? symbolToString.call(value) : '';
        }
        var result = (value + '');
        return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
      }

      /**
       * The base implementation of `_.uniqBy` without support for iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new duplicate free array.
       */
      function baseUniq(array, iteratee, comparator) {
        var index = -1,
            includes = arrayIncludes,
            length = array.length,
            isCommon = true,
            result = [],
            seen = result;

        if (comparator) {
          isCommon = false;
          includes = arrayIncludesWith;
        }
        else if (length >= LARGE_ARRAY_SIZE) {
          var set = iteratee ? null : createSet(array);
          if (set) {
            return setToArray(set);
          }
          isCommon = false;
          includes = cacheHas;
          seen = new SetCache;
        }
        else {
          seen = iteratee ? [] : result;
        }
        outer:
        while (++index < length) {
          var value = array[index],
              computed = iteratee ? iteratee(value) : value;

          value = (comparator || value !== 0) ? value : 0;
          if (isCommon && computed === computed) {
            var seenIndex = seen.length;
            while (seenIndex--) {
              if (seen[seenIndex] === computed) {
                continue outer;
              }
            }
            if (iteratee) {
              seen.push(computed);
            }
            result.push(value);
          }
          else if (!includes(seen, computed, comparator)) {
            if (seen !== result) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
        return result;
      }

      /**
       * The base implementation of `_.unset`.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {Array|string} path The property path to unset.
       * @returns {boolean} Returns `true` if the property is deleted, else `false`.
       */
      function baseUnset(object, path) {
        path = castPath(path, object);
        object = parent(object, path);
        return object == null || delete object[toKey(last(path))];
      }

      /**
       * The base implementation of `_.update`.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to update.
       * @param {Function} updater The function to produce the updated value.
       * @param {Function} [customizer] The function to customize path creation.
       * @returns {Object} Returns `object`.
       */
      function baseUpdate(object, path, updater, customizer) {
        return baseSet(object, path, updater(baseGet(object, path)), customizer);
      }

      /**
       * The base implementation of methods like `_.dropWhile` and `_.takeWhile`
       * without support for iteratee shorthands.
       *
       * @private
       * @param {Array} array The array to query.
       * @param {Function} predicate The function invoked per iteration.
       * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Array} Returns the slice of `array`.
       */
      function baseWhile(array, predicate, isDrop, fromRight) {
        var length = array.length,
            index = fromRight ? length : -1;

        while ((fromRight ? index-- : ++index < length) &&
          predicate(array[index], index, array)) {}

        return isDrop
          ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
          : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
      }

      /**
       * The base implementation of `wrapperValue` which returns the result of
       * performing a sequence of actions on the unwrapped `value`, where each
       * successive action is supplied the return value of the previous.
       *
       * @private
       * @param {*} value The unwrapped value.
       * @param {Array} actions Actions to perform to resolve the unwrapped value.
       * @returns {*} Returns the resolved value.
       */
      function baseWrapperValue(value, actions) {
        var result = value;
        if (result instanceof LazyWrapper) {
          result = result.value();
        }
        return arrayReduce(actions, function(result, action) {
          return action.func.apply(action.thisArg, arrayPush([result], action.args));
        }, result);
      }

      /**
       * The base implementation of methods like `_.xor`, without support for
       * iteratee shorthands, that accepts an array of arrays to inspect.
       *
       * @private
       * @param {Array} arrays The arrays to inspect.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of values.
       */
      function baseXor(arrays, iteratee, comparator) {
        var length = arrays.length;
        if (length < 2) {
          return length ? baseUniq(arrays[0]) : [];
        }
        var index = -1,
            result = Array(length);

        while (++index < length) {
          var array = arrays[index],
              othIndex = -1;

          while (++othIndex < length) {
            if (othIndex != index) {
              result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
            }
          }
        }
        return baseUniq(baseFlatten(result, 1), iteratee, comparator);
      }

      /**
       * This base implementation of `_.zipObject` which assigns values using `assignFunc`.
       *
       * @private
       * @param {Array} props The property identifiers.
       * @param {Array} values The property values.
       * @param {Function} assignFunc The function to assign values.
       * @returns {Object} Returns the new object.
       */
      function baseZipObject(props, values, assignFunc) {
        var index = -1,
            length = props.length,
            valsLength = values.length,
            result = {};

        while (++index < length) {
          var value = index < valsLength ? values[index] : undefined$1;
          assignFunc(result, props[index], value);
        }
        return result;
      }

      /**
       * Casts `value` to an empty array if it's not an array like object.
       *
       * @private
       * @param {*} value The value to inspect.
       * @returns {Array|Object} Returns the cast array-like object.
       */
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }

      /**
       * Casts `value` to `identity` if it's not a function.
       *
       * @private
       * @param {*} value The value to inspect.
       * @returns {Function} Returns cast function.
       */
      function castFunction(value) {
        return typeof value == 'function' ? value : identity;
      }

      /**
       * Casts `value` to a path array if it's not one.
       *
       * @private
       * @param {*} value The value to inspect.
       * @param {Object} [object] The object to query keys on.
       * @returns {Array} Returns the cast property path array.
       */
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }

      /**
       * A `baseRest` alias which can be replaced with `identity` by module
       * replacement plugins.
       *
       * @private
       * @type {Function}
       * @param {Function} func The function to apply a rest parameter to.
       * @returns {Function} Returns the new function.
       */
      var castRest = baseRest;

      /**
       * Casts `array` to a slice if it's needed.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {number} start The start position.
       * @param {number} [end=array.length] The end position.
       * @returns {Array} Returns the cast slice.
       */
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === undefined$1 ? length : end;
        return (!start && end >= length) ? array : baseSlice(array, start, end);
      }

      /**
       * A simple wrapper around the global [`clearTimeout`](https://mdn.io/clearTimeout).
       *
       * @private
       * @param {number|Object} id The timer id or timeout object of the timer to clear.
       */
      var clearTimeout = ctxClearTimeout || function(id) {
        return root.clearTimeout(id);
      };

      /**
       * Creates a clone of  `buffer`.
       *
       * @private
       * @param {Buffer} buffer The buffer to clone.
       * @param {boolean} [isDeep] Specify a deep clone.
       * @returns {Buffer} Returns the cloned buffer.
       */
      function cloneBuffer(buffer, isDeep) {
        if (isDeep) {
          return buffer.slice();
        }
        var length = buffer.length,
            result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

        buffer.copy(result);
        return result;
      }

      /**
       * Creates a clone of `arrayBuffer`.
       *
       * @private
       * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
       * @returns {ArrayBuffer} Returns the cloned array buffer.
       */
      function cloneArrayBuffer(arrayBuffer) {
        var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array(result).set(new Uint8Array(arrayBuffer));
        return result;
      }

      /**
       * Creates a clone of `dataView`.
       *
       * @private
       * @param {Object} dataView The data view to clone.
       * @param {boolean} [isDeep] Specify a deep clone.
       * @returns {Object} Returns the cloned data view.
       */
      function cloneDataView(dataView, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
        return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
      }

      /**
       * Creates a clone of `regexp`.
       *
       * @private
       * @param {Object} regexp The regexp to clone.
       * @returns {Object} Returns the cloned regexp.
       */
      function cloneRegExp(regexp) {
        var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
        result.lastIndex = regexp.lastIndex;
        return result;
      }

      /**
       * Creates a clone of the `symbol` object.
       *
       * @private
       * @param {Object} symbol The symbol object to clone.
       * @returns {Object} Returns the cloned symbol object.
       */
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
      }

      /**
       * Creates a clone of `typedArray`.
       *
       * @private
       * @param {Object} typedArray The typed array to clone.
       * @param {boolean} [isDeep] Specify a deep clone.
       * @returns {Object} Returns the cloned typed array.
       */
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }

      /**
       * Compares values to sort them in ascending order.
       *
       * @private
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {number} Returns the sort order indicator for `value`.
       */
      function compareAscending(value, other) {
        if (value !== other) {
          var valIsDefined = value !== undefined$1,
              valIsNull = value === null,
              valIsReflexive = value === value,
              valIsSymbol = isSymbol(value);

          var othIsDefined = other !== undefined$1,
              othIsNull = other === null,
              othIsReflexive = other === other,
              othIsSymbol = isSymbol(other);

          if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
              (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
              (valIsNull && othIsDefined && othIsReflexive) ||
              (!valIsDefined && othIsReflexive) ||
              !valIsReflexive) {
            return 1;
          }
          if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
              (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
              (othIsNull && valIsDefined && valIsReflexive) ||
              (!othIsDefined && valIsReflexive) ||
              !othIsReflexive) {
            return -1;
          }
        }
        return 0;
      }

      /**
       * Used by `_.orderBy` to compare multiple properties of a value to another
       * and stable sort them.
       *
       * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
       * specify an order of "desc" for descending or "asc" for ascending sort order
       * of corresponding values.
       *
       * @private
       * @param {Object} object The object to compare.
       * @param {Object} other The other object to compare.
       * @param {boolean[]|string[]} orders The order to sort by for each property.
       * @returns {number} Returns the sort order indicator for `object`.
       */
      function compareMultiple(object, other, orders) {
        var index = -1,
            objCriteria = object.criteria,
            othCriteria = other.criteria,
            length = objCriteria.length,
            ordersLength = orders.length;

        while (++index < length) {
          var result = compareAscending(objCriteria[index], othCriteria[index]);
          if (result) {
            if (index >= ordersLength) {
              return result;
            }
            var order = orders[index];
            return result * (order == 'desc' ? -1 : 1);
          }
        }
        // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
        // that causes it, under certain circumstances, to provide the same value for
        // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
        // for more details.
        //
        // This also ensures a stable sort in V8 and other engines.
        // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
        return object.index - other.index;
      }

      /**
       * Creates an array that is the composition of partially applied arguments,
       * placeholders, and provided arguments into a single array of arguments.
       *
       * @private
       * @param {Array} args The provided arguments.
       * @param {Array} partials The arguments to prepend to those provided.
       * @param {Array} holders The `partials` placeholder indexes.
       * @params {boolean} [isCurried] Specify composing for a curried function.
       * @returns {Array} Returns the new array of composed arguments.
       */
      function composeArgs(args, partials, holders, isCurried) {
        var argsIndex = -1,
            argsLength = args.length,
            holdersLength = holders.length,
            leftIndex = -1,
            leftLength = partials.length,
            rangeLength = nativeMax(argsLength - holdersLength, 0),
            result = Array(leftLength + rangeLength),
            isUncurried = !isCurried;

        while (++leftIndex < leftLength) {
          result[leftIndex] = partials[leftIndex];
        }
        while (++argsIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result[holders[argsIndex]] = args[argsIndex];
          }
        }
        while (rangeLength--) {
          result[leftIndex++] = args[argsIndex++];
        }
        return result;
      }

      /**
       * This function is like `composeArgs` except that the arguments composition
       * is tailored for `_.partialRight`.
       *
       * @private
       * @param {Array} args The provided arguments.
       * @param {Array} partials The arguments to append to those provided.
       * @param {Array} holders The `partials` placeholder indexes.
       * @params {boolean} [isCurried] Specify composing for a curried function.
       * @returns {Array} Returns the new array of composed arguments.
       */
      function composeArgsRight(args, partials, holders, isCurried) {
        var argsIndex = -1,
            argsLength = args.length,
            holdersIndex = -1,
            holdersLength = holders.length,
            rightIndex = -1,
            rightLength = partials.length,
            rangeLength = nativeMax(argsLength - holdersLength, 0),
            result = Array(rangeLength + rightLength),
            isUncurried = !isCurried;

        while (++argsIndex < rangeLength) {
          result[argsIndex] = args[argsIndex];
        }
        var offset = argsIndex;
        while (++rightIndex < rightLength) {
          result[offset + rightIndex] = partials[rightIndex];
        }
        while (++holdersIndex < holdersLength) {
          if (isUncurried || argsIndex < argsLength) {
            result[offset + holders[holdersIndex]] = args[argsIndex++];
          }
        }
        return result;
      }

      /**
       * Copies the values of `source` to `array`.
       *
       * @private
       * @param {Array} source The array to copy values from.
       * @param {Array} [array=[]] The array to copy values to.
       * @returns {Array} Returns `array`.
       */
      function copyArray(source, array) {
        var index = -1,
            length = source.length;

        array || (array = Array(length));
        while (++index < length) {
          array[index] = source[index];
        }
        return array;
      }

      /**
       * Copies properties of `source` to `object`.
       *
       * @private
       * @param {Object} source The object to copy properties from.
       * @param {Array} props The property identifiers to copy.
       * @param {Object} [object={}] The object to copy properties to.
       * @param {Function} [customizer] The function to customize copied values.
       * @returns {Object} Returns `object`.
       */
      function copyObject(source, props, object, customizer) {
        var isNew = !object;
        object || (object = {});

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];

          var newValue = customizer
            ? customizer(object[key], source[key], key, object, source)
            : undefined$1;

          if (newValue === undefined$1) {
            newValue = source[key];
          }
          if (isNew) {
            baseAssignValue(object, key, newValue);
          } else {
            assignValue(object, key, newValue);
          }
        }
        return object;
      }

      /**
       * Copies own symbols of `source` to `object`.
       *
       * @private
       * @param {Object} source The object to copy symbols from.
       * @param {Object} [object={}] The object to copy symbols to.
       * @returns {Object} Returns `object`.
       */
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }

      /**
       * Copies own and inherited symbols of `source` to `object`.
       *
       * @private
       * @param {Object} source The object to copy symbols from.
       * @param {Object} [object={}] The object to copy symbols to.
       * @returns {Object} Returns `object`.
       */
      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }

      /**
       * Creates a function like `_.groupBy`.
       *
       * @private
       * @param {Function} setter The function to set accumulator values.
       * @param {Function} [initializer] The accumulator object initializer.
       * @returns {Function} Returns the new aggregator function.
       */
      function createAggregator(setter, initializer) {
        return function(collection, iteratee) {
          var func = isArray(collection) ? arrayAggregator : baseAggregator,
              accumulator = initializer ? initializer() : {};

          return func(collection, setter, getIteratee(iteratee, 2), accumulator);
        };
      }

      /**
       * Creates a function like `_.assign`.
       *
       * @private
       * @param {Function} assigner The function to assign values.
       * @returns {Function} Returns the new assigner function.
       */
      function createAssigner(assigner) {
        return baseRest(function(object, sources) {
          var index = -1,
              length = sources.length,
              customizer = length > 1 ? sources[length - 1] : undefined$1,
              guard = length > 2 ? sources[2] : undefined$1;

          customizer = (assigner.length > 3 && typeof customizer == 'function')
            ? (length--, customizer)
            : undefined$1;

          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined$1 : customizer;
            length = 1;
          }
          object = Object(object);
          while (++index < length) {
            var source = sources[index];
            if (source) {
              assigner(object, source, index, customizer);
            }
          }
          return object;
        });
      }

      /**
       * Creates a `baseEach` or `baseEachRight` function.
       *
       * @private
       * @param {Function} eachFunc The function to iterate over a collection.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Function} Returns the new base function.
       */
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee);
          }
          var length = collection.length,
              index = fromRight ? length : -1,
              iterable = Object(collection);

          while ((fromRight ? index-- : ++index < length)) {
            if (iteratee(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }

      /**
       * Creates a base function for methods like `_.forIn` and `_.forOwn`.
       *
       * @private
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Function} Returns the new base function.
       */
      function createBaseFor(fromRight) {
        return function(object, iteratee, keysFunc) {
          var index = -1,
              iterable = Object(object),
              props = keysFunc(object),
              length = props.length;

          while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee(iterable[key], key, iterable) === false) {
              break;
            }
          }
          return object;
        };
      }

      /**
       * Creates a function that wraps `func` to invoke it with the optional `this`
       * binding of `thisArg`.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @param {*} [thisArg] The `this` binding of `func`.
       * @returns {Function} Returns the new wrapped function.
       */
      function createBind(func, bitmask, thisArg) {
        var isBind = bitmask & WRAP_BIND_FLAG,
            Ctor = createCtor(func);

        function wrapper() {
          var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
          return fn.apply(isBind ? thisArg : this, arguments);
        }
        return wrapper;
      }

      /**
       * Creates a function like `_.lowerFirst`.
       *
       * @private
       * @param {string} methodName The name of the `String` case method to use.
       * @returns {Function} Returns the new case function.
       */
      function createCaseFirst(methodName) {
        return function(string) {
          string = toString(string);

          var strSymbols = hasUnicode(string)
            ? stringToArray(string)
            : undefined$1;

          var chr = strSymbols
            ? strSymbols[0]
            : string.charAt(0);

          var trailing = strSymbols
            ? castSlice(strSymbols, 1).join('')
            : string.slice(1);

          return chr[methodName]() + trailing;
        };
      }

      /**
       * Creates a function like `_.camelCase`.
       *
       * @private
       * @param {Function} callback The function to combine each word.
       * @returns {Function} Returns the new compounder function.
       */
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
        };
      }

      /**
       * Creates a function that produces an instance of `Ctor` regardless of
       * whether it was invoked as part of a `new` expression or by `call` or `apply`.
       *
       * @private
       * @param {Function} Ctor The constructor to wrap.
       * @returns {Function} Returns the new wrapped function.
       */
      function createCtor(Ctor) {
        return function() {
          // Use a `switch` statement to work with class constructors. See
          // http://ecma-international.org/ecma-262/7.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
          // for more details.
          var args = arguments;
          switch (args.length) {
            case 0: return new Ctor;
            case 1: return new Ctor(args[0]);
            case 2: return new Ctor(args[0], args[1]);
            case 3: return new Ctor(args[0], args[1], args[2]);
            case 4: return new Ctor(args[0], args[1], args[2], args[3]);
            case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
          var thisBinding = baseCreate(Ctor.prototype),
              result = Ctor.apply(thisBinding, args);

          // Mimic the constructor's `return` behavior.
          // See https://es5.github.io/#x13.2.2 for more details.
          return isObject(result) ? result : thisBinding;
        };
      }

      /**
       * Creates a function that wraps `func` to enable currying.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @param {number} arity The arity of `func`.
       * @returns {Function} Returns the new wrapped function.
       */
      function createCurry(func, bitmask, arity) {
        var Ctor = createCtor(func);

        function wrapper() {
          var length = arguments.length,
              args = Array(length),
              index = length,
              placeholder = getHolder(wrapper);

          while (index--) {
            args[index] = arguments[index];
          }
          var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder)
            ? []
            : replaceHolders(args, placeholder);

          length -= holders.length;
          if (length < arity) {
            return createRecurry(
              func, bitmask, createHybrid, wrapper.placeholder, undefined$1,
              args, holders, undefined$1, undefined$1, arity - length);
          }
          var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
          return apply(fn, this, args);
        }
        return wrapper;
      }

      /**
       * Creates a `_.find` or `_.findLast` function.
       *
       * @private
       * @param {Function} findIndexFunc The function to find the collection index.
       * @returns {Function} Returns the new find function.
       */
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object(collection);
          if (!isArrayLike(collection)) {
            var iteratee = getIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) { return iteratee(iterable[key], key, iterable); };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined$1;
        };
      }

      /**
       * Creates a `_.flow` or `_.flowRight` function.
       *
       * @private
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Function} Returns the new flow function.
       */
      function createFlow(fromRight) {
        return flatRest(function(funcs) {
          var length = funcs.length,
              index = length,
              prereq = LodashWrapper.prototype.thru;

          if (fromRight) {
            funcs.reverse();
          }
          while (index--) {
            var func = funcs[index];
            if (typeof func != 'function') {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
            if (prereq && !wrapper && getFuncName(func) == 'wrapper') {
              var wrapper = new LodashWrapper([], true);
            }
          }
          index = wrapper ? index : length;
          while (++index < length) {
            func = funcs[index];

            var funcName = getFuncName(func),
                data = funcName == 'wrapper' ? getData(func) : undefined$1;

            if (data && isLaziable(data[0]) &&
                  data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) &&
                  !data[4].length && data[9] == 1
                ) {
              wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
            } else {
              wrapper = (func.length == 1 && isLaziable(func))
                ? wrapper[funcName]()
                : wrapper.thru(func);
            }
          }
          return function() {
            var args = arguments,
                value = args[0];

            if (wrapper && args.length == 1 && isArray(value)) {
              return wrapper.plant(value).value();
            }
            var index = 0,
                result = length ? funcs[index].apply(this, args) : value;

            while (++index < length) {
              result = funcs[index].call(this, result);
            }
            return result;
          };
        });
      }

      /**
       * Creates a function that wraps `func` to invoke it with optional `this`
       * binding of `thisArg`, partial application, and currying.
       *
       * @private
       * @param {Function|string} func The function or method name to wrap.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @param {*} [thisArg] The `this` binding of `func`.
       * @param {Array} [partials] The arguments to prepend to those provided to
       *  the new function.
       * @param {Array} [holders] The `partials` placeholder indexes.
       * @param {Array} [partialsRight] The arguments to append to those provided
       *  to the new function.
       * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
       * @param {Array} [argPos] The argument positions of the new function.
       * @param {number} [ary] The arity cap of `func`.
       * @param {number} [arity] The arity of `func`.
       * @returns {Function} Returns the new wrapped function.
       */
      function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
        var isAry = bitmask & WRAP_ARY_FLAG,
            isBind = bitmask & WRAP_BIND_FLAG,
            isBindKey = bitmask & WRAP_BIND_KEY_FLAG,
            isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG),
            isFlip = bitmask & WRAP_FLIP_FLAG,
            Ctor = isBindKey ? undefined$1 : createCtor(func);

        function wrapper() {
          var length = arguments.length,
              args = Array(length),
              index = length;

          while (index--) {
            args[index] = arguments[index];
          }
          if (isCurried) {
            var placeholder = getHolder(wrapper),
                holdersCount = countHolders(args, placeholder);
          }
          if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
          }
          if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
          }
          length -= holdersCount;
          if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(
              func, bitmask, createHybrid, wrapper.placeholder, thisArg,
              args, newHolders, argPos, ary, arity - length
            );
          }
          var thisBinding = isBind ? thisArg : this,
              fn = isBindKey ? thisBinding[func] : func;

          length = args.length;
          if (argPos) {
            args = reorder(args, argPos);
          } else if (isFlip && length > 1) {
            args.reverse();
          }
          if (isAry && ary < length) {
            args.length = ary;
          }
          if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
          }
          return fn.apply(thisBinding, args);
        }
        return wrapper;
      }

      /**
       * Creates a function like `_.invertBy`.
       *
       * @private
       * @param {Function} setter The function to set accumulator values.
       * @param {Function} toIteratee The function to resolve iteratees.
       * @returns {Function} Returns the new inverter function.
       */
      function createInverter(setter, toIteratee) {
        return function(object, iteratee) {
          return baseInverter(object, setter, toIteratee(iteratee), {});
        };
      }

      /**
       * Creates a function that performs a mathematical operation on two values.
       *
       * @private
       * @param {Function} operator The function to perform the operation.
       * @param {number} [defaultValue] The value used for `undefined` arguments.
       * @returns {Function} Returns the new mathematical operation function.
       */
      function createMathOperation(operator, defaultValue) {
        return function(value, other) {
          var result;
          if (value === undefined$1 && other === undefined$1) {
            return defaultValue;
          }
          if (value !== undefined$1) {
            result = value;
          }
          if (other !== undefined$1) {
            if (result === undefined$1) {
              return other;
            }
            if (typeof value == 'string' || typeof other == 'string') {
              value = baseToString(value);
              other = baseToString(other);
            } else {
              value = baseToNumber(value);
              other = baseToNumber(other);
            }
            result = operator(value, other);
          }
          return result;
        };
      }

      /**
       * Creates a function like `_.over`.
       *
       * @private
       * @param {Function} arrayFunc The function to iterate over iteratees.
       * @returns {Function} Returns the new over function.
       */
      function createOver(arrayFunc) {
        return flatRest(function(iteratees) {
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          return baseRest(function(args) {
            var thisArg = this;
            return arrayFunc(iteratees, function(iteratee) {
              return apply(iteratee, thisArg, args);
            });
          });
        });
      }

      /**
       * Creates the padding for `string` based on `length`. The `chars` string
       * is truncated if the number of characters exceeds `length`.
       *
       * @private
       * @param {number} length The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padding for `string`.
       */
      function createPadding(length, chars) {
        chars = chars === undefined$1 ? ' ' : baseToString(chars);

        var charsLength = chars.length;
        if (charsLength < 2) {
          return charsLength ? baseRepeat(chars, length) : chars;
        }
        var result = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
        return hasUnicode(chars)
          ? castSlice(stringToArray(result), 0, length).join('')
          : result.slice(0, length);
      }

      /**
       * Creates a function that wraps `func` to invoke it with the `this` binding
       * of `thisArg` and `partials` prepended to the arguments it receives.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @param {*} thisArg The `this` binding of `func`.
       * @param {Array} partials The arguments to prepend to those provided to
       *  the new function.
       * @returns {Function} Returns the new wrapped function.
       */
      function createPartial(func, bitmask, thisArg, partials) {
        var isBind = bitmask & WRAP_BIND_FLAG,
            Ctor = createCtor(func);

        function wrapper() {
          var argsIndex = -1,
              argsLength = arguments.length,
              leftIndex = -1,
              leftLength = partials.length,
              args = Array(leftLength + argsLength),
              fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;

          while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
          }
          while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
          }
          return apply(fn, isBind ? thisArg : this, args);
        }
        return wrapper;
      }

      /**
       * Creates a `_.range` or `_.rangeRight` function.
       *
       * @private
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Function} Returns the new range function.
       */
      function createRange(fromRight) {
        return function(start, end, step) {
          if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
            end = step = undefined$1;
          }
          // Ensure the sign of `-0` is preserved.
          start = toFinite(start);
          if (end === undefined$1) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          step = step === undefined$1 ? (start < end ? 1 : -1) : toFinite(step);
          return baseRange(start, end, step, fromRight);
        };
      }

      /**
       * Creates a function that performs a relational operation on two values.
       *
       * @private
       * @param {Function} operator The function to perform the operation.
       * @returns {Function} Returns the new relational operation function.
       */
      function createRelationalOperation(operator) {
        return function(value, other) {
          if (!(typeof value == 'string' && typeof other == 'string')) {
            value = toNumber(value);
            other = toNumber(other);
          }
          return operator(value, other);
        };
      }

      /**
       * Creates a function that wraps `func` to continue currying.
       *
       * @private
       * @param {Function} func The function to wrap.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @param {Function} wrapFunc The function to create the `func` wrapper.
       * @param {*} placeholder The placeholder value.
       * @param {*} [thisArg] The `this` binding of `func`.
       * @param {Array} [partials] The arguments to prepend to those provided to
       *  the new function.
       * @param {Array} [holders] The `partials` placeholder indexes.
       * @param {Array} [argPos] The argument positions of the new function.
       * @param {number} [ary] The arity cap of `func`.
       * @param {number} [arity] The arity of `func`.
       * @returns {Function} Returns the new wrapped function.
       */
      function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
        var isCurry = bitmask & WRAP_CURRY_FLAG,
            newHolders = isCurry ? holders : undefined$1,
            newHoldersRight = isCurry ? undefined$1 : holders,
            newPartials = isCurry ? partials : undefined$1,
            newPartialsRight = isCurry ? undefined$1 : partials;

        bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
        bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);

        if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
          bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
        }
        var newData = [
          func, bitmask, thisArg, newPartials, newHolders, newPartialsRight,
          newHoldersRight, argPos, ary, arity
        ];

        var result = wrapFunc.apply(undefined$1, newData);
        if (isLaziable(func)) {
          setData(result, newData);
        }
        result.placeholder = placeholder;
        return setWrapToString(result, func, bitmask);
      }

      /**
       * Creates a function like `_.round`.
       *
       * @private
       * @param {string} methodName The name of the `Math` method to use when rounding.
       * @returns {Function} Returns the new round function.
       */
      function createRound(methodName) {
        var func = Math[methodName];
        return function(number, precision) {
          number = toNumber(number);
          precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
          if (precision && nativeIsFinite(number)) {
            // Shift with exponential notation to avoid floating-point issues.
            // See [MDN](https://mdn.io/round#Examples) for more details.
            var pair = (toString(number) + 'e').split('e'),
                value = func(pair[0] + 'e' + (+pair[1] + precision));

            pair = (toString(value) + 'e').split('e');
            return +(pair[0] + 'e' + (+pair[1] - precision));
          }
          return func(number);
        };
      }

      /**
       * Creates a set object of `values`.
       *
       * @private
       * @param {Array} values The values to add to the set.
       * @returns {Object} Returns the new set.
       */
      var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
        return new Set(values);
      };

      /**
       * Creates a `_.toPairs` or `_.toPairsIn` function.
       *
       * @private
       * @param {Function} keysFunc The function to get the keys of a given object.
       * @returns {Function} Returns the new pairs function.
       */
      function createToPairs(keysFunc) {
        return function(object) {
          var tag = getTag(object);
          if (tag == mapTag) {
            return mapToArray(object);
          }
          if (tag == setTag) {
            return setToPairs(object);
          }
          return baseToPairs(object, keysFunc(object));
        };
      }

      /**
       * Creates a function that either curries or invokes `func` with optional
       * `this` binding and partially applied arguments.
       *
       * @private
       * @param {Function|string} func The function or method name to wrap.
       * @param {number} bitmask The bitmask flags.
       *    1 - `_.bind`
       *    2 - `_.bindKey`
       *    4 - `_.curry` or `_.curryRight` of a bound function
       *    8 - `_.curry`
       *   16 - `_.curryRight`
       *   32 - `_.partial`
       *   64 - `_.partialRight`
       *  128 - `_.rearg`
       *  256 - `_.ary`
       *  512 - `_.flip`
       * @param {*} [thisArg] The `this` binding of `func`.
       * @param {Array} [partials] The arguments to be partially applied.
       * @param {Array} [holders] The `partials` placeholder indexes.
       * @param {Array} [argPos] The argument positions of the new function.
       * @param {number} [ary] The arity cap of `func`.
       * @param {number} [arity] The arity of `func`.
       * @returns {Function} Returns the new wrapped function.
       */
      function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
        var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
        if (!isBindKey && typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var length = partials ? partials.length : 0;
        if (!length) {
          bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
          partials = holders = undefined$1;
        }
        ary = ary === undefined$1 ? ary : nativeMax(toInteger(ary), 0);
        arity = arity === undefined$1 ? arity : toInteger(arity);
        length -= holders ? holders.length : 0;

        if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
          var partialsRight = partials,
              holdersRight = holders;

          partials = holders = undefined$1;
        }
        var data = isBindKey ? undefined$1 : getData(func);

        var newData = [
          func, bitmask, thisArg, partials, holders, partialsRight, holdersRight,
          argPos, ary, arity
        ];

        if (data) {
          mergeData(newData, data);
        }
        func = newData[0];
        bitmask = newData[1];
        thisArg = newData[2];
        partials = newData[3];
        holders = newData[4];
        arity = newData[9] = newData[9] === undefined$1
          ? (isBindKey ? 0 : func.length)
          : nativeMax(newData[9] - length, 0);

        if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
          bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
        }
        if (!bitmask || bitmask == WRAP_BIND_FLAG) {
          var result = createBind(func, bitmask, thisArg);
        } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
          result = createCurry(func, bitmask, arity);
        } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
          result = createPartial(func, bitmask, thisArg, partials);
        } else {
          result = createHybrid.apply(undefined$1, newData);
        }
        var setter = data ? baseSetData : setData;
        return setWrapToString(setter(result, newData), func, bitmask);
      }

      /**
       * Used by `_.defaults` to customize its `_.assignIn` use to assign properties
       * of source objects to the destination object for all destination properties
       * that resolve to `undefined`.
       *
       * @private
       * @param {*} objValue The destination value.
       * @param {*} srcValue The source value.
       * @param {string} key The key of the property to assign.
       * @param {Object} object The parent object of `objValue`.
       * @returns {*} Returns the value to assign.
       */
      function customDefaultsAssignIn(objValue, srcValue, key, object) {
        if (objValue === undefined$1 ||
            (eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key))) {
          return srcValue;
        }
        return objValue;
      }

      /**
       * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
       * objects into destination objects that are passed thru.
       *
       * @private
       * @param {*} objValue The destination value.
       * @param {*} srcValue The source value.
       * @param {string} key The key of the property to merge.
       * @param {Object} object The parent object of `objValue`.
       * @param {Object} source The parent object of `srcValue`.
       * @param {Object} [stack] Tracks traversed source values and their merged
       *  counterparts.
       * @returns {*} Returns the value to assign.
       */
      function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
        if (isObject(objValue) && isObject(srcValue)) {
          // Recursively merge objects and arrays (susceptible to call stack limits).
          stack.set(srcValue, objValue);
          baseMerge(objValue, srcValue, undefined$1, customDefaultsMerge, stack);
          stack['delete'](srcValue);
        }
        return objValue;
      }

      /**
       * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
       * objects.
       *
       * @private
       * @param {*} value The value to inspect.
       * @param {string} key The key of the property to inspect.
       * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
       */
      function customOmitClone(value) {
        return isPlainObject(value) ? undefined$1 : value;
      }

      /**
       * A specialized version of `baseIsEqualDeep` for arrays with support for
       * partial deep comparisons.
       *
       * @private
       * @param {Array} array The array to compare.
       * @param {Array} other The other array to compare.
       * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
       * @param {Function} customizer The function to customize comparisons.
       * @param {Function} equalFunc The function to determine equivalents of values.
       * @param {Object} stack Tracks traversed `array` and `other` objects.
       * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
       */
      function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
            arrLength = array.length,
            othLength = other.length;

        if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
          return false;
        }
        // Assume cyclic values are equal.
        var stacked = stack.get(array);
        if (stacked && stack.get(other)) {
          return stacked == other;
        }
        var index = -1,
            result = true,
            seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined$1;

        stack.set(array, other);
        stack.set(other, array);

        // Ignore non-index properties.
        while (++index < arrLength) {
          var arrValue = array[index],
              othValue = other[index];

          if (customizer) {
            var compared = isPartial
              ? customizer(othValue, arrValue, index, other, array, stack)
              : customizer(arrValue, othValue, index, array, other, stack);
          }
          if (compared !== undefined$1) {
            if (compared) {
              continue;
            }
            result = false;
            break;
          }
          // Recursively compare arrays (susceptible to call stack limits).
          if (seen) {
            if (!arraySome(other, function(othValue, othIndex) {
                  if (!cacheHas(seen, othIndex) &&
                      (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                    return seen.push(othIndex);
                  }
                })) {
              result = false;
              break;
            }
          } else if (!(
                arrValue === othValue ||
                  equalFunc(arrValue, othValue, bitmask, customizer, stack)
              )) {
            result = false;
            break;
          }
        }
        stack['delete'](array);
        stack['delete'](other);
        return result;
      }

      /**
       * A specialized version of `baseIsEqualDeep` for comparing objects of
       * the same `toStringTag`.
       *
       * **Note:** This function only supports comparing values with tags of
       * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
       *
       * @private
       * @param {Object} object The object to compare.
       * @param {Object} other The other object to compare.
       * @param {string} tag The `toStringTag` of the objects to compare.
       * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
       * @param {Function} customizer The function to customize comparisons.
       * @param {Function} equalFunc The function to determine equivalents of values.
       * @param {Object} stack Tracks traversed `object` and `other` objects.
       * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
       */
      function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
        switch (tag) {
          case dataViewTag:
            if ((object.byteLength != other.byteLength) ||
                (object.byteOffset != other.byteOffset)) {
              return false;
            }
            object = object.buffer;
            other = other.buffer;

          case arrayBufferTag:
            if ((object.byteLength != other.byteLength) ||
                !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
              return false;
            }
            return true;

          case boolTag:
          case dateTag:
          case numberTag:
            // Coerce booleans to `1` or `0` and dates to milliseconds.
            // Invalid dates are coerced to `NaN`.
            return eq(+object, +other);

          case errorTag:
            return object.name == other.name && object.message == other.message;

          case regexpTag:
          case stringTag:
            // Coerce regexes to strings and treat strings, primitives and objects,
            // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
            // for more details.
            return object == (other + '');

          case mapTag:
            var convert = mapToArray;

          case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);

            if (object.size != other.size && !isPartial) {
              return false;
            }
            // Assume cyclic values are equal.
            var stacked = stack.get(object);
            if (stacked) {
              return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;

            // Recursively compare objects (susceptible to call stack limits).
            stack.set(object, other);
            var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack['delete'](object);
            return result;

          case symbolTag:
            if (symbolValueOf) {
              return symbolValueOf.call(object) == symbolValueOf.call(other);
            }
        }
        return false;
      }

      /**
       * A specialized version of `baseIsEqualDeep` for objects with support for
       * partial deep comparisons.
       *
       * @private
       * @param {Object} object The object to compare.
       * @param {Object} other The other object to compare.
       * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
       * @param {Function} customizer The function to customize comparisons.
       * @param {Function} equalFunc The function to determine equivalents of values.
       * @param {Object} stack Tracks traversed `object` and `other` objects.
       * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
       */
      function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
            objProps = getAllKeys(object),
            objLength = objProps.length,
            othProps = getAllKeys(other),
            othLength = othProps.length;

        if (objLength != othLength && !isPartial) {
          return false;
        }
        var index = objLength;
        while (index--) {
          var key = objProps[index];
          if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
          }
        }
        // Assume cyclic values are equal.
        var stacked = stack.get(object);
        if (stacked && stack.get(other)) {
          return stacked == other;
        }
        var result = true;
        stack.set(object, other);
        stack.set(other, object);

        var skipCtor = isPartial;
        while (++index < objLength) {
          key = objProps[index];
          var objValue = object[key],
              othValue = other[key];

          if (customizer) {
            var compared = isPartial
              ? customizer(othValue, objValue, key, other, object, stack)
              : customizer(objValue, othValue, key, object, other, stack);
          }
          // Recursively compare objects (susceptible to call stack limits).
          if (!(compared === undefined$1
                ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
                : compared
              )) {
            result = false;
            break;
          }
          skipCtor || (skipCtor = key == 'constructor');
        }
        if (result && !skipCtor) {
          var objCtor = object.constructor,
              othCtor = other.constructor;

          // Non `Object` object instances with different constructors are not equal.
          if (objCtor != othCtor &&
              ('constructor' in object && 'constructor' in other) &&
              !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
                typeof othCtor == 'function' && othCtor instanceof othCtor)) {
            result = false;
          }
        }
        stack['delete'](object);
        stack['delete'](other);
        return result;
      }

      /**
       * A specialized version of `baseRest` which flattens the rest array.
       *
       * @private
       * @param {Function} func The function to apply a rest parameter to.
       * @returns {Function} Returns the new function.
       */
      function flatRest(func) {
        return setToString(overRest(func, undefined$1, flatten), func + '');
      }

      /**
       * Creates an array of own enumerable property names and symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names and symbols.
       */
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }

      /**
       * Creates an array of own and inherited enumerable property names and
       * symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names and symbols.
       */
      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn, getSymbolsIn);
      }

      /**
       * Gets metadata for `func`.
       *
       * @private
       * @param {Function} func The function to query.
       * @returns {*} Returns the metadata for `func`.
       */
      var getData = !metaMap ? noop : function(func) {
        return metaMap.get(func);
      };

      /**
       * Gets the name of `func`.
       *
       * @private
       * @param {Function} func The function to query.
       * @returns {string} Returns the function name.
       */
      function getFuncName(func) {
        var result = (func.name + ''),
            array = realNames[result],
            length = hasOwnProperty.call(realNames, result) ? array.length : 0;

        while (length--) {
          var data = array[length],
              otherFunc = data.func;
          if (otherFunc == null || otherFunc == func) {
            return data.name;
          }
        }
        return result;
      }

      /**
       * Gets the argument placeholder value for `func`.
       *
       * @private
       * @param {Function} func The function to inspect.
       * @returns {*} Returns the placeholder value.
       */
      function getHolder(func) {
        var object = hasOwnProperty.call(lodash, 'placeholder') ? lodash : func;
        return object.placeholder;
      }

      /**
       * Gets the appropriate "iteratee" function. If `_.iteratee` is customized,
       * this function returns the custom method, otherwise it returns `baseIteratee`.
       * If arguments are provided, the chosen function is invoked with them and
       * its result is returned.
       *
       * @private
       * @param {*} [value] The value to convert to an iteratee.
       * @param {number} [arity] The arity of the created iteratee.
       * @returns {Function} Returns the chosen function or its result.
       */
      function getIteratee() {
        var result = lodash.iteratee || iteratee;
        result = result === iteratee ? baseIteratee : result;
        return arguments.length ? result(arguments[0], arguments[1]) : result;
      }

      /**
       * Gets the data for `map`.
       *
       * @private
       * @param {Object} map The map to query.
       * @param {string} key The reference key.
       * @returns {*} Returns the map data.
       */
      function getMapData(map, key) {
        var data = map.__data__;
        return isKeyable(key)
          ? data[typeof key == 'string' ? 'string' : 'hash']
          : data.map;
      }

      /**
       * Gets the property names, values, and compare flags of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the match data of `object`.
       */
      function getMatchData(object) {
        var result = keys(object),
            length = result.length;

        while (length--) {
          var key = result[length],
              value = object[key];

          result[length] = [key, value, isStrictComparable(value)];
        }
        return result;
      }

      /**
       * Gets the native function at `key` of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {string} key The key of the method to get.
       * @returns {*} Returns the function if it's native, else `undefined`.
       */
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : undefined$1;
      }

      /**
       * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
       *
       * @private
       * @param {*} value The value to query.
       * @returns {string} Returns the raw `toStringTag`.
       */
      function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag),
            tag = value[symToStringTag];

        try {
          value[symToStringTag] = undefined$1;
          var unmasked = true;
        } catch (e) {}

        var result = nativeObjectToString.call(value);
        if (unmasked) {
          if (isOwn) {
            value[symToStringTag] = tag;
          } else {
            delete value[symToStringTag];
          }
        }
        return result;
      }

      /**
       * Creates an array of the own enumerable symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of symbols.
       */
      var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
        if (object == null) {
          return [];
        }
        object = Object(object);
        return arrayFilter(nativeGetSymbols(object), function(symbol) {
          return propertyIsEnumerable.call(object, symbol);
        });
      };

      /**
       * Creates an array of the own and inherited enumerable symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of symbols.
       */
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
        var result = [];
        while (object) {
          arrayPush(result, getSymbols(object));
          object = getPrototype(object);
        }
        return result;
      };

      /**
       * Gets the `toStringTag` of `value`.
       *
       * @private
       * @param {*} value The value to query.
       * @returns {string} Returns the `toStringTag`.
       */
      var getTag = baseGetTag;

      // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
      if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
          (Map && getTag(new Map) != mapTag) ||
          (Promise && getTag(Promise.resolve()) != promiseTag) ||
          (Set && getTag(new Set) != setTag) ||
          (WeakMap && getTag(new WeakMap) != weakMapTag)) {
        getTag = function(value) {
          var result = baseGetTag(value),
              Ctor = result == objectTag ? value.constructor : undefined$1,
              ctorString = Ctor ? toSource(Ctor) : '';

          if (ctorString) {
            switch (ctorString) {
              case dataViewCtorString: return dataViewTag;
              case mapCtorString: return mapTag;
              case promiseCtorString: return promiseTag;
              case setCtorString: return setTag;
              case weakMapCtorString: return weakMapTag;
            }
          }
          return result;
        };
      }

      /**
       * Gets the view, applying any `transforms` to the `start` and `end` positions.
       *
       * @private
       * @param {number} start The start of the view.
       * @param {number} end The end of the view.
       * @param {Array} transforms The transformations to apply to the view.
       * @returns {Object} Returns an object containing the `start` and `end`
       *  positions of the view.
       */
      function getView(start, end, transforms) {
        var index = -1,
            length = transforms.length;

        while (++index < length) {
          var data = transforms[index],
              size = data.size;

          switch (data.type) {
            case 'drop':      start += size; break;
            case 'dropRight': end -= size; break;
            case 'take':      end = nativeMin(end, start + size); break;
            case 'takeRight': start = nativeMax(start, end - size); break;
          }
        }
        return { 'start': start, 'end': end };
      }

      /**
       * Extracts wrapper details from the `source` body comment.
       *
       * @private
       * @param {string} source The source to inspect.
       * @returns {Array} Returns the wrapper details.
       */
      function getWrapDetails(source) {
        var match = source.match(reWrapDetails);
        return match ? match[1].split(reSplitDetails) : [];
      }

      /**
       * Checks if `path` exists on `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array|string} path The path to check.
       * @param {Function} hasFunc The function to check properties.
       * @returns {boolean} Returns `true` if `path` exists, else `false`.
       */
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);

        var index = -1,
            length = path.length,
            result = false;

        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result || ++index != length) {
          return result;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) &&
          (isArray(object) || isArguments(object));
      }

      /**
       * Initializes an array clone.
       *
       * @private
       * @param {Array} array The array to clone.
       * @returns {Array} Returns the initialized clone.
       */
      function initCloneArray(array) {
        var length = array.length,
            result = new array.constructor(length);

        // Add properties assigned by `RegExp#exec`.
        if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
          result.index = array.index;
          result.input = array.input;
        }
        return result;
      }

      /**
       * Initializes an object clone.
       *
       * @private
       * @param {Object} object The object to clone.
       * @returns {Object} Returns the initialized clone.
       */
      function initCloneObject(object) {
        return (typeof object.constructor == 'function' && !isPrototype(object))
          ? baseCreate(getPrototype(object))
          : {};
      }

      /**
       * Initializes an object clone based on its `toStringTag`.
       *
       * **Note:** This function only supports cloning values with tags of
       * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
       *
       * @private
       * @param {Object} object The object to clone.
       * @param {string} tag The `toStringTag` of the object to clone.
       * @param {boolean} [isDeep] Specify a deep clone.
       * @returns {Object} Returns the initialized clone.
       */
      function initCloneByTag(object, tag, isDeep) {
        var Ctor = object.constructor;
        switch (tag) {
          case arrayBufferTag:
            return cloneArrayBuffer(object);

          case boolTag:
          case dateTag:
            return new Ctor(+object);

          case dataViewTag:
            return cloneDataView(object, isDeep);

          case float32Tag: case float64Tag:
          case int8Tag: case int16Tag: case int32Tag:
          case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
            return cloneTypedArray(object, isDeep);

          case mapTag:
            return new Ctor;

          case numberTag:
          case stringTag:
            return new Ctor(object);

          case regexpTag:
            return cloneRegExp(object);

          case setTag:
            return new Ctor;

          case symbolTag:
            return cloneSymbol(object);
        }
      }

      /**
       * Inserts wrapper `details` in a comment at the top of the `source` body.
       *
       * @private
       * @param {string} source The source to modify.
       * @returns {Array} details The details to insert.
       * @returns {string} Returns the modified source.
       */
      function insertWrapDetails(source, details) {
        var length = details.length;
        if (!length) {
          return source;
        }
        var lastIndex = length - 1;
        details[lastIndex] = (length > 1 ? '& ' : '') + details[lastIndex];
        details = details.join(length > 2 ? ', ' : ' ');
        return source.replace(reWrapComment, '{\n/* [wrapped with ' + details + '] */\n');
      }

      /**
       * Checks if `value` is a flattenable `arguments` object or array.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
       */
      function isFlattenable(value) {
        return isArray(value) || isArguments(value) ||
          !!(spreadableSymbol && value && value[spreadableSymbol]);
      }

      /**
       * Checks if `value` is a valid array-like index.
       *
       * @private
       * @param {*} value The value to check.
       * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
       * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
       */
      function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;

        return !!length &&
          (type == 'number' ||
            (type != 'symbol' && reIsUint.test(value))) &&
              (value > -1 && value % 1 == 0 && value < length);
      }

      /**
       * Checks if the given arguments are from an iteratee call.
       *
       * @private
       * @param {*} value The potential iteratee value argument.
       * @param {*} index The potential iteratee index or key argument.
       * @param {*} object The potential iteratee object argument.
       * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
       *  else `false`.
       */
      function isIterateeCall(value, index, object) {
        if (!isObject(object)) {
          return false;
        }
        var type = typeof index;
        if (type == 'number'
              ? (isArrayLike(object) && isIndex(index, object.length))
              : (type == 'string' && index in object)
            ) {
          return eq(object[index], value);
        }
        return false;
      }

      /**
       * Checks if `value` is a property name and not a property path.
       *
       * @private
       * @param {*} value The value to check.
       * @param {Object} [object] The object to query keys on.
       * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
       */
      function isKey(value, object) {
        if (isArray(value)) {
          return false;
        }
        var type = typeof value;
        if (type == 'number' || type == 'symbol' || type == 'boolean' ||
            value == null || isSymbol(value)) {
          return true;
        }
        return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
          (object != null && value in Object(object));
      }

      /**
       * Checks if `value` is suitable for use as unique object key.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
       */
      function isKeyable(value) {
        var type = typeof value;
        return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
          ? (value !== '__proto__')
          : (value === null);
      }

      /**
       * Checks if `func` has a lazy counterpart.
       *
       * @private
       * @param {Function} func The function to check.
       * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
       *  else `false`.
       */
      function isLaziable(func) {
        var funcName = getFuncName(func),
            other = lodash[funcName];

        if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
          return false;
        }
        if (func === other) {
          return true;
        }
        var data = getData(other);
        return !!data && func === data[0];
      }

      /**
       * Checks if `func` has its source masked.
       *
       * @private
       * @param {Function} func The function to check.
       * @returns {boolean} Returns `true` if `func` is masked, else `false`.
       */
      function isMasked(func) {
        return !!maskSrcKey && (maskSrcKey in func);
      }

      /**
       * Checks if `func` is capable of being masked.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
       */
      var isMaskable = coreJsData ? isFunction : stubFalse;

      /**
       * Checks if `value` is likely a prototype object.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
       */
      function isPrototype(value) {
        var Ctor = value && value.constructor,
            proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

        return value === proto;
      }

      /**
       * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` if suitable for strict
       *  equality comparisons, else `false`.
       */
      function isStrictComparable(value) {
        return value === value && !isObject(value);
      }

      /**
       * A specialized version of `matchesProperty` for source values suitable
       * for strict equality comparisons, i.e. `===`.
       *
       * @private
       * @param {string} key The key of the property to get.
       * @param {*} srcValue The value to match.
       * @returns {Function} Returns the new spec function.
       */
      function matchesStrictComparable(key, srcValue) {
        return function(object) {
          if (object == null) {
            return false;
          }
          return object[key] === srcValue &&
            (srcValue !== undefined$1 || (key in Object(object)));
        };
      }

      /**
       * A specialized version of `_.memoize` which clears the memoized function's
       * cache when it exceeds `MAX_MEMOIZE_SIZE`.
       *
       * @private
       * @param {Function} func The function to have its output memoized.
       * @returns {Function} Returns the new memoized function.
       */
      function memoizeCapped(func) {
        var result = memoize(func, function(key) {
          if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
          }
          return key;
        });

        var cache = result.cache;
        return result;
      }

      /**
       * Merges the function metadata of `source` into `data`.
       *
       * Merging metadata reduces the number of wrappers used to invoke a function.
       * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
       * may be applied regardless of execution order. Methods like `_.ary` and
       * `_.rearg` modify function arguments, making the order in which they are
       * executed important, preventing the merging of metadata. However, we make
       * an exception for a safe combined case where curried functions have `_.ary`
       * and or `_.rearg` applied.
       *
       * @private
       * @param {Array} data The destination metadata.
       * @param {Array} source The source metadata.
       * @returns {Array} Returns `data`.
       */
      function mergeData(data, source) {
        var bitmask = data[1],
            srcBitmask = source[1],
            newBitmask = bitmask | srcBitmask,
            isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);

        var isCombo =
          ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) ||
          ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) ||
          ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));

        // Exit early if metadata can't be merged.
        if (!(isCommon || isCombo)) {
          return data;
        }
        // Use source `thisArg` if available.
        if (srcBitmask & WRAP_BIND_FLAG) {
          data[2] = source[2];
          // Set when currying a bound function.
          newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
        }
        // Compose partial arguments.
        var value = source[3];
        if (value) {
          var partials = data[3];
          data[3] = partials ? composeArgs(partials, value, source[4]) : value;
          data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
        }
        // Compose partial right arguments.
        value = source[5];
        if (value) {
          partials = data[5];
          data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
          data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
        }
        // Use source `argPos` if available.
        value = source[7];
        if (value) {
          data[7] = value;
        }
        // Use source `ary` if it's smaller.
        if (srcBitmask & WRAP_ARY_FLAG) {
          data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
        }
        // Use source `arity` if one is not provided.
        if (data[9] == null) {
          data[9] = source[9];
        }
        // Use source `func` and merge bitmasks.
        data[0] = source[0];
        data[1] = newBitmask;

        return data;
      }

      /**
       * This function is like
       * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
       * except that it includes inherited enumerable properties.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       */
      function nativeKeysIn(object) {
        var result = [];
        if (object != null) {
          for (var key in Object(object)) {
            result.push(key);
          }
        }
        return result;
      }

      /**
       * Converts `value` to a string using `Object.prototype.toString`.
       *
       * @private
       * @param {*} value The value to convert.
       * @returns {string} Returns the converted string.
       */
      function objectToString(value) {
        return nativeObjectToString.call(value);
      }

      /**
       * A specialized version of `baseRest` which transforms the rest array.
       *
       * @private
       * @param {Function} func The function to apply a rest parameter to.
       * @param {number} [start=func.length-1] The start position of the rest parameter.
       * @param {Function} transform The rest array transform.
       * @returns {Function} Returns the new function.
       */
      function overRest(func, start, transform) {
        start = nativeMax(start === undefined$1 ? (func.length - 1) : start, 0);
        return function() {
          var args = arguments,
              index = -1,
              length = nativeMax(args.length - start, 0),
              array = Array(length);

          while (++index < length) {
            array[index] = args[start + index];
          }
          index = -1;
          var otherArgs = Array(start + 1);
          while (++index < start) {
            otherArgs[index] = args[index];
          }
          otherArgs[start] = transform(array);
          return apply(func, this, otherArgs);
        };
      }

      /**
       * Gets the parent value at `path` of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array} path The path to get the parent value of.
       * @returns {*} Returns the parent value.
       */
      function parent(object, path) {
        return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
      }

      /**
       * Reorder `array` according to the specified indexes where the element at
       * the first index is assigned as the first element, the element at
       * the second index is assigned as the second element, and so on.
       *
       * @private
       * @param {Array} array The array to reorder.
       * @param {Array} indexes The arranged array indexes.
       * @returns {Array} Returns `array`.
       */
      function reorder(array, indexes) {
        var arrLength = array.length,
            length = nativeMin(indexes.length, arrLength),
            oldArray = copyArray(array);

        while (length--) {
          var index = indexes[length];
          array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined$1;
        }
        return array;
      }

      /**
       * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
       *
       * @private
       * @param {Object} object The object to query.
       * @param {string} key The key of the property to get.
       * @returns {*} Returns the property value.
       */
      function safeGet(object, key) {
        if (key === 'constructor' && typeof object[key] === 'function') {
          return;
        }

        if (key == '__proto__') {
          return;
        }

        return object[key];
      }

      /**
       * Sets metadata for `func`.
       *
       * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
       * period of time, it will trip its breaker and transition to an identity
       * function to avoid garbage collection pauses in V8. See
       * [V8 issue 2070](https://bugs.chromium.org/p/v8/issues/detail?id=2070)
       * for more details.
       *
       * @private
       * @param {Function} func The function to associate metadata with.
       * @param {*} data The metadata.
       * @returns {Function} Returns `func`.
       */
      var setData = shortOut(baseSetData);

      /**
       * A simple wrapper around the global [`setTimeout`](https://mdn.io/setTimeout).
       *
       * @private
       * @param {Function} func The function to delay.
       * @param {number} wait The number of milliseconds to delay invocation.
       * @returns {number|Object} Returns the timer id or timeout object.
       */
      var setTimeout = ctxSetTimeout || function(func, wait) {
        return root.setTimeout(func, wait);
      };

      /**
       * Sets the `toString` method of `func` to return `string`.
       *
       * @private
       * @param {Function} func The function to modify.
       * @param {Function} string The `toString` result.
       * @returns {Function} Returns `func`.
       */
      var setToString = shortOut(baseSetToString);

      /**
       * Sets the `toString` method of `wrapper` to mimic the source of `reference`
       * with wrapper details in a comment at the top of the source body.
       *
       * @private
       * @param {Function} wrapper The function to modify.
       * @param {Function} reference The reference function.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @returns {Function} Returns `wrapper`.
       */
      function setWrapToString(wrapper, reference, bitmask) {
        var source = (reference + '');
        return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
      }

      /**
       * Creates a function that'll short out and invoke `identity` instead
       * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
       * milliseconds.
       *
       * @private
       * @param {Function} func The function to restrict.
       * @returns {Function} Returns the new shortable function.
       */
      function shortOut(func) {
        var count = 0,
            lastCalled = 0;

        return function() {
          var stamp = nativeNow(),
              remaining = HOT_SPAN - (stamp - lastCalled);

          lastCalled = stamp;
          if (remaining > 0) {
            if (++count >= HOT_COUNT) {
              return arguments[0];
            }
          } else {
            count = 0;
          }
          return func.apply(undefined$1, arguments);
        };
      }

      /**
       * A specialized version of `_.shuffle` which mutates and sets the size of `array`.
       *
       * @private
       * @param {Array} array The array to shuffle.
       * @param {number} [size=array.length] The size of `array`.
       * @returns {Array} Returns `array`.
       */
      function shuffleSelf(array, size) {
        var index = -1,
            length = array.length,
            lastIndex = length - 1;

        size = size === undefined$1 ? length : size;
        while (++index < size) {
          var rand = baseRandom(index, lastIndex),
              value = array[rand];

          array[rand] = array[index];
          array[index] = value;
        }
        array.length = size;
        return array;
      }

      /**
       * Converts `string` to a property path array.
       *
       * @private
       * @param {string} string The string to convert.
       * @returns {Array} Returns the property path array.
       */
      var stringToPath = memoizeCapped(function(string) {
        var result = [];
        if (string.charCodeAt(0) === 46 /* . */) {
          result.push('');
        }
        string.replace(rePropName, function(match, number, quote, subString) {
          result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
        });
        return result;
      });

      /**
       * Converts `value` to a string key if it's not a string or symbol.
       *
       * @private
       * @param {*} value The value to inspect.
       * @returns {string|symbol} Returns the key.
       */
      function toKey(value) {
        if (typeof value == 'string' || isSymbol(value)) {
          return value;
        }
        var result = (value + '');
        return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
      }

      /**
       * Converts `func` to its source code.
       *
       * @private
       * @param {Function} func The function to convert.
       * @returns {string} Returns the source code.
       */
      function toSource(func) {
        if (func != null) {
          try {
            return funcToString.call(func);
          } catch (e) {}
          try {
            return (func + '');
          } catch (e) {}
        }
        return '';
      }

      /**
       * Updates wrapper `details` based on `bitmask` flags.
       *
       * @private
       * @returns {Array} details The details to modify.
       * @param {number} bitmask The bitmask flags. See `createWrap` for more details.
       * @returns {Array} Returns `details`.
       */
      function updateWrapDetails(details, bitmask) {
        arrayEach(wrapFlags, function(pair) {
          var value = '_.' + pair[0];
          if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
            details.push(value);
          }
        });
        return details.sort();
      }

      /**
       * Creates a clone of `wrapper`.
       *
       * @private
       * @param {Object} wrapper The wrapper to clone.
       * @returns {Object} Returns the cloned wrapper.
       */
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result.__actions__ = copyArray(wrapper.__actions__);
        result.__index__  = wrapper.__index__;
        result.__values__ = wrapper.__values__;
        return result;
      }

      /*------------------------------------------------------------------------*/

      /**
       * Creates an array of elements split into groups the length of `size`.
       * If `array` can't be split evenly, the final chunk will be the remaining
       * elements.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to process.
       * @param {number} [size=1] The length of each chunk
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the new array of chunks.
       * @example
       *
       * _.chunk(['a', 'b', 'c', 'd'], 2);
       * // => [['a', 'b'], ['c', 'd']]
       *
       * _.chunk(['a', 'b', 'c', 'd'], 3);
       * // => [['a', 'b', 'c'], ['d']]
       */
      function chunk(array, size, guard) {
        if ((guard ? isIterateeCall(array, size, guard) : size === undefined$1)) {
          size = 1;
        } else {
          size = nativeMax(toInteger(size), 0);
        }
        var length = array == null ? 0 : array.length;
        if (!length || size < 1) {
          return [];
        }
        var index = 0,
            resIndex = 0,
            result = Array(nativeCeil(length / size));

        while (index < length) {
          result[resIndex++] = baseSlice(array, index, (index += size));
        }
        return result;
      }

      /**
       * Creates an array with all falsey values removed. The values `false`, `null`,
       * `0`, `""`, `undefined`, and `NaN` are falsey.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to compact.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * _.compact([0, 1, false, 2, '', 3]);
       * // => [1, 2, 3]
       */
      function compact(array) {
        var index = -1,
            length = array == null ? 0 : array.length,
            resIndex = 0,
            result = [];

        while (++index < length) {
          var value = array[index];
          if (value) {
            result[resIndex++] = value;
          }
        }
        return result;
      }

      /**
       * Creates a new array concatenating `array` with any additional arrays
       * and/or values.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to concatenate.
       * @param {...*} [values] The values to concatenate.
       * @returns {Array} Returns the new concatenated array.
       * @example
       *
       * var array = [1];
       * var other = _.concat(array, 2, [3], [[4]]);
       *
       * console.log(other);
       * // => [1, 2, 3, [4]]
       *
       * console.log(array);
       * // => [1]
       */
      function concat() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array(length - 1),
            array = arguments[0],
            index = length;

        while (index--) {
          args[index - 1] = arguments[index];
        }
        return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
      }

      /**
       * Creates an array of `array` values not included in the other given arrays
       * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons. The order and references of result values are
       * determined by the first array.
       *
       * **Note:** Unlike `_.pullAll`, this method returns a new array.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {...Array} [values] The values to exclude.
       * @returns {Array} Returns the new array of filtered values.
       * @see _.without, _.xor
       * @example
       *
       * _.difference([2, 1], [2, 3]);
       * // => [1]
       */
      var difference = baseRest(function(array, values) {
        return isArrayLikeObject(array)
          ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true))
          : [];
      });

      /**
       * This method is like `_.difference` except that it accepts `iteratee` which
       * is invoked for each element of `array` and `values` to generate the criterion
       * by which they're compared. The order and references of result values are
       * determined by the first array. The iteratee is invoked with one argument:
       * (value).
       *
       * **Note:** Unlike `_.pullAllBy`, this method returns a new array.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {...Array} [values] The values to exclude.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * _.differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor);
       * // => [1.2]
       *
       * // The `_.property` iteratee shorthand.
       * _.differenceBy([{ 'x': 2 }, { 'x': 1 }], [{ 'x': 1 }], 'x');
       * // => [{ 'x': 2 }]
       */
      var differenceBy = baseRest(function(array, values) {
        var iteratee = last(values);
        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined$1;
        }
        return isArrayLikeObject(array)
          ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2))
          : [];
      });

      /**
       * This method is like `_.difference` except that it accepts `comparator`
       * which is invoked to compare elements of `array` to `values`. The order and
       * references of result values are determined by the first array. The comparator
       * is invoked with two arguments: (arrVal, othVal).
       *
       * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {...Array} [values] The values to exclude.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       *
       * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
       * // => [{ 'x': 2, 'y': 1 }]
       */
      var differenceWith = baseRest(function(array, values) {
        var comparator = last(values);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined$1;
        }
        return isArrayLikeObject(array)
          ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined$1, comparator)
          : [];
      });

      /**
       * Creates a slice of `array` with `n` elements dropped from the beginning.
       *
       * @static
       * @memberOf _
       * @since 0.5.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {number} [n=1] The number of elements to drop.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * _.drop([1, 2, 3]);
       * // => [2, 3]
       *
       * _.drop([1, 2, 3], 2);
       * // => [3]
       *
       * _.drop([1, 2, 3], 5);
       * // => []
       *
       * _.drop([1, 2, 3], 0);
       * // => [1, 2, 3]
       */
      function drop(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = (guard || n === undefined$1) ? 1 : toInteger(n);
        return baseSlice(array, n < 0 ? 0 : n, length);
      }

      /**
       * Creates a slice of `array` with `n` elements dropped from the end.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {number} [n=1] The number of elements to drop.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * _.dropRight([1, 2, 3]);
       * // => [1, 2]
       *
       * _.dropRight([1, 2, 3], 2);
       * // => [1]
       *
       * _.dropRight([1, 2, 3], 5);
       * // => []
       *
       * _.dropRight([1, 2, 3], 0);
       * // => [1, 2, 3]
       */
      function dropRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = (guard || n === undefined$1) ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }

      /**
       * Creates a slice of `array` excluding elements dropped from the end.
       * Elements are dropped until `predicate` returns falsey. The predicate is
       * invoked with three arguments: (value, index, array).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'active': true },
       *   { 'user': 'fred',    'active': false },
       *   { 'user': 'pebbles', 'active': false }
       * ];
       *
       * _.dropRightWhile(users, function(o) { return !o.active; });
       * // => objects for ['barney']
       *
       * // The `_.matches` iteratee shorthand.
       * _.dropRightWhile(users, { 'user': 'pebbles', 'active': false });
       * // => objects for ['barney', 'fred']
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.dropRightWhile(users, ['active', false]);
       * // => objects for ['barney']
       *
       * // The `_.property` iteratee shorthand.
       * _.dropRightWhile(users, 'active');
       * // => objects for ['barney', 'fred', 'pebbles']
       */
      function dropRightWhile(array, predicate) {
        return (array && array.length)
          ? baseWhile(array, getIteratee(predicate, 3), true, true)
          : [];
      }

      /**
       * Creates a slice of `array` excluding elements dropped from the beginning.
       * Elements are dropped until `predicate` returns falsey. The predicate is
       * invoked with three arguments: (value, index, array).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'active': false },
       *   { 'user': 'fred',    'active': false },
       *   { 'user': 'pebbles', 'active': true }
       * ];
       *
       * _.dropWhile(users, function(o) { return !o.active; });
       * // => objects for ['pebbles']
       *
       * // The `_.matches` iteratee shorthand.
       * _.dropWhile(users, { 'user': 'barney', 'active': false });
       * // => objects for ['fred', 'pebbles']
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.dropWhile(users, ['active', false]);
       * // => objects for ['pebbles']
       *
       * // The `_.property` iteratee shorthand.
       * _.dropWhile(users, 'active');
       * // => objects for ['barney', 'fred', 'pebbles']
       */
      function dropWhile(array, predicate) {
        return (array && array.length)
          ? baseWhile(array, getIteratee(predicate, 3), true)
          : [];
      }

      /**
       * Fills elements of `array` with `value` from `start` up to, but not
       * including, `end`.
       *
       * **Note:** This method mutates `array`.
       *
       * @static
       * @memberOf _
       * @since 3.2.0
       * @category Array
       * @param {Array} array The array to fill.
       * @param {*} value The value to fill `array` with.
       * @param {number} [start=0] The start position.
       * @param {number} [end=array.length] The end position.
       * @returns {Array} Returns `array`.
       * @example
       *
       * var array = [1, 2, 3];
       *
       * _.fill(array, 'a');
       * console.log(array);
       * // => ['a', 'a', 'a']
       *
       * _.fill(Array(3), 2);
       * // => [2, 2, 2]
       *
       * _.fill([4, 6, 8, 10], '*', 1, 3);
       * // => [4, '*', '*', 10]
       */
      function fill(array, value, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
          start = 0;
          end = length;
        }
        return baseFill(array, value, start, end);
      }

      /**
       * This method is like `_.find` except that it returns the index of the first
       * element `predicate` returns truthy for instead of the element itself.
       *
       * @static
       * @memberOf _
       * @since 1.1.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @param {number} [fromIndex=0] The index to search from.
       * @returns {number} Returns the index of the found element, else `-1`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'active': false },
       *   { 'user': 'fred',    'active': false },
       *   { 'user': 'pebbles', 'active': true }
       * ];
       *
       * _.findIndex(users, function(o) { return o.user == 'barney'; });
       * // => 0
       *
       * // The `_.matches` iteratee shorthand.
       * _.findIndex(users, { 'user': 'fred', 'active': false });
       * // => 1
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.findIndex(users, ['active', false]);
       * // => 0
       *
       * // The `_.property` iteratee shorthand.
       * _.findIndex(users, 'active');
       * // => 2
       */
      function findIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index);
      }

      /**
       * This method is like `_.findIndex` except that it iterates over elements
       * of `collection` from right to left.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @param {number} [fromIndex=array.length-1] The index to search from.
       * @returns {number} Returns the index of the found element, else `-1`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'active': true },
       *   { 'user': 'fred',    'active': false },
       *   { 'user': 'pebbles', 'active': false }
       * ];
       *
       * _.findLastIndex(users, function(o) { return o.user == 'pebbles'; });
       * // => 2
       *
       * // The `_.matches` iteratee shorthand.
       * _.findLastIndex(users, { 'user': 'barney', 'active': true });
       * // => 0
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.findLastIndex(users, ['active', false]);
       * // => 2
       *
       * // The `_.property` iteratee shorthand.
       * _.findLastIndex(users, 'active');
       * // => 0
       */
      function findLastIndex(array, predicate, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = length - 1;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = fromIndex < 0
            ? nativeMax(length + index, 0)
            : nativeMin(index, length - 1);
        }
        return baseFindIndex(array, getIteratee(predicate, 3), index, true);
      }

      /**
       * Flattens `array` a single level deep.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to flatten.
       * @returns {Array} Returns the new flattened array.
       * @example
       *
       * _.flatten([1, [2, [3, [4]], 5]]);
       * // => [1, 2, [3, [4]], 5]
       */
      function flatten(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, 1) : [];
      }

      /**
       * Recursively flattens `array`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to flatten.
       * @returns {Array} Returns the new flattened array.
       * @example
       *
       * _.flattenDeep([1, [2, [3, [4]], 5]]);
       * // => [1, 2, 3, 4, 5]
       */
      function flattenDeep(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseFlatten(array, INFINITY) : [];
      }

      /**
       * Recursively flatten `array` up to `depth` times.
       *
       * @static
       * @memberOf _
       * @since 4.4.0
       * @category Array
       * @param {Array} array The array to flatten.
       * @param {number} [depth=1] The maximum recursion depth.
       * @returns {Array} Returns the new flattened array.
       * @example
       *
       * var array = [1, [2, [3, [4]], 5]];
       *
       * _.flattenDepth(array, 1);
       * // => [1, 2, [3, [4]], 5]
       *
       * _.flattenDepth(array, 2);
       * // => [1, 2, 3, [4], 5]
       */
      function flattenDepth(array, depth) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(array, depth);
      }

      /**
       * The inverse of `_.toPairs`; this method returns an object composed
       * from key-value `pairs`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} pairs The key-value pairs.
       * @returns {Object} Returns the new object.
       * @example
       *
       * _.fromPairs([['a', 1], ['b', 2]]);
       * // => { 'a': 1, 'b': 2 }
       */
      function fromPairs(pairs) {
        var index = -1,
            length = pairs == null ? 0 : pairs.length,
            result = {};

        while (++index < length) {
          var pair = pairs[index];
          result[pair[0]] = pair[1];
        }
        return result;
      }

      /**
       * Gets the first element of `array`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @alias first
       * @category Array
       * @param {Array} array The array to query.
       * @returns {*} Returns the first element of `array`.
       * @example
       *
       * _.head([1, 2, 3]);
       * // => 1
       *
       * _.head([]);
       * // => undefined
       */
      function head(array) {
        return (array && array.length) ? array[0] : undefined$1;
      }

      /**
       * Gets the index at which the first occurrence of `value` is found in `array`
       * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons. If `fromIndex` is negative, it's used as the
       * offset from the end of `array`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} [fromIndex=0] The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       * @example
       *
       * _.indexOf([1, 2, 1, 2], 2);
       * // => 1
       *
       * // Search from the `fromIndex`.
       * _.indexOf([1, 2, 1, 2], 2, 2);
       * // => 3
       */
      function indexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = fromIndex == null ? 0 : toInteger(fromIndex);
        if (index < 0) {
          index = nativeMax(length + index, 0);
        }
        return baseIndexOf(array, value, index);
      }

      /**
       * Gets all but the last element of `array`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to query.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * _.initial([1, 2, 3]);
       * // => [1, 2]
       */
      function initial(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 0, -1) : [];
      }

      /**
       * Creates an array of unique values that are included in all given arrays
       * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons. The order and references of result values are
       * determined by the first array.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @returns {Array} Returns the new array of intersecting values.
       * @example
       *
       * _.intersection([2, 1], [2, 3]);
       * // => [2]
       */
      var intersection = baseRest(function(arrays) {
        var mapped = arrayMap(arrays, castArrayLikeObject);
        return (mapped.length && mapped[0] === arrays[0])
          ? baseIntersection(mapped)
          : [];
      });

      /**
       * This method is like `_.intersection` except that it accepts `iteratee`
       * which is invoked for each element of each `arrays` to generate the criterion
       * by which they're compared. The order and references of result values are
       * determined by the first array. The iteratee is invoked with one argument:
       * (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new array of intersecting values.
       * @example
       *
       * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
       * // => [2.1]
       *
       * // The `_.property` iteratee shorthand.
       * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
       * // => [{ 'x': 1 }]
       */
      var intersectionBy = baseRest(function(arrays) {
        var iteratee = last(arrays),
            mapped = arrayMap(arrays, castArrayLikeObject);

        if (iteratee === last(mapped)) {
          iteratee = undefined$1;
        } else {
          mapped.pop();
        }
        return (mapped.length && mapped[0] === arrays[0])
          ? baseIntersection(mapped, getIteratee(iteratee, 2))
          : [];
      });

      /**
       * This method is like `_.intersection` except that it accepts `comparator`
       * which is invoked to compare elements of `arrays`. The order and references
       * of result values are determined by the first array. The comparator is
       * invoked with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of intersecting values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.intersectionWith(objects, others, _.isEqual);
       * // => [{ 'x': 1, 'y': 2 }]
       */
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays),
            mapped = arrayMap(arrays, castArrayLikeObject);

        comparator = typeof comparator == 'function' ? comparator : undefined$1;
        if (comparator) {
          mapped.pop();
        }
        return (mapped.length && mapped[0] === arrays[0])
          ? baseIntersection(mapped, undefined$1, comparator)
          : [];
      });

      /**
       * Converts all elements in `array` into a string separated by `separator`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to convert.
       * @param {string} [separator=','] The element separator.
       * @returns {string} Returns the joined string.
       * @example
       *
       * _.join(['a', 'b', 'c'], '~');
       * // => 'a~b~c'
       */
      function join(array, separator) {
        return array == null ? '' : nativeJoin.call(array, separator);
      }

      /**
       * Gets the last element of `array`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to query.
       * @returns {*} Returns the last element of `array`.
       * @example
       *
       * _.last([1, 2, 3]);
       * // => 3
       */
      function last(array) {
        var length = array == null ? 0 : array.length;
        return length ? array[length - 1] : undefined$1;
      }

      /**
       * This method is like `_.indexOf` except that it iterates over elements of
       * `array` from right to left.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @param {number} [fromIndex=array.length-1] The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       * @example
       *
       * _.lastIndexOf([1, 2, 1, 2], 2);
       * // => 3
       *
       * // Search from the `fromIndex`.
       * _.lastIndexOf([1, 2, 1, 2], 2, 2);
       * // => 1
       */
      function lastIndexOf(array, value, fromIndex) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return -1;
        }
        var index = length;
        if (fromIndex !== undefined$1) {
          index = toInteger(fromIndex);
          index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
        }
        return value === value
          ? strictLastIndexOf(array, value, index)
          : baseFindIndex(array, baseIsNaN, index, true);
      }

      /**
       * Gets the element at index `n` of `array`. If `n` is negative, the nth
       * element from the end is returned.
       *
       * @static
       * @memberOf _
       * @since 4.11.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {number} [n=0] The index of the element to return.
       * @returns {*} Returns the nth element of `array`.
       * @example
       *
       * var array = ['a', 'b', 'c', 'd'];
       *
       * _.nth(array, 1);
       * // => 'b'
       *
       * _.nth(array, -2);
       * // => 'c';
       */
      function nth(array, n) {
        return (array && array.length) ? baseNth(array, toInteger(n)) : undefined$1;
      }

      /**
       * Removes all given values from `array` using
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons.
       *
       * **Note:** Unlike `_.without`, this method mutates `array`. Use `_.remove`
       * to remove elements from an array by predicate.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Array
       * @param {Array} array The array to modify.
       * @param {...*} [values] The values to remove.
       * @returns {Array} Returns `array`.
       * @example
       *
       * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
       *
       * _.pull(array, 'a', 'c');
       * console.log(array);
       * // => ['b', 'b']
       */
      var pull = baseRest(pullAll);

      /**
       * This method is like `_.pull` except that it accepts an array of values to remove.
       *
       * **Note:** Unlike `_.difference`, this method mutates `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to modify.
       * @param {Array} values The values to remove.
       * @returns {Array} Returns `array`.
       * @example
       *
       * var array = ['a', 'b', 'c', 'a', 'b', 'c'];
       *
       * _.pullAll(array, ['a', 'c']);
       * console.log(array);
       * // => ['b', 'b']
       */
      function pullAll(array, values) {
        return (array && array.length && values && values.length)
          ? basePullAll(array, values)
          : array;
      }

      /**
       * This method is like `_.pullAll` except that it accepts `iteratee` which is
       * invoked for each element of `array` and `values` to generate the criterion
       * by which they're compared. The iteratee is invoked with one argument: (value).
       *
       * **Note:** Unlike `_.differenceBy`, this method mutates `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to modify.
       * @param {Array} values The values to remove.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns `array`.
       * @example
       *
       * var array = [{ 'x': 1 }, { 'x': 2 }, { 'x': 3 }, { 'x': 1 }];
       *
       * _.pullAllBy(array, [{ 'x': 1 }, { 'x': 3 }], 'x');
       * console.log(array);
       * // => [{ 'x': 2 }]
       */
      function pullAllBy(array, values, iteratee) {
        return (array && array.length && values && values.length)
          ? basePullAll(array, values, getIteratee(iteratee, 2))
          : array;
      }

      /**
       * This method is like `_.pullAll` except that it accepts `comparator` which
       * is invoked to compare elements of `array` to `values`. The comparator is
       * invoked with two arguments: (arrVal, othVal).
       *
       * **Note:** Unlike `_.differenceWith`, this method mutates `array`.
       *
       * @static
       * @memberOf _
       * @since 4.6.0
       * @category Array
       * @param {Array} array The array to modify.
       * @param {Array} values The values to remove.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns `array`.
       * @example
       *
       * var array = [{ 'x': 1, 'y': 2 }, { 'x': 3, 'y': 4 }, { 'x': 5, 'y': 6 }];
       *
       * _.pullAllWith(array, [{ 'x': 3, 'y': 4 }], _.isEqual);
       * console.log(array);
       * // => [{ 'x': 1, 'y': 2 }, { 'x': 5, 'y': 6 }]
       */
      function pullAllWith(array, values, comparator) {
        return (array && array.length && values && values.length)
          ? basePullAll(array, values, undefined$1, comparator)
          : array;
      }

      /**
       * Removes elements from `array` corresponding to `indexes` and returns an
       * array of removed elements.
       *
       * **Note:** Unlike `_.at`, this method mutates `array`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to modify.
       * @param {...(number|number[])} [indexes] The indexes of elements to remove.
       * @returns {Array} Returns the new array of removed elements.
       * @example
       *
       * var array = ['a', 'b', 'c', 'd'];
       * var pulled = _.pullAt(array, [1, 3]);
       *
       * console.log(array);
       * // => ['a', 'c']
       *
       * console.log(pulled);
       * // => ['b', 'd']
       */
      var pullAt = flatRest(function(array, indexes) {
        var length = array == null ? 0 : array.length,
            result = baseAt(array, indexes);

        basePullAt(array, arrayMap(indexes, function(index) {
          return isIndex(index, length) ? +index : index;
        }).sort(compareAscending));

        return result;
      });

      /**
       * Removes all elements from `array` that `predicate` returns truthy for
       * and returns an array of the removed elements. The predicate is invoked
       * with three arguments: (value, index, array).
       *
       * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
       * to pull elements from an array by value.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Array
       * @param {Array} array The array to modify.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new array of removed elements.
       * @example
       *
       * var array = [1, 2, 3, 4];
       * var evens = _.remove(array, function(n) {
       *   return n % 2 == 0;
       * });
       *
       * console.log(array);
       * // => [1, 3]
       *
       * console.log(evens);
       * // => [2, 4]
       */
      function remove(array, predicate) {
        var result = [];
        if (!(array && array.length)) {
          return result;
        }
        var index = -1,
            indexes = [],
            length = array.length;

        predicate = getIteratee(predicate, 3);
        while (++index < length) {
          var value = array[index];
          if (predicate(value, index, array)) {
            result.push(value);
            indexes.push(index);
          }
        }
        basePullAt(array, indexes);
        return result;
      }

      /**
       * Reverses `array` so that the first element becomes the last, the second
       * element becomes the second to last, and so on.
       *
       * **Note:** This method mutates `array` and is based on
       * [`Array#reverse`](https://mdn.io/Array/reverse).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to modify.
       * @returns {Array} Returns `array`.
       * @example
       *
       * var array = [1, 2, 3];
       *
       * _.reverse(array);
       * // => [3, 2, 1]
       *
       * console.log(array);
       * // => [3, 2, 1]
       */
      function reverse(array) {
        return array == null ? array : nativeReverse.call(array);
      }

      /**
       * Creates a slice of `array` from `start` up to, but not including, `end`.
       *
       * **Note:** This method is used instead of
       * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
       * returned.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to slice.
       * @param {number} [start=0] The start position.
       * @param {number} [end=array.length] The end position.
       * @returns {Array} Returns the slice of `array`.
       */
      function slice(array, start, end) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
          start = 0;
          end = length;
        }
        else {
          start = start == null ? 0 : toInteger(start);
          end = end === undefined$1 ? length : toInteger(end);
        }
        return baseSlice(array, start, end);
      }

      /**
       * Uses a binary search to determine the lowest index at which `value`
       * should be inserted into `array` in order to maintain its sort order.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The sorted array to inspect.
       * @param {*} value The value to evaluate.
       * @returns {number} Returns the index at which `value` should be inserted
       *  into `array`.
       * @example
       *
       * _.sortedIndex([30, 50], 40);
       * // => 1
       */
      function sortedIndex(array, value) {
        return baseSortedIndex(array, value);
      }

      /**
       * This method is like `_.sortedIndex` except that it accepts `iteratee`
       * which is invoked for `value` and each element of `array` to compute their
       * sort ranking. The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The sorted array to inspect.
       * @param {*} value The value to evaluate.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {number} Returns the index at which `value` should be inserted
       *  into `array`.
       * @example
       *
       * var objects = [{ 'x': 4 }, { 'x': 5 }];
       *
       * _.sortedIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
       * // => 0
       *
       * // The `_.property` iteratee shorthand.
       * _.sortedIndexBy(objects, { 'x': 4 }, 'x');
       * // => 0
       */
      function sortedIndexBy(array, value, iteratee) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee, 2));
      }

      /**
       * This method is like `_.indexOf` except that it performs a binary
       * search on a sorted `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @returns {number} Returns the index of the matched value, else `-1`.
       * @example
       *
       * _.sortedIndexOf([4, 5, 5, 5, 6], 5);
       * // => 1
       */
      function sortedIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index = baseSortedIndex(array, value);
          if (index < length && eq(array[index], value)) {
            return index;
          }
        }
        return -1;
      }

      /**
       * This method is like `_.sortedIndex` except that it returns the highest
       * index at which `value` should be inserted into `array` in order to
       * maintain its sort order.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The sorted array to inspect.
       * @param {*} value The value to evaluate.
       * @returns {number} Returns the index at which `value` should be inserted
       *  into `array`.
       * @example
       *
       * _.sortedLastIndex([4, 5, 5, 5, 6], 5);
       * // => 4
       */
      function sortedLastIndex(array, value) {
        return baseSortedIndex(array, value, true);
      }

      /**
       * This method is like `_.sortedLastIndex` except that it accepts `iteratee`
       * which is invoked for `value` and each element of `array` to compute their
       * sort ranking. The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The sorted array to inspect.
       * @param {*} value The value to evaluate.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {number} Returns the index at which `value` should be inserted
       *  into `array`.
       * @example
       *
       * var objects = [{ 'x': 4 }, { 'x': 5 }];
       *
       * _.sortedLastIndexBy(objects, { 'x': 4 }, function(o) { return o.x; });
       * // => 1
       *
       * // The `_.property` iteratee shorthand.
       * _.sortedLastIndexBy(objects, { 'x': 4 }, 'x');
       * // => 1
       */
      function sortedLastIndexBy(array, value, iteratee) {
        return baseSortedIndexBy(array, value, getIteratee(iteratee, 2), true);
      }

      /**
       * This method is like `_.lastIndexOf` except that it performs a binary
       * search on a sorted `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {*} value The value to search for.
       * @returns {number} Returns the index of the matched value, else `-1`.
       * @example
       *
       * _.sortedLastIndexOf([4, 5, 5, 5, 6], 5);
       * // => 3
       */
      function sortedLastIndexOf(array, value) {
        var length = array == null ? 0 : array.length;
        if (length) {
          var index = baseSortedIndex(array, value, true) - 1;
          if (eq(array[index], value)) {
            return index;
          }
        }
        return -1;
      }

      /**
       * This method is like `_.uniq` except that it's designed and optimized
       * for sorted arrays.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @returns {Array} Returns the new duplicate free array.
       * @example
       *
       * _.sortedUniq([1, 1, 2]);
       * // => [1, 2]
       */
      function sortedUniq(array) {
        return (array && array.length)
          ? baseSortedUniq(array)
          : [];
      }

      /**
       * This method is like `_.uniqBy` except that it's designed and optimized
       * for sorted arrays.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @returns {Array} Returns the new duplicate free array.
       * @example
       *
       * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
       * // => [1.1, 2.3]
       */
      function sortedUniqBy(array, iteratee) {
        return (array && array.length)
          ? baseSortedUniq(array, getIteratee(iteratee, 2))
          : [];
      }

      /**
       * Gets all but the first element of `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * _.tail([1, 2, 3]);
       * // => [2, 3]
       */
      function tail(array) {
        var length = array == null ? 0 : array.length;
        return length ? baseSlice(array, 1, length) : [];
      }

      /**
       * Creates a slice of `array` with `n` elements taken from the beginning.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {number} [n=1] The number of elements to take.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * _.take([1, 2, 3]);
       * // => [1]
       *
       * _.take([1, 2, 3], 2);
       * // => [1, 2]
       *
       * _.take([1, 2, 3], 5);
       * // => [1, 2, 3]
       *
       * _.take([1, 2, 3], 0);
       * // => []
       */
      function take(array, n, guard) {
        if (!(array && array.length)) {
          return [];
        }
        n = (guard || n === undefined$1) ? 1 : toInteger(n);
        return baseSlice(array, 0, n < 0 ? 0 : n);
      }

      /**
       * Creates a slice of `array` with `n` elements taken from the end.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {number} [n=1] The number of elements to take.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * _.takeRight([1, 2, 3]);
       * // => [3]
       *
       * _.takeRight([1, 2, 3], 2);
       * // => [2, 3]
       *
       * _.takeRight([1, 2, 3], 5);
       * // => [1, 2, 3]
       *
       * _.takeRight([1, 2, 3], 0);
       * // => []
       */
      function takeRight(array, n, guard) {
        var length = array == null ? 0 : array.length;
        if (!length) {
          return [];
        }
        n = (guard || n === undefined$1) ? 1 : toInteger(n);
        n = length - n;
        return baseSlice(array, n < 0 ? 0 : n, length);
      }

      /**
       * Creates a slice of `array` with elements taken from the end. Elements are
       * taken until `predicate` returns falsey. The predicate is invoked with
       * three arguments: (value, index, array).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'active': true },
       *   { 'user': 'fred',    'active': false },
       *   { 'user': 'pebbles', 'active': false }
       * ];
       *
       * _.takeRightWhile(users, function(o) { return !o.active; });
       * // => objects for ['fred', 'pebbles']
       *
       * // The `_.matches` iteratee shorthand.
       * _.takeRightWhile(users, { 'user': 'pebbles', 'active': false });
       * // => objects for ['pebbles']
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.takeRightWhile(users, ['active', false]);
       * // => objects for ['fred', 'pebbles']
       *
       * // The `_.property` iteratee shorthand.
       * _.takeRightWhile(users, 'active');
       * // => []
       */
      function takeRightWhile(array, predicate) {
        return (array && array.length)
          ? baseWhile(array, getIteratee(predicate, 3), false, true)
          : [];
      }

      /**
       * Creates a slice of `array` with elements taken from the beginning. Elements
       * are taken until `predicate` returns falsey. The predicate is invoked with
       * three arguments: (value, index, array).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Array
       * @param {Array} array The array to query.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the slice of `array`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'active': false },
       *   { 'user': 'fred',    'active': false },
       *   { 'user': 'pebbles', 'active': true }
       * ];
       *
       * _.takeWhile(users, function(o) { return !o.active; });
       * // => objects for ['barney', 'fred']
       *
       * // The `_.matches` iteratee shorthand.
       * _.takeWhile(users, { 'user': 'barney', 'active': false });
       * // => objects for ['barney']
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.takeWhile(users, ['active', false]);
       * // => objects for ['barney', 'fred']
       *
       * // The `_.property` iteratee shorthand.
       * _.takeWhile(users, 'active');
       * // => []
       */
      function takeWhile(array, predicate) {
        return (array && array.length)
          ? baseWhile(array, getIteratee(predicate, 3))
          : [];
      }

      /**
       * Creates an array of unique values, in order, from all given arrays using
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * _.union([2], [1, 2]);
       * // => [2, 1]
       */
      var union = baseRest(function(arrays) {
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
      });

      /**
       * This method is like `_.union` except that it accepts `iteratee` which is
       * invoked for each element of each `arrays` to generate the criterion by
       * which uniqueness is computed. Result values are chosen from the first
       * array in which the value occurs. The iteratee is invoked with one argument:
       * (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * _.unionBy([2.1], [1.2, 2.3], Math.floor);
       * // => [2.1, 1.2]
       *
       * // The `_.property` iteratee shorthand.
       * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
       * // => [{ 'x': 1 }, { 'x': 2 }]
       */
      var unionBy = baseRest(function(arrays) {
        var iteratee = last(arrays);
        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined$1;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
      });

      /**
       * This method is like `_.union` except that it accepts `comparator` which
       * is invoked to compare elements of `arrays`. Result values are chosen from
       * the first array in which the value occurs. The comparator is invoked
       * with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.unionWith(objects, others, _.isEqual);
       * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
       */
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == 'function' ? comparator : undefined$1;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined$1, comparator);
      });

      /**
       * Creates a duplicate-free version of an array, using
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons, in which only the first occurrence of each element
       * is kept. The order of result values is determined by the order they occur
       * in the array.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @returns {Array} Returns the new duplicate free array.
       * @example
       *
       * _.uniq([2, 1, 2]);
       * // => [2, 1]
       */
      function uniq(array) {
        return (array && array.length) ? baseUniq(array) : [];
      }

      /**
       * This method is like `_.uniq` except that it accepts `iteratee` which is
       * invoked for each element in `array` to generate the criterion by which
       * uniqueness is computed. The order of result values is determined by the
       * order they occur in the array. The iteratee is invoked with one argument:
       * (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new duplicate free array.
       * @example
       *
       * _.uniqBy([2.1, 1.2, 2.3], Math.floor);
       * // => [2.1, 1.2]
       *
       * // The `_.property` iteratee shorthand.
       * _.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
       * // => [{ 'x': 1 }, { 'x': 2 }]
       */
      function uniqBy(array, iteratee) {
        return (array && array.length) ? baseUniq(array, getIteratee(iteratee, 2)) : [];
      }

      /**
       * This method is like `_.uniq` except that it accepts `comparator` which
       * is invoked to compare elements of `array`. The order of result values is
       * determined by the order they occur in the array.The comparator is invoked
       * with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new duplicate free array.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.uniqWith(objects, _.isEqual);
       * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
       */
      function uniqWith(array, comparator) {
        comparator = typeof comparator == 'function' ? comparator : undefined$1;
        return (array && array.length) ? baseUniq(array, undefined$1, comparator) : [];
      }

      /**
       * This method is like `_.zip` except that it accepts an array of grouped
       * elements and creates an array regrouping the elements to their pre-zip
       * configuration.
       *
       * @static
       * @memberOf _
       * @since 1.2.0
       * @category Array
       * @param {Array} array The array of grouped elements to process.
       * @returns {Array} Returns the new array of regrouped elements.
       * @example
       *
       * var zipped = _.zip(['a', 'b'], [1, 2], [true, false]);
       * // => [['a', 1, true], ['b', 2, false]]
       *
       * _.unzip(zipped);
       * // => [['a', 'b'], [1, 2], [true, false]]
       */
      function unzip(array) {
        if (!(array && array.length)) {
          return [];
        }
        var length = 0;
        array = arrayFilter(array, function(group) {
          if (isArrayLikeObject(group)) {
            length = nativeMax(group.length, length);
            return true;
          }
        });
        return baseTimes(length, function(index) {
          return arrayMap(array, baseProperty(index));
        });
      }

      /**
       * This method is like `_.unzip` except that it accepts `iteratee` to specify
       * how regrouped values should be combined. The iteratee is invoked with the
       * elements of each group: (...group).
       *
       * @static
       * @memberOf _
       * @since 3.8.0
       * @category Array
       * @param {Array} array The array of grouped elements to process.
       * @param {Function} [iteratee=_.identity] The function to combine
       *  regrouped values.
       * @returns {Array} Returns the new array of regrouped elements.
       * @example
       *
       * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
       * // => [[1, 10, 100], [2, 20, 200]]
       *
       * _.unzipWith(zipped, _.add);
       * // => [3, 30, 300]
       */
      function unzipWith(array, iteratee) {
        if (!(array && array.length)) {
          return [];
        }
        var result = unzip(array);
        if (iteratee == null) {
          return result;
        }
        return arrayMap(result, function(group) {
          return apply(iteratee, undefined$1, group);
        });
      }

      /**
       * Creates an array excluding all given values using
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * for equality comparisons.
       *
       * **Note:** Unlike `_.pull`, this method returns a new array.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {...*} [values] The values to exclude.
       * @returns {Array} Returns the new array of filtered values.
       * @see _.difference, _.xor
       * @example
       *
       * _.without([2, 1, 2, 3], 1, 2);
       * // => [3]
       */
      var without = baseRest(function(array, values) {
        return isArrayLikeObject(array)
          ? baseDifference(array, values)
          : [];
      });

      /**
       * Creates an array of unique values that is the
       * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
       * of the given arrays. The order of result values is determined by the order
       * they occur in the arrays.
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @returns {Array} Returns the new array of filtered values.
       * @see _.difference, _.without
       * @example
       *
       * _.xor([2, 1], [2, 3]);
       * // => [1, 3]
       */
      var xor = baseRest(function(arrays) {
        return baseXor(arrayFilter(arrays, isArrayLikeObject));
      });

      /**
       * This method is like `_.xor` except that it accepts `iteratee` which is
       * invoked for each element of each `arrays` to generate the criterion by
       * which by which they're compared. The order of result values is determined
       * by the order they occur in the arrays. The iteratee is invoked with one
       * argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * _.xorBy([2.1, 1.2], [2.3, 3.4], Math.floor);
       * // => [1.2, 3.4]
       *
       * // The `_.property` iteratee shorthand.
       * _.xorBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
       * // => [{ 'x': 2 }]
       */
      var xorBy = baseRest(function(arrays) {
        var iteratee = last(arrays);
        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined$1;
        }
        return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
      });

      /**
       * This method is like `_.xor` except that it accepts `comparator` which is
       * invoked to compare elements of `arrays`. The order of result values is
       * determined by the order they occur in the arrays. The comparator is invoked
       * with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.xorWith(objects, others, _.isEqual);
       * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
       */
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == 'function' ? comparator : undefined$1;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined$1, comparator);
      });

      /**
       * Creates an array of grouped elements, the first of which contains the
       * first elements of the given arrays, the second of which contains the
       * second elements of the given arrays, and so on.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Array
       * @param {...Array} [arrays] The arrays to process.
       * @returns {Array} Returns the new array of grouped elements.
       * @example
       *
       * _.zip(['a', 'b'], [1, 2], [true, false]);
       * // => [['a', 1, true], ['b', 2, false]]
       */
      var zip = baseRest(unzip);

      /**
       * This method is like `_.fromPairs` except that it accepts two arrays,
       * one of property identifiers and one of corresponding values.
       *
       * @static
       * @memberOf _
       * @since 0.4.0
       * @category Array
       * @param {Array} [props=[]] The property identifiers.
       * @param {Array} [values=[]] The property values.
       * @returns {Object} Returns the new object.
       * @example
       *
       * _.zipObject(['a', 'b'], [1, 2]);
       * // => { 'a': 1, 'b': 2 }
       */
      function zipObject(props, values) {
        return baseZipObject(props || [], values || [], assignValue);
      }

      /**
       * This method is like `_.zipObject` except that it supports property paths.
       *
       * @static
       * @memberOf _
       * @since 4.1.0
       * @category Array
       * @param {Array} [props=[]] The property identifiers.
       * @param {Array} [values=[]] The property values.
       * @returns {Object} Returns the new object.
       * @example
       *
       * _.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
       * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
       */
      function zipObjectDeep(props, values) {
        return baseZipObject(props || [], values || [], baseSet);
      }

      /**
       * This method is like `_.zip` except that it accepts `iteratee` to specify
       * how grouped values should be combined. The iteratee is invoked with the
       * elements of each group: (...group).
       *
       * @static
       * @memberOf _
       * @since 3.8.0
       * @category Array
       * @param {...Array} [arrays] The arrays to process.
       * @param {Function} [iteratee=_.identity] The function to combine
       *  grouped values.
       * @returns {Array} Returns the new array of grouped elements.
       * @example
       *
       * _.zipWith([1, 2], [10, 20], [100, 200], function(a, b, c) {
       *   return a + b + c;
       * });
       * // => [111, 222]
       */
      var zipWith = baseRest(function(arrays) {
        var length = arrays.length,
            iteratee = length > 1 ? arrays[length - 1] : undefined$1;

        iteratee = typeof iteratee == 'function' ? (arrays.pop(), iteratee) : undefined$1;
        return unzipWith(arrays, iteratee);
      });

      /*------------------------------------------------------------------------*/

      /**
       * Creates a `lodash` wrapper instance that wraps `value` with explicit method
       * chain sequences enabled. The result of such sequences must be unwrapped
       * with `_#value`.
       *
       * @static
       * @memberOf _
       * @since 1.3.0
       * @category Seq
       * @param {*} value The value to wrap.
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'age': 36 },
       *   { 'user': 'fred',    'age': 40 },
       *   { 'user': 'pebbles', 'age': 1 }
       * ];
       *
       * var youngest = _
       *   .chain(users)
       *   .sortBy('age')
       *   .map(function(o) {
       *     return o.user + ' is ' + o.age;
       *   })
       *   .head()
       *   .value();
       * // => 'pebbles is 1'
       */
      function chain(value) {
        var result = lodash(value);
        result.__chain__ = true;
        return result;
      }

      /**
       * This method invokes `interceptor` and returns `value`. The interceptor
       * is invoked with one argument; (value). The purpose of this method is to
       * "tap into" a method chain sequence in order to modify intermediate results.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Seq
       * @param {*} value The value to provide to `interceptor`.
       * @param {Function} interceptor The function to invoke.
       * @returns {*} Returns `value`.
       * @example
       *
       * _([1, 2, 3])
       *  .tap(function(array) {
       *    // Mutate input array.
       *    array.pop();
       *  })
       *  .reverse()
       *  .value();
       * // => [2, 1]
       */
      function tap(value, interceptor) {
        interceptor(value);
        return value;
      }

      /**
       * This method is like `_.tap` except that it returns the result of `interceptor`.
       * The purpose of this method is to "pass thru" values replacing intermediate
       * results in a method chain sequence.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Seq
       * @param {*} value The value to provide to `interceptor`.
       * @param {Function} interceptor The function to invoke.
       * @returns {*} Returns the result of `interceptor`.
       * @example
       *
       * _('  abc  ')
       *  .chain()
       *  .trim()
       *  .thru(function(value) {
       *    return [value];
       *  })
       *  .value();
       * // => ['abc']
       */
      function thru(value, interceptor) {
        return interceptor(value);
      }

      /**
       * This method is the wrapper version of `_.at`.
       *
       * @name at
       * @memberOf _
       * @since 1.0.0
       * @category Seq
       * @param {...(string|string[])} [paths] The property paths to pick.
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
       *
       * _(object).at(['a[0].b.c', 'a[1]']).value();
       * // => [3, 4]
       */
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length,
            start = length ? paths[0] : 0,
            value = this.__wrapped__,
            interceptor = function(object) { return baseAt(object, paths); };

        if (length > 1 || this.__actions__.length ||
            !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }
        value = value.slice(start, +start + (length ? 1 : 0));
        value.__actions__.push({
          'func': thru,
          'args': [interceptor],
          'thisArg': undefined$1
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array) {
          if (length && !array.length) {
            array.push(undefined$1);
          }
          return array;
        });
      });

      /**
       * Creates a `lodash` wrapper instance with explicit method chain sequences enabled.
       *
       * @name chain
       * @memberOf _
       * @since 0.1.0
       * @category Seq
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * var users = [
       *   { 'user': 'barney', 'age': 36 },
       *   { 'user': 'fred',   'age': 40 }
       * ];
       *
       * // A sequence without explicit chaining.
       * _(users).head();
       * // => { 'user': 'barney', 'age': 36 }
       *
       * // A sequence with explicit chaining.
       * _(users)
       *   .chain()
       *   .head()
       *   .pick('user')
       *   .value();
       * // => { 'user': 'barney' }
       */
      function wrapperChain() {
        return chain(this);
      }

      /**
       * Executes the chain sequence and returns the wrapped result.
       *
       * @name commit
       * @memberOf _
       * @since 3.2.0
       * @category Seq
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * var array = [1, 2];
       * var wrapped = _(array).push(3);
       *
       * console.log(array);
       * // => [1, 2]
       *
       * wrapped = wrapped.commit();
       * console.log(array);
       * // => [1, 2, 3]
       *
       * wrapped.last();
       * // => 3
       *
       * console.log(array);
       * // => [1, 2, 3]
       */
      function wrapperCommit() {
        return new LodashWrapper(this.value(), this.__chain__);
      }

      /**
       * Gets the next value on a wrapped object following the
       * [iterator protocol](https://mdn.io/iteration_protocols#iterator).
       *
       * @name next
       * @memberOf _
       * @since 4.0.0
       * @category Seq
       * @returns {Object} Returns the next iterator value.
       * @example
       *
       * var wrapped = _([1, 2]);
       *
       * wrapped.next();
       * // => { 'done': false, 'value': 1 }
       *
       * wrapped.next();
       * // => { 'done': false, 'value': 2 }
       *
       * wrapped.next();
       * // => { 'done': true, 'value': undefined }
       */
      function wrapperNext() {
        if (this.__values__ === undefined$1) {
          this.__values__ = toArray(this.value());
        }
        var done = this.__index__ >= this.__values__.length,
            value = done ? undefined$1 : this.__values__[this.__index__++];

        return { 'done': done, 'value': value };
      }

      /**
       * Enables the wrapper to be iterable.
       *
       * @name Symbol.iterator
       * @memberOf _
       * @since 4.0.0
       * @category Seq
       * @returns {Object} Returns the wrapper object.
       * @example
       *
       * var wrapped = _([1, 2]);
       *
       * wrapped[Symbol.iterator]() === wrapped;
       * // => true
       *
       * Array.from(wrapped);
       * // => [1, 2]
       */
      function wrapperToIterator() {
        return this;
      }

      /**
       * Creates a clone of the chain sequence planting `value` as the wrapped value.
       *
       * @name plant
       * @memberOf _
       * @since 3.2.0
       * @category Seq
       * @param {*} value The value to plant.
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * var wrapped = _([1, 2]).map(square);
       * var other = wrapped.plant([3, 4]);
       *
       * other.value();
       * // => [9, 16]
       *
       * wrapped.value();
       * // => [1, 4]
       */
      function wrapperPlant(value) {
        var result,
            parent = this;

        while (parent instanceof baseLodash) {
          var clone = wrapperClone(parent);
          clone.__index__ = 0;
          clone.__values__ = undefined$1;
          if (result) {
            previous.__wrapped__ = clone;
          } else {
            result = clone;
          }
          var previous = clone;
          parent = parent.__wrapped__;
        }
        previous.__wrapped__ = value;
        return result;
      }

      /**
       * This method is the wrapper version of `_.reverse`.
       *
       * **Note:** This method mutates the wrapped array.
       *
       * @name reverse
       * @memberOf _
       * @since 0.1.0
       * @category Seq
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * var array = [1, 2, 3];
       *
       * _(array).reverse().value()
       * // => [3, 2, 1]
       *
       * console.log(array);
       * // => [3, 2, 1]
       */
      function wrapperReverse() {
        var value = this.__wrapped__;
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            'func': thru,
            'args': [reverse],
            'thisArg': undefined$1
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse);
      }

      /**
       * Executes the chain sequence to resolve the unwrapped value.
       *
       * @name value
       * @memberOf _
       * @since 0.1.0
       * @alias toJSON, valueOf
       * @category Seq
       * @returns {*} Returns the resolved unwrapped value.
       * @example
       *
       * _([1, 2, 3]).value();
       * // => [1, 2, 3]
       */
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }

      /*------------------------------------------------------------------------*/

      /**
       * Creates an object composed of keys generated from the results of running
       * each element of `collection` thru `iteratee`. The corresponding value of
       * each key is the number of times the key was returned by `iteratee`. The
       * iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 0.5.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
       * @returns {Object} Returns the composed aggregate object.
       * @example
       *
       * _.countBy([6.1, 4.2, 6.3], Math.floor);
       * // => { '4': 1, '6': 2 }
       *
       * // The `_.property` iteratee shorthand.
       * _.countBy(['one', 'two', 'three'], 'length');
       * // => { '3': 2, '5': 1 }
       */
      var countBy = createAggregator(function(result, value, key) {
        if (hasOwnProperty.call(result, key)) {
          ++result[key];
        } else {
          baseAssignValue(result, key, 1);
        }
      });

      /**
       * Checks if `predicate` returns truthy for **all** elements of `collection`.
       * Iteration is stopped once `predicate` returns falsey. The predicate is
       * invoked with three arguments: (value, index|key, collection).
       *
       * **Note:** This method returns `true` for
       * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
       * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
       * elements of empty collections.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {boolean} Returns `true` if all elements pass the predicate check,
       *  else `false`.
       * @example
       *
       * _.every([true, 1, null, 'yes'], Boolean);
       * // => false
       *
       * var users = [
       *   { 'user': 'barney', 'age': 36, 'active': false },
       *   { 'user': 'fred',   'age': 40, 'active': false }
       * ];
       *
       * // The `_.matches` iteratee shorthand.
       * _.every(users, { 'user': 'barney', 'active': false });
       * // => false
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.every(users, ['active', false]);
       * // => true
       *
       * // The `_.property` iteratee shorthand.
       * _.every(users, 'active');
       * // => false
       */
      function every(collection, predicate, guard) {
        var func = isArray(collection) ? arrayEvery : baseEvery;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }

      /**
       * Iterates over elements of `collection`, returning an array of all elements
       * `predicate` returns truthy for. The predicate is invoked with three
       * arguments: (value, index|key, collection).
       *
       * **Note:** Unlike `_.remove`, this method returns a new array.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new filtered array.
       * @see _.reject
       * @example
       *
       * var users = [
       *   { 'user': 'barney', 'age': 36, 'active': true },
       *   { 'user': 'fred',   'age': 40, 'active': false }
       * ];
       *
       * _.filter(users, function(o) { return !o.active; });
       * // => objects for ['fred']
       *
       * // The `_.matches` iteratee shorthand.
       * _.filter(users, { 'age': 36, 'active': true });
       * // => objects for ['barney']
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.filter(users, ['active', false]);
       * // => objects for ['fred']
       *
       * // The `_.property` iteratee shorthand.
       * _.filter(users, 'active');
       * // => objects for ['barney']
       */
      function filter(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, getIteratee(predicate, 3));
      }

      /**
       * Iterates over elements of `collection`, returning the first element
       * `predicate` returns truthy for. The predicate is invoked with three
       * arguments: (value, index|key, collection).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to inspect.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @param {number} [fromIndex=0] The index to search from.
       * @returns {*} Returns the matched element, else `undefined`.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'age': 36, 'active': true },
       *   { 'user': 'fred',    'age': 40, 'active': false },
       *   { 'user': 'pebbles', 'age': 1,  'active': true }
       * ];
       *
       * _.find(users, function(o) { return o.age < 40; });
       * // => object for 'barney'
       *
       * // The `_.matches` iteratee shorthand.
       * _.find(users, { 'age': 1, 'active': true });
       * // => object for 'pebbles'
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.find(users, ['active', false]);
       * // => object for 'fred'
       *
       * // The `_.property` iteratee shorthand.
       * _.find(users, 'active');
       * // => object for 'barney'
       */
      var find = createFind(findIndex);

      /**
       * This method is like `_.find` except that it iterates over elements of
       * `collection` from right to left.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to inspect.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @param {number} [fromIndex=collection.length-1] The index to search from.
       * @returns {*} Returns the matched element, else `undefined`.
       * @example
       *
       * _.findLast([1, 2, 3, 4], function(n) {
       *   return n % 2 == 1;
       * });
       * // => 3
       */
      var findLast = createFind(findLastIndex);

      /**
       * Creates a flattened array of values by running each element in `collection`
       * thru `iteratee` and flattening the mapped results. The iteratee is invoked
       * with three arguments: (value, index|key, collection).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new flattened array.
       * @example
       *
       * function duplicate(n) {
       *   return [n, n];
       * }
       *
       * _.flatMap([1, 2], duplicate);
       * // => [1, 1, 2, 2]
       */
      function flatMap(collection, iteratee) {
        return baseFlatten(map(collection, iteratee), 1);
      }

      /**
       * This method is like `_.flatMap` except that it recursively flattens the
       * mapped results.
       *
       * @static
       * @memberOf _
       * @since 4.7.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new flattened array.
       * @example
       *
       * function duplicate(n) {
       *   return [[[n, n]]];
       * }
       *
       * _.flatMapDeep([1, 2], duplicate);
       * // => [1, 1, 2, 2]
       */
      function flatMapDeep(collection, iteratee) {
        return baseFlatten(map(collection, iteratee), INFINITY);
      }

      /**
       * This method is like `_.flatMap` except that it recursively flattens the
       * mapped results up to `depth` times.
       *
       * @static
       * @memberOf _
       * @since 4.7.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @param {number} [depth=1] The maximum recursion depth.
       * @returns {Array} Returns the new flattened array.
       * @example
       *
       * function duplicate(n) {
       *   return [[[n, n]]];
       * }
       *
       * _.flatMapDepth([1, 2], duplicate, 2);
       * // => [[1, 1], [2, 2]]
       */
      function flatMapDepth(collection, iteratee, depth) {
        depth = depth === undefined$1 ? 1 : toInteger(depth);
        return baseFlatten(map(collection, iteratee), depth);
      }

      /**
       * Iterates over elements of `collection` and invokes `iteratee` for each element.
       * The iteratee is invoked with three arguments: (value, index|key, collection).
       * Iteratee functions may exit iteration early by explicitly returning `false`.
       *
       * **Note:** As with other "Collections" methods, objects with a "length"
       * property are iterated like arrays. To avoid this behavior use `_.forIn`
       * or `_.forOwn` for object iteration.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @alias each
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array|Object} Returns `collection`.
       * @see _.forEachRight
       * @example
       *
       * _.forEach([1, 2], function(value) {
       *   console.log(value);
       * });
       * // => Logs `1` then `2`.
       *
       * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'a' then 'b' (iteration order is not guaranteed).
       */
      function forEach(collection, iteratee) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, getIteratee(iteratee, 3));
      }

      /**
       * This method is like `_.forEach` except that it iterates over elements of
       * `collection` from right to left.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @alias eachRight
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array|Object} Returns `collection`.
       * @see _.forEach
       * @example
       *
       * _.forEachRight([1, 2], function(value) {
       *   console.log(value);
       * });
       * // => Logs `2` then `1`.
       */
      function forEachRight(collection, iteratee) {
        var func = isArray(collection) ? arrayEachRight : baseEachRight;
        return func(collection, getIteratee(iteratee, 3));
      }

      /**
       * Creates an object composed of keys generated from the results of running
       * each element of `collection` thru `iteratee`. The order of grouped values
       * is determined by the order they occur in `collection`. The corresponding
       * value of each key is an array of elements responsible for generating the
       * key. The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
       * @returns {Object} Returns the composed aggregate object.
       * @example
       *
       * _.groupBy([6.1, 4.2, 6.3], Math.floor);
       * // => { '4': [4.2], '6': [6.1, 6.3] }
       *
       * // The `_.property` iteratee shorthand.
       * _.groupBy(['one', 'two', 'three'], 'length');
       * // => { '3': ['one', 'two'], '5': ['three'] }
       */
      var groupBy = createAggregator(function(result, value, key) {
        if (hasOwnProperty.call(result, key)) {
          result[key].push(value);
        } else {
          baseAssignValue(result, key, [value]);
        }
      });

      /**
       * Checks if `value` is in `collection`. If `collection` is a string, it's
       * checked for a substring of `value`, otherwise
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * is used for equality comparisons. If `fromIndex` is negative, it's used as
       * the offset from the end of `collection`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object|string} collection The collection to inspect.
       * @param {*} value The value to search for.
       * @param {number} [fromIndex=0] The index to search from.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
       * @returns {boolean} Returns `true` if `value` is found, else `false`.
       * @example
       *
       * _.includes([1, 2, 3], 1);
       * // => true
       *
       * _.includes([1, 2, 3], 1, 2);
       * // => false
       *
       * _.includes({ 'a': 1, 'b': 2 }, 1);
       * // => true
       *
       * _.includes('abcd', 'bc');
       * // => true
       */
      function includes(collection, value, fromIndex, guard) {
        collection = isArrayLike(collection) ? collection : values(collection);
        fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

        var length = collection.length;
        if (fromIndex < 0) {
          fromIndex = nativeMax(length + fromIndex, 0);
        }
        return isString(collection)
          ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
          : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
      }

      /**
       * Invokes the method at `path` of each element in `collection`, returning
       * an array of the results of each invoked method. Any additional arguments
       * are provided to each invoked method. If `path` is a function, it's invoked
       * for, and `this` bound to, each element in `collection`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Array|Function|string} path The path of the method to invoke or
       *  the function invoked per iteration.
       * @param {...*} [args] The arguments to invoke each method with.
       * @returns {Array} Returns the array of results.
       * @example
       *
       * _.invokeMap([[5, 1, 7], [3, 2, 1]], 'sort');
       * // => [[1, 5, 7], [1, 2, 3]]
       *
       * _.invokeMap([123, 456], String.prototype.split, '');
       * // => [['1', '2', '3'], ['4', '5', '6']]
       */
      var invokeMap = baseRest(function(collection, path, args) {
        var index = -1,
            isFunc = typeof path == 'function',
            result = isArrayLike(collection) ? Array(collection.length) : [];

        baseEach(collection, function(value) {
          result[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
        });
        return result;
      });

      /**
       * Creates an object composed of keys generated from the results of running
       * each element of `collection` thru `iteratee`. The corresponding value of
       * each key is the last element responsible for generating the key. The
       * iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee to transform keys.
       * @returns {Object} Returns the composed aggregate object.
       * @example
       *
       * var array = [
       *   { 'dir': 'left', 'code': 97 },
       *   { 'dir': 'right', 'code': 100 }
       * ];
       *
       * _.keyBy(array, function(o) {
       *   return String.fromCharCode(o.code);
       * });
       * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
       *
       * _.keyBy(array, 'dir');
       * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
       */
      var keyBy = createAggregator(function(result, value, key) {
        baseAssignValue(result, key, value);
      });

      /**
       * Creates an array of values by running each element in `collection` thru
       * `iteratee`. The iteratee is invoked with three arguments:
       * (value, index|key, collection).
       *
       * Many lodash methods are guarded to work as iteratees for methods like
       * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
       *
       * The guarded methods are:
       * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
       * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
       * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
       * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new mapped array.
       * @example
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * _.map([4, 8], square);
       * // => [16, 64]
       *
       * _.map({ 'a': 4, 'b': 8 }, square);
       * // => [16, 64] (iteration order is not guaranteed)
       *
       * var users = [
       *   { 'user': 'barney' },
       *   { 'user': 'fred' }
       * ];
       *
       * // The `_.property` iteratee shorthand.
       * _.map(users, 'user');
       * // => ['barney', 'fred']
       */
      function map(collection, iteratee) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, getIteratee(iteratee, 3));
      }

      /**
       * This method is like `_.sortBy` except that it allows specifying the sort
       * orders of the iteratees to sort by. If `orders` is unspecified, all values
       * are sorted in ascending order. Otherwise, specify an order of "desc" for
       * descending or "asc" for ascending sort order of corresponding values.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Array[]|Function[]|Object[]|string[]} [iteratees=[_.identity]]
       *  The iteratees to sort by.
       * @param {string[]} [orders] The sort orders of `iteratees`.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
       * @returns {Array} Returns the new sorted array.
       * @example
       *
       * var users = [
       *   { 'user': 'fred',   'age': 48 },
       *   { 'user': 'barney', 'age': 34 },
       *   { 'user': 'fred',   'age': 40 },
       *   { 'user': 'barney', 'age': 36 }
       * ];
       *
       * // Sort by `user` in ascending order and by `age` in descending order.
       * _.orderBy(users, ['user', 'age'], ['asc', 'desc']);
       * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
       */
      function orderBy(collection, iteratees, orders, guard) {
        if (collection == null) {
          return [];
        }
        if (!isArray(iteratees)) {
          iteratees = iteratees == null ? [] : [iteratees];
        }
        orders = guard ? undefined$1 : orders;
        if (!isArray(orders)) {
          orders = orders == null ? [] : [orders];
        }
        return baseOrderBy(collection, iteratees, orders);
      }

      /**
       * Creates an array of elements split into two groups, the first of which
       * contains elements `predicate` returns truthy for, the second of which
       * contains elements `predicate` returns falsey for. The predicate is
       * invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the array of grouped elements.
       * @example
       *
       * var users = [
       *   { 'user': 'barney',  'age': 36, 'active': false },
       *   { 'user': 'fred',    'age': 40, 'active': true },
       *   { 'user': 'pebbles', 'age': 1,  'active': false }
       * ];
       *
       * _.partition(users, function(o) { return o.active; });
       * // => objects for [['fred'], ['barney', 'pebbles']]
       *
       * // The `_.matches` iteratee shorthand.
       * _.partition(users, { 'age': 1, 'active': false });
       * // => objects for [['pebbles'], ['barney', 'fred']]
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.partition(users, ['active', false]);
       * // => objects for [['barney', 'pebbles'], ['fred']]
       *
       * // The `_.property` iteratee shorthand.
       * _.partition(users, 'active');
       * // => objects for [['fred'], ['barney', 'pebbles']]
       */
      var partition = createAggregator(function(result, value, key) {
        result[key ? 0 : 1].push(value);
      }, function() { return [[], []]; });

      /**
       * Reduces `collection` to a value which is the accumulated result of running
       * each element in `collection` thru `iteratee`, where each successive
       * invocation is supplied the return value of the previous. If `accumulator`
       * is not given, the first element of `collection` is used as the initial
       * value. The iteratee is invoked with four arguments:
       * (accumulator, value, index|key, collection).
       *
       * Many lodash methods are guarded to work as iteratees for methods like
       * `_.reduce`, `_.reduceRight`, and `_.transform`.
       *
       * The guarded methods are:
       * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
       * and `sortBy`
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @param {*} [accumulator] The initial value.
       * @returns {*} Returns the accumulated value.
       * @see _.reduceRight
       * @example
       *
       * _.reduce([1, 2], function(sum, n) {
       *   return sum + n;
       * }, 0);
       * // => 3
       *
       * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
       *   (result[value] || (result[value] = [])).push(key);
       *   return result;
       * }, {});
       * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
       */
      function reduce(collection, iteratee, accumulator) {
        var func = isArray(collection) ? arrayReduce : baseReduce,
            initAccum = arguments.length < 3;

        return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEach);
      }

      /**
       * This method is like `_.reduce` except that it iterates over elements of
       * `collection` from right to left.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @param {*} [accumulator] The initial value.
       * @returns {*} Returns the accumulated value.
       * @see _.reduce
       * @example
       *
       * var array = [[0, 1], [2, 3], [4, 5]];
       *
       * _.reduceRight(array, function(flattened, other) {
       *   return flattened.concat(other);
       * }, []);
       * // => [4, 5, 2, 3, 0, 1]
       */
      function reduceRight(collection, iteratee, accumulator) {
        var func = isArray(collection) ? arrayReduceRight : baseReduce,
            initAccum = arguments.length < 3;

        return func(collection, getIteratee(iteratee, 4), accumulator, initAccum, baseEachRight);
      }

      /**
       * The opposite of `_.filter`; this method returns the elements of `collection`
       * that `predicate` does **not** return truthy for.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new filtered array.
       * @see _.filter
       * @example
       *
       * var users = [
       *   { 'user': 'barney', 'age': 36, 'active': false },
       *   { 'user': 'fred',   'age': 40, 'active': true }
       * ];
       *
       * _.reject(users, function(o) { return !o.active; });
       * // => objects for ['fred']
       *
       * // The `_.matches` iteratee shorthand.
       * _.reject(users, { 'age': 40, 'active': true });
       * // => objects for ['barney']
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.reject(users, ['active', false]);
       * // => objects for ['fred']
       *
       * // The `_.property` iteratee shorthand.
       * _.reject(users, 'active');
       * // => objects for ['barney']
       */
      function reject(collection, predicate) {
        var func = isArray(collection) ? arrayFilter : baseFilter;
        return func(collection, negate(getIteratee(predicate, 3)));
      }

      /**
       * Gets a random element from `collection`.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to sample.
       * @returns {*} Returns the random element.
       * @example
       *
       * _.sample([1, 2, 3, 4]);
       * // => 2
       */
      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }

      /**
       * Gets `n` random elements at unique keys from `collection` up to the
       * size of `collection`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to sample.
       * @param {number} [n=1] The number of elements to sample.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the random elements.
       * @example
       *
       * _.sampleSize([1, 2, 3], 2);
       * // => [3, 1]
       *
       * _.sampleSize([1, 2, 3], 4);
       * // => [2, 3, 1]
       */
      function sampleSize(collection, n, guard) {
        if ((guard ? isIterateeCall(collection, n, guard) : n === undefined$1)) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        var func = isArray(collection) ? arraySampleSize : baseSampleSize;
        return func(collection, n);
      }

      /**
       * Creates an array of shuffled values, using a version of the
       * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to shuffle.
       * @returns {Array} Returns the new shuffled array.
       * @example
       *
       * _.shuffle([1, 2, 3, 4]);
       * // => [4, 1, 3, 2]
       */
      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }

      /**
       * Gets the size of `collection` by returning its length for array-like
       * values or the number of own enumerable string keyed properties for objects.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object|string} collection The collection to inspect.
       * @returns {number} Returns the collection size.
       * @example
       *
       * _.size([1, 2, 3]);
       * // => 3
       *
       * _.size({ 'a': 1, 'b': 2 });
       * // => 2
       *
       * _.size('pebbles');
       * // => 7
       */
      function size(collection) {
        if (collection == null) {
          return 0;
        }
        if (isArrayLike(collection)) {
          return isString(collection) ? stringSize(collection) : collection.length;
        }
        var tag = getTag(collection);
        if (tag == mapTag || tag == setTag) {
          return collection.size;
        }
        return baseKeys(collection).length;
      }

      /**
       * Checks if `predicate` returns truthy for **any** element of `collection`.
       * Iteration is stopped once `predicate` returns truthy. The predicate is
       * invoked with three arguments: (value, index|key, collection).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {boolean} Returns `true` if any element passes the predicate check,
       *  else `false`.
       * @example
       *
       * _.some([null, 0, 'yes', false], Boolean);
       * // => true
       *
       * var users = [
       *   { 'user': 'barney', 'active': true },
       *   { 'user': 'fred',   'active': false }
       * ];
       *
       * // The `_.matches` iteratee shorthand.
       * _.some(users, { 'user': 'barney', 'active': false });
       * // => false
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.some(users, ['active', false]);
       * // => true
       *
       * // The `_.property` iteratee shorthand.
       * _.some(users, 'active');
       * // => true
       */
      function some(collection, predicate, guard) {
        var func = isArray(collection) ? arraySome : baseSome;
        if (guard && isIterateeCall(collection, predicate, guard)) {
          predicate = undefined$1;
        }
        return func(collection, getIteratee(predicate, 3));
      }

      /**
       * Creates an array of elements, sorted in ascending order by the results of
       * running each element in a collection thru each iteratee. This method
       * performs a stable sort, that is, it preserves the original sort order of
       * equal elements. The iteratees are invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {...(Function|Function[])} [iteratees=[_.identity]]
       *  The iteratees to sort by.
       * @returns {Array} Returns the new sorted array.
       * @example
       *
       * var users = [
       *   { 'user': 'fred',   'age': 48 },
       *   { 'user': 'barney', 'age': 36 },
       *   { 'user': 'fred',   'age': 40 },
       *   { 'user': 'barney', 'age': 34 }
       * ];
       *
       * _.sortBy(users, [function(o) { return o.user; }]);
       * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
       *
       * _.sortBy(users, ['user', 'age']);
       * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
       */
      var sortBy = baseRest(function(collection, iteratees) {
        if (collection == null) {
          return [];
        }
        var length = iteratees.length;
        if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
          iteratees = [];
        } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
          iteratees = [iteratees[0]];
        }
        return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
      });

      /*------------------------------------------------------------------------*/

      /**
       * Gets the timestamp of the number of milliseconds that have elapsed since
       * the Unix epoch (1 January 1970 00:00:00 UTC).
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Date
       * @returns {number} Returns the timestamp.
       * @example
       *
       * _.defer(function(stamp) {
       *   console.log(_.now() - stamp);
       * }, _.now());
       * // => Logs the number of milliseconds it took for the deferred invocation.
       */
      var now = ctxNow || function() {
        return root.Date.now();
      };

      /*------------------------------------------------------------------------*/

      /**
       * The opposite of `_.before`; this method creates a function that invokes
       * `func` once it's called `n` or more times.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {number} n The number of calls before `func` is invoked.
       * @param {Function} func The function to restrict.
       * @returns {Function} Returns the new restricted function.
       * @example
       *
       * var saves = ['profile', 'settings'];
       *
       * var done = _.after(saves.length, function() {
       *   console.log('done saving!');
       * });
       *
       * _.forEach(saves, function(type) {
       *   asyncSave({ 'type': type, 'complete': done });
       * });
       * // => Logs 'done saving!' after the two async saves have completed.
       */
      function after(n, func) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n < 1) {
            return func.apply(this, arguments);
          }
        };
      }

      /**
       * Creates a function that invokes `func`, with up to `n` arguments,
       * ignoring any additional arguments.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Function
       * @param {Function} func The function to cap arguments for.
       * @param {number} [n=func.length] The arity cap.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Function} Returns the new capped function.
       * @example
       *
       * _.map(['6', '8', '10'], _.ary(parseInt, 1));
       * // => [6, 8, 10]
       */
      function ary(func, n, guard) {
        n = guard ? undefined$1 : n;
        n = (func && n == null) ? func.length : n;
        return createWrap(func, WRAP_ARY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, n);
      }

      /**
       * Creates a function that invokes `func`, with the `this` binding and arguments
       * of the created function, while it's called less than `n` times. Subsequent
       * calls to the created function return the result of the last `func` invocation.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Function
       * @param {number} n The number of calls at which `func` is no longer invoked.
       * @param {Function} func The function to restrict.
       * @returns {Function} Returns the new restricted function.
       * @example
       *
       * jQuery(element).on('click', _.before(5, addContactToList));
       * // => Allows adding up to 4 contacts to the list.
       */
      function before(n, func) {
        var result;
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        n = toInteger(n);
        return function() {
          if (--n > 0) {
            result = func.apply(this, arguments);
          }
          if (n <= 1) {
            func = undefined$1;
          }
          return result;
        };
      }

      /**
       * Creates a function that invokes `func` with the `this` binding of `thisArg`
       * and `partials` prepended to the arguments it receives.
       *
       * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
       * may be used as a placeholder for partially applied arguments.
       *
       * **Note:** Unlike native `Function#bind`, this method doesn't set the "length"
       * property of bound functions.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to bind.
       * @param {*} thisArg The `this` binding of `func`.
       * @param {...*} [partials] The arguments to be partially applied.
       * @returns {Function} Returns the new bound function.
       * @example
       *
       * function greet(greeting, punctuation) {
       *   return greeting + ' ' + this.user + punctuation;
       * }
       *
       * var object = { 'user': 'fred' };
       *
       * var bound = _.bind(greet, object, 'hi');
       * bound('!');
       * // => 'hi fred!'
       *
       * // Bound with placeholders.
       * var bound = _.bind(greet, object, _, '!');
       * bound('hi');
       * // => 'hi fred!'
       */
      var bind = baseRest(function(func, thisArg, partials) {
        var bitmask = WRAP_BIND_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bind));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(func, bitmask, thisArg, partials, holders);
      });

      /**
       * Creates a function that invokes the method at `object[key]` with `partials`
       * prepended to the arguments it receives.
       *
       * This method differs from `_.bind` by allowing bound functions to reference
       * methods that may be redefined or don't yet exist. See
       * [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
       * for more details.
       *
       * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
       * builds, may be used as a placeholder for partially applied arguments.
       *
       * @static
       * @memberOf _
       * @since 0.10.0
       * @category Function
       * @param {Object} object The object to invoke the method on.
       * @param {string} key The key of the method.
       * @param {...*} [partials] The arguments to be partially applied.
       * @returns {Function} Returns the new bound function.
       * @example
       *
       * var object = {
       *   'user': 'fred',
       *   'greet': function(greeting, punctuation) {
       *     return greeting + ' ' + this.user + punctuation;
       *   }
       * };
       *
       * var bound = _.bindKey(object, 'greet', 'hi');
       * bound('!');
       * // => 'hi fred!'
       *
       * object.greet = function(greeting, punctuation) {
       *   return greeting + 'ya ' + this.user + punctuation;
       * };
       *
       * bound('!');
       * // => 'hiya fred!'
       *
       * // Bound with placeholders.
       * var bound = _.bindKey(object, 'greet', _, '!');
       * bound('hi');
       * // => 'hiya fred!'
       */
      var bindKey = baseRest(function(object, key, partials) {
        var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
        if (partials.length) {
          var holders = replaceHolders(partials, getHolder(bindKey));
          bitmask |= WRAP_PARTIAL_FLAG;
        }
        return createWrap(key, bitmask, object, partials, holders);
      });

      /**
       * Creates a function that accepts arguments of `func` and either invokes
       * `func` returning its result, if at least `arity` number of arguments have
       * been provided, or returns a function that accepts the remaining `func`
       * arguments, and so on. The arity of `func` may be specified if `func.length`
       * is not sufficient.
       *
       * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
       * may be used as a placeholder for provided arguments.
       *
       * **Note:** This method doesn't set the "length" property of curried functions.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Function
       * @param {Function} func The function to curry.
       * @param {number} [arity=func.length] The arity of `func`.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Function} Returns the new curried function.
       * @example
       *
       * var abc = function(a, b, c) {
       *   return [a, b, c];
       * };
       *
       * var curried = _.curry(abc);
       *
       * curried(1)(2)(3);
       * // => [1, 2, 3]
       *
       * curried(1, 2)(3);
       * // => [1, 2, 3]
       *
       * curried(1, 2, 3);
       * // => [1, 2, 3]
       *
       * // Curried with placeholders.
       * curried(1)(_, 3)(2);
       * // => [1, 2, 3]
       */
      function curry(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result = createWrap(func, WRAP_CURRY_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result.placeholder = curry.placeholder;
        return result;
      }

      /**
       * This method is like `_.curry` except that arguments are applied to `func`
       * in the manner of `_.partialRight` instead of `_.partial`.
       *
       * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
       * builds, may be used as a placeholder for provided arguments.
       *
       * **Note:** This method doesn't set the "length" property of curried functions.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Function
       * @param {Function} func The function to curry.
       * @param {number} [arity=func.length] The arity of `func`.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Function} Returns the new curried function.
       * @example
       *
       * var abc = function(a, b, c) {
       *   return [a, b, c];
       * };
       *
       * var curried = _.curryRight(abc);
       *
       * curried(3)(2)(1);
       * // => [1, 2, 3]
       *
       * curried(2, 3)(1);
       * // => [1, 2, 3]
       *
       * curried(1, 2, 3);
       * // => [1, 2, 3]
       *
       * // Curried with placeholders.
       * curried(3)(1, _)(2);
       * // => [1, 2, 3]
       */
      function curryRight(func, arity, guard) {
        arity = guard ? undefined$1 : arity;
        var result = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined$1, undefined$1, undefined$1, undefined$1, undefined$1, arity);
        result.placeholder = curryRight.placeholder;
        return result;
      }

      /**
       * Creates a debounced function that delays invoking `func` until after `wait`
       * milliseconds have elapsed since the last time the debounced function was
       * invoked. The debounced function comes with a `cancel` method to cancel
       * delayed `func` invocations and a `flush` method to immediately invoke them.
       * Provide `options` to indicate whether `func` should be invoked on the
       * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
       * with the last arguments provided to the debounced function. Subsequent
       * calls to the debounced function return the result of the last `func`
       * invocation.
       *
       * **Note:** If `leading` and `trailing` options are `true`, `func` is
       * invoked on the trailing edge of the timeout only if the debounced function
       * is invoked more than once during the `wait` timeout.
       *
       * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
       * until to the next tick, similar to `setTimeout` with a timeout of `0`.
       *
       * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
       * for details over the differences between `_.debounce` and `_.throttle`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to debounce.
       * @param {number} [wait=0] The number of milliseconds to delay.
       * @param {Object} [options={}] The options object.
       * @param {boolean} [options.leading=false]
       *  Specify invoking on the leading edge of the timeout.
       * @param {number} [options.maxWait]
       *  The maximum time `func` is allowed to be delayed before it's invoked.
       * @param {boolean} [options.trailing=true]
       *  Specify invoking on the trailing edge of the timeout.
       * @returns {Function} Returns the new debounced function.
       * @example
       *
       * // Avoid costly calculations while the window size is in flux.
       * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
       *
       * // Invoke `sendMail` when clicked, debouncing subsequent calls.
       * jQuery(element).on('click', _.debounce(sendMail, 300, {
       *   'leading': true,
       *   'trailing': false
       * }));
       *
       * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
       * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
       * var source = new EventSource('/stream');
       * jQuery(source).on('message', debounced);
       *
       * // Cancel the trailing debounced invocation.
       * jQuery(window).on('popstate', debounced.cancel);
       */
      function debounce(func, wait, options) {
        var lastArgs,
            lastThis,
            maxWait,
            result,
            timerId,
            lastCallTime,
            lastInvokeTime = 0,
            leading = false,
            maxing = false,
            trailing = true;

        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject(options)) {
          leading = !!options.leading;
          maxing = 'maxWait' in options;
          maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
          trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
          var args = lastArgs,
              thisArg = lastThis;

          lastArgs = lastThis = undefined$1;
          lastInvokeTime = time;
          result = func.apply(thisArg, args);
          return result;
        }

        function leadingEdge(time) {
          // Reset any `maxWait` timer.
          lastInvokeTime = time;
          // Start the timer for the trailing edge.
          timerId = setTimeout(timerExpired, wait);
          // Invoke the leading edge.
          return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
          var timeSinceLastCall = time - lastCallTime,
              timeSinceLastInvoke = time - lastInvokeTime,
              timeWaiting = wait - timeSinceLastCall;

          return maxing
            ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
        }

        function shouldInvoke(time) {
          var timeSinceLastCall = time - lastCallTime,
              timeSinceLastInvoke = time - lastInvokeTime;

          // Either this is the first call, activity has stopped and we're at the
          // trailing edge, the system time has gone backwards and we're treating
          // it as the trailing edge, or we've hit the `maxWait` limit.
          return (lastCallTime === undefined$1 || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
          var time = now();
          if (shouldInvoke(time)) {
            return trailingEdge(time);
          }
          // Restart the timer.
          timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
          timerId = undefined$1;

          // Only invoke if we have `lastArgs` which means `func` has been
          // debounced at least once.
          if (trailing && lastArgs) {
            return invokeFunc(time);
          }
          lastArgs = lastThis = undefined$1;
          return result;
        }

        function cancel() {
          if (timerId !== undefined$1) {
            clearTimeout(timerId);
          }
          lastInvokeTime = 0;
          lastArgs = lastCallTime = lastThis = timerId = undefined$1;
        }

        function flush() {
          return timerId === undefined$1 ? result : trailingEdge(now());
        }

        function debounced() {
          var time = now(),
              isInvoking = shouldInvoke(time);

          lastArgs = arguments;
          lastThis = this;
          lastCallTime = time;

          if (isInvoking) {
            if (timerId === undefined$1) {
              return leadingEdge(lastCallTime);
            }
            if (maxing) {
              // Handle invocations in a tight loop.
              clearTimeout(timerId);
              timerId = setTimeout(timerExpired, wait);
              return invokeFunc(lastCallTime);
            }
          }
          if (timerId === undefined$1) {
            timerId = setTimeout(timerExpired, wait);
          }
          return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
      }

      /**
       * Defers invoking the `func` until the current call stack has cleared. Any
       * additional arguments are provided to `func` when it's invoked.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to defer.
       * @param {...*} [args] The arguments to invoke `func` with.
       * @returns {number} Returns the timer id.
       * @example
       *
       * _.defer(function(text) {
       *   console.log(text);
       * }, 'deferred');
       * // => Logs 'deferred' after one millisecond.
       */
      var defer = baseRest(function(func, args) {
        return baseDelay(func, 1, args);
      });

      /**
       * Invokes `func` after `wait` milliseconds. Any additional arguments are
       * provided to `func` when it's invoked.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to delay.
       * @param {number} wait The number of milliseconds to delay invocation.
       * @param {...*} [args] The arguments to invoke `func` with.
       * @returns {number} Returns the timer id.
       * @example
       *
       * _.delay(function(text) {
       *   console.log(text);
       * }, 1000, 'later');
       * // => Logs 'later' after one second.
       */
      var delay = baseRest(function(func, wait, args) {
        return baseDelay(func, toNumber(wait) || 0, args);
      });

      /**
       * Creates a function that invokes `func` with arguments reversed.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Function
       * @param {Function} func The function to flip arguments for.
       * @returns {Function} Returns the new flipped function.
       * @example
       *
       * var flipped = _.flip(function() {
       *   return _.toArray(arguments);
       * });
       *
       * flipped('a', 'b', 'c', 'd');
       * // => ['d', 'c', 'b', 'a']
       */
      function flip(func) {
        return createWrap(func, WRAP_FLIP_FLAG);
      }

      /**
       * Creates a function that memoizes the result of `func`. If `resolver` is
       * provided, it determines the cache key for storing the result based on the
       * arguments provided to the memoized function. By default, the first argument
       * provided to the memoized function is used as the map cache key. The `func`
       * is invoked with the `this` binding of the memoized function.
       *
       * **Note:** The cache is exposed as the `cache` property on the memoized
       * function. Its creation may be customized by replacing the `_.memoize.Cache`
       * constructor with one whose instances implement the
       * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
       * method interface of `clear`, `delete`, `get`, `has`, and `set`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to have its output memoized.
       * @param {Function} [resolver] The function to resolve the cache key.
       * @returns {Function} Returns the new memoized function.
       * @example
       *
       * var object = { 'a': 1, 'b': 2 };
       * var other = { 'c': 3, 'd': 4 };
       *
       * var values = _.memoize(_.values);
       * values(object);
       * // => [1, 2]
       *
       * values(other);
       * // => [3, 4]
       *
       * object.a = 2;
       * values(object);
       * // => [1, 2]
       *
       * // Modify the result cache.
       * values.cache.set(object, ['a', 'b']);
       * values(object);
       * // => ['a', 'b']
       *
       * // Replace `_.memoize.Cache`.
       * _.memoize.Cache = WeakMap;
       */
      function memoize(func, resolver) {
        if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        var memoized = function() {
          var args = arguments,
              key = resolver ? resolver.apply(this, args) : args[0],
              cache = memoized.cache;

          if (cache.has(key)) {
            return cache.get(key);
          }
          var result = func.apply(this, args);
          memoized.cache = cache.set(key, result) || cache;
          return result;
        };
        memoized.cache = new (memoize.Cache || MapCache);
        return memoized;
      }

      // Expose `MapCache`.
      memoize.Cache = MapCache;

      /**
       * Creates a function that negates the result of the predicate `func`. The
       * `func` predicate is invoked with the `this` binding and arguments of the
       * created function.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Function
       * @param {Function} predicate The predicate to negate.
       * @returns {Function} Returns the new negated function.
       * @example
       *
       * function isEven(n) {
       *   return n % 2 == 0;
       * }
       *
       * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
       * // => [1, 3, 5]
       */
      function negate(predicate) {
        if (typeof predicate != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        return function() {
          var args = arguments;
          switch (args.length) {
            case 0: return !predicate.call(this);
            case 1: return !predicate.call(this, args[0]);
            case 2: return !predicate.call(this, args[0], args[1]);
            case 3: return !predicate.call(this, args[0], args[1], args[2]);
          }
          return !predicate.apply(this, args);
        };
      }

      /**
       * Creates a function that is restricted to invoking `func` once. Repeat calls
       * to the function return the value of the first invocation. The `func` is
       * invoked with the `this` binding and arguments of the created function.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to restrict.
       * @returns {Function} Returns the new restricted function.
       * @example
       *
       * var initialize = _.once(createApplication);
       * initialize();
       * initialize();
       * // => `createApplication` is invoked once
       */
      function once(func) {
        return before(2, func);
      }

      /**
       * Creates a function that invokes `func` with its arguments transformed.
       *
       * @static
       * @since 4.0.0
       * @memberOf _
       * @category Function
       * @param {Function} func The function to wrap.
       * @param {...(Function|Function[])} [transforms=[_.identity]]
       *  The argument transforms.
       * @returns {Function} Returns the new function.
       * @example
       *
       * function doubled(n) {
       *   return n * 2;
       * }
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * var func = _.overArgs(function(x, y) {
       *   return [x, y];
       * }, [square, doubled]);
       *
       * func(9, 3);
       * // => [81, 6]
       *
       * func(10, 5);
       * // => [100, 10]
       */
      var overArgs = castRest(function(func, transforms) {
        transforms = (transforms.length == 1 && isArray(transforms[0]))
          ? arrayMap(transforms[0], baseUnary(getIteratee()))
          : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));

        var funcsLength = transforms.length;
        return baseRest(function(args) {
          var index = -1,
              length = nativeMin(args.length, funcsLength);

          while (++index < length) {
            args[index] = transforms[index].call(this, args[index]);
          }
          return apply(func, this, args);
        });
      });

      /**
       * Creates a function that invokes `func` with `partials` prepended to the
       * arguments it receives. This method is like `_.bind` except it does **not**
       * alter the `this` binding.
       *
       * The `_.partial.placeholder` value, which defaults to `_` in monolithic
       * builds, may be used as a placeholder for partially applied arguments.
       *
       * **Note:** This method doesn't set the "length" property of partially
       * applied functions.
       *
       * @static
       * @memberOf _
       * @since 0.2.0
       * @category Function
       * @param {Function} func The function to partially apply arguments to.
       * @param {...*} [partials] The arguments to be partially applied.
       * @returns {Function} Returns the new partially applied function.
       * @example
       *
       * function greet(greeting, name) {
       *   return greeting + ' ' + name;
       * }
       *
       * var sayHelloTo = _.partial(greet, 'hello');
       * sayHelloTo('fred');
       * // => 'hello fred'
       *
       * // Partially applied with placeholders.
       * var greetFred = _.partial(greet, _, 'fred');
       * greetFred('hi');
       * // => 'hi fred'
       */
      var partial = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partial));
        return createWrap(func, WRAP_PARTIAL_FLAG, undefined$1, partials, holders);
      });

      /**
       * This method is like `_.partial` except that partially applied arguments
       * are appended to the arguments it receives.
       *
       * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
       * builds, may be used as a placeholder for partially applied arguments.
       *
       * **Note:** This method doesn't set the "length" property of partially
       * applied functions.
       *
       * @static
       * @memberOf _
       * @since 1.0.0
       * @category Function
       * @param {Function} func The function to partially apply arguments to.
       * @param {...*} [partials] The arguments to be partially applied.
       * @returns {Function} Returns the new partially applied function.
       * @example
       *
       * function greet(greeting, name) {
       *   return greeting + ' ' + name;
       * }
       *
       * var greetFred = _.partialRight(greet, 'fred');
       * greetFred('hi');
       * // => 'hi fred'
       *
       * // Partially applied with placeholders.
       * var sayHelloTo = _.partialRight(greet, 'hello', _);
       * sayHelloTo('fred');
       * // => 'hello fred'
       */
      var partialRight = baseRest(function(func, partials) {
        var holders = replaceHolders(partials, getHolder(partialRight));
        return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined$1, partials, holders);
      });

      /**
       * Creates a function that invokes `func` with arguments arranged according
       * to the specified `indexes` where the argument value at the first index is
       * provided as the first argument, the argument value at the second index is
       * provided as the second argument, and so on.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Function
       * @param {Function} func The function to rearrange arguments for.
       * @param {...(number|number[])} indexes The arranged argument indexes.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var rearged = _.rearg(function(a, b, c) {
       *   return [a, b, c];
       * }, [2, 0, 1]);
       *
       * rearged('b', 'c', 'a')
       * // => ['a', 'b', 'c']
       */
      var rearg = flatRest(function(func, indexes) {
        return createWrap(func, WRAP_REARG_FLAG, undefined$1, undefined$1, undefined$1, indexes);
      });

      /**
       * Creates a function that invokes `func` with the `this` binding of the
       * created function and arguments from `start` and beyond provided as
       * an array.
       *
       * **Note:** This method is based on the
       * [rest parameter](https://mdn.io/rest_parameters).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Function
       * @param {Function} func The function to apply a rest parameter to.
       * @param {number} [start=func.length-1] The start position of the rest parameter.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var say = _.rest(function(what, names) {
       *   return what + ' ' + _.initial(names).join(', ') +
       *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
       * });
       *
       * say('hello', 'fred', 'barney', 'pebbles');
       * // => 'hello fred, barney, & pebbles'
       */
      function rest(func, start) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        start = start === undefined$1 ? start : toInteger(start);
        return baseRest(func, start);
      }

      /**
       * Creates a function that invokes `func` with the `this` binding of the
       * create function and an array of arguments much like
       * [`Function#apply`](http://www.ecma-international.org/ecma-262/7.0/#sec-function.prototype.apply).
       *
       * **Note:** This method is based on the
       * [spread operator](https://mdn.io/spread_operator).
       *
       * @static
       * @memberOf _
       * @since 3.2.0
       * @category Function
       * @param {Function} func The function to spread arguments over.
       * @param {number} [start=0] The start position of the spread.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var say = _.spread(function(who, what) {
       *   return who + ' says ' + what;
       * });
       *
       * say(['fred', 'hello']);
       * // => 'fred says hello'
       *
       * var numbers = Promise.all([
       *   Promise.resolve(40),
       *   Promise.resolve(36)
       * ]);
       *
       * numbers.then(_.spread(function(x, y) {
       *   return x + y;
       * }));
       * // => a Promise of 76
       */
      function spread(func, start) {
        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        start = start == null ? 0 : nativeMax(toInteger(start), 0);
        return baseRest(function(args) {
          var array = args[start],
              otherArgs = castSlice(args, 0, start);

          if (array) {
            arrayPush(otherArgs, array);
          }
          return apply(func, this, otherArgs);
        });
      }

      /**
       * Creates a throttled function that only invokes `func` at most once per
       * every `wait` milliseconds. The throttled function comes with a `cancel`
       * method to cancel delayed `func` invocations and a `flush` method to
       * immediately invoke them. Provide `options` to indicate whether `func`
       * should be invoked on the leading and/or trailing edge of the `wait`
       * timeout. The `func` is invoked with the last arguments provided to the
       * throttled function. Subsequent calls to the throttled function return the
       * result of the last `func` invocation.
       *
       * **Note:** If `leading` and `trailing` options are `true`, `func` is
       * invoked on the trailing edge of the timeout only if the throttled function
       * is invoked more than once during the `wait` timeout.
       *
       * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
       * until to the next tick, similar to `setTimeout` with a timeout of `0`.
       *
       * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
       * for details over the differences between `_.throttle` and `_.debounce`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {Function} func The function to throttle.
       * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
       * @param {Object} [options={}] The options object.
       * @param {boolean} [options.leading=true]
       *  Specify invoking on the leading edge of the timeout.
       * @param {boolean} [options.trailing=true]
       *  Specify invoking on the trailing edge of the timeout.
       * @returns {Function} Returns the new throttled function.
       * @example
       *
       * // Avoid excessively updating the position while scrolling.
       * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
       *
       * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
       * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
       * jQuery(element).on('click', throttled);
       *
       * // Cancel the trailing throttled invocation.
       * jQuery(window).on('popstate', throttled.cancel);
       */
      function throttle(func, wait, options) {
        var leading = true,
            trailing = true;

        if (typeof func != 'function') {
          throw new TypeError(FUNC_ERROR_TEXT);
        }
        if (isObject(options)) {
          leading = 'leading' in options ? !!options.leading : leading;
          trailing = 'trailing' in options ? !!options.trailing : trailing;
        }
        return debounce(func, wait, {
          'leading': leading,
          'maxWait': wait,
          'trailing': trailing
        });
      }

      /**
       * Creates a function that accepts up to one argument, ignoring any
       * additional arguments.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Function
       * @param {Function} func The function to cap arguments for.
       * @returns {Function} Returns the new capped function.
       * @example
       *
       * _.map(['6', '8', '10'], _.unary(parseInt));
       * // => [6, 8, 10]
       */
      function unary(func) {
        return ary(func, 1);
      }

      /**
       * Creates a function that provides `value` to `wrapper` as its first
       * argument. Any additional arguments provided to the function are appended
       * to those provided to the `wrapper`. The wrapper is invoked with the `this`
       * binding of the created function.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Function
       * @param {*} value The value to wrap.
       * @param {Function} [wrapper=identity] The wrapper function.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var p = _.wrap(_.escape, function(func, text) {
       *   return '<p>' + func(text) + '</p>';
       * });
       *
       * p('fred, barney, & pebbles');
       * // => '<p>fred, barney, &amp; pebbles</p>'
       */
      function wrap(value, wrapper) {
        return partial(castFunction(wrapper), value);
      }

      /*------------------------------------------------------------------------*/

      /**
       * Casts `value` as an array if it's not one.
       *
       * @static
       * @memberOf _
       * @since 4.4.0
       * @category Lang
       * @param {*} value The value to inspect.
       * @returns {Array} Returns the cast array.
       * @example
       *
       * _.castArray(1);
       * // => [1]
       *
       * _.castArray({ 'a': 1 });
       * // => [{ 'a': 1 }]
       *
       * _.castArray('abc');
       * // => ['abc']
       *
       * _.castArray(null);
       * // => [null]
       *
       * _.castArray(undefined);
       * // => [undefined]
       *
       * _.castArray();
       * // => []
       *
       * var array = [1, 2, 3];
       * console.log(_.castArray(array) === array);
       * // => true
       */
      function castArray() {
        if (!arguments.length) {
          return [];
        }
        var value = arguments[0];
        return isArray(value) ? value : [value];
      }

      /**
       * Creates a shallow clone of `value`.
       *
       * **Note:** This method is loosely based on the
       * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
       * and supports cloning arrays, array buffers, booleans, date objects, maps,
       * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
       * arrays. The own enumerable properties of `arguments` objects are cloned
       * as plain objects. An empty object is returned for uncloneable values such
       * as error objects, functions, DOM nodes, and WeakMaps.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to clone.
       * @returns {*} Returns the cloned value.
       * @see _.cloneDeep
       * @example
       *
       * var objects = [{ 'a': 1 }, { 'b': 2 }];
       *
       * var shallow = _.clone(objects);
       * console.log(shallow[0] === objects[0]);
       * // => true
       */
      function clone(value) {
        return baseClone(value, CLONE_SYMBOLS_FLAG);
      }

      /**
       * This method is like `_.clone` except that it accepts `customizer` which
       * is invoked to produce the cloned value. If `customizer` returns `undefined`,
       * cloning is handled by the method instead. The `customizer` is invoked with
       * up to four arguments; (value [, index|key, object, stack]).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to clone.
       * @param {Function} [customizer] The function to customize cloning.
       * @returns {*} Returns the cloned value.
       * @see _.cloneDeepWith
       * @example
       *
       * function customizer(value) {
       *   if (_.isElement(value)) {
       *     return value.cloneNode(false);
       *   }
       * }
       *
       * var el = _.cloneWith(document.body, customizer);
       *
       * console.log(el === document.body);
       * // => false
       * console.log(el.nodeName);
       * // => 'BODY'
       * console.log(el.childNodes.length);
       * // => 0
       */
      function cloneWith(value, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined$1;
        return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
      }

      /**
       * This method is like `_.clone` except that it recursively clones `value`.
       *
       * @static
       * @memberOf _
       * @since 1.0.0
       * @category Lang
       * @param {*} value The value to recursively clone.
       * @returns {*} Returns the deep cloned value.
       * @see _.clone
       * @example
       *
       * var objects = [{ 'a': 1 }, { 'b': 2 }];
       *
       * var deep = _.cloneDeep(objects);
       * console.log(deep[0] === objects[0]);
       * // => false
       */
      function cloneDeep(value) {
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
      }

      /**
       * This method is like `_.cloneWith` except that it recursively clones `value`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to recursively clone.
       * @param {Function} [customizer] The function to customize cloning.
       * @returns {*} Returns the deep cloned value.
       * @see _.cloneWith
       * @example
       *
       * function customizer(value) {
       *   if (_.isElement(value)) {
       *     return value.cloneNode(true);
       *   }
       * }
       *
       * var el = _.cloneDeepWith(document.body, customizer);
       *
       * console.log(el === document.body);
       * // => false
       * console.log(el.nodeName);
       * // => 'BODY'
       * console.log(el.childNodes.length);
       * // => 20
       */
      function cloneDeepWith(value, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined$1;
        return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
      }

      /**
       * Checks if `object` conforms to `source` by invoking the predicate
       * properties of `source` with the corresponding property values of `object`.
       *
       * **Note:** This method is equivalent to `_.conforms` when `source` is
       * partially applied.
       *
       * @static
       * @memberOf _
       * @since 4.14.0
       * @category Lang
       * @param {Object} object The object to inspect.
       * @param {Object} source The object of property predicates to conform to.
       * @returns {boolean} Returns `true` if `object` conforms, else `false`.
       * @example
       *
       * var object = { 'a': 1, 'b': 2 };
       *
       * _.conformsTo(object, { 'b': function(n) { return n > 1; } });
       * // => true
       *
       * _.conformsTo(object, { 'b': function(n) { return n > 2; } });
       * // => false
       */
      function conformsTo(object, source) {
        return source == null || baseConformsTo(object, source, keys(source));
      }

      /**
       * Performs a
       * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
       * comparison between two values to determine if they are equivalent.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
       * @example
       *
       * var object = { 'a': 1 };
       * var other = { 'a': 1 };
       *
       * _.eq(object, object);
       * // => true
       *
       * _.eq(object, other);
       * // => false
       *
       * _.eq('a', 'a');
       * // => true
       *
       * _.eq('a', Object('a'));
       * // => false
       *
       * _.eq(NaN, NaN);
       * // => true
       */
      function eq(value, other) {
        return value === other || (value !== value && other !== other);
      }

      /**
       * Checks if `value` is greater than `other`.
       *
       * @static
       * @memberOf _
       * @since 3.9.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is greater than `other`,
       *  else `false`.
       * @see _.lt
       * @example
       *
       * _.gt(3, 1);
       * // => true
       *
       * _.gt(3, 3);
       * // => false
       *
       * _.gt(1, 3);
       * // => false
       */
      var gt = createRelationalOperation(baseGt);

      /**
       * Checks if `value` is greater than or equal to `other`.
       *
       * @static
       * @memberOf _
       * @since 3.9.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is greater than or equal to
       *  `other`, else `false`.
       * @see _.lte
       * @example
       *
       * _.gte(3, 1);
       * // => true
       *
       * _.gte(3, 3);
       * // => true
       *
       * _.gte(1, 3);
       * // => false
       */
      var gte = createRelationalOperation(function(value, other) {
        return value >= other;
      });

      /**
       * Checks if `value` is likely an `arguments` object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an `arguments` object,
       *  else `false`.
       * @example
       *
       * _.isArguments(function() { return arguments; }());
       * // => true
       *
       * _.isArguments([1, 2, 3]);
       * // => false
       */
      var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
        return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
          !propertyIsEnumerable.call(value, 'callee');
      };

      /**
       * Checks if `value` is classified as an `Array` object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an array, else `false`.
       * @example
       *
       * _.isArray([1, 2, 3]);
       * // => true
       *
       * _.isArray(document.body.children);
       * // => false
       *
       * _.isArray('abc');
       * // => false
       *
       * _.isArray(_.noop);
       * // => false
       */
      var isArray = Array.isArray;

      /**
       * Checks if `value` is classified as an `ArrayBuffer` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
       * @example
       *
       * _.isArrayBuffer(new ArrayBuffer(2));
       * // => true
       *
       * _.isArrayBuffer(new Array(2));
       * // => false
       */
      var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;

      /**
       * Checks if `value` is array-like. A value is considered array-like if it's
       * not a function and has a `value.length` that's an integer greater than or
       * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
       * @example
       *
       * _.isArrayLike([1, 2, 3]);
       * // => true
       *
       * _.isArrayLike(document.body.children);
       * // => true
       *
       * _.isArrayLike('abc');
       * // => true
       *
       * _.isArrayLike(_.noop);
       * // => false
       */
      function isArrayLike(value) {
        return value != null && isLength(value.length) && !isFunction(value);
      }

      /**
       * This method is like `_.isArrayLike` except that it also checks if `value`
       * is an object.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an array-like object,
       *  else `false`.
       * @example
       *
       * _.isArrayLikeObject([1, 2, 3]);
       * // => true
       *
       * _.isArrayLikeObject(document.body.children);
       * // => true
       *
       * _.isArrayLikeObject('abc');
       * // => false
       *
       * _.isArrayLikeObject(_.noop);
       * // => false
       */
      function isArrayLikeObject(value) {
        return isObjectLike(value) && isArrayLike(value);
      }

      /**
       * Checks if `value` is classified as a boolean primitive or object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
       * @example
       *
       * _.isBoolean(false);
       * // => true
       *
       * _.isBoolean(null);
       * // => false
       */
      function isBoolean(value) {
        return value === true || value === false ||
          (isObjectLike(value) && baseGetTag(value) == boolTag);
      }

      /**
       * Checks if `value` is a buffer.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
       * @example
       *
       * _.isBuffer(new Buffer(2));
       * // => true
       *
       * _.isBuffer(new Uint8Array(2));
       * // => false
       */
      var isBuffer = nativeIsBuffer || stubFalse;

      /**
       * Checks if `value` is classified as a `Date` object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
       * @example
       *
       * _.isDate(new Date);
       * // => true
       *
       * _.isDate('Mon April 23 2012');
       * // => false
       */
      var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;

      /**
       * Checks if `value` is likely a DOM element.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
       * @example
       *
       * _.isElement(document.body);
       * // => true
       *
       * _.isElement('<body>');
       * // => false
       */
      function isElement(value) {
        return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
      }

      /**
       * Checks if `value` is an empty object, collection, map, or set.
       *
       * Objects are considered empty if they have no own enumerable string keyed
       * properties.
       *
       * Array-like values such as `arguments` objects, arrays, buffers, strings, or
       * jQuery-like collections are considered empty if they have a `length` of `0`.
       * Similarly, maps and sets are considered empty if they have a `size` of `0`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is empty, else `false`.
       * @example
       *
       * _.isEmpty(null);
       * // => true
       *
       * _.isEmpty(true);
       * // => true
       *
       * _.isEmpty(1);
       * // => true
       *
       * _.isEmpty([1, 2, 3]);
       * // => false
       *
       * _.isEmpty({ 'a': 1 });
       * // => false
       */
      function isEmpty(value) {
        if (value == null) {
          return true;
        }
        if (isArrayLike(value) &&
            (isArray(value) || typeof value == 'string' || typeof value.splice == 'function' ||
              isBuffer(value) || isTypedArray(value) || isArguments(value))) {
          return !value.length;
        }
        var tag = getTag(value);
        if (tag == mapTag || tag == setTag) {
          return !value.size;
        }
        if (isPrototype(value)) {
          return !baseKeys(value).length;
        }
        for (var key in value) {
          if (hasOwnProperty.call(value, key)) {
            return false;
          }
        }
        return true;
      }

      /**
       * Performs a deep comparison between two values to determine if they are
       * equivalent.
       *
       * **Note:** This method supports comparing arrays, array buffers, booleans,
       * date objects, error objects, maps, numbers, `Object` objects, regexes,
       * sets, strings, symbols, and typed arrays. `Object` objects are compared
       * by their own, not inherited, enumerable properties. Functions and DOM
       * nodes are compared by strict equality, i.e. `===`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
       * @example
       *
       * var object = { 'a': 1 };
       * var other = { 'a': 1 };
       *
       * _.isEqual(object, other);
       * // => true
       *
       * object === other;
       * // => false
       */
      function isEqual(value, other) {
        return baseIsEqual(value, other);
      }

      /**
       * This method is like `_.isEqual` except that it accepts `customizer` which
       * is invoked to compare values. If `customizer` returns `undefined`, comparisons
       * are handled by the method instead. The `customizer` is invoked with up to
       * six arguments: (objValue, othValue [, index|key, object, other, stack]).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @param {Function} [customizer] The function to customize comparisons.
       * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
       * @example
       *
       * function isGreeting(value) {
       *   return /^h(?:i|ello)$/.test(value);
       * }
       *
       * function customizer(objValue, othValue) {
       *   if (isGreeting(objValue) && isGreeting(othValue)) {
       *     return true;
       *   }
       * }
       *
       * var array = ['hello', 'goodbye'];
       * var other = ['hi', 'goodbye'];
       *
       * _.isEqualWith(array, other, customizer);
       * // => true
       */
      function isEqualWith(value, other, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined$1;
        var result = customizer ? customizer(value, other) : undefined$1;
        return result === undefined$1 ? baseIsEqual(value, other, undefined$1, customizer) : !!result;
      }

      /**
       * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
       * `SyntaxError`, `TypeError`, or `URIError` object.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
       * @example
       *
       * _.isError(new Error);
       * // => true
       *
       * _.isError(Error);
       * // => false
       */
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag ||
          (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
      }

      /**
       * Checks if `value` is a finite primitive number.
       *
       * **Note:** This method is based on
       * [`Number.isFinite`](https://mdn.io/Number/isFinite).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
       * @example
       *
       * _.isFinite(3);
       * // => true
       *
       * _.isFinite(Number.MIN_VALUE);
       * // => true
       *
       * _.isFinite(Infinity);
       * // => false
       *
       * _.isFinite('3');
       * // => false
       */
      function isFinite(value) {
        return typeof value == 'number' && nativeIsFinite(value);
      }

      /**
       * Checks if `value` is classified as a `Function` object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a function, else `false`.
       * @example
       *
       * _.isFunction(_);
       * // => true
       *
       * _.isFunction(/abc/);
       * // => false
       */
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        // The use of `Object#toString` avoids issues with the `typeof` operator
        // in Safari 9 which returns 'object' for typed arrays and other constructors.
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }

      /**
       * Checks if `value` is an integer.
       *
       * **Note:** This method is based on
       * [`Number.isInteger`](https://mdn.io/Number/isInteger).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
       * @example
       *
       * _.isInteger(3);
       * // => true
       *
       * _.isInteger(Number.MIN_VALUE);
       * // => false
       *
       * _.isInteger(Infinity);
       * // => false
       *
       * _.isInteger('3');
       * // => false
       */
      function isInteger(value) {
        return typeof value == 'number' && value == toInteger(value);
      }

      /**
       * Checks if `value` is a valid array-like length.
       *
       * **Note:** This method is loosely based on
       * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
       * @example
       *
       * _.isLength(3);
       * // => true
       *
       * _.isLength(Number.MIN_VALUE);
       * // => false
       *
       * _.isLength(Infinity);
       * // => false
       *
       * _.isLength('3');
       * // => false
       */
      function isLength(value) {
        return typeof value == 'number' &&
          value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }

      /**
       * Checks if `value` is the
       * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
       * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an object, else `false`.
       * @example
       *
       * _.isObject({});
       * // => true
       *
       * _.isObject([1, 2, 3]);
       * // => true
       *
       * _.isObject(_.noop);
       * // => true
       *
       * _.isObject(null);
       * // => false
       */
      function isObject(value) {
        var type = typeof value;
        return value != null && (type == 'object' || type == 'function');
      }

      /**
       * Checks if `value` is object-like. A value is object-like if it's not `null`
       * and has a `typeof` result of "object".
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
       * @example
       *
       * _.isObjectLike({});
       * // => true
       *
       * _.isObjectLike([1, 2, 3]);
       * // => true
       *
       * _.isObjectLike(_.noop);
       * // => false
       *
       * _.isObjectLike(null);
       * // => false
       */
      function isObjectLike(value) {
        return value != null && typeof value == 'object';
      }

      /**
       * Checks if `value` is classified as a `Map` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a map, else `false`.
       * @example
       *
       * _.isMap(new Map);
       * // => true
       *
       * _.isMap(new WeakMap);
       * // => false
       */
      var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

      /**
       * Performs a partial deep comparison between `object` and `source` to
       * determine if `object` contains equivalent property values.
       *
       * **Note:** This method is equivalent to `_.matches` when `source` is
       * partially applied.
       *
       * Partial comparisons will match empty array and empty object `source`
       * values against any array or object value, respectively. See `_.isEqual`
       * for a list of supported value comparisons.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {Object} object The object to inspect.
       * @param {Object} source The object of property values to match.
       * @returns {boolean} Returns `true` if `object` is a match, else `false`.
       * @example
       *
       * var object = { 'a': 1, 'b': 2 };
       *
       * _.isMatch(object, { 'b': 2 });
       * // => true
       *
       * _.isMatch(object, { 'b': 1 });
       * // => false
       */
      function isMatch(object, source) {
        return object === source || baseIsMatch(object, source, getMatchData(source));
      }

      /**
       * This method is like `_.isMatch` except that it accepts `customizer` which
       * is invoked to compare values. If `customizer` returns `undefined`, comparisons
       * are handled by the method instead. The `customizer` is invoked with five
       * arguments: (objValue, srcValue, index|key, object, source).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {Object} object The object to inspect.
       * @param {Object} source The object of property values to match.
       * @param {Function} [customizer] The function to customize comparisons.
       * @returns {boolean} Returns `true` if `object` is a match, else `false`.
       * @example
       *
       * function isGreeting(value) {
       *   return /^h(?:i|ello)$/.test(value);
       * }
       *
       * function customizer(objValue, srcValue) {
       *   if (isGreeting(objValue) && isGreeting(srcValue)) {
       *     return true;
       *   }
       * }
       *
       * var object = { 'greeting': 'hello' };
       * var source = { 'greeting': 'hi' };
       *
       * _.isMatchWith(object, source, customizer);
       * // => true
       */
      function isMatchWith(object, source, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined$1;
        return baseIsMatch(object, source, getMatchData(source), customizer);
      }

      /**
       * Checks if `value` is `NaN`.
       *
       * **Note:** This method is based on
       * [`Number.isNaN`](https://mdn.io/Number/isNaN) and is not the same as
       * global [`isNaN`](https://mdn.io/isNaN) which returns `true` for
       * `undefined` and other non-number values.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
       * @example
       *
       * _.isNaN(NaN);
       * // => true
       *
       * _.isNaN(new Number(NaN));
       * // => true
       *
       * isNaN(undefined);
       * // => true
       *
       * _.isNaN(undefined);
       * // => false
       */
      function isNaN(value) {
        // An `NaN` primitive is the only value that is not equal to itself.
        // Perform the `toStringTag` check first to avoid errors with some
        // ActiveX objects in IE.
        return isNumber(value) && value != +value;
      }

      /**
       * Checks if `value` is a pristine native function.
       *
       * **Note:** This method can't reliably detect native functions in the presence
       * of the core-js package because core-js circumvents this kind of detection.
       * Despite multiple requests, the core-js maintainer has made it clear: any
       * attempt to fix the detection will be obstructed. As a result, we're left
       * with little choice but to throw an error. Unfortunately, this also affects
       * packages, like [babel-polyfill](https://www.npmjs.com/package/babel-polyfill),
       * which rely on core-js.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a native function,
       *  else `false`.
       * @example
       *
       * _.isNative(Array.prototype.push);
       * // => true
       *
       * _.isNative(_);
       * // => false
       */
      function isNative(value) {
        if (isMaskable(value)) {
          throw new Error(CORE_ERROR_TEXT);
        }
        return baseIsNative(value);
      }

      /**
       * Checks if `value` is `null`.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
       * @example
       *
       * _.isNull(null);
       * // => true
       *
       * _.isNull(void 0);
       * // => false
       */
      function isNull(value) {
        return value === null;
      }

      /**
       * Checks if `value` is `null` or `undefined`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
       * @example
       *
       * _.isNil(null);
       * // => true
       *
       * _.isNil(void 0);
       * // => true
       *
       * _.isNil(NaN);
       * // => false
       */
      function isNil(value) {
        return value == null;
      }

      /**
       * Checks if `value` is classified as a `Number` primitive or object.
       *
       * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
       * classified as numbers, use the `_.isFinite` method.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a number, else `false`.
       * @example
       *
       * _.isNumber(3);
       * // => true
       *
       * _.isNumber(Number.MIN_VALUE);
       * // => true
       *
       * _.isNumber(Infinity);
       * // => true
       *
       * _.isNumber('3');
       * // => false
       */
      function isNumber(value) {
        return typeof value == 'number' ||
          (isObjectLike(value) && baseGetTag(value) == numberTag);
      }

      /**
       * Checks if `value` is a plain object, that is, an object created by the
       * `Object` constructor or one with a `[[Prototype]]` of `null`.
       *
       * @static
       * @memberOf _
       * @since 0.8.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       * }
       *
       * _.isPlainObject(new Foo);
       * // => false
       *
       * _.isPlainObject([1, 2, 3]);
       * // => false
       *
       * _.isPlainObject({ 'x': 0, 'y': 0 });
       * // => true
       *
       * _.isPlainObject(Object.create(null));
       * // => true
       */
      function isPlainObject(value) {
        if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
          return false;
        }
        var proto = getPrototype(value);
        if (proto === null) {
          return true;
        }
        var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
        return typeof Ctor == 'function' && Ctor instanceof Ctor &&
          funcToString.call(Ctor) == objectCtorString;
      }

      /**
       * Checks if `value` is classified as a `RegExp` object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
       * @example
       *
       * _.isRegExp(/abc/);
       * // => true
       *
       * _.isRegExp('/abc/');
       * // => false
       */
      var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;

      /**
       * Checks if `value` is a safe integer. An integer is safe if it's an IEEE-754
       * double precision number which isn't the result of a rounded unsafe integer.
       *
       * **Note:** This method is based on
       * [`Number.isSafeInteger`](https://mdn.io/Number/isSafeInteger).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a safe integer, else `false`.
       * @example
       *
       * _.isSafeInteger(3);
       * // => true
       *
       * _.isSafeInteger(Number.MIN_VALUE);
       * // => false
       *
       * _.isSafeInteger(Infinity);
       * // => false
       *
       * _.isSafeInteger('3');
       * // => false
       */
      function isSafeInteger(value) {
        return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
      }

      /**
       * Checks if `value` is classified as a `Set` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a set, else `false`.
       * @example
       *
       * _.isSet(new Set);
       * // => true
       *
       * _.isSet(new WeakSet);
       * // => false
       */
      var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

      /**
       * Checks if `value` is classified as a `String` primitive or object.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a string, else `false`.
       * @example
       *
       * _.isString('abc');
       * // => true
       *
       * _.isString(1);
       * // => false
       */
      function isString(value) {
        return typeof value == 'string' ||
          (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
      }

      /**
       * Checks if `value` is classified as a `Symbol` primitive or object.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
       * @example
       *
       * _.isSymbol(Symbol.iterator);
       * // => true
       *
       * _.isSymbol('abc');
       * // => false
       */
      function isSymbol(value) {
        return typeof value == 'symbol' ||
          (isObjectLike(value) && baseGetTag(value) == symbolTag);
      }

      /**
       * Checks if `value` is classified as a typed array.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
       * @example
       *
       * _.isTypedArray(new Uint8Array);
       * // => true
       *
       * _.isTypedArray([]);
       * // => false
       */
      var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

      /**
       * Checks if `value` is `undefined`.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
       * @example
       *
       * _.isUndefined(void 0);
       * // => true
       *
       * _.isUndefined(null);
       * // => false
       */
      function isUndefined(value) {
        return value === undefined$1;
      }

      /**
       * Checks if `value` is classified as a `WeakMap` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
       * @example
       *
       * _.isWeakMap(new WeakMap);
       * // => true
       *
       * _.isWeakMap(new Map);
       * // => false
       */
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }

      /**
       * Checks if `value` is classified as a `WeakSet` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
       * @example
       *
       * _.isWeakSet(new WeakSet);
       * // => true
       *
       * _.isWeakSet(new Set);
       * // => false
       */
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }

      /**
       * Checks if `value` is less than `other`.
       *
       * @static
       * @memberOf _
       * @since 3.9.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is less than `other`,
       *  else `false`.
       * @see _.gt
       * @example
       *
       * _.lt(1, 3);
       * // => true
       *
       * _.lt(3, 3);
       * // => false
       *
       * _.lt(3, 1);
       * // => false
       */
      var lt = createRelationalOperation(baseLt);

      /**
       * Checks if `value` is less than or equal to `other`.
       *
       * @static
       * @memberOf _
       * @since 3.9.0
       * @category Lang
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is less than or equal to
       *  `other`, else `false`.
       * @see _.gte
       * @example
       *
       * _.lte(1, 3);
       * // => true
       *
       * _.lte(3, 3);
       * // => true
       *
       * _.lte(3, 1);
       * // => false
       */
      var lte = createRelationalOperation(function(value, other) {
        return value <= other;
      });

      /**
       * Converts `value` to an array.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {Array} Returns the converted array.
       * @example
       *
       * _.toArray({ 'a': 1, 'b': 2 });
       * // => [1, 2]
       *
       * _.toArray('abc');
       * // => ['a', 'b', 'c']
       *
       * _.toArray(1);
       * // => []
       *
       * _.toArray(null);
       * // => []
       */
      function toArray(value) {
        if (!value) {
          return [];
        }
        if (isArrayLike(value)) {
          return isString(value) ? stringToArray(value) : copyArray(value);
        }
        if (symIterator && value[symIterator]) {
          return iteratorToArray(value[symIterator]());
        }
        var tag = getTag(value),
            func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);

        return func(value);
      }

      /**
       * Converts `value` to a finite number.
       *
       * @static
       * @memberOf _
       * @since 4.12.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {number} Returns the converted number.
       * @example
       *
       * _.toFinite(3.2);
       * // => 3.2
       *
       * _.toFinite(Number.MIN_VALUE);
       * // => 5e-324
       *
       * _.toFinite(Infinity);
       * // => 1.7976931348623157e+308
       *
       * _.toFinite('3.2');
       * // => 3.2
       */
      function toFinite(value) {
        if (!value) {
          return value === 0 ? value : 0;
        }
        value = toNumber(value);
        if (value === INFINITY || value === -INFINITY) {
          var sign = (value < 0 ? -1 : 1);
          return sign * MAX_INTEGER;
        }
        return value === value ? value : 0;
      }

      /**
       * Converts `value` to an integer.
       *
       * **Note:** This method is loosely based on
       * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {number} Returns the converted integer.
       * @example
       *
       * _.toInteger(3.2);
       * // => 3
       *
       * _.toInteger(Number.MIN_VALUE);
       * // => 0
       *
       * _.toInteger(Infinity);
       * // => 1.7976931348623157e+308
       *
       * _.toInteger('3.2');
       * // => 3
       */
      function toInteger(value) {
        var result = toFinite(value),
            remainder = result % 1;

        return result === result ? (remainder ? result - remainder : result) : 0;
      }

      /**
       * Converts `value` to an integer suitable for use as the length of an
       * array-like object.
       *
       * **Note:** This method is based on
       * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {number} Returns the converted integer.
       * @example
       *
       * _.toLength(3.2);
       * // => 3
       *
       * _.toLength(Number.MIN_VALUE);
       * // => 0
       *
       * _.toLength(Infinity);
       * // => 4294967295
       *
       * _.toLength('3.2');
       * // => 3
       */
      function toLength(value) {
        return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
      }

      /**
       * Converts `value` to a number.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to process.
       * @returns {number} Returns the number.
       * @example
       *
       * _.toNumber(3.2);
       * // => 3.2
       *
       * _.toNumber(Number.MIN_VALUE);
       * // => 5e-324
       *
       * _.toNumber(Infinity);
       * // => Infinity
       *
       * _.toNumber('3.2');
       * // => 3.2
       */
      function toNumber(value) {
        if (typeof value == 'number') {
          return value;
        }
        if (isSymbol(value)) {
          return NAN;
        }
        if (isObject(value)) {
          var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
          value = isObject(other) ? (other + '') : other;
        }
        if (typeof value != 'string') {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, '');
        var isBinary = reIsBinary.test(value);
        return (isBinary || reIsOctal.test(value))
          ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
          : (reIsBadHex.test(value) ? NAN : +value);
      }

      /**
       * Converts `value` to a plain object flattening inherited enumerable string
       * keyed properties of `value` to own properties of the plain object.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {Object} Returns the converted plain object.
       * @example
       *
       * function Foo() {
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.assign({ 'a': 1 }, new Foo);
       * // => { 'a': 1, 'b': 2 }
       *
       * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
       * // => { 'a': 1, 'b': 2, 'c': 3 }
       */
      function toPlainObject(value) {
        return copyObject(value, keysIn(value));
      }

      /**
       * Converts `value` to a safe integer. A safe integer can be compared and
       * represented correctly.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {number} Returns the converted integer.
       * @example
       *
       * _.toSafeInteger(3.2);
       * // => 3
       *
       * _.toSafeInteger(Number.MIN_VALUE);
       * // => 0
       *
       * _.toSafeInteger(Infinity);
       * // => 9007199254740991
       *
       * _.toSafeInteger('3.2');
       * // => 3
       */
      function toSafeInteger(value) {
        return value
          ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER)
          : (value === 0 ? value : 0);
      }

      /**
       * Converts `value` to a string. An empty string is returned for `null`
       * and `undefined` values. The sign of `-0` is preserved.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Lang
       * @param {*} value The value to convert.
       * @returns {string} Returns the converted string.
       * @example
       *
       * _.toString(null);
       * // => ''
       *
       * _.toString(-0);
       * // => '-0'
       *
       * _.toString([1, 2, 3]);
       * // => '1,2,3'
       */
      function toString(value) {
        return value == null ? '' : baseToString(value);
      }

      /*------------------------------------------------------------------------*/

      /**
       * Assigns own enumerable string keyed properties of source objects to the
       * destination object. Source objects are applied from left to right.
       * Subsequent sources overwrite property assignments of previous sources.
       *
       * **Note:** This method mutates `object` and is loosely based on
       * [`Object.assign`](https://mdn.io/Object/assign).
       *
       * @static
       * @memberOf _
       * @since 0.10.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @see _.assignIn
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       * }
       *
       * function Bar() {
       *   this.c = 3;
       * }
       *
       * Foo.prototype.b = 2;
       * Bar.prototype.d = 4;
       *
       * _.assign({ 'a': 0 }, new Foo, new Bar);
       * // => { 'a': 1, 'c': 3 }
       */
      var assign = createAssigner(function(object, source) {
        if (isPrototype(source) || isArrayLike(source)) {
          copyObject(source, keys(source), object);
          return;
        }
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            assignValue(object, key, source[key]);
          }
        }
      });

      /**
       * This method is like `_.assign` except that it iterates over own and
       * inherited source properties.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @alias extend
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @see _.assign
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       * }
       *
       * function Bar() {
       *   this.c = 3;
       * }
       *
       * Foo.prototype.b = 2;
       * Bar.prototype.d = 4;
       *
       * _.assignIn({ 'a': 0 }, new Foo, new Bar);
       * // => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }
       */
      var assignIn = createAssigner(function(object, source) {
        copyObject(source, keysIn(source), object);
      });

      /**
       * This method is like `_.assignIn` except that it accepts `customizer`
       * which is invoked to produce the assigned values. If `customizer` returns
       * `undefined`, assignment is handled by the method instead. The `customizer`
       * is invoked with five arguments: (objValue, srcValue, key, object, source).
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @alias extendWith
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} sources The source objects.
       * @param {Function} [customizer] The function to customize assigned values.
       * @returns {Object} Returns `object`.
       * @see _.assignWith
       * @example
       *
       * function customizer(objValue, srcValue) {
       *   return _.isUndefined(objValue) ? srcValue : objValue;
       * }
       *
       * var defaults = _.partialRight(_.assignInWith, customizer);
       *
       * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
       * // => { 'a': 1, 'b': 2 }
       */
      var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keysIn(source), object, customizer);
      });

      /**
       * This method is like `_.assign` except that it accepts `customizer`
       * which is invoked to produce the assigned values. If `customizer` returns
       * `undefined`, assignment is handled by the method instead. The `customizer`
       * is invoked with five arguments: (objValue, srcValue, key, object, source).
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} sources The source objects.
       * @param {Function} [customizer] The function to customize assigned values.
       * @returns {Object} Returns `object`.
       * @see _.assignInWith
       * @example
       *
       * function customizer(objValue, srcValue) {
       *   return _.isUndefined(objValue) ? srcValue : objValue;
       * }
       *
       * var defaults = _.partialRight(_.assignWith, customizer);
       *
       * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
       * // => { 'a': 1, 'b': 2 }
       */
      var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
        copyObject(source, keys(source), object, customizer);
      });

      /**
       * Creates an array of values corresponding to `paths` of `object`.
       *
       * @static
       * @memberOf _
       * @since 1.0.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {...(string|string[])} [paths] The property paths to pick.
       * @returns {Array} Returns the picked values.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
       *
       * _.at(object, ['a[0].b.c', 'a[1]']);
       * // => [3, 4]
       */
      var at = flatRest(baseAt);

      /**
       * Creates an object that inherits from the `prototype` object. If a
       * `properties` object is given, its own enumerable string keyed properties
       * are assigned to the created object.
       *
       * @static
       * @memberOf _
       * @since 2.3.0
       * @category Object
       * @param {Object} prototype The object to inherit from.
       * @param {Object} [properties] The properties to assign to the object.
       * @returns {Object} Returns the new object.
       * @example
       *
       * function Shape() {
       *   this.x = 0;
       *   this.y = 0;
       * }
       *
       * function Circle() {
       *   Shape.call(this);
       * }
       *
       * Circle.prototype = _.create(Shape.prototype, {
       *   'constructor': Circle
       * });
       *
       * var circle = new Circle;
       * circle instanceof Circle;
       * // => true
       *
       * circle instanceof Shape;
       * // => true
       */
      function create(prototype, properties) {
        var result = baseCreate(prototype);
        return properties == null ? result : baseAssign(result, properties);
      }

      /**
       * Assigns own and inherited enumerable string keyed properties of source
       * objects to the destination object for all destination properties that
       * resolve to `undefined`. Source objects are applied from left to right.
       * Once a property is set, additional values of the same property are ignored.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @see _.defaultsDeep
       * @example
       *
       * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
       * // => { 'a': 1, 'b': 2 }
       */
      var defaults = baseRest(function(object, sources) {
        object = Object(object);

        var index = -1;
        var length = sources.length;
        var guard = length > 2 ? sources[2] : undefined$1;

        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          length = 1;
        }

        while (++index < length) {
          var source = sources[index];
          var props = keysIn(source);
          var propsIndex = -1;
          var propsLength = props.length;

          while (++propsIndex < propsLength) {
            var key = props[propsIndex];
            var value = object[key];

            if (value === undefined$1 ||
                (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
              object[key] = source[key];
            }
          }
        }

        return object;
      });

      /**
       * This method is like `_.defaults` except that it recursively assigns
       * default properties.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 3.10.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @see _.defaults
       * @example
       *
       * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
       * // => { 'a': { 'b': 2, 'c': 3 } }
       */
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined$1, customDefaultsMerge);
        return apply(mergeWith, undefined$1, args);
      });

      /**
       * This method is like `_.find` except that it returns the key of the first
       * element `predicate` returns truthy for instead of the element itself.
       *
       * @static
       * @memberOf _
       * @since 1.1.0
       * @category Object
       * @param {Object} object The object to inspect.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {string|undefined} Returns the key of the matched element,
       *  else `undefined`.
       * @example
       *
       * var users = {
       *   'barney':  { 'age': 36, 'active': true },
       *   'fred':    { 'age': 40, 'active': false },
       *   'pebbles': { 'age': 1,  'active': true }
       * };
       *
       * _.findKey(users, function(o) { return o.age < 40; });
       * // => 'barney' (iteration order is not guaranteed)
       *
       * // The `_.matches` iteratee shorthand.
       * _.findKey(users, { 'age': 1, 'active': true });
       * // => 'pebbles'
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.findKey(users, ['active', false]);
       * // => 'fred'
       *
       * // The `_.property` iteratee shorthand.
       * _.findKey(users, 'active');
       * // => 'barney'
       */
      function findKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
      }

      /**
       * This method is like `_.findKey` except that it iterates over elements of
       * a collection in the opposite order.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Object
       * @param {Object} object The object to inspect.
       * @param {Function} [predicate=_.identity] The function invoked per iteration.
       * @returns {string|undefined} Returns the key of the matched element,
       *  else `undefined`.
       * @example
       *
       * var users = {
       *   'barney':  { 'age': 36, 'active': true },
       *   'fred':    { 'age': 40, 'active': false },
       *   'pebbles': { 'age': 1,  'active': true }
       * };
       *
       * _.findLastKey(users, function(o) { return o.age < 40; });
       * // => returns 'pebbles' assuming `_.findKey` returns 'barney'
       *
       * // The `_.matches` iteratee shorthand.
       * _.findLastKey(users, { 'age': 36, 'active': true });
       * // => 'barney'
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.findLastKey(users, ['active', false]);
       * // => 'fred'
       *
       * // The `_.property` iteratee shorthand.
       * _.findLastKey(users, 'active');
       * // => 'pebbles'
       */
      function findLastKey(object, predicate) {
        return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
      }

      /**
       * Iterates over own and inherited enumerable string keyed properties of an
       * object and invokes `iteratee` for each property. The iteratee is invoked
       * with three arguments: (value, key, object). Iteratee functions may exit
       * iteration early by explicitly returning `false`.
       *
       * @static
       * @memberOf _
       * @since 0.3.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns `object`.
       * @see _.forInRight
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.forIn(new Foo, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
       */
      function forIn(object, iteratee) {
        return object == null
          ? object
          : baseFor(object, getIteratee(iteratee, 3), keysIn);
      }

      /**
       * This method is like `_.forIn` except that it iterates over properties of
       * `object` in the opposite order.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns `object`.
       * @see _.forIn
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.forInRight(new Foo, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'c', 'b', then 'a' assuming `_.forIn` logs 'a', 'b', then 'c'.
       */
      function forInRight(object, iteratee) {
        return object == null
          ? object
          : baseForRight(object, getIteratee(iteratee, 3), keysIn);
      }

      /**
       * Iterates over own enumerable string keyed properties of an object and
       * invokes `iteratee` for each property. The iteratee is invoked with three
       * arguments: (value, key, object). Iteratee functions may exit iteration
       * early by explicitly returning `false`.
       *
       * @static
       * @memberOf _
       * @since 0.3.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns `object`.
       * @see _.forOwnRight
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.forOwn(new Foo, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'a' then 'b' (iteration order is not guaranteed).
       */
      function forOwn(object, iteratee) {
        return object && baseForOwn(object, getIteratee(iteratee, 3));
      }

      /**
       * This method is like `_.forOwn` except that it iterates over properties of
       * `object` in the opposite order.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns `object`.
       * @see _.forOwn
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.forOwnRight(new Foo, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'b' then 'a' assuming `_.forOwn` logs 'a' then 'b'.
       */
      function forOwnRight(object, iteratee) {
        return object && baseForOwnRight(object, getIteratee(iteratee, 3));
      }

      /**
       * Creates an array of function property names from own enumerable properties
       * of `object`.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The object to inspect.
       * @returns {Array} Returns the function names.
       * @see _.functionsIn
       * @example
       *
       * function Foo() {
       *   this.a = _.constant('a');
       *   this.b = _.constant('b');
       * }
       *
       * Foo.prototype.c = _.constant('c');
       *
       * _.functions(new Foo);
       * // => ['a', 'b']
       */
      function functions(object) {
        return object == null ? [] : baseFunctions(object, keys(object));
      }

      /**
       * Creates an array of function property names from own and inherited
       * enumerable properties of `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The object to inspect.
       * @returns {Array} Returns the function names.
       * @see _.functions
       * @example
       *
       * function Foo() {
       *   this.a = _.constant('a');
       *   this.b = _.constant('b');
       * }
       *
       * Foo.prototype.c = _.constant('c');
       *
       * _.functionsIn(new Foo);
       * // => ['a', 'b', 'c']
       */
      function functionsIn(object) {
        return object == null ? [] : baseFunctions(object, keysIn(object));
      }

      /**
       * Gets the value at `path` of `object`. If the resolved value is
       * `undefined`, the `defaultValue` is returned in its place.
       *
       * @static
       * @memberOf _
       * @since 3.7.0
       * @category Object
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the property to get.
       * @param {*} [defaultValue] The value returned for `undefined` resolved values.
       * @returns {*} Returns the resolved value.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 3 } }] };
       *
       * _.get(object, 'a[0].b.c');
       * // => 3
       *
       * _.get(object, ['a', '0', 'b', 'c']);
       * // => 3
       *
       * _.get(object, 'a.b.c', 'default');
       * // => 'default'
       */
      function get(object, path, defaultValue) {
        var result = object == null ? undefined$1 : baseGet(object, path);
        return result === undefined$1 ? defaultValue : result;
      }

      /**
       * Checks if `path` is a direct property of `object`.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The object to query.
       * @param {Array|string} path The path to check.
       * @returns {boolean} Returns `true` if `path` exists, else `false`.
       * @example
       *
       * var object = { 'a': { 'b': 2 } };
       * var other = _.create({ 'a': _.create({ 'b': 2 }) });
       *
       * _.has(object, 'a');
       * // => true
       *
       * _.has(object, 'a.b');
       * // => true
       *
       * _.has(object, ['a', 'b']);
       * // => true
       *
       * _.has(other, 'a');
       * // => false
       */
      function has(object, path) {
        return object != null && hasPath(object, path, baseHas);
      }

      /**
       * Checks if `path` is a direct or inherited property of `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The object to query.
       * @param {Array|string} path The path to check.
       * @returns {boolean} Returns `true` if `path` exists, else `false`.
       * @example
       *
       * var object = _.create({ 'a': _.create({ 'b': 2 }) });
       *
       * _.hasIn(object, 'a');
       * // => true
       *
       * _.hasIn(object, 'a.b');
       * // => true
       *
       * _.hasIn(object, ['a', 'b']);
       * // => true
       *
       * _.hasIn(object, 'b');
       * // => false
       */
      function hasIn(object, path) {
        return object != null && hasPath(object, path, baseHasIn);
      }

      /**
       * Creates an object composed of the inverted keys and values of `object`.
       * If `object` contains duplicate values, subsequent values overwrite
       * property assignments of previous values.
       *
       * @static
       * @memberOf _
       * @since 0.7.0
       * @category Object
       * @param {Object} object The object to invert.
       * @returns {Object} Returns the new inverted object.
       * @example
       *
       * var object = { 'a': 1, 'b': 2, 'c': 1 };
       *
       * _.invert(object);
       * // => { '1': 'c', '2': 'b' }
       */
      var invert = createInverter(function(result, value, key) {
        if (value != null &&
            typeof value.toString != 'function') {
          value = nativeObjectToString.call(value);
        }

        result[value] = key;
      }, constant(identity));

      /**
       * This method is like `_.invert` except that the inverted object is generated
       * from the results of running each element of `object` thru `iteratee`. The
       * corresponding inverted value of each inverted key is an array of keys
       * responsible for generating the inverted value. The iteratee is invoked
       * with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.1.0
       * @category Object
       * @param {Object} object The object to invert.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Object} Returns the new inverted object.
       * @example
       *
       * var object = { 'a': 1, 'b': 2, 'c': 1 };
       *
       * _.invertBy(object);
       * // => { '1': ['a', 'c'], '2': ['b'] }
       *
       * _.invertBy(object, function(value) {
       *   return 'group' + value;
       * });
       * // => { 'group1': ['a', 'c'], 'group2': ['b'] }
       */
      var invertBy = createInverter(function(result, value, key) {
        if (value != null &&
            typeof value.toString != 'function') {
          value = nativeObjectToString.call(value);
        }

        if (hasOwnProperty.call(result, value)) {
          result[value].push(key);
        } else {
          result[value] = [key];
        }
      }, getIteratee);

      /**
       * Invokes the method at `path` of `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the method to invoke.
       * @param {...*} [args] The arguments to invoke the method with.
       * @returns {*} Returns the result of the invoked method.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
       *
       * _.invoke(object, 'a[0].b.c.slice', 1, 3);
       * // => [2, 3]
       */
      var invoke = baseRest(baseInvoke);

      /**
       * Creates an array of the own enumerable property names of `object`.
       *
       * **Note:** Non-object values are coerced to objects. See the
       * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
       * for more details.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.keys(new Foo);
       * // => ['a', 'b'] (iteration order is not guaranteed)
       *
       * _.keys('hi');
       * // => ['0', '1']
       */
      function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
      }

      /**
       * Creates an array of the own and inherited enumerable property names of `object`.
       *
       * **Note:** Non-object values are coerced to objects.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.keysIn(new Foo);
       * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
       */
      function keysIn(object) {
        return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
      }

      /**
       * The opposite of `_.mapValues`; this method creates an object with the
       * same values as `object` and keys generated by running each own enumerable
       * string keyed property of `object` thru `iteratee`. The iteratee is invoked
       * with three arguments: (value, key, object).
       *
       * @static
       * @memberOf _
       * @since 3.8.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns the new mapped object.
       * @see _.mapValues
       * @example
       *
       * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
       *   return key + value;
       * });
       * // => { 'a1': 1, 'b2': 2 }
       */
      function mapKeys(object, iteratee) {
        var result = {};
        iteratee = getIteratee(iteratee, 3);

        baseForOwn(object, function(value, key, object) {
          baseAssignValue(result, iteratee(value, key, object), value);
        });
        return result;
      }

      /**
       * Creates an object with the same keys as `object` and values generated
       * by running each own enumerable string keyed property of `object` thru
       * `iteratee`. The iteratee is invoked with three arguments:
       * (value, key, object).
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Object} Returns the new mapped object.
       * @see _.mapKeys
       * @example
       *
       * var users = {
       *   'fred':    { 'user': 'fred',    'age': 40 },
       *   'pebbles': { 'user': 'pebbles', 'age': 1 }
       * };
       *
       * _.mapValues(users, function(o) { return o.age; });
       * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
       *
       * // The `_.property` iteratee shorthand.
       * _.mapValues(users, 'age');
       * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
       */
      function mapValues(object, iteratee) {
        var result = {};
        iteratee = getIteratee(iteratee, 3);

        baseForOwn(object, function(value, key, object) {
          baseAssignValue(result, key, iteratee(value, key, object));
        });
        return result;
      }

      /**
       * This method is like `_.assign` except that it recursively merges own and
       * inherited enumerable string keyed properties of source objects into the
       * destination object. Source properties that resolve to `undefined` are
       * skipped if a destination value exists. Array and plain object properties
       * are merged recursively. Other objects and value types are overridden by
       * assignment. Source objects are applied from left to right. Subsequent
       * sources overwrite property assignments of previous sources.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 0.5.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @example
       *
       * var object = {
       *   'a': [{ 'b': 2 }, { 'd': 4 }]
       * };
       *
       * var other = {
       *   'a': [{ 'c': 3 }, { 'e': 5 }]
       * };
       *
       * _.merge(object, other);
       * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
       */
      var merge = createAssigner(function(object, source, srcIndex) {
        baseMerge(object, source, srcIndex);
      });

      /**
       * This method is like `_.merge` except that it accepts `customizer` which
       * is invoked to produce the merged values of the destination and source
       * properties. If `customizer` returns `undefined`, merging is handled by the
       * method instead. The `customizer` is invoked with six arguments:
       * (objValue, srcValue, key, object, source, stack).
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} sources The source objects.
       * @param {Function} customizer The function to customize assigned values.
       * @returns {Object} Returns `object`.
       * @example
       *
       * function customizer(objValue, srcValue) {
       *   if (_.isArray(objValue)) {
       *     return objValue.concat(srcValue);
       *   }
       * }
       *
       * var object = { 'a': [1], 'b': [2] };
       * var other = { 'a': [3], 'b': [4] };
       *
       * _.mergeWith(object, other, customizer);
       * // => { 'a': [1, 3], 'b': [2, 4] }
       */
      var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
        baseMerge(object, source, srcIndex, customizer);
      });

      /**
       * The opposite of `_.pick`; this method creates an object composed of the
       * own and inherited enumerable property paths of `object` that are not omitted.
       *
       * **Note:** This method is considerably slower than `_.pick`.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The source object.
       * @param {...(string|string[])} [paths] The property paths to omit.
       * @returns {Object} Returns the new object.
       * @example
       *
       * var object = { 'a': 1, 'b': '2', 'c': 3 };
       *
       * _.omit(object, ['a', 'c']);
       * // => { 'b': '2' }
       */
      var omit = flatRest(function(object, paths) {
        var result = {};
        if (object == null) {
          return result;
        }
        var isDeep = false;
        paths = arrayMap(paths, function(path) {
          path = castPath(path, object);
          isDeep || (isDeep = path.length > 1);
          return path;
        });
        copyObject(object, getAllKeysIn(object), result);
        if (isDeep) {
          result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
        }
        var length = paths.length;
        while (length--) {
          baseUnset(result, paths[length]);
        }
        return result;
      });

      /**
       * The opposite of `_.pickBy`; this method creates an object composed of
       * the own and inherited enumerable string keyed properties of `object` that
       * `predicate` doesn't return truthy for. The predicate is invoked with two
       * arguments: (value, key).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The source object.
       * @param {Function} [predicate=_.identity] The function invoked per property.
       * @returns {Object} Returns the new object.
       * @example
       *
       * var object = { 'a': 1, 'b': '2', 'c': 3 };
       *
       * _.omitBy(object, _.isNumber);
       * // => { 'b': '2' }
       */
      function omitBy(object, predicate) {
        return pickBy(object, negate(getIteratee(predicate)));
      }

      /**
       * Creates an object composed of the picked `object` properties.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The source object.
       * @param {...(string|string[])} [paths] The property paths to pick.
       * @returns {Object} Returns the new object.
       * @example
       *
       * var object = { 'a': 1, 'b': '2', 'c': 3 };
       *
       * _.pick(object, ['a', 'c']);
       * // => { 'a': 1, 'c': 3 }
       */
      var pick = flatRest(function(object, paths) {
        return object == null ? {} : basePick(object, paths);
      });

      /**
       * Creates an object composed of the `object` properties `predicate` returns
       * truthy for. The predicate is invoked with two arguments: (value, key).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The source object.
       * @param {Function} [predicate=_.identity] The function invoked per property.
       * @returns {Object} Returns the new object.
       * @example
       *
       * var object = { 'a': 1, 'b': '2', 'c': 3 };
       *
       * _.pickBy(object, _.isNumber);
       * // => { 'a': 1, 'c': 3 }
       */
      function pickBy(object, predicate) {
        if (object == null) {
          return {};
        }
        var props = arrayMap(getAllKeysIn(object), function(prop) {
          return [prop];
        });
        predicate = getIteratee(predicate);
        return basePickBy(object, props, function(value, path) {
          return predicate(value, path[0]);
        });
      }

      /**
       * This method is like `_.get` except that if the resolved value is a
       * function it's invoked with the `this` binding of its parent object and
       * its result is returned.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the property to resolve.
       * @param {*} [defaultValue] The value returned for `undefined` resolved values.
       * @returns {*} Returns the resolved value.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
       *
       * _.result(object, 'a[0].b.c1');
       * // => 3
       *
       * _.result(object, 'a[0].b.c2');
       * // => 4
       *
       * _.result(object, 'a[0].b.c3', 'default');
       * // => 'default'
       *
       * _.result(object, 'a[0].b.c3', _.constant('default'));
       * // => 'default'
       */
      function result(object, path, defaultValue) {
        path = castPath(path, object);

        var index = -1,
            length = path.length;

        // Ensure the loop is entered when path is empty.
        if (!length) {
          length = 1;
          object = undefined$1;
        }
        while (++index < length) {
          var value = object == null ? undefined$1 : object[toKey(path[index])];
          if (value === undefined$1) {
            index = length;
            value = defaultValue;
          }
          object = isFunction(value) ? value.call(object) : value;
        }
        return object;
      }

      /**
       * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
       * it's created. Arrays are created for missing index properties while objects
       * are created for all other missing properties. Use `_.setWith` to customize
       * `path` creation.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 3.7.0
       * @category Object
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to set.
       * @param {*} value The value to set.
       * @returns {Object} Returns `object`.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 3 } }] };
       *
       * _.set(object, 'a[0].b.c', 4);
       * console.log(object.a[0].b.c);
       * // => 4
       *
       * _.set(object, ['x', '0', 'y', 'z'], 5);
       * console.log(object.x[0].y.z);
       * // => 5
       */
      function set(object, path, value) {
        return object == null ? object : baseSet(object, path, value);
      }

      /**
       * This method is like `_.set` except that it accepts `customizer` which is
       * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
       * path creation is handled by the method instead. The `customizer` is invoked
       * with three arguments: (nsValue, key, nsObject).
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to set.
       * @param {*} value The value to set.
       * @param {Function} [customizer] The function to customize assigned values.
       * @returns {Object} Returns `object`.
       * @example
       *
       * var object = {};
       *
       * _.setWith(object, '[0][1]', 'a', Object);
       * // => { '0': { '1': 'a' } }
       */
      function setWith(object, path, value, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined$1;
        return object == null ? object : baseSet(object, path, value, customizer);
      }

      /**
       * Creates an array of own enumerable string keyed-value pairs for `object`
       * which can be consumed by `_.fromPairs`. If `object` is a map or set, its
       * entries are returned.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @alias entries
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the key-value pairs.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.toPairs(new Foo);
       * // => [['a', 1], ['b', 2]] (iteration order is not guaranteed)
       */
      var toPairs = createToPairs(keys);

      /**
       * Creates an array of own and inherited enumerable string keyed-value pairs
       * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
       * or set, its entries are returned.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @alias entriesIn
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the key-value pairs.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.toPairsIn(new Foo);
       * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
       */
      var toPairsIn = createToPairs(keysIn);

      /**
       * An alternative to `_.reduce`; this method transforms `object` to a new
       * `accumulator` object which is the result of running each of its own
       * enumerable string keyed properties thru `iteratee`, with each invocation
       * potentially mutating the `accumulator` object. If `accumulator` is not
       * provided, a new object with the same `[[Prototype]]` will be used. The
       * iteratee is invoked with four arguments: (accumulator, value, key, object).
       * Iteratee functions may exit iteration early by explicitly returning `false`.
       *
       * @static
       * @memberOf _
       * @since 1.3.0
       * @category Object
       * @param {Object} object The object to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @param {*} [accumulator] The custom accumulator value.
       * @returns {*} Returns the accumulated value.
       * @example
       *
       * _.transform([2, 3, 4], function(result, n) {
       *   result.push(n *= n);
       *   return n % 2 == 0;
       * }, []);
       * // => [4, 9]
       *
       * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
       *   (result[value] || (result[value] = [])).push(key);
       * }, {});
       * // => { '1': ['a', 'c'], '2': ['b'] }
       */
      function transform(object, iteratee, accumulator) {
        var isArr = isArray(object),
            isArrLike = isArr || isBuffer(object) || isTypedArray(object);

        iteratee = getIteratee(iteratee, 4);
        if (accumulator == null) {
          var Ctor = object && object.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor : [];
          }
          else if (isObject(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          }
          else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
          return iteratee(accumulator, value, index, object);
        });
        return accumulator;
      }

      /**
       * Removes the property at `path` of `object`.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Object
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to unset.
       * @returns {boolean} Returns `true` if the property is deleted, else `false`.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 7 } }] };
       * _.unset(object, 'a[0].b.c');
       * // => true
       *
       * console.log(object);
       * // => { 'a': [{ 'b': {} }] };
       *
       * _.unset(object, ['a', '0', 'b', 'c']);
       * // => true
       *
       * console.log(object);
       * // => { 'a': [{ 'b': {} }] };
       */
      function unset(object, path) {
        return object == null ? true : baseUnset(object, path);
      }

      /**
       * This method is like `_.set` except that accepts `updater` to produce the
       * value to set. Use `_.updateWith` to customize `path` creation. The `updater`
       * is invoked with one argument: (value).
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.6.0
       * @category Object
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to set.
       * @param {Function} updater The function to produce the updated value.
       * @returns {Object} Returns `object`.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 3 } }] };
       *
       * _.update(object, 'a[0].b.c', function(n) { return n * n; });
       * console.log(object.a[0].b.c);
       * // => 9
       *
       * _.update(object, 'x[0].y.z', function(n) { return n ? n + 1 : 0; });
       * console.log(object.x[0].y.z);
       * // => 0
       */
      function update(object, path, updater) {
        return object == null ? object : baseUpdate(object, path, castFunction(updater));
      }

      /**
       * This method is like `_.update` except that it accepts `customizer` which is
       * invoked to produce the objects of `path`.  If `customizer` returns `undefined`
       * path creation is handled by the method instead. The `customizer` is invoked
       * with three arguments: (nsValue, key, nsObject).
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 4.6.0
       * @category Object
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to set.
       * @param {Function} updater The function to produce the updated value.
       * @param {Function} [customizer] The function to customize assigned values.
       * @returns {Object} Returns `object`.
       * @example
       *
       * var object = {};
       *
       * _.updateWith(object, '[0][1]', _.constant('a'), Object);
       * // => { '0': { '1': 'a' } }
       */
      function updateWith(object, path, updater, customizer) {
        customizer = typeof customizer == 'function' ? customizer : undefined$1;
        return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
      }

      /**
       * Creates an array of the own enumerable string keyed property values of `object`.
       *
       * **Note:** Non-object values are coerced to objects.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property values.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.values(new Foo);
       * // => [1, 2] (iteration order is not guaranteed)
       *
       * _.values('hi');
       * // => ['h', 'i']
       */
      function values(object) {
        return object == null ? [] : baseValues(object, keys(object));
      }

      /**
       * Creates an array of the own and inherited enumerable string keyed property
       * values of `object`.
       *
       * **Note:** Non-object values are coerced to objects.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Object
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property values.
       * @example
       *
       * function Foo() {
       *   this.a = 1;
       *   this.b = 2;
       * }
       *
       * Foo.prototype.c = 3;
       *
       * _.valuesIn(new Foo);
       * // => [1, 2, 3] (iteration order is not guaranteed)
       */
      function valuesIn(object) {
        return object == null ? [] : baseValues(object, keysIn(object));
      }

      /*------------------------------------------------------------------------*/

      /**
       * Clamps `number` within the inclusive `lower` and `upper` bounds.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Number
       * @param {number} number The number to clamp.
       * @param {number} [lower] The lower bound.
       * @param {number} upper The upper bound.
       * @returns {number} Returns the clamped number.
       * @example
       *
       * _.clamp(-10, -5, 5);
       * // => -5
       *
       * _.clamp(10, -5, 5);
       * // => 5
       */
      function clamp(number, lower, upper) {
        if (upper === undefined$1) {
          upper = lower;
          lower = undefined$1;
        }
        if (upper !== undefined$1) {
          upper = toNumber(upper);
          upper = upper === upper ? upper : 0;
        }
        if (lower !== undefined$1) {
          lower = toNumber(lower);
          lower = lower === lower ? lower : 0;
        }
        return baseClamp(toNumber(number), lower, upper);
      }

      /**
       * Checks if `n` is between `start` and up to, but not including, `end`. If
       * `end` is not specified, it's set to `start` with `start` then set to `0`.
       * If `start` is greater than `end` the params are swapped to support
       * negative ranges.
       *
       * @static
       * @memberOf _
       * @since 3.3.0
       * @category Number
       * @param {number} number The number to check.
       * @param {number} [start=0] The start of the range.
       * @param {number} end The end of the range.
       * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
       * @see _.range, _.rangeRight
       * @example
       *
       * _.inRange(3, 2, 4);
       * // => true
       *
       * _.inRange(4, 8);
       * // => true
       *
       * _.inRange(4, 2);
       * // => false
       *
       * _.inRange(2, 2);
       * // => false
       *
       * _.inRange(1.2, 2);
       * // => true
       *
       * _.inRange(5.2, 4);
       * // => false
       *
       * _.inRange(-3, -2, -6);
       * // => true
       */
      function inRange(number, start, end) {
        start = toFinite(start);
        if (end === undefined$1) {
          end = start;
          start = 0;
        } else {
          end = toFinite(end);
        }
        number = toNumber(number);
        return baseInRange(number, start, end);
      }

      /**
       * Produces a random number between the inclusive `lower` and `upper` bounds.
       * If only one argument is provided a number between `0` and the given number
       * is returned. If `floating` is `true`, or either `lower` or `upper` are
       * floats, a floating-point number is returned instead of an integer.
       *
       * **Note:** JavaScript follows the IEEE-754 standard for resolving
       * floating-point values which can produce unexpected results.
       *
       * @static
       * @memberOf _
       * @since 0.7.0
       * @category Number
       * @param {number} [lower=0] The lower bound.
       * @param {number} [upper=1] The upper bound.
       * @param {boolean} [floating] Specify returning a floating-point number.
       * @returns {number} Returns the random number.
       * @example
       *
       * _.random(0, 5);
       * // => an integer between 0 and 5
       *
       * _.random(5);
       * // => also an integer between 0 and 5
       *
       * _.random(5, true);
       * // => a floating-point number between 0 and 5
       *
       * _.random(1.2, 5.2);
       * // => a floating-point number between 1.2 and 5.2
       */
      function random(lower, upper, floating) {
        if (floating && typeof floating != 'boolean' && isIterateeCall(lower, upper, floating)) {
          upper = floating = undefined$1;
        }
        if (floating === undefined$1) {
          if (typeof upper == 'boolean') {
            floating = upper;
            upper = undefined$1;
          }
          else if (typeof lower == 'boolean') {
            floating = lower;
            lower = undefined$1;
          }
        }
        if (lower === undefined$1 && upper === undefined$1) {
          lower = 0;
          upper = 1;
        }
        else {
          lower = toFinite(lower);
          if (upper === undefined$1) {
            upper = lower;
            lower = 0;
          } else {
            upper = toFinite(upper);
          }
        }
        if (lower > upper) {
          var temp = lower;
          lower = upper;
          upper = temp;
        }
        if (floating || lower % 1 || upper % 1) {
          var rand = nativeRandom();
          return nativeMin(lower + (rand * (upper - lower + freeParseFloat('1e-' + ((rand + '').length - 1)))), upper);
        }
        return baseRandom(lower, upper);
      }

      /*------------------------------------------------------------------------*/

      /**
       * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the camel cased string.
       * @example
       *
       * _.camelCase('Foo Bar');
       * // => 'fooBar'
       *
       * _.camelCase('--foo-bar--');
       * // => 'fooBar'
       *
       * _.camelCase('__FOO_BAR__');
       * // => 'fooBar'
       */
      var camelCase = createCompounder(function(result, word, index) {
        word = word.toLowerCase();
        return result + (index ? capitalize(word) : word);
      });

      /**
       * Converts the first character of `string` to upper case and the remaining
       * to lower case.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to capitalize.
       * @returns {string} Returns the capitalized string.
       * @example
       *
       * _.capitalize('FRED');
       * // => 'Fred'
       */
      function capitalize(string) {
        return upperFirst(toString(string).toLowerCase());
      }

      /**
       * Deburrs `string` by converting
       * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
       * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
       * letters to basic Latin letters and removing
       * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to deburr.
       * @returns {string} Returns the deburred string.
       * @example
       *
       * _.deburr('déjà vu');
       * // => 'deja vu'
       */
      function deburr(string) {
        string = toString(string);
        return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
      }

      /**
       * Checks if `string` ends with the given target string.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to inspect.
       * @param {string} [target] The string to search for.
       * @param {number} [position=string.length] The position to search up to.
       * @returns {boolean} Returns `true` if `string` ends with `target`,
       *  else `false`.
       * @example
       *
       * _.endsWith('abc', 'c');
       * // => true
       *
       * _.endsWith('abc', 'b');
       * // => false
       *
       * _.endsWith('abc', 'b', 2);
       * // => true
       */
      function endsWith(string, target, position) {
        string = toString(string);
        target = baseToString(target);

        var length = string.length;
        position = position === undefined$1
          ? length
          : baseClamp(toInteger(position), 0, length);

        var end = position;
        position -= target.length;
        return position >= 0 && string.slice(position, end) == target;
      }

      /**
       * Converts the characters "&", "<", ">", '"', and "'" in `string` to their
       * corresponding HTML entities.
       *
       * **Note:** No other characters are escaped. To escape additional
       * characters use a third-party library like [_he_](https://mths.be/he).
       *
       * Though the ">" character is escaped for symmetry, characters like
       * ">" and "/" don't need escaping in HTML and have no special meaning
       * unless they're part of a tag or unquoted attribute value. See
       * [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
       * (under "semi-related fun fact") for more details.
       *
       * When working with HTML you should always
       * [quote attribute values](http://wonko.com/post/html-escaping) to reduce
       * XSS vectors.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category String
       * @param {string} [string=''] The string to escape.
       * @returns {string} Returns the escaped string.
       * @example
       *
       * _.escape('fred, barney, & pebbles');
       * // => 'fred, barney, &amp; pebbles'
       */
      function escape(string) {
        string = toString(string);
        return (string && reHasUnescapedHtml.test(string))
          ? string.replace(reUnescapedHtml, escapeHtmlChar)
          : string;
      }

      /**
       * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
       * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to escape.
       * @returns {string} Returns the escaped string.
       * @example
       *
       * _.escapeRegExp('[lodash](https://lodash.com/)');
       * // => '\[lodash\]\(https://lodash\.com/\)'
       */
      function escapeRegExp(string) {
        string = toString(string);
        return (string && reHasRegExpChar.test(string))
          ? string.replace(reRegExpChar, '\\$&')
          : string;
      }

      /**
       * Converts `string` to
       * [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the kebab cased string.
       * @example
       *
       * _.kebabCase('Foo Bar');
       * // => 'foo-bar'
       *
       * _.kebabCase('fooBar');
       * // => 'foo-bar'
       *
       * _.kebabCase('__FOO_BAR__');
       * // => 'foo-bar'
       */
      var kebabCase = createCompounder(function(result, word, index) {
        return result + (index ? '-' : '') + word.toLowerCase();
      });

      /**
       * Converts `string`, as space separated words, to lower case.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the lower cased string.
       * @example
       *
       * _.lowerCase('--Foo-Bar--');
       * // => 'foo bar'
       *
       * _.lowerCase('fooBar');
       * // => 'foo bar'
       *
       * _.lowerCase('__FOO_BAR__');
       * // => 'foo bar'
       */
      var lowerCase = createCompounder(function(result, word, index) {
        return result + (index ? ' ' : '') + word.toLowerCase();
      });

      /**
       * Converts the first character of `string` to lower case.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the converted string.
       * @example
       *
       * _.lowerFirst('Fred');
       * // => 'fred'
       *
       * _.lowerFirst('FRED');
       * // => 'fRED'
       */
      var lowerFirst = createCaseFirst('toLowerCase');

      /**
       * Pads `string` on the left and right sides if it's shorter than `length`.
       * Padding characters are truncated if they can't be evenly divided by `length`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to pad.
       * @param {number} [length=0] The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padded string.
       * @example
       *
       * _.pad('abc', 8);
       * // => '  abc   '
       *
       * _.pad('abc', 8, '_-');
       * // => '_-abc_-_'
       *
       * _.pad('abc', 3);
       * // => 'abc'
       */
      function pad(string, length, chars) {
        string = toString(string);
        length = toInteger(length);

        var strLength = length ? stringSize(string) : 0;
        if (!length || strLength >= length) {
          return string;
        }
        var mid = (length - strLength) / 2;
        return (
          createPadding(nativeFloor(mid), chars) +
          string +
          createPadding(nativeCeil(mid), chars)
        );
      }

      /**
       * Pads `string` on the right side if it's shorter than `length`. Padding
       * characters are truncated if they exceed `length`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to pad.
       * @param {number} [length=0] The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padded string.
       * @example
       *
       * _.padEnd('abc', 6);
       * // => 'abc   '
       *
       * _.padEnd('abc', 6, '_-');
       * // => 'abc_-_'
       *
       * _.padEnd('abc', 3);
       * // => 'abc'
       */
      function padEnd(string, length, chars) {
        string = toString(string);
        length = toInteger(length);

        var strLength = length ? stringSize(string) : 0;
        return (length && strLength < length)
          ? (string + createPadding(length - strLength, chars))
          : string;
      }

      /**
       * Pads `string` on the left side if it's shorter than `length`. Padding
       * characters are truncated if they exceed `length`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to pad.
       * @param {number} [length=0] The padding length.
       * @param {string} [chars=' '] The string used as padding.
       * @returns {string} Returns the padded string.
       * @example
       *
       * _.padStart('abc', 6);
       * // => '   abc'
       *
       * _.padStart('abc', 6, '_-');
       * // => '_-_abc'
       *
       * _.padStart('abc', 3);
       * // => 'abc'
       */
      function padStart(string, length, chars) {
        string = toString(string);
        length = toInteger(length);

        var strLength = length ? stringSize(string) : 0;
        return (length && strLength < length)
          ? (createPadding(length - strLength, chars) + string)
          : string;
      }

      /**
       * Converts `string` to an integer of the specified radix. If `radix` is
       * `undefined` or `0`, a `radix` of `10` is used unless `value` is a
       * hexadecimal, in which case a `radix` of `16` is used.
       *
       * **Note:** This method aligns with the
       * [ES5 implementation](https://es5.github.io/#x15.1.2.2) of `parseInt`.
       *
       * @static
       * @memberOf _
       * @since 1.1.0
       * @category String
       * @param {string} string The string to convert.
       * @param {number} [radix=10] The radix to interpret `value` by.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {number} Returns the converted integer.
       * @example
       *
       * _.parseInt('08');
       * // => 8
       *
       * _.map(['6', '08', '10'], _.parseInt);
       * // => [6, 8, 10]
       */
      function parseInt(string, radix, guard) {
        if (guard || radix == null) {
          radix = 0;
        } else if (radix) {
          radix = +radix;
        }
        return nativeParseInt(toString(string).replace(reTrimStart, ''), radix || 0);
      }

      /**
       * Repeats the given string `n` times.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to repeat.
       * @param {number} [n=1] The number of times to repeat the string.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the repeated string.
       * @example
       *
       * _.repeat('*', 3);
       * // => '***'
       *
       * _.repeat('abc', 2);
       * // => 'abcabc'
       *
       * _.repeat('abc', 0);
       * // => ''
       */
      function repeat(string, n, guard) {
        if ((guard ? isIterateeCall(string, n, guard) : n === undefined$1)) {
          n = 1;
        } else {
          n = toInteger(n);
        }
        return baseRepeat(toString(string), n);
      }

      /**
       * Replaces matches for `pattern` in `string` with `replacement`.
       *
       * **Note:** This method is based on
       * [`String#replace`](https://mdn.io/String/replace).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to modify.
       * @param {RegExp|string} pattern The pattern to replace.
       * @param {Function|string} replacement The match replacement.
       * @returns {string} Returns the modified string.
       * @example
       *
       * _.replace('Hi Fred', 'Fred', 'Barney');
       * // => 'Hi Barney'
       */
      function replace() {
        var args = arguments,
            string = toString(args[0]);

        return args.length < 3 ? string : string.replace(args[1], args[2]);
      }

      /**
       * Converts `string` to
       * [snake case](https://en.wikipedia.org/wiki/Snake_case).
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the snake cased string.
       * @example
       *
       * _.snakeCase('Foo Bar');
       * // => 'foo_bar'
       *
       * _.snakeCase('fooBar');
       * // => 'foo_bar'
       *
       * _.snakeCase('--FOO-BAR--');
       * // => 'foo_bar'
       */
      var snakeCase = createCompounder(function(result, word, index) {
        return result + (index ? '_' : '') + word.toLowerCase();
      });

      /**
       * Splits `string` by `separator`.
       *
       * **Note:** This method is based on
       * [`String#split`](https://mdn.io/String/split).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to split.
       * @param {RegExp|string} separator The separator pattern to split by.
       * @param {number} [limit] The length to truncate results to.
       * @returns {Array} Returns the string segments.
       * @example
       *
       * _.split('a-b-c', '-', 2);
       * // => ['a', 'b']
       */
      function split(string, separator, limit) {
        if (limit && typeof limit != 'number' && isIterateeCall(string, separator, limit)) {
          separator = limit = undefined$1;
        }
        limit = limit === undefined$1 ? MAX_ARRAY_LENGTH : limit >>> 0;
        if (!limit) {
          return [];
        }
        string = toString(string);
        if (string && (
              typeof separator == 'string' ||
              (separator != null && !isRegExp(separator))
            )) {
          separator = baseToString(separator);
          if (!separator && hasUnicode(string)) {
            return castSlice(stringToArray(string), 0, limit);
          }
        }
        return string.split(separator, limit);
      }

      /**
       * Converts `string` to
       * [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
       *
       * @static
       * @memberOf _
       * @since 3.1.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the start cased string.
       * @example
       *
       * _.startCase('--foo-bar--');
       * // => 'Foo Bar'
       *
       * _.startCase('fooBar');
       * // => 'Foo Bar'
       *
       * _.startCase('__FOO_BAR__');
       * // => 'FOO BAR'
       */
      var startCase = createCompounder(function(result, word, index) {
        return result + (index ? ' ' : '') + upperFirst(word);
      });

      /**
       * Checks if `string` starts with the given target string.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to inspect.
       * @param {string} [target] The string to search for.
       * @param {number} [position=0] The position to search from.
       * @returns {boolean} Returns `true` if `string` starts with `target`,
       *  else `false`.
       * @example
       *
       * _.startsWith('abc', 'a');
       * // => true
       *
       * _.startsWith('abc', 'b');
       * // => false
       *
       * _.startsWith('abc', 'b', 1);
       * // => true
       */
      function startsWith(string, target, position) {
        string = toString(string);
        position = position == null
          ? 0
          : baseClamp(toInteger(position), 0, string.length);

        target = baseToString(target);
        return string.slice(position, position + target.length) == target;
      }

      /**
       * Creates a compiled template function that can interpolate data properties
       * in "interpolate" delimiters, HTML-escape interpolated data properties in
       * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
       * properties may be accessed as free variables in the template. If a setting
       * object is given, it takes precedence over `_.templateSettings` values.
       *
       * **Note:** In the development build `_.template` utilizes
       * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
       * for easier debugging.
       *
       * For more information on precompiling templates see
       * [lodash's custom builds documentation](https://lodash.com/custom-builds).
       *
       * For more information on Chrome extension sandboxes see
       * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category String
       * @param {string} [string=''] The template string.
       * @param {Object} [options={}] The options object.
       * @param {RegExp} [options.escape=_.templateSettings.escape]
       *  The HTML "escape" delimiter.
       * @param {RegExp} [options.evaluate=_.templateSettings.evaluate]
       *  The "evaluate" delimiter.
       * @param {Object} [options.imports=_.templateSettings.imports]
       *  An object to import into the template as free variables.
       * @param {RegExp} [options.interpolate=_.templateSettings.interpolate]
       *  The "interpolate" delimiter.
       * @param {string} [options.sourceURL='lodash.templateSources[n]']
       *  The sourceURL of the compiled template.
       * @param {string} [options.variable='obj']
       *  The data object variable name.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Function} Returns the compiled template function.
       * @example
       *
       * // Use the "interpolate" delimiter to create a compiled template.
       * var compiled = _.template('hello <%= user %>!');
       * compiled({ 'user': 'fred' });
       * // => 'hello fred!'
       *
       * // Use the HTML "escape" delimiter to escape data property values.
       * var compiled = _.template('<b><%- value %></b>');
       * compiled({ 'value': '<script>' });
       * // => '<b>&lt;script&gt;</b>'
       *
       * // Use the "evaluate" delimiter to execute JavaScript and generate HTML.
       * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
       * compiled({ 'users': ['fred', 'barney'] });
       * // => '<li>fred</li><li>barney</li>'
       *
       * // Use the internal `print` function in "evaluate" delimiters.
       * var compiled = _.template('<% print("hello " + user); %>!');
       * compiled({ 'user': 'barney' });
       * // => 'hello barney!'
       *
       * // Use the ES template literal delimiter as an "interpolate" delimiter.
       * // Disable support by replacing the "interpolate" delimiter.
       * var compiled = _.template('hello ${ user }!');
       * compiled({ 'user': 'pebbles' });
       * // => 'hello pebbles!'
       *
       * // Use backslashes to treat delimiters as plain text.
       * var compiled = _.template('<%= "\\<%- value %\\>" %>');
       * compiled({ 'value': 'ignored' });
       * // => '<%- value %>'
       *
       * // Use the `imports` option to import `jQuery` as `jq`.
       * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
       * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
       * compiled({ 'users': ['fred', 'barney'] });
       * // => '<li>fred</li><li>barney</li>'
       *
       * // Use the `sourceURL` option to specify a custom sourceURL for the template.
       * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
       * compiled(data);
       * // => Find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector.
       *
       * // Use the `variable` option to ensure a with-statement isn't used in the compiled template.
       * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
       * compiled.source;
       * // => function(data) {
       * //   var __t, __p = '';
       * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
       * //   return __p;
       * // }
       *
       * // Use custom template delimiters.
       * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
       * var compiled = _.template('hello {{ user }}!');
       * compiled({ 'user': 'mustache' });
       * // => 'hello mustache!'
       *
       * // Use the `source` property to inline compiled templates for meaningful
       * // line numbers in error messages and stack traces.
       * fs.writeFileSync(path.join(process.cwd(), 'jst.js'), '\
       *   var JST = {\
       *     "main": ' + _.template(mainText).source + '\
       *   };\
       * ');
       */
      function template(string, options, guard) {
        // Based on John Resig's `tmpl` implementation
        // (http://ejohn.org/blog/javascript-micro-templating/)
        // and Laura Doktorova's doT.js (https://github.com/olado/doT).
        var settings = lodash.templateSettings;

        if (guard && isIterateeCall(string, options, guard)) {
          options = undefined$1;
        }
        string = toString(string);
        options = assignInWith({}, options, settings, customDefaultsAssignIn);

        var imports = assignInWith({}, options.imports, settings.imports, customDefaultsAssignIn),
            importsKeys = keys(imports),
            importsValues = baseValues(imports, importsKeys);

        var isEscaping,
            isEvaluating,
            index = 0,
            interpolate = options.interpolate || reNoMatch,
            source = "__p += '";

        // Compile the regexp to match each delimiter.
        var reDelimiters = RegExp(
          (options.escape || reNoMatch).source + '|' +
          interpolate.source + '|' +
          (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
          (options.evaluate || reNoMatch).source + '|$'
        , 'g');

        // Use a sourceURL for easier debugging.
        // The sourceURL gets injected into the source that's eval-ed, so be careful
        // with lookup (in case of e.g. prototype pollution), and strip newlines if any.
        // A newline wouldn't be a valid sourceURL anyway, and it'd enable code injection.
        var sourceURL = '//# sourceURL=' +
          (hasOwnProperty.call(options, 'sourceURL')
            ? (options.sourceURL + '').replace(/[\r\n]/g, ' ')
            : ('lodash.templateSources[' + (++templateCounter) + ']')
          ) + '\n';

        string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
          interpolateValue || (interpolateValue = esTemplateValue);

          // Escape characters that can't be included in string literals.
          source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

          // Replace delimiters with snippets.
          if (escapeValue) {
            isEscaping = true;
            source += "' +\n__e(" + escapeValue + ") +\n'";
          }
          if (evaluateValue) {
            isEvaluating = true;
            source += "';\n" + evaluateValue + ";\n__p += '";
          }
          if (interpolateValue) {
            source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
          }
          index = offset + match.length;

          // The JS engine embedded in Adobe products needs `match` returned in
          // order to produce the correct `offset` value.
          return match;
        });

        source += "';\n";

        // If `variable` is not specified wrap a with-statement around the generated
        // code to add the data object to the top of the scope chain.
        // Like with sourceURL, we take care to not check the option's prototype,
        // as this configuration is a code injection vector.
        var variable = hasOwnProperty.call(options, 'variable') && options.variable;
        if (!variable) {
          source = 'with (obj) {\n' + source + '\n}\n';
        }
        // Cleanup code by stripping empty strings.
        source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
          .replace(reEmptyStringMiddle, '$1')
          .replace(reEmptyStringTrailing, '$1;');

        // Frame code as the function body.
        source = 'function(' + (variable || 'obj') + ') {\n' +
          (variable
            ? ''
            : 'obj || (obj = {});\n'
          ) +
          "var __t, __p = ''" +
          (isEscaping
             ? ', __e = _.escape'
             : ''
          ) +
          (isEvaluating
            ? ', __j = Array.prototype.join;\n' +
              "function print() { __p += __j.call(arguments, '') }\n"
            : ';\n'
          ) +
          source +
          'return __p\n}';

        var result = attempt(function() {
          return Function(importsKeys, sourceURL + 'return ' + source)
            .apply(undefined$1, importsValues);
        });

        // Provide the compiled function's source by its `toString` method or
        // the `source` property as a convenience for inlining compiled templates.
        result.source = source;
        if (isError(result)) {
          throw result;
        }
        return result;
      }

      /**
       * Converts `string`, as a whole, to lower case just like
       * [String#toLowerCase](https://mdn.io/toLowerCase).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the lower cased string.
       * @example
       *
       * _.toLower('--Foo-Bar--');
       * // => '--foo-bar--'
       *
       * _.toLower('fooBar');
       * // => 'foobar'
       *
       * _.toLower('__FOO_BAR__');
       * // => '__foo_bar__'
       */
      function toLower(value) {
        return toString(value).toLowerCase();
      }

      /**
       * Converts `string`, as a whole, to upper case just like
       * [String#toUpperCase](https://mdn.io/toUpperCase).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the upper cased string.
       * @example
       *
       * _.toUpper('--foo-bar--');
       * // => '--FOO-BAR--'
       *
       * _.toUpper('fooBar');
       * // => 'FOOBAR'
       *
       * _.toUpper('__foo_bar__');
       * // => '__FOO_BAR__'
       */
      function toUpper(value) {
        return toString(value).toUpperCase();
      }

      /**
       * Removes leading and trailing whitespace or specified characters from `string`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to trim.
       * @param {string} [chars=whitespace] The characters to trim.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the trimmed string.
       * @example
       *
       * _.trim('  abc  ');
       * // => 'abc'
       *
       * _.trim('-_-abc-_-', '_-');
       * // => 'abc'
       *
       * _.map(['  foo  ', '  bar  '], _.trim);
       * // => ['foo', 'bar']
       */
      function trim(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrim, '');
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string),
            chrSymbols = stringToArray(chars),
            start = charsStartIndex(strSymbols, chrSymbols),
            end = charsEndIndex(strSymbols, chrSymbols) + 1;

        return castSlice(strSymbols, start, end).join('');
      }

      /**
       * Removes trailing whitespace or specified characters from `string`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to trim.
       * @param {string} [chars=whitespace] The characters to trim.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the trimmed string.
       * @example
       *
       * _.trimEnd('  abc  ');
       * // => '  abc'
       *
       * _.trimEnd('-_-abc-_-', '_-');
       * // => '-_-abc'
       */
      function trimEnd(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimEnd, '');
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string),
            end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;

        return castSlice(strSymbols, 0, end).join('');
      }

      /**
       * Removes leading whitespace or specified characters from `string`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to trim.
       * @param {string} [chars=whitespace] The characters to trim.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {string} Returns the trimmed string.
       * @example
       *
       * _.trimStart('  abc  ');
       * // => 'abc  '
       *
       * _.trimStart('-_-abc-_-', '_-');
       * // => 'abc-_-'
       */
      function trimStart(string, chars, guard) {
        string = toString(string);
        if (string && (guard || chars === undefined$1)) {
          return string.replace(reTrimStart, '');
        }
        if (!string || !(chars = baseToString(chars))) {
          return string;
        }
        var strSymbols = stringToArray(string),
            start = charsStartIndex(strSymbols, stringToArray(chars));

        return castSlice(strSymbols, start).join('');
      }

      /**
       * Truncates `string` if it's longer than the given maximum string length.
       * The last characters of the truncated string are replaced with the omission
       * string which defaults to "...".
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to truncate.
       * @param {Object} [options={}] The options object.
       * @param {number} [options.length=30] The maximum string length.
       * @param {string} [options.omission='...'] The string to indicate text is omitted.
       * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
       * @returns {string} Returns the truncated string.
       * @example
       *
       * _.truncate('hi-diddly-ho there, neighborino');
       * // => 'hi-diddly-ho there, neighbo...'
       *
       * _.truncate('hi-diddly-ho there, neighborino', {
       *   'length': 24,
       *   'separator': ' '
       * });
       * // => 'hi-diddly-ho there,...'
       *
       * _.truncate('hi-diddly-ho there, neighborino', {
       *   'length': 24,
       *   'separator': /,? +/
       * });
       * // => 'hi-diddly-ho there...'
       *
       * _.truncate('hi-diddly-ho there, neighborino', {
       *   'omission': ' [...]'
       * });
       * // => 'hi-diddly-ho there, neig [...]'
       */
      function truncate(string, options) {
        var length = DEFAULT_TRUNC_LENGTH,
            omission = DEFAULT_TRUNC_OMISSION;

        if (isObject(options)) {
          var separator = 'separator' in options ? options.separator : separator;
          length = 'length' in options ? toInteger(options.length) : length;
          omission = 'omission' in options ? baseToString(options.omission) : omission;
        }
        string = toString(string);

        var strLength = string.length;
        if (hasUnicode(string)) {
          var strSymbols = stringToArray(string);
          strLength = strSymbols.length;
        }
        if (length >= strLength) {
          return string;
        }
        var end = length - stringSize(omission);
        if (end < 1) {
          return omission;
        }
        var result = strSymbols
          ? castSlice(strSymbols, 0, end).join('')
          : string.slice(0, end);

        if (separator === undefined$1) {
          return result + omission;
        }
        if (strSymbols) {
          end += (result.length - end);
        }
        if (isRegExp(separator)) {
          if (string.slice(end).search(separator)) {
            var match,
                substring = result;

            if (!separator.global) {
              separator = RegExp(separator.source, toString(reFlags.exec(separator)) + 'g');
            }
            separator.lastIndex = 0;
            while ((match = separator.exec(substring))) {
              var newEnd = match.index;
            }
            result = result.slice(0, newEnd === undefined$1 ? end : newEnd);
          }
        } else if (string.indexOf(baseToString(separator), end) != end) {
          var index = result.lastIndexOf(separator);
          if (index > -1) {
            result = result.slice(0, index);
          }
        }
        return result + omission;
      }

      /**
       * The inverse of `_.escape`; this method converts the HTML entities
       * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to
       * their corresponding characters.
       *
       * **Note:** No other HTML entities are unescaped. To unescape additional
       * HTML entities use a third-party library like [_he_](https://mths.be/he).
       *
       * @static
       * @memberOf _
       * @since 0.6.0
       * @category String
       * @param {string} [string=''] The string to unescape.
       * @returns {string} Returns the unescaped string.
       * @example
       *
       * _.unescape('fred, barney, &amp; pebbles');
       * // => 'fred, barney, & pebbles'
       */
      function unescape(string) {
        string = toString(string);
        return (string && reHasEscapedHtml.test(string))
          ? string.replace(reEscapedHtml, unescapeHtmlChar)
          : string;
      }

      /**
       * Converts `string`, as space separated words, to upper case.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the upper cased string.
       * @example
       *
       * _.upperCase('--foo-bar');
       * // => 'FOO BAR'
       *
       * _.upperCase('fooBar');
       * // => 'FOO BAR'
       *
       * _.upperCase('__foo_bar__');
       * // => 'FOO BAR'
       */
      var upperCase = createCompounder(function(result, word, index) {
        return result + (index ? ' ' : '') + word.toUpperCase();
      });

      /**
       * Converts the first character of `string` to upper case.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category String
       * @param {string} [string=''] The string to convert.
       * @returns {string} Returns the converted string.
       * @example
       *
       * _.upperFirst('fred');
       * // => 'Fred'
       *
       * _.upperFirst('FRED');
       * // => 'FRED'
       */
      var upperFirst = createCaseFirst('toUpperCase');

      /**
       * Splits `string` into an array of its words.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category String
       * @param {string} [string=''] The string to inspect.
       * @param {RegExp|string} [pattern] The pattern to match words.
       * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
       * @returns {Array} Returns the words of `string`.
       * @example
       *
       * _.words('fred, barney, & pebbles');
       * // => ['fred', 'barney', 'pebbles']
       *
       * _.words('fred, barney, & pebbles', /[^, ]+/g);
       * // => ['fred', 'barney', '&', 'pebbles']
       */
      function words(string, pattern, guard) {
        string = toString(string);
        pattern = guard ? undefined$1 : pattern;

        if (pattern === undefined$1) {
          return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
        }
        return string.match(pattern) || [];
      }

      /*------------------------------------------------------------------------*/

      /**
       * Attempts to invoke `func`, returning either the result or the caught error
       * object. Any additional arguments are provided to `func` when it's invoked.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Util
       * @param {Function} func The function to attempt.
       * @param {...*} [args] The arguments to invoke `func` with.
       * @returns {*} Returns the `func` result or error object.
       * @example
       *
       * // Avoid throwing errors for invalid selectors.
       * var elements = _.attempt(function(selector) {
       *   return document.querySelectorAll(selector);
       * }, '>_>');
       *
       * if (_.isError(elements)) {
       *   elements = [];
       * }
       */
      var attempt = baseRest(function(func, args) {
        try {
          return apply(func, undefined$1, args);
        } catch (e) {
          return isError(e) ? e : new Error(e);
        }
      });

      /**
       * Binds methods of an object to the object itself, overwriting the existing
       * method.
       *
       * **Note:** This method doesn't set the "length" property of bound functions.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {Object} object The object to bind and assign the bound methods to.
       * @param {...(string|string[])} methodNames The object method names to bind.
       * @returns {Object} Returns `object`.
       * @example
       *
       * var view = {
       *   'label': 'docs',
       *   'click': function() {
       *     console.log('clicked ' + this.label);
       *   }
       * };
       *
       * _.bindAll(view, ['click']);
       * jQuery(element).on('click', view.click);
       * // => Logs 'clicked docs' when clicked.
       */
      var bindAll = flatRest(function(object, methodNames) {
        arrayEach(methodNames, function(key) {
          key = toKey(key);
          baseAssignValue(object, key, bind(object[key], object));
        });
        return object;
      });

      /**
       * Creates a function that iterates over `pairs` and invokes the corresponding
       * function of the first predicate to return truthy. The predicate-function
       * pairs are invoked with the `this` binding and arguments of the created
       * function.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {Array} pairs The predicate-function pairs.
       * @returns {Function} Returns the new composite function.
       * @example
       *
       * var func = _.cond([
       *   [_.matches({ 'a': 1 }),           _.constant('matches A')],
       *   [_.conforms({ 'b': _.isNumber }), _.constant('matches B')],
       *   [_.stubTrue,                      _.constant('no match')]
       * ]);
       *
       * func({ 'a': 1, 'b': 2 });
       * // => 'matches A'
       *
       * func({ 'a': 0, 'b': 1 });
       * // => 'matches B'
       *
       * func({ 'a': '1', 'b': '2' });
       * // => 'no match'
       */
      function cond(pairs) {
        var length = pairs == null ? 0 : pairs.length,
            toIteratee = getIteratee();

        pairs = !length ? [] : arrayMap(pairs, function(pair) {
          if (typeof pair[1] != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          return [toIteratee(pair[0]), pair[1]];
        });

        return baseRest(function(args) {
          var index = -1;
          while (++index < length) {
            var pair = pairs[index];
            if (apply(pair[0], this, args)) {
              return apply(pair[1], this, args);
            }
          }
        });
      }

      /**
       * Creates a function that invokes the predicate properties of `source` with
       * the corresponding property values of a given object, returning `true` if
       * all predicates return truthy, else `false`.
       *
       * **Note:** The created function is equivalent to `_.conformsTo` with
       * `source` partially applied.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {Object} source The object of property predicates to conform to.
       * @returns {Function} Returns the new spec function.
       * @example
       *
       * var objects = [
       *   { 'a': 2, 'b': 1 },
       *   { 'a': 1, 'b': 2 }
       * ];
       *
       * _.filter(objects, _.conforms({ 'b': function(n) { return n > 1; } }));
       * // => [{ 'a': 1, 'b': 2 }]
       */
      function conforms(source) {
        return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
      }

      /**
       * Creates a function that returns `value`.
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Util
       * @param {*} value The value to return from the new function.
       * @returns {Function} Returns the new constant function.
       * @example
       *
       * var objects = _.times(2, _.constant({ 'a': 1 }));
       *
       * console.log(objects);
       * // => [{ 'a': 1 }, { 'a': 1 }]
       *
       * console.log(objects[0] === objects[1]);
       * // => true
       */
      function constant(value) {
        return function() {
          return value;
        };
      }

      /**
       * Checks `value` to determine whether a default value should be returned in
       * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
       * or `undefined`.
       *
       * @static
       * @memberOf _
       * @since 4.14.0
       * @category Util
       * @param {*} value The value to check.
       * @param {*} defaultValue The default value.
       * @returns {*} Returns the resolved value.
       * @example
       *
       * _.defaultTo(1, 10);
       * // => 1
       *
       * _.defaultTo(undefined, 10);
       * // => 10
       */
      function defaultTo(value, defaultValue) {
        return (value == null || value !== value) ? defaultValue : value;
      }

      /**
       * Creates a function that returns the result of invoking the given functions
       * with the `this` binding of the created function, where each successive
       * invocation is supplied the return value of the previous.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Util
       * @param {...(Function|Function[])} [funcs] The functions to invoke.
       * @returns {Function} Returns the new composite function.
       * @see _.flowRight
       * @example
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * var addSquare = _.flow([_.add, square]);
       * addSquare(1, 2);
       * // => 9
       */
      var flow = createFlow();

      /**
       * This method is like `_.flow` except that it creates a function that
       * invokes the given functions from right to left.
       *
       * @static
       * @since 3.0.0
       * @memberOf _
       * @category Util
       * @param {...(Function|Function[])} [funcs] The functions to invoke.
       * @returns {Function} Returns the new composite function.
       * @see _.flow
       * @example
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * var addSquare = _.flowRight([square, _.add]);
       * addSquare(1, 2);
       * // => 9
       */
      var flowRight = createFlow(true);

      /**
       * This method returns the first argument it receives.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {*} value Any value.
       * @returns {*} Returns `value`.
       * @example
       *
       * var object = { 'a': 1 };
       *
       * console.log(_.identity(object) === object);
       * // => true
       */
      function identity(value) {
        return value;
      }

      /**
       * Creates a function that invokes `func` with the arguments of the created
       * function. If `func` is a property name, the created function returns the
       * property value for a given element. If `func` is an array or object, the
       * created function returns `true` for elements that contain the equivalent
       * source properties, otherwise it returns `false`.
       *
       * @static
       * @since 4.0.0
       * @memberOf _
       * @category Util
       * @param {*} [func=_.identity] The value to convert to a callback.
       * @returns {Function} Returns the callback.
       * @example
       *
       * var users = [
       *   { 'user': 'barney', 'age': 36, 'active': true },
       *   { 'user': 'fred',   'age': 40, 'active': false }
       * ];
       *
       * // The `_.matches` iteratee shorthand.
       * _.filter(users, _.iteratee({ 'user': 'barney', 'active': true }));
       * // => [{ 'user': 'barney', 'age': 36, 'active': true }]
       *
       * // The `_.matchesProperty` iteratee shorthand.
       * _.filter(users, _.iteratee(['user', 'fred']));
       * // => [{ 'user': 'fred', 'age': 40 }]
       *
       * // The `_.property` iteratee shorthand.
       * _.map(users, _.iteratee('user'));
       * // => ['barney', 'fred']
       *
       * // Create custom iteratee shorthands.
       * _.iteratee = _.wrap(_.iteratee, function(iteratee, func) {
       *   return !_.isRegExp(func) ? iteratee(func) : function(string) {
       *     return func.test(string);
       *   };
       * });
       *
       * _.filter(['abc', 'def'], /ef/);
       * // => ['def']
       */
      function iteratee(func) {
        return baseIteratee(typeof func == 'function' ? func : baseClone(func, CLONE_DEEP_FLAG));
      }

      /**
       * Creates a function that performs a partial deep comparison between a given
       * object and `source`, returning `true` if the given object has equivalent
       * property values, else `false`.
       *
       * **Note:** The created function is equivalent to `_.isMatch` with `source`
       * partially applied.
       *
       * Partial comparisons will match empty array and empty object `source`
       * values against any array or object value, respectively. See `_.isEqual`
       * for a list of supported value comparisons.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Util
       * @param {Object} source The object of property values to match.
       * @returns {Function} Returns the new spec function.
       * @example
       *
       * var objects = [
       *   { 'a': 1, 'b': 2, 'c': 3 },
       *   { 'a': 4, 'b': 5, 'c': 6 }
       * ];
       *
       * _.filter(objects, _.matches({ 'a': 4, 'c': 6 }));
       * // => [{ 'a': 4, 'b': 5, 'c': 6 }]
       */
      function matches(source) {
        return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
      }

      /**
       * Creates a function that performs a partial deep comparison between the
       * value at `path` of a given object to `srcValue`, returning `true` if the
       * object value is equivalent, else `false`.
       *
       * **Note:** Partial comparisons will match empty array and empty object
       * `srcValue` values against any array or object value, respectively. See
       * `_.isEqual` for a list of supported value comparisons.
       *
       * @static
       * @memberOf _
       * @since 3.2.0
       * @category Util
       * @param {Array|string} path The path of the property to get.
       * @param {*} srcValue The value to match.
       * @returns {Function} Returns the new spec function.
       * @example
       *
       * var objects = [
       *   { 'a': 1, 'b': 2, 'c': 3 },
       *   { 'a': 4, 'b': 5, 'c': 6 }
       * ];
       *
       * _.find(objects, _.matchesProperty('a', 4));
       * // => { 'a': 4, 'b': 5, 'c': 6 }
       */
      function matchesProperty(path, srcValue) {
        return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
      }

      /**
       * Creates a function that invokes the method at `path` of a given object.
       * Any additional arguments are provided to the invoked method.
       *
       * @static
       * @memberOf _
       * @since 3.7.0
       * @category Util
       * @param {Array|string} path The path of the method to invoke.
       * @param {...*} [args] The arguments to invoke the method with.
       * @returns {Function} Returns the new invoker function.
       * @example
       *
       * var objects = [
       *   { 'a': { 'b': _.constant(2) } },
       *   { 'a': { 'b': _.constant(1) } }
       * ];
       *
       * _.map(objects, _.method('a.b'));
       * // => [2, 1]
       *
       * _.map(objects, _.method(['a', 'b']));
       * // => [2, 1]
       */
      var method = baseRest(function(path, args) {
        return function(object) {
          return baseInvoke(object, path, args);
        };
      });

      /**
       * The opposite of `_.method`; this method creates a function that invokes
       * the method at a given path of `object`. Any additional arguments are
       * provided to the invoked method.
       *
       * @static
       * @memberOf _
       * @since 3.7.0
       * @category Util
       * @param {Object} object The object to query.
       * @param {...*} [args] The arguments to invoke the method with.
       * @returns {Function} Returns the new invoker function.
       * @example
       *
       * var array = _.times(3, _.constant),
       *     object = { 'a': array, 'b': array, 'c': array };
       *
       * _.map(['a[2]', 'c[0]'], _.methodOf(object));
       * // => [2, 0]
       *
       * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
       * // => [2, 0]
       */
      var methodOf = baseRest(function(object, args) {
        return function(path) {
          return baseInvoke(object, path, args);
        };
      });

      /**
       * Adds all own enumerable string keyed function properties of a source
       * object to the destination object. If `object` is a function, then methods
       * are added to its prototype as well.
       *
       * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
       * avoid conflicts caused by modifying the original.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {Function|Object} [object=lodash] The destination object.
       * @param {Object} source The object of functions to add.
       * @param {Object} [options={}] The options object.
       * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
       * @returns {Function|Object} Returns `object`.
       * @example
       *
       * function vowels(string) {
       *   return _.filter(string, function(v) {
       *     return /[aeiou]/i.test(v);
       *   });
       * }
       *
       * _.mixin({ 'vowels': vowels });
       * _.vowels('fred');
       * // => ['e']
       *
       * _('fred').vowels().value();
       * // => ['e']
       *
       * _.mixin({ 'vowels': vowels }, { 'chain': false });
       * _('fred').vowels();
       * // => ['e']
       */
      function mixin(object, source, options) {
        var props = keys(source),
            methodNames = baseFunctions(source, props);

        if (options == null &&
            !(isObject(source) && (methodNames.length || !props.length))) {
          options = source;
          source = object;
          object = this;
          methodNames = baseFunctions(source, keys(source));
        }
        var chain = !(isObject(options) && 'chain' in options) || !!options.chain,
            isFunc = isFunction(object);

        arrayEach(methodNames, function(methodName) {
          var func = source[methodName];
          object[methodName] = func;
          if (isFunc) {
            object.prototype[methodName] = function() {
              var chainAll = this.__chain__;
              if (chain || chainAll) {
                var result = object(this.__wrapped__),
                    actions = result.__actions__ = copyArray(this.__actions__);

                actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
                result.__chain__ = chainAll;
                return result;
              }
              return func.apply(object, arrayPush([this.value()], arguments));
            };
          }
        });

        return object;
      }

      /**
       * Reverts the `_` variable to its previous value and returns a reference to
       * the `lodash` function.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @returns {Function} Returns the `lodash` function.
       * @example
       *
       * var lodash = _.noConflict();
       */
      function noConflict() {
        if (root._ === this) {
          root._ = oldDash;
        }
        return this;
      }

      /**
       * This method returns `undefined`.
       *
       * @static
       * @memberOf _
       * @since 2.3.0
       * @category Util
       * @example
       *
       * _.times(2, _.noop);
       * // => [undefined, undefined]
       */
      function noop() {
        // No operation performed.
      }

      /**
       * Creates a function that gets the argument at index `n`. If `n` is negative,
       * the nth argument from the end is returned.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {number} [n=0] The index of the argument to return.
       * @returns {Function} Returns the new pass-thru function.
       * @example
       *
       * var func = _.nthArg(1);
       * func('a', 'b', 'c', 'd');
       * // => 'b'
       *
       * var func = _.nthArg(-2);
       * func('a', 'b', 'c', 'd');
       * // => 'c'
       */
      function nthArg(n) {
        n = toInteger(n);
        return baseRest(function(args) {
          return baseNth(args, n);
        });
      }

      /**
       * Creates a function that invokes `iteratees` with the arguments it receives
       * and returns their results.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {...(Function|Function[])} [iteratees=[_.identity]]
       *  The iteratees to invoke.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var func = _.over([Math.max, Math.min]);
       *
       * func(1, 2, 3, 4);
       * // => [4, 1]
       */
      var over = createOver(arrayMap);

      /**
       * Creates a function that checks if **all** of the `predicates` return
       * truthy when invoked with the arguments it receives.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {...(Function|Function[])} [predicates=[_.identity]]
       *  The predicates to check.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var func = _.overEvery([Boolean, isFinite]);
       *
       * func('1');
       * // => true
       *
       * func(null);
       * // => false
       *
       * func(NaN);
       * // => false
       */
      var overEvery = createOver(arrayEvery);

      /**
       * Creates a function that checks if **any** of the `predicates` return
       * truthy when invoked with the arguments it receives.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {...(Function|Function[])} [predicates=[_.identity]]
       *  The predicates to check.
       * @returns {Function} Returns the new function.
       * @example
       *
       * var func = _.overSome([Boolean, isFinite]);
       *
       * func('1');
       * // => true
       *
       * func(null);
       * // => true
       *
       * func(NaN);
       * // => false
       */
      var overSome = createOver(arraySome);

      /**
       * Creates a function that returns the value at `path` of a given object.
       *
       * @static
       * @memberOf _
       * @since 2.4.0
       * @category Util
       * @param {Array|string} path The path of the property to get.
       * @returns {Function} Returns the new accessor function.
       * @example
       *
       * var objects = [
       *   { 'a': { 'b': 2 } },
       *   { 'a': { 'b': 1 } }
       * ];
       *
       * _.map(objects, _.property('a.b'));
       * // => [2, 1]
       *
       * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
       * // => [1, 2]
       */
      function property(path) {
        return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
      }

      /**
       * The opposite of `_.property`; this method creates a function that returns
       * the value at a given path of `object`.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Util
       * @param {Object} object The object to query.
       * @returns {Function} Returns the new accessor function.
       * @example
       *
       * var array = [0, 1, 2],
       *     object = { 'a': array, 'b': array, 'c': array };
       *
       * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
       * // => [2, 0]
       *
       * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
       * // => [2, 0]
       */
      function propertyOf(object) {
        return function(path) {
          return object == null ? undefined$1 : baseGet(object, path);
        };
      }

      /**
       * Creates an array of numbers (positive and/or negative) progressing from
       * `start` up to, but not including, `end`. A step of `-1` is used if a negative
       * `start` is specified without an `end` or `step`. If `end` is not specified,
       * it's set to `start` with `start` then set to `0`.
       *
       * **Note:** JavaScript follows the IEEE-754 standard for resolving
       * floating-point values which can produce unexpected results.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {number} [start=0] The start of the range.
       * @param {number} end The end of the range.
       * @param {number} [step=1] The value to increment or decrement by.
       * @returns {Array} Returns the range of numbers.
       * @see _.inRange, _.rangeRight
       * @example
       *
       * _.range(4);
       * // => [0, 1, 2, 3]
       *
       * _.range(-4);
       * // => [0, -1, -2, -3]
       *
       * _.range(1, 5);
       * // => [1, 2, 3, 4]
       *
       * _.range(0, 20, 5);
       * // => [0, 5, 10, 15]
       *
       * _.range(0, -4, -1);
       * // => [0, -1, -2, -3]
       *
       * _.range(1, 4, 0);
       * // => [1, 1, 1]
       *
       * _.range(0);
       * // => []
       */
      var range = createRange();

      /**
       * This method is like `_.range` except that it populates values in
       * descending order.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {number} [start=0] The start of the range.
       * @param {number} end The end of the range.
       * @param {number} [step=1] The value to increment or decrement by.
       * @returns {Array} Returns the range of numbers.
       * @see _.inRange, _.range
       * @example
       *
       * _.rangeRight(4);
       * // => [3, 2, 1, 0]
       *
       * _.rangeRight(-4);
       * // => [-3, -2, -1, 0]
       *
       * _.rangeRight(1, 5);
       * // => [4, 3, 2, 1]
       *
       * _.rangeRight(0, 20, 5);
       * // => [15, 10, 5, 0]
       *
       * _.rangeRight(0, -4, -1);
       * // => [-3, -2, -1, 0]
       *
       * _.rangeRight(1, 4, 0);
       * // => [1, 1, 1]
       *
       * _.rangeRight(0);
       * // => []
       */
      var rangeRight = createRange(true);

      /**
       * This method returns a new empty array.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {Array} Returns the new empty array.
       * @example
       *
       * var arrays = _.times(2, _.stubArray);
       *
       * console.log(arrays);
       * // => [[], []]
       *
       * console.log(arrays[0] === arrays[1]);
       * // => false
       */
      function stubArray() {
        return [];
      }

      /**
       * This method returns `false`.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {boolean} Returns `false`.
       * @example
       *
       * _.times(2, _.stubFalse);
       * // => [false, false]
       */
      function stubFalse() {
        return false;
      }

      /**
       * This method returns a new empty object.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {Object} Returns the new empty object.
       * @example
       *
       * var objects = _.times(2, _.stubObject);
       *
       * console.log(objects);
       * // => [{}, {}]
       *
       * console.log(objects[0] === objects[1]);
       * // => false
       */
      function stubObject() {
        return {};
      }

      /**
       * This method returns an empty string.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {string} Returns the empty string.
       * @example
       *
       * _.times(2, _.stubString);
       * // => ['', '']
       */
      function stubString() {
        return '';
      }

      /**
       * This method returns `true`.
       *
       * @static
       * @memberOf _
       * @since 4.13.0
       * @category Util
       * @returns {boolean} Returns `true`.
       * @example
       *
       * _.times(2, _.stubTrue);
       * // => [true, true]
       */
      function stubTrue() {
        return true;
      }

      /**
       * Invokes the iteratee `n` times, returning an array of the results of
       * each invocation. The iteratee is invoked with one argument; (index).
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {number} n The number of times to invoke `iteratee`.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the array of results.
       * @example
       *
       * _.times(3, String);
       * // => ['0', '1', '2']
       *
       *  _.times(4, _.constant(0));
       * // => [0, 0, 0, 0]
       */
      function times(n, iteratee) {
        n = toInteger(n);
        if (n < 1 || n > MAX_SAFE_INTEGER) {
          return [];
        }
        var index = MAX_ARRAY_LENGTH,
            length = nativeMin(n, MAX_ARRAY_LENGTH);

        iteratee = getIteratee(iteratee);
        n -= MAX_ARRAY_LENGTH;

        var result = baseTimes(length, iteratee);
        while (++index < n) {
          iteratee(index);
        }
        return result;
      }

      /**
       * Converts `value` to a property path array.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Util
       * @param {*} value The value to convert.
       * @returns {Array} Returns the new property path array.
       * @example
       *
       * _.toPath('a.b.c');
       * // => ['a', 'b', 'c']
       *
       * _.toPath('a[0].b.c');
       * // => ['a', '0', 'b', 'c']
       */
      function toPath(value) {
        if (isArray(value)) {
          return arrayMap(value, toKey);
        }
        return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
      }

      /**
       * Generates a unique ID. If `prefix` is given, the ID is appended to it.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Util
       * @param {string} [prefix=''] The value to prefix the ID with.
       * @returns {string} Returns the unique ID.
       * @example
       *
       * _.uniqueId('contact_');
       * // => 'contact_104'
       *
       * _.uniqueId();
       * // => '105'
       */
      function uniqueId(prefix) {
        var id = ++idCounter;
        return toString(prefix) + id;
      }

      /*------------------------------------------------------------------------*/

      /**
       * Adds two numbers.
       *
       * @static
       * @memberOf _
       * @since 3.4.0
       * @category Math
       * @param {number} augend The first number in an addition.
       * @param {number} addend The second number in an addition.
       * @returns {number} Returns the total.
       * @example
       *
       * _.add(6, 4);
       * // => 10
       */
      var add = createMathOperation(function(augend, addend) {
        return augend + addend;
      }, 0);

      /**
       * Computes `number` rounded up to `precision`.
       *
       * @static
       * @memberOf _
       * @since 3.10.0
       * @category Math
       * @param {number} number The number to round up.
       * @param {number} [precision=0] The precision to round up to.
       * @returns {number} Returns the rounded up number.
       * @example
       *
       * _.ceil(4.006);
       * // => 5
       *
       * _.ceil(6.004, 2);
       * // => 6.01
       *
       * _.ceil(6040, -2);
       * // => 6100
       */
      var ceil = createRound('ceil');

      /**
       * Divide two numbers.
       *
       * @static
       * @memberOf _
       * @since 4.7.0
       * @category Math
       * @param {number} dividend The first number in a division.
       * @param {number} divisor The second number in a division.
       * @returns {number} Returns the quotient.
       * @example
       *
       * _.divide(6, 4);
       * // => 1.5
       */
      var divide = createMathOperation(function(dividend, divisor) {
        return dividend / divisor;
      }, 1);

      /**
       * Computes `number` rounded down to `precision`.
       *
       * @static
       * @memberOf _
       * @since 3.10.0
       * @category Math
       * @param {number} number The number to round down.
       * @param {number} [precision=0] The precision to round down to.
       * @returns {number} Returns the rounded down number.
       * @example
       *
       * _.floor(4.006);
       * // => 4
       *
       * _.floor(0.046, 2);
       * // => 0.04
       *
       * _.floor(4060, -2);
       * // => 4000
       */
      var floor = createRound('floor');

      /**
       * Computes the maximum value of `array`. If `array` is empty or falsey,
       * `undefined` is returned.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {*} Returns the maximum value.
       * @example
       *
       * _.max([4, 2, 8, 6]);
       * // => 8
       *
       * _.max([]);
       * // => undefined
       */
      function max(array) {
        return (array && array.length)
          ? baseExtremum(array, identity, baseGt)
          : undefined$1;
      }

      /**
       * This method is like `_.max` except that it accepts `iteratee` which is
       * invoked for each element in `array` to generate the criterion by which
       * the value is ranked. The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {*} Returns the maximum value.
       * @example
       *
       * var objects = [{ 'n': 1 }, { 'n': 2 }];
       *
       * _.maxBy(objects, function(o) { return o.n; });
       * // => { 'n': 2 }
       *
       * // The `_.property` iteratee shorthand.
       * _.maxBy(objects, 'n');
       * // => { 'n': 2 }
       */
      function maxBy(array, iteratee) {
        return (array && array.length)
          ? baseExtremum(array, getIteratee(iteratee, 2), baseGt)
          : undefined$1;
      }

      /**
       * Computes the mean of the values in `array`.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {number} Returns the mean.
       * @example
       *
       * _.mean([4, 2, 8, 6]);
       * // => 5
       */
      function mean(array) {
        return baseMean(array, identity);
      }

      /**
       * This method is like `_.mean` except that it accepts `iteratee` which is
       * invoked for each element in `array` to generate the value to be averaged.
       * The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.7.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {number} Returns the mean.
       * @example
       *
       * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
       *
       * _.meanBy(objects, function(o) { return o.n; });
       * // => 5
       *
       * // The `_.property` iteratee shorthand.
       * _.meanBy(objects, 'n');
       * // => 5
       */
      function meanBy(array, iteratee) {
        return baseMean(array, getIteratee(iteratee, 2));
      }

      /**
       * Computes the minimum value of `array`. If `array` is empty or falsey,
       * `undefined` is returned.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {*} Returns the minimum value.
       * @example
       *
       * _.min([4, 2, 8, 6]);
       * // => 2
       *
       * _.min([]);
       * // => undefined
       */
      function min(array) {
        return (array && array.length)
          ? baseExtremum(array, identity, baseLt)
          : undefined$1;
      }

      /**
       * This method is like `_.min` except that it accepts `iteratee` which is
       * invoked for each element in `array` to generate the criterion by which
       * the value is ranked. The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {*} Returns the minimum value.
       * @example
       *
       * var objects = [{ 'n': 1 }, { 'n': 2 }];
       *
       * _.minBy(objects, function(o) { return o.n; });
       * // => { 'n': 1 }
       *
       * // The `_.property` iteratee shorthand.
       * _.minBy(objects, 'n');
       * // => { 'n': 1 }
       */
      function minBy(array, iteratee) {
        return (array && array.length)
          ? baseExtremum(array, getIteratee(iteratee, 2), baseLt)
          : undefined$1;
      }

      /**
       * Multiply two numbers.
       *
       * @static
       * @memberOf _
       * @since 4.7.0
       * @category Math
       * @param {number} multiplier The first number in a multiplication.
       * @param {number} multiplicand The second number in a multiplication.
       * @returns {number} Returns the product.
       * @example
       *
       * _.multiply(6, 4);
       * // => 24
       */
      var multiply = createMathOperation(function(multiplier, multiplicand) {
        return multiplier * multiplicand;
      }, 1);

      /**
       * Computes `number` rounded to `precision`.
       *
       * @static
       * @memberOf _
       * @since 3.10.0
       * @category Math
       * @param {number} number The number to round.
       * @param {number} [precision=0] The precision to round to.
       * @returns {number} Returns the rounded number.
       * @example
       *
       * _.round(4.006);
       * // => 4
       *
       * _.round(4.006, 2);
       * // => 4.01
       *
       * _.round(4060, -2);
       * // => 4100
       */
      var round = createRound('round');

      /**
       * Subtract two numbers.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {number} minuend The first number in a subtraction.
       * @param {number} subtrahend The second number in a subtraction.
       * @returns {number} Returns the difference.
       * @example
       *
       * _.subtract(6, 4);
       * // => 2
       */
      var subtract = createMathOperation(function(minuend, subtrahend) {
        return minuend - subtrahend;
      }, 0);

      /**
       * Computes the sum of the values in `array`.
       *
       * @static
       * @memberOf _
       * @since 3.4.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @returns {number} Returns the sum.
       * @example
       *
       * _.sum([4, 2, 8, 6]);
       * // => 20
       */
      function sum(array) {
        return (array && array.length)
          ? baseSum(array, identity)
          : 0;
      }

      /**
       * This method is like `_.sum` except that it accepts `iteratee` which is
       * invoked for each element in `array` to generate the value to be summed.
       * The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {number} Returns the sum.
       * @example
       *
       * var objects = [{ 'n': 4 }, { 'n': 2 }, { 'n': 8 }, { 'n': 6 }];
       *
       * _.sumBy(objects, function(o) { return o.n; });
       * // => 20
       *
       * // The `_.property` iteratee shorthand.
       * _.sumBy(objects, 'n');
       * // => 20
       */
      function sumBy(array, iteratee) {
        return (array && array.length)
          ? baseSum(array, getIteratee(iteratee, 2))
          : 0;
      }

      /*------------------------------------------------------------------------*/

      // Add methods that return wrapped values in chain sequences.
      lodash.after = after;
      lodash.ary = ary;
      lodash.assign = assign;
      lodash.assignIn = assignIn;
      lodash.assignInWith = assignInWith;
      lodash.assignWith = assignWith;
      lodash.at = at;
      lodash.before = before;
      lodash.bind = bind;
      lodash.bindAll = bindAll;
      lodash.bindKey = bindKey;
      lodash.castArray = castArray;
      lodash.chain = chain;
      lodash.chunk = chunk;
      lodash.compact = compact;
      lodash.concat = concat;
      lodash.cond = cond;
      lodash.conforms = conforms;
      lodash.constant = constant;
      lodash.countBy = countBy;
      lodash.create = create;
      lodash.curry = curry;
      lodash.curryRight = curryRight;
      lodash.debounce = debounce;
      lodash.defaults = defaults;
      lodash.defaultsDeep = defaultsDeep;
      lodash.defer = defer;
      lodash.delay = delay;
      lodash.difference = difference;
      lodash.differenceBy = differenceBy;
      lodash.differenceWith = differenceWith;
      lodash.drop = drop;
      lodash.dropRight = dropRight;
      lodash.dropRightWhile = dropRightWhile;
      lodash.dropWhile = dropWhile;
      lodash.fill = fill;
      lodash.filter = filter;
      lodash.flatMap = flatMap;
      lodash.flatMapDeep = flatMapDeep;
      lodash.flatMapDepth = flatMapDepth;
      lodash.flatten = flatten;
      lodash.flattenDeep = flattenDeep;
      lodash.flattenDepth = flattenDepth;
      lodash.flip = flip;
      lodash.flow = flow;
      lodash.flowRight = flowRight;
      lodash.fromPairs = fromPairs;
      lodash.functions = functions;
      lodash.functionsIn = functionsIn;
      lodash.groupBy = groupBy;
      lodash.initial = initial;
      lodash.intersection = intersection;
      lodash.intersectionBy = intersectionBy;
      lodash.intersectionWith = intersectionWith;
      lodash.invert = invert;
      lodash.invertBy = invertBy;
      lodash.invokeMap = invokeMap;
      lodash.iteratee = iteratee;
      lodash.keyBy = keyBy;
      lodash.keys = keys;
      lodash.keysIn = keysIn;
      lodash.map = map;
      lodash.mapKeys = mapKeys;
      lodash.mapValues = mapValues;
      lodash.matches = matches;
      lodash.matchesProperty = matchesProperty;
      lodash.memoize = memoize;
      lodash.merge = merge;
      lodash.mergeWith = mergeWith;
      lodash.method = method;
      lodash.methodOf = methodOf;
      lodash.mixin = mixin;
      lodash.negate = negate;
      lodash.nthArg = nthArg;
      lodash.omit = omit;
      lodash.omitBy = omitBy;
      lodash.once = once;
      lodash.orderBy = orderBy;
      lodash.over = over;
      lodash.overArgs = overArgs;
      lodash.overEvery = overEvery;
      lodash.overSome = overSome;
      lodash.partial = partial;
      lodash.partialRight = partialRight;
      lodash.partition = partition;
      lodash.pick = pick;
      lodash.pickBy = pickBy;
      lodash.property = property;
      lodash.propertyOf = propertyOf;
      lodash.pull = pull;
      lodash.pullAll = pullAll;
      lodash.pullAllBy = pullAllBy;
      lodash.pullAllWith = pullAllWith;
      lodash.pullAt = pullAt;
      lodash.range = range;
      lodash.rangeRight = rangeRight;
      lodash.rearg = rearg;
      lodash.reject = reject;
      lodash.remove = remove;
      lodash.rest = rest;
      lodash.reverse = reverse;
      lodash.sampleSize = sampleSize;
      lodash.set = set;
      lodash.setWith = setWith;
      lodash.shuffle = shuffle;
      lodash.slice = slice;
      lodash.sortBy = sortBy;
      lodash.sortedUniq = sortedUniq;
      lodash.sortedUniqBy = sortedUniqBy;
      lodash.split = split;
      lodash.spread = spread;
      lodash.tail = tail;
      lodash.take = take;
      lodash.takeRight = takeRight;
      lodash.takeRightWhile = takeRightWhile;
      lodash.takeWhile = takeWhile;
      lodash.tap = tap;
      lodash.throttle = throttle;
      lodash.thru = thru;
      lodash.toArray = toArray;
      lodash.toPairs = toPairs;
      lodash.toPairsIn = toPairsIn;
      lodash.toPath = toPath;
      lodash.toPlainObject = toPlainObject;
      lodash.transform = transform;
      lodash.unary = unary;
      lodash.union = union;
      lodash.unionBy = unionBy;
      lodash.unionWith = unionWith;
      lodash.uniq = uniq;
      lodash.uniqBy = uniqBy;
      lodash.uniqWith = uniqWith;
      lodash.unset = unset;
      lodash.unzip = unzip;
      lodash.unzipWith = unzipWith;
      lodash.update = update;
      lodash.updateWith = updateWith;
      lodash.values = values;
      lodash.valuesIn = valuesIn;
      lodash.without = without;
      lodash.words = words;
      lodash.wrap = wrap;
      lodash.xor = xor;
      lodash.xorBy = xorBy;
      lodash.xorWith = xorWith;
      lodash.zip = zip;
      lodash.zipObject = zipObject;
      lodash.zipObjectDeep = zipObjectDeep;
      lodash.zipWith = zipWith;

      // Add aliases.
      lodash.entries = toPairs;
      lodash.entriesIn = toPairsIn;
      lodash.extend = assignIn;
      lodash.extendWith = assignInWith;

      // Add methods to `lodash.prototype`.
      mixin(lodash, lodash);

      /*------------------------------------------------------------------------*/

      // Add methods that return unwrapped values in chain sequences.
      lodash.add = add;
      lodash.attempt = attempt;
      lodash.camelCase = camelCase;
      lodash.capitalize = capitalize;
      lodash.ceil = ceil;
      lodash.clamp = clamp;
      lodash.clone = clone;
      lodash.cloneDeep = cloneDeep;
      lodash.cloneDeepWith = cloneDeepWith;
      lodash.cloneWith = cloneWith;
      lodash.conformsTo = conformsTo;
      lodash.deburr = deburr;
      lodash.defaultTo = defaultTo;
      lodash.divide = divide;
      lodash.endsWith = endsWith;
      lodash.eq = eq;
      lodash.escape = escape;
      lodash.escapeRegExp = escapeRegExp;
      lodash.every = every;
      lodash.find = find;
      lodash.findIndex = findIndex;
      lodash.findKey = findKey;
      lodash.findLast = findLast;
      lodash.findLastIndex = findLastIndex;
      lodash.findLastKey = findLastKey;
      lodash.floor = floor;
      lodash.forEach = forEach;
      lodash.forEachRight = forEachRight;
      lodash.forIn = forIn;
      lodash.forInRight = forInRight;
      lodash.forOwn = forOwn;
      lodash.forOwnRight = forOwnRight;
      lodash.get = get;
      lodash.gt = gt;
      lodash.gte = gte;
      lodash.has = has;
      lodash.hasIn = hasIn;
      lodash.head = head;
      lodash.identity = identity;
      lodash.includes = includes;
      lodash.indexOf = indexOf;
      lodash.inRange = inRange;
      lodash.invoke = invoke;
      lodash.isArguments = isArguments;
      lodash.isArray = isArray;
      lodash.isArrayBuffer = isArrayBuffer;
      lodash.isArrayLike = isArrayLike;
      lodash.isArrayLikeObject = isArrayLikeObject;
      lodash.isBoolean = isBoolean;
      lodash.isBuffer = isBuffer;
      lodash.isDate = isDate;
      lodash.isElement = isElement;
      lodash.isEmpty = isEmpty;
      lodash.isEqual = isEqual;
      lodash.isEqualWith = isEqualWith;
      lodash.isError = isError;
      lodash.isFinite = isFinite;
      lodash.isFunction = isFunction;
      lodash.isInteger = isInteger;
      lodash.isLength = isLength;
      lodash.isMap = isMap;
      lodash.isMatch = isMatch;
      lodash.isMatchWith = isMatchWith;
      lodash.isNaN = isNaN;
      lodash.isNative = isNative;
      lodash.isNil = isNil;
      lodash.isNull = isNull;
      lodash.isNumber = isNumber;
      lodash.isObject = isObject;
      lodash.isObjectLike = isObjectLike;
      lodash.isPlainObject = isPlainObject;
      lodash.isRegExp = isRegExp;
      lodash.isSafeInteger = isSafeInteger;
      lodash.isSet = isSet;
      lodash.isString = isString;
      lodash.isSymbol = isSymbol;
      lodash.isTypedArray = isTypedArray;
      lodash.isUndefined = isUndefined;
      lodash.isWeakMap = isWeakMap;
      lodash.isWeakSet = isWeakSet;
      lodash.join = join;
      lodash.kebabCase = kebabCase;
      lodash.last = last;
      lodash.lastIndexOf = lastIndexOf;
      lodash.lowerCase = lowerCase;
      lodash.lowerFirst = lowerFirst;
      lodash.lt = lt;
      lodash.lte = lte;
      lodash.max = max;
      lodash.maxBy = maxBy;
      lodash.mean = mean;
      lodash.meanBy = meanBy;
      lodash.min = min;
      lodash.minBy = minBy;
      lodash.stubArray = stubArray;
      lodash.stubFalse = stubFalse;
      lodash.stubObject = stubObject;
      lodash.stubString = stubString;
      lodash.stubTrue = stubTrue;
      lodash.multiply = multiply;
      lodash.nth = nth;
      lodash.noConflict = noConflict;
      lodash.noop = noop;
      lodash.now = now;
      lodash.pad = pad;
      lodash.padEnd = padEnd;
      lodash.padStart = padStart;
      lodash.parseInt = parseInt;
      lodash.random = random;
      lodash.reduce = reduce;
      lodash.reduceRight = reduceRight;
      lodash.repeat = repeat;
      lodash.replace = replace;
      lodash.result = result;
      lodash.round = round;
      lodash.runInContext = runInContext;
      lodash.sample = sample;
      lodash.size = size;
      lodash.snakeCase = snakeCase;
      lodash.some = some;
      lodash.sortedIndex = sortedIndex;
      lodash.sortedIndexBy = sortedIndexBy;
      lodash.sortedIndexOf = sortedIndexOf;
      lodash.sortedLastIndex = sortedLastIndex;
      lodash.sortedLastIndexBy = sortedLastIndexBy;
      lodash.sortedLastIndexOf = sortedLastIndexOf;
      lodash.startCase = startCase;
      lodash.startsWith = startsWith;
      lodash.subtract = subtract;
      lodash.sum = sum;
      lodash.sumBy = sumBy;
      lodash.template = template;
      lodash.times = times;
      lodash.toFinite = toFinite;
      lodash.toInteger = toInteger;
      lodash.toLength = toLength;
      lodash.toLower = toLower;
      lodash.toNumber = toNumber;
      lodash.toSafeInteger = toSafeInteger;
      lodash.toString = toString;
      lodash.toUpper = toUpper;
      lodash.trim = trim;
      lodash.trimEnd = trimEnd;
      lodash.trimStart = trimStart;
      lodash.truncate = truncate;
      lodash.unescape = unescape;
      lodash.uniqueId = uniqueId;
      lodash.upperCase = upperCase;
      lodash.upperFirst = upperFirst;

      // Add aliases.
      lodash.each = forEach;
      lodash.eachRight = forEachRight;
      lodash.first = head;

      mixin(lodash, (function() {
        var source = {};
        baseForOwn(lodash, function(func, methodName) {
          if (!hasOwnProperty.call(lodash.prototype, methodName)) {
            source[methodName] = func;
          }
        });
        return source;
      }()), { 'chain': false });

      /*------------------------------------------------------------------------*/

      /**
       * The semantic version number.
       *
       * @static
       * @memberOf _
       * @type {string}
       */
      lodash.VERSION = VERSION;

      // Assign default placeholders.
      arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
        lodash[methodName].placeholder = lodash;
      });

      // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
      arrayEach(['drop', 'take'], function(methodName, index) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined$1 ? 1 : nativeMax(toInteger(n), 0);

          var result = (this.__filtered__ && !index)
            ? new LazyWrapper(this)
            : this.clone();

          if (result.__filtered__) {
            result.__takeCount__ = nativeMin(n, result.__takeCount__);
          } else {
            result.__views__.push({
              'size': nativeMin(n, MAX_ARRAY_LENGTH),
              'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
            });
          }
          return result;
        };

        LazyWrapper.prototype[methodName + 'Right'] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });

      // Add `LazyWrapper` methods that accept an `iteratee` value.
      arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
        var type = index + 1,
            isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

        LazyWrapper.prototype[methodName] = function(iteratee) {
          var result = this.clone();
          result.__iteratees__.push({
            'iteratee': getIteratee(iteratee, 3),
            'type': type
          });
          result.__filtered__ = result.__filtered__ || isFilter;
          return result;
        };
      });

      // Add `LazyWrapper` methods for `_.head` and `_.last`.
      arrayEach(['head', 'last'], function(methodName, index) {
        var takeName = 'take' + (index ? 'Right' : '');

        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });

      // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
      arrayEach(['initial', 'tail'], function(methodName, index) {
        var dropName = 'drop' + (index ? '' : 'Right');

        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });

      LazyWrapper.prototype.compact = function() {
        return this.filter(identity);
      };

      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };

      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };

      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == 'function') {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });

      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(getIteratee(predicate)));
      };

      LazyWrapper.prototype.slice = function(start, end) {
        start = toInteger(start);

        var result = this;
        if (result.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result);
        }
        if (start < 0) {
          result = result.takeRight(-start);
        } else if (start) {
          result = result.drop(start);
        }
        if (end !== undefined$1) {
          end = toInteger(end);
          result = end < 0 ? result.dropRight(-end) : result.take(end - start);
        }
        return result;
      };

      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };

      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };

      // Add `LazyWrapper` methods to `lodash.prototype`.
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
            isTaker = /^(?:head|last)$/.test(methodName),
            lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
            retUnwrapped = isTaker || /^find/.test(methodName);

        if (!lodashFunc) {
          return;
        }
        lodash.prototype[methodName] = function() {
          var value = this.__wrapped__,
              args = isTaker ? [1] : arguments,
              isLazy = value instanceof LazyWrapper,
              iteratee = args[0],
              useLazy = isLazy || isArray(value);

          var interceptor = function(value) {
            var result = lodashFunc.apply(lodash, arrayPush([value], args));
            return (isTaker && chainAll) ? result[0] : result;
          };

          if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
            // Avoid lazy use if the iteratee has a "length" value other than `1`.
            isLazy = useLazy = false;
          }
          var chainAll = this.__chain__,
              isHybrid = !!this.__actions__.length,
              isUnwrapped = retUnwrapped && !chainAll,
              onlyLazy = isLazy && !isHybrid;

          if (!retUnwrapped && useLazy) {
            value = onlyLazy ? value : new LazyWrapper(this);
            var result = func.apply(value, args);
            result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined$1 });
            return new LodashWrapper(result, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result = this.thru(interceptor);
          return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
        };
      });

      // Add `Array` methods to `lodash.prototype`.
      arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
        var func = arrayProto[methodName],
            chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
            retUnwrapped = /^(?:pop|shift)$/.test(methodName);

        lodash.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }
          return this[chainName](function(value) {
            return func.apply(isArray(value) ? value : [], args);
          });
        };
      });

      // Map minified method names to their real names.
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash[methodName];
        if (lodashFunc) {
          var key = lodashFunc.name + '';
          if (!hasOwnProperty.call(realNames, key)) {
            realNames[key] = [];
          }
          realNames[key].push({ 'name': methodName, 'func': lodashFunc });
        }
      });

      realNames[createHybrid(undefined$1, WRAP_BIND_KEY_FLAG).name] = [{
        'name': 'wrapper',
        'func': undefined$1
      }];

      // Add methods to `LazyWrapper`.
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;

      // Add chain sequence methods to the `lodash` wrapper.
      lodash.prototype.at = wrapperAt;
      lodash.prototype.chain = wrapperChain;
      lodash.prototype.commit = wrapperCommit;
      lodash.prototype.next = wrapperNext;
      lodash.prototype.plant = wrapperPlant;
      lodash.prototype.reverse = wrapperReverse;
      lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

      // Add lazy aliases.
      lodash.prototype.first = lodash.prototype.head;

      if (symIterator) {
        lodash.prototype[symIterator] = wrapperToIterator;
      }
      return lodash;
    });

    /*--------------------------------------------------------------------------*/

    // Export lodash.
    var _ = runInContext();

    // Some AMD build optimizers, like r.js, check for condition patterns like:
    if (freeModule) {
      // Export for Node.js.
      (freeModule.exports = _)._ = _;
      // Export for CommonJS support.
      freeExports._ = _;
    }
    else {
      // Export to the global object.
      root._ = _;
    }
  }.call(commonjsGlobal));
  });

  function isPositionInFrame(frame) {
    var isWithinVertical = isWithin(frame.top, frame.bottom);
    var isWithinHorizontal = isWithin(frame.left, frame.right);
    return function run(point) {
      return isWithinVertical(point.y) && isWithinHorizontal(point.x);
    };
  }

  function getHasOverlap(first, second) {
    return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
  }

  function getClosest(_ref) {
    var pageBorderBox = _ref.pageBorderBox,
        draggable = _ref.draggable,
        candidates = _ref.candidates;
    var startCenter = pageBorderBox.center;

    var sorted = lodash.orderBy(candidates.map(function (candidate) {
      var axis = candidate.axis;
      var target = patch(candidate.axis.line, pageBorderBox.center[axis.line], candidate.page.borderBox.center[axis.crossAxisLine]);
      return {
        id: candidate.descriptor.id,
        distance: distance(startCenter, target),
        size: candidate.page.borderBox[axis.size]
      };
    }), ['distance', 'size'], ['asc', 'asc']);

    return sorted[0] ? sorted[0].id : null;
  }

  function getDroppableOver$1(_ref2) {
    var pageBorderBox = _ref2.pageBorderBox,
        draggable = _ref2.draggable,
        droppables = _ref2.droppables;
    var candidates = toDroppableList(droppables).filter(function (item) {
      if (!item.isEnabled) {
        return false;
      }

      var active = item.subject.active;

      if (!active) {
        return false;
      }

      if (!getHasOverlap(pageBorderBox, active)) {
        return false;
      }

      if (isPositionInFrame(active)(pageBorderBox.center)) {
        return true;
      }

      var axis = item.axis;
      var childCenter = active.center[axis.crossAxisLine];
      var crossAxisStart = pageBorderBox[axis.crossAxisStart];
      var crossAxisEnd = pageBorderBox[axis.crossAxisEnd];
      var isContained = isWithin(active[axis.crossAxisStart], active[axis.crossAxisEnd]);
      var isStartContained = isContained(crossAxisStart);
      var isEndContained = isContained(crossAxisEnd);

      if (!isStartContained && !isEndContained) {
        return true;
      }

      if (isStartContained) {
        return crossAxisStart < childCenter;
      }

      return crossAxisEnd > childCenter;
    });

    if (!candidates.length) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0].descriptor.id;
    }

    return getClosest({
      pageBorderBox: pageBorderBox,
      draggable: draggable,
      candidates: candidates
    });
  }

  var offsetRectByPosition = function offsetRectByPosition(rect, point) {
    return getRect(offsetByPosition(rect, point));
  };

  var withDroppableScroll = (function (droppable, area) {
    var frame = droppable.frame;

    if (!frame) {
      return area;
    }

    return offsetRectByPosition(area, frame.scroll.diff.value);
  });

  function getIsDisplaced(_ref) {
    var displaced = _ref.displaced,
        id = _ref.id;
    return Boolean(displaced.visible[id] || displaced.invisible[id]);
  }

  function atIndex(_ref) {
    var draggable = _ref.draggable,
        closest = _ref.closest,
        inHomeList = _ref.inHomeList;

    if (!closest) {
      return null;
    }

    if (!inHomeList) {
      return closest.descriptor.index;
    }

    if (closest.descriptor.index > draggable.descriptor.index) {
      return closest.descriptor.index - 1;
    }

    return closest.descriptor.index;
  }

  var getReorderImpact = (function (_ref2) {
    var targetRect = _ref2.pageBorderBoxWithDroppableScroll,
        draggable = _ref2.draggable,
        destination = _ref2.destination,
        insideDestination = _ref2.insideDestination,
        last = _ref2.last,
        viewport = _ref2.viewport,
        afterCritical = _ref2.afterCritical;
    var axis = destination.axis;
    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy);
    var displacement = displacedBy.value;
    var targetStart = targetRect[axis.start];
    var targetEnd = targetRect[axis.end];
    var withoutDragging = removeDraggableFromList(draggable, insideDestination);
    var closest = find(withoutDragging, function (child) {
      var id = child.descriptor.id;
      var childCenter = child.page.borderBox.center[axis.line];
      var didStartAfterCritical$1 = didStartAfterCritical(id, afterCritical);
      var isDisplaced = getIsDisplaced({
        displaced: last,
        id: id
      });

      if (didStartAfterCritical$1) {
        if (isDisplaced) {
          return targetEnd <= childCenter;
        }

        return targetStart < childCenter - displacement;
      }

      if (isDisplaced) {
        return targetEnd <= childCenter + displacement;
      }

      return targetStart < childCenter;
    });
    var newIndex = atIndex({
      draggable: draggable,
      closest: closest,
      inHomeList: isHomeOf(draggable, destination)
    });
    return calculateReorderImpact({
      draggable: draggable,
      insideDestination: insideDestination,
      destination: destination,
      viewport: viewport,
      last: last,
      displacedBy: displacedBy,
      index: newIndex
    });
  });

  var combineThresholdDivisor = 4;
  var getCombineImpact = (function (_ref) {
    var draggable = _ref.draggable,
        targetRect = _ref.pageBorderBoxWithDroppableScroll,
        previousImpact = _ref.previousImpact,
        destination = _ref.destination,
        insideDestination = _ref.insideDestination,
        afterCritical = _ref.afterCritical;

    if (!destination.isCombineEnabled) {
      return null;
    }

    var axis = destination.axis;
    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy);
    var displacement = displacedBy.value;
    var targetStart = targetRect[axis.start];
    var targetEnd = targetRect[axis.end];
    var withoutDragging = removeDraggableFromList(draggable, insideDestination);
    var combineWith = find(withoutDragging, function (child) {
      var id = child.descriptor.id;
      var childRect = child.page.borderBox;
      var childSize = childRect[axis.size];
      var threshold = childSize / combineThresholdDivisor;
      var didStartAfterCritical$1 = didStartAfterCritical(id, afterCritical);
      var isDisplaced = getIsDisplaced({
        displaced: previousImpact.displaced,
        id: id
      });

      if (didStartAfterCritical$1) {
        if (isDisplaced) {
          return targetEnd > childRect[axis.start] + threshold && targetEnd < childRect[axis.end] - threshold;
        }

        return targetStart > childRect[axis.start] - displacement + threshold && targetStart < childRect[axis.end] - displacement - threshold;
      }

      if (isDisplaced) {
        return targetEnd > childRect[axis.start] + displacement + threshold && targetEnd < childRect[axis.end] + displacement - threshold;
      }

      return targetStart > childRect[axis.start] + threshold && targetStart < childRect[axis.end] - threshold;
    });

    if (!combineWith) {
      return null;
    }

    var impact = {
      displacedBy: displacedBy,
      displaced: previousImpact.displaced,
      at: {
        type: 'COMBINE',
        combine: {
          draggableId: combineWith.descriptor.id,
          droppableId: destination.descriptor.id
        }
      }
    };
    return impact;
  });

  var getDragImpact = (function (_ref) {
    var pageOffset = _ref.pageOffset,
        draggable = _ref.draggable,
        draggables = _ref.draggables,
        droppables = _ref.droppables,
        previousImpact = _ref.previousImpact,
        viewport = _ref.viewport,
        afterCritical = _ref.afterCritical;
    var pageBorderBox = offsetRectByPosition(draggable.page.borderBox, pageOffset);
    var destinationId = getDroppableOver$1({
      pageBorderBox: pageBorderBox,
      draggable: draggable,
      droppables: droppables
    });

    if (!destinationId) {
      return noImpact;
    }

    var destination = droppables[destinationId];
    var insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
    var pageBorderBoxWithDroppableScroll = withDroppableScroll(destination, pageBorderBox);
    return getCombineImpact({
      pageBorderBoxWithDroppableScroll: pageBorderBoxWithDroppableScroll,
      draggable: draggable,
      previousImpact: previousImpact,
      destination: destination,
      insideDestination: insideDestination,
      afterCritical: afterCritical
    }) || getReorderImpact({
      pageBorderBoxWithDroppableScroll: pageBorderBoxWithDroppableScroll,
      draggable: draggable,
      destination: destination,
      insideDestination: insideDestination,
      last: previousImpact.displaced,
      viewport: viewport,
      afterCritical: afterCritical
    });
  });

  var patchDroppableMap = (function (droppables, updated) {
    var _extends2;

    return _extends({}, droppables, (_extends2 = {}, _extends2[updated.descriptor.id] = updated, _extends2));
  });

  var clearUnusedPlaceholder = function clearUnusedPlaceholder(_ref) {
    var previousImpact = _ref.previousImpact,
        impact = _ref.impact,
        droppables = _ref.droppables;
    var last = whatIsDraggedOver(previousImpact);
    var now = whatIsDraggedOver(impact);

    if (!last) {
      return droppables;
    }

    if (last === now) {
      return droppables;
    }

    var lastDroppable = droppables[last];

    if (!lastDroppable.subject.withPlaceholder) {
      return droppables;
    }

    var updated = removePlaceholder(lastDroppable);
    return patchDroppableMap(droppables, updated);
  };

  var recomputePlaceholders = (function (_ref2) {
    var draggable = _ref2.draggable,
        draggables = _ref2.draggables,
        droppables = _ref2.droppables,
        previousImpact = _ref2.previousImpact,
        impact = _ref2.impact;
    var cleaned = clearUnusedPlaceholder({
      previousImpact: previousImpact,
      impact: impact,
      droppables: droppables
    });
    var isOver = whatIsDraggedOver(impact);

    if (!isOver) {
      return cleaned;
    }

    var droppable = droppables[isOver];

    if (isHomeOf(draggable, droppable)) {
      return cleaned;
    }

    if (droppable.subject.withPlaceholder) {
      return cleaned;
    }

    var patched = addPlaceholder(droppable, draggable, draggables);
    return patchDroppableMap(cleaned, patched);
  });

  var update = (function (_ref) {
    var state = _ref.state,
        forcedClientSelection = _ref.clientSelection,
        forcedDimensions = _ref.dimensions,
        forcedViewport = _ref.viewport,
        forcedImpact = _ref.impact,
        scrollJumpRequest = _ref.scrollJumpRequest;
    var viewport = forcedViewport || state.viewport;
    var dimensions = forcedDimensions || state.dimensions;
    var clientSelection = forcedClientSelection || state.current.client.selection;
    var offset = subtract(clientSelection, state.initial.client.selection);
    var client = {
      offset: offset,
      selection: clientSelection,
      borderBoxCenter: add(state.initial.client.borderBoxCenter, offset)
    };
    var page = {
      selection: add(client.selection, viewport.scroll.current),
      borderBoxCenter: add(client.borderBoxCenter, viewport.scroll.current),
      offset: add(client.offset, viewport.scroll.diff.value)
    };
    var current = {
      client: client,
      page: page
    };

    if (state.phase === 'COLLECTING') {
      return _extends({
        phase: 'COLLECTING'
      }, state, {
        dimensions: dimensions,
        viewport: viewport,
        current: current
      });
    }

    var draggable = dimensions.draggables[state.critical.draggable.id];
    var newImpact = forcedImpact || getDragImpact({
      pageOffset: page.offset,
      draggable: draggable,
      draggables: dimensions.draggables,
      droppables: dimensions.droppables,
      previousImpact: state.impact,
      viewport: viewport,
      afterCritical: state.afterCritical
    });
    var withUpdatedPlaceholders = recomputePlaceholders({
      draggable: draggable,
      impact: newImpact,
      previousImpact: state.impact,
      draggables: dimensions.draggables,
      droppables: dimensions.droppables
    });

    var result = _extends({}, state, {
      current: current,
      dimensions: {
        draggables: dimensions.draggables,
        droppables: withUpdatedPlaceholders
      },
      impact: newImpact,
      viewport: viewport,
      scrollJumpRequest: scrollJumpRequest || null,
      forceShouldAnimate: scrollJumpRequest ? false : null
    });

    return result;
  });

  function getDraggables$1(ids, draggables) {
    return ids.map(function (id) {
      return draggables[id];
    });
  }

  var recompute = (function (_ref) {
    var impact = _ref.impact,
        viewport = _ref.viewport,
        draggables = _ref.draggables,
        destination = _ref.destination,
        forceShouldAnimate = _ref.forceShouldAnimate;
    var last = impact.displaced;
    var afterDragging = getDraggables$1(last.all, draggables);
    var displaced = getDisplacementGroups({
      afterDragging: afterDragging,
      destination: destination,
      displacedBy: impact.displacedBy,
      viewport: viewport.frame,
      forceShouldAnimate: forceShouldAnimate,
      last: last
    });
    return _extends({}, impact, {
      displaced: displaced
    });
  });

  var getClientBorderBoxCenter = (function (_ref) {
    var impact = _ref.impact,
        draggable = _ref.draggable,
        droppable = _ref.droppable,
        draggables = _ref.draggables,
        viewport = _ref.viewport,
        afterCritical = _ref.afterCritical;
    var pageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
      impact: impact,
      draggable: draggable,
      draggables: draggables,
      droppable: droppable,
      afterCritical: afterCritical
    });
    return getClientFromPageBorderBoxCenter({
      pageBorderBoxCenter: pageBorderBoxCenter,
      draggable: draggable,
      viewport: viewport
    });
  });

  var refreshSnap = (function (_ref) {
    var state = _ref.state,
        forcedDimensions = _ref.dimensions,
        forcedViewport = _ref.viewport;
    !(state.movementMode === 'SNAP') ?  invariant(false)  : void 0;
    var needsVisibilityCheck = state.impact;
    var viewport = forcedViewport || state.viewport;
    var dimensions = forcedDimensions || state.dimensions;
    var draggables = dimensions.draggables,
        droppables = dimensions.droppables;
    var draggable = draggables[state.critical.draggable.id];
    var isOver = whatIsDraggedOver(needsVisibilityCheck);
    !isOver ?  invariant(false, 'Must be over a destination in SNAP movement mode')  : void 0;
    var destination = droppables[isOver];
    var impact = recompute({
      impact: needsVisibilityCheck,
      viewport: viewport,
      destination: destination,
      draggables: draggables
    });
    var clientSelection = getClientBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      droppable: destination,
      draggables: draggables,
      viewport: viewport,
      afterCritical: state.afterCritical
    });
    return update({
      impact: impact,
      clientSelection: clientSelection,
      state: state,
      dimensions: dimensions,
      viewport: viewport
    });
  });

  var getHomeLocation = (function (descriptor) {
    return {
      index: descriptor.index,
      droppableId: descriptor.droppableId
    };
  });

  var getLiftEffect = (function (_ref) {
    var draggable = _ref.draggable,
        home = _ref.home,
        draggables = _ref.draggables,
        viewport = _ref.viewport;
    var displacedBy = getDisplacedBy(home.axis, draggable.displaceBy);
    var insideHome = getDraggablesInsideDroppable(home.descriptor.id, draggables);
    var rawIndex = insideHome.indexOf(draggable);
    !(rawIndex !== -1) ?  invariant(false, 'Expected draggable to be inside home list')  : void 0;
    var afterDragging = insideHome.slice(rawIndex + 1);
    var effected = afterDragging.reduce(function (previous, item) {
      previous[item.descriptor.id] = true;
      return previous;
    }, {});
    var afterCritical = {
      inVirtualList: home.descriptor.mode === 'virtual',
      displacedBy: displacedBy,
      effected: effected
    };
    var displaced = getDisplacementGroups({
      afterDragging: afterDragging,
      destination: home,
      displacedBy: displacedBy,
      last: null,
      viewport: viewport.frame,
      forceShouldAnimate: false
    });
    var impact = {
      displaced: displaced,
      displacedBy: displacedBy,
      at: {
        type: 'REORDER',
        destination: getHomeLocation(draggable.descriptor)
      }
    };
    return {
      impact: impact,
      afterCritical: afterCritical
    };
  });

  var patchDimensionMap = (function (dimensions, updated) {
    return {
      draggables: dimensions.draggables,
      droppables: patchDroppableMap(dimensions.droppables, updated)
    };
  });

  var offsetDraggable = (function (_ref) {
    var draggable = _ref.draggable,
        offset$1 = _ref.offset,
        initialWindowScroll = _ref.initialWindowScroll;
    var client = offset(draggable.client, offset$1);
    var page = withScroll(client, initialWindowScroll);

    var moved = _extends({}, draggable, {
      placeholder: _extends({}, draggable.placeholder, {
        client: client
      }),
      client: client,
      page: page
    });

    return moved;
  });

  var getFrame = (function (droppable) {
    var frame = droppable.frame;
    !frame ?  invariant(false, 'Expected Droppable to have a frame')  : void 0;
    return frame;
  });

  var adjustAdditionsForScrollChanges = (function (_ref) {
    var additions = _ref.additions,
        updatedDroppables = _ref.updatedDroppables,
        viewport = _ref.viewport;
    var windowScrollChange = viewport.scroll.diff.value;
    return additions.map(function (draggable) {
      var droppableId = draggable.descriptor.droppableId;
      var modified = updatedDroppables[droppableId];
      var frame = getFrame(modified);
      var droppableScrollChange = frame.scroll.diff.value;
      var totalChange = add(windowScrollChange, droppableScrollChange);
      var moved = offsetDraggable({
        draggable: draggable,
        offset: totalChange,
        initialWindowScroll: viewport.scroll.initial
      });
      return moved;
    });
  });

  var publishWhileDraggingInVirtual = (function (_ref) {
    var state = _ref.state,
        published = _ref.published;
    var withScrollChange = published.modified.map(function (update) {
      var existing = state.dimensions.droppables[update.droppableId];
      var scrolled = scrollDroppable(existing, update.scroll);
      return scrolled;
    });

    var droppables = _extends({}, state.dimensions.droppables, {}, toDroppableMap(withScrollChange));

    var updatedAdditions = toDraggableMap(adjustAdditionsForScrollChanges({
      additions: published.additions,
      updatedDroppables: droppables,
      viewport: state.viewport
    }));

    var draggables = _extends({}, state.dimensions.draggables, {}, updatedAdditions);

    published.removals.forEach(function (id) {
      delete draggables[id];
    });
    var dimensions = {
      droppables: droppables,
      draggables: draggables
    };
    var wasOverId = whatIsDraggedOver(state.impact);
    var wasOver = wasOverId ? dimensions.droppables[wasOverId] : null;
    var draggable = dimensions.draggables[state.critical.draggable.id];
    var home = dimensions.droppables[state.critical.droppable.id];

    var _getLiftEffect = getLiftEffect({
      draggable: draggable,
      home: home,
      draggables: draggables,
      viewport: state.viewport
    }),
        onLiftImpact = _getLiftEffect.impact,
        afterCritical = _getLiftEffect.afterCritical;

    var previousImpact = wasOver && wasOver.isCombineEnabled ? state.impact : onLiftImpact;
    var impact = getDragImpact({
      pageOffset: state.current.page.offset,
      draggable: dimensions.draggables[state.critical.draggable.id],
      draggables: dimensions.draggables,
      droppables: dimensions.droppables,
      previousImpact: previousImpact,
      viewport: state.viewport,
      afterCritical: afterCritical
    });

    var draggingState = _extends({
      phase: 'DRAGGING'
    }, state, {
      phase: 'DRAGGING',
      impact: impact,
      onLiftImpact: onLiftImpact,
      dimensions: dimensions,
      afterCritical: afterCritical,
      forceShouldAnimate: false
    });

    if (state.phase === 'COLLECTING') {
      return draggingState;
    }

    var dropPending = _extends({
      phase: 'DROP_PENDING'
    }, draggingState, {
      phase: 'DROP_PENDING',
      reason: state.reason,
      isWaiting: false
    });

    return dropPending;
  });

  var isSnapping = function isSnapping(state) {
    return state.movementMode === 'SNAP';
  };

  var postDroppableChange = function postDroppableChange(state, updated, isEnabledChanging) {
    var dimensions = patchDimensionMap(state.dimensions, updated);

    if (!isSnapping(state) || isEnabledChanging) {
      return update({
        state: state,
        dimensions: dimensions
      });
    }

    return refreshSnap({
      state: state,
      dimensions: dimensions
    });
  };

  function removeScrollJumpRequest(state) {
    if (state.isDragging && state.movementMode === 'SNAP') {
      return _extends({
        phase: 'DRAGGING'
      }, state, {
        scrollJumpRequest: null
      });
    }

    return state;
  }

  var idle = {
    phase: 'IDLE',
    completed: null,
    shouldFlush: false
  };
  var reducer = (function (state, action) {
    if (state === void 0) {
      state = idle;
    }

    if (action.type === 'FLUSH') {
      return _extends({}, idle, {
        shouldFlush: true
      });
    }

    if (action.type === 'INITIAL_PUBLISH') {
      !(state.phase === 'IDLE') ?  invariant(false, 'INITIAL_PUBLISH must come after a IDLE phase')  : void 0;
      var _action$payload = action.payload,
          critical = _action$payload.critical,
          clientSelection = _action$payload.clientSelection,
          viewport = _action$payload.viewport,
          dimensions = _action$payload.dimensions,
          movementMode = _action$payload.movementMode;
      var draggable = dimensions.draggables[critical.draggable.id];
      var home = dimensions.droppables[critical.droppable.id];
      var client = {
        selection: clientSelection,
        borderBoxCenter: draggable.client.borderBox.center,
        offset: origin
      };
      var initial = {
        client: client,
        page: {
          selection: add(client.selection, viewport.scroll.initial),
          borderBoxCenter: add(client.selection, viewport.scroll.initial),
          offset: add(client.selection, viewport.scroll.diff.value)
        }
      };
      var isWindowScrollAllowed = toDroppableList(dimensions.droppables).every(function (item) {
        return !item.isFixedOnPage;
      });

      var _getLiftEffect = getLiftEffect({
        draggable: draggable,
        home: home,
        draggables: dimensions.draggables,
        viewport: viewport
      }),
          impact = _getLiftEffect.impact,
          afterCritical = _getLiftEffect.afterCritical;

      var result = {
        phase: 'DRAGGING',
        isDragging: true,
        critical: critical,
        movementMode: movementMode,
        dimensions: dimensions,
        initial: initial,
        current: initial,
        isWindowScrollAllowed: isWindowScrollAllowed,
        impact: impact,
        afterCritical: afterCritical,
        onLiftImpact: impact,
        viewport: viewport,
        scrollJumpRequest: null,
        forceShouldAnimate: null
      };
      return result;
    }

    if (action.type === 'COLLECTION_STARTING') {
      if (state.phase === 'COLLECTING' || state.phase === 'DROP_PENDING') {
        return state;
      }

      !(state.phase === 'DRAGGING') ?  invariant(false, "Collection cannot start from phase " + state.phase)  : void 0;

      var _result = _extends({
        phase: 'COLLECTING'
      }, state, {
        phase: 'COLLECTING'
      });

      return _result;
    }

    if (action.type === 'PUBLISH_WHILE_DRAGGING') {
      !(state.phase === 'COLLECTING' || state.phase === 'DROP_PENDING') ?  invariant(false, "Unexpected " + action.type + " received in phase " + state.phase)  : void 0;
      return publishWhileDraggingInVirtual({
        state: state,
        published: action.payload
      });
    }

    if (action.type === 'MOVE') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      !isMovementAllowed(state) ?  invariant(false, action.type + " not permitted in phase " + state.phase)  : void 0;
      var _clientSelection = action.payload.client;

      if (isEqual(_clientSelection, state.current.client.selection)) {
        return state;
      }

      return update({
        state: state,
        clientSelection: _clientSelection,
        impact: isSnapping(state) ? state.impact : null
      });
    }

    if (action.type === 'UPDATE_DROPPABLE_SCROLL') {
      if (state.phase === 'DROP_PENDING') {
        return removeScrollJumpRequest(state);
      }

      if (state.phase === 'COLLECTING') {
        return removeScrollJumpRequest(state);
      }

      !isMovementAllowed(state) ?  invariant(false, action.type + " not permitted in phase " + state.phase)  : void 0;
      var _action$payload2 = action.payload,
          id = _action$payload2.id,
          newScroll = _action$payload2.newScroll;
      var target = state.dimensions.droppables[id];

      if (!target) {
        return state;
      }

      var scrolled = scrollDroppable(target, newScroll);
      return postDroppableChange(state, scrolled, false);
    }

    if (action.type === 'UPDATE_DROPPABLE_IS_ENABLED') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      !isMovementAllowed(state) ?  invariant(false, "Attempting to move in an unsupported phase " + state.phase)  : void 0;
      var _action$payload3 = action.payload,
          _id = _action$payload3.id,
          isEnabled = _action$payload3.isEnabled;
      var _target = state.dimensions.droppables[_id];
      !_target ?  invariant(false, "Cannot find Droppable[id: " + _id + "] to toggle its enabled state")  : void 0;
      !(_target.isEnabled !== isEnabled) ?  invariant(false, "Trying to set droppable isEnabled to " + String(isEnabled) + "\n      but it is already " + String(_target.isEnabled))  : void 0;

      var updated = _extends({}, _target, {
        isEnabled: isEnabled
      });

      return postDroppableChange(state, updated, true);
    }

    if (action.type === 'UPDATE_DROPPABLE_IS_COMBINE_ENABLED') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      !isMovementAllowed(state) ?  invariant(false, "Attempting to move in an unsupported phase " + state.phase)  : void 0;
      var _action$payload4 = action.payload,
          _id2 = _action$payload4.id,
          isCombineEnabled = _action$payload4.isCombineEnabled;
      var _target2 = state.dimensions.droppables[_id2];
      !_target2 ?  invariant(false, "Cannot find Droppable[id: " + _id2 + "] to toggle its isCombineEnabled state")  : void 0;
      !(_target2.isCombineEnabled !== isCombineEnabled) ?  invariant(false, "Trying to set droppable isCombineEnabled to " + String(isCombineEnabled) + "\n      but it is already " + String(_target2.isCombineEnabled))  : void 0;

      var _updated = _extends({}, _target2, {
        isCombineEnabled: isCombineEnabled
      });

      return postDroppableChange(state, _updated, true);
    }

    if (action.type === 'MOVE_BY_WINDOW_SCROLL') {
      if (state.phase === 'DROP_PENDING' || state.phase === 'DROP_ANIMATING') {
        return state;
      }

      !isMovementAllowed(state) ?  invariant(false, "Cannot move by window in phase " + state.phase)  : void 0;
      !state.isWindowScrollAllowed ?  invariant(false, 'Window scrolling is currently not supported for fixed lists')  : void 0;
      var _newScroll = action.payload.newScroll;

      if (isEqual(state.viewport.scroll.current, _newScroll)) {
        return removeScrollJumpRequest(state);
      }

      var _viewport = scrollViewport(state.viewport, _newScroll);

      if (isSnapping(state)) {
        return refreshSnap({
          state: state,
          viewport: _viewport
        });
      }

      return update({
        state: state,
        viewport: _viewport
      });
    }

    if (action.type === 'UPDATE_VIEWPORT_MAX_SCROLL') {
      if (!isMovementAllowed(state)) {
        return state;
      }

      var maxScroll = action.payload.maxScroll;

      if (isEqual(maxScroll, state.viewport.scroll.max)) {
        return state;
      }

      var withMaxScroll = _extends({}, state.viewport, {
        scroll: _extends({}, state.viewport.scroll, {
          max: maxScroll
        })
      });

      return _extends({
        phase: 'DRAGGING'
      }, state, {
        viewport: withMaxScroll
      });
    }

    if (action.type === 'MOVE_UP' || action.type === 'MOVE_DOWN' || action.type === 'MOVE_LEFT' || action.type === 'MOVE_RIGHT') {
      if (state.phase === 'COLLECTING' || state.phase === 'DROP_PENDING') {
        return state;
      }

      !(state.phase === 'DRAGGING') ?  invariant(false, action.type + " received while not in DRAGGING phase")  : void 0;

      var _result2 = moveInDirection({
        state: state,
        type: action.type
      });

      if (!_result2) {
        return state;
      }

      return update({
        state: state,
        impact: _result2.impact,
        clientSelection: _result2.clientSelection,
        scrollJumpRequest: _result2.scrollJumpRequest
      });
    }

    if (action.type === 'DROP_PENDING') {
      var reason = action.payload.reason;
      !(state.phase === 'COLLECTING') ?  invariant(false, 'Can only move into the DROP_PENDING phase from the COLLECTING phase')  : void 0;

      var newState = _extends({
        phase: 'DROP_PENDING'
      }, state, {
        phase: 'DROP_PENDING',
        isWaiting: true,
        reason: reason
      });

      return newState;
    }

    if (action.type === 'DROP_ANIMATE') {
      var _action$payload5 = action.payload,
          completed = _action$payload5.completed,
          dropDuration = _action$payload5.dropDuration,
          newHomeClientOffset = _action$payload5.newHomeClientOffset;
      !(state.phase === 'DRAGGING' || state.phase === 'DROP_PENDING') ?  invariant(false, "Cannot animate drop from phase " + state.phase)  : void 0;
      var _result3 = {
        phase: 'DROP_ANIMATING',
        completed: completed,
        dropDuration: dropDuration,
        newHomeClientOffset: newHomeClientOffset,
        dimensions: state.dimensions
      };
      return _result3;
    }

    if (action.type === 'DROP_COMPLETE') {
      var _completed = action.payload.completed;
      return {
        phase: 'IDLE',
        completed: _completed,
        shouldFlush: false
      };
    }

    return state;
  });

  var beforeInitialCapture = function beforeInitialCapture(args) {
    return {
      type: 'BEFORE_INITIAL_CAPTURE',
      payload: args
    };
  };
  var lift = function lift(args) {
    return {
      type: 'LIFT',
      payload: args
    };
  };
  var initialPublish = function initialPublish(args) {
    return {
      type: 'INITIAL_PUBLISH',
      payload: args
    };
  };
  var publishWhileDragging = function publishWhileDragging(args) {
    return {
      type: 'PUBLISH_WHILE_DRAGGING',
      payload: args
    };
  };
  var collectionStarting = function collectionStarting() {
    return {
      type: 'COLLECTION_STARTING',
      payload: null
    };
  };
  var updateDroppableScroll = function updateDroppableScroll(args) {
    return {
      type: 'UPDATE_DROPPABLE_SCROLL',
      payload: args
    };
  };
  var updateDroppableIsEnabled = function updateDroppableIsEnabled(args) {
    return {
      type: 'UPDATE_DROPPABLE_IS_ENABLED',
      payload: args
    };
  };
  var updateDroppableIsCombineEnabled = function updateDroppableIsCombineEnabled(args) {
    return {
      type: 'UPDATE_DROPPABLE_IS_COMBINE_ENABLED',
      payload: args
    };
  };
  var move = function move(args) {
    return {
      type: 'MOVE',
      payload: args
    };
  };
  var moveByWindowScroll = function moveByWindowScroll(args) {
    return {
      type: 'MOVE_BY_WINDOW_SCROLL',
      payload: args
    };
  };
  var updateViewportMaxScroll = function updateViewportMaxScroll(args) {
    return {
      type: 'UPDATE_VIEWPORT_MAX_SCROLL',
      payload: args
    };
  };
  var moveUp = function moveUp() {
    return {
      type: 'MOVE_UP',
      payload: null
    };
  };
  var moveDown = function moveDown() {
    return {
      type: 'MOVE_DOWN',
      payload: null
    };
  };
  var moveRight = function moveRight() {
    return {
      type: 'MOVE_RIGHT',
      payload: null
    };
  };
  var moveLeft = function moveLeft() {
    return {
      type: 'MOVE_LEFT',
      payload: null
    };
  };
  var flush = function flush() {
    return {
      type: 'FLUSH',
      payload: null
    };
  };
  var animateDrop = function animateDrop(args) {
    return {
      type: 'DROP_ANIMATE',
      payload: args
    };
  };
  var completeDrop = function completeDrop(args) {
    return {
      type: 'DROP_COMPLETE',
      payload: args
    };
  };
  var drop = function drop(args) {
    return {
      type: 'DROP',
      payload: args
    };
  };
  var dropPending = function dropPending(args) {
    return {
      type: 'DROP_PENDING',
      payload: args
    };
  };
  var dropAnimationFinished = function dropAnimationFinished() {
    return {
      type: 'DROP_ANIMATION_FINISHED',
      payload: null
    };
  };

  function checkIndexes(insideDestination) {
    if (insideDestination.length <= 1) {
      return;
    }

    var indexes = insideDestination.map(function (d) {
      return d.descriptor.index;
    });
    var errors = {};

    for (var i = 1; i < indexes.length; i++) {
      var current = indexes[i];
      var previous = indexes[i - 1];

      if (current !== previous + 1) {
        errors[current] = true;
      }
    }

    if (!Object.keys(errors).length) {
      return;
    }

    var formatted = indexes.map(function (index) {
      var hasError = Boolean(errors[index]);
      return hasError ? "[\uD83D\uDD25" + index + "]" : "" + index;
    }).join(', ');
     warning("\n    Detected non-consecutive <Draggable /> indexes.\n\n    (This can cause unexpected bugs)\n\n    " + formatted + "\n  ") ;
  }

  function validateDimensions(critical, dimensions) {
    {
      var insideDestination = getDraggablesInsideDroppable(critical.droppable.id, dimensions.draggables);
      checkIndexes(insideDestination);
    }
  }

  var lift$1 = (function (marshal) {
    return function (_ref) {
      var getState = _ref.getState,
          dispatch = _ref.dispatch;
      return function (next) {
        return function (action) {
          if (action.type !== 'LIFT') {
            next(action);
            return;
          }

          var _action$payload = action.payload,
              id = _action$payload.id,
              clientSelection = _action$payload.clientSelection,
              movementMode = _action$payload.movementMode;
          var initial = getState();

          if (initial.phase === 'DROP_ANIMATING') {
            dispatch(completeDrop({
              completed: initial.completed
            }));
          }

          !(getState().phase === 'IDLE') ?  invariant(false, 'Unexpected phase to start a drag')  : void 0;
          dispatch(flush());
          dispatch(beforeInitialCapture({
            draggableId: id,
            movementMode: movementMode
          }));
          var scrollOptions = {
            shouldPublishImmediately: movementMode === 'SNAP'
          };
          var request = {
            draggableId: id,
            scrollOptions: scrollOptions
          };

          var _marshal$startPublish = marshal.startPublishing(request),
              critical = _marshal$startPublish.critical,
              dimensions = _marshal$startPublish.dimensions,
              viewport = _marshal$startPublish.viewport;

          validateDimensions(critical, dimensions);
          dispatch(initialPublish({
            critical: critical,
            dimensions: dimensions,
            clientSelection: clientSelection,
            movementMode: movementMode,
            viewport: viewport
          }));
        };
      };
    };
  });

  var style = (function (marshal) {
    return function () {
      return function (next) {
        return function (action) {
          if (action.type === 'INITIAL_PUBLISH') {
            marshal.dragging();
          }

          if (action.type === 'DROP_ANIMATE') {
            marshal.dropping(action.payload.completed.result.reason);
          }

          if (action.type === 'FLUSH' || action.type === 'DROP_COMPLETE') {
            marshal.resting();
          }

          next(action);
        };
      };
    };
  });

  var curves = {
    outOfTheWay: 'cubic-bezier(0.2, 0, 0, 1)',
    drop: 'cubic-bezier(.2,1,.1,1)'
  };
  var combine = {
    opacity: {
      drop: 0,
      combining: 0.7
    },
    scale: {
      drop: 0.75
    }
  };
  var timings = {
    outOfTheWay: 0.2,
    minDropTime: 0.33,
    maxDropTime: 0.55
  };
  var outOfTheWayTiming = timings.outOfTheWay + "s " + curves.outOfTheWay;
  var transitions = {
    fluid: "opacity " + outOfTheWayTiming,
    snap: "transform " + outOfTheWayTiming + ", opacity " + outOfTheWayTiming,
    drop: function drop(duration) {
      var timing = duration + "s " + curves.drop;
      return "transform " + timing + ", opacity " + timing;
    },
    outOfTheWay: "transform " + outOfTheWayTiming,
    placeholder: "height " + outOfTheWayTiming + ", width " + outOfTheWayTiming + ", margin " + outOfTheWayTiming
  };

  var moveTo = function moveTo(offset) {
    return isEqual(offset, origin) ? null : "translate(" + offset.x + "px, " + offset.y + "px)";
  };

  var transforms = {
    moveTo: moveTo,
    drop: function drop(offset, isCombining) {
      var translate = moveTo(offset);

      if (!translate) {
        return null;
      }

      if (!isCombining) {
        return translate;
      }

      return translate + " scale(" + combine.scale.drop + ")";
    }
  };

  var minDropTime = timings.minDropTime,
      maxDropTime = timings.maxDropTime;
  var dropTimeRange = maxDropTime - minDropTime;
  var maxDropTimeAtDistance = 1500;
  var cancelDropModifier = 0.6;
  var getDropDuration = (function (_ref) {
    var current = _ref.current,
        destination = _ref.destination,
        reason = _ref.reason;
    var distance$1 = distance(current, destination);

    if (distance$1 <= 0) {
      return minDropTime;
    }

    if (distance$1 >= maxDropTimeAtDistance) {
      return maxDropTime;
    }

    var percentage = distance$1 / maxDropTimeAtDistance;
    var duration = minDropTime + dropTimeRange * percentage;
    var withDuration = reason === 'CANCEL' ? duration * cancelDropModifier : duration;
    return Number(withDuration.toFixed(2));
  });

  var getNewHomeClientOffset = (function (_ref) {
    var impact = _ref.impact,
        draggable = _ref.draggable,
        dimensions = _ref.dimensions,
        viewport = _ref.viewport,
        afterCritical = _ref.afterCritical;
    var draggables = dimensions.draggables,
        droppables = dimensions.droppables;
    var droppableId = whatIsDraggedOver(impact);
    var destination = droppableId ? droppables[droppableId] : null;
    var home = droppables[draggable.descriptor.droppableId];
    var newClientCenter = getClientBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      draggables: draggables,
      afterCritical: afterCritical,
      droppable: destination || home,
      viewport: viewport
    });
    var offset = subtract(newClientCenter, draggable.client.borderBox.center);
    return offset;
  });

  var getDropImpact = (function (_ref) {
    var draggables = _ref.draggables,
        reason = _ref.reason,
        lastImpact = _ref.lastImpact,
        home = _ref.home,
        viewport = _ref.viewport,
        onLiftImpact = _ref.onLiftImpact;

    if (!lastImpact.at || reason !== 'DROP') {
      var recomputedHomeImpact = recompute({
        draggables: draggables,
        impact: onLiftImpact,
        destination: home,
        viewport: viewport,
        forceShouldAnimate: true
      });
      return {
        impact: recomputedHomeImpact,
        didDropInsideDroppable: false
      };
    }

    if (lastImpact.at.type === 'REORDER') {
      return {
        impact: lastImpact,
        didDropInsideDroppable: true
      };
    }

    var withoutMovement = _extends({}, lastImpact, {
      displaced: emptyGroups
    });

    return {
      impact: withoutMovement,
      didDropInsideDroppable: true
    };
  });

  var drop$1 = (function (_ref) {
    var getState = _ref.getState,
        dispatch = _ref.dispatch;
    return function (next) {
      return function (action) {
        if (action.type !== 'DROP') {
          next(action);
          return;
        }

        var state = getState();
        var reason = action.payload.reason;

        if (state.phase === 'COLLECTING') {
          dispatch(dropPending({
            reason: reason
          }));
          return;
        }

        if (state.phase === 'IDLE') {
          return;
        }

        var isWaitingForDrop = state.phase === 'DROP_PENDING' && state.isWaiting;
        !!isWaitingForDrop ?  invariant(false, 'A DROP action occurred while DROP_PENDING and still waiting')  : void 0;
        !(state.phase === 'DRAGGING' || state.phase === 'DROP_PENDING') ?  invariant(false, "Cannot drop in phase: " + state.phase)  : void 0;
        var critical = state.critical;
        var dimensions = state.dimensions;
        var draggable = dimensions.draggables[state.critical.draggable.id];

        var _getDropImpact = getDropImpact({
          reason: reason,
          lastImpact: state.impact,
          afterCritical: state.afterCritical,
          onLiftImpact: state.onLiftImpact,
          home: state.dimensions.droppables[state.critical.droppable.id],
          viewport: state.viewport,
          draggables: state.dimensions.draggables
        }),
            impact = _getDropImpact.impact,
            didDropInsideDroppable = _getDropImpact.didDropInsideDroppable;

        var destination = didDropInsideDroppable ? tryGetDestination(impact) : null;
        var combine = didDropInsideDroppable ? tryGetCombine(impact) : null;
        var source = {
          index: critical.draggable.index,
          droppableId: critical.droppable.id
        };
        var result = {
          draggableId: draggable.descriptor.id,
          type: draggable.descriptor.type,
          source: source,
          reason: reason,
          mode: state.movementMode,
          destination: destination,
          combine: combine
        };
        var newHomeClientOffset = getNewHomeClientOffset({
          impact: impact,
          draggable: draggable,
          dimensions: dimensions,
          viewport: state.viewport,
          afterCritical: state.afterCritical
        });
        var completed = {
          critical: state.critical,
          afterCritical: state.afterCritical,
          result: result,
          impact: impact
        };
        var isAnimationRequired = !isEqual(state.current.client.offset, newHomeClientOffset) || Boolean(result.combine);

        if (!isAnimationRequired) {
          dispatch(completeDrop({
            completed: completed
          }));
          return;
        }

        var dropDuration = getDropDuration({
          current: state.current.client.offset,
          destination: newHomeClientOffset,
          reason: reason
        });
        var args = {
          newHomeClientOffset: newHomeClientOffset,
          dropDuration: dropDuration,
          completed: completed
        };
        dispatch(animateDrop(args));
      };
    };
  });

  var rafSchd = function rafSchd(fn) {
    var lastArgs = [];
    var frameId = null;

    var wrapperFn = function wrapperFn() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      lastArgs = args;

      if (frameId) {
        return;
      }

      frameId = requestAnimationFrame(function () {
        frameId = null;
        fn.apply(void 0, lastArgs);
      });
    };

    wrapperFn.cancel = function () {
      if (!frameId) {
        return;
      }

      cancelAnimationFrame(frameId);
      frameId = null;
    };

    return wrapperFn;
  };

  var getWindowScroll$1 = (function () {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  });

  function getWindowScrollBinding(update) {
    return {
      eventName: 'scroll',
      options: {
        passive: true,
        capture: false
      },
      fn: function fn(event) {
        if (event.target !== window && event.target !== window.document) {
          return;
        }

        update();
      }
    };
  }

  function getScrollListener(_ref) {
    var onWindowScroll = _ref.onWindowScroll;

    function updateScroll() {
      onWindowScroll(getWindowScroll$1());
    }

    var scheduled = rafSchd(updateScroll);
    var binding = getWindowScrollBinding(scheduled);
    var unbind = noop;

    function isActive() {
      return unbind !== noop;
    }

    function start() {
      !!isActive() ?  invariant(false, 'Cannot start scroll listener when already active')  : void 0;
      unbind = bindEvents(window, [binding]);
    }

    function stop() {
      !isActive() ?  invariant(false, 'Cannot stop scroll listener when not active')  : void 0;
      scheduled.cancel();
      unbind();
      unbind = noop;
    }

    return {
      start: start,
      stop: stop,
      isActive: isActive
    };
  }

  var shouldEnd = function shouldEnd(action) {
    return action.type === 'DROP_COMPLETE' || action.type === 'DROP_ANIMATE' || action.type === 'FLUSH';
  };

  var scrollListener = (function (store) {
    var listener = getScrollListener({
      onWindowScroll: function onWindowScroll(newScroll) {
        store.dispatch(moveByWindowScroll({
          newScroll: newScroll
        }));
      }
    });
    return function (next) {
      return function (action) {
        if (!listener.isActive() && action.type === 'INITIAL_PUBLISH') {
          listener.start();
        }

        if (listener.isActive() && shouldEnd(action)) {
          listener.stop();
        }

        next(action);
      };
    };
  });

  var getExpiringAnnounce = (function (announce) {
    var wasCalled = false;
    var isExpired = false;
    var timeoutId = setTimeout(function () {
      isExpired = true;
    });

    var result = function result(message) {
      if (wasCalled) {
         warning('Announcement already made. Not making a second announcement') ;
        return;
      }

      if (isExpired) {
         warning("\n        Announcements cannot be made asynchronously.\n        Default message has already been announced.\n      ") ;
        return;
      }

      wasCalled = true;
      announce(message);
      clearTimeout(timeoutId);
    };

    result.wasCalled = function () {
      return wasCalled;
    };

    return result;
  });

  var getAsyncMarshal = (function () {
    var entries = [];

    var execute = function execute(timerId) {
      var index = findIndex(entries, function (item) {
        return item.timerId === timerId;
      });
      !(index !== -1) ?  invariant(false, 'Could not find timer')  : void 0;

      var _entries$splice = entries.splice(index, 1),
          entry = _entries$splice[0];

      entry.callback();
    };

    var add = function add(fn) {
      var timerId = setTimeout(function () {
        return execute(timerId);
      });
      var entry = {
        timerId: timerId,
        callback: fn
      };
      entries.push(entry);
    };

    var flush = function flush() {
      if (!entries.length) {
        return;
      }

      var shallow = [].concat(entries);
      entries.length = 0;
      shallow.forEach(function (entry) {
        clearTimeout(entry.timerId);
        entry.callback();
      });
    };

    return {
      add: add,
      flush: flush
    };
  });

  var areLocationsEqual = function areLocationsEqual(first, second) {
    if (first == null && second == null) {
      return true;
    }

    if (first == null || second == null) {
      return false;
    }

    return first.droppableId === second.droppableId && first.index === second.index;
  };
  var isCombineEqual = function isCombineEqual(first, second) {
    if (first == null && second == null) {
      return true;
    }

    if (first == null || second == null) {
      return false;
    }

    return first.draggableId === second.draggableId && first.droppableId === second.droppableId;
  };
  var isCriticalEqual = function isCriticalEqual(first, second) {
    if (first === second) {
      return true;
    }

    var isDraggableEqual = first.draggable.id === second.draggable.id && first.draggable.droppableId === second.draggable.droppableId && first.draggable.type === second.draggable.type && first.draggable.index === second.draggable.index;
    var isDroppableEqual = first.droppable.id === second.droppable.id && first.droppable.type === second.droppable.type;
    return isDraggableEqual && isDroppableEqual;
  };

  var withTimings = function withTimings(key, fn) {
    fn();
  };

  var getDragStart = function getDragStart(critical, mode) {
    return {
      draggableId: critical.draggable.id,
      type: critical.droppable.type,
      source: {
        droppableId: critical.droppable.id,
        index: critical.draggable.index
      },
      mode: mode
    };
  };

  var execute = function execute(responder, data, announce, getDefaultMessage) {
    if (!responder) {
      announce(getDefaultMessage(data));
      return;
    }

    var willExpire = getExpiringAnnounce(announce);
    var provided = {
      announce: willExpire
    };
    responder(data, provided);

    if (!willExpire.wasCalled()) {
      announce(getDefaultMessage(data));
    }
  };

  var getPublisher = (function (getResponders, announce) {
    var asyncMarshal = getAsyncMarshal();
    var dragging = null;

    var beforeCapture = function beforeCapture(draggableId, mode) {
      !!dragging ?  invariant(false, 'Cannot fire onBeforeCapture as a drag start has already been published')  : void 0;
      withTimings('onBeforeCapture', function () {
        var fn = getResponders().onBeforeCapture;

        if (fn) {
          var before = {
            draggableId: draggableId,
            mode: mode
          };
          fn(before);
        }
      });
    };

    var beforeStart = function beforeStart(critical, mode) {
      !!dragging ?  invariant(false, 'Cannot fire onBeforeDragStart as a drag start has already been published')  : void 0;
      withTimings('onBeforeDragStart', function () {
        var fn = getResponders().onBeforeDragStart;

        if (fn) {
          fn(getDragStart(critical, mode));
        }
      });
    };

    var start = function start(critical, mode) {
      !!dragging ?  invariant(false, 'Cannot fire onBeforeDragStart as a drag start has already been published')  : void 0;
      var data = getDragStart(critical, mode);
      dragging = {
        mode: mode,
        lastCritical: critical,
        lastLocation: data.source,
        lastCombine: null
      };
      asyncMarshal.add(function () {
        withTimings('onDragStart', function () {
          return execute(getResponders().onDragStart, data, announce, preset.onDragStart);
        });
      });
    };

    var update = function update(critical, impact) {
      var location = tryGetDestination(impact);
      var combine = tryGetCombine(impact);
      !dragging ?  invariant(false, 'Cannot fire onDragMove when onDragStart has not been called')  : void 0;
      var hasCriticalChanged = !isCriticalEqual(critical, dragging.lastCritical);

      if (hasCriticalChanged) {
        dragging.lastCritical = critical;
      }

      var hasLocationChanged = !areLocationsEqual(dragging.lastLocation, location);

      if (hasLocationChanged) {
        dragging.lastLocation = location;
      }

      var hasGroupingChanged = !isCombineEqual(dragging.lastCombine, combine);

      if (hasGroupingChanged) {
        dragging.lastCombine = combine;
      }

      if (!hasCriticalChanged && !hasLocationChanged && !hasGroupingChanged) {
        return;
      }

      var data = _extends({}, getDragStart(critical, dragging.mode), {
        combine: combine,
        destination: location
      });

      asyncMarshal.add(function () {
        withTimings('onDragUpdate', function () {
          return execute(getResponders().onDragUpdate, data, announce, preset.onDragUpdate);
        });
      });
    };

    var flush = function flush() {
      !dragging ?  invariant(false, 'Can only flush responders while dragging')  : void 0;
      asyncMarshal.flush();
    };

    var drop = function drop(result) {
      !dragging ?  invariant(false, 'Cannot fire onDragEnd when there is no matching onDragStart')  : void 0;
      dragging = null;
      withTimings('onDragEnd', function () {
        return execute(getResponders().onDragEnd, result, announce, preset.onDragEnd);
      });
    };

    var abort = function abort() {
      if (!dragging) {
        return;
      }

      var result = _extends({}, getDragStart(dragging.lastCritical, dragging.mode), {
        combine: null,
        destination: null,
        reason: 'CANCEL'
      });

      drop(result);
    };

    return {
      beforeCapture: beforeCapture,
      beforeStart: beforeStart,
      start: start,
      update: update,
      flush: flush,
      drop: drop,
      abort: abort
    };
  });

  var responders = (function (getResponders, announce) {
    var publisher = getPublisher(getResponders, announce);
    return function (store) {
      return function (next) {
        return function (action) {
          if (action.type === 'BEFORE_INITIAL_CAPTURE') {
            publisher.beforeCapture(action.payload.draggableId, action.payload.movementMode);
            return;
          }

          if (action.type === 'INITIAL_PUBLISH') {
            var critical = action.payload.critical;
            publisher.beforeStart(critical, action.payload.movementMode);
            next(action);
            publisher.start(critical, action.payload.movementMode);
            return;
          }

          if (action.type === 'DROP_COMPLETE') {
            var result = action.payload.completed.result;
            publisher.flush();
            next(action);
            publisher.drop(result);
            return;
          }

          next(action);

          if (action.type === 'FLUSH') {
            publisher.abort();
            return;
          }

          var state = store.getState();

          if (state.phase === 'DRAGGING') {
            publisher.update(state.critical, state.impact);
          }
        };
      };
    };
  });

  var dropAnimationFinish = (function (store) {
    return function (next) {
      return function (action) {
        if (action.type !== 'DROP_ANIMATION_FINISHED') {
          next(action);
          return;
        }

        var state = store.getState();
        !(state.phase === 'DROP_ANIMATING') ?  invariant(false, 'Cannot finish a drop animating when no drop is occurring')  : void 0;
        store.dispatch(completeDrop({
          completed: state.completed
        }));
      };
    };
  });

  var dropAnimationFlushOnScroll = (function (store) {
    var unbind = null;
    var frameId = null;

    function clear() {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      if (unbind) {
        unbind();
        unbind = null;
      }
    }

    return function (next) {
      return function (action) {
        if (action.type === 'FLUSH' || action.type === 'DROP_COMPLETE' || action.type === 'DROP_ANIMATION_FINISHED') {
          clear();
        }

        next(action);

        if (action.type !== 'DROP_ANIMATE') {
          return;
        }

        var binding = {
          eventName: 'scroll',
          options: {
            capture: true,
            passive: false,
            once: true
          },
          fn: function flushDropAnimation() {
            var state = store.getState();

            if (state.phase === 'DROP_ANIMATING') {
              store.dispatch(dropAnimationFinished());
            }
          }
        };
        frameId = requestAnimationFrame(function () {
          frameId = null;
          unbind = bindEvents(window, [binding]);
        });
      };
    };
  });

  var dimensionMarshalStopper = (function (marshal) {
    return function () {
      return function (next) {
        return function (action) {
          if (action.type === 'DROP_COMPLETE' || action.type === 'FLUSH' || action.type === 'DROP_ANIMATE') {
            marshal.stopPublishing();
          }

          next(action);
        };
      };
    };
  });

  var focus = (function (marshal) {
    var isWatching = false;
    return function () {
      return function (next) {
        return function (action) {
          if (action.type === 'INITIAL_PUBLISH') {
            isWatching = true;
            marshal.tryRecordFocus(action.payload.critical.draggable.id);
            next(action);
            marshal.tryRestoreFocusRecorded();
            return;
          }

          next(action);

          if (!isWatching) {
            return;
          }

          if (action.type === 'FLUSH') {
            isWatching = false;
            marshal.tryRestoreFocusRecorded();
            return;
          }

          if (action.type === 'DROP_COMPLETE') {
            isWatching = false;
            var result = action.payload.completed.result;

            if (result.combine) {
              marshal.tryShiftRecord(result.draggableId, result.combine.draggableId);
            }

            marshal.tryRestoreFocusRecorded();
          }
        };
      };
    };
  });

  var shouldStop = function shouldStop(action) {
    return action.type === 'DROP_COMPLETE' || action.type === 'DROP_ANIMATE' || action.type === 'FLUSH';
  };

  var autoScroll = (function (autoScroller) {
    return function (store) {
      return function (next) {
        return function (action) {
          if (shouldStop(action)) {
            autoScroller.stop();
            next(action);
            return;
          }

          if (action.type === 'INITIAL_PUBLISH') {
            next(action);
            var state = store.getState();
            !(state.phase === 'DRAGGING') ?  invariant(false, 'Expected phase to be DRAGGING after INITIAL_PUBLISH')  : void 0;
            autoScroller.start(state);
            return;
          }

          next(action);
          autoScroller.scroll(store.getState());
        };
      };
    };
  });

  var pendingDrop = (function (store) {
    return function (next) {
      return function (action) {
        next(action);

        if (action.type !== 'PUBLISH_WHILE_DRAGGING') {
          return;
        }

        var postActionState = store.getState();

        if (postActionState.phase !== 'DROP_PENDING') {
          return;
        }

        if (postActionState.isWaiting) {
          return;
        }

        store.dispatch(drop({
          reason: postActionState.reason
        }));
      };
    };
  });

  var composeEnhancers =  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    name: 'react-beautiful-dnd'
  }) : compose;
  var createStore$1 = (function (_ref) {
    var dimensionMarshal = _ref.dimensionMarshal,
        focusMarshal = _ref.focusMarshal,
        styleMarshal = _ref.styleMarshal,
        getResponders = _ref.getResponders,
        announce = _ref.announce,
        autoScroller = _ref.autoScroller;
    return createStore(reducer, composeEnhancers(applyMiddleware(style(styleMarshal), dimensionMarshalStopper(dimensionMarshal), lift$1(dimensionMarshal), drop$1, dropAnimationFinish, dropAnimationFlushOnScroll, pendingDrop, autoScroll(autoScroller), scrollListener, focus(focusMarshal), responders(getResponders, announce))));
  });

  var clean$1 = function clean() {
    return {
      additions: {},
      removals: {},
      modified: {}
    };
  };
  function createPublisher(_ref) {
    var registry = _ref.registry,
        callbacks = _ref.callbacks;
    var staging = clean$1();
    var frameId = null;

    var collect = function collect() {
      if (frameId) {
        return;
      }

      callbacks.collectionStarting();
      frameId = requestAnimationFrame(function () {
        frameId = null;
        var _staging = staging,
            additions = _staging.additions,
            removals = _staging.removals,
            modified = _staging.modified;
        var added = Object.keys(additions).map(function (id) {
          return registry.draggable.getById(id).getDimension(origin);
        }).sort(function (a, b) {
          return a.descriptor.index - b.descriptor.index;
        });
        var updated = Object.keys(modified).map(function (id) {
          var entry = registry.droppable.getById(id);
          var scroll = entry.callbacks.getScrollWhileDragging();
          return {
            droppableId: id,
            scroll: scroll
          };
        });
        var result = {
          additions: added,
          removals: Object.keys(removals),
          modified: updated
        };
        staging = clean$1();
        callbacks.publish(result);
      });
    };

    var add = function add(entry) {
      var id = entry.descriptor.id;
      staging.additions[id] = entry;
      staging.modified[entry.descriptor.droppableId] = true;

      if (staging.removals[id]) {
        delete staging.removals[id];
      }

      collect();
    };

    var remove = function remove(entry) {
      var descriptor = entry.descriptor;
      staging.removals[descriptor.id] = true;
      staging.modified[descriptor.droppableId] = true;

      if (staging.additions[descriptor.id]) {
        delete staging.additions[descriptor.id];
      }

      collect();
    };

    var stop = function stop() {
      if (!frameId) {
        return;
      }

      cancelAnimationFrame(frameId);
      frameId = null;
      staging = clean$1();
    };

    return {
      add: add,
      remove: remove,
      stop: stop
    };
  }

  var getMaxScroll = (function (_ref) {
    var scrollHeight = _ref.scrollHeight,
        scrollWidth = _ref.scrollWidth,
        height = _ref.height,
        width = _ref.width;
    var maxScroll = subtract({
      x: scrollWidth,
      y: scrollHeight
    }, {
      x: width,
      y: height
    });
    var adjustedMaxScroll = {
      x: Math.max(0, maxScroll.x),
      y: Math.max(0, maxScroll.y)
    };
    return adjustedMaxScroll;
  });

  var getDocumentElement = (function () {
    var doc = document.documentElement;
    !doc ?  invariant(false, 'Cannot find document.documentElement')  : void 0;
    return doc;
  });

  var getMaxWindowScroll = (function () {
    var doc = getDocumentElement();
    var maxScroll = getMaxScroll({
      scrollHeight: doc.scrollHeight,
      scrollWidth: doc.scrollWidth,
      width: doc.clientWidth,
      height: doc.clientHeight
    });
    return maxScroll;
  });

  var getViewport = (function () {
    var scroll = getWindowScroll$1();
    var maxScroll = getMaxWindowScroll();
    var top = scroll.y;
    var left = scroll.x;
    var doc = getDocumentElement();
    var width = doc.clientWidth;
    var height = doc.clientHeight;
    var right = left + width;
    var bottom = top + height;
    var frame = getRect({
      top: top,
      left: left,
      right: right,
      bottom: bottom
    });
    var viewport = {
      frame: frame,
      scroll: {
        initial: scroll,
        current: scroll,
        max: maxScroll,
        diff: {
          value: origin,
          displacement: origin
        }
      }
    };
    return viewport;
  });

  var getInitialPublish = (function (_ref) {
    var critical = _ref.critical,
        scrollOptions = _ref.scrollOptions,
        registry = _ref.registry;
    var viewport = getViewport();
    var windowScroll = viewport.scroll.current;
    var home = critical.droppable;
    var droppables = registry.droppable.getAllByType(home.type).map(function (entry) {
      return entry.callbacks.getDimensionAndWatchScroll(windowScroll, scrollOptions);
    });
    var draggables = registry.draggable.getAllByType(critical.draggable.type).map(function (entry) {
      return entry.getDimension(windowScroll);
    });
    var dimensions = {
      draggables: toDraggableMap(draggables),
      droppables: toDroppableMap(droppables)
    };
    var result = {
      dimensions: dimensions,
      critical: critical,
      viewport: viewport
    };
    return result;
  });

  function shouldPublishUpdate(registry, dragging, entry) {
    if (entry.descriptor.id === dragging.id) {
      return false;
    }

    if (entry.descriptor.type !== dragging.type) {
      return false;
    }

    var home = registry.droppable.getById(entry.descriptor.droppableId);

    if (home.descriptor.mode !== 'virtual') {
       warning("\n      You are attempting to add or remove a Draggable [id: " + entry.descriptor.id + "]\n      while a drag is occurring. This is only supported for virtual lists.\n\n      See https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/patterns/virtual-lists.md\n    ") ;
      return false;
    }

    return true;
  }

  var createDimensionMarshal = (function (registry, callbacks) {
    var collection = null;
    var publisher = createPublisher({
      callbacks: {
        publish: callbacks.publishWhileDragging,
        collectionStarting: callbacks.collectionStarting
      },
      registry: registry
    });

    var updateDroppableIsEnabled = function updateDroppableIsEnabled(id, isEnabled) {
      !registry.droppable.exists(id) ?  invariant(false, "Cannot update is enabled flag of Droppable " + id + " as it is not registered")  : void 0;

      if (!collection) {
        return;
      }

      callbacks.updateDroppableIsEnabled({
        id: id,
        isEnabled: isEnabled
      });
    };

    var updateDroppableIsCombineEnabled = function updateDroppableIsCombineEnabled(id, isCombineEnabled) {
      if (!collection) {
        return;
      }

      !registry.droppable.exists(id) ?  invariant(false, "Cannot update isCombineEnabled flag of Droppable " + id + " as it is not registered")  : void 0;
      callbacks.updateDroppableIsCombineEnabled({
        id: id,
        isCombineEnabled: isCombineEnabled
      });
    };

    var updateDroppableScroll = function updateDroppableScroll(id, newScroll) {
      if (!collection) {
        return;
      }

      !registry.droppable.exists(id) ?  invariant(false, "Cannot update the scroll on Droppable " + id + " as it is not registered")  : void 0;
      callbacks.updateDroppableScroll({
        id: id,
        newScroll: newScroll
      });
    };

    var scrollDroppable = function scrollDroppable(id, change) {
      if (!collection) {
        return;
      }

      registry.droppable.getById(id).callbacks.scroll(change);
    };

    var stopPublishing = function stopPublishing() {
      if (!collection) {
        return;
      }

      publisher.stop();
      var home = collection.critical.droppable;
      registry.droppable.getAllByType(home.type).forEach(function (entry) {
        return entry.callbacks.dragStopped();
      });
      collection.unsubscribe();
      collection = null;
    };

    var subscriber = function subscriber(event) {
      !collection ?  invariant(false, 'Should only be subscribed when a collection is occurring')  : void 0;
      var dragging = collection.critical.draggable;

      if (event.type === 'ADDITION') {
        if (shouldPublishUpdate(registry, dragging, event.value)) {
          publisher.add(event.value);
        }
      }

      if (event.type === 'REMOVAL') {
        if (shouldPublishUpdate(registry, dragging, event.value)) {
          publisher.remove(event.value);
        }
      }
    };

    var startPublishing = function startPublishing(request) {
      !!collection ?  invariant(false, 'Cannot start capturing critical dimensions as there is already a collection')  : void 0;
      var entry = registry.draggable.getById(request.draggableId);
      var home = registry.droppable.getById(entry.descriptor.droppableId);
      var critical = {
        draggable: entry.descriptor,
        droppable: home.descriptor
      };
      var unsubscribe = registry.subscribe(subscriber);
      collection = {
        critical: critical,
        unsubscribe: unsubscribe
      };
      return getInitialPublish({
        critical: critical,
        registry: registry,
        scrollOptions: request.scrollOptions
      });
    };

    var marshal = {
      updateDroppableIsEnabled: updateDroppableIsEnabled,
      updateDroppableIsCombineEnabled: updateDroppableIsCombineEnabled,
      scrollDroppable: scrollDroppable,
      updateDroppableScroll: updateDroppableScroll,
      startPublishing: startPublishing,
      stopPublishing: stopPublishing
    };
    return marshal;
  });

  var canStartDrag = (function (state, id) {
    if (state.phase === 'IDLE') {
      return true;
    }

    if (state.phase !== 'DROP_ANIMATING') {
      return false;
    }

    if (state.completed.result.draggableId === id) {
      return false;
    }

    return state.completed.result.reason === 'DROP';
  });

  var scrollWindow = (function (change) {
    window.scrollBy(change.x, change.y);
  });

  var getScrollableDroppables = memoizeOne(function (droppables) {
    return toDroppableList(droppables).filter(function (droppable) {
      if (!droppable.isEnabled) {
        return false;
      }

      if (!droppable.frame) {
        return false;
      }

      return true;
    });
  });

  var getScrollableDroppableOver = function getScrollableDroppableOver(target, droppables) {
    var maybe = find(getScrollableDroppables(droppables), function (droppable) {
      !droppable.frame ?  invariant(false, 'Invalid result')  : void 0;
      return isPositionInFrame(droppable.frame.pageMarginBox)(target);
    });
    return maybe;
  };

  var getBestScrollableDroppable = (function (_ref) {
    var center = _ref.center,
        destination = _ref.destination,
        droppables = _ref.droppables;

    if (destination) {
      var _dimension = droppables[destination];

      if (!_dimension.frame) {
        return null;
      }

      return _dimension;
    }

    var dimension = getScrollableDroppableOver(center, droppables);
    return dimension;
  });

  var config = {
    startFromPercentage: 0.25,
    maxScrollAtPercentage: 0.05,
    maxPixelScroll: 28,
    ease: function ease(percentage) {
      return Math.pow(percentage, 2);
    },
    durationDampening: {
      stopDampeningAt: 1200,
      accelerateAt: 360
    }
  };

  var getDistanceThresholds = (function (container, axis) {
    var startScrollingFrom = container[axis.size] * config.startFromPercentage;
    var maxScrollValueAt = container[axis.size] * config.maxScrollAtPercentage;
    var thresholds = {
      startScrollingFrom: startScrollingFrom,
      maxScrollValueAt: maxScrollValueAt
    };
    return thresholds;
  });

  var getPercentage = (function (_ref) {
    var startOfRange = _ref.startOfRange,
        endOfRange = _ref.endOfRange,
        current = _ref.current;
    var range = endOfRange - startOfRange;

    if (range === 0) {
       warning("\n      Detected distance range of 0 in the fluid auto scroller\n      This is unexpected and would cause a divide by 0 issue.\n      Not allowing an auto scroll\n    ") ;
      return 0;
    }

    var currentInRange = current - startOfRange;
    var percentage = currentInRange / range;
    return percentage;
  });

  var minScroll = 1;

  var getValueFromDistance = (function (distanceToEdge, thresholds) {
    if (distanceToEdge > thresholds.startScrollingFrom) {
      return 0;
    }

    if (distanceToEdge <= thresholds.maxScrollValueAt) {
      return config.maxPixelScroll;
    }

    if (distanceToEdge === thresholds.startScrollingFrom) {
      return minScroll;
    }

    var percentageFromMaxScrollValueAt = getPercentage({
      startOfRange: thresholds.maxScrollValueAt,
      endOfRange: thresholds.startScrollingFrom,
      current: distanceToEdge
    });
    var percentageFromStartScrollingFrom = 1 - percentageFromMaxScrollValueAt;
    var scroll = config.maxPixelScroll * config.ease(percentageFromStartScrollingFrom);
    return Math.ceil(scroll);
  });

  var accelerateAt = config.durationDampening.accelerateAt;
  var stopAt = config.durationDampening.stopDampeningAt;
  var dampenValueByTime = (function (proposedScroll, dragStartTime) {
    var startOfRange = dragStartTime;
    var endOfRange = stopAt;
    var now = Date.now();
    var runTime = now - startOfRange;

    if (runTime >= stopAt) {
      return proposedScroll;
    }

    if (runTime < accelerateAt) {
      return minScroll;
    }

    var betweenAccelerateAtAndStopAtPercentage = getPercentage({
      startOfRange: accelerateAt,
      endOfRange: endOfRange,
      current: runTime
    });
    var scroll = proposedScroll * config.ease(betweenAccelerateAtAndStopAtPercentage);
    return Math.ceil(scroll);
  });

  var getValue = (function (_ref) {
    var distanceToEdge = _ref.distanceToEdge,
        thresholds = _ref.thresholds,
        dragStartTime = _ref.dragStartTime,
        shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = getValueFromDistance(distanceToEdge, thresholds);

    if (scroll === 0) {
      return 0;
    }

    if (!shouldUseTimeDampening) {
      return scroll;
    }

    return Math.max(dampenValueByTime(scroll, dragStartTime), minScroll);
  });

  var getScrollOnAxis = (function (_ref) {
    var container = _ref.container,
        distanceToEdges = _ref.distanceToEdges,
        dragStartTime = _ref.dragStartTime,
        axis = _ref.axis,
        shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var thresholds = getDistanceThresholds(container, axis);
    var isCloserToEnd = distanceToEdges[axis.end] < distanceToEdges[axis.start];

    if (isCloserToEnd) {
      return getValue({
        distanceToEdge: distanceToEdges[axis.end],
        thresholds: thresholds,
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: shouldUseTimeDampening
      });
    }

    return -1 * getValue({
      distanceToEdge: distanceToEdges[axis.start],
      thresholds: thresholds,
      dragStartTime: dragStartTime,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
  });

  var adjustForSizeLimits = (function (_ref) {
    var container = _ref.container,
        subject = _ref.subject,
        proposedScroll = _ref.proposedScroll;
    var isTooBigVertically = subject.height > container.height;
    var isTooBigHorizontally = subject.width > container.width;

    if (!isTooBigHorizontally && !isTooBigVertically) {
      return proposedScroll;
    }

    if (isTooBigHorizontally && isTooBigVertically) {
      return null;
    }

    return {
      x: isTooBigHorizontally ? 0 : proposedScroll.x,
      y: isTooBigVertically ? 0 : proposedScroll.y
    };
  });

  var clean$2 = apply(function (value) {
    return value === 0 ? 0 : value;
  });
  var getScroll = (function (_ref) {
    var dragStartTime = _ref.dragStartTime,
        container = _ref.container,
        subject = _ref.subject,
        center = _ref.center,
        shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var distanceToEdges = {
      top: center.y - container.top,
      right: container.right - center.x,
      bottom: container.bottom - center.y,
      left: center.x - container.left
    };
    var y = getScrollOnAxis({
      container: container,
      distanceToEdges: distanceToEdges,
      dragStartTime: dragStartTime,
      axis: vertical,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    var x = getScrollOnAxis({
      container: container,
      distanceToEdges: distanceToEdges,
      dragStartTime: dragStartTime,
      axis: horizontal,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    var required = clean$2({
      x: x,
      y: y
    });

    if (isEqual(required, origin)) {
      return null;
    }

    var limited = adjustForSizeLimits({
      container: container,
      subject: subject,
      proposedScroll: required
    });

    if (!limited) {
      return null;
    }

    return isEqual(limited, origin) ? null : limited;
  });

  var smallestSigned = apply(function (value) {
    if (value === 0) {
      return 0;
    }

    return value > 0 ? 1 : -1;
  });
  var getOverlap = function () {
    var getRemainder = function getRemainder(target, max) {
      if (target < 0) {
        return target;
      }

      if (target > max) {
        return target - max;
      }

      return 0;
    };

    return function (_ref) {
      var current = _ref.current,
          max = _ref.max,
          change = _ref.change;
      var targetScroll = add(current, change);
      var overlap = {
        x: getRemainder(targetScroll.x, max.x),
        y: getRemainder(targetScroll.y, max.y)
      };

      if (isEqual(overlap, origin)) {
        return null;
      }

      return overlap;
    };
  }();
  var canPartiallyScroll = function canPartiallyScroll(_ref2) {
    var rawMax = _ref2.max,
        current = _ref2.current,
        change = _ref2.change;
    var max = {
      x: Math.max(current.x, rawMax.x),
      y: Math.max(current.y, rawMax.y)
    };
    var smallestChange = smallestSigned(change);
    var overlap = getOverlap({
      max: max,
      current: current,
      change: smallestChange
    });

    if (!overlap) {
      return true;
    }

    if (smallestChange.x !== 0 && overlap.x === 0) {
      return true;
    }

    if (smallestChange.y !== 0 && overlap.y === 0) {
      return true;
    }

    return false;
  };
  var canScrollWindow = function canScrollWindow(viewport, change) {
    return canPartiallyScroll({
      current: viewport.scroll.current,
      max: viewport.scroll.max,
      change: change
    });
  };
  var getWindowOverlap = function getWindowOverlap(viewport, change) {
    if (!canScrollWindow(viewport, change)) {
      return null;
    }

    var max = viewport.scroll.max;
    var current = viewport.scroll.current;
    return getOverlap({
      current: current,
      max: max,
      change: change
    });
  };
  var canScrollDroppable = function canScrollDroppable(droppable, change) {
    var frame = droppable.frame;

    if (!frame) {
      return false;
    }

    return canPartiallyScroll({
      current: frame.scroll.current,
      max: frame.scroll.max,
      change: change
    });
  };
  var getDroppableOverlap = function getDroppableOverlap(droppable, change) {
    var frame = droppable.frame;

    if (!frame) {
      return null;
    }

    if (!canScrollDroppable(droppable, change)) {
      return null;
    }

    return getOverlap({
      current: frame.scroll.current,
      max: frame.scroll.max,
      change: change
    });
  };

  var getWindowScrollChange = (function (_ref) {
    var viewport = _ref.viewport,
        subject = _ref.subject,
        center = _ref.center,
        dragStartTime = _ref.dragStartTime,
        shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = getScroll({
      dragStartTime: dragStartTime,
      container: viewport.frame,
      subject: subject,
      center: center,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    return scroll && canScrollWindow(viewport, scroll) ? scroll : null;
  });

  var getDroppableScrollChange = (function (_ref) {
    var droppable = _ref.droppable,
        subject = _ref.subject,
        center = _ref.center,
        dragStartTime = _ref.dragStartTime,
        shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var frame = droppable.frame;

    if (!frame) {
      return null;
    }

    var scroll = getScroll({
      dragStartTime: dragStartTime,
      container: frame.pageMarginBox,
      subject: subject,
      center: center,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    return scroll && canScrollDroppable(droppable, scroll) ? scroll : null;
  });

  var scroll$1 = (function (_ref) {
    var state = _ref.state,
        dragStartTime = _ref.dragStartTime,
        shouldUseTimeDampening = _ref.shouldUseTimeDampening,
        scrollWindow = _ref.scrollWindow,
        scrollDroppable = _ref.scrollDroppable;
    var center = state.current.page.borderBoxCenter;
    var draggable = state.dimensions.draggables[state.critical.draggable.id];
    var subject = draggable.page.marginBox;

    if (state.isWindowScrollAllowed) {
      var viewport = state.viewport;

      var _change = getWindowScrollChange({
        dragStartTime: dragStartTime,
        viewport: viewport,
        subject: subject,
        center: center,
        shouldUseTimeDampening: shouldUseTimeDampening
      });

      if (_change) {
        scrollWindow(_change);
        return;
      }
    }

    var droppable = getBestScrollableDroppable({
      center: center,
      destination: whatIsDraggedOver(state.impact),
      droppables: state.dimensions.droppables
    });

    if (!droppable) {
      return;
    }

    var change = getDroppableScrollChange({
      dragStartTime: dragStartTime,
      droppable: droppable,
      subject: subject,
      center: center,
      shouldUseTimeDampening: shouldUseTimeDampening
    });

    if (change) {
      scrollDroppable(droppable.descriptor.id, change);
    }
  });

  var createFluidScroller = (function (_ref) {
    var scrollWindow = _ref.scrollWindow,
        scrollDroppable = _ref.scrollDroppable;
    var scheduleWindowScroll = rafSchd(scrollWindow);
    var scheduleDroppableScroll = rafSchd(scrollDroppable);
    var dragging = null;

    var tryScroll = function tryScroll(state) {
      !dragging ?  invariant(false, 'Cannot fluid scroll if not dragging')  : void 0;
      var _dragging = dragging,
          shouldUseTimeDampening = _dragging.shouldUseTimeDampening,
          dragStartTime = _dragging.dragStartTime;
      scroll$1({
        state: state,
        scrollWindow: scheduleWindowScroll,
        scrollDroppable: scheduleDroppableScroll,
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: shouldUseTimeDampening
      });
    };

    var start = function start(state) {
      !!dragging ?  invariant(false, 'Cannot start auto scrolling when already started')  : void 0;
      var dragStartTime = Date.now();
      var wasScrollNeeded = false;

      var fakeScrollCallback = function fakeScrollCallback() {
        wasScrollNeeded = true;
      };

      scroll$1({
        state: state,
        dragStartTime: 0,
        shouldUseTimeDampening: false,
        scrollWindow: fakeScrollCallback,
        scrollDroppable: fakeScrollCallback
      });
      dragging = {
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: wasScrollNeeded
      };

      if (wasScrollNeeded) {
        tryScroll(state);
      }
    };

    var stop = function stop() {
      if (!dragging) {
        return;
      }

      scheduleWindowScroll.cancel();
      scheduleDroppableScroll.cancel();
      dragging = null;
    };

    return {
      start: start,
      stop: stop,
      scroll: tryScroll
    };
  });

  var createJumpScroller = (function (_ref) {
    var move = _ref.move,
        scrollDroppable = _ref.scrollDroppable,
        scrollWindow = _ref.scrollWindow;

    var moveByOffset = function moveByOffset(state, offset) {
      var client = add(state.current.client.selection, offset);
      move({
        client: client
      });
    };

    var scrollDroppableAsMuchAsItCan = function scrollDroppableAsMuchAsItCan(droppable, change) {
      if (!canScrollDroppable(droppable, change)) {
        return change;
      }

      var overlap = getDroppableOverlap(droppable, change);

      if (!overlap) {
        scrollDroppable(droppable.descriptor.id, change);
        return null;
      }

      var whatTheDroppableCanScroll = subtract(change, overlap);
      scrollDroppable(droppable.descriptor.id, whatTheDroppableCanScroll);
      var remainder = subtract(change, whatTheDroppableCanScroll);
      return remainder;
    };

    var scrollWindowAsMuchAsItCan = function scrollWindowAsMuchAsItCan(isWindowScrollAllowed, viewport, change) {
      if (!isWindowScrollAllowed) {
        return change;
      }

      if (!canScrollWindow(viewport, change)) {
        return change;
      }

      var overlap = getWindowOverlap(viewport, change);

      if (!overlap) {
        scrollWindow(change);
        return null;
      }

      var whatTheWindowCanScroll = subtract(change, overlap);
      scrollWindow(whatTheWindowCanScroll);
      var remainder = subtract(change, whatTheWindowCanScroll);
      return remainder;
    };

    var jumpScroller = function jumpScroller(state) {
      var request = state.scrollJumpRequest;

      if (!request) {
        return;
      }

      var destination = whatIsDraggedOver(state.impact);
      !destination ?  invariant(false, 'Cannot perform a jump scroll when there is no destination')  : void 0;
      var droppableRemainder = scrollDroppableAsMuchAsItCan(state.dimensions.droppables[destination], request);

      if (!droppableRemainder) {
        return;
      }

      var viewport = state.viewport;
      var windowRemainder = scrollWindowAsMuchAsItCan(state.isWindowScrollAllowed, viewport, droppableRemainder);

      if (!windowRemainder) {
        return;
      }

      moveByOffset(state, windowRemainder);
    };

    return jumpScroller;
  });

  var createAutoScroller = (function (_ref) {
    var scrollDroppable = _ref.scrollDroppable,
        scrollWindow = _ref.scrollWindow,
        move = _ref.move;
    var fluidScroller = createFluidScroller({
      scrollWindow: scrollWindow,
      scrollDroppable: scrollDroppable
    });
    var jumpScroll = createJumpScroller({
      move: move,
      scrollWindow: scrollWindow,
      scrollDroppable: scrollDroppable
    });

    var scroll = function scroll(state) {
      if (state.phase !== 'DRAGGING') {
        return;
      }

      if (state.movementMode === 'FLUID') {
        fluidScroller.scroll(state);
        return;
      }

      if (!state.scrollJumpRequest) {
        return;
      }

      jumpScroll(state);
    };

    var scroller = {
      scroll: scroll,
      start: fluidScroller.start,
      stop: fluidScroller.stop
    };
    return scroller;
  });

  var prefix$2 = 'data-rbd';
  var dragHandle = function () {
    var base = prefix$2 + "-drag-handle";
    return {
      base: base,
      draggableId: base + "-draggable-id",
      contextId: base + "-context-id"
    };
  }();
  var draggable = function () {
    var base = prefix$2 + "-draggable";
    return {
      base: base,
      contextId: base + "-context-id",
      id: base + "-id"
    };
  }();
  var droppable = function () {
    var base = prefix$2 + "-droppable";
    return {
      base: base,
      contextId: base + "-context-id",
      id: base + "-id"
    };
  }();
  var scrollContainer = {
    contextId: prefix$2 + "-scroll-container-context-id"
  };

  var makeGetSelector = function makeGetSelector(context) {
    return function (attribute) {
      return "[" + attribute + "=\"" + context + "\"]";
    };
  };

  var getStyles = function getStyles(rules, property) {
    return rules.map(function (rule) {
      var value = rule.styles[property];

      if (!value) {
        return '';
      }

      return rule.selector + " { " + value + " }";
    }).join(' ');
  };

  var noPointerEvents = 'pointer-events: none;';
  var getStyles$1 = (function (contextId) {
    var getSelector = makeGetSelector(contextId);

    var dragHandle$1 = function () {
      var grabCursor = "\n      cursor: -webkit-grab;\n      cursor: grab;\n    ";
      return {
        selector: getSelector(dragHandle.contextId),
        styles: {
          always: "\n          -webkit-touch-callout: none;\n          -webkit-tap-highlight-color: rgba(0,0,0,0);\n          touch-action: manipulation;\n        ",
          resting: grabCursor,
          dragging: noPointerEvents,
          dropAnimating: grabCursor
        }
      };
    }();

    var draggable$1 = function () {
      var transition = "\n      transition: " + transitions.outOfTheWay + ";\n    ";
      return {
        selector: getSelector(draggable.contextId),
        styles: {
          dragging: transition,
          dropAnimating: transition,
          userCancel: transition
        }
      };
    }();

    var droppable$1 = {
      selector: getSelector(droppable.contextId),
      styles: {
        always: "overflow-anchor: none;"
      }
    };
    var body = {
      selector: 'body',
      styles: {
        dragging: "\n        cursor: grabbing;\n        cursor: -webkit-grabbing;\n        user-select: none;\n        -webkit-user-select: none;\n        -moz-user-select: none;\n        -ms-user-select: none;\n        overflow-anchor: none;\n      "
      }
    };
    var rules = [draggable$1, dragHandle$1, droppable$1, body];
    return {
      always: getStyles(rules, 'always'),
      resting: getStyles(rules, 'resting'),
      dragging: getStyles(rules, 'dragging'),
      dropAnimating: getStyles(rules, 'dropAnimating'),
      userCancel: getStyles(rules, 'userCancel')
    };
  });

  var useIsomorphicLayoutEffect$1 = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  var getHead = function getHead() {
    var head = document.querySelector('head');
    !head ?  invariant(false, 'Cannot find the head to append a style to')  : void 0;
    return head;
  };

  var createStyleEl = function createStyleEl(nonce) {
    var el = document.createElement('style');

    if (nonce) {
      el.setAttribute('nonce', nonce);
    }

    el.type = 'text/css';
    return el;
  };

  function useStyleMarshal(contextId, nonce) {
    var styles = useMemo(function () {
      return getStyles$1(contextId);
    }, [contextId]);
    var alwaysRef = React.useRef(null);
    var dynamicRef = React.useRef(null);
    var setDynamicStyle = useCallback(memoizeOne(function (proposed) {
      var el = dynamicRef.current;
      !el ?  invariant(false, 'Cannot set dynamic style element if it is not set')  : void 0;
      el.textContent = proposed;
    }), []);
    var setAlwaysStyle = useCallback(function (proposed) {
      var el = alwaysRef.current;
      !el ?  invariant(false, 'Cannot set dynamic style element if it is not set')  : void 0;
      el.textContent = proposed;
    }, []);
    useIsomorphicLayoutEffect$1(function () {
      !(!alwaysRef.current && !dynamicRef.current) ?  invariant(false, 'style elements already mounted')  : void 0;
      var always = createStyleEl(nonce);
      var dynamic = createStyleEl(nonce);
      alwaysRef.current = always;
      dynamicRef.current = dynamic;
      always.setAttribute(prefix$2 + "-always", contextId);
      dynamic.setAttribute(prefix$2 + "-dynamic", contextId);
      getHead().appendChild(always);
      getHead().appendChild(dynamic);
      setAlwaysStyle(styles.always);
      setDynamicStyle(styles.resting);
      return function () {
        var remove = function remove(ref) {
          var current = ref.current;
          !current ?  invariant(false, 'Cannot unmount ref as it is not set')  : void 0;

          if (getHead().contains(current)) {
            getHead().removeChild(current);
          }

          ref.current = null;
        };

        remove(alwaysRef);
        remove(dynamicRef);
      };
    }, [nonce, setAlwaysStyle, setDynamicStyle, styles.always, styles.resting, contextId]);
    var dragging = useCallback(function () {
      return setDynamicStyle(styles.dragging);
    }, [setDynamicStyle, styles.dragging]);
    var dropping = useCallback(function (reason) {
      if (reason === 'DROP') {
        setDynamicStyle(styles.dropAnimating);
        return;
      }

      setDynamicStyle(styles.userCancel);
    }, [setDynamicStyle, styles.dropAnimating, styles.userCancel]);
    var resting = useCallback(function () {
      if (!dynamicRef.current) {
        return;
      }

      setDynamicStyle(styles.resting);
    }, [setDynamicStyle, styles.resting]);
    var marshal = useMemo(function () {
      return {
        dragging: dragging,
        dropping: dropping,
        resting: resting
      };
    }, [dragging, dropping, resting]);
    return marshal;
  }

  var getWindowFromEl = (function (el) {
    return el && el.ownerDocument ? el.ownerDocument.defaultView : window;
  });

  function isHtmlElement(el) {
    return el instanceof getWindowFromEl(el).HTMLElement;
  }

  function findDragHandle(contextId, draggableId) {
    var selector = "[" + dragHandle.contextId + "=\"" + contextId + "\"]";
    var possible = toArray(document.querySelectorAll(selector));

    if (!possible.length) {
       warning("Unable to find any drag handles in the context \"" + contextId + "\"") ;
      return null;
    }

    var handle = find(possible, function (el) {
      return el.getAttribute(dragHandle.draggableId) === draggableId;
    });

    if (!handle) {
       warning("Unable to find drag handle with id \"" + draggableId + "\" as no handle with a matching id was found") ;
      return null;
    }

    if (!isHtmlElement(handle)) {
       warning('drag handle needs to be a HTMLElement') ;
      return null;
    }

    return handle;
  }

  function useFocusMarshal(contextId) {
    var entriesRef = React.useRef({});
    var recordRef = React.useRef(null);
    var restoreFocusFrameRef = React.useRef(null);
    var isMountedRef = React.useRef(false);
    var register = useCallback(function register(id, focus) {
      var entry = {
        id: id,
        focus: focus
      };
      entriesRef.current[id] = entry;
      return function unregister() {
        var entries = entriesRef.current;
        var current = entries[id];

        if (current !== entry) {
          delete entries[id];
        }
      };
    }, []);
    var tryGiveFocus = useCallback(function tryGiveFocus(tryGiveFocusTo) {
      var handle = findDragHandle(contextId, tryGiveFocusTo);

      if (handle && handle !== document.activeElement) {
        handle.focus();
      }
    }, [contextId]);
    var tryShiftRecord = useCallback(function tryShiftRecord(previous, redirectTo) {
      if (recordRef.current === previous) {
        recordRef.current = redirectTo;
      }
    }, []);
    var tryRestoreFocusRecorded = useCallback(function tryRestoreFocusRecorded() {
      if (restoreFocusFrameRef.current) {
        return;
      }

      if (!isMountedRef.current) {
        return;
      }

      restoreFocusFrameRef.current = requestAnimationFrame(function () {
        restoreFocusFrameRef.current = null;
        var record = recordRef.current;

        if (record) {
          tryGiveFocus(record);
        }
      });
    }, [tryGiveFocus]);
    var tryRecordFocus = useCallback(function tryRecordFocus(id) {
      recordRef.current = null;
      var focused = document.activeElement;

      if (!focused) {
        return;
      }

      if (focused.getAttribute(dragHandle.draggableId) !== id) {
        return;
      }

      recordRef.current = id;
    }, []);
    useIsomorphicLayoutEffect$1(function () {
      isMountedRef.current = true;
      return function clearFrameOnUnmount() {
        isMountedRef.current = false;
        var frameId = restoreFocusFrameRef.current;

        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    }, []);
    var marshal = useMemo(function () {
      return {
        register: register,
        tryRecordFocus: tryRecordFocus,
        tryRestoreFocusRecorded: tryRestoreFocusRecorded,
        tryShiftRecord: tryShiftRecord
      };
    }, [register, tryRecordFocus, tryRestoreFocusRecorded, tryShiftRecord]);
    return marshal;
  }

  function createRegistry() {
    var entries = {
      draggables: {},
      droppables: {}
    };
    var subscribers = [];

    function subscribe(cb) {
      subscribers.push(cb);
      return function unsubscribe() {
        var index = subscribers.indexOf(cb);

        if (index === -1) {
          return;
        }

        subscribers.splice(index, 1);
      };
    }

    function notify(event) {
      if (subscribers.length) {
        subscribers.forEach(function (cb) {
          return cb(event);
        });
      }
    }

    function findDraggableById(id) {
      return entries.draggables[id] || null;
    }

    function getDraggableById(id) {
      var entry = findDraggableById(id);
      !entry ?  invariant(false, "Cannot find draggable entry with id [" + id + "]")  : void 0;
      return entry;
    }

    var draggableAPI = {
      register: function register(entry) {
        entries.draggables[entry.descriptor.id] = entry;
        notify({
          type: 'ADDITION',
          value: entry
        });
      },
      update: function update(entry, last) {
        var current = entries.draggables[last.descriptor.id];

        if (!current) {
          return;
        }

        if (current.uniqueId !== entry.uniqueId) {
          return;
        }

        delete entries.draggables[last.descriptor.id];
        entries.draggables[entry.descriptor.id] = entry;
      },
      unregister: function unregister(entry) {
        var draggableId = entry.descriptor.id;
        var current = findDraggableById(draggableId);

        if (!current) {
          return;
        }

        if (entry.uniqueId !== current.uniqueId) {
          return;
        }

        delete entries.draggables[draggableId];
        notify({
          type: 'REMOVAL',
          value: entry
        });
      },
      getById: getDraggableById,
      findById: findDraggableById,
      exists: function exists(id) {
        return Boolean(findDraggableById(id));
      },
      getAllByType: function getAllByType(type) {
        return values(entries.draggables).filter(function (entry) {
          return entry.descriptor.type === type;
        });
      }
    };

    function findDroppableById(id) {
      return entries.droppables[id] || null;
    }

    function getDroppableById(id) {
      var entry = findDroppableById(id);
      !entry ?  invariant(false, "Cannot find droppable entry with id [" + id + "]")  : void 0;
      return entry;
    }

    var droppableAPI = {
      register: function register(entry) {
        entries.droppables[entry.descriptor.id] = entry;
      },
      unregister: function unregister(entry) {
        var current = findDroppableById(entry.descriptor.id);

        if (!current) {
          return;
        }

        if (entry.uniqueId !== current.uniqueId) {
          return;
        }

        delete entries.droppables[entry.descriptor.id];
      },
      getById: getDroppableById,
      findById: findDroppableById,
      exists: function exists(id) {
        return Boolean(findDroppableById(id));
      },
      getAllByType: function getAllByType(type) {
        return values(entries.droppables).filter(function (entry) {
          return entry.descriptor.type === type;
        });
      }
    };

    function clean() {
      entries.draggables = {};
      entries.droppables = {};
      subscribers.length = 0;
    }

    return {
      draggable: draggableAPI,
      droppable: droppableAPI,
      subscribe: subscribe,
      clean: clean
    };
  }

  function useRegistry() {
    var registry = useMemo(createRegistry, []);
    React.useEffect(function () {
      return function unmount() {
        requestAnimationFrame(registry.clean);
      };
    }, [registry]);
    return registry;
  }

  var StoreContext = React__default.createContext(null);

  var getBodyElement = (function () {
    var body = document.body;
    !body ?  invariant(false, 'Cannot find document.body')  : void 0;
    return body;
  });

  var visuallyHidden = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    border: '0',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    'clip-path': 'inset(100%)'
  };

  var getId = function getId(contextId) {
    return "rbd-announcement-" + contextId;
  };
  function useAnnouncer(contextId) {
    var id = useMemo(function () {
      return getId(contextId);
    }, [contextId]);
    var ref = React.useRef(null);
    React.useEffect(function setup() {
      var el = document.createElement('div');
      ref.current = el;
      el.id = id;
      el.setAttribute('aria-live', 'assertive');
      el.setAttribute('aria-atomic', 'true');

      _extends(el.style, visuallyHidden);

      getBodyElement().appendChild(el);
      return function cleanup() {
        setTimeout(function remove() {
          var body = getBodyElement();

          if (body.contains(el)) {
            body.removeChild(el);
          }

          if (el === ref.current) {
            ref.current = null;
          }
        });
      };
    }, [id]);
    var announce = useCallback(function (message) {
      var el = ref.current;

      if (el) {
        el.textContent = message;
        return;
      }

       warning("\n      A screen reader message was trying to be announced but it was unable to do so.\n      This can occur if you unmount your <DragDropContext /> in your onDragEnd.\n      Consider calling provided.announce() before the unmount so that the instruction will\n      not be lost for users relying on a screen reader.\n\n      Message not passed to screen reader:\n\n      \"" + message + "\"\n    ") ;
    }, []);
    return announce;
  }

  var count = 0;
  var defaults = {
    separator: '::'
  };
  function reset() {
    count = 0;
  }
  function useUniqueId(prefix, options) {
    if (options === void 0) {
      options = defaults;
    }

    return useMemo(function () {
      return "" + prefix + options.separator + count++;
    }, [options.separator, prefix]);
  }

  function getElementId(_ref) {
    var contextId = _ref.contextId,
        uniqueId = _ref.uniqueId;
    return "rbd-hidden-text-" + contextId + "-" + uniqueId;
  }
  function useHiddenTextElement(_ref2) {
    var contextId = _ref2.contextId,
        text = _ref2.text;
    var uniqueId = useUniqueId('hidden-text', {
      separator: '-'
    });
    var id = useMemo(function () {
      return getElementId({
        contextId: contextId,
        uniqueId: uniqueId
      });
    }, [uniqueId, contextId]);
    React.useEffect(function mount() {
      var el = document.createElement('div');
      el.id = id;
      el.textContent = text;
      el.style.display = 'none';
      getBodyElement().appendChild(el);
      return function unmount() {
        var body = getBodyElement();

        if (body.contains(el)) {
          body.removeChild(el);
        }
      };
    }, [id, text]);
    return id;
  }

  var AppContext = React__default.createContext(null);

  var peerDependencies = {
  	react: "^16.8.5 || ^17.0.0 || ^18.0.0",
  	"react-dom": "^16.8.5 || ^17.0.0 || ^18.0.0"
  };

  var semver = /(\d+)\.(\d+)\.(\d+)/;

  var getVersion = function getVersion(value) {
    var result = semver.exec(value);
    !(result != null) ?  invariant(false, "Unable to parse React version " + value)  : void 0;
    var major = Number(result[1]);
    var minor = Number(result[2]);
    var patch = Number(result[3]);
    return {
      major: major,
      minor: minor,
      patch: patch,
      raw: value
    };
  };

  var isSatisfied = function isSatisfied(expected, actual) {
    if (actual.major > expected.major) {
      return true;
    }

    if (actual.major < expected.major) {
      return false;
    }

    if (actual.minor > expected.minor) {
      return true;
    }

    if (actual.minor < expected.minor) {
      return false;
    }

    return actual.patch >= expected.patch;
  };

  var checkReactVersion = (function (peerDepValue, actualValue) {
    var peerDep = getVersion(peerDepValue);
    var actual = getVersion(actualValue);

    if (isSatisfied(peerDep, actual)) {
      return;
    }

     warning("\n    React version: [" + actual.raw + "]\n    does not satisfy expected peer dependency version: [" + peerDep.raw + "]\n\n    This can result in run time bugs, and even fatal crashes\n  ") ;
  });

  var suffix = "\n  We expect a html5 doctype: <!doctype html>\n  This is to ensure consistent browser layout and measurement\n\n  More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/doctype.md\n";
  var checkDoctype = (function (doc) {
    var doctype = doc.doctype;

    if (!doctype) {
       warning("\n      No <!doctype html> found.\n\n      " + suffix + "\n    ") ;
      return;
    }

    if (doctype.name.toLowerCase() !== 'html') {
       warning("\n      Unexpected <!doctype> found: (" + doctype.name + ")\n\n      " + suffix + "\n    ") ;
    }

    if (doctype.publicId !== '') {
       warning("\n      Unexpected <!doctype> publicId found: (" + doctype.publicId + ")\n      A html5 doctype does not have a publicId\n\n      " + suffix + "\n    ") ;
    }
  });

  function useDev(useHook) {
    {
      useHook();
    }
  }

  function useDevSetupWarning(fn, inputs) {
    useDev(function () {
      React.useEffect(function () {
        try {
          fn();
        } catch (e) {
          error("\n          A setup problem was encountered.\n\n          > " + e.message + "\n        ");
        }
      }, inputs);
    });
  }

  function useStartupValidation() {
    useDevSetupWarning(function () {
      checkReactVersion(peerDependencies.react, React__default.version);
      checkDoctype(document);
    }, []);
  }

  function usePrevious(current) {
    var ref = React.useRef(current);
    React.useEffect(function () {
      ref.current = current;
    });
    return ref;
  }

  function create() {
    var lock = null;

    function isClaimed() {
      return Boolean(lock);
    }

    function isActive(value) {
      return value === lock;
    }

    function claim(abandon) {
      !!lock ?  invariant(false, 'Cannot claim lock as it is already claimed')  : void 0;
      var newLock = {
        abandon: abandon
      };
      lock = newLock;
      return newLock;
    }

    function release() {
      !lock ?  invariant(false, 'Cannot release lock when there is no lock')  : void 0;
      lock = null;
    }

    function tryAbandon() {
      if (lock) {
        lock.abandon();
        release();
      }
    }

    return {
      isClaimed: isClaimed,
      isActive: isActive,
      claim: claim,
      release: release,
      tryAbandon: tryAbandon
    };
  }

  var tab = 9;
  var enter = 13;
  var escape = 27;
  var space = 32;
  var pageUp = 33;
  var pageDown = 34;
  var end = 35;
  var home = 36;
  var arrowLeft = 37;
  var arrowUp = 38;
  var arrowRight = 39;
  var arrowDown = 40;

  var _preventedKeys;
  var preventedKeys = (_preventedKeys = {}, _preventedKeys[enter] = true, _preventedKeys[tab] = true, _preventedKeys);
  var preventStandardKeyEvents = (function (event) {
    if (preventedKeys[event.keyCode]) {
      event.preventDefault();
    }
  });

  var supportedEventName = function () {
    var base = 'visibilitychange';

    if (typeof document === 'undefined') {
      return base;
    }

    var candidates = [base, "ms" + base, "webkit" + base, "moz" + base, "o" + base];
    var supported = find(candidates, function (eventName) {
      return "on" + eventName in document;
    });
    return supported || base;
  }();

  var primaryButton = 0;
  var sloppyClickThreshold = 5;

  function isSloppyClickThresholdExceeded(original, current) {
    return Math.abs(current.x - original.x) >= sloppyClickThreshold || Math.abs(current.y - original.y) >= sloppyClickThreshold;
  }

  var idle$1 = {
    type: 'IDLE'
  };

  function getCaptureBindings(_ref) {
    var cancel = _ref.cancel,
        completed = _ref.completed,
        getPhase = _ref.getPhase,
        setPhase = _ref.setPhase;
    return [{
      eventName: 'mousemove',
      fn: function fn(event) {
        var button = event.button,
            clientX = event.clientX,
            clientY = event.clientY;

        if (button !== primaryButton) {
          return;
        }

        var point = {
          x: clientX,
          y: clientY
        };
        var phase = getPhase();

        if (phase.type === 'DRAGGING') {
          event.preventDefault();
          phase.actions.move(point);
          return;
        }

        !(phase.type === 'PENDING') ?  invariant(false, 'Cannot be IDLE')  : void 0;
        var pending = phase.point;

        if (!isSloppyClickThresholdExceeded(pending, point)) {
          return;
        }

        event.preventDefault();
        var actions = phase.actions.fluidLift(point);
        setPhase({
          type: 'DRAGGING',
          actions: actions
        });
      }
    }, {
      eventName: 'mouseup',
      fn: function fn(event) {
        var phase = getPhase();

        if (phase.type !== 'DRAGGING') {
          cancel();
          return;
        }

        event.preventDefault();
        phase.actions.drop({
          shouldBlockNextClick: true
        });
        completed();
      }
    }, {
      eventName: 'mousedown',
      fn: function fn(event) {
        if (getPhase().type === 'DRAGGING') {
          event.preventDefault();
        }

        cancel();
      }
    }, {
      eventName: 'keydown',
      fn: function fn(event) {
        var phase = getPhase();

        if (phase.type === 'PENDING') {
          cancel();
          return;
        }

        if (event.keyCode === escape) {
          event.preventDefault();
          cancel();
          return;
        }

        preventStandardKeyEvents(event);
      }
    }, {
      eventName: 'resize',
      fn: cancel
    }, {
      eventName: 'scroll',
      options: {
        passive: true,
        capture: false
      },
      fn: function fn() {
        if (getPhase().type === 'PENDING') {
          cancel();
        }
      }
    }, {
      eventName: 'webkitmouseforcedown',
      fn: function fn(event) {
        var phase = getPhase();
        !(phase.type !== 'IDLE') ?  invariant(false, 'Unexpected phase')  : void 0;

        if (phase.actions.shouldRespectForcePress()) {
          cancel();
          return;
        }

        event.preventDefault();
      }
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];
  }

  function useMouseSensor(api) {
    var phaseRef = React.useRef(idle$1);
    var unbindEventsRef = React.useRef(noop);
    var startCaptureBinding = useMemo(function () {
      return {
        eventName: 'mousedown',
        fn: function onMouseDown(event) {
          if (event.defaultPrevented) {
            return;
          }

          if (event.button !== primaryButton) {
            return;
          }

          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
          }

          var draggableId = api.findClosestDraggableId(event);

          if (!draggableId) {
            return;
          }

          var actions = api.tryGetLock(draggableId, stop, {
            sourceEvent: event
          });

          if (!actions) {
            return;
          }

          event.preventDefault();
          var point = {
            x: event.clientX,
            y: event.clientY
          };
          unbindEventsRef.current();
          startPendingDrag(actions, point);
        }
      };
    }, [api]);
    var preventForcePressBinding = useMemo(function () {
      return {
        eventName: 'webkitmouseforcewillbegin',
        fn: function fn(event) {
          if (event.defaultPrevented) {
            return;
          }

          var id = api.findClosestDraggableId(event);

          if (!id) {
            return;
          }

          var options = api.findOptionsForDraggable(id);

          if (!options) {
            return;
          }

          if (options.shouldRespectForcePress) {
            return;
          }

          if (!api.canGetLock(id)) {
            return;
          }

          event.preventDefault();
        }
      };
    }, [api]);
    var listenForCapture = useCallback(function listenForCapture() {
      var options = {
        passive: false,
        capture: true
      };
      unbindEventsRef.current = bindEvents(window, [preventForcePressBinding, startCaptureBinding], options);
    }, [preventForcePressBinding, startCaptureBinding]);
    var stop = useCallback(function () {
      var current = phaseRef.current;

      if (current.type === 'IDLE') {
        return;
      }

      phaseRef.current = idle$1;
      unbindEventsRef.current();
      listenForCapture();
    }, [listenForCapture]);
    var cancel = useCallback(function () {
      var phase = phaseRef.current;
      stop();

      if (phase.type === 'DRAGGING') {
        phase.actions.cancel({
          shouldBlockNextClick: true
        });
      }

      if (phase.type === 'PENDING') {
        phase.actions.abort();
      }
    }, [stop]);
    var bindCapturingEvents = useCallback(function bindCapturingEvents() {
      var options = {
        capture: true,
        passive: false
      };
      var bindings = getCaptureBindings({
        cancel: cancel,
        completed: stop,
        getPhase: function getPhase() {
          return phaseRef.current;
        },
        setPhase: function setPhase(phase) {
          phaseRef.current = phase;
        }
      });
      unbindEventsRef.current = bindEvents(window, bindings, options);
    }, [cancel, stop]);
    var startPendingDrag = useCallback(function startPendingDrag(actions, point) {
      !(phaseRef.current.type === 'IDLE') ?  invariant(false, 'Expected to move from IDLE to PENDING drag')  : void 0;
      phaseRef.current = {
        type: 'PENDING',
        point: point,
        actions: actions
      };
      bindCapturingEvents();
    }, [bindCapturingEvents]);
    useIsomorphicLayoutEffect$1(function mount() {
      listenForCapture();
      return function unmount() {
        unbindEventsRef.current();
      };
    }, [listenForCapture]);
  }

  var _scrollJumpKeys;

  function noop$1() {}

  var scrollJumpKeys = (_scrollJumpKeys = {}, _scrollJumpKeys[pageDown] = true, _scrollJumpKeys[pageUp] = true, _scrollJumpKeys[home] = true, _scrollJumpKeys[end] = true, _scrollJumpKeys);

  function getDraggingBindings(actions, stop) {
    function cancel() {
      stop();
      actions.cancel();
    }

    function drop() {
      stop();
      actions.drop();
    }

    return [{
      eventName: 'keydown',
      fn: function fn(event) {
        if (event.keyCode === escape) {
          event.preventDefault();
          cancel();
          return;
        }

        if (event.keyCode === space) {
          event.preventDefault();
          drop();
          return;
        }

        if (event.keyCode === arrowDown) {
          event.preventDefault();
          actions.moveDown();
          return;
        }

        if (event.keyCode === arrowUp) {
          event.preventDefault();
          actions.moveUp();
          return;
        }

        if (event.keyCode === arrowRight) {
          event.preventDefault();
          actions.moveRight();
          return;
        }

        if (event.keyCode === arrowLeft) {
          event.preventDefault();
          actions.moveLeft();
          return;
        }

        if (scrollJumpKeys[event.keyCode]) {
          event.preventDefault();
          return;
        }

        preventStandardKeyEvents(event);
      }
    }, {
      eventName: 'mousedown',
      fn: cancel
    }, {
      eventName: 'mouseup',
      fn: cancel
    }, {
      eventName: 'click',
      fn: cancel
    }, {
      eventName: 'touchstart',
      fn: cancel
    }, {
      eventName: 'resize',
      fn: cancel
    }, {
      eventName: 'wheel',
      fn: cancel,
      options: {
        passive: true
      }
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];
  }

  function useKeyboardSensor(api) {
    var unbindEventsRef = React.useRef(noop$1);
    var startCaptureBinding = useMemo(function () {
      return {
        eventName: 'keydown',
        fn: function onKeyDown(event) {
          if (event.defaultPrevented) {
            return;
          }

          if (event.keyCode !== space) {
            return;
          }

          var draggableId = api.findClosestDraggableId(event);

          if (!draggableId) {
            return;
          }

          var preDrag = api.tryGetLock(draggableId, stop, {
            sourceEvent: event
          });

          if (!preDrag) {
            return;
          }

          event.preventDefault();
          var isCapturing = true;
          var actions = preDrag.snapLift();
          unbindEventsRef.current();

          function stop() {
            !isCapturing ?  invariant(false, 'Cannot stop capturing a keyboard drag when not capturing')  : void 0;
            isCapturing = false;
            unbindEventsRef.current();
            listenForCapture();
          }

          unbindEventsRef.current = bindEvents(window, getDraggingBindings(actions, stop), {
            capture: true,
            passive: false
          });
        }
      };
    }, [api]);
    var listenForCapture = useCallback(function tryStartCapture() {
      var options = {
        passive: false,
        capture: true
      };
      unbindEventsRef.current = bindEvents(window, [startCaptureBinding], options);
    }, [startCaptureBinding]);
    useIsomorphicLayoutEffect$1(function mount() {
      listenForCapture();
      return function unmount() {
        unbindEventsRef.current();
      };
    }, [listenForCapture]);
  }

  var idle$2 = {
    type: 'IDLE'
  };
  var timeForLongPress = 120;
  var forcePressThreshold = 0.15;

  function getWindowBindings(_ref) {
    var cancel = _ref.cancel,
        getPhase = _ref.getPhase;
    return [{
      eventName: 'orientationchange',
      fn: cancel
    }, {
      eventName: 'resize',
      fn: cancel
    }, {
      eventName: 'contextmenu',
      fn: function fn(event) {
        event.preventDefault();
      }
    }, {
      eventName: 'keydown',
      fn: function fn(event) {
        if (getPhase().type !== 'DRAGGING') {
          cancel();
          return;
        }

        if (event.keyCode === escape) {
          event.preventDefault();
        }

        cancel();
      }
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];
  }

  function getHandleBindings(_ref2) {
    var cancel = _ref2.cancel,
        completed = _ref2.completed,
        getPhase = _ref2.getPhase;
    return [{
      eventName: 'touchmove',
      options: {
        capture: false
      },
      fn: function fn(event) {
        var phase = getPhase();

        if (phase.type !== 'DRAGGING') {
          cancel();
          return;
        }

        phase.hasMoved = true;
        var _event$touches$ = event.touches[0],
            clientX = _event$touches$.clientX,
            clientY = _event$touches$.clientY;
        var point = {
          x: clientX,
          y: clientY
        };
        event.preventDefault();
        phase.actions.move(point);
      }
    }, {
      eventName: 'touchend',
      fn: function fn(event) {
        var phase = getPhase();

        if (phase.type !== 'DRAGGING') {
          cancel();
          return;
        }

        event.preventDefault();
        phase.actions.drop({
          shouldBlockNextClick: true
        });
        completed();
      }
    }, {
      eventName: 'touchcancel',
      fn: function fn(event) {
        if (getPhase().type !== 'DRAGGING') {
          cancel();
          return;
        }

        event.preventDefault();
        cancel();
      }
    }, {
      eventName: 'touchforcechange',
      fn: function fn(event) {
        var phase = getPhase();
        !(phase.type !== 'IDLE') ?  invariant(false)  : void 0;
        var touch = event.touches[0];

        if (!touch) {
          return;
        }

        var isForcePress = touch.force >= forcePressThreshold;

        if (!isForcePress) {
          return;
        }

        var shouldRespect = phase.actions.shouldRespectForcePress();

        if (phase.type === 'PENDING') {
          if (shouldRespect) {
            cancel();
          }

          return;
        }

        if (shouldRespect) {
          if (phase.hasMoved) {
            event.preventDefault();
            return;
          }

          cancel();
          return;
        }

        event.preventDefault();
      }
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];
  }

  function useTouchSensor(api) {
    var phaseRef = React.useRef(idle$2);
    var unbindEventsRef = React.useRef(noop);
    var getPhase = useCallback(function getPhase() {
      return phaseRef.current;
    }, []);
    var setPhase = useCallback(function setPhase(phase) {
      phaseRef.current = phase;
    }, []);
    var startCaptureBinding = useMemo(function () {
      return {
        eventName: 'touchstart',
        fn: function onTouchStart(event) {
          if (event.defaultPrevented) {
            return;
          }

          var draggableId = api.findClosestDraggableId(event);

          if (!draggableId) {
            return;
          }

          var actions = api.tryGetLock(draggableId, stop, {
            sourceEvent: event
          });

          if (!actions) {
            return;
          }

          var touch = event.touches[0];
          var clientX = touch.clientX,
              clientY = touch.clientY;
          var point = {
            x: clientX,
            y: clientY
          };
          unbindEventsRef.current();
          startPendingDrag(actions, point);
        }
      };
    }, [api]);
    var listenForCapture = useCallback(function listenForCapture() {
      var options = {
        capture: true,
        passive: false
      };
      unbindEventsRef.current = bindEvents(window, [startCaptureBinding], options);
    }, [startCaptureBinding]);
    var stop = useCallback(function () {
      var current = phaseRef.current;

      if (current.type === 'IDLE') {
        return;
      }

      if (current.type === 'PENDING') {
        clearTimeout(current.longPressTimerId);
      }

      setPhase(idle$2);
      unbindEventsRef.current();
      listenForCapture();
    }, [listenForCapture, setPhase]);
    var cancel = useCallback(function () {
      var phase = phaseRef.current;
      stop();

      if (phase.type === 'DRAGGING') {
        phase.actions.cancel({
          shouldBlockNextClick: true
        });
      }

      if (phase.type === 'PENDING') {
        phase.actions.abort();
      }
    }, [stop]);
    var bindCapturingEvents = useCallback(function bindCapturingEvents() {
      var options = {
        capture: true,
        passive: false
      };
      var args = {
        cancel: cancel,
        completed: stop,
        getPhase: getPhase
      };
      var unbindTarget = bindEvents(window, getHandleBindings(args), options);
      var unbindWindow = bindEvents(window, getWindowBindings(args), options);

      unbindEventsRef.current = function unbindAll() {
        unbindTarget();
        unbindWindow();
      };
    }, [cancel, getPhase, stop]);
    var startDragging = useCallback(function startDragging() {
      var phase = getPhase();
      !(phase.type === 'PENDING') ?  invariant(false, "Cannot start dragging from phase " + phase.type)  : void 0;
      var actions = phase.actions.fluidLift(phase.point);
      setPhase({
        type: 'DRAGGING',
        actions: actions,
        hasMoved: false
      });
    }, [getPhase, setPhase]);
    var startPendingDrag = useCallback(function startPendingDrag(actions, point) {
      !(getPhase().type === 'IDLE') ?  invariant(false, 'Expected to move from IDLE to PENDING drag')  : void 0;
      var longPressTimerId = setTimeout(startDragging, timeForLongPress);
      setPhase({
        type: 'PENDING',
        point: point,
        actions: actions,
        longPressTimerId: longPressTimerId
      });
      bindCapturingEvents();
    }, [bindCapturingEvents, getPhase, setPhase, startDragging]);
    useIsomorphicLayoutEffect$1(function mount() {
      listenForCapture();
      return function unmount() {
        unbindEventsRef.current();
        var phase = getPhase();

        if (phase.type === 'PENDING') {
          clearTimeout(phase.longPressTimerId);
          setPhase(idle$2);
        }
      };
    }, [getPhase, listenForCapture, setPhase]);
    useIsomorphicLayoutEffect$1(function webkitHack() {
      var unbind = bindEvents(window, [{
        eventName: 'touchmove',
        fn: function fn() {},
        options: {
          capture: false,
          passive: false
        }
      }]);
      return unbind;
    }, []);
  }

  function useValidateSensorHooks(sensorHooks) {
    useDev(function () {
      var previousRef = usePrevious(sensorHooks);
      useDevSetupWarning(function () {
        !(previousRef.current.length === sensorHooks.length) ? "development" !== "production" ? invariant(false, 'Cannot change the amount of sensor hooks after mounting') : invariant(false) : void 0;
      });
    });
  }

  var interactiveTagNames = {
    input: true,
    button: true,
    textarea: true,
    select: true,
    option: true,
    optgroup: true,
    video: true,
    audio: true
  };

  function isAnInteractiveElement(parent, current) {
    if (current == null) {
      return false;
    }

    var hasAnInteractiveTag = Boolean(interactiveTagNames[current.tagName.toLowerCase()]);

    if (hasAnInteractiveTag) {
      return true;
    }

    var attribute = current.getAttribute('contenteditable');

    if (attribute === 'true' || attribute === '') {
      return true;
    }

    if (current === parent) {
      return false;
    }

    return isAnInteractiveElement(parent, current.parentElement);
  }

  function isEventInInteractiveElement(draggable, event) {
    var target = event.target;

    if (!isHtmlElement(target)) {
      return false;
    }

    return isAnInteractiveElement(draggable, target);
  }

  var getBorderBoxCenterPosition = (function (el) {
    return getRect(el.getBoundingClientRect()).center;
  });

  function isElement(el) {
    return el instanceof getWindowFromEl(el).Element;
  }

  var supportedMatchesName = function () {
    var base = 'matches';

    if (typeof document === 'undefined') {
      return base;
    }

    var candidates = [base, 'msMatchesSelector', 'webkitMatchesSelector'];
    var value = find(candidates, function (name) {
      return name in Element.prototype;
    });
    return value || base;
  }();

  function closestPonyfill(el, selector) {
    if (el == null) {
      return null;
    }

    if (el[supportedMatchesName](selector)) {
      return el;
    }

    return closestPonyfill(el.parentElement, selector);
  }

  function closest$1(el, selector) {
    if (el.closest) {
      return el.closest(selector);
    }

    return closestPonyfill(el, selector);
  }

  function getSelector(contextId) {
    return "[" + dragHandle.contextId + "=\"" + contextId + "\"]";
  }

  function findClosestDragHandleFromEvent(contextId, event) {
    var target = event.target;

    if (!isElement(target)) {
       warning('event.target must be a Element') ;
      return null;
    }

    var selector = getSelector(contextId);
    var handle = closest$1(target, selector);

    if (!handle) {
      return null;
    }

    if (!isHtmlElement(handle)) {
       warning('drag handle must be a HTMLElement') ;
      return null;
    }

    return handle;
  }

  function tryGetClosestDraggableIdFromEvent(contextId, event) {
    var handle = findClosestDragHandleFromEvent(contextId, event);

    if (!handle) {
      return null;
    }

    return handle.getAttribute(dragHandle.draggableId);
  }

  function findDraggable(contextId, draggableId) {
    var selector = "[" + draggable.contextId + "=\"" + contextId + "\"]";
    var possible = toArray(document.querySelectorAll(selector));
    var draggable$1 = find(possible, function (el) {
      return el.getAttribute(draggable.id) === draggableId;
    });

    if (!draggable$1) {
      return null;
    }

    if (!isHtmlElement(draggable$1)) {
       warning('Draggable element is not a HTMLElement') ;
      return null;
    }

    return draggable$1;
  }

  function preventDefault(event) {
    event.preventDefault();
  }

  function _isActive(_ref) {
    var expected = _ref.expected,
        phase = _ref.phase,
        isLockActive = _ref.isLockActive,
        shouldWarn = _ref.shouldWarn;

    if (!isLockActive()) {
      if (shouldWarn) {
         warning("\n        Cannot perform action.\n        The sensor no longer has an action lock.\n\n        Tips:\n\n        - Throw away your action handlers when forceStop() is called\n        - Check actions.isActive() if you really need to\n      ") ;
      }

      return false;
    }

    if (expected !== phase) {
      if (shouldWarn) {
         warning("\n        Cannot perform action.\n        The actions you used belong to an outdated phase\n\n        Current phase: " + expected + "\n        You called an action from outdated phase: " + phase + "\n\n        Tips:\n\n        - Do not use preDragActions actions after calling preDragActions.lift()\n      ") ;
      }

      return false;
    }

    return true;
  }

  function canStart(_ref2) {
    var lockAPI = _ref2.lockAPI,
        store = _ref2.store,
        registry = _ref2.registry,
        draggableId = _ref2.draggableId;

    if (lockAPI.isClaimed()) {
      return false;
    }

    var entry = registry.draggable.findById(draggableId);

    if (!entry) {
       warning("Unable to find draggable with id: " + draggableId) ;
      return false;
    }

    if (!entry.options.isEnabled) {
      return false;
    }

    if (!canStartDrag(store.getState(), draggableId)) {
      return false;
    }

    return true;
  }

  function tryStart(_ref3) {
    var lockAPI = _ref3.lockAPI,
        contextId = _ref3.contextId,
        store = _ref3.store,
        registry = _ref3.registry,
        draggableId = _ref3.draggableId,
        forceSensorStop = _ref3.forceSensorStop,
        sourceEvent = _ref3.sourceEvent;
    var shouldStart = canStart({
      lockAPI: lockAPI,
      store: store,
      registry: registry,
      draggableId: draggableId
    });

    if (!shouldStart) {
      return null;
    }

    var entry = registry.draggable.getById(draggableId);
    var el = findDraggable(contextId, entry.descriptor.id);

    if (!el) {
       warning("Unable to find draggable element with id: " + draggableId) ;
      return null;
    }

    if (sourceEvent && !entry.options.canDragInteractiveElements && isEventInInteractiveElement(el, sourceEvent)) {
      return null;
    }

    var lock = lockAPI.claim(forceSensorStop || noop);
    var phase = 'PRE_DRAG';

    function getShouldRespectForcePress() {
      return entry.options.shouldRespectForcePress;
    }

    function isLockActive() {
      return lockAPI.isActive(lock);
    }

    function tryDispatch(expected, getAction) {
      if (_isActive({
        expected: expected,
        phase: phase,
        isLockActive: isLockActive,
        shouldWarn: true
      })) {
        store.dispatch(getAction());
      }
    }

    var tryDispatchWhenDragging = tryDispatch.bind(null, 'DRAGGING');

    function lift$1(args) {
      function completed() {
        lockAPI.release();
        phase = 'COMPLETED';
      }

      if (phase !== 'PRE_DRAG') {
        completed();
        !(phase === 'PRE_DRAG') ?  invariant(false, "Cannot lift in phase " + phase)  : void 0;
      }

      store.dispatch(lift(args.liftActionArgs));
      phase = 'DRAGGING';

      function finish(reason, options) {
        if (options === void 0) {
          options = {
            shouldBlockNextClick: false
          };
        }

        args.cleanup();

        if (options.shouldBlockNextClick) {
          var unbind = bindEvents(window, [{
            eventName: 'click',
            fn: preventDefault,
            options: {
              once: true,
              passive: false,
              capture: true
            }
          }]);
          setTimeout(unbind);
        }

        completed();
        store.dispatch(drop({
          reason: reason
        }));
      }

      return _extends({
        isActive: function isActive() {
          return _isActive({
            expected: 'DRAGGING',
            phase: phase,
            isLockActive: isLockActive,
            shouldWarn: false
          });
        },
        shouldRespectForcePress: getShouldRespectForcePress,
        drop: function drop(options) {
          return finish('DROP', options);
        },
        cancel: function cancel(options) {
          return finish('CANCEL', options);
        }
      }, args.actions);
    }

    function fluidLift(clientSelection) {
      var move$1 = rafSchd(function (client) {
        tryDispatchWhenDragging(function () {
          return move({
            client: client
          });
        });
      });
      var api = lift$1({
        liftActionArgs: {
          id: draggableId,
          clientSelection: clientSelection,
          movementMode: 'FLUID'
        },
        cleanup: function cleanup() {
          return move$1.cancel();
        },
        actions: {
          move: move$1
        }
      });
      return _extends({}, api, {
        move: move$1
      });
    }

    function snapLift() {
      var actions = {
        moveUp: function moveUp$1() {
          return tryDispatchWhenDragging(moveUp);
        },
        moveRight: function moveRight$1() {
          return tryDispatchWhenDragging(moveRight);
        },
        moveDown: function moveDown$1() {
          return tryDispatchWhenDragging(moveDown);
        },
        moveLeft: function moveLeft$1() {
          return tryDispatchWhenDragging(moveLeft);
        }
      };
      return lift$1({
        liftActionArgs: {
          id: draggableId,
          clientSelection: getBorderBoxCenterPosition(el),
          movementMode: 'SNAP'
        },
        cleanup: noop,
        actions: actions
      });
    }

    function abortPreDrag() {
      var shouldRelease = _isActive({
        expected: 'PRE_DRAG',
        phase: phase,
        isLockActive: isLockActive,
        shouldWarn: true
      });

      if (shouldRelease) {
        lockAPI.release();
      }
    }

    var preDrag = {
      isActive: function isActive() {
        return _isActive({
          expected: 'PRE_DRAG',
          phase: phase,
          isLockActive: isLockActive,
          shouldWarn: false
        });
      },
      shouldRespectForcePress: getShouldRespectForcePress,
      fluidLift: fluidLift,
      snapLift: snapLift,
      abort: abortPreDrag
    };
    return preDrag;
  }

  var defaultSensors = [useMouseSensor, useKeyboardSensor, useTouchSensor];
  function useSensorMarshal(_ref4) {
    var contextId = _ref4.contextId,
        store = _ref4.store,
        registry = _ref4.registry,
        customSensors = _ref4.customSensors,
        enableDefaultSensors = _ref4.enableDefaultSensors;
    var useSensors = [].concat(enableDefaultSensors ? defaultSensors : [], customSensors || []);
    var lockAPI = React.useState(function () {
      return create();
    })[0];
    var tryAbandonLock = useCallback(function tryAbandonLock(previous, current) {
      if (previous.isDragging && !current.isDragging) {
        lockAPI.tryAbandon();
      }
    }, [lockAPI]);
    useIsomorphicLayoutEffect$1(function listenToStore() {
      var previous = store.getState();
      var unsubscribe = store.subscribe(function () {
        var current = store.getState();
        tryAbandonLock(previous, current);
        previous = current;
      });
      return unsubscribe;
    }, [lockAPI, store, tryAbandonLock]);
    useIsomorphicLayoutEffect$1(function () {
      return lockAPI.tryAbandon;
    }, [lockAPI.tryAbandon]);
    var canGetLock = useCallback(function (draggableId) {
      return canStart({
        lockAPI: lockAPI,
        registry: registry,
        store: store,
        draggableId: draggableId
      });
    }, [lockAPI, registry, store]);
    var tryGetLock = useCallback(function (draggableId, forceStop, options) {
      return tryStart({
        lockAPI: lockAPI,
        registry: registry,
        contextId: contextId,
        store: store,
        draggableId: draggableId,
        forceSensorStop: forceStop,
        sourceEvent: options && options.sourceEvent ? options.sourceEvent : null
      });
    }, [contextId, lockAPI, registry, store]);
    var findClosestDraggableId = useCallback(function (event) {
      return tryGetClosestDraggableIdFromEvent(contextId, event);
    }, [contextId]);
    var findOptionsForDraggable = useCallback(function (id) {
      var entry = registry.draggable.findById(id);
      return entry ? entry.options : null;
    }, [registry.draggable]);
    var tryReleaseLock = useCallback(function tryReleaseLock() {
      if (!lockAPI.isClaimed()) {
        return;
      }

      lockAPI.tryAbandon();

      if (store.getState().phase !== 'IDLE') {
        store.dispatch(flush());
      }
    }, [lockAPI, store]);
    var isLockClaimed = useCallback(lockAPI.isClaimed, [lockAPI]);
    var api = useMemo(function () {
      return {
        canGetLock: canGetLock,
        tryGetLock: tryGetLock,
        findClosestDraggableId: findClosestDraggableId,
        findOptionsForDraggable: findOptionsForDraggable,
        tryReleaseLock: tryReleaseLock,
        isLockClaimed: isLockClaimed
      };
    }, [canGetLock, tryGetLock, findClosestDraggableId, findOptionsForDraggable, tryReleaseLock, isLockClaimed]);
    useValidateSensorHooks(useSensors);

    for (var i = 0; i < useSensors.length; i++) {
      useSensors[i](api);
    }
  }

  var createResponders = function createResponders(props) {
    return {
      onBeforeCapture: props.onBeforeCapture,
      onBeforeDragStart: props.onBeforeDragStart,
      onDragStart: props.onDragStart,
      onDragEnd: props.onDragEnd,
      onDragUpdate: props.onDragUpdate
    };
  };

  function getStore(lazyRef) {
    !lazyRef.current ?  invariant(false, 'Could not find store from lazy ref')  : void 0;
    return lazyRef.current;
  }

  function App(props) {
    var contextId = props.contextId,
        setCallbacks = props.setCallbacks,
        sensors = props.sensors,
        nonce = props.nonce,
        dragHandleUsageInstructions = props.dragHandleUsageInstructions;
    var lazyStoreRef = React.useRef(null);
    useStartupValidation();
    var lastPropsRef = usePrevious(props);
    var getResponders = useCallback(function () {
      return createResponders(lastPropsRef.current);
    }, [lastPropsRef]);
    var announce = useAnnouncer(contextId);
    var dragHandleUsageInstructionsId = useHiddenTextElement({
      contextId: contextId,
      text: dragHandleUsageInstructions
    });
    var styleMarshal = useStyleMarshal(contextId, nonce);
    var lazyDispatch = useCallback(function (action) {
      getStore(lazyStoreRef).dispatch(action);
    }, []);
    var marshalCallbacks = useMemo(function () {
      return bindActionCreators({
        publishWhileDragging: publishWhileDragging,
        updateDroppableScroll: updateDroppableScroll,
        updateDroppableIsEnabled: updateDroppableIsEnabled,
        updateDroppableIsCombineEnabled: updateDroppableIsCombineEnabled,
        collectionStarting: collectionStarting
      }, lazyDispatch);
    }, [lazyDispatch]);
    var registry = useRegistry();
    var dimensionMarshal = useMemo(function () {
      return createDimensionMarshal(registry, marshalCallbacks);
    }, [registry, marshalCallbacks]);
    var autoScroller = useMemo(function () {
      return createAutoScroller(_extends({
        scrollWindow: scrollWindow,
        scrollDroppable: dimensionMarshal.scrollDroppable
      }, bindActionCreators({
        move: move
      }, lazyDispatch)));
    }, [dimensionMarshal.scrollDroppable, lazyDispatch]);
    var focusMarshal = useFocusMarshal(contextId);
    var store = useMemo(function () {
      return createStore$1({
        announce: announce,
        autoScroller: autoScroller,
        dimensionMarshal: dimensionMarshal,
        focusMarshal: focusMarshal,
        getResponders: getResponders,
        styleMarshal: styleMarshal
      });
    }, [announce, autoScroller, dimensionMarshal, focusMarshal, getResponders, styleMarshal]);

    {
      if (lazyStoreRef.current && lazyStoreRef.current !== store) {
         warning('unexpected store change') ;
      }
    }

    lazyStoreRef.current = store;
    var tryResetStore = useCallback(function () {
      var current = getStore(lazyStoreRef);
      var state = current.getState();

      if (state.phase !== 'IDLE') {
        current.dispatch(flush());
      }
    }, []);
    var isDragging = useCallback(function () {
      var state = getStore(lazyStoreRef).getState();
      return state.isDragging || state.phase === 'DROP_ANIMATING';
    }, []);
    var appCallbacks = useMemo(function () {
      return {
        isDragging: isDragging,
        tryAbort: tryResetStore
      };
    }, [isDragging, tryResetStore]);
    setCallbacks(appCallbacks);
    var getCanLift = useCallback(function (id) {
      return canStartDrag(getStore(lazyStoreRef).getState(), id);
    }, []);
    var getIsMovementAllowed = useCallback(function () {
      return isMovementAllowed(getStore(lazyStoreRef).getState());
    }, []);
    var appContext = useMemo(function () {
      return {
        marshal: dimensionMarshal,
        focus: focusMarshal,
        contextId: contextId,
        canLift: getCanLift,
        isMovementAllowed: getIsMovementAllowed,
        dragHandleUsageInstructionsId: dragHandleUsageInstructionsId,
        registry: registry
      };
    }, [contextId, dimensionMarshal, dragHandleUsageInstructionsId, focusMarshal, getCanLift, getIsMovementAllowed, registry]);
    useSensorMarshal({
      contextId: contextId,
      store: store,
      registry: registry,
      customSensors: sensors,
      enableDefaultSensors: props.enableDefaultSensors !== false
    });
    React.useEffect(function () {
      return tryResetStore;
    }, [tryResetStore]);
    return React__default.createElement(AppContext.Provider, {
      value: appContext
    }, React__default.createElement(Provider, {
      context: StoreContext,
      store: store
    }, props.children));
  }

  var count$1 = 0;
  function reset$1() {
    count$1 = 0;
  }
  function useInstanceCount() {
    return useMemo(function () {
      return "" + count$1++;
    }, []);
  }

  function resetServerContext() {
    reset$1();
    reset();
  }
  function DragDropContext(props) {
    var contextId = useInstanceCount();
    var dragHandleUsageInstructions = props.dragHandleUsageInstructions || preset.dragHandleUsageInstructions;
    return React__default.createElement(ErrorBoundary, null, function (setCallbacks) {
      return React__default.createElement(App, {
        nonce: props.nonce,
        contextId: contextId,
        setCallbacks: setCallbacks,
        dragHandleUsageInstructions: dragHandleUsageInstructions,
        enableDefaultSensors: props.enableDefaultSensors,
        sensors: props.sensors,
        onBeforeCapture: props.onBeforeCapture,
        onBeforeDragStart: props.onBeforeDragStart,
        onDragStart: props.onDragStart,
        onDragUpdate: props.onDragUpdate,
        onDragEnd: props.onDragEnd
      }, props.children);
    });
  }

  var isEqual$1 = function isEqual(base) {
    return function (value) {
      return base === value;
    };
  };

  var isScroll = isEqual$1('scroll');
  var isAuto = isEqual$1('auto');
  var isOverlay = isEqual$1('overlay');
  var isVisible$1 = isEqual$1('visible');

  var isEither = function isEither(overflow, fn) {
    return fn(overflow.overflowX) || fn(overflow.overflowY);
  };

  var isBoth = function isBoth(overflow, fn) {
    return fn(overflow.overflowX) && fn(overflow.overflowY);
  };

  var isElementScrollable = function isElementScrollable(el) {
    var style = window.getComputedStyle(el);
    var overflow = {
      overflowX: style.overflowX,
      overflowY: style.overflowY
    };
    return isEither(overflow, isScroll) || isEither(overflow, isAuto) || isEither(overflow, isOverlay);
  };

  var isBodyScrollable = function isBodyScrollable() {

    var body = getBodyElement();
    var html = document.documentElement;
    !html ?  invariant(false)  : void 0;

    if (!isElementScrollable(body)) {
      return false;
    }

    var htmlStyle = window.getComputedStyle(html);
    var htmlOverflow = {
      overflowX: htmlStyle.overflowX,
      overflowY: htmlStyle.overflowY
    };

    if (isBoth(htmlOverflow, isVisible$1)) {
      return false;
    }

     warning("\n    We have detected that your <body> element might be a scroll container.\n    We have found no reliable way of detecting whether the <body> element is a scroll container.\n    Under most circumstances a <body> scroll bar will be on the <html> element (document.documentElement)\n\n    Because we cannot determine if the <body> is a scroll container, and generally it is not one,\n    we will be treating the <body> as *not* a scroll container\n\n    More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/how-we-detect-scroll-containers.md\n  ") ;
    return false;
  };

  var getClosestScrollable = function getClosestScrollable(el) {
    if (el == null) {
      return null;
    }

    if (el === document.body) {
      return isBodyScrollable() ? el : null;
    }

    if (el === document.documentElement) {
      return null;
    }

    if (!isElementScrollable(el)) {
      return getClosestScrollable(el.parentElement);
    }

    return el;
  };

  var checkForNestedScrollContainers = (function (scrollable) {
    if (!scrollable) {
      return;
    }

    var anotherScrollParent = getClosestScrollable(scrollable.parentElement);

    if (!anotherScrollParent) {
      return;
    }

     warning("\n    Droppable: unsupported nested scroll container detected.\n    A Droppable can only have one scroll parent (which can be itself)\n    Nested scroll containers are currently not supported.\n\n    We hope to support nested scroll containers soon: https://github.com/atlassian/react-beautiful-dnd/issues/131\n  ") ;
  });

  var getScroll$1 = (function (el) {
    return {
      x: el.scrollLeft,
      y: el.scrollTop
    };
  });

  var getIsFixed = function getIsFixed(el) {
    if (!el) {
      return false;
    }

    var style = window.getComputedStyle(el);

    if (style.position === 'fixed') {
      return true;
    }

    return getIsFixed(el.parentElement);
  };

  var getEnv = (function (start) {
    var closestScrollable = getClosestScrollable(start);
    var isFixedOnPage = getIsFixed(start);
    return {
      closestScrollable: closestScrollable,
      isFixedOnPage: isFixedOnPage
    };
  });

  var getDroppableDimension = (function (_ref) {
    var descriptor = _ref.descriptor,
        isEnabled = _ref.isEnabled,
        isCombineEnabled = _ref.isCombineEnabled,
        isFixedOnPage = _ref.isFixedOnPage,
        direction = _ref.direction,
        client = _ref.client,
        page = _ref.page,
        closest = _ref.closest;

    var frame = function () {
      if (!closest) {
        return null;
      }

      var scrollSize = closest.scrollSize,
          frameClient = closest.client;
      var maxScroll = getMaxScroll({
        scrollHeight: scrollSize.scrollHeight,
        scrollWidth: scrollSize.scrollWidth,
        height: frameClient.paddingBox.height,
        width: frameClient.paddingBox.width
      });
      return {
        pageMarginBox: closest.page.marginBox,
        frameClient: frameClient,
        scrollSize: scrollSize,
        shouldClipSubject: closest.shouldClipSubject,
        scroll: {
          initial: closest.scroll,
          current: closest.scroll,
          max: maxScroll,
          diff: {
            value: origin,
            displacement: origin
          }
        }
      };
    }();

    var axis = direction === 'vertical' ? vertical : horizontal;
    var subject = getSubject({
      page: page,
      withPlaceholder: null,
      axis: axis,
      frame: frame
    });
    var dimension = {
      descriptor: descriptor,
      isCombineEnabled: isCombineEnabled,
      isFixedOnPage: isFixedOnPage,
      axis: axis,
      isEnabled: isEnabled,
      client: client,
      page: page,
      frame: frame,
      subject: subject
    };
    return dimension;
  });

  var getClient = function getClient(targetRef, closestScrollable) {
    var base = getBox(targetRef);

    if (!closestScrollable) {
      return base;
    }

    if (targetRef !== closestScrollable) {
      return base;
    }

    var top = base.paddingBox.top - closestScrollable.scrollTop;
    var left = base.paddingBox.left - closestScrollable.scrollLeft;
    var bottom = top + closestScrollable.scrollHeight;
    var right = left + closestScrollable.scrollWidth;
    var paddingBox = {
      top: top,
      right: right,
      bottom: bottom,
      left: left
    };
    var borderBox = expand(paddingBox, base.border);
    var client = createBox({
      borderBox: borderBox,
      margin: base.margin,
      border: base.border,
      padding: base.padding
    });
    return client;
  };

  var getDimension = (function (_ref) {
    var ref = _ref.ref,
        descriptor = _ref.descriptor,
        env = _ref.env,
        windowScroll = _ref.windowScroll,
        direction = _ref.direction,
        isDropDisabled = _ref.isDropDisabled,
        isCombineEnabled = _ref.isCombineEnabled,
        shouldClipSubject = _ref.shouldClipSubject;
    var closestScrollable = env.closestScrollable;
    var client = getClient(ref, closestScrollable);
    var page = withScroll(client, windowScroll);

    var closest = function () {
      if (!closestScrollable) {
        return null;
      }

      var frameClient = getBox(closestScrollable);
      var scrollSize = {
        scrollHeight: closestScrollable.scrollHeight,
        scrollWidth: closestScrollable.scrollWidth
      };
      return {
        client: frameClient,
        page: withScroll(frameClient, windowScroll),
        scroll: getScroll$1(closestScrollable),
        scrollSize: scrollSize,
        shouldClipSubject: shouldClipSubject
      };
    }();

    var dimension = getDroppableDimension({
      descriptor: descriptor,
      isEnabled: !isDropDisabled,
      isCombineEnabled: isCombineEnabled,
      isFixedOnPage: env.isFixedOnPage,
      direction: direction,
      client: client,
      page: page,
      closest: closest
    });
    return dimension;
  });

  var immediate = {
    passive: false
  };
  var delayed = {
    passive: true
  };
  var getListenerOptions = (function (options) {
    return options.shouldPublishImmediately ? immediate : delayed;
  });

  function useRequiredContext(Context) {
    var result = React.useContext(Context);
    !result ?  invariant(false, 'Could not find required context')  : void 0;
    return result;
  }

  var getClosestScrollableFromDrag = function getClosestScrollableFromDrag(dragging) {
    return dragging && dragging.env.closestScrollable || null;
  };

  function useDroppablePublisher(args) {
    var whileDraggingRef = React.useRef(null);
    var appContext = useRequiredContext(AppContext);
    var uniqueId = useUniqueId('droppable');
    var registry = appContext.registry,
        marshal = appContext.marshal;
    var previousRef = usePrevious(args);
    var descriptor = useMemo(function () {
      return {
        id: args.droppableId,
        type: args.type,
        mode: args.mode
      };
    }, [args.droppableId, args.mode, args.type]);
    var publishedDescriptorRef = React.useRef(descriptor);
    var memoizedUpdateScroll = useMemo(function () {
      return memoizeOne(function (x, y) {
        !whileDraggingRef.current ?  invariant(false, 'Can only update scroll when dragging')  : void 0;
        var scroll = {
          x: x,
          y: y
        };
        marshal.updateDroppableScroll(descriptor.id, scroll);
      });
    }, [descriptor.id, marshal]);
    var getClosestScroll = useCallback(function () {
      var dragging = whileDraggingRef.current;

      if (!dragging || !dragging.env.closestScrollable) {
        return origin;
      }

      return getScroll$1(dragging.env.closestScrollable);
    }, []);
    var updateScroll = useCallback(function () {
      var scroll = getClosestScroll();
      memoizedUpdateScroll(scroll.x, scroll.y);
    }, [getClosestScroll, memoizedUpdateScroll]);
    var scheduleScrollUpdate = useMemo(function () {
      return rafSchd(updateScroll);
    }, [updateScroll]);
    var onClosestScroll = useCallback(function () {
      var dragging = whileDraggingRef.current;
      var closest = getClosestScrollableFromDrag(dragging);
      !(dragging && closest) ?  invariant(false, 'Could not find scroll options while scrolling')  : void 0;
      var options = dragging.scrollOptions;

      if (options.shouldPublishImmediately) {
        updateScroll();
        return;
      }

      scheduleScrollUpdate();
    }, [scheduleScrollUpdate, updateScroll]);
    var getDimensionAndWatchScroll = useCallback(function (windowScroll, options) {
      !!whileDraggingRef.current ?  invariant(false, 'Cannot collect a droppable while a drag is occurring')  : void 0;
      var previous = previousRef.current;
      var ref = previous.getDroppableRef();
      !ref ?  invariant(false, 'Cannot collect without a droppable ref')  : void 0;
      var env = getEnv(ref);
      var dragging = {
        ref: ref,
        descriptor: descriptor,
        env: env,
        scrollOptions: options
      };
      whileDraggingRef.current = dragging;
      var dimension = getDimension({
        ref: ref,
        descriptor: descriptor,
        env: env,
        windowScroll: windowScroll,
        direction: previous.direction,
        isDropDisabled: previous.isDropDisabled,
        isCombineEnabled: previous.isCombineEnabled,
        shouldClipSubject: !previous.ignoreContainerClipping
      });
      var scrollable = env.closestScrollable;

      if (scrollable) {
        scrollable.setAttribute(scrollContainer.contextId, appContext.contextId);
        scrollable.addEventListener('scroll', onClosestScroll, getListenerOptions(dragging.scrollOptions));

        {
          checkForNestedScrollContainers(scrollable);
        }
      }

      return dimension;
    }, [appContext.contextId, descriptor, onClosestScroll, previousRef]);
    var getScrollWhileDragging = useCallback(function () {
      var dragging = whileDraggingRef.current;
      var closest = getClosestScrollableFromDrag(dragging);
      !(dragging && closest) ?  invariant(false, 'Can only recollect Droppable client for Droppables that have a scroll container')  : void 0;
      return getScroll$1(closest);
    }, []);
    var dragStopped = useCallback(function () {
      var dragging = whileDraggingRef.current;
      !dragging ?  invariant(false, 'Cannot stop drag when no active drag')  : void 0;
      var closest = getClosestScrollableFromDrag(dragging);
      whileDraggingRef.current = null;

      if (!closest) {
        return;
      }

      scheduleScrollUpdate.cancel();
      closest.removeAttribute(scrollContainer.contextId);
      closest.removeEventListener('scroll', onClosestScroll, getListenerOptions(dragging.scrollOptions));
    }, [onClosestScroll, scheduleScrollUpdate]);
    var scroll = useCallback(function (change) {
      var dragging = whileDraggingRef.current;
      !dragging ?  invariant(false, 'Cannot scroll when there is no drag')  : void 0;
      var closest = getClosestScrollableFromDrag(dragging);
      !closest ?  invariant(false, 'Cannot scroll a droppable with no closest scrollable')  : void 0;
      closest.scrollTop += change.y;
      closest.scrollLeft += change.x;
    }, []);
    var callbacks = useMemo(function () {
      return {
        getDimensionAndWatchScroll: getDimensionAndWatchScroll,
        getScrollWhileDragging: getScrollWhileDragging,
        dragStopped: dragStopped,
        scroll: scroll
      };
    }, [dragStopped, getDimensionAndWatchScroll, getScrollWhileDragging, scroll]);
    var entry = useMemo(function () {
      return {
        uniqueId: uniqueId,
        descriptor: descriptor,
        callbacks: callbacks
      };
    }, [callbacks, descriptor, uniqueId]);
    useIsomorphicLayoutEffect$1(function () {
      publishedDescriptorRef.current = entry.descriptor;
      registry.droppable.register(entry);
      return function () {
        if (whileDraggingRef.current) {
           warning('Unsupported: changing the droppableId or type of a Droppable during a drag') ;
          dragStopped();
        }

        registry.droppable.unregister(entry);
      };
    }, [callbacks, descriptor, dragStopped, entry, marshal, registry.droppable]);
    useIsomorphicLayoutEffect$1(function () {
      if (!whileDraggingRef.current) {
        return;
      }

      marshal.updateDroppableIsEnabled(publishedDescriptorRef.current.id, !args.isDropDisabled);
    }, [args.isDropDisabled, marshal]);
    useIsomorphicLayoutEffect$1(function () {
      if (!whileDraggingRef.current) {
        return;
      }

      marshal.updateDroppableIsCombineEnabled(publishedDescriptorRef.current.id, args.isCombineEnabled);
    }, [args.isCombineEnabled, marshal]);
  }

  function noop$2() {}

  var empty = {
    width: 0,
    height: 0,
    margin: noSpacing$1
  };

  var getSize = function getSize(_ref) {
    var isAnimatingOpenOnMount = _ref.isAnimatingOpenOnMount,
        placeholder = _ref.placeholder,
        animate = _ref.animate;

    if (isAnimatingOpenOnMount) {
      return empty;
    }

    if (animate === 'close') {
      return empty;
    }

    return {
      height: placeholder.client.borderBox.height,
      width: placeholder.client.borderBox.width,
      margin: placeholder.client.margin
    };
  };

  var getStyle = function getStyle(_ref2) {
    var isAnimatingOpenOnMount = _ref2.isAnimatingOpenOnMount,
        placeholder = _ref2.placeholder,
        animate = _ref2.animate;
    var size = getSize({
      isAnimatingOpenOnMount: isAnimatingOpenOnMount,
      placeholder: placeholder,
      animate: animate
    });
    return {
      display: placeholder.display,
      boxSizing: 'border-box',
      width: size.width,
      height: size.height,
      marginTop: size.margin.top,
      marginRight: size.margin.right,
      marginBottom: size.margin.bottom,
      marginLeft: size.margin.left,
      flexShrink: '0',
      flexGrow: '0',
      pointerEvents: 'none',
      transition: animate !== 'none' ? transitions.placeholder : null
    };
  };

  function Placeholder(props) {
    var animateOpenTimerRef = React.useRef(null);
    var tryClearAnimateOpenTimer = useCallback(function () {
      if (!animateOpenTimerRef.current) {
        return;
      }

      clearTimeout(animateOpenTimerRef.current);
      animateOpenTimerRef.current = null;
    }, []);
    var animate = props.animate,
        onTransitionEnd = props.onTransitionEnd,
        onClose = props.onClose,
        contextId = props.contextId;

    var _useState = React.useState(props.animate === 'open'),
        isAnimatingOpenOnMount = _useState[0],
        setIsAnimatingOpenOnMount = _useState[1];

    React.useEffect(function () {
      if (!isAnimatingOpenOnMount) {
        return noop$2;
      }

      if (animate !== 'open') {
        tryClearAnimateOpenTimer();
        setIsAnimatingOpenOnMount(false);
        return noop$2;
      }

      if (animateOpenTimerRef.current) {
        return noop$2;
      }

      animateOpenTimerRef.current = setTimeout(function () {
        animateOpenTimerRef.current = null;
        setIsAnimatingOpenOnMount(false);
      });
      return tryClearAnimateOpenTimer;
    }, [animate, isAnimatingOpenOnMount, tryClearAnimateOpenTimer]);
    var onSizeChangeEnd = useCallback(function (event) {
      if (event.propertyName !== 'height') {
        return;
      }

      onTransitionEnd();

      if (animate === 'close') {
        onClose();
      }
    }, [animate, onClose, onTransitionEnd]);
    var style = getStyle({
      isAnimatingOpenOnMount: isAnimatingOpenOnMount,
      animate: props.animate,
      placeholder: props.placeholder
    });
    return React__default.createElement(props.placeholder.tagName, {
      style: style,
      'data-rbd-placeholder-context-id': contextId,
      onTransitionEnd: onSizeChangeEnd,
      ref: props.innerRef
    });
  }

  var Placeholder$1 = React__default.memo(Placeholder);

  var DroppableContext = React__default.createContext(null);

  function checkIsValidInnerRef(el) {
    !(el && isHtmlElement(el)) ?  invariant(false, "\n    provided.innerRef has not been provided with a HTMLElement.\n\n    You can find a guide on using the innerRef callback functions at:\n    https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/using-inner-ref.md\n  ")  : void 0;
  }

  function isBoolean(value) {
    return typeof value === 'boolean';
  }

  function runChecks(args, checks) {
    checks.forEach(function (check) {
      return check(args);
    });
  }

  var shared = [function required(_ref) {
    var props = _ref.props;
    !props.droppableId ?  invariant(false, 'A Droppable requires a droppableId prop')  : void 0;
    !(typeof props.droppableId === 'string') ?  invariant(false, "A Droppable requires a [string] droppableId. Provided: [" + typeof props.droppableId + "]")  : void 0;
  }, function _boolean(_ref2) {
    var props = _ref2.props;
    !isBoolean(props.isDropDisabled) ?  invariant(false, 'isDropDisabled must be a boolean')  : void 0;
    !isBoolean(props.isCombineEnabled) ?  invariant(false, 'isCombineEnabled must be a boolean')  : void 0;
    !isBoolean(props.ignoreContainerClipping) ?  invariant(false, 'ignoreContainerClipping must be a boolean')  : void 0;
  }, function ref(_ref3) {
    var getDroppableRef = _ref3.getDroppableRef;
    checkIsValidInnerRef(getDroppableRef());
  }];
  var standard = [function placeholder(_ref4) {
    var props = _ref4.props,
        getPlaceholderRef = _ref4.getPlaceholderRef;

    if (!props.placeholder) {
      return;
    }

    var ref = getPlaceholderRef();

    if (ref) {
      return;
    }

     warning("\n      Droppable setup issue [droppableId: \"" + props.droppableId + "\"]:\n      DroppableProvided > placeholder could not be found.\n\n      Please be sure to add the {provided.placeholder} React Node as a child of your Droppable.\n      More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md\n    ") ;
  }];
  var virtual = [function hasClone(_ref5) {
    var props = _ref5.props;
    !props.renderClone ?  invariant(false, 'Must provide a clone render function (renderClone) for virtual lists')  : void 0;
  }, function hasNoPlaceholder(_ref6) {
    var getPlaceholderRef = _ref6.getPlaceholderRef;
    !!getPlaceholderRef() ?  invariant(false, 'Expected virtual list to not have a placeholder')  : void 0;
  }];
  function useValidation(args) {
    useDevSetupWarning(function () {
      runChecks(args, shared);

      if (args.props.mode === 'standard') {
        runChecks(args, standard);
      }

      if (args.props.mode === 'virtual') {
        runChecks(args, virtual);
      }
    });
  }

  var AnimateInOut = function (_React$PureComponent) {
    _inheritsLoose(AnimateInOut, _React$PureComponent);

    function AnimateInOut() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _React$PureComponent.call.apply(_React$PureComponent, [this].concat(args)) || this;
      _this.state = {
        isVisible: Boolean(_this.props.on),
        data: _this.props.on,
        animate: _this.props.shouldAnimate && _this.props.on ? 'open' : 'none'
      };

      _this.onClose = function () {
        if (_this.state.animate !== 'close') {
          return;
        }

        _this.setState({
          isVisible: false
        });
      };

      return _this;
    }

    AnimateInOut.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
      if (!props.shouldAnimate) {
        return {
          isVisible: Boolean(props.on),
          data: props.on,
          animate: 'none'
        };
      }

      if (props.on) {
        return {
          isVisible: true,
          data: props.on,
          animate: 'open'
        };
      }

      if (state.isVisible) {
        return {
          isVisible: true,
          data: state.data,
          animate: 'close'
        };
      }

      return {
        isVisible: false,
        animate: 'close',
        data: null
      };
    };

    var _proto = AnimateInOut.prototype;

    _proto.render = function render() {
      if (!this.state.isVisible) {
        return null;
      }

      var provided = {
        onClose: this.onClose,
        data: this.state.data,
        animate: this.state.animate
      };
      return this.props.children(provided);
    };

    return AnimateInOut;
  }(React__default.PureComponent);

  var zIndexOptions = {
    dragging: 5000,
    dropAnimating: 4500
  };

  var getDraggingTransition = function getDraggingTransition(shouldAnimateDragMovement, dropping) {
    if (dropping) {
      return transitions.drop(dropping.duration);
    }

    if (shouldAnimateDragMovement) {
      return transitions.snap;
    }

    return transitions.fluid;
  };

  var getDraggingOpacity = function getDraggingOpacity(isCombining, isDropAnimating) {
    if (!isCombining) {
      return null;
    }

    return isDropAnimating ? combine.opacity.drop : combine.opacity.combining;
  };

  var getShouldDraggingAnimate = function getShouldDraggingAnimate(dragging) {
    if (dragging.forceShouldAnimate != null) {
      return dragging.forceShouldAnimate;
    }

    return dragging.mode === 'SNAP';
  };

  function getDraggingStyle(dragging) {
    var dimension = dragging.dimension;
    var box = dimension.client;
    var offset = dragging.offset,
        combineWith = dragging.combineWith,
        dropping = dragging.dropping;
    var isCombining = Boolean(combineWith);
    var shouldAnimate = getShouldDraggingAnimate(dragging);
    var isDropAnimating = Boolean(dropping);
    var transform = isDropAnimating ? transforms.drop(offset, isCombining) : transforms.moveTo(offset);
    var style = {
      position: 'fixed',
      top: box.marginBox.top,
      left: box.marginBox.left,
      boxSizing: 'border-box',
      width: box.borderBox.width,
      height: box.borderBox.height,
      transition: getDraggingTransition(shouldAnimate, dropping),
      transform: transform,
      opacity: getDraggingOpacity(isCombining, isDropAnimating),
      zIndex: isDropAnimating ? zIndexOptions.dropAnimating : zIndexOptions.dragging,
      pointerEvents: 'none'
    };
    return style;
  }

  function getSecondaryStyle(secondary) {
    return {
      transform: transforms.moveTo(secondary.offset),
      transition: secondary.shouldAnimateDisplacement ? null : 'none'
    };
  }

  function getStyle$1(mapped) {
    return mapped.type === 'DRAGGING' ? getDraggingStyle(mapped) : getSecondaryStyle(mapped);
  }

  function getDimension$1(descriptor, el, windowScroll) {
    if (windowScroll === void 0) {
      windowScroll = origin;
    }

    var computedStyles = window.getComputedStyle(el);
    var borderBox = el.getBoundingClientRect();
    var client = calculateBox(borderBox, computedStyles);
    var page = withScroll(client, windowScroll);
    var placeholder = {
      client: client,
      tagName: el.tagName.toLowerCase(),
      display: computedStyles.display
    };
    var displaceBy = {
      x: client.marginBox.width,
      y: client.marginBox.height
    };
    var dimension = {
      descriptor: descriptor,
      placeholder: placeholder,
      displaceBy: displaceBy,
      client: client,
      page: page
    };
    return dimension;
  }

  function useDraggablePublisher(args) {
    var uniqueId = useUniqueId('draggable');
    var descriptor = args.descriptor,
        registry = args.registry,
        getDraggableRef = args.getDraggableRef,
        canDragInteractiveElements = args.canDragInteractiveElements,
        shouldRespectForcePress = args.shouldRespectForcePress,
        isEnabled = args.isEnabled;
    var options = useMemo(function () {
      return {
        canDragInteractiveElements: canDragInteractiveElements,
        shouldRespectForcePress: shouldRespectForcePress,
        isEnabled: isEnabled
      };
    }, [canDragInteractiveElements, isEnabled, shouldRespectForcePress]);
    var getDimension = useCallback(function (windowScroll) {
      var el = getDraggableRef();
      !el ?  invariant(false, 'Cannot get dimension when no ref is set')  : void 0;
      return getDimension$1(descriptor, el, windowScroll);
    }, [descriptor, getDraggableRef]);
    var entry = useMemo(function () {
      return {
        uniqueId: uniqueId,
        descriptor: descriptor,
        options: options,
        getDimension: getDimension
      };
    }, [descriptor, getDimension, options, uniqueId]);
    var publishedRef = React.useRef(entry);
    var isFirstPublishRef = React.useRef(true);
    useIsomorphicLayoutEffect$1(function () {
      registry.draggable.register(publishedRef.current);
      return function () {
        return registry.draggable.unregister(publishedRef.current);
      };
    }, [registry.draggable]);
    useIsomorphicLayoutEffect$1(function () {
      if (isFirstPublishRef.current) {
        isFirstPublishRef.current = false;
        return;
      }

      var last = publishedRef.current;
      publishedRef.current = entry;
      registry.draggable.update(entry, last);
    }, [entry, registry.draggable]);
  }

  function useValidation$1(props, contextId, getRef) {
    useDevSetupWarning(function () {
      function prefix(id) {
        return "Draggable[id: " + id + "]: ";
      }

      var id = props.draggableId;
      !id ? "development" !== "production" ? invariant(false, 'Draggable requires a draggableId') : invariant(false) : void 0;
      !(typeof id === 'string') ? "development" !== "production" ? invariant(false, "Draggable requires a [string] draggableId.\n      Provided: [type: " + typeof id + "] (value: " + id + ")") : invariant(false) : void 0;
      !isInteger(props.index) ? "development" !== "production" ? invariant(false, prefix(id) + " requires an integer index prop") : invariant(false) : void 0;

      if (props.mapped.type === 'DRAGGING') {
        return;
      }

      checkIsValidInnerRef(getRef());

      if (props.isEnabled) {
        !findDragHandle(contextId, id) ? "development" !== "production" ? invariant(false, prefix(id) + " Unable to find drag handle") : invariant(false) : void 0;
      }
    });
  }
  function useClonePropValidation(isClone) {
    useDev(function () {
      var initialRef = React.useRef(isClone);
      useDevSetupWarning(function () {
        !(isClone === initialRef.current) ? "development" !== "production" ? invariant(false, 'Draggable isClone prop value changed during component life') : invariant(false) : void 0;
      }, [isClone]);
    });
  }

  function preventHtml5Dnd(event) {
    event.preventDefault();
  }

  function Draggable(props) {
    var ref = React.useRef(null);
    var setRef = useCallback(function (el) {
      ref.current = el;
    }, []);
    var getRef = useCallback(function () {
      return ref.current;
    }, []);

    var _useRequiredContext = useRequiredContext(AppContext),
        contextId = _useRequiredContext.contextId,
        dragHandleUsageInstructionsId = _useRequiredContext.dragHandleUsageInstructionsId,
        registry = _useRequiredContext.registry;

    var _useRequiredContext2 = useRequiredContext(DroppableContext),
        type = _useRequiredContext2.type,
        droppableId = _useRequiredContext2.droppableId;

    var descriptor = useMemo(function () {
      return {
        id: props.draggableId,
        index: props.index,
        type: type,
        droppableId: droppableId
      };
    }, [props.draggableId, props.index, type, droppableId]);
    var children = props.children,
        draggableId = props.draggableId,
        isEnabled = props.isEnabled,
        shouldRespectForcePress = props.shouldRespectForcePress,
        canDragInteractiveElements = props.canDragInteractiveElements,
        isClone = props.isClone,
        mapped = props.mapped,
        dropAnimationFinishedAction = props.dropAnimationFinished;
    useValidation$1(props, contextId, getRef);
    useClonePropValidation(isClone);

    if (!isClone) {
      var forPublisher = useMemo(function () {
        return {
          descriptor: descriptor,
          registry: registry,
          getDraggableRef: getRef,
          canDragInteractiveElements: canDragInteractiveElements,
          shouldRespectForcePress: shouldRespectForcePress,
          isEnabled: isEnabled
        };
      }, [descriptor, registry, getRef, canDragInteractiveElements, shouldRespectForcePress, isEnabled]);
      useDraggablePublisher(forPublisher);
    }

    var dragHandleProps = useMemo(function () {
      return isEnabled ? {
        tabIndex: 0,
        role: 'button',
        'aria-describedby': dragHandleUsageInstructionsId,
        'data-rbd-drag-handle-draggable-id': draggableId,
        'data-rbd-drag-handle-context-id': contextId,
        draggable: false,
        onDragStart: preventHtml5Dnd
      } : null;
    }, [contextId, dragHandleUsageInstructionsId, draggableId, isEnabled]);
    var onMoveEnd = useCallback(function (event) {
      if (mapped.type !== 'DRAGGING') {
        return;
      }

      if (!mapped.dropping) {
        return;
      }

      if (event.propertyName !== 'transform') {
        return;
      }

      dropAnimationFinishedAction();
    }, [dropAnimationFinishedAction, mapped]);
    var provided = useMemo(function () {
      var style = getStyle$1(mapped);
      var onTransitionEnd = mapped.type === 'DRAGGING' && mapped.dropping ? onMoveEnd : null;
      var result = {
        innerRef: setRef,
        draggableProps: {
          'data-rbd-draggable-context-id': contextId,
          'data-rbd-draggable-id': draggableId,
          style: style,
          onTransitionEnd: onTransitionEnd
        },
        dragHandleProps: dragHandleProps
      };
      return result;
    }, [contextId, dragHandleProps, draggableId, mapped, onMoveEnd, setRef]);
    var rubric = useMemo(function () {
      return {
        draggableId: descriptor.id,
        type: descriptor.type,
        source: {
          index: descriptor.index,
          droppableId: descriptor.droppableId
        }
      };
    }, [descriptor.droppableId, descriptor.id, descriptor.index, descriptor.type]);
    return children(provided, mapped.snapshot, rubric);
  }

  var isStrictEqual = (function (a, b) {
    return a === b;
  });

  var whatIsDraggedOverFromResult = (function (result) {
    var combine = result.combine,
        destination = result.destination;

    if (destination) {
      return destination.droppableId;
    }

    if (combine) {
      return combine.droppableId;
    }

    return null;
  });

  var getCombineWithFromResult = function getCombineWithFromResult(result) {
    return result.combine ? result.combine.draggableId : null;
  };

  var getCombineWithFromImpact = function getCombineWithFromImpact(impact) {
    return impact.at && impact.at.type === 'COMBINE' ? impact.at.combine.draggableId : null;
  };

  function getDraggableSelector() {
    var memoizedOffset = memoizeOne(function (x, y) {
      return {
        x: x,
        y: y
      };
    });
    var getMemoizedSnapshot = memoizeOne(function (mode, isClone, draggingOver, combineWith, dropping) {
      return {
        isDragging: true,
        isClone: isClone,
        isDropAnimating: Boolean(dropping),
        dropAnimation: dropping,
        mode: mode,
        draggingOver: draggingOver,
        combineWith: combineWith,
        combineTargetFor: null
      };
    });
    var getMemoizedProps = memoizeOne(function (offset, mode, dimension, isClone, draggingOver, combineWith, forceShouldAnimate) {
      return {
        mapped: {
          type: 'DRAGGING',
          dropping: null,
          draggingOver: draggingOver,
          combineWith: combineWith,
          mode: mode,
          offset: offset,
          dimension: dimension,
          forceShouldAnimate: forceShouldAnimate,
          snapshot: getMemoizedSnapshot(mode, isClone, draggingOver, combineWith, null)
        }
      };
    });

    var selector = function selector(state, ownProps) {
      if (state.isDragging) {
        if (state.critical.draggable.id !== ownProps.draggableId) {
          return null;
        }

        var offset = state.current.client.offset;
        var dimension = state.dimensions.draggables[ownProps.draggableId];
        var draggingOver = whatIsDraggedOver(state.impact);
        var combineWith = getCombineWithFromImpact(state.impact);
        var forceShouldAnimate = state.forceShouldAnimate;
        return getMemoizedProps(memoizedOffset(offset.x, offset.y), state.movementMode, dimension, ownProps.isClone, draggingOver, combineWith, forceShouldAnimate);
      }

      if (state.phase === 'DROP_ANIMATING') {
        var completed = state.completed;

        if (completed.result.draggableId !== ownProps.draggableId) {
          return null;
        }

        var isClone = ownProps.isClone;
        var _dimension = state.dimensions.draggables[ownProps.draggableId];
        var result = completed.result;
        var mode = result.mode;

        var _draggingOver = whatIsDraggedOverFromResult(result);

        var _combineWith = getCombineWithFromResult(result);

        var duration = state.dropDuration;
        var dropping = {
          duration: duration,
          curve: curves.drop,
          moveTo: state.newHomeClientOffset,
          opacity: _combineWith ? combine.opacity.drop : null,
          scale: _combineWith ? combine.scale.drop : null
        };
        return {
          mapped: {
            type: 'DRAGGING',
            offset: state.newHomeClientOffset,
            dimension: _dimension,
            dropping: dropping,
            draggingOver: _draggingOver,
            combineWith: _combineWith,
            mode: mode,
            forceShouldAnimate: null,
            snapshot: getMemoizedSnapshot(mode, isClone, _draggingOver, _combineWith, dropping)
          }
        };
      }

      return null;
    };

    return selector;
  }

  function getSecondarySnapshot(combineTargetFor) {
    return {
      isDragging: false,
      isDropAnimating: false,
      isClone: false,
      dropAnimation: null,
      mode: null,
      draggingOver: null,
      combineTargetFor: combineTargetFor,
      combineWith: null
    };
  }

  var atRest = {
    mapped: {
      type: 'SECONDARY',
      offset: origin,
      combineTargetFor: null,
      shouldAnimateDisplacement: true,
      snapshot: getSecondarySnapshot(null)
    }
  };

  function getSecondarySelector() {
    var memoizedOffset = memoizeOne(function (x, y) {
      return {
        x: x,
        y: y
      };
    });
    var getMemoizedSnapshot = memoizeOne(getSecondarySnapshot);
    var getMemoizedProps = memoizeOne(function (offset, combineTargetFor, shouldAnimateDisplacement) {
      if (combineTargetFor === void 0) {
        combineTargetFor = null;
      }

      return {
        mapped: {
          type: 'SECONDARY',
          offset: offset,
          combineTargetFor: combineTargetFor,
          shouldAnimateDisplacement: shouldAnimateDisplacement,
          snapshot: getMemoizedSnapshot(combineTargetFor)
        }
      };
    });

    var getFallback = function getFallback(combineTargetFor) {
      return combineTargetFor ? getMemoizedProps(origin, combineTargetFor, true) : null;
    };

    var getProps = function getProps(ownId, draggingId, impact, afterCritical) {
      var visualDisplacement = impact.displaced.visible[ownId];
      var isAfterCriticalInVirtualList = Boolean(afterCritical.inVirtualList && afterCritical.effected[ownId]);
      var combine = tryGetCombine(impact);
      var combineTargetFor = combine && combine.draggableId === ownId ? draggingId : null;

      if (!visualDisplacement) {
        if (!isAfterCriticalInVirtualList) {
          return getFallback(combineTargetFor);
        }

        if (impact.displaced.invisible[ownId]) {
          return null;
        }

        var change = negate(afterCritical.displacedBy.point);

        var _offset = memoizedOffset(change.x, change.y);

        return getMemoizedProps(_offset, combineTargetFor, true);
      }

      if (isAfterCriticalInVirtualList) {
        return getFallback(combineTargetFor);
      }

      var displaceBy = impact.displacedBy.point;
      var offset = memoizedOffset(displaceBy.x, displaceBy.y);
      return getMemoizedProps(offset, combineTargetFor, visualDisplacement.shouldAnimate);
    };

    var selector = function selector(state, ownProps) {
      if (state.isDragging) {
        if (state.critical.draggable.id === ownProps.draggableId) {
          return null;
        }

        return getProps(ownProps.draggableId, state.critical.draggable.id, state.impact, state.afterCritical);
      }

      if (state.phase === 'DROP_ANIMATING') {
        var completed = state.completed;

        if (completed.result.draggableId === ownProps.draggableId) {
          return null;
        }

        return getProps(ownProps.draggableId, completed.result.draggableId, completed.impact, completed.afterCritical);
      }

      return null;
    };

    return selector;
  }

  var makeMapStateToProps = function makeMapStateToProps() {
    var draggingSelector = getDraggableSelector();
    var secondarySelector = getSecondarySelector();

    var selector = function selector(state, ownProps) {
      return draggingSelector(state, ownProps) || secondarySelector(state, ownProps) || atRest;
    };

    return selector;
  };
  var mapDispatchToProps = {
    dropAnimationFinished: dropAnimationFinished
  };
  var ConnectedDraggable = connect(makeMapStateToProps, mapDispatchToProps, null, {
    context: StoreContext,
    pure: true,
    areStatePropsEqual: isStrictEqual
  })(Draggable);

  function PrivateDraggable(props) {
    var droppableContext = useRequiredContext(DroppableContext);
    var isUsingCloneFor = droppableContext.isUsingCloneFor;

    if (isUsingCloneFor === props.draggableId && !props.isClone) {
      return null;
    }

    return React__default.createElement(ConnectedDraggable, props);
  }
  function PublicDraggable(props) {
    var isEnabled = typeof props.isDragDisabled === 'boolean' ? !props.isDragDisabled : true;
    var canDragInteractiveElements = Boolean(props.disableInteractiveElementBlocking);
    var shouldRespectForcePress = Boolean(props.shouldRespectForcePress);
    return React__default.createElement(PrivateDraggable, _extends({}, props, {
      isClone: false,
      isEnabled: isEnabled,
      canDragInteractiveElements: canDragInteractiveElements,
      shouldRespectForcePress: shouldRespectForcePress
    }));
  }

  function Droppable(props) {
    var appContext = React.useContext(AppContext);
    !appContext ?  invariant(false, 'Could not find app context')  : void 0;
    var contextId = appContext.contextId,
        isMovementAllowed = appContext.isMovementAllowed;
    var droppableRef = React.useRef(null);
    var placeholderRef = React.useRef(null);
    var children = props.children,
        droppableId = props.droppableId,
        type = props.type,
        mode = props.mode,
        direction = props.direction,
        ignoreContainerClipping = props.ignoreContainerClipping,
        isDropDisabled = props.isDropDisabled,
        isCombineEnabled = props.isCombineEnabled,
        snapshot = props.snapshot,
        useClone = props.useClone,
        updateViewportMaxScroll = props.updateViewportMaxScroll,
        getContainerForClone = props.getContainerForClone;
    var getDroppableRef = useCallback(function () {
      return droppableRef.current;
    }, []);
    var setDroppableRef = useCallback(function (value) {
      droppableRef.current = value;
    }, []);
    var getPlaceholderRef = useCallback(function () {
      return placeholderRef.current;
    }, []);
    var setPlaceholderRef = useCallback(function (value) {
      placeholderRef.current = value;
    }, []);
    useValidation({
      props: props,
      getDroppableRef: getDroppableRef,
      getPlaceholderRef: getPlaceholderRef
    });
    var onPlaceholderTransitionEnd = useCallback(function () {
      if (isMovementAllowed()) {
        updateViewportMaxScroll({
          maxScroll: getMaxWindowScroll()
        });
      }
    }, [isMovementAllowed, updateViewportMaxScroll]);
    useDroppablePublisher({
      droppableId: droppableId,
      type: type,
      mode: mode,
      direction: direction,
      isDropDisabled: isDropDisabled,
      isCombineEnabled: isCombineEnabled,
      ignoreContainerClipping: ignoreContainerClipping,
      getDroppableRef: getDroppableRef
    });
    var placeholder = React__default.createElement(AnimateInOut, {
      on: props.placeholder,
      shouldAnimate: props.shouldAnimatePlaceholder
    }, function (_ref) {
      var onClose = _ref.onClose,
          data = _ref.data,
          animate = _ref.animate;
      return React__default.createElement(Placeholder$1, {
        placeholder: data,
        onClose: onClose,
        innerRef: setPlaceholderRef,
        animate: animate,
        contextId: contextId,
        onTransitionEnd: onPlaceholderTransitionEnd
      });
    });
    var provided = useMemo(function () {
      return {
        innerRef: setDroppableRef,
        placeholder: placeholder,
        droppableProps: {
          'data-rbd-droppable-id': droppableId,
          'data-rbd-droppable-context-id': contextId
        }
      };
    }, [contextId, droppableId, placeholder, setDroppableRef]);
    var isUsingCloneFor = useClone ? useClone.dragging.draggableId : null;
    var droppableContext = useMemo(function () {
      return {
        droppableId: droppableId,
        type: type,
        isUsingCloneFor: isUsingCloneFor
      };
    }, [droppableId, isUsingCloneFor, type]);

    function getClone() {
      if (!useClone) {
        return null;
      }

      var dragging = useClone.dragging,
          render = useClone.render;
      var node = React__default.createElement(PrivateDraggable, {
        draggableId: dragging.draggableId,
        index: dragging.source.index,
        isClone: true,
        isEnabled: true,
        shouldRespectForcePress: false,
        canDragInteractiveElements: true
      }, function (draggableProvided, draggableSnapshot) {
        return render(draggableProvided, draggableSnapshot, dragging);
      });
      return ReactDOM__default.createPortal(node, getContainerForClone());
    }

    return React__default.createElement(DroppableContext.Provider, {
      value: droppableContext
    }, children(provided, snapshot), getClone());
  }

  var isMatchingType = function isMatchingType(type, critical) {
    return type === critical.droppable.type;
  };

  var getDraggable = function getDraggable(critical, dimensions) {
    return dimensions.draggables[critical.draggable.id];
  };

  var makeMapStateToProps$1 = function makeMapStateToProps() {
    var idleWithAnimation = {
      placeholder: null,
      shouldAnimatePlaceholder: true,
      snapshot: {
        isDraggingOver: false,
        draggingOverWith: null,
        draggingFromThisWith: null,
        isUsingPlaceholder: false
      },
      useClone: null
    };

    var idleWithoutAnimation = _extends({}, idleWithAnimation, {
      shouldAnimatePlaceholder: false
    });

    var getDraggableRubric = memoizeOne(function (descriptor) {
      return {
        draggableId: descriptor.id,
        type: descriptor.type,
        source: {
          index: descriptor.index,
          droppableId: descriptor.droppableId
        }
      };
    });
    var getMapProps = memoizeOne(function (id, isEnabled, isDraggingOverForConsumer, isDraggingOverForImpact, dragging, renderClone) {
      var draggableId = dragging.descriptor.id;
      var isHome = dragging.descriptor.droppableId === id;

      if (isHome) {
        var useClone = renderClone ? {
          render: renderClone,
          dragging: getDraggableRubric(dragging.descriptor)
        } : null;
        var _snapshot = {
          isDraggingOver: isDraggingOverForConsumer,
          draggingOverWith: isDraggingOverForConsumer ? draggableId : null,
          draggingFromThisWith: draggableId,
          isUsingPlaceholder: true
        };
        return {
          placeholder: dragging.placeholder,
          shouldAnimatePlaceholder: false,
          snapshot: _snapshot,
          useClone: useClone
        };
      }

      if (!isEnabled) {
        return idleWithoutAnimation;
      }

      if (!isDraggingOverForImpact) {
        return idleWithAnimation;
      }

      var snapshot = {
        isDraggingOver: isDraggingOverForConsumer,
        draggingOverWith: draggableId,
        draggingFromThisWith: null,
        isUsingPlaceholder: true
      };
      return {
        placeholder: dragging.placeholder,
        shouldAnimatePlaceholder: true,
        snapshot: snapshot,
        useClone: null
      };
    });

    var selector = function selector(state, ownProps) {
      var id = ownProps.droppableId;
      var type = ownProps.type;
      var isEnabled = !ownProps.isDropDisabled;
      var renderClone = ownProps.renderClone;

      if (state.isDragging) {
        var critical = state.critical;

        if (!isMatchingType(type, critical)) {
          return idleWithoutAnimation;
        }

        var dragging = getDraggable(critical, state.dimensions);
        var isDraggingOver = whatIsDraggedOver(state.impact) === id;
        return getMapProps(id, isEnabled, isDraggingOver, isDraggingOver, dragging, renderClone);
      }

      if (state.phase === 'DROP_ANIMATING') {
        var completed = state.completed;

        if (!isMatchingType(type, completed.critical)) {
          return idleWithoutAnimation;
        }

        var _dragging = getDraggable(completed.critical, state.dimensions);

        return getMapProps(id, isEnabled, whatIsDraggedOverFromResult(completed.result) === id, whatIsDraggedOver(completed.impact) === id, _dragging, renderClone);
      }

      if (state.phase === 'IDLE' && state.completed && !state.shouldFlush) {
        var _completed = state.completed;

        if (!isMatchingType(type, _completed.critical)) {
          return idleWithoutAnimation;
        }

        var wasOver = whatIsDraggedOver(_completed.impact) === id;
        var wasCombining = Boolean(_completed.impact.at && _completed.impact.at.type === 'COMBINE');
        var isHome = _completed.critical.droppable.id === id;

        if (wasOver) {
          return wasCombining ? idleWithAnimation : idleWithoutAnimation;
        }

        if (isHome) {
          return idleWithAnimation;
        }

        return idleWithoutAnimation;
      }

      return idleWithoutAnimation;
    };

    return selector;
  };
  var mapDispatchToProps$1 = {
    updateViewportMaxScroll: updateViewportMaxScroll
  };

  function getBody() {
    !document.body ?  invariant(false, 'document.body is not ready')  : void 0;
    return document.body;
  }

  var defaultProps = {
    mode: 'standard',
    type: 'DEFAULT',
    direction: 'vertical',
    isDropDisabled: false,
    isCombineEnabled: false,
    ignoreContainerClipping: false,
    renderClone: null,
    getContainerForClone: getBody
  };
  var ConnectedDroppable = connect(makeMapStateToProps$1, mapDispatchToProps$1, null, {
    context: StoreContext,
    pure: true,
    areStatePropsEqual: isStrictEqual
  })(Droppable);
  ConnectedDroppable.defaultProps = defaultProps;

  exports.DragDropContext = DragDropContext;
  exports.Draggable = PublicDraggable;
  exports.Droppable = ConnectedDroppable;
  exports.resetServerContext = resetServerContext;
  exports.useKeyboardSensor = useKeyboardSensor;
  exports.useMouseSensor = useMouseSensor;
  exports.useTouchSensor = useTouchSensor;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
