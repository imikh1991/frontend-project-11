// @ts-check

// eslint-disable-next-line import/extensions
import Example from './Example.js';

export default () => {
  const element = document.getElementById('point');
  const obj = new Example(element);
  obj.init();
};
