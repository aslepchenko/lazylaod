import { makeArray, arrayDeleteElement } from './array-utils';
export default class LazyLoad {
  constructor(options) {
    this.options = {
      elements: '.lazy',
      loadClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-load-error',
      init: true,
      ...options
    };

    this.elements = this.getElements();

    if (this.options.init) {
      this.init();
    }
  }

  getElements() {
    let elements = this.options.elements;

    if (typeof elements === 'string') {
      elements = document.querySelectorAll(elements);
    }
    return makeArray(elements);
  }

  createIntersectionObserver() {
    if (window.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((entries, observer) => {
        this.isIntersectingHandler(entries, observer);
      });
    }
  }

  updateIntersectionObserver(elements) {
    if (this.intersectionObserver) {
      elements.forEach(element => {
        if (!element.classList.contains(this.options.loadedClass)) {
          this.intersectionObserver.observe(element);
        }
      });
    }
  }

  resetIntersectionObserver() {
    if (this.intersectionObserver) {
      this.elements.forEach(element => this.intersectionObserver.unobserve(element));
    }
  }

  destroyIntersectionObserver() {
    this.resetIntersectionObserver();
    delete this.intersectionObserver;
  }

  isIntersectingHandler(entries, observer) {
    const intersectingEntries = entries.reduce((filtered, entry) => {
      if (entry.isIntersecting) {
        filtered.push(entry.target);
        observer.unobserve(entry.target);
        this.elements = arrayDeleteElement(this.elements, entry.target);
      }
      return filtered;
    }, []);
    this.loadImages(intersectingEntries);
  }

  loadImages(images) {
    this.beforeLoad(images);
    const promiseMap = this.promiseMap(images);

    Promise.all(promiseMap).then(promises => {
      this.promiseStatusFilter(promises);
    });
  }

  setSizesAttribute = (image) => {
    if (image.dataset.sizes && image.dataset.sizes === 'auto') {
      image.setAttribute('sizes', `${image.clientWidth}px`);
    }
  }

  beforeLoad(images) {
    images.forEach(image => {
      image.classList.add(this.options.loadClass);
      this.setSizesAttribute(image);
    });
  }

  loadImage = (image) => {
    let img = image;
    return new Promise((resolve, reject) => {
      if (image.dataset.src) {
        img.src = image.dataset.src;
      }
      if (img.dataset.srcset) {
        img.setAttribute('srcset', image.dataset.srcset);
      }

      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(img);
      };
    });
  }

  promiseMap(images) {
    return images.map(image => {
      return this.loadImage(image).then(
        value => {
          return { status: 'fulfilled', value };
        },
        error => {
          return { status: 'rejected', reason: error };
        }
      );
    });
  }

  promiseStatusFilter(promises) {
    const promiseFulfilled = [];
    const promiseRejected = [];

    promises.forEach(promise => {
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

  afterSuccessfulLoad(images) {
    images.forEach(image => {
      image.classList.remove(this.options.loadClass);
      image.classList.add(this.options.loadedClass);
    });
  }

  afterUnsuccessfulLoad(images) {
    images.forEach(image => {
      image.classList.remove(this.options.loadClass);
      image.classList.add(this.options.errorClass);
    });
  }

  update(elements) {
    if (!elements) {
      this.elements = this.getElements();
      this.updateIntersectionObserver(this.elements);
    } else {
      this.elements = elements;
      this.updateIntersectionObserver(elements);
    }
  }

  reset() {
    this.resetIntersectionObserver();
  }

  destroy() {
    this.destroyIntersectionObserver();
    delete this.container;
    delete this.elements;
    delete this.options;
  }

  init() {
    this.createIntersectionObserver();
    this.updateIntersectionObserver(this.elements);
  }
}
