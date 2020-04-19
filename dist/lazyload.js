(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.LazyLoad = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var makeArray = function makeArray(obj) {
    if (Array.isArray(obj)) {
      return obj;
    }

    return Array.prototype.slice.call(obj);
  };

  var arrayDeleteElement = function arrayDeleteElement(array, element) {
    return array.filter(function (item) {
      return item !== element;
    });
  };

  var LazyLoad = /*#__PURE__*/function () {
    function LazyLoad(options) {
      _classCallCheck(this, LazyLoad);

      _defineProperty(this, "setSizesAttribute", function (image) {
        if (image.dataset.sizes && image.dataset.sizes === 'auto') {
          image.setAttribute('sizes', "".concat(image.clientWidth, "px"));
        }
      });

      _defineProperty(this, "loadImage", function (image) {
        var img = image;
        return new Promise(function (resolve, reject) {
          if (image.dataset.src) {
            img.src = image.dataset.src;
          }

          if (img.dataset.srcset) {
            img.setAttribute('srcset', image.dataset.srcset);
          }

          img.onload = function () {
            resolve(img);
          };

          img.onerror = function () {
            reject(img);
          };
        });
      });

      this.options = _objectSpread2({
        elements: '.lazy',
        loadClass: 'lazy-loading',
        loadedClass: 'lazy-loaded',
        errorClass: 'lazy-load-error',
        init: true
      }, options);
      this.elements = this.getElements();

      if (this.options.init) {
        this.init();
      }
    }

    _createClass(LazyLoad, [{
      key: "getElements",
      value: function getElements() {
        var elements = this.options.elements;

        if (typeof elements === 'string') {
          elements = document.querySelectorAll(elements);
        }

        return makeArray(elements);
      }
    }, {
      key: "createIntersectionObserver",
      value: function createIntersectionObserver() {
        var _this = this;

        if (window.IntersectionObserver) {
          this.intersectionObserver = new IntersectionObserver(function (entries, observer) {
            _this.isIntersectingHandler(entries, observer);
          });
        }
      }
    }, {
      key: "updateIntersectionObserver",
      value: function updateIntersectionObserver(elements) {
        var _this2 = this;

        if (this.intersectionObserver) {
          elements.forEach(function (element) {
            if (!element.classList.contains(_this2.options.loadedClass)) {
              _this2.intersectionObserver.observe(element);
            }
          });
        }
      }
    }, {
      key: "resetIntersectionObserver",
      value: function resetIntersectionObserver() {
        var _this3 = this;

        if (this.intersectionObserver) {
          this.elements.forEach(function (element) {
            return _this3.intersectionObserver.unobserve(element);
          });
        }
      }
    }, {
      key: "destroyIntersectionObserver",
      value: function destroyIntersectionObserver() {
        this.resetIntersectionObserver();
        delete this.intersectionObserver;
      }
    }, {
      key: "isIntersectingHandler",
      value: function isIntersectingHandler(entries, observer) {
        var _this4 = this;

        var intersectingEntries = entries.reduce(function (filtered, entry) {
          if (entry.isIntersecting) {
            filtered.push(entry.target);
            observer.unobserve(entry.target);
            _this4.elements = arrayDeleteElement(_this4.elements, entry.target);
          }

          return filtered;
        }, []);
        this.loadImages(intersectingEntries);
      }
    }, {
      key: "loadImages",
      value: function loadImages(images) {
        var _this5 = this;

        this.beforeLoad(images);
        var promiseMap = this.promiseMap(images);
        Promise.all(promiseMap).then(function (promises) {
          _this5.promiseStatusFilter(promises);
        });
      }
    }, {
      key: "beforeLoad",
      value: function beforeLoad(images) {
        var _this6 = this;

        images.forEach(function (image) {
          image.classList.add(_this6.options.loadClass);

          _this6.setSizesAttribute(image);
        });
      }
    }, {
      key: "promiseMap",
      value: function promiseMap(images) {
        var _this7 = this;

        return images.map(function (image) {
          return _this7.loadImage(image).then(function (value) {
            return {
              status: 'fulfilled',
              value: value
            };
          }, function (error) {
            return {
              status: 'rejected',
              reason: error
            };
          });
        });
      }
    }, {
      key: "promiseStatusFilter",
      value: function promiseStatusFilter(promises) {
        var promiseFulfilled = [];
        var promiseRejected = [];
        promises.forEach(function (promise) {
          if (promise.status === 'fulfilled') {
            promiseFulfilled.push(promise.value);
          }

          if (promise.status === 'rejected') {
            promiseRejected.push(promise.reason);
          }
        });

        if (promiseFulfilled.length) {
          this.afterSuccessfulLoad(promiseFulfilled);
        }

        if (promiseRejected.length) {
          this.afterUnsuccessfulLoad(promiseRejected);
        }
      }
    }, {
      key: "afterSuccessfulLoad",
      value: function afterSuccessfulLoad(images) {
        var _this8 = this;

        images.forEach(function (image) {
          image.classList.remove(_this8.options.loadClass);
          image.classList.add(_this8.options.loadedClass);
        });
      }
    }, {
      key: "afterUnsuccessfulLoad",
      value: function afterUnsuccessfulLoad(images) {
        var _this9 = this;

        images.forEach(function (image) {
          image.classList.remove(_this9.options.loadClass);
          image.classList.add(_this9.options.errorClass);
        });
      }
    }, {
      key: "update",
      value: function update(elements) {
        if (!elements) {
          this.elements = this.getElements();
          this.updateIntersectionObserver(this.elements);
        } else {
          this.elements = elements;
          this.updateIntersectionObserver(elements);
        }
      }
    }, {
      key: "reset",
      value: function reset() {
        this.resetIntersectionObserver();
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.destroyIntersectionObserver();
        delete this.container;
        delete this.elements;
        delete this.options;
      }
    }, {
      key: "init",
      value: function init() {
        this.createIntersectionObserver();
        this.updateIntersectionObserver(this.elements);
      }
    }]);

    return LazyLoad;
  }();

  return LazyLoad;

})));
