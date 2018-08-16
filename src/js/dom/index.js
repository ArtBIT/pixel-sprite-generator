function createStyle(cssString) {
  var style = dom.create("style", { type: "text/css", innerHTML: cssString });
  document.getElementsByTagName("head")[0].appendChild(style);
}

function style(selector, css) {
  const elem = get(selector);
  Object.keys(css).forEach(key => (elem.style[key] = css[key]));
}

function create(tagName, { style: css, innerHTML, ...options }, contents) {
  let elem = document.createElement(tagName);
  if (options) {
    Object.keys(options).forEach(key => elem.setAttribute(key, options[key]));
  }
  if (innerHTML) {
    elem.innerHTML = innerHTML;
  } else if (contents) {
    if (!Array.isArray(contents)) {
        contents = [contents];
    }
    contents.map(child => elem.appendChild(child));
  }
  if (css) {
    style(elem, css);
  }
  return elem;
}

function get(selector) {
  if (selector instanceof Element) {
    return selector;
  }
  return document.querySelector(selector);
}

function append(what, where) {
  return get(where).appendChild(what);
}

function destroy(selector) {
  let node = get(selector);
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function empty(selector) {
  let node = get(selector);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

module.exports = {
  get,
  create,
  append,
  destroy,
  empty,
  style
};
