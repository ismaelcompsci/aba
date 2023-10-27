export default `
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") exports["foliate"] = factory();
  else root["foliate"] = factory();
})(self, () => {
  return /******/ (() => {
    // webpackBootstrap
    /******/ "use strict";
    /******/ // The require scope
    /******/ var __webpack_require__ = {};
    /******/
    /************************************************************************/
    /******/ /* webpack/runtime/define property getters */
    /******/ (() => {
      /******/ // define getter functions for harmony exports
      /******/ __webpack_require__.d = (exports, definition) => {
        /******/ for (var key in definition) {
          /******/ if (
            __webpack_require__.o(definition, key) &&
            !__webpack_require__.o(exports, key)
          ) {
            /******/ Object.defineProperty(exports, key, {
              enumerable: true,
              get: definition[key],
            });
            /******/
          }
          /******/
        }
        /******/
      };
      /******/
    })();
    /******/
    /******/ /* webpack/runtime/hasOwnProperty shorthand */
    /******/ (() => {
      /******/ __webpack_require__.o = (obj, prop) =>
        Object.prototype.hasOwnProperty.call(obj, prop);
      /******/
    })();
    /******/
    /************************************************************************/
    var __webpack_exports__ = {};

    // EXPORTS
    __webpack_require__.d(__webpack_exports__, {
      default: () => /* binding */ main,
    }); // CONCATENATED MODULE: ./my-foliate/epubcfi.js

    const findIndices = (arr, f) =>
      arr.map((x, i, a) => (f(x, i, a) ? i : null)).filter((x) => x != null);
    const splitAt = (arr, is) =>
      [-1, ...is, arr.length].reduce(
        ({ xs, a }, b) => ({
          xs: xs?.concat([arr.slice(a + 1, b)]) ?? [],
          a: b,
        }),
        {},
      ).xs;
    const concatArrays = (a, b) =>
      a
        .slice(0, -1)
        .concat([a[a.length - 1].concat(b[0])])
        .concat(b.slice(1));
    const isNumber = /\\d/;
    const isCFI = /^epubcfi\\((.*)\\)\$/;
    const escapeCFI = (str) => str.replace(/[\\^[\\](),;=]/g, "^\$&");
    const wrap = (x) => (isCFI.test(x) ? x : \`epubcfi(\${x})\`);
    const unwrap = (x) => x.match(isCFI)?.[1] ?? x;
    const lift =
      (f) =>
      (...xs) =>
        \`epubcfi(\${f(...xs.map((x) => x.match(isCFI)?.[1] ?? x))})\`;
    const joinIndir = lift((...xs) => xs.join("!"));
    const tokenizer = (str) => {
      const tokens = [];
      let state,
        escape,
        value = "";
      const push = (x) => (tokens.push(x), (state = null), (value = ""));
      const cat = (x) => ((value += x), (escape = false));
      for (const char of Array.from(str.trim()).concat("")) {
        if (char === "^" && !escape) {
          escape = true;
          continue;
        }
        if (state === "!") push(["!"]);
        else if (state === ",") push([","]);
        else if (state === "/" || state === ":") {
          if (isNumber.test(char)) {
            cat(char);
            continue;
          } else push([state, parseInt(value)]);
        } else if (state === "~") {
          if (isNumber.test(char) || char === ".") {
            cat(char);
            continue;
          } else push(["~", parseFloat(value)]);
        } else if (state === "@") {
          if (char === ":") {
            push(["@", parseFloat(value)]);
            state = "@";
            continue;
          }
          if (isNumber.test(char) || char === ".") {
            cat(char);
            continue;
          } else push(["@", parseFloat(value)]);
        } else if (state === "[") {
          if (char === ";" && !escape) {
            push(["[", value]);
            state = ";";
          } else if (char === "," && !escape) {
            push(["[", value]);
            state = "[";
          } else if (char === "]" && !escape) push(["[", value]);
          else cat(char);
          continue;
        } else if (state?.startsWith(";")) {
          if (char === "=" && !escape) {
            state = \`;\${value}\`;
            value = "";
          } else if (char === ";" && !escape) {
            push([state, value]);
            state = ";";
          } else if (char === "]" && !escape) push([state, value]);
          else cat(char);
          continue;
        }
        if (
          char === "/" ||
          char === ":" ||
          char === "~" ||
          char === "@" ||
          char === "[" ||
          char === "!" ||
          char === ","
        )
          state = char;
      }
      return tokens;
    };
    const findTokens = (tokens, x) => findIndices(tokens, ([t]) => t === x);
    const parser = (tokens) => {
      const parts = [];
      let state;
      for (const [type, val] of tokens) {
        if (type === "/")
          parts.push({
            index: val,
          });
        else {
          const last = parts[parts.length - 1];
          if (type === ":") last.offset = val;
          else if (type === "~") last.temporal = val;
          else if (type === "@")
            last.spatial = (last.spatial ?? []).concat(val);
          else if (type === ";s") last.side = val;
          else if (type === "[") {
            if (state === "/" && val) last.id = val;
            else {
              last.text = (last.text ?? []).concat(val);
              continue;
            }
          }
        }
        state = type;
      }
      return parts;
    };

    // split at step indirections, then parse each part
    const parserIndir = (tokens) =>
      splitAt(tokens, findTokens(tokens, "!")).map(parser);
    const parse = (cfi) => {
      const tokens = tokenizer(unwrap(cfi));
      const commas = findTokens(tokens, ",");
      if (!commas.length) return parserIndir(tokens);
      const [parent, start, end] = splitAt(tokens, commas).map(parserIndir);
      return {
        parent,
        start,
        end,
      };
    };
    const partToString = ({
      index,
      id,
      offset,
      temporal,
      spatial,
      text,
      side,
    }) => {
      const param = side ? \`;s=\${side}\` : "";
      return (
        \`/\${index}\` +
        (id ? \`[\${escapeCFI(id)}\${param}]\` : "") +
        // "CFI expressions [..] SHOULD include an explicit character offset"
        (offset != null && index % 2 ? \`:\${offset}\` : "") +
        (temporal ? \`~\${temporal}\` : "") +
        (spatial ? \`@\${spatial.join(":")}\` : "") +
        (text || (!id && side)
          ? "[" + (text?.map(escapeCFI)?.join(",") ?? "") + param + "]"
          : "")
      );
    };
    const toInnerString = (parsed) =>
      parsed.parent
        ? [parsed.parent, parsed.start, parsed.end].map(toInnerString).join(",")
        : parsed.map((parts) => parts.map(partToString).join("")).join("!");
    const epubcfi_toString = (parsed) => wrap(toInnerString(parsed));
    const collapse = (x, toEnd) =>
      typeof x === "string"
        ? epubcfi_toString(collapse(parse(x), toEnd))
        : x.parent
        ? concatArrays(x.parent, x[toEnd ? "end" : "start"])
        : x;

    // create range CFI from two CFIs
    const buildRange = (from, to) => {
      if (typeof from === "string") from = parse(from);
      if (typeof to === "string") to = parse(to);
      from = collapse(from);
      to = collapse(to, true);
      // ranges across multiple documents are not allowed; handle local paths only
      const localFrom = from[from.length - 1],
        localTo = to[to.length - 1];
      const localParent = [],
        localStart = [],
        localEnd = [];
      let pushToParent = true;
      const len = Math.max(localFrom.length, localTo.length);
      for (let i = 0; i < len; i++) {
        const a = localFrom[i],
          b = localTo[i];
        pushToParent &&= a?.index === b?.index && !a?.offset && !b?.offset;
        if (pushToParent) localParent.push(a);
        else {
          if (a) localStart.push(a);
          if (b) localEnd.push(b);
        }
      }
      // copy non-local paths from \`from\`
      const parent = from.slice(0, -1).concat([localParent]);
      return epubcfi_toString({
        parent,
        start: [localStart],
        end: [localEnd],
      });
    };
    const compare = (a, b) => {
      if (typeof a === "string") a = parse(a);
      if (typeof b === "string") b = parse(b);
      if (a.start || b.start)
        return (
          compare(collapse(a), collapse(b)) ||
          compare(collapse(a, true), collapse(b, true))
        );
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const p = a[i],
          q = b[i];
        const maxIndex = Math.max(p.length, q.length) - 1;
        for (let i = 0; i <= maxIndex; i++) {
          const x = p[i],
            y = q[i];
          if (!x) return -1;
          if (!y) return 1;
          if (x.index > y.index) return 1;
          if (x.index < y.index) return -1;
          if (i === maxIndex) {
            // TODO: compare temporal & spatial offsets
            if (x.offset > y.offset) return 1;
            if (x.offset < y.offset) return -1;
          }
        }
      }
      return 0;
    };
    const isTextNode = ({ nodeType }) => nodeType === 3 || nodeType === 4;
    const isElementNode = ({ nodeType }) => nodeType === 1;
    const getChildNodes = (node, filter) => {
      const nodes = Array.from(node.childNodes)
        // "content other than element and character data is ignored"
        .filter((node) => isTextNode(node) || isElementNode(node));
      return filter
        ? nodes
            .map((node) => {
              const accept = filter(node);
              if (accept === NodeFilter.FILTER_REJECT) return null;
              else if (accept === NodeFilter.FILTER_SKIP)
                return getChildNodes(node, filter);
              else return node;
            })
            .flat()
            .filter((x) => x)
        : nodes;
    };

    // child nodes are organized such that the result is always
    //     [element, text, element, text, ..., element],
    // regardless of the actual structure in the document;
    // so multiple text nodes need to be combined, and nonexistent ones counted;
    // see "Step Reference to Child Element or Character Data (/)" in EPUB CFI spec
    const indexChildNodes = (node, filter) => {
      const nodes = getChildNodes(node, filter).reduce((arr, node) => {
        let last = arr[arr.length - 1];
        if (!last) arr.push(node);
        // "there is one chunk between each pair of child elements"
        else if (isTextNode(node)) {
          if (Array.isArray(last)) last.push(node);
          else if (isTextNode(last)) arr[arr.length - 1] = [last, node];
          else arr.push(node);
        } else {
          if (isElementNode(last)) arr.push(null, node);
          else arr.push(node);
        }
        return arr;
      }, []);
      // "the first chunk is located before the first child element"
      if (isElementNode(nodes[0])) nodes.unshift("first");
      // "the last chunk is located after the last child element"
      if (isElementNode(nodes[nodes.length - 1])) nodes.push("last");
      // "'virtual' elements"
      nodes.unshift("before"); // "0 is a valid index"
      nodes.push("after"); // "n+2 is a valid index"
      return nodes;
    };
    const partsToNode = (node, parts, filter) => {
      const { id } = parts[parts.length - 1];
      if (id) {
        const el = node.ownerDocument.getElementById(id);
        if (el)
          return {
            node: el,
            offset: 0,
          };
      }
      for (const { index } of parts) {
        const newNode = node ? indexChildNodes(node, filter)[index] : null;
        // handle non-existent nodes
        if (newNode === "first")
          return {
            node: node.firstChild ?? node,
          };
        if (newNode === "last")
          return {
            node: node.lastChild ?? node,
          };
        if (newNode === "before")
          return {
            node,
            before: true,
          };
        if (newNode === "after")
          return {
            node,
            after: true,
          };
        node = newNode;
      }
      const { offset } = parts[parts.length - 1];
      if (!Array.isArray(node))
        return {
          node,
          offset,
        };
      // get underlying text node and offset from the chunk
      let sum = 0;
      for (const n of node) {
        const { length } = n.nodeValue;
        if (sum + length >= offset)
          return {
            node: n,
            offset: offset - sum,
          };
        sum += length;
      }
    };
    const nodeToParts = (node, offset, filter) => {
      const { parentNode, id } = node;
      const indexed = indexChildNodes(parentNode, filter);
      const index = indexed.findIndex((x) =>
        Array.isArray(x) ? x.some((x) => x === node) : x === node,
      );
      // adjust offset as if merging the text nodes in the chunk
      const chunk = indexed[index];
      if (Array.isArray(chunk)) {
        let sum = 0;
        for (const x of chunk) {
          if (x === node) {
            sum += offset;
            break;
          } else sum += x.nodeValue.length;
        }
        offset = sum;
      }
      const part = {
        id,
        index,
        offset,
      };
      return (
        (
          parentNode !== node.ownerDocument.documentElement
            ? nodeToParts(parentNode, null, filter).concat(part)
            : [part]
        )
          // remove ignored nodes
          .filter((x) => x.index !== -1)
      );
    };
    const fromRange = (range, filter) => {
      const { startContainer, startOffset, endContainer, endOffset } = range;
      const start = nodeToParts(startContainer, startOffset, filter);
      if (range.collapsed) return epubcfi_toString([start]);
      const end = nodeToParts(endContainer, endOffset, filter);
      return buildRange([start], [end]);
    };
    const toRange = (doc, parts, filter) => {
      const startParts = collapse(parts);
      const endParts = collapse(parts, true);
      const root = doc.documentElement;
      const start = partsToNode(root, startParts[0], filter);
      const end = partsToNode(root, endParts[0], filter);
      const range = doc.createRange();
      if (start.before) range.setStartBefore(start.node);
      else if (start.after) range.setStartAfter(start.node);
      else range.setStart(start.node, start.offset);
      if (end.before) range.setEndBefore(end.node);
      else if (end.after) range.setEndAfter(end.node);
      else range.setEnd(end.node, end.offset);
      return range;
    };

    // faster way of getting CFIs for sorted elements in a single parent
    const fromElements = (elements) => {
      const results = [];
      const { parentNode } = elements[0];
      const parts = nodeToParts(parentNode);
      for (const [index, node] of indexChildNodes(parentNode).entries()) {
        const el = elements[results.length];
        if (node === el)
          results.push(
            epubcfi_toString([
              parts.concat({
                id: el.id,
                index,
              }),
            ]),
          );
      }
      return results;
    };
    const toElement = (doc, parts) =>
      partsToNode(doc.documentElement, collapse(parts)).node;

    // turn indices into standard CFIs when you don't have an actual package document
    const fake = {
      fromIndex: (index) => wrap(\`/6/\${(index + 1) * 2}\`),
      toIndex: (parts) => parts?.at(-1).index / 2 - 1,
    };

    // get CFI from Calibre bookmarks
    // see https://github.com/johnfactotum/foliate/issues/849
    const fromCalibrePos = (pos) => {
      const [parts] = parse(pos);
      const item = parts.shift();
      parts.shift();
      return epubcfi_toString([
        [
          {
            index: 6,
          },
          item,
        ],
        parts,
      ]);
    };
    const fromCalibreHighlight = ({ spine_index, start_cfi, end_cfi }) => {
      const pre = fake.fromIndex(spine_index) + "!";
      return buildRange(pre + start_cfi.slice(2), pre + end_cfi.slice(2));
    }; // CONCATENATED MODULE: ./my-foliate/progress.js
    // assign a unique ID for each TOC item
    const assignIDs = (toc) => {
      let id = 0;
      const assignID = (item) => {
        item.id = id++;
        if (item.subitems)
          for (const subitem of item.subitems) assignID(subitem);
      };
      for (const item of toc) assignID(item);
      return toc;
    };
    const flatten = (items) =>
      items
        .map((item) =>
          item.subitems?.length ? [item, flatten(item.subitems)].flat() : item,
        )
        .flat();
    class TOCProgress {
      async init({ toc, ids, splitHref, getFragment }) {
        assignIDs(toc);
        const items = flatten(toc);
        const grouped = new Map();
        for (const [i, item] of items.entries()) {
          const [id, fragment] = (await splitHref(item?.href)) ?? [];
          const value = {
            fragment,
            item,
          };
          if (grouped.has(id)) grouped.get(id).items.push(value);
          else
            grouped.set(id, {
              prev: items[i - 1],
              items: [value],
            });
        }
        const map = new Map();
        for (const [i, id] of ids.entries()) {
          if (grouped.has(id)) map.set(id, grouped.get(id));
          else map.set(id, map.get(ids[i - 1]));
        }
        this.ids = ids;
        this.map = map;
        this.getFragment = getFragment;
      }
      getProgress(index, range) {
        if (!this.ids) return;
        const id = this.ids[index];
        const obj = this.map.get(id);
        if (!obj) return null;
        const { prev, items } = obj;
        if (!items) return prev;
        if (!range || (items.length === 1 && !items[0].fragment))
          return items[0].item;
        const doc = range.startContainer.getRootNode();
        for (const [i, { fragment }] of items.entries()) {
          const el = this.getFragment(doc, fragment);
          if (!el) continue;
          if (range.comparePoint(el, 0) > 0) return items[i - 1]?.item ?? prev;
        }
        return items[items.length - 1].item;
      }
    }
    class SectionProgress {
      constructor(sections, sizePerLoc, sizePerTimeUnit) {
        this.sizes = sections.map((s) => (s.linear === "no" ? 0 : s.size));
        this.sizePerLoc = sizePerLoc;
        this.sizePerTimeUnit = sizePerTimeUnit;
        this.sizeTotal = this.sizes.reduce((a, b) => a + b, 0);
      }
      // get progress given index of and fractions within a section
      getProgress(index, fractionInSection, pageFraction = 0) {
        const { sizes, sizePerLoc, sizePerTimeUnit, sizeTotal } = this;
        const sizeInSection = sizes[index] ?? 0;
        const sizeBefore = sizes.slice(0, index).reduce((a, b) => a + b, 0);
        const size = sizeBefore + fractionInSection * sizeInSection;
        const nextSize = size + pageFraction * sizeInSection;
        const remainingTotal = sizeTotal - size;
        const remainingSection = (1 - fractionInSection) * sizeInSection;
        return {
          fraction: nextSize / sizeTotal,
          section: {
            current: index,
            total: sizes.length,
          },
          location: {
            current: Math.floor(size / sizePerLoc),
            next: Math.floor(nextSize / sizePerLoc),
            total: Math.ceil(sizeTotal / sizePerLoc),
          },
          time: {
            section: remainingSection / sizePerTimeUnit,
            total: remainingTotal / sizePerTimeUnit,
          },
        };
      }
      // the inverse of \`getProgress\`
      // get index of and fraction in section based on total fraction
      getSection(fraction) {
        if (fraction === 0) return [0, 0];
        if (fraction === 1) return [this.sizes.length - 1, 1];
        const { sizes, sizeTotal } = this;
        const target = fraction * sizeTotal;
        let index = -1;
        let fractionInSection = 0;
        let sum = 0;
        for (const [i, size] of sizes.entries()) {
          const newSum = sum + size;
          if (newSum > target) {
            index = i;
            fractionInSection = (target - sum) / size;
            break;
          }
          sum = newSum;
        }
        return [index, fractionInSection];
      }
    } // CONCATENATED MODULE: ./my-foliate/overlayer.js
    const createSVGElement = (tag) =>
      document.createElementNS("http://www.w3.org/2000/svg", tag);
    class Overlayer {
      #svg = createSVGElement("svg");
      #map = new Map();
      constructor() {
        Object.assign(this.#svg.style, {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        });
      }
      get element() {
        return this.#svg;
      }
      add(key, range, draw, options) {
        if (this.#map.has(key)) this.remove(key);
        if (typeof range === "function") range = range(this.#svg.getRootNode());
        const rects = range.getClientRects();
        const element = draw(rects, options);
        this.#svg.append(element);
        this.#map.set(key, {
          range,
          draw,
          options,
          element,
          rects,
        });
      }
      remove(key) {
        if (!this.#map.has(key)) return;
        this.#svg.removeChild(this.#map.get(key).element);
        this.#map.delete(key);
      }
      redraw() {
        for (const obj of this.#map.values()) {
          const { range, draw, options, element } = obj;
          this.#svg.removeChild(element);
          const rects = range.getClientRects();
          const el = draw(rects, options);
          this.#svg.append(el);
          obj.element = el;
          obj.rects = rects;
        }
      }
      hitTest({ x, y }) {
        const arr = Array.from(this.#map.entries());
        // loop in reverse to hit more recently added items first
        for (let i = arr.length - 1; i >= 0; i--) {
          const [key, obj] = arr[i];
          for (const { left, top, right, bottom } of obj.rects)
            if (top <= y && left <= x && bottom > y && right > x)
              return [key, obj.range];
        }
        return [];
      }
      static underline(rects, options = {}) {
        const { color = "red", width: strokeWidth = 2, writingMode } = options;
        const g = createSVGElement("g");
        g.setAttribute("fill", color);
        if (writingMode === "vertical-rl" || writingMode === "vertical-lr")
          for (const { right, top, height } of rects) {
            const el = createSVGElement("rect");
            el.setAttribute("x", right - strokeWidth);
            el.setAttribute("y", top);
            el.setAttribute("height", height);
            el.setAttribute("width", strokeWidth);
            g.append(el);
          }
        else
          for (const { left, bottom, width } of rects) {
            const el = createSVGElement("rect");
            el.setAttribute("x", left);
            el.setAttribute("y", bottom - strokeWidth);
            el.setAttribute("height", strokeWidth);
            el.setAttribute("width", width);
            g.append(el);
          }
        return g;
      }
      static strikethrough(rects, options = {}) {
        const { color = "red", width: strokeWidth = 2, writingMode } = options;
        const g = createSVGElement("g");
        g.setAttribute("fill", color);
        if (writingMode === "vertical-rl" || writingMode === "vertical-lr")
          for (const { right, left, top, height } of rects) {
            const el = createSVGElement("rect");
            el.setAttribute("x", (right + left) / 2);
            el.setAttribute("y", top);
            el.setAttribute("height", height);
            el.setAttribute("width", strokeWidth);
            g.append(el);
          }
        else
          for (const { left, top, bottom, width } of rects) {
            const el = createSVGElement("rect");
            el.setAttribute("x", left);
            el.setAttribute("y", (top + bottom) / 2);
            el.setAttribute("height", strokeWidth);
            el.setAttribute("width", width);
            g.append(el);
          }
        return g;
      }
      static squiggly(rects, options = {}) {
        const { color = "red", width: strokeWidth = 2, writingMode } = options;
        const g = createSVGElement("g");
        g.setAttribute("fill", "none");
        g.setAttribute("stroke", color);
        g.setAttribute("stroke-width", strokeWidth);
        const block = strokeWidth * 1.5;
        if (writingMode === "vertical-rl" || writingMode === "vertical-lr")
          for (const { right, top, height } of rects) {
            const el = createSVGElement("path");
            const n = Math.round(height / block / 1.5);
            const inline = height / n;
            const ls = Array.from(
              {
                length: n,
              },
              (_, i) => \`l\${i % 2 ? -block : block} \${inline}\`,
            ).join("");
            el.setAttribute("d", \`M\${right} \${top}\${ls}\`);
            g.append(el);
          }
        else
          for (const { left, bottom, width } of rects) {
            const el = createSVGElement("path");
            const n = Math.round(width / block / 1.5);
            const inline = width / n;
            const ls = Array.from(
              {
                length: n,
              },
              (_, i) => \`l\${inline} \${i % 2 ? block : -block}\`,
            ).join("");
            el.setAttribute("d", \`M\${left} \${bottom}\${ls}\`);
            g.append(el);
          }
        return g;
      }
      static highlight(rects, options = {}) {
        const { color = "red" } = options;
        const g = createSVGElement("g");
        g.setAttribute("fill", color);
        g.style.opacity = "var(--overlayer-highlight-opacity, .3)";
        g.style.mixBlendMode = "var(--overlayer-highlight-blend-mode, normal)";
        for (const { left, top, height, width } of rects) {
          const el = createSVGElement("rect");
          el.setAttribute("x", left);
          el.setAttribute("y", top);
          el.setAttribute("height", height);
          el.setAttribute("width", width);
          g.append(el);
        }
        return g;
      }
      static outline(rects, options = {}) {
        const { color = "red", width: strokeWidth = 3, radius = 3 } = options;
        const g = createSVGElement("g");
        g.setAttribute("fill", "none");
        g.setAttribute("stroke", color);
        g.setAttribute("stroke-width", strokeWidth);
        for (const { left, top, height, width } of rects) {
          const el = createSVGElement("rect");
          el.setAttribute("x", left);
          el.setAttribute("y", top);
          el.setAttribute("height", height);
          el.setAttribute("width", width);
          el.setAttribute("rx", radius);
          g.append(el);
        }
        return g;
      }
      // make an exact copy of an image in the overlay
      // one can then apply filters to the entire element, without affecting them;
      // it's a bit silly and probably better to just invert images twice
      // (though the color will be off in that case if you do heu-rotate)
      static copyImage([rect], options = {}) {
        const { src } = options;
        const image = createSVGElement("image");
        const { left, top, height, width } = rect;
        image.setAttribute("href", src);
        image.setAttribute("x", left);
        image.setAttribute("y", top);
        image.setAttribute("height", height);
        image.setAttribute("width", width);
        return image;
      }
    } // CONCATENATED MODULE: ./my-foliate/text-walker.js
    const walkRange = (range, walker) => {
      const nodes = [];
      for (let node = walker.currentNode; node; node = walker.nextNode()) {
        const compare = range.comparePoint(node, 0);
        if (compare === 0) nodes.push(node);
        else if (compare > 0) break;
      }
      return nodes;
    };
    const walkDocument = (_, walker) => {
      const nodes = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode())
        nodes.push(node);
      return nodes;
    };
    const filter =
      NodeFilter.SHOW_ELEMENT |
      NodeFilter.SHOW_TEXT |
      NodeFilter.SHOW_CDATA_SECTION;
    const acceptNode = (node) => {
      if (node.nodeType === 1) {
        const name = node.tagName.toLowerCase();
        if (name === "script" || name === "style")
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    };
    const textWalker = function* (x, func) {
      const root = x.commonAncestorContainer ?? x.body ?? x;
      const walker = document.createTreeWalker(root, filter, {
        acceptNode,
      });
      const walk = x.commonAncestorContainer ? walkRange : walkDocument;
      const nodes = walk(x, walker);
      const strs = nodes.map((node) => node.nodeValue);
      const makeRange = (startIndex, startOffset, endIndex, endOffset) => {
        const range = document.createRange();
        range.setStart(nodes[startIndex], startOffset);
        range.setEnd(nodes[endIndex], endOffset);
        return range;
      };
      for (const match of func(strs, makeRange)) yield match;
    }; // CONCATENATED MODULE: ./my-foliate/fixed-layout.js
    const parseViewport = (str) =>
      str
        ?.split(/[,;\\s]/) // NOTE: technically, only the comma is valid
        ?.filter((x) => x)
        ?.map((x) => x.split("=").map((x) => x.trim()));
    const getViewport = (doc, viewport) => {
      // use \`viewBox\` for SVG
      if (doc.documentElement.localName === "svg") {
        const [, , width, height] =
          doc.documentElement.getAttribute("viewBox")?.split(/\\s/) ?? [];
        return {
          width,
          height,
        };
      }

      // get \`viewport\` \`meta\` element
      const meta = parseViewport(
        doc.querySelector('meta[name="viewport"]')?.getAttribute("content"),
      );
      if (meta) return Object.fromEntries(meta);

      // fallback to book's viewport
      if (typeof viewport === "string") return parseViewport(viewport);
      if (viewport) return viewport;

      // if no viewport (possibly with image directly in spine), get image size
      const img = doc.querySelector("img");
      if (img)
        return {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

      // just show *something*, i guess...
      console.warn(new Error("Missing viewport properties"));
      return {
        width: 1000,
        height: 2000,
      };
    };
    class FixedLayout extends HTMLElement {
      #root = this.attachShadow({
        mode: "closed",
      });
      #observer = new ResizeObserver(() => this.#render());
      #spreads;
      #index = -1;
      defaultViewport;
      spread;
      #portrait = false;
      #left;
      #right;
      #center;
      #side;
      constructor() {
        super();
        const sheet = new CSSStyleSheet();
        this.#root.adoptedStyleSheets = [sheet];
        sheet.replaceSync(\`:host {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }\`);
        this.#observer.observe(this);
      }
      async #createFrame({ index, src }) {
        const element = document.createElement("div");
        const iframe = document.createElement("iframe");
        element.append(iframe);
        Object.assign(iframe.style, {
          border: "0",
          display: "none",
          overflow: "hidden",
        });
        // \`allow-scripts\` is needed for events because of WebKit bug
        // https://bugs.webkit.org/show_bug.cgi?id=218086
        iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
        iframe.setAttribute("scrolling", "no");
        iframe.setAttribute("part", "filter");
        this.#root.append(element);
        if (!src)
          return {
            blank: true,
            element,
            iframe,
          };
        return new Promise((resolve) => {
          const onload = () => {
            iframe.removeEventListener("load", onload);
            const doc = iframe.contentDocument;
            this.dispatchEvent(
              new CustomEvent("load", {
                detail: {
                  doc,
                  index,
                },
              }),
            );
            const { width, height } = getViewport(doc, this.defaultViewport);
            resolve({
              element,
              iframe,
              width: parseFloat(width),
              height: parseFloat(height),
            });
          };
          iframe.addEventListener("load", onload);
          iframe.src = src;
        });
      }
      #render(side = this.#side) {
        if (!side) return;
        const left = this.#left ?? {};
        const right = this.#center ?? this.#right;
        const target = side === "left" ? left : right;
        let { width, height } = this.getBoundingClientRect();
        var _width = window.innerWidth > 0 ? window.innerWidth : screen.width;
        width = width === 0 ? _width : width;
        const portrait =
          this.spread !== "both" &&
          this.spread !== "portrait" &&
          height > width;
        this.#portrait = portrait;
        const blankWidth = left.width ?? right.width;
        const blankHeight = left.height ?? right.height;
        const scale =
          portrait || this.#center
            ? Math.min(
                width / (target.width ?? blankWidth),
                height / (target.height ?? blankHeight),
              )
            : Math.min(
                width /
                  ((left.width ?? blankWidth) + (right.width ?? blankWidth)),
                height /
                  Math.max(
                    left.height ?? blankHeight,
                    right.height ?? blankHeight,
                  ),
              );
        const transform = (frame) => {
          const { element, iframe, width, height, blank } = frame;
          Object.assign(iframe.style, {
            width: \`\${width}px\`,
            height: \`\${height}px\`,
            transform: \`scale(\${scale})\`,
            transformOrigin: "top left",
            display: blank ? "none" : "block",
          });
          Object.assign(element.style, {
            width: \`\${(width ?? blankWidth) * scale}px\`,
            height: \`\${(height ?? blankHeight) * scale}px\`,
            overflow: "hidden",
            display: "block",
          });
          if (portrait && frame !== target) {
            element.style.display = "none";
          }
        };
        if (this.#center) {
          transform(this.#center);
        } else {
          transform(left);
          transform(right);
        }
      }
      async #showSpread({ left, right, center, side }) {
        this.#root.replaceChildren();
        this.#left = null;
        this.#right = null;
        this.#center = null;
        if (center) {
          this.#center = await this.#createFrame(center);
          this.#side = "center";
          this.#render();
        } else {
          this.#left = await this.#createFrame(left);
          this.#right = await this.#createFrame(right);
          this.#side = this.#left.blank
            ? "right"
            : this.#right.blank
            ? "left"
            : side;
          this.#render();
        }
      }
      #goLeft() {
        if (this.#center || this.#left?.blank) return;
        if (this.#portrait && this.#left?.element?.style?.display === "none") {
          this.#right.element.style.display = "none";
          this.#left.element.style.display = "block";
          this.#side = "left";
          return true;
        }
      }
      #goRight() {
        if (this.#center || this.#right?.blank) return;
        if (this.#portrait && this.#right?.element?.style?.display === "none") {
          this.#left.element.style.display = "none";
          this.#right.element.style.display = "block";
          this.#side = "right";
          return true;
        }
      }
      open(book) {
        this.book = book;
        const { rendition } = book;
        this.spread = rendition?.spread;
        this.defaultViewport = rendition?.viewport;
        const rtl = book.dir === "rtl";
        const ltr = !rtl;
        this.rtl = rtl;
        if (rendition?.spread === "none")
          this.#spreads = book.sections.map((section) => ({
            center: section,
          }));
        else
          this.#spreads = book.sections.reduce(
            (arr, section) => {
              const last = arr[arr.length - 1];
              const { linear, pageSpread } = section;
              if (linear === "no") return arr;
              const newSpread = () => {
                const spread = {};
                arr.push(spread);
                return spread;
              };
              if (pageSpread === "center") {
                const spread = last.left || last.right ? newSpread() : last;
                spread.center = section;
              } else if (pageSpread === "left") {
                const spread =
                  last.center || last.left || ltr ? newSpread() : last;
                spread.left = section;
              } else if (pageSpread === "right") {
                const spread =
                  last.center || last.right || rtl ? newSpread() : last;
                spread.right = section;
              } else if (ltr) {
                if (last.center || last.right) newSpread().left = section;
                else if (last.left) last.right = section;
                else last.left = section;
              } else {
                if (last.center || last.left) newSpread().right = section;
                else if (last.right) last.left = section;
                else last.right = section;
              }
              return arr;
            },
            [{}],
          );
      }
      get index() {
        const spread = this.#spreads[this.#index];
        const section =
          spread?.center ??
          (this.side === "left"
            ? spread.left ?? spread.right
            : spread.right ?? spread.left);
        return this.book.sections.indexOf(section);
      }
      #reportLocation(reason) {
        this.dispatchEvent(
          new CustomEvent("relocate", {
            detail: {
              reason,
              range: null,
              index: this.index,
              fraction: 0,
              size: 1,
            },
          }),
        );
      }
      getSpreadOf(section) {
        const spreads = this.#spreads;
        for (let index = 0; index < spreads.length; index++) {
          const { left, right, center } = spreads[index];
          if (left === section)
            return {
              index,
              side: "left",
            };
          if (right === section)
            return {
              index,
              side: "right",
            };
          if (center === section)
            return {
              index,
              side: "center",
            };
        }
      }
      async goToSpread(index, side, reason) {
        if (index < 0 || index > this.#spreads.length - 1) return;
        if (index === this.#index) {
          this.#render(side);
          return;
        }
        this.#index = index;
        const spread = this.#spreads[index];
        if (spread.center) {
          const index = this.book.sections.indexOf(spread.center);
          const src = await spread.center?.load?.();
          await this.#showSpread({
            center: {
              index,
              src,
            },
          });
        } else {
          const indexL = this.book.sections.indexOf(spread.left);
          const indexR = this.book.sections.indexOf(spread.right);
          const srcL = await spread.left?.load?.();
          const srcR = await spread.right?.load?.();
          const left = {
            index: indexL,
            src: srcL,
          };
          const right = {
            index: indexR,
            src: srcR,
          };
          await this.#showSpread({
            left,
            right,
            side,
          });
        }
        this.#reportLocation(reason);
      }
      async select(target) {
        await this.goTo(target);
        // TODO
      }

      async goTo(target) {
        const { book } = this;
        const resolved = await target;
        const section = book.sections[resolved.index];
        if (!section) return;
        const { index, side } = this.getSpreadOf(section);
        await this.goToSpread(index, side);
      }
      async next() {
        const s = this.rtl ? this.#goLeft() : this.#goRight();
        if (s) this.#reportLocation("page");
        else
          return this.goToSpread(
            this.#index + 1,
            this.rtl ? "right" : "left",
            "page",
          );
      }
      async prev() {
        const s = this.rtl ? this.#goRight() : this.#goLeft();
        if (s) this.#reportLocation("page");
        else
          return this.goToSpread(
            this.#index - 1,
            this.rtl ? "left" : "right",
            "page",
          );
      }
      getContents() {
        return Array.from(this.#root.querySelectorAll("iframe"), (frame) => ({
          doc: frame.contentDocument,
          // TODO: index, overlayer
        }));
      }

      destroy() {
        this.#observer.unobserve(this);
      }
    }
    customElements.define("foliate-fxl", FixedLayout); // CONCATENATED MODULE: ./my-foliate/paginator.js
    const debugMessage = (m) => {
      if (typeof window.ReactNativeWebView != "undefined") {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "epubjs",
            message: m,
          }),
        );
      } else {
        console.log(m);
      }
    };
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const debounce = (f, wait, immediate) => {
      let timeout;
      return (...args) => {
        const later = () => {
          timeout = null;
          if (!immediate) f(...args);
        };
        const callNow = immediate && !timeout;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) f(...args);
      };
    };
    const lerp = (min, max, x) => x * (max - min) + min;
    const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);
    const animate = (a, b, duration, ease, render) =>
      new Promise((resolve) => {
        let start;
        const step = (now) => {
          start ??= now;
          const fraction = Math.min(1, (now - start) / duration);
          render(lerp(a, b, ease(fraction)));
          if (fraction < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

    // collapsed range doesn't return client rects sometimes (or always?)
    // try make get a non-collapsed range or element
    const uncollapse = (range) => {
      if (!range?.collapsed) return range;
      const { endOffset, endContainer } = range;
      if (endContainer.nodeType === 1) return endContainer;
      if (endOffset + 1 < endContainer.length)
        range.setEnd(endContainer, endOffset + 1);
      else if (endOffset > 1) range.setStart(endContainer, endOffset - 1);
      else return endContainer.parentNode;
      return range;
    };
    const makeRange = (doc, node, start, end = start) => {
      const range = doc.createRange();
      range.setStart(node, start);
      range.setEnd(node, end);
      return range;
    };

    // use binary search to find an offset value in a text node
    const bisectNode = (
      doc,
      node,
      cb,
      start = 0,
      end = node.nodeValue.length,
    ) => {
      if (end - start === 1) {
        const result = cb(
          makeRange(doc, node, start),
          makeRange(doc, node, end),
        );
        return result < 0 ? start : end;
      }
      const mid = Math.floor(start + (end - start) / 2);
      const result = cb(
        makeRange(doc, node, start, mid),
        makeRange(doc, node, mid, end),
      );
      return result < 0
        ? bisectNode(doc, node, cb, start, mid)
        : result > 0
        ? bisectNode(doc, node, cb, mid, end)
        : mid;
    };
    const {
      SHOW_ELEMENT,
      SHOW_TEXT,
      SHOW_CDATA_SECTION,
      FILTER_ACCEPT,
      FILTER_REJECT,
      FILTER_SKIP,
    } = NodeFilter;
    const paginator_filter = SHOW_ELEMENT | SHOW_TEXT | SHOW_CDATA_SECTION;
    const getVisibleRange = (doc, start, end, mapRect) => {
      // first get all visible nodes
      const acceptNode = (node) => {
        const name = node.localName?.toLowerCase();
        // ignore all scripts, styles, and their children
        if (name === "script" || name === "style") return FILTER_REJECT;
        if (node.nodeType === 1) {
          const { left, right } = mapRect(node.getBoundingClientRect());
          // no need to check child nodes if it's completely out of view
          if (right < start || left > end) return FILTER_REJECT;
          // elements must be completely in view to be considered visible
          // because you can't specify offsets for elements
          if (left >= start && right <= end) return FILTER_ACCEPT;
          // TODO: it should probably allow elements that do not contain text
          // because they can exceed the whole viewport in both directions
          // especially in scrolled mode
        } else {
          // ignore empty text nodes
          if (!node.nodeValue?.trim()) return FILTER_SKIP;
          // create range to get rect
          const range = doc.createRange();
          range.selectNodeContents(node);
          const { left, right } = mapRect(range.getBoundingClientRect());
          // it's visible if any part of it is in view
          if (right >= start && left <= end) return FILTER_ACCEPT;
        }
        return FILTER_SKIP;
      };
      const walker = doc.createTreeWalker(doc.body, paginator_filter, {
        acceptNode,
      });
      const nodes = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode())
        nodes.push(node);

      // we're only interested in the first and last visible nodes
      const from = nodes[0] ?? doc.body;
      const to = nodes[nodes.length - 1] ?? from;

      // find the offset at which visibility changes
      const startOffset =
        from.nodeType === 1
          ? 0
          : bisectNode(doc, from, (a, b) => {
              const p = mapRect(a.getBoundingClientRect());
              const q = mapRect(b.getBoundingClientRect());
              if (p.right < start && q.left > start) return 0;
              return q.left > start ? -1 : 1;
            });
      const endOffset =
        to.nodeType === 1
          ? 0
          : bisectNode(doc, to, (a, b) => {
              const p = mapRect(a.getBoundingClientRect());
              const q = mapRect(b.getBoundingClientRect());
              if (p.right < end && q.left > end) return 0;
              return q.left > end ? -1 : 1;
            });
      const range = doc.createRange();
      range.setStart(from, startOffset);
      range.setEnd(to, endOffset);
      return range;
    };
    const getDirection = (doc) => {
      const { defaultView } = doc;
      const { writingMode, direction } = defaultView.getComputedStyle(doc.body);
      const vertical =
        writingMode === "vertical-rl" || writingMode === "vertical-lr";
      const rtl =
        doc.body.dir === "rtl" ||
        direction === "rtl" ||
        doc.documentElement.dir === "rtl";
      return {
        vertical,
        rtl,
      };
    };
    const getBackground = (doc) => {
      const bodyStyle = doc.defaultView.getComputedStyle(doc.body);
      return bodyStyle.backgroundColor === "rgba(0, 0, 0, 0)" &&
        bodyStyle.backgroundImage === "none"
        ? doc.defaultView.getComputedStyle(doc.documentElement).background
        : bodyStyle.background;
    };
    const makeMarginals = (length, part) =>
      Array.from(
        {
          length,
        },
        () => {
          const div = document.createElement("div");
          const child = document.createElement("div");
          div.append(child);
          child.setAttribute("part", part);
          return div;
        },
      );
    class View {
      #observer = new ResizeObserver(() => this.expand());
      #element = document.createElement("div");
      #iframe = document.createElement("iframe");
      #contentRange = document.createRange();
      #overlayer;
      #vertical = false;
      #rtl = false;
      #column = true;
      #size;
      #layout = {};
      constructor({ container, onExpand }) {
        this.container = container;
        this.onExpand = onExpand;
        this.#iframe.setAttribute("part", "filter");
        this.#element.append(this.#iframe);
        Object.assign(this.#element.style, {
          boxSizing: "content-box",
          position: "relative",
          overflow: "hidden",
          flex: "0 0 auto",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        });
        Object.assign(this.#iframe.style, {
          overflow: "hidden",
          border: "0",
          display: "none",
          width: "100%",
          height: "100%",
        });
        // \`allow-scripts\` is needed for events because of WebKit bug
        // https://bugs.webkit.org/show_bug.cgi?id=218086
        this.#iframe.setAttribute("sandbox", "allow-same-origin allow-scripts");
        this.#iframe.setAttribute("scrolling", "no");
      }
      get element() {
        return this.#element;
      }
      get document() {
        return this.#iframe.contentDocument;
      }
      async load(src, afterLoad, beforeRender) {
        if (typeof src !== "string") throw new Error(\`\${src} is not string\`);
        return new Promise((resolve) => {
          this.#iframe.addEventListener(
            "load",
            () => {
              const doc = this.document;
              afterLoad?.(doc);

              // it needs to be visible for Firefox to get computed style
              this.#iframe.style.display = "block";
              const { vertical, rtl } = getDirection(doc);
              const background = getBackground(doc);
              this.#iframe.style.display = "none";
              this.#vertical = vertical;
              this.#rtl = rtl;
              this.#contentRange.selectNodeContents(doc.body);
              const layout = beforeRender?.({
                vertical,
                rtl,
                background,
              });
              this.#iframe.style.display = "block";
              this.render(layout);
              this.#observer.observe(doc.body);

              // the resize observer above doesn't work in Firefox
              // (see https://bugzilla.mozilla.org/show_bug.cgi?id=1832939)
              // until the bug is fixed we can at least account for font load
              doc.fonts.ready.then(() => this.expand());
              resolve();
            },
            {
              once: true,
            },
          );
          this.#iframe.src = src;
        });
      }
      render(layout) {
        if (!layout) return;
        this.#column = layout.flow !== "scrolled";
        this.#layout = layout;
        if (this.#column) this.columnize(layout);
        else this.scrolled(layout);
      }
      scrolled({ gap, columnWidth }) {
        // debugMessage('[SCROLLED] SCROLLED...')
        const vertical = this.#vertical;
        const doc = this.document;
        Object.assign(doc.documentElement.style, {
          boxSizing: "border-box",
          padding: vertical ? \`\${gap}px 0\` : \`0 \${gap}px\`,
          columnWidth: "auto",
          height: "auto",
          width: "auto",
        });
        Object.assign(doc.body.style, {
          [vertical ? "maxHeight" : "maxWidth"]: \`\${columnWidth}px\`,
          margin: "auto",
        });
        this.setImageSize();
        this.expand();
      }
      columnize({ width, height, gap, columnWidth }) {
        // debugMessage('[COLUMNIZE] COLUMNIZING...')
        const vertical = this.#vertical;
        this.#size = vertical ? height : width;
        const doc = this.document;
        Object.assign(doc.documentElement.style, {
          boxSizing: "border-box",
          columnWidth: \`\${Math.trunc(columnWidth)}px\`,
          columnGap: \`\${gap}px\`,
          columnFill: "auto",
          ...(vertical
            ? {
                width: \`\${width}px\`,
              }
            : {
                height: \`\${height}px\`,
              }),
          padding: vertical ? \`\${gap / 2}px 0\` : \`0 \${gap / 2}px\`,
          overflow: "hidden",
          // force wrap long words
          overflowWrap: "anywhere",
          // reset some potentially problematic props
          position: "static",
          border: "0",
          margin: "0",
          maxHeight: "none",
          maxWidth: "none",
          minHeight: "none",
          minWidth: "none",
          // fix glyph clipping in WebKit
          webkitLineBoxContain: "block glyphs replaced",
        });
        Object.assign(doc.body.style, {
          maxHeight: "none",
          maxWidth: "none",
          margin: "0",
        });
        this.setImageSize();
        this.expand();
      }
      setImageSize() {
        const { width, height, margin } = this.#layout;
        const vertical = this.#vertical;
        const doc = this.document;
        for (const el of doc.body.querySelectorAll("img, svg, video")) {
          // preserve max size if they are already set
          const { maxHeight, maxWidth } = doc.defaultView.getComputedStyle(el);
          Object.assign(el.style, {
            maxHeight: vertical
              ? maxHeight !== "none" && maxHeight !== "0px"
                ? maxHeight
                : "100%"
              : \`\${height - margin * 2}px\`,
            maxWidth: vertical
              ? \`\${width - margin * 2}px\`
              : maxWidth !== "none" && maxWidth !== "0px"
              ? maxWidth
              : "100%",
            objectFit: "contain",
            pageBreakInside: "avoid",
            breakInside: "avoid",
            boxSizing: "border-box",
          });
        }
      }
      expand() {
        // debugMessage('[EXPAND] EXPANDING...')
        if (this.#column) {
          // debugMessage('[EXPAND] COLUMN')
          const side = this.#vertical ? "height" : "width";
          const otherSide = this.#vertical ? "width" : "height";
          const contentSize = this.#contentRange.getBoundingClientRect()[side];
          const pageCount = Math.ceil(contentSize / this.#size);
          const expandedSize = pageCount * this.#size;
          this.#element.style.padding = "0";
          this.#iframe.style[side] = \`\${expandedSize}px\`;
          this.#element.style[side] = \`\${expandedSize + this.#size * 2}px\`;
          this.#iframe.style[otherSide] = "100%";
          this.#element.style[otherSide] = "100%";
          if (this.document)
            this.document.documentElement.style[side] = \`\${this.#size}px\`;
          if (this.#overlayer) {
            this.#overlayer.element.style.margin = "0";
            this.#overlayer.element.style.left = this.#vertical
              ? "0"
              : \`\${this.#size}px\`;
            this.#overlayer.element.style.top = this.#vertical
              ? \`\${this.#size}px\`
              : "0";
            this.#overlayer.element.style[side] = \`\${expandedSize}px\`;
            this.#overlayer.redraw();
          }
        } else {
          // debugMessage('[EXPAND] ELSE')
          const side = this.#vertical ? "width" : "height";
          const otherSide = this.#vertical ? "height" : "width";
          const doc = this.document;
          const contentSize =
            doc?.documentElement?.getBoundingClientRect()?.[side];
          const expandedSize =
            contentSize < this.container.clientHeight
              ? this.container.clientHeight
              : contentSize;
          const { margin } = this.#layout;
          const padding = this.#vertical ? \`0 \${margin}px\` : \`\${margin}px 0\`;
          this.#element.style.padding = padding;
          this.#iframe.style[side] = \`\${expandedSize}px\`;
          this.#element.style[side] = \`\${expandedSize}px\`;
          this.#iframe.style[otherSide] = "100%";
          this.#element.style[otherSide] = "100%";
          if (this.#overlayer) {
            this.#overlayer.element.style.margin = padding;
            this.#overlayer.element.style.left = "0";
            this.#overlayer.element.style.top = "0";
            this.#overlayer.element.style[side] = \`\${expandedSize}px\`;
            this.#overlayer.redraw();
          }
        }
        this.onExpand();
      }
      set overlayer(overlayer) {
        this.#overlayer = overlayer;
        this.#element.append(overlayer.element);
      }
      get overlayer() {
        return this.#overlayer;
      }
      destroy() {
        if (this.document) this.#observer.unobserve(this.document.body);
      }
    }

    // NOTE: everything here assumes the so-called "negative scroll type" for RTL
    class Paginator extends HTMLElement {
      static observedAttributes = [
        "flow",
        "gap",
        "margin",
        "max-inline-size",
        "max-block-size",
        "max-column-count",
      ];
      #root = this.attachShadow({
        mode: "open",
      });
      #observer = new ResizeObserver(() => this.render());
      #background;
      #container;
      #header;
      #footer;
      #view;
      #vertical = false;
      #rtl = false;
      #margin = 0;
      #index = -1;
      #anchor = 0; // anchor view to a fraction (0-1), Range, or Element
      #justAnchored = false;
      #locked = false; // while true, prevent any further navigation
      #styles;
      #styleMap = new WeakMap();
      #scrollBounds;
      #touchState;
      #touchScrolled;
      pageAnimation = true;
      #canGoToNextSection = false;
      #canGoToPrevSection = false;
      #goingNext = false;
      #goingPrev = false;
      constructor() {
        super();
        this.#root.innerHTML = \`<style>
        :host {
            --_gap: 7%;
            --_margin: 48px;
            --_max-inline-size: 720px;
            --_max-block-size: 1440px;
            --_max-column-count: 2;
            --_vertical: 0;
            --_half-gap: calc(var(--_gap) / 2);
            --_max-width: calc(
                var(--_vertical) * var(--_max-block-size)
                + (1 - var(--_vertical)) * var(--_max-inline-size) * var(--_max-column-count)
            );
            --_max-height: calc(
                var(--_vertical) * var(--_max-inline-size) * var(--_max-column-count)
                + (1 - var(--_vertical)) * var(--_max-block-size)
            );
            display: grid;
            grid-template-columns:
                minmax(var(--_half-gap), 1fr)
                minmax(0, var(--_max-width))
                minmax(var(--_half-gap), 1fr);
            grid-template-rows:
                minmax(var(--_margin), 1fr)
                minmax(0, var(--_max-height))
                minmax(var(--_margin), 1fr);
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }
        #background {
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 4;
        }
        #container {
            grid-column-start: 2;
            grid-row-start: 2;
            overflow: hidden;
        }
        :host([flow="scrolled"]) #container {
            grid-column-start: 1;
            grid-column-end: 4;
            grid-row-start: 1;
            grid-row-end: 4;
            overflow: auto;
        }
        #header {
            grid-column-start: 2;
            grid-row-start: 1;
        }
        #footer {
            grid-column-start: 2;
            grid-row-start: 3;
            align-self: end;
        }
        #header, #footer {
            display: grid;
            height: var(--_margin);
        }
        :is(#header, #footer) > * {
            display: flex;
            align-items: center;
            min-width: 0;
        }
        :is(#header, #footer) > * > * {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: center;
            font-size: .75em;
            opacity: .6;
        }
        </style>
        <div id="background" part="filter"></div>
        <div id="header"></div>
        <div id="container"></div>
        <div id="footer"></div>
        \`;
        this.#background = this.#root.getElementById("background");
        this.#container = this.#root.getElementById("container");
        this.#header = this.#root.getElementById("header");
        this.#footer = this.#root.getElementById("footer");
        this.#observer.observe(this.#container);
        this.#container.addEventListener(
          "scroll",
          debounce(() => {
            if (this.scrolled) {
              if (this.#justAnchored) this.#justAnchored = false;
              else this.#afterScroll("scroll");
            }
          }, 250),
        );
        const opts = {
          passive: false,
        };
        this.addEventListener(
          "touchstart",
          this.#onTouchStart.bind(this),
          opts,
        );
        this.addEventListener("touchmove", this.#onTouchMove.bind(this), opts);
        this.addEventListener("touchend", this.#onTouchEnd.bind(this));
        this.addEventListener("load", ({ detail: { doc } }) => {
          doc.addEventListener(
            "touchstart",
            this.#onTouchStart.bind(this),
            opts,
          );
          doc.addEventListener("touchmove", this.#onTouchMove.bind(this), opts);
          doc.addEventListener("touchend", this.#onTouchEnd.bind(this));
        });
        debugMessage("[PAGINATOR] INITED");
      }
      attributeChangedCallback(name, _, value) {
        switch (name) {
          case "flow":
            this.render();
            break;
          case "gap":
          case "margin":
          case "max-block-size":
          case "max-column-count":
            this.style.setProperty("--_" + name, value);
            break;
          case "max-inline-size":
            // needs explicit \`render()\` as it doesn't necessarily resize
            this.style.setProperty("--_" + name, value);
            this.render();
            break;
        }
      }
      open(book) {
        this.bookDir = book.dir;
        this.sections = book.sections;
      }
      #createView() {
        if (this.#view) this.#container.removeChild(this.#view.element);
        // debugMessage(\`[CREATEVIEW] anchor \${this.#anchor} \${JSON.stringify(this.#anchor)}\`)
        this.#view = new View({
          container: this,
          onExpand: () => this.scrollToAnchor(this.#anchor),
        });
        this.#container.append(this.#view.element);
        return this.#view;
      }
      #beforeRender({ vertical, rtl, background }) {
        this.#vertical = vertical;
        this.#rtl = rtl;
        this.style.setProperty("--_vertical", vertical ? 1 : 0);

        // set background to \`doc\` background
        // this is needed because the iframe does not fill the whole element
        this.#background.style.background = background;
        const { width, height } = this.#container.getBoundingClientRect();
        const size = vertical ? height : width;
        const style = getComputedStyle(this);
        const maxInlineSize = parseFloat(
          style.getPropertyValue("--_max-inline-size"),
        );
        const maxColumnCount = parseInt(
          style.getPropertyValue("--_max-column-count"),
        );
        const margin = parseFloat(style.getPropertyValue("--_margin"));
        this.#margin = margin;
        const g = parseFloat(style.getPropertyValue("--_gap")) / 100;
        // The gap will be a percentage of the #container, not the whole view.
        // This means the outer padding will be bigger than the column gap. Let
        // \`a\` be the gap percentage. The actual percentage for the column gap
        // will be (1 - a) * a. Let us call this \`b\`.
        //
        // To make them the same, we start by shrinking the outer padding
        // setting to \`b\`, but keep the column gap setting the same at \`a\`. Then
        // the actual size for the column gap will be (1 - b) * a. Repeating the
        // process again and again, we get the sequence
        //     x₁ = (1 - b) * a
        //     x₂ = (1 - x₁) * a
        //     ...
        // which converges to x = (1 - x) * a. Solving for x, x = a / (1 + a).
        // So to make the spacing even, we must shrink the outer padding with
        //     f(x) = x / (1 + x).
        // But we want to keep the outer padding, and make the inner gap bigger.
        // So we apply the inverse, f⁻¹ = -x / (x - 1) to the column gap.
        const gap = (-g / (g - 1)) * size;
        const flow = this.getAttribute("flow");
        if (flow === "scrolled") {
          // FIXME: vertical-rl only, not -lr
          this.setAttribute("dir", vertical ? "rtl" : "ltr");
          this.style.padding = "0";
          const columnWidth = maxInlineSize;
          this.heads = null;
          this.feet = null;
          this.#header.replaceChildren();
          this.#footer.replaceChildren();
          return {
            flow,
            margin,
            gap,
            columnWidth,
          };
        }
        const divisor = Math.min(
          maxColumnCount,
          Math.ceil(size / maxInlineSize),
        );
        const columnWidth = size / divisor - gap;
        this.setAttribute("dir", rtl ? "rtl" : "ltr");
        const marginalDivisor = vertical
          ? Math.min(2, Math.ceil(width / maxInlineSize))
          : divisor;
        const marginalStyle = {
          gridTemplateColumns: \`repeat(\${marginalDivisor}, 1fr)\`,
          gap: \`\${gap}px\`,
          padding: vertical ? "0" : \`0 \${gap / 2}px\`,
          direction: this.bookDir === "rtl" ? "rtl" : "ltr",
        };
        Object.assign(this.#header.style, marginalStyle);
        Object.assign(this.#footer.style, marginalStyle);
        const heads = makeMarginals(marginalDivisor, "head");
        const feet = makeMarginals(marginalDivisor, "foot");
        this.heads = heads.map((el) => el.children[0]);
        this.feet = feet.map((el) => el.children[0]);
        this.#header.replaceChildren(...heads);
        this.#footer.replaceChildren(...feet);
        return {
          height,
          width,
          margin,
          gap,
          columnWidth,
        };
      }
      render() {
        if (!this.#view) return;
        // debugMessage('[RENDER]')
        this.#view.render(
          this.#beforeRender({
            vertical: this.#vertical,
            rtl: this.#rtl,
          }),
        );
        this.scrollToAnchor(this.#anchor);
      }
      get scrolled() {
        return this.getAttribute("flow") === "scrolled";
      }
      get scrollProp() {
        const { scrolled } = this;
        return this.#vertical
          ? scrolled
            ? "scrollLeft"
            : "scrollTop"
          : scrolled
          ? "scrollTop"
          : "scrollLeft";
      }
      get sideProp() {
        const { scrolled } = this;
        return this.#vertical
          ? scrolled
            ? "width"
            : "height"
          : scrolled
          ? "height"
          : "width";
      }
      get size() {
        return this.#container.getBoundingClientRect()[this.sideProp];
      }
      get viewSize() {
        return this.#view.element.getBoundingClientRect()[this.sideProp];
      }
      get start() {
        return Math.abs(this.#container[this.scrollProp]);
      }
      get end() {
        return this.start + this.size;
      }
      get page() {
        return Math.floor((this.start + this.end) / 2 / this.size);
      }
      get pages() {
        return Math.round(this.viewSize / this.size);
      }
      scrollBy(dx, dy) {
        const delta = this.#vertical ? dy : dx;
        const element = this.#container;
        const { scrollProp } = this;
        const [offset, a, b] = this.#scrollBounds;
        const rtl = this.#rtl;
        const min = rtl ? offset - b : offset - a;
        const max = rtl ? offset + a : offset + b;
        element[scrollProp] = Math.max(
          min,
          Math.min(max, element[scrollProp] + delta),
        );
      }
      snap(vx, vy) {
        const velocity = this.#vertical ? vy : vx;
        const [offset, a, b] = this.#scrollBounds;
        const { start, end, pages, size } = this;
        const min = Math.abs(offset) - a;
        const max = Math.abs(offset) + b;
        const d = velocity * (this.#rtl ? -size : size);
        const page = Math.floor(
          Math.max(min, Math.min(max, (start + end) / 2 + (isNaN(d) ? 0 : d))) /
            size,
        );
        const dir = page <= 0 ? -1 : page >= pages - 1 ? 1 : null;
        if (dir) {
          if (this.lastCalled) {
            this.now = Date.now();
            const elapsed = this.now - this.lastCalled;
            this.lastCalled = null;
            if (elapsed < 325) {
              return;
            }
          }
          this.lastCalled = Date.now();
        }
        this.#scrollToPage(page, "snap").then(() => {
          if (dir)
            return this.#goTo({
              index: this.#adjacentIndex(dir),
              anchor: dir < 0 ? () => 1 : () => 0,
            });
        });
      }
      #onTouchStart(e) {
        const touch = e.changedTouches[0];
        this.#touchState = {
          x: touch?.screenX,
          y: touch?.screenY,
          t: e.timeStamp,
          vx: 0,
          xy: 0,
        };
      }
      #onTouchMove(e) {
        const state = this.#touchState;
        if (state.pinched) return;
        state.pinched = globalThis.visualViewport.scale > 1;
        if (this.scrolled || state.pinched) {
          if (this.hasChecked && this.scrolled) {
            this.hasChecked = false;
            this.#check();
          } else {
            this.hasChecked = true;
          }
          return;
        }
        if (e.touches.length > 1) {
          if (this.#touchScrolled) e.preventDefault();
          return;
        }
        e.preventDefault();
        const touch = e.changedTouches[0];
        const x = touch.screenX,
          y = touch.screenY;
        const dx = state.x - x,
          dy = state.y - y;
        const dt = e.timeStamp - state.t;
        state.x = x;
        state.y = y;
        state.t = e.timeStamp;
        state.vx = dx / dt;
        state.vy = dy / dt;
        this.#touchScrolled = true;
        this.scrollBy(dx, dy);
      }
      #onTouchEnd() {
        this.#touchScrolled = false;
        if (this.scrolled) {
          if (this.#canGoToNextSection) {
            this.nextSection().then(() => {
              this.#goingNext = true;
            });
            this.dispatchEvent(
              new CustomEvent("next", {
                detail: {
                  show: false,
                },
              }),
            );
          }
          if (this.#canGoToPrevSection) {
            this.prevSection().then(() => {
              this.#goingPrev = true;
            });
            this.dispatchEvent(
              new CustomEvent("previous", {
                detail: {
                  show: false,
                },
              }),
            );
          }
          this.#canGoToPrevSection = false;
          this.#canGoToNextSection = false;
          return;
        }

        // XXX: Firefox seems to report scale as 1... sometimes...?
        // at this point I'm basically throwing \`requestAnimationFrame\` at
        // anything that doesn't work
        requestAnimationFrame(() => {
          if (globalThis.visualViewport.scale === 1)
            this.snap(this.#touchState.vx, this.#touchState.vy);
        });
      }
      #check() {
        if (this.scrolled) {
          const scrollTop = this.#container.scrollTop;
          const scrollheight = this.#container.scrollHeight;
          const start = scrollTop;
          const end = this.end - scrollheight;
          if (end > 50) {
            if (this.atEnd || this.#canGoToPrevSection) return;
            this.#canGoToNextSection = true;
            this.dispatchEvent(
              new CustomEvent("next", {
                detail: {
                  show: true,
                },
              }),
            );
            return;
          }
          if (start < -50) {
            if (this.atStart || this.#canGoToNextSection) return;
            this.#canGoToPrevSection = true;
            this.dispatchEvent(
              new CustomEvent("previous", {
                detail: {
                  show: true,
                },
              }),
            );
            return;
          }

          // this.#canGoToPrevSection = false
          // this.#canGoToNextSection = false

          if (this.sentEvent) {
            this.sentEvent = false;
            this.dispatchEvent(
              new CustomEvent("next", {
                detail: {
                  show: false,
                },
              }),
            );
            this.dispatchEvent(
              new CustomEvent("previous", {
                detail: {
                  show: false,
                },
              }),
            );
          } else {
            this.sentEvent = true;
          }
        }
      }
      // allows one to process rects as if they were LTR and horizontal
      #getRectMapper() {
        if (this.scrolled) {
          const size = this.viewSize;
          const margin = this.#margin;
          return this.#vertical
            ? ({ left, right }) => ({
                left: size - right - margin,
                right: size - left - margin,
              })
            : ({ top, bottom }) => ({
                left: top + margin,
                right: bottom + margin,
              });
        }
        const pxSize = this.pages * this.size;
        return this.#rtl
          ? ({ left, right }) => ({
              left: pxSize - right,
              right: pxSize - left,
            })
          : this.#vertical
          ? ({ top, bottom }) => ({
              left: top,
              right: bottom,
            })
          : (f) => f;
      }
      async #scrollToRect(rect, reason) {
        if (this.scrolled) {
          const offset = this.#getRectMapper()(rect).left - this.#margin;
          return this.#scrollTo(offset, reason);
        }
        const offset = this.#getRectMapper()(rect).left + this.#margin / 2;
        return this.#scrollToPage(
          Math.floor(offset / this.size) + (this.#rtl ? -1 : 1),
          reason,
        );
      }
      async #scrollTo(offset, reason, smooth) {
        const element = this.#container;
        const { scrollProp, size } = this;
        if (element[scrollProp] === offset) {
          this.#scrollBounds = [
            offset,
            this.atStart ? 0 : size,
            this.atEnd ? 0 : size,
          ];
          this.#afterScroll(reason);
          return;
        }
        // FIXME: vertical-rl only, not -lr
        if (this.scrolled && this.#vertical) offset = -offset;
        if (reason === "snap" || (smooth && this.pageAnimation))
          return animate(
            element[scrollProp],
            offset,
            300,
            easeOutQuad,
            (x) => (element[scrollProp] = x),
          ).then(() => {
            this.#scrollBounds = [
              offset,
              this.atStart ? 0 : size,
              this.atEnd ? 0 : size,
            ];
            this.#afterScroll(reason);
          });
        else {
          element[scrollProp] = offset;
          this.#scrollBounds = [
            offset,
            this.atStart ? 0 : size,
            this.atEnd ? 0 : size,
          ];
          this.#afterScroll(reason);
        }
      }
      async #scrollToPage(page, reason, smooth) {
        const offset = this.size * (this.#rtl ? -page : page);
        return this.#scrollTo(offset, reason, smooth);
      }
      async scrollToAnchor(anchor, select) {
        this.#anchor = anchor;
        const rects = uncollapse(anchor)?.getClientRects?.();
        // if anchor is an element or a range
        if (rects) {
          // when the start of the range is immediately after a hyphen in the
          // previous column, there is an extra zero width rect in that column
          const rect =
            Array.from(rects).find((r) => r.width > 0 && r.height > 0) ||
            rects[0];
          if (!rect) return;
          await this.#scrollToRect(rect, "anchor");
          if (select) this.#selectAnchor();
          return;
        }
        // if anchor is a fraction
        if (this.scrolled) {
          if (this.#goingPrev || this.#goingNext) {
            if (this.#goingPrev) {
              await this.#scrollTo(this.viewSize, "anchor");
              this.#goingPrev = false;
              return;
            } else {
              await this.#scrollTo(0, "anchor");
              this.#goingNext = false;
              return;
            }
          }
          // idk what this.#anchor is ????
          this.#anchor &&
            debugMessage(
              \`[SCROLLTOANCHOR] anchor \${JSON.stringify(this.#anchor)} \${
                this.#anchor
              }\`,
            );
          // await this.#scrollTo(this.#anchor * this.viewSize, 'anchor')
          return;
        }
        const { pages } = this;
        if (!pages) return;
        const textPages = pages - 2;
        const newPage = Math.round(anchor * (textPages - 1));
        await this.#scrollToPage(newPage + 1, "anchor");
      }
      #selectAnchor() {
        const { defaultView } = this.#view.document;
        if (this.#anchor.startContainer) {
          const sel = defaultView.getSelection();
          sel.removeAllRanges();
          sel.addRange(this.#anchor);
        }
      }
      #getVisibleRange() {
        if (this.scrolled)
          return getVisibleRange(
            this.#view.document,
            this.start + this.#margin,
            this.end - this.#margin,
            this.#getRectMapper(),
          );
        const size = this.#rtl ? -this.size : this.size;
        return getVisibleRange(
          this.#view.document,
          this.start - size,
          this.end - size,
          this.#getRectMapper(),
        );
      }
      #afterScroll(reason) {
        const range = this.#getVisibleRange();
        // don't set new anchor if relocation was to scroll to anchor
        if (reason !== "anchor") this.#anchor = range;
        else this.#justAnchored = true;
        const index = this.#index;
        const detail = {
          reason,
          range,
          index,
        };
        if (this.scrolled) detail.fraction = this.start / this.viewSize;
        else if (this.pages > 0) {
          const { page, pages } = this;
          this.#header.style.visibility = page > 1 ? "visible" : "hidden";
          detail.fraction = (page - 1) / (pages - 2);
          detail.size = 1 / (pages - 2);
        }
        this.dispatchEvent(
          new CustomEvent("relocate", {
            detail,
          }),
        );
      }
      async #display(promise) {
        const { index, src, anchor, onLoad, select } = await promise;
        this.#index = index;
        if (src) {
          const view = this.#createView();
          const afterLoad = (doc) => {
            if (doc.head) {
              const \$styleBefore = doc.createElement("style");
              doc.head.prepend(\$styleBefore);
              const \$style = doc.createElement("style");
              doc.head.append(\$style);
              this.#styleMap.set(doc, [\$styleBefore, \$style]);
            }
            onLoad?.({
              doc,
              index,
            });
          };
          const beforeRender = this.#beforeRender.bind(this);
          await view.load(src, afterLoad, beforeRender);
          this.dispatchEvent(
            new CustomEvent("create-overlayer", {
              detail: {
                doc: view.document,
                index,
                attach: (overlayer) => (view.overlayer = overlayer),
              },
            }),
          );
          this.#view = view;
        }
        await this.scrollToAnchor(
          (typeof anchor === "function"
            ? anchor(this.#view.document)
            : anchor) ?? 0,
          select,
        );
      }
      #canGoToIndex(index) {
        return index >= 0 && index <= this.sections.length - 1;
      }
      async #goTo({ index, anchor, select }) {
        if (index === this.#index)
          await this.#display({
            index,
            anchor,
            select,
          });
        else {
          const oldIndex = this.#index;
          const onLoad = (detail) => {
            this.sections[oldIndex]?.unload?.();
            this.setStyles(this.#styles);
            this.dispatchEvent(
              new CustomEvent("load", {
                detail,
              }),
            );
          };
          await this.#display(
            Promise.resolve(this.sections[index].load())
              .then((src) => ({
                index,
                src,
                anchor,
                onLoad,
                select,
              }))
              .catch((e) => {
                console.warn(e);
                console.warn(new Error(\`Failed to load section \${index}\`));
                return {};
              }),
          );
        }
      }
      async goTo(target) {
        if (this.#locked) return;
        const resolved = await target;
        if (this.#canGoToIndex(resolved.index)) return this.#goTo(resolved);
      }
      #scrollPrev(distance) {
        if (!this.#view) return true;
        if (this.scrolled) {
          if (this.start > 0)
            return this.#scrollTo(
              Math.max(0, this.start - (distance ?? this.size)),
              null,
              true,
            );
          return true;
        }
        if (this.atStart) return;
        const page = this.page - 1;
        return this.#scrollToPage(page, "page", true).then(() => page <= 0);
      }
      #scrollNext(distance) {
        if (!this.#view) return true;
        if (this.scrolled) {
          if (this.viewSize - this.end > 2)
            return this.#scrollTo(
              Math.min(
                this.viewSize,
                distance ? this.start + distance : this.end,
              ),
              null,
              true,
            );
          return true;
        }
        if (this.atEnd) return;
        const page = this.page + 1;
        const pages = this.pages;
        return this.#scrollToPage(page, "page", true).then(
          () => page >= pages - 1,
        );
      }
      get atStart() {
        return this.#adjacentIndex(-1) == null && this.page <= 1;
      }
      get atEnd() {
        return this.#adjacentIndex(1) == null && this.page >= this.pages - 2;
      }
      #adjacentIndex(dir) {
        for (
          let index = this.#index + dir;
          this.#canGoToIndex(index);
          index += dir
        )
          if (this.sections[index]?.linear !== "no") return index;
      }
      async #turnPage(dir, distance) {
        if (this.#locked) return;
        this.#locked = true;
        const prev = dir === -1;
        const shouldGo = await (prev
          ? this.#scrollPrev(distance)
          : this.#scrollNext(distance));
        if (shouldGo)
          await this.#goTo({
            index: this.#adjacentIndex(dir),
            anchor: prev ? () => 1 : () => 0,
          });
        if (shouldGo || !this.pageAnimation) await wait(100);
        this.#locked = false;
      }
      prev(distance) {
        return this.#turnPage(-1, distance);
      }
      next(distance) {
        return this.#turnPage(1, distance);
      }
      prevSection() {
        return this.goTo({
          index: this.#adjacentIndex(-1),
        });
      }
      nextSection() {
        return this.goTo({
          index: this.#adjacentIndex(1),
        });
      }
      firstSection() {
        const index = this.sections.findIndex(
          (section) => section.linear !== "no",
        );
        return this.goTo({
          index,
        });
      }
      lastSection() {
        const index = this.sections.findLastIndex(
          (section) => section.linear !== "no",
        );
        return this.goTo({
          index,
        });
      }
      getContents() {
        if (this.#view)
          return [
            {
              index: this.#index,
              overlayer: this.#view.overlayer,
              doc: this.#view.document,
            },
          ];
        return [];
      }
      setStyles(styles) {
        this.#styles = styles;
        const \$\$styles = this.#styleMap.get(this.#view?.document);
        if (!\$\$styles) return;
        const [\$beforeStyle, \$style] = \$\$styles;
        if (Array.isArray(styles)) {
          const [beforeStyle, style] = styles;
          \$beforeStyle.textContent = beforeStyle;
          \$style.textContent = style;
        } else \$style.textContent = styles;

        // needed because the resize observer doesn't work in Firefox
        this.#view?.document?.fonts?.ready?.then(() => this.#view.expand());
      }
      destroy() {
        this.#observer.unobserve(this);
        this.#view.destroy();
        this.#view = null;
        this.sections[this.#index]?.unload?.();
      }
    }
    customElements.define("foliate-paginator", Paginator); // CONCATENATED MODULE: ./my-foliate/search.js
    // length for context in excerpts
    const CONTEXT_LENGTH = 50;
    const normalizeWhitespace = (str) => str.replace(/\\s+/g, " ");
    const makeExcerpt = (
      strs,
      { startIndex, startOffset, endIndex, endOffset },
    ) => {
      const start = strs[startIndex];
      const end = strs[endIndex];
      const match =
        start === end
          ? start.slice(startOffset, endOffset)
          : start.slice(startOffset) +
            strs.slice(start + 1, end).join("") +
            end.slice(0, endOffset);
      const trimmedStart = normalizeWhitespace(
        start.slice(0, startOffset),
      ).trimStart();
      const trimmedEnd = normalizeWhitespace(end.slice(endOffset)).trimEnd();
      const ellipsisPre = trimmedStart.length < CONTEXT_LENGTH ? "" : "…";
      const ellipsisPost = trimmedEnd.length < CONTEXT_LENGTH ? "" : "…";
      const pre = \`\${ellipsisPre}\${trimmedStart.slice(-CONTEXT_LENGTH)}\`;
      const post = \`\${trimmedEnd.slice(0, CONTEXT_LENGTH)}\${ellipsisPost}\`;
      return {
        pre,
        match,
        post,
      };
    };
    const simpleSearch = function* (strs, query, options = {}) {
      const { locales = "en", sensitivity } = options;
      const matchCase = sensitivity === "variant";
      const haystack = strs.join("");
      const lowerHaystack = matchCase
        ? haystack
        : haystack.toLocaleLowerCase(locales);
      const needle = matchCase ? query : query.toLocaleLowerCase(locales);
      const needleLength = needle.length;
      let index = -1;
      let strIndex = -1;
      let sum = 0;
      do {
        index = lowerHaystack.indexOf(needle, index + 1);
        if (index > -1) {
          while (sum <= index) sum += strs[++strIndex].length;
          const startIndex = strIndex;
          const startOffset = index - (sum - strs[strIndex].length);
          const end = index + needleLength;
          while (sum <= end) sum += strs[++strIndex].length;
          const endIndex = strIndex;
          const endOffset = end - (sum - strs[strIndex].length);
          const range = {
            startIndex,
            startOffset,
            endIndex,
            endOffset,
          };
          yield {
            range,
            excerpt: makeExcerpt(strs, range),
          };
        }
      } while (index > -1);
    };
    const segmenterSearch = function* (strs, query, options = {}) {
      const {
        locales = "en",
        granularity = "word",
        sensitivity = "base",
      } = options;
      let segmenter, collator;
      try {
        segmenter = new Intl.Segmenter(locales, {
          usage: "search",
          granularity,
        });
        collator = new Intl.Collator(locales, {
          sensitivity,
        });
      } catch (e) {
        console.warn(e);
        segmenter = new Intl.Segmenter("en", {
          usage: "search",
          granularity,
        });
        collator = new Intl.Collator("en", {
          sensitivity,
        });
      }
      const queryLength = Array.from(segmenter.segment(query)).length;
      const substrArr = [];
      let strIndex = 0;
      let segments = segmenter.segment(strs[strIndex])[Symbol.iterator]();
      main: while (strIndex < strs.length) {
        while (substrArr.length < queryLength) {
          const { done, value } = segments.next();
          if (done) {
            // the current string is exhausted
            // move on to the next string
            strIndex++;
            if (strIndex < strs.length) {
              segments = segmenter.segment(strs[strIndex])[Symbol.iterator]();
              continue;
            } else break main;
          }
          const { index, segment } = value;
          // ignore formatting characters
          if (!/[^\\p{Format}]/u.test(segment)) continue;
          // normalize whitespace
          if (/\\s/u.test(segment)) {
            if (!/\\s/u.test(substrArr[substrArr.length - 1]?.segment))
              substrArr.push({
                strIndex,
                index,
                segment: " ",
              });
            continue;
          }
          value.strIndex = strIndex;
          substrArr.push(value);
        }
        const substr = substrArr.map((x) => x.segment).join("");
        if (collator.compare(query, substr) === 0) {
          const endIndex = strIndex;
          const lastSeg = substrArr[substrArr.length - 1];
          const endOffset = lastSeg.index + lastSeg.segment.length;
          const startIndex = substrArr[0].strIndex;
          const startOffset = substrArr[0].index;
          const range = {
            startIndex,
            startOffset,
            endIndex,
            endOffset,
          };
          yield {
            range,
            excerpt: makeExcerpt(strs, range),
          };
        }
        substrArr.shift();
      }
    };
    const search = (strs, query, options) => {
      const { granularity = "grapheme", sensitivity = "base" } = options;
      if (
        !Intl?.Segmenter ||
        (granularity === "grapheme" &&
          (sensitivity === "variant" || sensitivity === "accent"))
      )
        return simpleSearch(strs, query, options);
      return segmenterSearch(strs, query, options);
    };
    const searchMatcher = (textWalker, opts) => {
      const { defalutLocale, matchCase, matchDiacritics, matchWholeWords } =
        opts;
      return function* (doc, query) {
        const iter = textWalker(doc, function* (strs, makeRange) {
          for (const result of search(strs, query, {
            locales:
              doc.body.lang ||
              doc.documentElement.lang ||
              defalutLocale ||
              "en",
            granularity: matchWholeWords ? "word" : "grapheme",
            sensitivity:
              matchDiacritics && matchCase
                ? "variant"
                : matchDiacritics && !matchCase
                ? "accent"
                : !matchDiacritics && matchCase
                ? "case"
                : "base",
          })) {
            const { startIndex, startOffset, endIndex, endOffset } =
              result.range;
            result.range = makeRange(
              startIndex,
              startOffset,
              endIndex,
              endOffset,
            );
            yield result;
          }
        });
        for (const result of iter) yield result;
      };
    }; // CONCATENATED MODULE: ./my-foliate/tts.js
    const NS = {
      XML: "http://www.w3.org/XML/1998/namespace",
      SSML: "http://www.w3.org/2001/10/synthesis",
    };
    const blockTags = new Set([
      "article",
      "aside",
      "audio",
      "blockquote",
      "caption",
      "details",
      "dialog",
      "div",
      "dl",
      "dt",
      "dd",
      "figure",
      "footer",
      "form",
      "figcaption",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "header",
      "hgroup",
      "hr",
      "li",
      "main",
      "math",
      "nav",
      "ol",
      "p",
      "pre",
      "section",
      "tr",
    ]);
    const getLang = (el) => {
      const x = el.lang || el?.getAttributeNS?.(NS.XML, "lang");
      return x ? x : el.parentElement ? getLang(el.parentElement) : null;
    };
    const getAlphabet = (el) => {
      const x = el?.getAttributeNS?.(NS.XML, "lang");
      return x ? x : el.parentElement ? getAlphabet(el.parentElement) : null;
    };
    const getSegmenter = (lang = "en", granularity = "word") => {
      const segmenter = new Intl.Segmenter(lang, {
        granularity,
      });
      const granularityIsWord = granularity === "word";
      return function* (strs, makeRange) {
        const str = strs.join("");
        let name = 0;
        let strIndex = -1;
        let sum = 0;
        for (const { index, segment, isWordLike } of segmenter.segment(str)) {
          if (granularityIsWord && !isWordLike) continue;
          while (sum <= index) sum += strs[++strIndex].length;
          const startIndex = strIndex;
          const startOffset = index - (sum - strs[strIndex].length);
          const end = index + segment.length;
          if (end < str.length)
            while (sum <= end) sum += strs[++strIndex].length;
          const endIndex = strIndex;
          const endOffset = end - (sum - strs[strIndex].length);
          yield [
            (name++).toString(),
            makeRange(startIndex, startOffset, endIndex, endOffset),
          ];
        }
      };
    };
    const fragmentToSSML = (fragment, inherited) => {
      const ssml = document.implementation.createDocument(NS.SSML, "speak");
      const { lang } = inherited;
      if (lang) ssml.documentElement.setAttributeNS(NS.XML, "lang", lang);
      const convert = (node, parent, inheritedAlphabet) => {
        if (!node) return;
        if (node.nodeType === 3) return ssml.createTextNode(node.textContent);
        if (node.nodeType === 4)
          return ssml.createCDATASection(node.textContent);
        if (node.nodeType !== 1) return;
        let el;
        const nodeName = node.nodeName.toLowerCase();
        if (nodeName === "foliate-mark") {
          el = ssml.createElementNS(NS.SSML, "mark");
          el.setAttribute("name", node.dataset.name);
        } else if (nodeName === "br")
          el = ssml.createElementNS(NS.SSML, "break");
        else if (nodeName === "em" || nodeName === "strong")
          el = ssml.createElementNS(NS.SSML, "emphasis");
        const lang = node.lang || node.getAttributeNS(NS.XML, "lang");
        if (lang) {
          if (!el) el = ssml.createElementNS(NS.SSML, "lang");
          el.setAttributeNS(NS.XML, "lang", lang);
        }
        const alphabet =
          node.getAttributeNS(NS.SSML, "alphabet") || inheritedAlphabet;
        if (!el) {
          const ph = node.getAttributeNS(NS.SSML, "ph");
          if (ph) {
            el = ssml.createElementNS(NS.SSML, "phoneme");
            if (alphabet) el.setAttribute("alphabet", alphabet);
            el.setAttribute("ph", ph);
          }
        }
        if (!el) el = parent;
        let child = node.firstChild;
        while (child) {
          const childEl = convert(child, el, alphabet);
          if (childEl && el !== childEl) el.append(childEl);
          child = child.nextSibling;
        }
        return el;
      };
      convert(fragment.firstChild, ssml.documentElement, inherited.alphabet);
      return ssml;
    };
    const getFragmentWithMarks = (range, textWalker, granularity) => {
      const lang = getLang(range.commonAncestorContainer);
      const alphabet = getAlphabet(range.commonAncestorContainer);
      const segmenter = getSegmenter(lang, granularity);
      const fragment = range.cloneContents();

      // we need ranges on both the original document (for highlighting)
      // and the document fragment (for inserting marks)
      // so unfortunately need to do it twice, as you can't copy the ranges
      const entries = [...textWalker(range, segmenter)];
      const fragmentEntries = [...textWalker(fragment, segmenter)];
      for (const [name, range] of fragmentEntries) {
        const mark = document.createElement("foliate-mark");
        mark.dataset.name = name;
        range.insertNode(mark);
      }
      const ssml = fragmentToSSML(fragment, {
        lang,
        alphabet,
      });
      return {
        entries,
        ssml,
      };
    };
    const rangeIsEmpty = (range) => !range.toString().trim();
    function* getBlocks(doc) {
      let last;
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const name = node.tagName.toLowerCase();
        if (blockTags.has(name)) {
          if (last) {
            last.setEndBefore(node);
            if (!rangeIsEmpty(last)) yield last;
          }
          last = doc.createRange();
          last.setStart(node, 0);
        }
      }
      if (!last) {
        last = doc.createRange();
        last.setStart(doc.body.firstChild ?? doc.body, 0);
      }
      last.setEndAfter(doc.body.lastChild ?? doc.body);
      if (!rangeIsEmpty(last)) yield last;
    }
    class ListIterator {
      #arr = [];
      #iter;
      #index = -1;
      #f;
      constructor(iter, f = (x) => x) {
        this.#iter = iter;
        this.#f = f;
      }
      current() {
        if (this.#arr[this.#index]) return this.#f(this.#arr[this.#index]);
      }
      first() {
        const newIndex = 0;
        if (this.#arr[newIndex]) {
          this.#index = newIndex;
          return this.#f(this.#arr[newIndex]);
        }
      }
      prev() {
        const newIndex = this.#index - 1;
        if (this.#arr[newIndex]) {
          this.#index = newIndex;
          return this.#f(this.#arr[newIndex]);
        }
      }
      next() {
        const newIndex = this.#index + 1;
        if (this.#arr[newIndex]) {
          this.#index = newIndex;
          return this.#f(this.#arr[newIndex]);
        }
        while (true) {
          const { done, value } = this.#iter.next();
          if (done) break;
          this.#arr.push(value);
          if (this.#arr[newIndex]) {
            this.#index = newIndex;
            return this.#f(this.#arr[newIndex]);
          }
        }
      }
      find(f) {
        const index = this.#arr.findIndex((x) => f(x));
        if (index > -1) {
          this.#index = index;
          return this.#f(this.#arr[index]);
        }
        while (true) {
          const { done, value } = this.#iter.next();
          if (done) break;
          this.#arr.push(value);
          if (f(value)) {
            this.#index = this.#arr.length - 1;
            return this.#f(value);
          }
        }
      }
    }
    class TTS {
      #list;
      #ranges;
      #lastMark;
      #serializer = new XMLSerializer();
      constructor(doc, textWalker, highlight) {
        this.doc = doc;
        this.highlight = highlight;
        this.#list = new ListIterator(getBlocks(doc), (range) => {
          const { entries, ssml } = getFragmentWithMarks(range, textWalker);
          this.#ranges = new Map(entries);
          return [ssml, range];
        });
      }
      #getMarkElement(doc, mark) {
        if (!mark) return null;
        return doc.querySelector(\`mark[name="\${CSS.escape(mark)}"\`);
      }
      #speak(doc, getNode) {
        if (!doc) return;
        if (!getNode) return this.#serializer.serializeToString(doc);
        const ssml = document.implementation.createDocument(NS.SSML, "speak");
        ssml.documentElement.replaceWith(
          ssml.importNode(doc.documentElement, true),
        );
        let node = getNode(ssml)?.previousSibling;
        while (node) {
          const next = node.previousSibling ?? node.parentNode?.previousSibling;
          node.parentNode.removeChild(node);
          node = next;
        }
        return this.#serializer.serializeToString(ssml);
      }
      start() {
        this.#lastMark = null;
        const [doc] = this.#list.first() ?? [];
        if (!doc) return this.next();
        return this.#speak(doc, (ssml) =>
          this.#getMarkElement(ssml, this.#lastMark),
        );
      }
      resume() {
        const [doc] = this.#list.current() ?? [];
        if (!doc) return this.next();
        return this.#speak(doc, (ssml) =>
          this.#getMarkElement(ssml, this.#lastMark),
        );
      }
      prev(paused) {
        this.#lastMark = null;
        const [doc, range] = this.#list.prev() ?? [];
        if (paused && range) this.highlight(range.cloneRange());
        return this.#speak(doc);
      }
      next(paused) {
        this.#lastMark = null;
        const [doc, range] = this.#list.next() ?? [];
        if (paused && range) this.highlight(range.cloneRange());
        return this.#speak(doc);
      }
      from(range) {
        this.#lastMark = null;
        const [doc] = this.#list.find(
          (range_) =>
            range.compareBoundaryPoints(Range.END_TO_START, range_) <= 0,
        );
        let mark;
        for (const [name, range_] of this.#ranges.entries())
          if (range.compareBoundaryPoints(Range.START_TO_START, range_) <= 0) {
            mark = name;
            break;
          }
        return this.#speak(doc, (ssml) => this.#getMarkElement(ssml, mark));
      }
      setMark(mark) {
        const range = this.#ranges.get(mark);
        if (range) {
          this.#lastMark = mark;
          this.highlight(range.cloneRange());
        }
      }
    } // CONCATENATED MODULE: ./my-foliate/debug.js
    const debug_debugMessage = (m) => {
      if (typeof window.ReactNativeWebView != "undefined") {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "epubjs",
            message: m,
          }),
        );
      } else {
        console.log(m);
      }
    };
    /* harmony default export */ const debug = debug_debugMessage; // CONCATENATED MODULE: ./my-foliate/view.js
    const SEARCH_PREFIX = "foliate-search:";
    class History extends EventTarget {
      #arr = [];
      #index = -1;
      pushState(x) {
        const last = this.#arr[this.#index];
        if (last === x || (last?.fraction && last.fraction === x.fraction))
          return;
        this.#arr[++this.#index] = x;
        this.#arr.length = this.#index + 1;
        this.dispatchEvent(new Event("index-change"));
      }
      replaceState(x) {
        const index = this.#index;
        this.#arr[index] = x;
      }
      back() {
        const index = this.#index;
        if (index <= 0) return;
        const detail = {
          state: this.#arr[index - 1],
        };
        this.#index = index - 1;
        this.dispatchEvent(
          new CustomEvent("popstate", {
            detail,
          }),
        );
        this.dispatchEvent(new Event("index-change"));
      }
      forward() {
        const index = this.#index;
        if (index >= this.#arr.length - 1) return;
        const detail = {
          state: this.#arr[index + 1],
        };
        this.#index = index + 1;
        this.dispatchEvent(
          new CustomEvent("popstate", {
            detail,
          }),
        );
        this.dispatchEvent(new Event("index-change"));
      }
      get canGoBack() {
        return this.#index > 0;
      }
      get canGoForward() {
        return this.#index < this.#arr.length - 1;
      }
      clear() {
        this.#arr = [];
        this.#index = -1;
      }
    }
    const languageInfo = (lang) => {
      if (!lang) return {};
      try {
        const canonical = Intl.getCanonicalLocales(lang)[0];
        const locale = new Intl.Locale(canonical);
        const isCJK = ["zh", "ja", "kr"].includes(locale.language);
        const direction = (locale.getTextInfo?.() ?? locale.textInfo)
          ?.direction;
        return {
          canonical,
          locale,
          isCJK,
          direction,
        };
      } catch (e) {
        console.warn(e);
        return {};
      }
    };
    class view_View extends HTMLElement {
      #root = this.attachShadow({
        mode: "closed",
      });
      #sectionProgress;
      #tocProgress;
      #pageProgress;
      #searchResults = new Map();
      #ssml;
      #speechDoc;
      #speechRanges;
      #speechGranularity;
      #lastSpeechMark;
      isFixedLayout = false;
      lastLocation;
      history = new History();
      constructor() {
        super();
        this.history.addEventListener("popstate", ({ detail }) => {
          const resolved = this.resolveNavigation(detail.state);
          this.renderer.goTo(resolved);
        });
      }
      async open(book) {
        this.book = book;
        this.language = languageInfo(book.metadata?.language);
        if (book.splitTOCHref && book.getTOCFragment) {
          const ids = book.sections.map((s) => s.id);
          this.#sectionProgress = new SectionProgress(
            book.sections,
            1500,
            1600,
          );
          const splitHref = book.splitTOCHref.bind(book);
          const getFragment = book.getTOCFragment.bind(book);
          this.#tocProgress = new TOCProgress();
          await this.#tocProgress.init({
            toc: book.toc ?? [],
            ids,
            splitHref,
            getFragment,
          });
          this.#pageProgress = new TOCProgress();
          await this.#pageProgress.init({
            toc: book.pageList ?? [],
            ids,
            splitHref,
            getFragment,
          });
        }
        this.isFixedLayout = this.book.rendition?.layout === "pre-paginated";
        if (this.isFixedLayout) {
          this.renderer = document.createElement("foliate-fxl");
          debug("[VIEW_OPEN] fixed layout element " + this.renderer);
        } else {
          this.renderer = document.createElement("foliate-paginator");
        }
        this.renderer.setAttribute("exportparts", "head,foot,filter");
        this.renderer.addEventListener("load", (e) => this.#onLoad(e.detail));
        this.renderer.addEventListener("relocate", (e) =>
          this.#onRelocate(e.detail),
        );
        this.renderer.addEventListener("create-overlayer", (e) =>
          e.detail.attach(this.#createOverlayer(e.detail)),
        );
        try {
          this.renderer.open(book);
        } catch (err) {
          debug("[VIEW_OPEN] " + err);
          return;
        }
        this.#root.append(this.renderer);
        if (book.sections.some((section) => section.mediaOverlay)) {
          book.media.activeClass ||= "-epub-media-overlay-active";
          const activeClass = book.media.activeClass;
          this.mediaOverlay = book.getMediaOverlay();
          let lastActive;
          this.mediaOverlay.addEventListener("highlight", (e) => {
            const resolved = this.resolveNavigation(e.detail.text);
            this.renderer.goTo(resolved).then(() => {
              const { doc } = this.renderer
                .getContents()
                .find((x) => (x.index = resolved.index));
              const el = resolved.anchor(doc);
              el.classList.add(activeClass);
              lastActive = new WeakRef(el);
            });
          });
          this.mediaOverlay.addEventListener("unhighlight", () => {
            lastActive?.deref()?.classList?.remove(activeClass);
          });
        }
        debug("[VIEW_OPEN] DONE OPENING BOOK...");
      }
      close() {
        this.renderer?.destroy();
        this.renderer?.remove();
        this.#sectionProgress = null;
        this.#tocProgress = null;
        this.#pageProgress = null;
        this.#searchResults = new Map();
        this.lastLocation = null;
        this.history.clear();
        this.tts = null;
        this.mediaOverlay = null;
      }
      goToTextStart() {
        return this.goTo(
          this.book.landmarks?.find(
            (m) => m.type.includes("bodymatter") || m.type.includes("text"),
          )?.href ?? this.book.sections.findIndex((s) => s.linear !== "no"),
        );
      }
      async init({ lastLocation, showTextStart }) {
        const resolved = lastLocation
          ? this.resolveNavigation(lastLocation)
          : null;
        if (resolved) {
          await this.renderer.goTo(resolved);
          this.history.pushState(lastLocation);
        } else if (showTextStart) await this.goToTextStart();
        else {
          this.history.pushState(0);
          await this.next();
        }
      }
      #emit(name, detail, cancelable) {
        return this.dispatchEvent(
          new CustomEvent(name, {
            detail,
            cancelable,
          }),
        );
      }
      #onRelocate({ reason, range, index, fraction, size }) {
        const progress =
          this.#sectionProgress?.getProgress(index, fraction, size) ?? {};
        const tocItem = this.#tocProgress?.getProgress(index, range);
        const pageItem = this.#pageProgress?.getProgress(index, range);
        const cfi = this.getCFI(index, range);
        this.lastLocation = {
          ...progress,
          tocItem,
          pageItem,
          cfi,
          range,
        };
        if (reason === "snap" || reason === "page" || reason === "scroll")
          this.history.replaceState(cfi);
        this.#emit("relocate", this.lastLocation);
      }
      #onLoad({ doc, index }) {
        // set language and dir if not already set
        doc.documentElement.lang ||= this.language.canonical ?? "";
        if (!this.language.isCJK)
          doc.documentElement.dir ||= this.language.direction ?? "";
        this.#handleLinks(doc, index);
        this.#emit("load", {
          doc,
          index,
        });
      }
      #handleLinks(doc, index) {
        const { book } = this;
        const section = book.sections[index];
        for (const a of doc.querySelectorAll("a[href]"))
          a.addEventListener("click", (e) => {
            e.preventDefault();
            const href_ = a.getAttribute("href");
            const href = section?.resolveHref?.(href_) ?? href_;
            if (book?.isExternal?.(href))
              Promise.resolve(
                this.#emit(
                  "external-link",
                  {
                    a,
                    href,
                  },
                  true,
                ),
              )
                .then((x) => (x ? globalThis.open(href, "_blank") : null))
                .catch((e) => console.error(e));
            else
              Promise.resolve(
                this.#emit(
                  "link",
                  {
                    a,
                    href,
                  },
                  true,
                ),
              )
                .then((x) => (x ? this.goTo(href) : null))
                .catch((e) => console.error(e));
          });
      }
      async addAnnotation(annotation, remove) {
        const { value } = annotation;
        if (value.startsWith(SEARCH_PREFIX)) {
          const cfi = value.replace(SEARCH_PREFIX, "");
          const { index, anchor } = await this.resolveNavigation(cfi);
          const obj = this.#getOverlayer(index);
          if (obj) {
            const { overlayer, doc } = obj;
            if (remove) {
              overlayer.remove(value);
              return;
            }
            const range = doc ? anchor(doc) : anchor;
            overlayer.add(value, range, Overlayer.outline);
          }
          return;
        }
        const { index, anchor } = await this.resolveNavigation(value);
        const obj = this.#getOverlayer(index);
        if (obj) {
          const { overlayer, doc } = obj;
          overlayer.remove(value);
          if (!remove) {
            const range = doc ? anchor(doc) : anchor;
            const draw = (func, opts) =>
              overlayer.add(value, range, func, opts);
            this.#emit("draw-annotation", {
              draw,
              annotation,
              doc,
              range,
            });
          }
        }
        const label = this.#tocProgress.getProgress(index)?.label ?? "";
        return {
          index,
          label,
        };
      }
      deleteAnnotation(annotation) {
        return this.addAnnotation(annotation, true);
      }
      #getOverlayer(index) {
        return this.renderer
          .getContents()
          .find((x) => x.index === index && x.overlayer);
      }
      #createOverlayer({ doc, index }) {
        const overlayer = new Overlayer();
        doc.addEventListener(
          "click",
          (e) => {
            const [value, range] = overlayer.hitTest(e);
            if (value && !value.startsWith(SEARCH_PREFIX)) {
              this.#emit("show-annotation", {
                value,
                index,
                range,
              });
            }
          },
          false,
        );
        const list = this.#searchResults.get(index);
        if (list) for (const item of list) this.addAnnotation(item);
        this.#emit("create-overlay", {
          index,
        });
        return overlayer;
      }
      async showAnnotation(annotation) {
        const { value } = annotation;
        const resolved = await this.goTo(value);
        if (resolved) {
          const { index, anchor } = resolved;
          const { doc } = this.#getOverlayer(index);
          const range = anchor(doc);
          this.#emit("show-annotation", {
            value,
            index,
            range,
          });
        }
      }
      getCFI(index, range) {
        const baseCFI = this.book.sections[index].cfi ?? fake.fromIndex(index);
        if (!range) return baseCFI;
        return joinIndir(baseCFI, fromRange(range));
      }
      resolveCFI(cfi) {
        if (this.book.resolveCFI) return this.book.resolveCFI(cfi);
        else {
          const parts = parse(cfi);
          const index = fake.toIndex((parts.parent ?? parts).shift());
          const anchor = (doc) => toRange(doc, parts);
          return {
            index,
            anchor,
          };
        }
      }
      resolveNavigation(target) {
        try {
          if (typeof target === "number")
            return {
              index: target,
            };
          if (typeof target.fraction === "number") {
            const [index, anchor] = this.#sectionProgress.getSection(
              target.fraction,
            );
            return {
              index,
              anchor,
            };
          }
          if (isCFI.test(target)) return this.resolveCFI(target);
          return this.book.resolveHref(target);
        } catch (e) {
          console.error(e);
          console.error(\`Could not resolve target \${target}\`);
        }
      }
      async goTo(target) {
        const resolved = this.resolveNavigation(target);
        try {
          await this.renderer.goTo(resolved);
          this.history.pushState(target);
          return resolved;
        } catch (e) {
          console.error(e);
          console.error(\`Could not go to \${target}\`);
        }
      }
      async goToFraction(frac) {
        const [index, anchor] = this.#sectionProgress.getSection(frac);
        await this.renderer.goTo({
          index,
          anchor,
        });
        this.history.pushState({
          fraction: frac,
        });
      }
      async select(target) {
        try {
          const obj = await this.resolveNavigation(target);
          await this.renderer.goTo({
            ...obj,
            select: true,
          });
          this.history.pushState(target);
        } catch (e) {
          console.error(e);
          console.error(\`Could not go to \${target}\`);
        }
      }
      deselect() {
        for (const { doc } of this.renderer.getContents())
          doc.defaultView.getSelection().removeAllRanges();
      }
      getProgressOf(index, range) {
        const tocItem = this.#tocProgress?.getProgress(index, range);
        const pageItem = this.#pageProgress?.getProgress(index, range);
        return {
          tocItem,
          pageItem,
        };
      }
      async getTOCItemOf(target) {
        try {
          const { index, anchor } = await this.resolveNavigation(target);
          const doc = await this.book.sections[index].createDocument();
          const frag = anchor(doc);
          const isRange = frag instanceof Range;
          const range = isRange ? frag : doc.createRange();
          if (!isRange) range.selectNodeContents(frag);
          return this.#tocProgress.getProgress(index, range);
        } catch (e) {
          console.error(e);
          console.error(\`Could not get \${target}\`);
        }
      }
      async prev(distance) {
        await this.renderer.prev(distance);
      }
      async next(distance) {
        await this.renderer.next(distance);
      }
      goLeft() {
        return this.book.dir === "rtl" ? this.next() : this.prev();
      }
      goRight() {
        return this.book.dir === "rtl" ? this.prev() : this.next();
      }
      async *#searchSection(matcher, query, index) {
        const doc = await this.book.sections[index].createDocument();
        for (const { range, excerpt } of matcher(doc, query))
          yield {
            cfi: this.getCFI(index, range),
            excerpt,
          };
      }
      async *#searchBook(matcher, query) {
        const { sections } = this.book;
        for (const [index, { createDocument }] of sections.entries()) {
          if (!createDocument) continue;
          const doc = await createDocument();
          const subitems = Array.from(
            matcher(doc, query),
            ({ range, excerpt }) => ({
              cfi: this.getCFI(index, range),
              excerpt,
            }),
          );
          const progress = (index + 1) / sections.length;
          yield {
            progress,
          };
          if (subitems.length)
            yield {
              index,
              subitems,
            };
        }
      }
      async *search(opts) {
        this.clearSearch();
        const { query, index } = opts;
        const matcher = searchMatcher(textWalker, {
          defaultLocale: this.language,
          ...opts,
        });
        const iter =
          index != null
            ? this.#searchSection(matcher, query, index)
            : this.#searchBook(matcher, query);
        const list = [];
        this.#searchResults.set(index, list);
        for await (const result of iter) {
          if (result.subitems) {
            const list = result.subitems.map(({ cfi }) => ({
              value: SEARCH_PREFIX + cfi,
            }));
            this.#searchResults.set(result.index, list);
            for (const item of list) this.addAnnotation(item);
            yield {
              label: this.#tocProgress.getProgress(result.index)?.label ?? "",
              subitems: result.subitems,
            };
          } else {
            if (result.cfi) {
              const item = {
                value: SEARCH_PREFIX + result.cfi,
              };
              list.push(item);
              this.addAnnotation(item);
            }
            yield result;
          }
        }
        yield "done";
      }
      clearSearch() {
        for (const list of this.#searchResults.values())
          for (const item of list) this.deleteAnnotation(item);
        this.#searchResults.clear();
      }
      async initTTS() {
        const doc = this.renderer.getContents()[0].doc;
        if (this.tts && this.tts.doc === doc) return;
        this.tts = new TTS(doc, textWalker, (range) =>
          this.renderer.scrollToAnchor(range, true),
        );
      }
      startMediaOverlay() {
        const { index } = this.renderer.getContents()[0];
        return this.mediaOverlay.start(index);
      }
    }
    customElements.define("foliate-view", view_View); // CONCATENATED MODULE: ./my-foliate/vendor/fflate.js
    var r = Uint8Array,
      e = Uint16Array,
      n = Uint32Array,
      a = new r([
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
        5, 5, 5, 5, 0, 0, 0, 0,
      ]),
      t = new r([
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
        10, 11, 11, 12, 12, 13, 13, 0, 0,
      ]),
      i = new r([
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
      ]),
      f = function (r, a) {
        for (var t = new e(31), i = 0; i < 31; ++i) t[i] = a += 1 << r[i - 1];
        var f = new n(t[30]);
        for (i = 1; i < 30; ++i)
          for (var o = t[i]; o < t[i + 1]; ++o) f[o] = ((o - t[i]) << 5) | i;
        return [t, f];
      },
      o = f(a, 2),
      v = o[0],
      l = o[1];
    (v[28] = 258), (l[258] = 28);
    for (var u = f(t, 0)[0], c = new e(32768), d = 0; d < 32768; ++d) {
      var s = ((43690 & d) >>> 1) | ((21845 & d) << 1);
      (s =
        ((61680 & (s = ((52428 & s) >>> 2) | ((13107 & s) << 2))) >>> 4) |
        ((3855 & s) << 4)),
        (c[d] = (((65280 & s) >>> 8) | ((255 & s) << 8)) >>> 1);
    }
    var w = function (r, n, a) {
        for (var t = r.length, i = 0, f = new e(n); i < t; ++i)
          r[i] && ++f[r[i] - 1];
        var o,
          v = new e(n);
        for (i = 0; i < n; ++i) v[i] = (v[i - 1] + f[i - 1]) << 1;
        if (a) {
          o = new e(1 << n);
          var l = 15 - n;
          for (i = 0; i < t; ++i)
            if (r[i])
              for (
                var u = (i << 4) | r[i],
                  d = n - r[i],
                  s = v[r[i] - 1]++ << d,
                  w = s | ((1 << d) - 1);
                s <= w;
                ++s
              )
                o[c[s] >>> l] = u;
        } else
          for (o = new e(t), i = 0; i < t; ++i)
            r[i] && (o[i] = c[v[r[i] - 1]++] >>> (15 - r[i]));
        return o;
      },
      b = new r(288);
    for (d = 0; d < 144; ++d) b[d] = 8;
    for (d = 144; d < 256; ++d) b[d] = 9;
    for (d = 256; d < 280; ++d) b[d] = 7;
    for (d = 280; d < 288; ++d) b[d] = 8;
    var h = new r(32);
    for (d = 0; d < 32; ++d) h[d] = 5;
    var E = w(b, 9, 1),
      p = w(h, 5, 1),
      g = function (r) {
        for (var e = r[0], n = 1; n < r.length; ++n) r[n] > e && (e = r[n]);
        return e;
      },
      y = function (r, e, n) {
        var a = (e / 8) | 0;
        return ((r[a] | (r[a + 1] << 8)) >> (7 & e)) & n;
      },
      k = function (r, e) {
        var n = (e / 8) | 0;
        return (r[n] | (r[n + 1] << 8) | (r[n + 2] << 16)) >> (7 & e);
      },
      T = [
        "unexpected EOF",
        "invalid block type",
        "invalid length/literal",
        "invalid distance",
        "stream finished",
        "no stream handler",
        ,
        "no callback",
        "invalid UTF-8 data",
        "extra field too long",
        "date not in range 1980-2099",
        "filename too long",
        "stream finishing",
        "invalid zip data",
      ],
      m = function (r, e, n) {
        var a = new Error(e || T[r]);
        if (
          ((a.code = r),
          Error.captureStackTrace && Error.captureStackTrace(a, m),
          !n)
        )
          throw a;
        return a;
      },
      x = function (f, o, l) {
        var c = f.length;
        if (!c || (l && l.f && !l.l)) return o || new r(0);
        var d = !o || l,
          s = !l || l.i;
        l || (l = {}), o || (o = new r(3 * c));
        var b = function (e) {
            var n = o.length;
            if (e > n) {
              var a = new r(Math.max(2 * n, e));
              a.set(o), (o = a);
            }
          },
          h = l.f || 0,
          T = l.p || 0,
          x = l.b || 0,
          S = l.l,
          U = l.d,
          _ = l.m,
          z = l.n,
          A = 8 * c;
        do {
          if (!S) {
            h = y(f, T, 1);
            var M = y(f, T + 1, 3);
            if (((T += 3), !M)) {
              var B = f[(C = 4 + (((T + 7) / 8) | 0)) - 4] | (f[C - 3] << 8),
                D = C + B;
              if (D > c) {
                s && m(0);
                break;
              }
              d && b(x + B),
                o.set(f.subarray(C, D), x),
                (l.b = x += B),
                (l.p = T = 8 * D),
                (l.f = h);
              continue;
            }
            if (1 == M) (S = E), (U = p), (_ = 9), (z = 5);
            else if (2 == M) {
              var F = y(f, T, 31) + 257,
                L = y(f, T + 10, 15) + 4,
                N = F + y(f, T + 5, 31) + 1;
              T += 14;
              for (var P = new r(N), R = new r(19), Y = 0; Y < L; ++Y)
                R[i[Y]] = y(f, T + 3 * Y, 7);
              T += 3 * L;
              var O = g(R),
                j = (1 << O) - 1,
                q = w(R, O, 1);
              for (Y = 0; Y < N; ) {
                var C,
                  G = q[y(f, T, j)];
                if (((T += 15 & G), (C = G >>> 4) < 16)) P[Y++] = C;
                else {
                  var H = 0,
                    I = 0;
                  for (
                    16 == C
                      ? ((I = 3 + y(f, T, 3)), (T += 2), (H = P[Y - 1]))
                      : 17 == C
                      ? ((I = 3 + y(f, T, 7)), (T += 3))
                      : 18 == C && ((I = 11 + y(f, T, 127)), (T += 7));
                    I--;

                  )
                    P[Y++] = H;
                }
              }
              var J = P.subarray(0, F),
                K = P.subarray(F);
              (_ = g(J)), (z = g(K)), (S = w(J, _, 1)), (U = w(K, z, 1));
            } else m(1);
            if (T > A) {
              s && m(0);
              break;
            }
          }
          d && b(x + 131072);
          for (var Q = (1 << _) - 1, V = (1 << z) - 1, W = T; ; W = T) {
            var X = (H = S[k(f, T) & Q]) >>> 4;
            if ((T += 15 & H) > A) {
              s && m(0);
              break;
            }
            if ((H || m(2), X < 256)) o[x++] = X;
            else {
              if (256 == X) {
                (W = T), (S = null);
                break;
              }
              var Z = X - 254;
              if (X > 264) {
                var \$ = a[(Y = X - 257)];
                (Z = y(f, T, (1 << \$) - 1) + v[Y]), (T += \$);
              }
              var rr = U[k(f, T) & V],
                er = rr >>> 4;
              rr || m(3), (T += 15 & rr);
              K = u[er];
              if (er > 3) {
                \$ = t[er];
                (K += k(f, T) & ((1 << \$) - 1)), (T += \$);
              }
              if (T > A) {
                s && m(0);
                break;
              }
              d && b(x + 131072);
              for (var nr = x + Z; x < nr; x += 4)
                (o[x] = o[x - K]),
                  (o[x + 1] = o[x + 1 - K]),
                  (o[x + 2] = o[x + 2 - K]),
                  (o[x + 3] = o[x + 3 - K]);
              x = nr;
            }
          }
          (l.l = S),
            (l.p = W),
            (l.b = x),
            (l.f = h),
            S && ((h = 1), (l.m = _), (l.d = U), (l.n = z));
        } while (!h);
        return x == o.length
          ? o
          : (function (a, t, i) {
              (null == t || t < 0) && (t = 0),
                (null == i || i > a.length) && (i = a.length);
              var f = new (
                2 == a.BYTES_PER_ELEMENT ? e : 4 == a.BYTES_PER_ELEMENT ? n : r
              )(i - t);
              return f.set(a.subarray(t, i)), f;
            })(o, 0, x);
      },
      S = new r(0),
      U = function (r) {
        (8 != (15 & r[0]) || r[0] >>> 4 > 7 || ((r[0] << 8) | r[1]) % 31) &&
          m(6, "invalid zlib data"),
          32 & r[1] &&
            m(6, "invalid zlib data: preset dictionaries not supported");
      };
    function _(r, e) {
      return x((U(r), r.subarray(2, -4)), e);
    }
    var z = "undefined" != typeof TextDecoder && new TextDecoder();
    try {
      z.decode(S, {
        stream: !0,
      }),
        1;
    } catch (r) {} // CONCATENATED MODULE: ./my-foliate/epub.js

    const epub_NS = {
      CONTAINER: "urn:oasis:names:tc:opendocument:xmlns:container",
      XHTML: "http://www.w3.org/1999/xhtml",
      OPF: "http://www.idpf.org/2007/opf",
      EPUB: "http://www.idpf.org/2007/ops",
      DC: "http://purl.org/dc/elements/1.1/",
      DCTERMS: "http://purl.org/dc/terms/",
      ENC: "http://www.w3.org/2001/04/xmlenc#",
      NCX: "http://www.daisy.org/z3986/2005/ncx/",
      XLINK: "http://www.w3.org/1999/xlink",
      SMIL: "http://www.w3.org/ns/SMIL",
    };
    const MIME = {
      XML: "application/xml",
      NCX: "application/x-dtbncx+xml",
      XHTML: "application/xhtml+xml",
      HTML: "text/html",
      CSS: "text/css",
      SVG: "image/svg+xml",
      JS: /\\/(x-)?(javascript|ecmascript)/,
    };

    // convert to camel case
    const camel = (x) =>
      x.toLowerCase().replace(/[-:](.)/g, (_, g) => g.toUpperCase());

    // strip and collapse ASCII whitespace
    // https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
    const epub_normalizeWhitespace = (str) =>
      str
        ? str
            .replace(/[\\t\\n\\f\\r ]+/g, " ")
            .replace(/^[\\t\\n\\f\\r ]+/, "")
            .replace(/[\\t\\n\\f\\r ]+\$/, "")
        : "";
    const filterAttribute = (attr, value, isList) =>
      isList
        ? (el) => el.getAttribute(attr)?.split(/\\s/)?.includes(value)
        : typeof value === "function"
        ? (el) => value(el.getAttribute(attr))
        : (el) => el.getAttribute(attr) === value;
    const getAttributes =
      (...xs) =>
      (el) =>
        el
          ? Object.fromEntries(xs.map((x) => [camel(x), el.getAttribute(x)]))
          : null;
    const getElementText = (el) => epub_normalizeWhitespace(el?.textContent);
    const childGetter = (doc, ns) => {
      // ignore the namespace if it doesn't appear in document at all
      const useNS = doc.lookupNamespaceURI(null) === ns || doc.lookupPrefix(ns);
      const f = useNS
        ? (el, name) => (el) => el.namespaceURI === ns && el.localName === name
        : (el, name) => (el) => el.localName === name;
      return {
        \$: (el, name) => [...el.children].find(f(el, name)),
        \$\$: (el, name) => [...el.children].filter(f(el, name)),
        \$\$\$: useNS
          ? (el, name) => [...el.getElementsByTagNameNS(ns, name)]
          : (el, name) => [...el.getElementsByTagName(ns, name)],
      };
    };
    const resolveURL = (url, relativeTo) => {
      try {
        if (relativeTo.includes(":")) return new URL(url, relativeTo);
        // the base needs to be a valid URL, so set a base URL and then remove it
        const root = "https://invalid.invalid/";
        const obj = new URL(url, root + relativeTo);
        obj.search = "";
        return decodeURI(obj.href.replace(root, ""));
      } catch (e) {
        console.warn(e);
        return url;
      }
    };
    const isExternal = (uri) => /^(?!blob)\\w+:/i.test(uri);

    // like \`path.relative()\` in Node.js
    const pathRelative = (from, to) => {
      if (!from) return to;
      const as = from.replace(/\\/\$/, "").split("/");
      const bs = to.replace(/\\/\$/, "").split("/");
      const i = (as.length > bs.length ? as : bs).findIndex(
        (_, i) => as[i] !== bs[i],
      );
      return i < 0
        ? ""
        : Array(as.length - i)
            .fill("..")
            .concat(bs.slice(i))
            .join("/");
    };
    const pathDirname = (str) => str.slice(0, str.lastIndexOf("/") + 1);

    // replace asynchronously and sequentially
    // same techinque as https://stackoverflow.com/a/48032528
    const replaceSeries = async (str, regex, f) => {
      const matches = [];
      str.replace(regex, (...args) => (matches.push(args), null));
      const results = [];
      for (const args of matches) results.push(await f(...args));
      return str.replace(regex, () => results.shift());
    };
    const regexEscape = (str) => str.replace(/[-/\\\\^\$*+?.()|[\\]{}]/g, "\\\\\$&");
    const LANGS = {
      attrs: ["dir", "xml:lang"],
    };
    const ALTS = {
      name: "alternate-script",
      many: true,
      ...LANGS,
      props: ["file-as"],
    };
    const CONTRIB = {
      many: true,
      ...LANGS,
      props: [
        {
          name: "role",
          many: true,
          attrs: ["scheme"],
        },
        "file-as",
        ALTS,
      ],
    };
    const METADATA = [
      {
        name: "title",
        many: true,
        ...LANGS,
        props: ["title-type", "display-seq", "file-as", ALTS],
      },
      {
        name: "identifier",
        many: true,
        props: [
          {
            name: "identifier-type",
            attrs: ["scheme"],
          },
        ],
      },
      {
        name: "language",
        many: true,
      },
      {
        name: "creator",
        ...CONTRIB,
      },
      {
        name: "contributor",
        ...CONTRIB,
      },
      {
        name: "publisher",
        ...LANGS,
        props: ["file-as", ALTS],
      },
      {
        name: "description",
        ...LANGS,
        props: [ALTS],
      },
      {
        name: "rights",
        ...LANGS,
        props: [ALTS],
      },
      {
        name: "date",
      },
      {
        name: "dcterms:modified",
        type: "meta",
      },
      {
        name: "subject",
        many: true,
        ...LANGS,
        props: ["term", "authority", ALTS],
      },
      {
        name: "belongs-to-collection",
        type: "meta",
        many: true,
        ...LANGS,
        props: [
          "collection-type",
          "group-position",
          "dcterms:identifier",
          "file-as",
          ALTS,
          {
            name: "belongs-to-collection",
            recursive: true,
          },
        ],
      },
    ];

    // NOTE: this only gets properties defined with the \`refines\` attribute,
    // which is used in EPUB 3.0, deprecated in 3.1, then restored in 3.2;
    // no support for \`opf:\` attributes of 2.0 and 3.1
    const getMetadata = (opf) => {
      const { \$, \$\$ } = childGetter(opf, epub_NS.OPF);
      const \$metadata = \$(opf.documentElement, "metadata");
      const els = Array.from(\$metadata.children);
      const getValue = (obj, el) => {
        if (!el) return null;
        const { props = [], attrs = [] } = obj;
        const value = getElementText(el);
        if (!props.length && !attrs.length) return value;
        const id = el.getAttribute("id");
        const refines = id
          ? els.filter(filterAttribute("refines", "#" + id))
          : [];
        return Object.fromEntries(
          [["value", value]]
            .concat(
              props.map((prop) => {
                const { many, recursive } = prop;
                const name = typeof prop === "string" ? prop : prop.name;
                const filter = filterAttribute("property", name);
                const subobj = recursive ? obj : prop;
                return [
                  camel(name),
                  many
                    ? refines.filter(filter).map((el) => getValue(subobj, el))
                    : getValue(subobj, refines.find(filter)),
                ];
              }),
            )
            .concat(attrs.map((attr) => [camel(attr), el.getAttribute(attr)])),
        );
      };
      const arr = els.filter(filterAttribute("refines", null));
      const metadata = Object.fromEntries(
        METADATA.map((obj) => {
          const { type, name, many } = obj;
          const filter =
            type === "meta"
              ? (el) =>
                  el.namespaceURI === epub_NS.OPF &&
                  el.getAttribute("property") === name
              : (el) => el.namespaceURI === epub_NS.DC && el.localName === name;
          return [
            camel(name),
            many
              ? arr.filter(filter).map((el) => getValue(obj, el))
              : getValue(obj, arr.find(filter)),
          ];
        }),
      );
      const \$\$meta = \$\$(\$metadata, "meta");
      const getMetasByPrefix = (prefix) =>
        \$\$meta
          .filter(filterAttribute("property", (x) => x?.startsWith(prefix)))
          .map((el) => [el.getAttribute("property").replace(prefix, ""), el]);
      const rendition = Object.fromEntries(
        getMetasByPrefix("rendition:").map(([k, el]) => [
          k,
          getElementText(el),
        ]),
      );
      const media = {
        narrator: [],
        duration: {},
      };
      for (const [k, el] of getMetasByPrefix("media:")) {
        const v = getElementText(el);
        if (k === "duration")
          media.duration[el.getAttribute("refines")?.split("#")?.[1] ?? ""] =
            parseClock(v);
        else if (k === "active-class") media.activeClass = v;
        else if (k === "narrator") media.narrator.push(v);
        else if (k === "playback-active-class") media.playbackActiveClass = v;
      }
      return {
        metadata,
        rendition,
        media,
      };
    };
    const parseNav = (doc, resolve = (f) => f) => {
      const { \$, \$\$, \$\$\$ } = childGetter(doc, epub_NS.XHTML);
      const resolveHref = (href) => (href ? decodeURI(resolve(href)) : null);
      const parseLI = (getType) => (\$li) => {
        const \$a = \$(\$li, "a") ?? \$(\$li, "span");
        const \$ol = \$(\$li, "ol");
        const href = resolveHref(\$a?.getAttribute("href"));
        const label = getElementText(\$a) || \$a?.getAttribute("title");
        // TODO: get and concat alt/title texts in content
        const result = {
          label,
          href,
          subitems: parseOL(\$ol),
        };
        if (getType)
          result.type = \$a?.getAttributeNS(epub_NS.EPUB, "type")?.split(/\\s/);
        return result;
      };
      const parseOL = (\$ol, getType) =>
        \$ol ? \$\$(\$ol, "li").map(parseLI(getType)) : null;
      const parseNav = (\$nav, getType) => parseOL(\$(\$nav, "ol"), getType);
      const \$\$nav = \$\$\$(doc, "nav");
      let toc = null,
        pageList = null,
        landmarks = null,
        others = [];
      for (const \$nav of \$\$nav) {
        const type =
          \$nav.getAttributeNS(epub_NS.EPUB, "type")?.split(/\\s/) ?? [];
        if (type.includes("toc")) toc ??= parseNav(\$nav);
        else if (type.includes("page-list")) pageList ??= parseNav(\$nav);
        else if (type.includes("landmarks")) landmarks ??= parseNav(\$nav, true);
        else
          others.push({
            label: getElementText(\$nav.firstElementChild),
            type,
            list: parseNav(\$nav),
          });
      }
      return {
        toc,
        pageList,
        landmarks,
        others,
      };
    };
    const parseNCX = (doc, resolve = (f) => f) => {
      const { \$, \$\$ } = childGetter(doc, epub_NS.NCX);
      const resolveHref = (href) => (href ? decodeURI(resolve(href)) : null);
      const parseItem = (el) => {
        const \$label = \$(el, "navLabel");
        const \$content = \$(el, "content");
        const label = getElementText(\$label);
        const href = resolveHref(\$content.getAttribute("src"));
        if (el.localName === "navPoint") {
          const els = \$\$(el, "navPoint");
          return {
            label,
            href,
            subitems: els.length ? els.map(parseItem) : null,
          };
        }
        return {
          label,
          href,
        };
      };
      const parseList = (el, itemName) => \$\$(el, itemName).map(parseItem);
      const getSingle = (container, itemName) => {
        const \$container = \$(doc.documentElement, container);
        return \$container ? parseList(\$container, itemName) : null;
      };
      return {
        toc: getSingle("navMap", "navPoint"),
        pageList: getSingle("pageList", "pageTarget"),
        others: \$\$(doc.documentElement, "navList").map((el) => ({
          label: getElementText(\$(el, "navLabel")),
          list: parseList(el, "navTarget"),
        })),
      };
    };
    const parseClock = (str) => {
      if (!str) return;
      const parts = str.split(":").map((x) => parseFloat(x));
      if (parts.length === 3) {
        const [h, m, s] = parts;
        return h * 60 * 60 + m * 60 + s;
      }
      if (parts.length === 2) {
        const [m, s] = parts;
        return m * 60 + s;
      }
      const [x, unit] = str.split(/(?=[^\\d.])/);
      const n = parseFloat(x);
      const f =
        unit === "h"
          ? 60 * 60
          : unit === "min"
          ? 60
          : unit === "ms"
          ? 0.001
          : 1;
      return n * f;
    };
    class MediaOverlay extends EventTarget {
      #entries;
      #lastMediaOverlayItem;
      #sectionIndex;
      #audioIndex;
      #itemIndex;
      #audio;
      #volume = 1;
      #rate = 1;
      constructor(book, loadXML) {
        super();
        this.book = book;
        this.loadXML = loadXML;
      }
      async #loadSMIL(item) {
        if (this.#lastMediaOverlayItem === item) return;
        const doc = await this.loadXML(item.href);
        const resolve = (href) => (href ? resolveURL(href, item.href) : null);
        const { \$, \$\$\$ } = childGetter(doc, epub_NS.SMIL);
        this.#audioIndex = -1;
        this.#itemIndex = -1;
        this.#entries = \$\$\$(doc, "par").reduce((arr, \$par) => {
          const text = resolve(\$(\$par, "text")?.getAttribute("src"));
          const \$audio = \$(\$par, "audio");
          if (!text || !\$audio) return arr;
          const src = resolve(\$audio.getAttribute("src"));
          const begin = parseClock(\$audio.getAttribute("clipBegin"));
          const end = parseClock(\$audio.getAttribute("clipEnd"));
          const last = arr.at(-1);
          if (last?.src === src)
            last.items.push({
              text,
              begin,
              end,
            });
          else
            arr.push({
              src,
              items: [
                {
                  text,
                  begin,
                  end,
                },
              ],
            });
          return arr;
        }, []);
        this.#lastMediaOverlayItem = item;
      }
      get #activeAudio() {
        return this.#entries[this.#audioIndex];
      }
      get #activeItem() {
        return this.#activeAudio?.items?.[this.#itemIndex];
      }
      #error(e) {
        console.error(e);
        this.dispatchEvent(
          new CustomEvent("error", {
            detail: e,
          }),
        );
      }
      #highlight() {
        this.dispatchEvent(
          new CustomEvent("highlight", {
            detail: this.#activeItem,
          }),
        );
      }
      #unhighlight() {
        this.dispatchEvent(
          new CustomEvent("unhighlight", {
            detail: this.#activeItem,
          }),
        );
      }
      async #play(audioIndex, itemIndex) {
        if (this.#audio) {
          this.#audio.pause();
          URL.revokeObjectURL(this.#audio.src);
          this.#audio = null;
        }
        this.#audioIndex = audioIndex;
        this.#itemIndex = itemIndex;
        const src = this.#activeAudio?.src;
        if (!src || !this.#activeItem)
          return this.start(this.#sectionIndex + 1);
        const url = URL.createObjectURL(await this.book.loadBlob(src));
        const audio = new Audio(url);
        this.#audio = audio;
        audio.addEventListener("timeupdate", () => {
          if (audio.paused) return;
          const t = audio.currentTime;
          const { items } = this.#activeAudio;
          if (t > this.#activeItem?.end) {
            this.#unhighlight();
            if (this.#itemIndex === items.length - 1) {
              this.#play(this.#audioIndex + 1, 0).catch((e) => this.#error(e));
              return;
            }
          }
          const oldIndex = this.#itemIndex;
          while (items[this.#itemIndex + 1]?.begin <= t) this.#itemIndex++;
          if (this.#itemIndex !== oldIndex) this.#highlight();
        });
        audio.addEventListener("error", () =>
          this.#error(new Error(\`Failed to load \${src}\`)),
        );
        audio.addEventListener("playing", () => this.#highlight());
        audio.addEventListener("pause", () => this.#unhighlight());
        audio.addEventListener("ended", () => {
          this.#unhighlight();
          URL.revokeObjectURL(url);
          this.#audio = null;
          this.#play(audioIndex + 1, 0).catch((e) => this.#error(e));
        });
        audio.addEventListener("canplaythrough", () => {
          audio.currentTime = this.#activeItem.begin ?? 0;
          audio.volume = this.#volume;
          audio.playbackRate = this.#rate;
          audio.play().catch((e) => this.#error(e));
        });
      }
      async start(sectionIndex, filter = () => true) {
        this.#audio?.pause();
        const section = this.book.sections[sectionIndex];
        const href = section?.id;
        if (!href) return;
        const { mediaOverlay } = section;
        if (!mediaOverlay) return this.start(sectionIndex + 1);
        this.#sectionIndex = sectionIndex;
        await this.#loadSMIL(mediaOverlay);
        for (let i = 0; i < this.#entries.length; i++) {
          const { items } = this.#entries[i];
          for (let j = 0; j < items.length; j++) {
            if (
              items[j].text.split("#")[0] === href &&
              filter(items[j], j, items)
            )
              return this.#play(i, j).catch((e) => this.#error(e));
          }
        }
      }
      pause() {
        this.#audio?.pause();
      }
      resume() {
        this.#audio?.play().catch((e) => this.#error(e));
      }
      prev() {
        if (this.#itemIndex > 0)
          this.#play(this.#audioIndex, this.#itemIndex - 1);
        else if (this.#audioIndex > 0)
          this.#play(
            this.#audioIndex - 1,
            this.#entries[this.#audioIndex - 1].items.length - 1,
          );
        else if (this.#sectionIndex > 0)
          this.start(
            this.#sectionIndex - 1,
            (_, i, items) => i === items.length - 1,
          );
      }
      next() {
        this.#play(this.#audioIndex, this.#itemIndex + 1);
      }
      setVolume(volume) {
        this.#volume = volume;
        if (this.#audio) this.#audio.volume = volume;
      }
      setRate(rate) {
        this.#rate = rate;
        if (this.#audio) this.#audio.playbackRate = rate;
      }
    }
    const isUUID =
      /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;
    const getUUID = (opf) => {
      for (const el of opf.getElementsByTagNameNS(epub_NS.DC, "identifier")) {
        const [id] = getElementText(el).split(":").slice(-1);
        if (isUUID.test(id)) return id;
      }
      return "";
    };
    const getIdentifier = (opf) =>
      getElementText(
        opf.getElementById(
          opf.documentElement.getAttribute("unique-identifier"),
        ) ?? opf.getElementsByTagNameNS(epub_NS.DC, "identifier")[0],
      );

    // https://www.w3.org/publishing/epub32/epub-ocf.html#sec-resource-obfuscation
    const deobfuscate = async (key, length, blob) => {
      const array = new Uint8Array(await blob.slice(0, length).arrayBuffer());
      length = Math.min(length, array.length);
      for (var i = 0; i < length; i++)
        array[i] = array[i] ^ key[i % key.length];
      return new Blob([array, blob.slice(length)], {
        type: blob.type,
      });
    };
    const WebCryptoSHA1 = async (str) => {
      const data = new TextEncoder().encode(str);
      const buffer = await globalThis.crypto.subtle.digest("SHA-1", data);
      return new Uint8Array(buffer);
    };
    const deobfuscators = (sha1 = WebCryptoSHA1) => ({
      "http://www.idpf.org/2008/embedding": {
        key: (opf) =>
          sha1(
            getIdentifier(opf)
              // eslint-disable-next-line no-control-regex
              .replaceAll(/[\\u0020\\u0009\\u000d\\u000a]/g, ""),
          ),
        decode: (key, blob) => deobfuscate(key, 1040, blob),
      },
      "http://ns.adobe.com/pdf/enc#RC": {
        key: (opf) => {
          const uuid = getUUID(opf).replaceAll("-", "");
          return Uint8Array.from(
            {
              length: 16,
            },
            (_, i) => parseInt(uuid.slice(i * 2, i * 2 + 2), 16),
          );
        },
        decode: (key, blob) => deobfuscate(key, 1024, blob),
      },
    });
    class Encryption {
      #uris = new Map();
      #decoders = new Map();
      #algorithms;
      constructor(algorithms) {
        this.#algorithms = algorithms;
      }
      async init(encryption, opf) {
        if (!encryption) return;
        const data = Array.from(
          encryption.getElementsByTagNameNS(epub_NS.ENC, "EncryptedData"),
          (el) => ({
            algorithm: el
              .getElementsByTagNameNS(epub_NS.ENC, "EncryptionMethod")[0]
              ?.getAttribute("Algorithm"),
            uri: el
              .getElementsByTagNameNS(epub_NS.ENC, "CipherReference")[0]
              ?.getAttribute("URI"),
          }),
        );
        for (const { algorithm, uri } of data) {
          if (!this.#decoders.has(algorithm)) {
            const algo = this.#algorithms[algorithm];
            if (!algo) {
              console.warn("Unknown encryption algorithm");
              continue;
            }
            const key = await algo.key(opf);
            this.#decoders.set(algorithm, (blob) => algo.decode(key, blob));
          }
          this.#uris.set(uri, algorithm);
        }
      }
      getDecoder(uri) {
        return this.#decoders.get(this.#uris.get(uri)) ?? ((x) => x);
      }
    }
    class Resources {
      constructor({ opf, resolveHref }) {
        this.opf = opf;
        const { \$, \$\$, \$\$\$ } = childGetter(opf, epub_NS.OPF);
        const \$manifest = \$(opf.documentElement, "manifest");
        const \$spine = \$(opf.documentElement, "spine");
        const \$\$itemref = \$\$(\$spine, "itemref");
        this.manifest = \$\$(\$manifest, "item")
          .map(
            getAttributes(
              "href",
              "id",
              "media-type",
              "properties",
              "media-overlay",
            ),
          )
          .map((item) => {
            item.href = resolveHref(item.href);
            item.properties = item.properties?.split(/\\s/);
            return item;
          });
        this.spine = \$\$itemref
          .map(getAttributes("idref", "id", "linear", "properties"))
          .map(
            (item) => ((item.properties = item.properties?.split(/\\s/)), item),
          );
        this.pageProgressionDirection = \$spine.getAttribute(
          "page-progression-direction",
        );
        this.navPath = this.getItemByProperty("nav")?.href;
        this.ncxPath = (
          this.getItemByID(\$spine.getAttribute("toc")) ??
          this.manifest.find((item) => item.mediaType === MIME.NCX)
        )?.href;
        const \$guide = \$(opf.documentElement, "guide");
        if (\$guide)
          this.guide = \$\$(\$guide, "reference")
            .map(getAttributes("type", "title", "href"))
            .map(({ type, title, href }) => ({
              label: title,
              type: type.split(/\\s/),
              href: resolveHref(href),
            }));
        this.cover =
          this.getItemByProperty("cover-image") ??
          // EPUB 2 compat
          this.getItemByID(
            \$\$\$(opf, "meta")
              .find(filterAttribute("name", "cover"))
              ?.getAttribute("content"),
          ) ??
          this.getItemByHref(
            this.guide?.find((ref) => ref.type.includes("cover"))?.href,
          );
        this.cfis = fromElements(\$\$itemref);
      }
      getItemByID(id) {
        return this.manifest.find((item) => item.id === id);
      }
      getItemByHref(href) {
        return this.manifest.find((item) => item.href === href);
      }
      getItemByProperty(prop) {
        return this.manifest.find((item) => item.properties?.includes(prop));
      }
      resolveCFI(cfi) {
        const parts = parse(cfi);
        const top = (parts.parent ?? parts).shift();
        let \$itemref = toElement(this.opf, top);
        // make sure it's an idref; if not, try again without the ID assertion
        // mainly because Epub.js used to generate wrong ID assertions
        // https://github.com/futurepress/epub.js/issues/1236
        if (\$itemref && \$itemref.nodeName !== "idref") {
          top.at(-1).id = null;
          \$itemref = toElement(this.opf, top);
        }
        const idref = \$itemref?.getAttribute("idref");
        const index = this.spine.findIndex((item) => item.idref === idref);
        const anchor = (doc) => toRange(doc, parts);
        return {
          index,
          anchor,
        };
      }
    }
    class Loader {
      #cache = new Map();
      #children = new Map();
      #refCount = new Map();
      allowScript = false;
      constructor({ loadText, loadBlob, resources }) {
        this.loadText = loadText;
        this.loadBlob = loadBlob;
        this.manifest = resources.manifest;
        this.assets = resources.manifest;
        // needed only when replacing in (X)HTML w/o parsing (see below)
        //.filter(({ mediaType }) => ![MIME.XHTML, MIME.HTML].includes(mediaType))
      }

      createURL(href, data, type, parent) {
        if (!data) return "";
        const url = URL.createObjectURL(
          new Blob([data], {
            type,
          }),
        );
        this.#cache.set(href, url);
        this.#refCount.set(href, 1);
        if (parent) {
          const childList = this.#children.get(parent);
          if (childList) childList.push(href);
          else this.#children.set(parent, [href]);
        }
        return url;
      }
      ref(href, parent) {
        const childList = this.#children.get(parent);
        if (!childList?.includes(href)) {
          this.#refCount.set(href, this.#refCount.get(href) + 1);
          //console.log(\`referencing \${href}, now \${this.#refCount.get(href)}\`)
          if (childList) childList.push(href);
          else this.#children.set(parent, [href]);
        }
        return this.#cache.get(href);
      }
      unref(href) {
        if (!this.#refCount.has(href)) return;
        const count = this.#refCount.get(href) - 1;
        //console.log(\`unreferencing \${href}, now \${count}\`)
        if (count < 1) {
          //console.log(\`unloading \${href}\`)
          URL.revokeObjectURL(this.#cache.get(href));
          this.#cache.delete(href);
          this.#refCount.delete(href);
          // unref children
          const childList = this.#children.get(href);
          if (childList) while (childList.length) this.unref(childList.pop());
          this.#children.delete(href);
        } else this.#refCount.set(href, count);
      }
      // load manifest item, recursively loading all resources as needed
      async loadItem(item, parents = []) {
        if (!item) return null;
        const { href, mediaType } = item;
        const isScript = MIME.JS.test(item.mediaType);
        if (isScript && !this.allowScript) return null;
        const parent = parents.at(-1);
        if (this.#cache.has(href)) return this.ref(href, parent);
        const shouldReplace =
          (isScript ||
            [MIME.XHTML, MIME.HTML, MIME.CSS, MIME.SVG].includes(mediaType)) &&
          // prevent circular references
          parents.every((p) => p !== href);
        if (shouldReplace) return this.loadReplaced(item, parents);
        return this.createURL(
          href,
          await this.loadBlob(href),
          mediaType,
          parent,
        );
      }
      async loadHref(href, base, parents = []) {
        if (isExternal(href)) return href;
        const path = resolveURL(href, base);
        const item = this.manifest.find((item) => item.href === path);
        if (!item) return href;
        return this.loadItem(item, parents.concat(base));
      }
      async loadReplaced(item, parents = []) {
        const { href, mediaType } = item;
        const parent = parents.at(-1);
        const str = await this.loadText(href);
        if (!str) return null;

        // note that one can also just use \`replaceString\` for everything:
        // \`\`\`
        // const replaced = await this.replaceString(str, href, parents)
        // return this.createURL(href, replaced, mediaType, parent)
        // \`\`\`
        // which is basically what Epub.js does, which is simpler, but will
        // break things like iframes (because you don't want to replace links)
        // or text that just happen to be paths

        // parse and replace in HTML
        if ([MIME.XHTML, MIME.HTML, MIME.SVG].includes(mediaType)) {
          let doc = new DOMParser().parseFromString(str, mediaType);
          // change to HTML if it's not valid XHTML
          if (mediaType === MIME.XHTML && doc.querySelector("parsererror")) {
            console.warn(doc.querySelector("parsererror").innerText);
            item.mediaType = MIME.HTML;
            doc = new DOMParser().parseFromString(str, item.mediaType);
          }
          // replace hrefs in XML processing instructions
          // this is mainly for SVGs that use xml-stylesheet
          if ([MIME.XHTML, MIME.SVG].includes(item.mediaType)) {
            let child = doc.firstChild;
            while (child instanceof ProcessingInstruction) {
              if (child.data) {
                const replacedData = await replaceSeries(
                  child.data,
                  /(?:^|\\s*)(href\\s*=\\s*['"])([^'"]*)(['"])/i,
                  (_, p1, p2, p3) =>
                    this.loadHref(p2, href, parents).then(
                      (p2) => \`\${p1}\${p2}\${p3}\`,
                    ),
                );
                child.replaceWith(
                  doc.createProcessingInstruction(child.target, replacedData),
                );
              }
              child = child.nextSibling;
            }
          }
          // replace hrefs (excluding anchors)
          // TODO: srcset?
          const replace = async (el, attr) =>
            el.setAttribute(
              attr,
              await this.loadHref(el.getAttribute(attr), href, parents),
            );
          for (const el of doc.querySelectorAll("link[href]"))
            await replace(el, "href");
          for (const el of doc.querySelectorAll("[src]"))
            await replace(el, "src");
          for (const el of doc.querySelectorAll("[poster]"))
            await replace(el, "poster");
          for (const el of doc.querySelectorAll("object[data]"))
            await replace(el, "data");
          for (const el of doc.querySelectorAll("[*|href]:not([href]"))
            el.setAttributeNS(
              epub_NS.XLINK,
              "href",
              await this.loadHref(
                el.getAttributeNS(epub_NS.XLINK, "href"),
                href,
                parents,
              ),
            );
          // replace inline styles
          for (const el of doc.querySelectorAll("style"))
            if (el.textContent)
              el.textContent = await this.replaceCSS(
                el.textContent,
                href,
                parents,
              );
          for (const el of doc.querySelectorAll("[style]"))
            el.setAttribute(
              "style",
              await this.replaceCSS(el.getAttribute("style"), href, parents),
            );
          // TODO: replace inline scripts? probably not worth the trouble
          const result = new XMLSerializer().serializeToString(doc);
          return this.createURL(href, result, item.mediaType, parent);
        }
        const result =
          mediaType === MIME.CSS
            ? await this.replaceCSS(str, href, parents)
            : await this.replaceString(str, href, parents);
        return this.createURL(href, result, mediaType, parent);
      }
      async replaceCSS(str, href, parents = []) {
        const replacedUrls = await replaceSeries(
          str,
          /url\\(\\s*["']?([^'"\\n]*?)\\s*["']?\\s*\\)/gi,
          (_, url) =>
            this.loadHref(url, href, parents).then((url) => \`url("\${url}")\`),
        );
        // apart from \`url()\`, strings can be used for \`@import\` (but why?!)
        const replacedImports = await replaceSeries(
          replacedUrls,
          /@import\\s*["']([^"'\\n]*?)["']/gi,
          (_, url) =>
            this.loadHref(url, href, parents).then((url) => \`@import "\${url}"\`),
        );
        const w = window?.innerWidth ?? 800;
        const h = window?.innerHeight ?? 600;
        return (
          replacedImports
            // unprefix as most of the props are (only) supported unprefixed
            // .replace(/(?<=[{\\s;])-epub-/gi, '') // Errors on ios // chatgpt: JavaScript regular expressions allow you to use named capture groups,
            // but you're using an older syntax that is not supported in JavaScript.
            // This is likely causing the error.
            // not sure if its correct but it works now :/
            .replace(/([;\\s])-epub-/gi, "\$1") // chatgpt replacement
            // replace vw and vh as they cause problems with layout
            .replace(
              /(\\d*\\.?\\d+)vw/gi,
              (_, d) => (parseFloat(d) * w) / 100 + "px",
            )
            .replace(
              /(\\d*\\.?\\d+)vh/gi,
              (_, d) => (parseFloat(d) * h) / 100 + "px",
            )
            // \`page-break-*\` unsupported in columns; replace with \`column-break-*\`
            .replace(
              /page-break-(after|before|inside)/gi,
              (_, x) => \`-webkit-column-break-\${x}\`,
            )
        );
      }
      // find & replace all possible relative paths for all assets without parsing
      replaceString(str, href, parents = []) {
        const assetMap = new Map();
        const urls = this.assets
          .map((asset) => {
            // do not replace references to the file itself
            if (asset.href === href) return;
            // href was decoded and resolved when parsing the manifest
            const relative = pathRelative(pathDirname(href), asset.href);
            const relativeEnc = encodeURI(relative);
            const rootRelative = "/" + asset.href;
            const rootRelativeEnc = encodeURI(rootRelative);
            const set = new Set([
              relative,
              relativeEnc,
              rootRelative,
              rootRelativeEnc,
            ]);
            for (const url of set) assetMap.set(url, asset);
            return Array.from(set);
          })
          .flat()
          .filter((x) => x);
        if (!urls.length) return str;
        const regex = new RegExp(urls.map(regexEscape).join("|"), "g");
        return replaceSeries(str, regex, async (match) =>
          this.loadItem(
            assetMap.get(match.replace(/^\\//, "")),
            parents.concat(href),
          ),
        );
      }
      unloadItem(item) {
        this.unref(item?.href);
      }
      destroy() {
        for (const url of this.#cache.values()) URL.revokeObjectURL(url);
      }
    }
    const getHTMLFragment = (doc, id) =>
      doc.getElementById(id) ?? doc.querySelector(\`[name="\${CSS.escape(id)}"]\`);
    const getPageSpread = (properties) => {
      for (const p of properties) {
        if (p === "page-spread-left" || p === "rendition:page-spread-left")
          return "left";
        if (p === "page-spread-right" || p === "rendition:page-spread-right")
          return "right";
        if (p === "rendition:page-spread-center") return "center";
      }
    };
    class EPUB {
      parser = new DOMParser();
      #loader;
      #encryption;
      constructor({ loadText, loadBlob, getSize, sha1 }) {
        this.loadText = loadText;
        this.loadBlob = loadBlob;
        this.getSize = getSize;
        this.#encryption = new Encryption(deobfuscators(sha1));
      }
      async #loadXML(uri) {
        const str = await this.loadText(uri);
        if (!str) return null;
        const doc = this.parser.parseFromString(str, MIME.XML);
        if (doc.querySelector("parsererror"))
          throw new Error(\`XML parsing error: \${uri}
\${doc.querySelector("parsererror").innerText}\`);
        return doc;
      }
      async init() {
        const \$container = await this.#loadXML("META-INF/container.xml");
        if (!\$container) throw new Error("Failed to load container file");
        const opfs = Array.from(
          \$container.getElementsByTagNameNS(epub_NS.CONTAINER, "rootfile"),
          getAttributes("full-path", "media-type"),
        ).filter((file) => file.mediaType === "application/oebps-package+xml");
        if (!opfs.length)
          throw new Error("No package document defined in container");
        const opfPath = opfs[0].fullPath;
        const opf = await this.#loadXML(opfPath);
        if (!opf) throw new Error("Failed to load package document");
        const \$encryption = await this.#loadXML("META-INF/encryption.xml");
        await this.#encryption.init(\$encryption, opf);
        this.resources = new Resources({
          opf,
          resolveHref: (url) => resolveURL(url, opfPath),
        });
        this.#loader = new Loader({
          loadText: this.loadText,
          loadBlob: (uri) =>
            Promise.resolve(this.loadBlob(uri)).then(
              this.#encryption.getDecoder(uri),
            ),
          resources: this.resources,
        });
        this.sections = this.resources.spine
          .map((spineItem, index) => {
            const { idref, linear, properties = [] } = spineItem;
            const item = this.resources.getItemByID(idref);
            if (!item) {
              console.warn(
                \`Could not find item with ID "\${idref}" in manifest\`,
              );
              return null;
            }
            return {
              id: item.href,
              load: () => this.#loader.loadItem(item),
              unload: () => this.#loader.unloadItem(item),
              createDocument: () => this.loadDocument(item),
              size: this.getSize(item.href),
              cfi: this.resources.cfis[index],
              linear,
              pageSpread: getPageSpread(properties),
              resolveHref: (href) => resolveURL(href, item.href),
              mediaOverlay: item.mediaOverlay
                ? this.resources.getItemByID(item.mediaOverlay)
                : null,
            };
          })
          .filter((s) => s);
        const { navPath, ncxPath } = this.resources;
        if (navPath)
          try {
            const resolve = (url) => resolveURL(url, navPath);
            const nav = parseNav(await this.#loadXML(navPath), resolve);
            this.toc = nav.toc;
            this.pageList = nav.pageList;
            this.landmarks = nav.landmarks;
          } catch (e) {
            console.warn(e);
          }
        if (!this.toc && ncxPath)
          try {
            const resolve = (url) => resolveURL(url, ncxPath);
            const ncx = parseNCX(await this.#loadXML(ncxPath), resolve);
            this.toc = ncx.toc;
            this.pageList = ncx.pageList;
          } catch (e) {
            console.warn(e);
          }
        this.landmarks ??= this.resources.guide;
        const { metadata, rendition, media } = getMetadata(opf);
        this.rendition = rendition;
        this.media = media;
        this.dir = this.resources.pageProgressionDirection;
        this.rawMetadata = metadata; // useful for debugging, i guess
        const title = metadata?.title?.[0];
        this.metadata = {
          title: title?.value,
          subtitle: metadata?.title?.find((x) => x.titleType === "subtitle")
            ?.value,
          sortAs: title?.fileAs,
          language: metadata?.language,
          identifier: getIdentifier(opf),
          description: metadata?.description?.value,
          publisher: metadata?.publisher?.value,
          published: metadata?.date,
          modified: metadata?.dctermsModified,
          subject: metadata?.subject
            ?.filter(({ value, code }) => value || code)
            ?.map(({ value, code, scheme }) => ({
              name: value,
              code,
              scheme,
            })),
          rights: metadata?.rights?.value,
        };
        const relators = {
          art: "artist",
          aut: "author",
          bkp: "producer",
          clr: "colorist",
          edt: "editor",
          ill: "illustrator",
          trl: "translator",
          pbl: "publisher",
        };
        const mapContributor = (defaultKey) => (obj) => {
          const keys = [
            ...new Set(
              obj.role?.map(
                ({ value, scheme }) =>
                  (!scheme || scheme === "marc:relators"
                    ? relators[value]
                    : null) ?? defaultKey,
              ),
            ),
          ];
          const value = {
            name: obj.value,
            sortAs: obj.fileAs,
          };
          return [keys?.length ? keys : [defaultKey], value];
        };
        metadata?.creator
          ?.map(mapContributor("author"))
          ?.concat(metadata?.contributor?.map?.(mapContributor("contributor")))
          ?.forEach(([keys, value]) =>
            keys.forEach((key) => {
              if (this.metadata[key]) this.metadata[key].push(value);
              else this.metadata[key] = [value];
            }),
          );
        return this;
      }
      async loadDocument(item) {
        const str = await this.loadText(item.href);
        return this.parser.parseFromString(str, item.mediaType);
      }
      getMediaOverlay() {
        return new MediaOverlay(this, this.#loadXML.bind(this));
      }
      resolveCFI(cfi) {
        return this.resources.resolveCFI(cfi);
      }
      resolveHref(href) {
        const [path, hash] = href.split("#");
        const item = this.resources.getItemByHref(decodeURI(path));
        if (!item) return null;
        const index = this.resources.spine.findIndex(
          ({ idref }) => idref === item.id,
        );
        const anchor = hash ? (doc) => getHTMLFragment(doc, hash) : () => 0;
        return {
          index,
          anchor,
        };
      }
      splitTOCHref(href) {
        return href?.split("#") ?? [];
      }
      getTOCFragment(doc, id) {
        return (
          doc.getElementById(id) ??
          doc.querySelector(\`[name="\${CSS.escape(id)}"]\`)
        );
      }
      isExternal(uri) {
        return isExternal(uri);
      }
      async getCover() {
        const cover = this.resources?.cover;
        return cover?.href
          ? new Blob([await this.loadBlob(cover.href)], {
              type: cover.mediaType,
            })
          : null;
      }
      async getCalibreBookmarks() {
        const txt = await this.loadText("META-INF/calibre_bookmarks.txt");
        const magic = "encoding=json+base64:";
        if (txt?.startsWith(magic)) {
          const json = atob(txt.slice(magic.length));
          return JSON.parse(json);
        }
      }
      destroy() {
        this.#loader?.destroy();
      }
    } // CONCATENATED MODULE: ./my-foliate/fb2.js
    const fb2_normalizeWhitespace = (str) =>
      str
        ? str
            .replace(/[\\t\\n\\f\\r ]+/g, " ")
            .replace(/^[\\t\\n\\f\\r ]+/, "")
            .replace(/[\\t\\n\\f\\r ]+\$/, "")
        : "";
    const fb2_getElementText = (el) => fb2_normalizeWhitespace(el?.textContent);
    const fb2_NS = {
      XLINK: "http://www.w3.org/1999/xlink",
      EPUB: "http://www.idpf.org/2007/ops",
    };
    const fb2_MIME = {
      XML: "application/xml",
      XHTML: "application/xhtml+xml",
    };
    const STYLE = {
      strong: ["strong", "self"],
      emphasis: ["em", "self"],
      style: ["span", "self"],
      a: "anchor",
      strikethrough: ["s", "self"],
      sub: ["sub", "self"],
      sup: ["sup", "self"],
      code: ["code", "self"],
      image: "image",
    };
    const TABLE = {
      tr: ["tr", ["align"]],
      th: ["th", ["colspan", "rowspan", "align", "valign"]],
      td: ["td", ["colspan", "rowspan", "align", "valign"]],
    };
    const POEM = {
      epigraph: ["blockquote"],
      subtitle: ["h2", STYLE],
      "text-author": ["p", STYLE],
      date: ["p", STYLE],
      stanza: "stanza",
    };
    const SECTION = {
      title: [
        "header",
        {
          p: ["h1", STYLE],
          "empty-line": ["br"],
        },
      ],
      epigraph: ["blockquote", "self"],
      image: "image",
      annotation: ["aside"],
      section: ["section", "self"],
      p: ["p", STYLE],
      poem: ["blockquote", POEM],
      subtitle: ["h2", STYLE],
      cite: ["blockquote", "self"],
      "empty-line": ["br"],
      table: ["table", TABLE],
      "text-author": ["p", STYLE],
    };
    POEM["epigraph"].push(SECTION);
    const BODY = {
      image: "image",
      title: [
        "section",
        {
          p: ["h1", STYLE],
          "empty-line": ["br"],
        },
      ],
      epigraph: ["section", SECTION],
      section: ["section", SECTION],
    };
    const getImageSrc = (el) => {
      const href = el.getAttributeNS(fb2_NS.XLINK, "href");
      const [, id] = href.split("#");
      const bin = el.getRootNode().getElementById(id);
      return bin
        ? \`data:\${bin.getAttribute("content-type")};base64,\${bin.textContent}\`
        : href;
    };
    class FB2Converter {
      constructor(fb2) {
        this.fb2 = fb2;
        this.doc = document.implementation.createDocument(fb2_NS.XHTML, "html");
      }
      image(node) {
        const el = this.doc.createElement("img");
        el.alt = node.getAttribute("alt");
        el.title = node.getAttribute("title");
        el.setAttribute("src", getImageSrc(node));
        return el;
      }
      anchor(node) {
        const el = this.convert(node, {
          a: ["a", STYLE],
        });
        el.setAttribute("href", node.getAttributeNS(fb2_NS.XLINK, "href"));
        if (node.getAttribute("type") === "note")
          el.setAttributeNS(fb2_NS.EPUB, "epub:type", "noteref");
        return el;
      }
      stanza(node) {
        const el = this.convert(node, {
          stanza: [
            "p",
            {
              title: [
                "header",
                {
                  p: ["strong", STYLE],
                  "empty-line": ["br"],
                },
              ],
              subtitle: ["p", STYLE],
            },
          ],
        });
        for (const child of node.children)
          if (child.nodeName === "v") {
            el.append(this.doc.createTextNode(child.textContent));
            el.append(this.doc.createElement("br"));
          }
        return el;
      }
      convert(node, def) {
        // not an element; return text content
        if (node.nodeType === 3)
          return this.doc.createTextNode(node.textContent);
        if (node.nodeType === 4)
          return this.doc.createCDATASection(node.textContent);
        if (node.nodeType === 8)
          return this.doc.createComment(node.textContent);
        const d = def?.[node.nodeName];
        if (!d) return null;
        if (typeof d === "string") return this[d](node);
        const [name, opts] = d;
        const el = this.doc.createElement(name);

        // copy the ID, and set class name from original element name
        if (node.id) el.id = node.id;
        el.classList.add(node.nodeName);

        // copy attributes
        if (Array.isArray(opts))
          for (const attr of opts)
            el.setAttribute(attr, node.getAttribute(attr));

        // process child elements recursively
        const childDef =
          opts === "self" ? def : Array.isArray(opts) ? null : opts;
        let child = node.firstChild;
        while (child) {
          const childEl = this.convert(child, childDef);
          if (childEl) el.append(childEl);
          child = child.nextSibling;
        }
        return el;
      }
    }
    const parseXML = async (blob) => {
      const buffer = await blob.arrayBuffer();
      const str = new TextDecoder("utf-8").decode(buffer);
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, fb2_MIME.XML);
      const encoding =
        doc.xmlEncoding ||
        // \`Document.xmlEncoding\` is deprecated, and already removed in Firefox
        // so parse the XML declaration manually
        str.match(
          /^<\\?xml\\s+version\\s*=\\s*["']1.\\d+"\\s+encoding\\s*=\\s*["']([A-Za-z0-9._-]*)["']/,
        )?.[1];
      if (encoding && encoding.toLowerCase() !== "utf-8") {
        const str = new TextDecoder(encoding).decode(buffer);
        return parser.parseFromString(str, fb2_MIME.XML);
      }
      return doc;
    };
    const style = URL.createObjectURL(
      new Blob(
        [
          \`
@namespace epub "http://www.idpf.org/2007/ops";
body > img, section > img {
    display: block;
    margin: auto;
}
.title h1 {
    text-align: center;
}
body > section > .title, body.notesBodyType > .title {
    margin: 3em 0;
}
body.notesBodyType > section .title h1 {
    text-align: start;
}
body.notesBodyType > section .title {
    margin: 1em 0;
}
p {
    text-indent: 1em;
    margin: 0;
}
:not(p) + p, p:first-child {
    text-indent: 0;
}
.poem p {
    text-indent: 0;
    margin: 1em 0;
}
.text-author, .date {
    text-align: end;
}
.text-author:before {
    content: "—";
}
table {
    border-collapse: collapse;
}
td, th {
    padding: .25em;
}
a[epub|type~="noteref"] {
    font-size: .75em;
    vertical-align: super;
}
body:not(.notesBodyType) > .title, body:not(.notesBodyType) > .epigraph {
    margin: 3em 0;
}
\`,
        ],
        {
          type: "text/css",
        },
      ),
    );
    const template = (html) => \`<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
    <head><link href="\${style}" rel="stylesheet" type="text/css"/></head>
    <body>\${html}</body>
</html>\`;

    // name of custom ID attribute for TOC items
    const dataID = "data-foliate-id";
    const makeFB2 = async (blob) => {
      const book = {};
      const doc = await parseXML(blob);
      const converter = new FB2Converter(doc);
      const \$ = (x) => doc.querySelector(x);
      const \$\$ = (x) => [...doc.querySelectorAll(x)];
      const getPerson = (el) => {
        const nick = fb2_getElementText(el.querySelector("nickname"));
        if (nick) return nick;
        const first = fb2_getElementText(el.querySelector("first-name"));
        const middle = fb2_getElementText(el.querySelector("middle-name"));
        const last = fb2_getElementText(el.querySelector("last-name"));
        const name = [first, middle, last].filter((x) => x).join(" ");
        const sortAs = last
          ? [last, [first, middle].filter((x) => x).join(" ")].join(", ")
          : null;
        return {
          name,
          sortAs,
        };
      };
      const getDate = (el) =>
        el?.getAttribute("value") ?? fb2_getElementText(el);
      const annotation = \$("title-info annotation");
      book.metadata = {
        title: fb2_getElementText(\$("title-info book-title")),
        identifier: fb2_getElementText(\$("document-info id")),
        language: fb2_getElementText(\$("title-info lang")),
        author: \$\$("title-info author").map(getPerson),
        translator: \$\$("title-info translator").map(getPerson),
        producer: \$\$("document-info author")
          .map(getPerson)
          .concat(\$\$("document-info program-used").map(fb2_getElementText)),
        publisher: fb2_getElementText(\$("publish-info publisher")),
        published: getDate(\$("title-info date")),
        modified: getDate(\$("document-info date")),
        description: annotation
          ? converter.convert(annotation, {
              annotation: ["div", SECTION],
            }).innerHTML
          : null,
        subject: \$\$("title-info genre").map(fb2_getElementText),
      };
      if (\$("coverpage image")) {
        const src = getImageSrc(\$("coverpage image"));
        book.getCover = () => fetch(src).then((res) => res.blob());
      } else book.getCover = () => null;

      // get convert each body
      const bodyData = Array.from(doc.querySelectorAll("body"), (body) => {
        const converted = converter.convert(body, {
          body: ["body", BODY],
        });
        return [
          Array.from(converted.children, (el) => {
            // get list of IDs in the section
            const ids = [el, ...el.querySelectorAll("[id]")].map((el) => el.id);
            return {
              el,
              ids,
            };
          }),
          converted,
        ];
      });
      const urls = [];
      const sectionData = bodyData[0][0]
        // make a separate section for each section in the first body
        .map(({ el, ids }) => {
          // set up titles for TOC
          const titles = Array.from(
            el.querySelectorAll(":scope > section > .title"),
            (el, index) => {
              el.setAttribute(dataID, index);
              return {
                title: fb2_getElementText(el),
                index,
              };
            },
          );
          return {
            ids,
            titles,
            el,
          };
        })
        // for additional bodies, only make one section for each body
        .concat(
          bodyData.slice(1).map(([sections, body]) => {
            const ids = sections.map((s) => s.ids).flat();
            body.classList.add("notesBodyType");
            return {
              ids,
              el: body,
              linear: "no",
            };
          }),
        )
        .map(({ ids, titles, el, linear }) => {
          const str = template(el.outerHTML);
          const blob = new Blob([str], {
            type: fb2_MIME.XHTML,
          });
          const url = URL.createObjectURL(blob);
          urls.push(url);
          const title = fb2_normalizeWhitespace(
            el.querySelector(".title, .subtitle, p")?.textContent ??
              (el.classList.contains("title") ? el.textContent : ""),
          );
          return {
            ids,
            title,
            titles,
            load: () => url,
            createDocument: () =>
              new DOMParser().parseFromString(str, fb2_MIME.XHTML),
            // doo't count image data as it'd skew the size too much
            size:
              blob.size -
              Array.from(
                el.querySelectorAll("[src]"),
                (el) => el.getAttribute("src")?.length ?? 0,
              ).reduce((a, b) => a + b, 0),
            linear,
          };
        });
      const idMap = new Map();
      book.sections = sectionData.map((section, index) => {
        const { ids, load, createDocument, size, linear } = section;
        for (const id of ids) if (id) idMap.set(id, index);
        return {
          id: index,
          load,
          createDocument,
          size,
          linear,
        };
      });
      book.toc = sectionData
        .map(({ title, titles }, index) => {
          const id = index.toString();
          return {
            label: title,
            href: id,
            subitems: titles?.length
              ? titles.map(({ title, index }) => ({
                  label: title,
                  href: \`\${id}#\${index}\`,
                }))
              : null,
          };
        })
        .filter((item) => item);
      book.resolveHref = (href) => {
        const [a, b] = href.split("#");
        return a
          ? // the link is from the TOC
            {
              index: Number(a),
              anchor: (doc) => doc.querySelector(\`[\${dataID}="\${b}"]\`),
            }
          : // link from within the page
            {
              index: idMap.get(b),
              anchor: (doc) => doc.getElementById(b),
            };
      };
      book.splitTOCHref = (href) =>
        href?.split("#")?.map((x) => Number(x)) ?? [];
      book.getTOCFragment = (doc, id) =>
        doc.querySelector(\`[\${dataID}="\${id}"]\`);
      book.destroy = () => {
        for (const url of urls) URL.revokeObjectURL(url);
      };
      return book;
    }; // CONCATENATED MODULE: ./my-foliate/comic-book.js
    const makeComicBook = ({ entries, loadBlob, getSize }, file) => {
      const cache = new Map();
      const urls = new Map();
      const load = async (name) => {
        if (cache.has(name)) return cache.get(name);
        const src = URL.createObjectURL(await loadBlob(name));
        const page = URL.createObjectURL(
          new Blob([\`<img src="\${src}">\`], {
            type: "text/html",
          }),
        );
        urls.set(name, [src, page]);
        cache.set(name, page);
        return page;
      };
      const unload = (name) => {
        urls.get(name)?.forEach?.((url) => URL.revokeObjectURL(url));
        urls.delete(name);
        cache.delete(name);
      };
      const exts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
      const files = entries
        .map((entry) => entry.filename)
        .filter((name) => exts.some((ext) => name.endsWith(ext)))
        .sort();
      const book = {};
      book.getCover = () => loadBlob(files[0]);
      book.metadata = {
        title: file.name,
      };
      book.sections = files.map((name) => ({
        id: name,
        load: () => load(name),
        unload: () => unload(name),
        size: getSize(name),
      }));
      book.toc = files.map((name) => ({
        label: name,
        href: name,
      }));
      book.rendition = {
        layout: "pre-paginated",
      };
      book.resolveHref = (href) => ({
        index: book.sections.findIndex((s) => s.id === href),
      });
      book.splitTOCHref = (href) => [href, null];
      book.getTOCFragment = (doc) => doc.documentElement;
      book.destroy = () => {
        for (const arr of urls.values())
          for (const url of arr) URL.revokeObjectURL(url);
      };
      return book;
    }; // CONCATENATED MODULE: ./my-foliate/mobi.js
    const unescapeHTML = (str) => {
      if (!str) return "";
      const textarea = document.createElement("textarea");
      textarea.innerHTML = str;
      return textarea.value;
    };
    const mobi_MIME = {
      XML: "application/xml",
      XHTML: "application/xhtml+xml",
      HTML: "text/html",
      CSS: "text/css",
      SVG: "image/svg+xml",
    };
    const PDB_HEADER = {
      name: [0, 32, "string"],
      type: [60, 4, "string"],
      creator: [64, 4, "string"],
      numRecords: [76, 2, "uint"],
    };
    const PALMDOC_HEADER = {
      compression: [0, 2, "uint"],
      numTextRecords: [8, 2, "uint"],
      recordSize: [10, 2, "uint"],
      encryption: [12, 2, "uint"],
    };
    const MOBI_HEADER = {
      magic: [16, 4, "string"],
      length: [20, 4, "uint"],
      type: [24, 4, "uint"],
      encoding: [28, 4, "uint"],
      uid: [32, 4, "uint"],
      version: [36, 4, "uint"],
      titleOffset: [84, 4, "uint"],
      titleLength: [88, 4, "uint"],
      localeRegion: [94, 1, "uint"],
      localeLanguage: [95, 1, "uint"],
      resourceStart: [108, 4, "uint"],
      huffcdic: [112, 4, "uint"],
      numHuffcdic: [116, 4, "uint"],
      exthFlag: [128, 4, "uint"],
      trailingFlags: [240, 4, "uint"],
      indx: [244, 4, "uint"],
    };
    const KF8_HEADER = {
      resourceStart: [108, 4, "uint"],
      fdst: [192, 4, "uint"],
      numFdst: [196, 4, "uint"],
      frag: [248, 4, "uint"],
      skel: [252, 4, "uint"],
      guide: [260, 4, "uint"],
    };
    const EXTH_HEADER = {
      magic: [0, 4, "string"],
      length: [4, 4, "uint"],
      count: [8, 4, "uint"],
    };
    const INDX_HEADER = {
      magic: [0, 4, "string"],
      length: [4, 4, "uint"],
      type: [8, 4, "uint"],
      idxt: [20, 4, "uint"],
      numRecords: [24, 4, "uint"],
      encoding: [28, 4, "uint"],
      language: [32, 4, "uint"],
      total: [36, 4, "uint"],
      ordt: [40, 4, "uint"],
      ligt: [44, 4, "uint"],
      numLigt: [48, 4, "uint"],
      numCncx: [52, 4, "uint"],
    };
    const TAGX_HEADER = {
      magic: [0, 4, "string"],
      length: [4, 4, "uint"],
      numControlBytes: [8, 4, "uint"],
    };
    const HUFF_HEADER = {
      magic: [0, 4, "string"],
      offset1: [8, 4, "uint"],
      offset2: [12, 4, "uint"],
    };
    const CDIC_HEADER = {
      magic: [0, 4, "string"],
      length: [4, 4, "uint"],
      numEntries: [8, 4, "uint"],
      codeLength: [12, 4, "uint"],
    };
    const FDST_HEADER = {
      magic: [0, 4, "string"],
      numEntries: [8, 4, "uint"],
    };
    const FONT_HEADER = {
      flags: [8, 4, "uint"],
      dataStart: [12, 4, "uint"],
      keyLength: [16, 4, "uint"],
      keyStart: [20, 4, "uint"],
    };
    const MOBI_ENCODING = {
      1252: "windows-1252",
      65001: "utf-8",
    };
    const EXTH_RECORD_TYPE = {
      100: ["creator", "string", true],
      101: ["publisher"],
      103: ["description"],
      104: ["isbn"],
      105: ["subject", "string", true],
      106: ["date"],
      108: ["contributor", "string", true],
      109: ["rights"],
      110: ["subjectCode", "string", true],
      112: ["source", "string", true],
      113: ["asin"],
      121: ["boundary", "uint"],
      122: ["fixedLayout"],
      125: ["numResources", "uint"],
      126: ["originalResolution"],
      127: ["zeroGutter"],
      128: ["zeroMargin"],
      129: ["coverURI"],
      132: ["regionMagnification"],
      201: ["coverOffset", "uint"],
      202: ["thumbnailOffset", "uint"],
      503: ["title"],
      524: ["language", "string", true],
      527: ["pageProgressionDirection"],
    };
    const MOBI_LANG = {
      1: [
        "ar",
        "ar-SA",
        "ar-IQ",
        "ar-EG",
        "ar-LY",
        "ar-DZ",
        "ar-MA",
        "ar-TN",
        "ar-OM",
        "ar-YE",
        "ar-SY",
        "ar-JO",
        "ar-LB",
        "ar-KW",
        "ar-AE",
        "ar-BH",
        "ar-QA",
      ],
      2: ["bg"],
      3: ["ca"],
      4: ["zh", "zh-TW", "zh-CN", "zh-HK", "zh-SG"],
      5: ["cs"],
      6: ["da"],
      7: ["de", "de-DE", "de-CH", "de-AT", "de-LU", "de-LI"],
      8: ["el"],
      9: [
        "en",
        "en-US",
        "en-GB",
        "en-AU",
        "en-CA",
        "en-NZ",
        "en-IE",
        "en-ZA",
        "en-JM",
        null,
        "en-BZ",
        "en-TT",
        "en-ZW",
        "en-PH",
      ],
      10: [
        "es",
        "es-ES",
        "es-MX",
        null,
        "es-GT",
        "es-CR",
        "es-PA",
        "es-DO",
        "es-VE",
        "es-CO",
        "es-PE",
        "es-AR",
        "es-EC",
        "es-CL",
        "es-UY",
        "es-PY",
        "es-BO",
        "es-SV",
        "es-HN",
        "es-NI",
        "es-PR",
      ],
      11: ["fi"],
      12: ["fr", "fr-FR", "fr-BE", "fr-CA", "fr-CH", "fr-LU", "fr-MC"],
      13: ["he"],
      14: ["hu"],
      15: ["is"],
      16: ["it", "it-IT", "it-CH"],
      17: ["ja"],
      18: ["ko"],
      19: ["nl", "nl-NL", "nl-BE"],
      20: ["no", "nb", "nn"],
      21: ["pl"],
      22: ["pt", "pt-BR", "pt-PT"],
      23: ["rm"],
      24: ["ro"],
      25: ["ru"],
      26: ["hr", null, "sr"],
      27: ["sk"],
      28: ["sq"],
      29: ["sv", "sv-SE", "sv-FI"],
      30: ["th"],
      31: ["tr"],
      32: ["ur"],
      33: ["id"],
      34: ["uk"],
      35: ["be"],
      36: ["sl"],
      37: ["et"],
      38: ["lv"],
      39: ["lt"],
      41: ["fa"],
      42: ["vi"],
      43: ["hy"],
      44: ["az"],
      45: ["eu"],
      46: ["hsb"],
      47: ["mk"],
      48: ["st"],
      49: ["ts"],
      50: ["tn"],
      52: ["xh"],
      53: ["zu"],
      54: ["af"],
      55: ["ka"],
      56: ["fo"],
      57: ["hi"],
      58: ["mt"],
      59: ["se"],
      62: ["ms"],
      63: ["kk"],
      65: ["sw"],
      67: ["uz", null, "uz-UZ"],
      68: ["tt"],
      69: ["bn"],
      70: ["pa"],
      71: ["gu"],
      72: ["or"],
      73: ["ta"],
      74: ["te"],
      75: ["kn"],
      76: ["ml"],
      77: ["as"],
      78: ["mr"],
      79: ["sa"],
      82: ["cy", "cy-GB"],
      83: ["gl", "gl-ES"],
      87: ["kok"],
      97: ["ne"],
      98: ["fy"],
    };
    const concatTypedArray = (a, b) => {
      const result = new a.constructor(a.length + b.length);
      result.set(a);
      result.set(b, a.length);
      return result;
    };
    const concatTypedArray3 = (a, b, c) => {
      const result = new a.constructor(a.length + b.length + c.length);
      result.set(a);
      result.set(b, a.length);
      result.set(c, a.length + b.length);
      return result;
    };
    const decoder = new TextDecoder();
    const getString = (buffer) => decoder.decode(buffer);
    const getUint = (buffer) => {
      if (!buffer) return;
      const l = buffer.byteLength;
      const func = l === 4 ? "getUint32" : l === 2 ? "getUint16" : "getUint8";
      return new DataView(buffer)[func](0);
    };
    const getStruct = (def, buffer) =>
      Object.fromEntries(
        Array.from(Object.entries(def)).map(([key, [start, len, type]]) => [
          key,
          (type === "string" ? getString : getUint)(
            buffer.slice(start, start + len),
          ),
        ]),
      );
    const getDecoder = (x) => new TextDecoder(MOBI_ENCODING[x]);
    const getVarLen = (byteArray, i = 0) => {
      let value = 0,
        length = 0;
      for (const byte of byteArray.subarray(i, i + 4)) {
        value = (value << 7) | ((byte & 0b111_1111) >>> 0);
        length++;
        if (byte & 0b1000_0000) break;
      }
      return {
        value,
        length,
      };
    };

    // variable-length quantity, but read from the end of data
    const getVarLenFromEnd = (byteArray) => {
      let value = 0;
      for (const byte of byteArray.subarray(-4)) {
        // \`byte & 0b1000_0000\` indicates the start of value
        if (byte & 0b1000_0000) value = 0;
        value = (value << 7) | (byte & 0b111_1111);
      }
      return value;
    };
    const countBitsSet = (x) => {
      let count = 0;
      for (; x > 0; x = x >> 1) if ((x & 1) === 1) count++;
      return count;
    };
    const countUnsetEnd = (x) => {
      let count = 0;
      while ((x & 1) === 0) (x = x >> 1), count++;
      return count;
    };
    const decompressPalmDOC = (array) => {
      let output = [];
      for (let i = 0; i < array.length; i++) {
        const byte = array[i];
        if (byte === 0) output.push(0); // uncompressed literal, just copy it
        else if (byte <= 8)
          // copy next 1-8 bytes
          for (const x of array.subarray(i + 1, (i += byte) + 1))
            output.push(x);
        else if (byte <= 0b0111_1111) output.push(byte); // uncompressed literal
        else if (byte <= 0b1011_1111) {
          // 1st and 2nd bits are 10, meaning this is a length-distance pair
          // read next byte and combine it with current byte
          const bytes = (byte << 8) | array[i++ + 1];
          // the 3rd to 13th bits encode distance
          const distance = (bytes & 0b0011_1111_1111_1111) >>> 3;
          // the last 3 bits, plus 3, is the length to copy
          const length = (bytes & 0b111) + 3;
          for (let j = 0; j < length; j++)
            output.push(output[output.length - distance]);
        }
        // compressed from space plus char
        else output.push(32, byte ^ 0b1000_0000);
      }
      return Uint8Array.from(output);
    };
    const read32Bits = (byteArray, from) => {
      const startByte = from >> 3;
      const end = from + 32;
      const endByte = end >> 3;
      let bits = 0n;
      for (let i = startByte; i <= endByte; i++)
        bits = (bits << 8n) | BigInt(byteArray[i] ?? 0);
      return (bits >> (8n - BigInt(end & 7))) & 0xffffffffn;
    };
    const huffcdic = async (mobi, loadRecord) => {
      const huffRecord = await loadRecord(mobi.huffcdic);
      const { magic, offset1, offset2 } = getStruct(HUFF_HEADER, huffRecord);
      if (magic !== "HUFF") throw new Error("Invalid HUFF record");

      // table1 is indexed by byte value
      const table1 = Array.from(
        {
          length: 256,
        },
        (_, i) => offset1 + i * 4,
      )
        .map((offset) => getUint(huffRecord.slice(offset, offset + 4)))
        .map((x) => [x & 0b1000_0000, x & 0b1_1111, x >>> 8]);

      // table2 is indexed by code length
      const table2 = [null].concat(
        Array.from(
          {
            length: 32,
          },
          (_, i) => offset2 + i * 8,
        ).map((offset) => [
          getUint(huffRecord.slice(offset, offset + 4)),
          getUint(huffRecord.slice(offset + 4, offset + 8)),
        ]),
      );
      const dictionary = [];
      for (let i = 1; i < mobi.numHuffcdic; i++) {
        const record = await loadRecord(mobi.huffcdic + i);
        const cdic = getStruct(CDIC_HEADER, record);
        if (cdic.magic !== "CDIC") throw new Error("Invalid CDIC record");
        // \`numEntries\` is the total number of dictionary data across CDIC records
        // so \`n\` here is the number of entries in *this* record
        const n = Math.min(
          1 << cdic.codeLength,
          cdic.numEntries - dictionary.length,
        );
        const buffer = record.slice(cdic.length);
        for (let i = 0; i < n; i++) {
          const offset = getUint(buffer.slice(i * 2, i * 2 + 2));
          const x = getUint(buffer.slice(offset, offset + 2));
          const length = x & 0x7fff;
          const decompressed = x & 0x8000;
          const value = new Uint8Array(
            buffer.slice(offset + 2, offset + 2 + length),
          );
          dictionary.push([value, decompressed]);
        }
      }
      const decompress = (byteArray) => {
        let output = new Uint8Array();
        const bitLength = byteArray.byteLength * 8;
        for (let i = 0; i < bitLength; ) {
          const bits = Number(read32Bits(byteArray, i));
          let [found, codeLength, value] = table1[bits >>> 24];
          if (!found) {
            while (bits >>> (32 - codeLength) < table2[codeLength][0])
              codeLength += 1;
            value = table2[codeLength][1];
          }
          if ((i += codeLength) > bitLength) break;
          const code = value - (bits >>> (32 - codeLength));
          let [result, decompressed] = dictionary[code];
          if (!decompressed) {
            // the result is itself compressed
            result = decompress(result);
            // cache the result for next time
            dictionary[code] = [result, true];
          }
          output = concatTypedArray(output, result);
        }
        return output;
      };
      return decompress;
    };
    const getIndexData = async (indxIndex, loadRecord) => {
      const indxRecord = await loadRecord(indxIndex);
      const indx = getStruct(INDX_HEADER, indxRecord);
      if (indx.magic !== "INDX") throw new Error("Invalid INDX record");
      const decoder = getDecoder(indx.encoding);
      const tagxBuffer = indxRecord.slice(indx.length);
      const tagx = getStruct(TAGX_HEADER, tagxBuffer);
      if (tagx.magic !== "TAGX") throw new Error("Invalid TAGX section");
      const numTags = (tagx.length - 12) / 4;
      const tagTable = Array.from(
        {
          length: numTags,
        },
        (_, i) => new Uint8Array(tagxBuffer.slice(12 + i * 4, 12 + i * 4 + 4)),
      );
      const cncx = {};
      let cncxRecordOffset = 0;
      for (let i = 0; i < indx.numCncx; i++) {
        const record = await loadRecord(indxIndex + indx.numRecords + i + 1);
        const array = new Uint8Array(record);
        for (let pos = 0; pos < array.byteLength; ) {
          const index = pos;
          const { value, length } = getVarLen(array, pos);
          pos += length;
          const result = record.slice(pos, pos + value);
          pos += value;
          cncx[cncxRecordOffset + index] = decoder.decode(result);
        }
        cncxRecordOffset += 0x10000;
      }
      const table = [];
      for (let i = 0; i < indx.numRecords; i++) {
        const record = await loadRecord(indxIndex + 1 + i);
        const array = new Uint8Array(record);
        const indx = getStruct(INDX_HEADER, record);
        if (indx.magic !== "INDX") throw new Error("Invalid INDX record");
        for (let j = 0; j < indx.numRecords; j++) {
          const offsetOffset = indx.idxt + 4 + 2 * j;
          const offset = getUint(record.slice(offsetOffset, offsetOffset + 2));
          const length = getUint(record.slice(offset, offset + 1));
          const name = getString(record.slice(offset + 1, offset + 1 + length));
          const tags = [];
          const startPos = offset + 1 + length;
          let controlByteIndex = 0;
          let pos = startPos + tagx.numControlBytes;
          for (const [tag, numValues, mask, end] of tagTable) {
            if (end & 1) {
              controlByteIndex++;
              continue;
            }
            const offset = startPos + controlByteIndex;
            const value = getUint(record.slice(offset, offset + 1)) & mask;
            if (value === mask) {
              if (countBitsSet(mask) > 1) {
                const { value, length } = getVarLen(array, pos);
                tags.push([tag, null, value, numValues]);
                pos += length;
              } else tags.push([tag, 1, null, numValues]);
            } else
              tags.push([tag, value >> countUnsetEnd(mask), null, numValues]);
          }
          const tagMap = {};
          for (const [tag, valueCount, valueBytes, numValues] of tags) {
            const values = [];
            if (valueCount != null) {
              for (let i = 0; i < valueCount * numValues; i++) {
                const { value, length } = getVarLen(array, pos);
                values.push(value);
                pos += length;
              }
            } else {
              let count = 0;
              while (count < valueBytes) {
                const { value, length } = getVarLen(array, pos);
                values.push(value);
                pos += length;
                count += length;
              }
            }
            tagMap[tag] = values;
          }
          table.push({
            name,
            tagMap,
          });
        }
      }
      return {
        table,
        cncx,
      };
    };
    const getNCX = async (indxIndex, loadRecord) => {
      const { table, cncx } = await getIndexData(indxIndex, loadRecord);
      const items = table.map(({ tagMap }, index) => ({
        index,
        offset: tagMap[1]?.[0],
        size: tagMap[2]?.[0],
        label: cncx[tagMap[3]] ?? "",
        headingLevel: tagMap[4]?.[0],
        pos: tagMap[6],
        parent: tagMap[21]?.[0],
        firstChild: tagMap[22]?.[0],
        lastChild: tagMap[23]?.[0],
      }));
      const getChildren = (item) => {
        if (item.firstChild == null) return item;
        item.children = items
          .filter((x) => x.parent === item.index)
          .map(getChildren);
        return item;
      };
      return items.filter((item) => item.headingLevel === 0).map(getChildren);
    };
    const getEXTH = (buf, encoding) => {
      const { magic, count } = getStruct(EXTH_HEADER, buf);
      if (magic !== "EXTH") throw new Error("Invalid EXTH header");
      const decoder = getDecoder(encoding);
      const results = {};
      let offset = 12;
      for (let i = 0; i < count; i++) {
        const type = getUint(buf.slice(offset, offset + 4));
        const length = getUint(buf.slice(offset + 4, offset + 8));
        if (type in EXTH_RECORD_TYPE) {
          const [name, typ, many] = EXTH_RECORD_TYPE[type];
          const data = buf.slice(offset + 8, offset + length);
          const value = typ === "uint" ? getUint(data) : decoder.decode(data);
          if (many) {
            results[name] ??= [];
            results[name].push(value);
          } else results[name] = value;
        }
        offset += length;
      }
      return results;
    };
    const getFont = async (buf, unzlib) => {
      const { flags, dataStart, keyLength, keyStart } = getStruct(
        FONT_HEADER,
        buf,
      );
      const array = new Uint8Array(buf.slice(dataStart));
      // deobfuscate font
      if (flags & 0b10) {
        const bytes = keyLength === 16 ? 1024 : 1040;
        const key = new Uint8Array(buf.slice(keyStart, keyStart + keyLength));
        const length = Math.min(bytes, array.length);
        for (var i = 0; i < length; i++)
          array[i] = array[i] ^ key[i % key.length];
      }
      // decompress font
      if (flags & 1)
        try {
          return await unzlib(array);
        } catch (e) {
          console.warn(e);
          console.warn("Failed to decompress font");
        }
      return array;
    };
    const isMOBI = async (file) => {
      const magic = getString(await file.slice(60, 68).arrayBuffer());
      return magic === "BOOKMOBI"; // || magic === 'TEXtREAd'
    };

    class PDB {
      #file;
      #offsets;
      pdb;
      async open(file) {
        this.#file = file;
        const pdb = getStruct(
          PDB_HEADER,
          await file.slice(0, 78).arrayBuffer(),
        );
        this.pdb = pdb;
        const buffer = await file
          .slice(78, 78 + pdb.numRecords * 8)
          .arrayBuffer();
        // get start and end offsets for each record
        this.#offsets = Array.from(
          {
            length: pdb.numRecords,
          },
          (_, i) => getUint(buffer.slice(i * 8, i * 8 + 4)),
        ).map((x, i, a) => [x, a[i + 1]]);
      }
      loadRecord(index) {
        const offsets = this.#offsets[index];
        if (!offsets) throw new RangeError("Record index out of bounds");
        return this.#file.slice(...offsets).arrayBuffer();
      }
      async loadMagic(index) {
        const start = this.#offsets[index][0];
        return getString(
          await this.#file.slice(start, start + 4).arrayBuffer(),
        );
      }
    }
    class MOBI extends PDB {
      #start = 0;
      #resourceStart;
      #decoder;
      #encoder;
      #decompress;
      #removeTrailingEntries;
      constructor({ unzlib }) {
        super();
        this.unzlib = unzlib;
      }
      async open(file) {
        await super.open(file);
        // TODO: if (this.pdb.type === 'TEXt')
        this.headers = this.#getHeaders(await super.loadRecord(0));
        this.#resourceStart = this.headers.mobi.resourceStart;
        let isKF8 = this.headers.mobi.version >= 8;
        if (!isKF8) {
          const boundary = this.headers.exth?.boundary;
          if (boundary < 0xffffffff)
            try {
              // it's a "combo" MOBI/KF8 file; try to open the KF8 part
              this.headers = this.#getHeaders(await super.loadRecord(boundary));
              this.#start = boundary;
              isKF8 = true;
            } catch (e) {
              console.warn(e);
              console.warn("Failed to open KF8; falling back to MOBI");
            }
        }
        await this.#setup();
        return isKF8 ? new KF8(this).init() : new MOBI6(this).init();
      }
      #getHeaders(buf) {
        const palmdoc = getStruct(PALMDOC_HEADER, buf);
        const mobi = getStruct(MOBI_HEADER, buf);
        if (mobi.magic !== "MOBI") throw new Error("Missing MOBI header");
        const { titleOffset, titleLength, localeLanguage, localeRegion } = mobi;
        mobi.title = buf.slice(titleOffset, titleOffset + titleLength);
        const lang = MOBI_LANG[localeLanguage];
        mobi.language = lang?.[localeRegion >> 2] ?? lang?.[0];
        const exth =
          mobi.exthFlag & 0b100_0000
            ? getEXTH(buf.slice(mobi.length + 16), mobi.encoding)
            : null;
        const kf8 = mobi.version >= 8 ? getStruct(KF8_HEADER, buf) : null;
        return {
          palmdoc,
          mobi,
          exth,
          kf8,
        };
      }
      async #setup() {
        const { palmdoc, mobi } = this.headers;
        this.#decoder = getDecoder(mobi.encoding);
        // \`TextEncoder\` only supports UTF-8
        // we are only encoding ASCII anyway, so I think it's fine
        this.#encoder = new TextEncoder();

        // set up decompressor
        const { compression } = palmdoc;
        this.#decompress =
          compression === 1
            ? (f) => f
            : compression === 2
            ? decompressPalmDOC
            : compression === 17480
            ? await huffcdic(mobi, this.loadRecord.bind(this))
            : null;
        if (!this.#decompress) throw new Error("Unknown compression type");

        // set up function for removing trailing bytes
        const { trailingFlags } = mobi;
        const multibyte = trailingFlags & 1;
        const numTrailingEntries = countBitsSet(trailingFlags >>> 1);
        this.#removeTrailingEntries = (array) => {
          for (let i = 0; i < numTrailingEntries; i++) {
            const length = getVarLenFromEnd(array);
            array = array.subarray(0, -length);
          }
          if (multibyte) {
            const length = (array[array.length - 1] & 0b11) + 1;
            array = array.subarray(0, -length);
          }
          return array;
        };
      }
      decode(...args) {
        return this.#decoder.decode(...args);
      }
      encode(...args) {
        return this.#encoder.encode(...args);
      }
      loadRecord(index) {
        return super.loadRecord(this.#start + index);
      }
      loadMagic(index) {
        return super.loadMagic(this.#start + index);
      }
      loadText(index) {
        return this.loadRecord(index + 1)
          .then((buf) => new Uint8Array(buf))
          .then(this.#removeTrailingEntries)
          .then(this.#decompress);
      }
      async loadResource(index) {
        const buf = await super.loadRecord(this.#resourceStart + index);
        const magic = getString(buf.slice(0, 4));
        if (magic === "FONT") return getFont(buf, this.unzlib);
        if (magic === "VIDE" || magic === "AUDI") return buf.slice(12);
        return buf;
      }
      getNCX() {
        const index = this.headers.mobi.indx;
        if (index < 0xffffffff)
          return getNCX(index, this.loadRecord.bind(this));
      }
      getMetadata() {
        const { mobi, exth } = this.headers;
        return {
          identifier: mobi.uid.toString(),
          title: unescapeHTML(exth?.title || this.decode(mobi.title)),
          author: exth?.creator?.map(unescapeHTML),
          publisher: unescapeHTML(exth?.publisher),
          language: exth?.language ?? mobi.language,
          published: exth?.date,
          description: unescapeHTML(exth?.description),
          subject: exth?.subject?.map(unescapeHTML),
          rights: unescapeHTML(exth?.rights),
        };
      }
      async getCover() {
        const { exth } = this.headers;
        const offset =
          exth?.coverOffset < 0xffffffff
            ? exth?.coverOffset
            : exth?.thumbnailOffset < 0xffffffff
            ? exth?.thumbnailOffset
            : null;
        if (offset != null) {
          const buf = await this.loadResource(offset);
          return new Blob([buf]);
        }
      }
    }
    const mbpPagebreakRegex = /<\\s*(?:mbp:)?pagebreak[^>]*>/gi;
    const fileposRegex = /<[^<>]+filepos=['"]{0,1}(\\d+)[^<>]*>/gi;
    class MOBI6 {
      parser = new DOMParser();
      serializer = new XMLSerializer();
      #resourceCache = new Map();
      #textCache = new Map();
      #cache = new Map();
      #sections;
      #fileposList = [];
      #type = mobi_MIME.HTML;
      constructor(mobi) {
        this.mobi = mobi;
      }
      async init() {
        // load all text records in an array
        let array = new Uint8Array();
        for (let i = 0; i < this.mobi.headers.palmdoc.numTextRecords; i++)
          array = concatTypedArray(array, await this.mobi.loadText(i));

        // convert to string so we can use regex
        // note that \`filepos\` are byte offsets
        // so it needs to preserve each byte as a separate character
        // (see https://stackoverflow.com/q/50198017)
        const str = Array.from(new Uint8Array(array), (c) =>
          String.fromCharCode(c),
        ).join("");

        // split content into sections at each \`<mbp:pagebreak>\`
        this.#sections = [0]
          .concat(Array.from(str.matchAll(mbpPagebreakRegex), (m) => m.index))
          .map((x, i, a) => str.slice(x, a[i + 1]))
          // recover the original raw bytes
          .map((str) => Uint8Array.from(str, (x) => x.charCodeAt(0)))
          .map((raw) => ({
            book: this,
            raw,
          }))
          // get start and end filepos for each section
          .reduce((arr, x) => {
            const last = arr[arr.length - 1];
            x.start = last?.end ?? 0;
            x.end = x.start + x.raw.byteLength;
            return arr.concat(x);
          }, []);
        this.sections = this.#sections.map((section, index) => ({
          id: index,
          load: () => this.loadSection(section),
          createDocument: () => this.createDocument(section),
          size: section.end - section.start,
        }));
        const fileposInNCX = [];
        try {
          const ncx = await this.mobi.getNCX();
          const map = ({ label, offset, children }) => {
            const filepos = offset.toString().padStart(10, "0");
            const href = \`filepos:\${filepos}\`;
            fileposInNCX.push(filepos);
            label = unescapeHTML(label);
            return {
              label,
              href,
              subitems: children?.map(map),
            };
          };
          this.toc = ncx?.map(map);
          this.landmarks = await this.getGuide();

          // try to build TOC if there's no NCX
          if (!this.toc) {
            const tocHref = this.landmarks.find(({ type }) =>
              type?.includes("toc"),
            )?.href;
            if (tocHref) {
              const { index } = this.resolveHref(tocHref);
              const doc = await this.sections[index].createDocument();
              this.toc = Array.from(
                doc.querySelectorAll("a[filepos]"),
                (a) => ({
                  label: a.innerText?.trim(),
                  href: \`filepos:\${a.getAttribute("filepos")}\`,
                }),
              );
            }
          }
        } catch (e) {
          console.warn(e);
        }

        // get list of all \`filepos\` references in the book,
        // which will be used to insert anchor elements
        // because only then can they be referenced in the DOM
        this.#fileposList = [
          ...new Set(
            fileposInNCX.concat(
              Array.from(str.matchAll(fileposRegex), (m) => m[1]),
            ),
          ),
        ]
          .map((filepos) => ({
            filepos,
            number: Number(filepos),
          }))
          .sort((a, b) => a.number - b.number);
        this.metadata = this.mobi.getMetadata();
        this.getCover = this.mobi.getCover.bind(this.mobi);
        return this;
      }
      async getGuide() {
        const doc = await this.createDocument(this.#sections[0]);
        return Array.from(doc.getElementsByTagName("reference"), (ref) => ({
          label: ref.getAttribute("title"),
          type: ref.getAttribute("type")?.split(/\\s/),
          href: \`filepos:\${ref.getAttribute("filepos")}\`,
        }));
      }
      async loadResource(index) {
        if (this.#resourceCache.has(index))
          return this.#resourceCache.get(index);
        const raw = await this.mobi.loadResource(index);
        const url = URL.createObjectURL(new Blob([raw]));
        this.#resourceCache.set(index, url);
        return url;
      }
      async loadRecindex(recindex) {
        return this.loadResource(Number(recindex) - 1);
      }
      async replaceResources(doc) {
        for (const img of doc.querySelectorAll("img[recindex]")) {
          const recindex = img.getAttribute("recindex");
          try {
            img.src = await this.loadRecindex(recindex);
          } catch (e) {
            console.warn(\`Failed to load image \${recindex}\`);
          }
        }
        for (const media of doc.querySelectorAll("[mediarecindex]")) {
          const mediarecindex = media.getAttribute("mediarecindex");
          const recindex = media.getAttribute("recindex");
          try {
            media.src = await this.loadRecindex(mediarecindex);
            if (recindex) media.poster = await this.loadRecindex(recindex);
          } catch (e) {
            console.warn(\`Failed to load media \${mediarecindex}\`);
          }
        }
        for (const a of doc.querySelectorAll("[filepos]")) {
          const filepos = a.getAttribute("filepos");
          a.href = \`filepos:\${filepos}\`;
        }
      }
      async loadText(section) {
        if (this.#textCache.has(section)) return this.#textCache.get(section);
        const { raw } = section;

        // insert anchor elements for each \`filepos\`
        const fileposList = this.#fileposList
          .filter(
            ({ number }) => number >= section.start && number < section.end,
          )
          .map((obj) => ({
            ...obj,
            offset: obj.number - section.start,
          }));
        let arr = raw;
        if (fileposList.length) {
          arr = raw.subarray(0, fileposList[0].offset);
          fileposList.forEach(({ filepos, offset }, i) => {
            const next = fileposList[i + 1];
            const a = this.mobi.encode(\`<a id="filepos\${filepos}"></a>\`);
            arr = concatTypedArray3(arr, a, raw.subarray(offset, next?.offset));
          });
        }
        const str = this.mobi.decode(arr).replaceAll(mbpPagebreakRegex, "");
        this.#textCache.set(section, str);
        return str;
      }
      async createDocument(section) {
        const str = await this.loadText(section);
        return this.parser.parseFromString(str, this.#type);
      }
      async loadSection(section) {
        if (this.#cache.has(section)) return this.#cache.get(section);
        const doc = await this.createDocument(section);

        // inject default stylesheet
        const style = doc.createElement("style");
        doc.head.append(style);
        // blockquotes in MOBI seem to have only a small left margin by default
        // many books seem to rely on this, as it's the only way to set margin
        // (since there's no CSS)
        style.append(
          doc.createTextNode(\`blockquote {
            margin-block-start: 0;
            margin-block-end: 0;
            margin-inline-start: 1em;
            margin-inline-end: 0;
        }\`),
        );
        await this.replaceResources(doc);
        const result = this.serializer.serializeToString(doc);
        const url = URL.createObjectURL(
          new Blob([result], {
            type: this.#type,
          }),
        );
        this.#cache.set(section, url);
        return url;
      }
      resolveHref(href) {
        const filepos = href.match(/filepos:(.*)/)[1];
        const number = Number(filepos);
        const index = this.#sections.findIndex(
          (section) => section.end > number,
        );
        const anchor = (doc) => doc.getElementById(\`filepos\${filepos}\`);
        return {
          index,
          anchor,
        };
      }
      splitTOCHref(href) {
        const filepos = href.match(/filepos:(.*)/)[1];
        const number = Number(filepos);
        const index = this.#sections.findIndex(
          (section) => section.end > number,
        );
        return [index, \`filepos\${filepos}\`];
      }
      getTOCFragment(doc, id) {
        return doc.getElementById(id);
      }
      isExternal(uri) {
        return /^(?!blob|filepos)\\w+:/i.test(uri);
      }
      destroy() {
        for (const url of this.#resourceCache.values())
          URL.revokeObjectURL(url);
        for (const url of this.#cache.values()) URL.revokeObjectURL(url);
      }
    }

    // handlers for \`kindle:\` uris
    const kindleResourceRegex =
      /kindle:(flow|embed):(\\w+)(?:\\?mime=(\\w+\\/[-+.\\w]+))?/;
    const kindlePosRegex = /kindle:pos:fid:(\\w+):off:(\\w+)/;
    const parseResourceURI = (str) => {
      const [resourceType, id, type] = str.match(kindleResourceRegex).slice(1);
      return {
        resourceType,
        id: parseInt(id, 32),
        type,
      };
    };
    const parsePosURI = (str) => {
      const [fid, off] = str.match(kindlePosRegex).slice(1);
      return {
        fid: parseInt(fid, 32),
        off: parseInt(off, 32),
      };
    };
    const makePosURI = (fid = 0, off = 0) =>
      \`kindle:pos:fid:\${fid
        .toString(32)
        .toUpperCase()
        .padStart(4, "0")}:off:\${off
        .toString(32)
        .toUpperCase()
        .padStart(10, "0")}\`;

    // \`kindle:pos:\` links are originally links that contain fragments identifiers
    // so there should exist an element with \`id\` or \`name\`
    // otherwise try to find one with an \`aid\` attribute
    const getFragmentSelector = (str) => {
      const match = str.match(/\\s(id|name|aid)\\s*=\\s*['"]([^'"]*)['"]/i);
      if (!match) return;
      const [, attr, value] = match;
      return \`[\${attr}="\${CSS.escape(value)}"]\`;
    };

    // replace asynchronously and sequentially
    const mobi_replaceSeries = async (str, regex, f) => {
      const matches = [];
      str.replace(regex, (...args) => (matches.push(args), null));
      const results = [];
      for (const args of matches) results.push(await f(...args));
      return str.replace(regex, () => results.shift());
    };
    const mobi_getPageSpread = (properties) => {
      for (const p of properties) {
        if (p === "page-spread-left" || p === "rendition:page-spread-left")
          return "left";
        if (p === "page-spread-right" || p === "rendition:page-spread-right")
          return "right";
        if (p === "rendition:page-spread-center") return "center";
      }
    };
    class KF8 {
      parser = new DOMParser();
      serializer = new XMLSerializer();
      #cache = new Map();
      #fragmentOffsets = new Map();
      #fragmentSelectors = new Map();
      #tables = {};
      #sections;
      #fullRawLength;
      #rawHead = new Uint8Array();
      #rawTail = new Uint8Array();
      #lastLoadedHead = -1;
      #lastLoadedTail = -1;
      #type = mobi_MIME.XHTML;
      #inlineMap = new Map();
      constructor(mobi) {
        this.mobi = mobi;
      }
      async init() {
        const loadRecord = this.mobi.loadRecord.bind(this.mobi);
        const { kf8 } = this.mobi.headers;
        try {
          const fdstBuffer = await loadRecord(kf8.fdst);
          const fdst = getStruct(FDST_HEADER, fdstBuffer);
          if (fdst.magic !== "FDST") throw new Error("Missing FDST record");
          const fdstTable = Array.from(
            {
              length: fdst.numEntries,
            },
            (_, i) => 12 + i * 8,
          ).map((offset) => [
            getUint(fdstBuffer.slice(offset, offset + 4)),
            getUint(fdstBuffer.slice(offset + 4, offset + 8)),
          ]);
          this.#tables.fdstTable = fdstTable;
          this.#fullRawLength = fdstTable[fdstTable.length - 1][1];
        } catch {}
        const skelTable = (await getIndexData(kf8.skel, loadRecord)).table.map(
          ({ name, tagMap }, index) => ({
            index,
            name,
            numFrag: tagMap[1][0],
            offset: tagMap[6][0],
            length: tagMap[6][1],
          }),
        );
        const fragData = await getIndexData(kf8.frag, loadRecord);
        const fragTable = fragData.table.map(({ name, tagMap }) => ({
          insertOffset: parseInt(name),
          selector: fragData.cncx[tagMap[2][0]],
          index: tagMap[4][0],
          offset: tagMap[6][0],
          length: tagMap[6][1],
        }));
        this.#tables.skelTable = skelTable;
        this.#tables.fragTable = fragTable;
        this.#sections = skelTable.reduce((arr, skel) => {
          const last = arr[arr.length - 1];
          const fragStart = last?.fragEnd ?? 0,
            fragEnd = fragStart + skel.numFrag;
          const frags = fragTable.slice(fragStart, fragEnd);
          const length =
            skel.length + frags.map((f) => f.length).reduce((a, b) => a + b);
          const totalLength = (last?.totalLength ?? 0) + length;
          return arr.concat({
            skel,
            frags,
            fragEnd,
            length,
            totalLength,
          });
        }, []);
        const resources = await this.getResourcesByMagic(["RESC", "PAGE"]);
        const pageSpreads = new Map();
        if (resources.RESC) {
          const buf = await this.mobi.loadRecord(resources.RESC);
          const str = this.mobi.decode(buf.slice(16)).replace(/\\0/g, "");
          // the RESC record lacks the root \`<package>\` element
          // but seem to be otherwise valid XML
          const index = str.search(/\\?>/);
          const xmlStr = \`<package>\${str.slice(index)}</package>\`;
          const opf = this.parser.parseFromString(xmlStr, mobi_MIME.XML);
          for (const \$itemref of opf.querySelectorAll("spine > itemref")) {
            const i = parseInt(\$itemref.getAttribute("skelid"));
            pageSpreads.set(
              i,
              mobi_getPageSpread(
                \$itemref.getAttribute("properties")?.split(" ") ?? [],
              ),
            );
          }
        }
        this.sections = this.#sections.map((section, index) =>
          section.frags.length
            ? {
                id: index,
                load: () => this.loadSection(section),
                createDocument: () => this.createDocument(section),
                size: section.length,
                pageSpread: pageSpreads.get(index),
              }
            : {
                linear: "no",
              },
        );
        try {
          const ncx = await this.mobi.getNCX();
          const map = ({ label, pos, children }) => {
            const [fid, off] = pos;
            const href = makePosURI(fid, off);
            const arr = this.#fragmentOffsets.get(fid);
            if (arr) arr.push(off);
            else this.#fragmentOffsets.set(fid, [off]);
            return {
              label: unescapeHTML(label),
              href,
              subitems: children?.map(map),
            };
          };
          this.toc = ncx?.map(map);
          this.landmarks = await this.getGuide();
        } catch (e) {
          console.warn(e);
        }
        const { exth } = this.mobi.headers;
        this.dir = exth.pageProgressionDirection;
        this.rendition = {
          layout: exth.fixedLayout === "true" ? "pre-paginated" : "reflowable",
          viewport: Object.fromEntries(
            exth.originalResolution
              ?.split("x")
              ?.slice(0, 2)
              ?.map((x, i) => [i ? "height" : "width", x]) ?? [],
          ),
        };
        this.metadata = this.mobi.getMetadata();
        this.getCover = this.mobi.getCover.bind(this.mobi);
        return this;
      }
      // is this really the only way of getting to RESC, PAGE, etc.?
      async getResourcesByMagic(keys) {
        const results = {};
        const start = this.mobi.headers.kf8.resourceStart;
        const end = this.mobi.pdb.numRecords;
        for (let i = start; i < end; i++) {
          try {
            const magic = await this.mobi.loadMagic(i);
            const match = keys.find((key) => key === magic);
            if (match) results[match] = i;
          } catch {}
        }
        return results;
      }
      async getGuide() {
        const index = this.mobi.headers.kf8.guide;
        if (index < 0xffffffff) {
          const loadRecord = this.mobi.loadRecord.bind(this.mobi);
          const { table, cncx } = await getIndexData(index, loadRecord);
          return table.map(({ name, tagMap }) => ({
            label: cncx[tagMap[1][0]] ?? "",
            type: name?.split(/\\s/),
            href: makePosURI(tagMap[6]?.[0] ?? tagMap[3]?.[0]),
          }));
        }
      }
      async loadResourceBlob(str) {
        const { resourceType, id, type } = parseResourceURI(str);
        const raw =
          resourceType === "flow"
            ? await this.loadFlow(id)
            : await this.mobi.loadResource(id - 1);
        const result = [
          mobi_MIME.XHTML,
          mobi_MIME.HTML,
          mobi_MIME.CSS,
          mobi_MIME.SVG,
        ].includes(type)
          ? await this.replaceResources(this.mobi.decode(raw))
          : raw;
        const doc =
          type === mobi_MIME.SVG
            ? this.parser.parseFromString(result, type)
            : null;
        return [
          new Blob([result], {
            type,
          }),
          // SVG wrappers need to be inlined
          // as browsers don't allow external resources when loading SVG as an image
          doc?.getElementsByTagNameNS("http://www.w3.org/2000/svg", "image")
            ?.length
            ? doc.documentElement
            : null,
        ];
      }
      async loadResource(str) {
        if (this.#cache.has(str)) return this.#cache.get(str);
        const [blob, inline] = await this.loadResourceBlob(str);
        const url = inline ? str : URL.createObjectURL(blob);
        if (inline) this.#inlineMap.set(url, inline);
        this.#cache.set(str, url);
        return url;
      }
      replaceResources(str) {
        const regex = new RegExp(kindleResourceRegex, "g");
        return mobi_replaceSeries(str, regex, this.loadResource.bind(this));
      }
      // NOTE: there doesn't seem to be a way to access text randomly?
      // how to know the decompressed size of the records without decompressing?
      // 4096 is just the maximum size
      async loadRaw(start, end) {
        // here we load either from the front or back until we have reached the
        // required offsets; at worst you'd have to load half the book at once
        const distanceHead = end - this.#rawHead.length;
        const distanceEnd =
          this.#fullRawLength == null
            ? Infinity
            : this.#fullRawLength - this.#rawTail.length - start;
        // load from the start
        if (distanceHead < 0 || distanceHead < distanceEnd) {
          while (this.#rawHead.length < end) {
            const index = ++this.#lastLoadedHead;
            const data = await this.mobi.loadText(index);
            this.#rawHead = concatTypedArray(this.#rawHead, data);
          }
          return this.#rawHead.slice(start, end);
        }
        // load from the end
        while (this.#fullRawLength - this.#rawTail.length > start) {
          const index =
            this.mobi.headers.palmdoc.numTextRecords -
            1 -
            ++this.#lastLoadedTail;
          const data = await this.mobi.loadText(index);
          this.#rawTail = concatTypedArray(data, this.#rawTail);
        }
        const rawTailStart = this.#fullRawLength - this.#rawTail.length;
        return this.#rawTail.slice(start - rawTailStart, end - rawTailStart);
      }
      loadFlow(index) {
        if (index < 0xffffffff)
          return this.loadRaw(...this.#tables.fdstTable[index]);
      }
      async loadText(section) {
        const { skel, frags, length } = section;
        const raw = await this.loadRaw(skel.offset, skel.offset + length);
        let skeleton = raw.slice(0, skel.length);
        for (const frag of frags) {
          const insertOffset = frag.insertOffset - skel.offset;
          const offset = skel.length + frag.offset;
          const fragRaw = raw.slice(offset, offset + frag.length);
          skeleton = concatTypedArray3(
            skeleton.slice(0, insertOffset),
            fragRaw,
            skeleton.slice(insertOffset),
          );
          const offsets = this.#fragmentOffsets.get(frag.index);
          if (offsets)
            for (const offset of offsets) {
              const str = this.mobi.decode(fragRaw).slice(offset);
              const selector = getFragmentSelector(str);
              this.#setFragmentSelector(frag.index, offset, selector);
            }
        }
        return this.mobi.decode(skeleton);
      }
      async createDocument(section) {
        const str = await this.loadText(section);
        return this.parser.parseFromString(str, this.#type);
      }
      async loadSection(section) {
        if (this.#cache.has(section)) return this.#cache.get(section);
        const str = await this.loadText(section);
        const replaced = await this.replaceResources(str);

        // by default, type is XHTML; change to HTML if it's not valid XHTML
        let doc = this.parser.parseFromString(replaced, this.#type);
        if (doc.querySelector("parsererror")) {
          this.#type = mobi_MIME.HTML;
          doc = this.parser.parseFromString(replaced, this.#type);
        }
        for (const [url, node] of this.#inlineMap) {
          for (const el of doc.querySelectorAll(\`img[src="\${url}"]\`))
            el.replaceWith(node);
        }
        const url = URL.createObjectURL(
          new Blob([this.serializer.serializeToString(doc)], {
            type: this.#type,
          }),
        );
        this.#cache.set(section, url);
        return url;
      }
      getIndexByFID(fid) {
        return this.#sections.findIndex((section) =>
          section.frags.some((frag) => frag.index === fid),
        );
      }
      #setFragmentSelector(id, offset, selector) {
        const map = this.#fragmentSelectors.get(id);
        if (map) map.set(offset, selector);
        else {
          const map = new Map();
          this.#fragmentSelectors.set(id, map);
          map.set(offset, selector);
        }
      }
      async resolveHref(href) {
        const { fid, off } = parsePosURI(href);
        const index = this.getIndexByFID(fid);
        if (index < 0) return;
        const saved = this.#fragmentSelectors.get(fid)?.get(off);
        if (saved)
          return {
            index,
            anchor: (doc) => doc.querySelector(saved),
          };
        const { skel, frags } = this.#sections[index];
        const frag = frags.find((frag) => frag.index === fid);
        const offset = skel.offset + skel.length + frag.offset;
        const fragRaw = await this.loadRaw(offset, offset + frag.length);
        const str = this.mobi.decode(fragRaw).slice(off);
        const selector = getFragmentSelector(str);
        this.#setFragmentSelector(fid, off, selector);
        const anchor = (doc) => doc.querySelector(selector);
        return {
          index,
          anchor,
        };
      }
      splitTOCHref(href) {
        const pos = parsePosURI(href);
        const index = this.getIndexByFID(pos.fid);
        return [index, pos];
      }
      getTOCFragment(doc, { fid, off }) {
        const selector = this.#fragmentSelectors.get(fid)?.get(off);
        return doc.querySelector(selector);
      }
      isExternal(uri) {
        return /^(?!blob|kindle)\\w+:/i.test(uri);
      }
      destroy() {
        for (const url of this.#cache.values()) URL.revokeObjectURL(url);
      }
    } // CONCATENATED MODULE: ./my-foliate/request.js
    // const reactMessage = (m) => {
    //   window.ReactNativeWebView.postMessage(
    //     JSON.stringify({ type: "epubjs", message: m })
    //   );
    // };

    /**
     * Parse xml (or html) markup
     * @param {string} markup
     * @param {string} mime
     * @param {boolean} forceXMLDom force using xmlDom to parse instead of native parser
     * @returns {document} document
     * @memberof Core
     */
    function request_parse(markup, mime, forceXMLDom) {
      var doc;
      var Parser;
      if (typeof DOMParser === "undefined" || forceXMLDom) {
        Parser = XMLDOMParser;
      } else {
        Parser = DOMParser;
      }

      // Remove byte order mark before parsing
      // https://www.w3.org/International/questions/qa-byte-order-mark
      if (markup.charCodeAt(0) === 0xfeff) {
        markup = markup.slice(1);
      }
      doc = new Parser().parseFromString(markup, mime);
      return doc;
    }

    /**
     * Generates a UUID
     * based on: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     * @returns {string} uuid
     * @memberof Core
     */
    function uuid() {
      var d = new Date().getTime();
      var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == "x" ? r : (r & 0x7) | 0x8).toString(16);
        },
      );
      return uuid;
    }
    /**
     * Check if extension is xml
     * @param {string} ext
     * @returns {boolean}
     * @memberof Core
     */
    function isXml(ext) {
      return ["xml", "opf", "ncx"].indexOf(ext) > -1;
    }

    /**
     * Creates a new pending promise and provides methods to resolve or reject it.
     * From: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred#backwards_forwards_compatible
     * @memberof Core
     */
    function defer() {
      /* A method to resolve the associated Promise with the value passed.
       * If the promise is already settled it does nothing.
       *
       * @param {anything} value : This value is used to resolve the promise
       * If the value is a Promise then the associated promise assumes the state
       * of Promise passed as value.
       */
      this.resolve = null;

      /* A method to reject the associated Promise with the value passed.
       * If the promise is already settled it does nothing.
       *
       * @param {anything} reason: The reason for the rejection of the Promise.
       * Generally its an Error object. If however a Promise is passed, then the Promise
       * itself will be the reason for rejection no matter the state of the Promise.
       */
      this.reject = null;
      this.id = uuid();

      /* A newly created Pomise object.
       * Initially in pending state.
       */
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
      Object.freeze(this);
    }

    // import path from "path-webpack";
    /**
     * Creates a Path object for parsing and manipulation of a path strings
     *
     * Uses a polyfill for Nodejs path: https://nodejs.org/api/path.html
     * @param	{string} pathString	a url string (relative or absolute)
     * @class
     */
    class Path {
      constructor(pathString) {
        var protocol;
        var parsed;
        protocol = pathString.indexOf("://");
        if (protocol > -1) {
          pathString = new URL(pathString).pathname;
        }
        parsed = this.parse(pathString);
        this.path = pathString;
        if (this.isDirectory(pathString)) {
          this.directory = pathString;
        } else {
          this.directory = parsed.dir + "/";
        }
        this.filename = parsed.base;
        this.extension = parsed.ext.slice(1);
      }

      /**
       * Parse the path: https://nodejs.org/api/path.html#path_path_parse_path
       * @param	{string} what
       * @returns {object}
       */
      parse(what) {
        return path.parse(what);
      }

      /**
       * @param	{string} what
       * @returns {boolean}
       */
      isAbsolute(what) {
        return path.isAbsolute(what || this.path);
      }

      /**
       * Check if path ends with a directory
       * @param	{string} what
       * @returns {boolean}
       */
      isDirectory(what) {
        return what.charAt(what.length - 1) === "/";
      }

      /**
       * Resolve a path against the directory of the Path
       *
       * https://nodejs.org/api/path.html#path_path_resolve_paths
       * @param	{string} what
       * @returns {string} resolved
       */
      resolve(what) {
        return path.resolve(this.directory, what);
      }

      /**
       * Resolve a path relative to the directory of the Path
       *
       * https://nodejs.org/api/path.html#path_path_relative_from_to
       * @param	{string} what
       * @returns {string} relative
       */
      relative(what) {
        var isAbsolute = what && what.indexOf("://") > -1;
        if (isAbsolute) {
          return what;
        }
        return path.relative(this.directory, what);
      }
      splitPath(filename) {
        return this.splitPathRe.exec(filename).slice(1);
      }

      /**
       * Return the path string
       * @returns {string} path
       */
      toString() {
        return this.path;
      }
    }
    function request(url, type, withCredentials, headers) {
      var supportsURL = typeof window != "undefined" ? window.URL : false; // TODO: fallback for url if window isn't defined
      var BLOB_RESPONSE = supportsURL ? "blob" : "arraybuffer";
      var deferred = new defer();
      var xhr = new XMLHttpRequest();

      //-- Check from PDF.js:
      //   https://github.com/mozilla/pdf.js/blob/master/web/compatibility.js
      var xhrPrototype = XMLHttpRequest.prototype;
      var header;
      if (!("overrideMimeType" in xhrPrototype)) {
        // IE10 might have response, but not overrideMimeType
        Object.defineProperty(xhrPrototype, "overrideMimeType", {
          value: function xmlHttpRequestOverrideMimeType() {},
        });
      }
      if (withCredentials) {
        xhr.withCredentials = true;
      }
      xhr.onreadystatechange = handler;
      xhr.onerror = err;
      xhr.open("GET", url, true);

      // window.ReactNativeWebView.postMessage(
      //   JSON.stringify({ type: "epubjs", message: "[REQUEST] " + url })
      // );

      for (header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }
      if (type == "json") {
        xhr.setRequestHeader("Accept", "application/json");
      }

      // If type isn"t set, determine it from the file extension
      if (!type) {
        type = new Path(url).extension;
      }
      if (type == "blob") {
        xhr.responseType = BLOB_RESPONSE;
      }
      if (isXml(type)) {
        // xhr.responseType = "document";
        xhr.overrideMimeType("text/xml"); // for OPF parsing
      }

      if (type == "xhtml") {
        // xhr.responseType = "document";
      }
      if (type == "html" || type == "htm") {
        // xhr.responseType = "document";
      }
      if (type == "binary") {
        xhr.responseType = "arraybuffer";
      }
      xhr.send();
      function err(e) {
        deferred.reject(e);
      }
      function handler() {
        if (this.readyState === XMLHttpRequest.DONE) {
          // reactMessage("[REQUEST_HANDLER] STARTING...");
          var responseXML = false;
          if (this.responseType === "" || this.responseType === "document") {
            responseXML = this.responseXML;
          }

          // reactMessage(\`[REQUEST_HANDLER] \${this.responseType} \${this.response}\`);

          if (this.status === 200 || this.status === 0 || responseXML) {
            //-- Firefox is reporting 0 for blob urls
            var r;
            if (!this.response && !responseXML) {
              deferred.reject({
                status: this.status,
                message: "Empty Response",
                stack: new Error().stack,
              });
              return deferred.promise;
            }
            if (this.status === 403) {
              deferred.reject({
                status: this.status,
                response: this.response,
                message: "Forbidden",
                stack: new Error().stack,
              });
              return deferred.promise;
            }
            if (responseXML) {
              r = this.responseXML;
            } else if (isXml(type)) {
              // xhr.overrideMimeType("text/xml"); // for OPF parsing
              // If this.responseXML wasn't set, try to parse using a DOMParser from text
              r = request_parse(this.response, "text/xml");
            } else if (type == "xhtml") {
              r = request_parse(this.response, "application/xhtml+xml");
            } else if (type == "html" || type == "htm") {
              r = request_parse(this.response, "text/html");
            } else if (type == "json") {
              r = JSON.parse(this.response);
            } else if (type == "blob") {
              if (supportsURL) {
                r = this.response;
              } else {
                //-- Safari doesn't support responseType blob, so create a blob from arraybuffer
                r = new Blob([this.response]);
              }
            } else {
              r = this.response;
            }
            // reactMessage(\`[REQUEST_HANDLER] END of DEFF \${r}\`);

            deferred.resolve(r);
          } else {
            deferred.reject({
              status: this.status,
              message: this.response,
              stack: new Error().stack,
            });
          }
        }
      }
      return deferred.promise;
    } // CONCATENATED MODULE: ./my-foliate/pdf.js
    /* global pdfjsLib */

    // https://github.com/mozilla/pdf.js/blob/f04967017f22e46d70d11468dd928b4cdc2f6ea1/web/text_layer_builder.css
    const textLayerBuilderCSS = \`
/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

:root {
  --highlight-bg-color: rgb(180 0 170);
  --highlight-selected-bg-color: rgb(0 100 0);
}

@media screen and (forced-colors: active) {
  :root {
    --highlight-bg-color: Highlight;
    --highlight-selected-bg-color: ButtonText;
  }
}

.textLayer {
  position: absolute;
  text-align: initial;
  inset: 0;
  overflow: hidden;
  opacity: 0.25;
  line-height: 1;
  text-size-adjust: none;
  forced-color-adjust: none;
  transform-origin: 0 0;
  z-index: 2;
}

.textLayer :is(span, br) {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

/* Only necessary in Google Chrome, see issue 14205, and most unfortunately
 * the problem doesn't show up in "text" reference tests. */
/*#if !MOZCENTRAL*/
.textLayer span.markedContent {
  top: 0;
  height: 0;
}
/*#endif*/

.textLayer .highlight {
  margin: -1px;
  padding: 1px;
  background-color: var(--highlight-bg-color);
  border-radius: 4px;
}

.textLayer .highlight.appended {
  position: initial;
}

.textLayer .highlight.begin {
  border-radius: 4px 0 0 4px;
}

.textLayer .highlight.end {
  border-radius: 0 4px 4px 0;
}

.textLayer .highlight.middle {
  border-radius: 0;
}

.textLayer .highlight.selected {
  background-color: var(--highlight-selected-bg-color);
}

.textLayer ::selection {
  /*#if !MOZCENTRAL*/
  background: blue;
  /*#endif*/
  background: AccentColor; /* stylelint-disable-line declaration-block-no-duplicate-properties */
}

/* Avoids https://github.com/mozilla/pdf.js/issues/13840 in Chrome */
/*#if !MOZCENTRAL*/
.textLayer br::selection {
  background: transparent;
}
/*#endif*/

.textLayer .endOfContent {
  display: block;
  position: absolute;
  inset: 100% 0 0;
  z-index: -1;
  cursor: default;
  user-select: none;
}

.textLayer .endOfContent.active {
  top: 0;
}
\`;

    //https://github.com/mozilla/pdf.js/blob/d64f223d034ad74fb62571c3acff566d25eca413/web/annotation_layer_builder.css
    const annotationLayerBuilderCSS = \`
/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

:root {
  --annotation-unfocused-field-background: url("data:image/svg+xml;charset=UTF-8,<svg width='1px' height='1px' xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' style='fill:rgba(0, 54, 255, 0.13);'/></svg>");
  --input-focus-border-color: Highlight;
  --input-focus-outline: 1px solid Canvas;
  --input-unfocused-border-color: transparent;
  --input-disabled-border-color: transparent;
  --input-hover-border-color: black;
  --link-outline: none;
}

@media screen and (forced-colors: active) {
  :root {
    --input-focus-border-color: CanvasText;
    --input-unfocused-border-color: ActiveText;
    --input-disabled-border-color: GrayText;
    --input-hover-border-color: Highlight;
    --link-outline: 1.5px solid LinkText;
    --hcm-highligh-filter: invert(100%);
  }
  .annotationLayer .textWidgetAnnotation :is(input, textarea):required,
  .annotationLayer .choiceWidgetAnnotation select:required,
  .annotationLayer
    .buttonWidgetAnnotation:is(.checkBox, .radioButton)
    input:required {
    outline: 1.5px solid selectedItem;
  }

  .annotationLayer .linkAnnotation:hover {
    backdrop-filter: var(--hcm-highligh-filter);
  }

  .annotationLayer .linkAnnotation > a:hover {
    opacity: 0 !important;
    background: none !important;
    box-shadow: none;
  }

  .annotationLayer .popupAnnotation .popup {
    outline: calc(1.5px * var(--scale-factor)) solid CanvasText !important;
    background-color: ButtonFace !important;
    color: ButtonText !important;
  }

  .annotationLayer .highlightArea:hover::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: var(--hcm-highligh-filter);
    content: "";
    pointer-events: none;
  }

  .annotationLayer .popupAnnotation.focused .popup {
    outline: calc(3px * var(--scale-factor)) solid Highlight !important;
  }
}

.annotationLayer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  transform-origin: 0 0;
  z-index: 3;
}

.annotationLayer[data-main-rotation="90"] .norotate {
  transform: rotate(270deg) translateX(-100%);
}
.annotationLayer[data-main-rotation="180"] .norotate {
  transform: rotate(180deg) translate(-100%, -100%);
}
.annotationLayer[data-main-rotation="270"] .norotate {
  transform: rotate(90deg) translateY(-100%);
}

.annotationLayer canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.annotationLayer section {
  position: absolute;
  text-align: initial;
  pointer-events: auto;
  box-sizing: border-box;
  transform-origin: 0 0;
}

.annotationLayer .linkAnnotation {
  outline: var(--link-outline);
}

.annotationLayer :is(.linkAnnotation, .buttonWidgetAnnotation.pushButton) > a {
  position: absolute;
  font-size: 1em;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.annotationLayer
  :is(.linkAnnotation, .buttonWidgetAnnotation.pushButton):not(.hasBorder)
  > a:hover {
  opacity: 0.2;
  background-color: rgb(255 255 0);
  box-shadow: 0 2px 10px rgb(255 255 0);
}

.annotationLayer .linkAnnotation.hasBorder:hover {
  background-color: rgb(255 255 0 / 0.2);
}

.annotationLayer .hasBorder {
  background-size: 100% 100%;
}

.annotationLayer .textAnnotation img {
  position: absolute;
  cursor: pointer;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.annotationLayer .textWidgetAnnotation :is(input, textarea),
.annotationLayer .choiceWidgetAnnotation select,
.annotationLayer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input {
  background-image: var(--annotation-unfocused-field-background);
  border: 2px solid var(--input-unfocused-border-color);
  box-sizing: border-box;
  font: calc(9px * var(--scale-factor)) sans-serif;
  height: 100%;
  margin: 0;
  vertical-align: top;
  width: 100%;
}

.annotationLayer .textWidgetAnnotation :is(input, textarea):required,
.annotationLayer .choiceWidgetAnnotation select:required,
.annotationLayer
  .buttonWidgetAnnotation:is(.checkBox, .radioButton)
  input:required {
  outline: 1.5px solid red;
}

.annotationLayer .choiceWidgetAnnotation select option {
  padding: 0;
}

.annotationLayer .buttonWidgetAnnotation.radioButton input {
  border-radius: 50%;
}

.annotationLayer .textWidgetAnnotation textarea {
  resize: none;
}

.annotationLayer .textWidgetAnnotation :is(input, textarea)[disabled],
.annotationLayer .choiceWidgetAnnotation select[disabled],
.annotationLayer
  .buttonWidgetAnnotation:is(.checkBox, .radioButton)
  input[disabled] {
  background: none;
  border: 2px solid var(--input-disabled-border-color);
  cursor: not-allowed;
}

.annotationLayer .textWidgetAnnotation :is(input, textarea):hover,
.annotationLayer .choiceWidgetAnnotation select:hover,
.annotationLayer
  .buttonWidgetAnnotation:is(.checkBox, .radioButton)
  input:hover {
  border: 2px solid var(--input-hover-border-color);
}
.annotationLayer .textWidgetAnnotation :is(input, textarea):hover,
.annotationLayer .choiceWidgetAnnotation select:hover,
.annotationLayer .buttonWidgetAnnotation.checkBox input:hover {
  border-radius: 2px;
}

.annotationLayer .textWidgetAnnotation :is(input, textarea):focus,
.annotationLayer .choiceWidgetAnnotation select:focus {
  background: none;
  border: 2px solid var(--input-focus-border-color);
  border-radius: 2px;
  outline: var(--input-focus-outline);
}

.annotationLayer .buttonWidgetAnnotation:is(.checkBox, .radioButton) :focus {
  background-image: none;
  background-color: transparent;
}

.annotationLayer .buttonWidgetAnnotation.checkBox :focus {
  border: 2px solid var(--input-focus-border-color);
  border-radius: 2px;
  outline: var(--input-focus-outline);
}

.annotationLayer .buttonWidgetAnnotation.radioButton :focus {
  border: 2px solid var(--input-focus-border-color);
  outline: var(--input-focus-outline);
}

.annotationLayer .buttonWidgetAnnotation.checkBox input:checked::before,
.annotationLayer .buttonWidgetAnnotation.checkBox input:checked::after,
.annotationLayer .buttonWidgetAnnotation.radioButton input:checked::before {
  background-color: CanvasText;
  content: "";
  display: block;
  position: absolute;
}

.annotationLayer .buttonWidgetAnnotation.checkBox input:checked::before,
.annotationLayer .buttonWidgetAnnotation.checkBox input:checked::after {
  height: 80%;
  left: 45%;
  width: 1px;
}

.annotationLayer .buttonWidgetAnnotation.checkBox input:checked::before {
  transform: rotate(45deg);
}

.annotationLayer .buttonWidgetAnnotation.checkBox input:checked::after {
  transform: rotate(-45deg);
}

.annotationLayer .buttonWidgetAnnotation.radioButton input:checked::before {
  border-radius: 50%;
  height: 50%;
  left: 30%;
  top: 20%;
  width: 50%;
}

.annotationLayer .textWidgetAnnotation input.comb {
  font-family: monospace;
  padding-left: 2px;
  padding-right: 0;
}

.annotationLayer .textWidgetAnnotation input.comb:focus {
  /*
   * Letter spacing is placed on the right side of each character. Hence, the
   * letter spacing of the last character may be placed outside the visible
   * area, causing horizontal scrolling. We avoid this by extending the width
   * when the element has focus and revert this when it loses focus.
   */
  width: 103%;
}

.annotationLayer .buttonWidgetAnnotation:is(.checkBox, .radioButton) input {
  appearance: none;
}

.annotationLayer .fileAttachmentAnnotation .popupTriggerArea {
  height: 100%;
  width: 100%;
}

.annotationLayer .popupAnnotation {
  position: absolute;
  font-size: calc(9px * var(--scale-factor));
  pointer-events: none;
  width: max-content;
  max-width: 45%;
  height: auto;
}

.annotationLayer .popup {
  background-color: rgb(255 255 153);
  box-shadow: 0 calc(2px * var(--scale-factor)) calc(5px * var(--scale-factor))
    rgb(136 136 136);
  border-radius: calc(2px * var(--scale-factor));
  outline: 1.5px solid rgb(255 255 74);
  padding: calc(6px * var(--scale-factor));
  cursor: pointer;
  font: message-box;
  white-space: normal;
  word-wrap: break-word;
  pointer-events: auto;
}

.annotationLayer .popupAnnotation.focused .popup {
  outline-width: 3px;
}

.annotationLayer .popup * {
  font-size: calc(9px * var(--scale-factor));
}

.annotationLayer .popup > .header {
  display: inline-block;
}

.annotationLayer .popup > .header h1 {
  display: inline;
}

.annotationLayer .popup > .header .popupDate {
  display: inline-block;
  margin-left: calc(5px * var(--scale-factor));
  width: fit-content;
}

.annotationLayer .popupContent {
  border-top: 1px solid rgb(51 51 51);
  margin-top: calc(2px * var(--scale-factor));
  padding-top: calc(2px * var(--scale-factor));
}

.annotationLayer .richText > * {
  white-space: pre-wrap;
  font-size: calc(9px * var(--scale-factor));
}

.annotationLayer .popupTriggerArea {
  cursor: pointer;
}

.annotationLayer section svg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.annotationLayer .annotationTextContent {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  color: transparent;
  user-select: none;
  pointer-events: none;
}

.annotationLayer .annotationTextContent span {
  width: 100%;
  display: inline-block;
}

.annotationLayer svg.quadrilateralsContainer {
  contain: strict;
  width: 0;
  height: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
}
\`;
    const renderPage = async (page, getImageBlob) => {
      // debugMessage('[RENDERPAGE]')
      const scale = devicePixelRatio;
      const viewport = page.getViewport({
        scale,
      });
      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const canvasContext = canvas.getContext("2d");
      await page.render({
        canvasContext,
        viewport,
      }).promise;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      // debugMessage('[RENDERPAGE] GETTING BLOB...')
      if (getImageBlob) return blob;
      // debugMessage('[RENDERPAGE] DONE GETTINGBLOB')

      /*
  // with the SVG backend
  const operatorList = await page.getOperatorList()
  const svgGraphics = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
  const svg = await svgGraphics.getSVG(operatorList, viewport)
  const str = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([str], { type: 'image/svg+xml' })
  */

      const container = document.createElement("div");
      container.classList.add("textLayer");
      await pdfjsLib.renderTextLayer({
        textContentSource: await page.getTextContent(),
        container,
        viewport,
      }).promise;
      const div = document.createElement("div");
      div.classList.add("annotationLayer");
      await new pdfjsLib.AnnotationLayer({
        page,
        viewport,
        div,
      }).render({
        annotations: await page.getAnnotations(),
        linkService: {
          getDestinationHash: (dest) => JSON.stringify(dest),
          addLinkAttributes: (link, url) => (link.href = url),
        },
      });
      const src = URL.createObjectURL(blob);
      const url = URL.createObjectURL(
        new Blob(
          [
            \`
        <!DOCTYPE html>
        <meta charset="utf-8">
        <style>
        :root {
            --scale-factor: \${scale};
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        \${textLayerBuilderCSS}
        \${annotationLayerBuilderCSS}
        </style>
        <img src="\${src}">
        \${container.outerHTML}
        \${div.outerHTML}
    \`,
          ],
          {
            type: "text/html",
          },
        ),
      );
      // debugMessage(\`[RENDERPAGE] done getting url \${url}\`)
      return url;
    };
    const makeTOCItem = (item) => ({
      label: item.title,
      href: JSON.stringify(item.dest),
      subitems: item.items.length ? item.items.map(makeTOCItem) : null,
    });
    const makePDF = async (file) => {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({
        data,
      }).promise;
      const book = {
        rendition: {
          layout: "pre-paginated",
        },
      };
      const info = (await pdf.getMetadata())?.info;
      book.metadata = {
        title: info?.Title,
        author: info?.Author,
      };
      const outline = await pdf.getOutline();
      book.toc = outline?.map(makeTOCItem);
      const cache = new Map();
      book.sections = Array.from({
        length: pdf.numPages,
      }).map((_, i) => ({
        id: i,
        load: async () => {
          const cached = cache.get(i);
          if (cached) return cached;
          const url = await renderPage(await pdf.getPage(i + 1));
          cache.set(i, url);
          return url;
        },
        size: 1000,
      }));
      book.isExternal = (uri) => /^\\w+:/i.test(uri);
      book.resolveHref = async (href) => {
        const parsed = JSON.parse(href);
        const dest =
          typeof parsed === "string"
            ? await pdf.getDestination(parsed)
            : parsed;
        const index = await pdf.getPageIndex(dest[0]);
        return {
          index,
        };
      };
      book.splitTOCHref = async (href) => {
        const parsed = JSON.parse(href);
        const dest =
          typeof parsed === "string"
            ? await pdf.getDestination(parsed)
            : parsed;
        const index = await pdf.getPageIndex(dest[0]);
        return [index, null];
      };
      book.getTOCFragment = (doc) => doc.documentElement;
      book.getCover = async () => renderPage(await pdf.getPage(1), true);
      return book;
    }; // CONCATENATED MODULE: ./my-foliate/vendor/zip.js
    const zip_e = 0,
      zip_t = 1,
      zip_n = 2,
      zip_i = -2,
      zip_r = -3,
      zip_a = -4,
      zip_s = -5,
      zip_o = [
        0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383,
        32767, 65535,
      ],
      zip_l = 1440,
      zip_c = 0,
      zip_u = 4,
      zip_d = [
        96, 7, 256, 0, 8, 80, 0, 8, 16, 84, 8, 115, 82, 7, 31, 0, 8, 112, 0, 8,
        48, 0, 9, 192, 80, 7, 10, 0, 8, 96, 0, 8, 32, 0, 9, 160, 0, 8, 0, 0, 8,
        128, 0, 8, 64, 0, 9, 224, 80, 7, 6, 0, 8, 88, 0, 8, 24, 0, 9, 144, 83,
        7, 59, 0, 8, 120, 0, 8, 56, 0, 9, 208, 81, 7, 17, 0, 8, 104, 0, 8, 40,
        0, 9, 176, 0, 8, 8, 0, 8, 136, 0, 8, 72, 0, 9, 240, 80, 7, 4, 0, 8, 84,
        0, 8, 20, 85, 8, 227, 83, 7, 43, 0, 8, 116, 0, 8, 52, 0, 9, 200, 81, 7,
        13, 0, 8, 100, 0, 8, 36, 0, 9, 168, 0, 8, 4, 0, 8, 132, 0, 8, 68, 0, 9,
        232, 80, 7, 8, 0, 8, 92, 0, 8, 28, 0, 9, 152, 84, 7, 83, 0, 8, 124, 0,
        8, 60, 0, 9, 216, 82, 7, 23, 0, 8, 108, 0, 8, 44, 0, 9, 184, 0, 8, 12,
        0, 8, 140, 0, 8, 76, 0, 9, 248, 80, 7, 3, 0, 8, 82, 0, 8, 18, 85, 8,
        163, 83, 7, 35, 0, 8, 114, 0, 8, 50, 0, 9, 196, 81, 7, 11, 0, 8, 98, 0,
        8, 34, 0, 9, 164, 0, 8, 2, 0, 8, 130, 0, 8, 66, 0, 9, 228, 80, 7, 7, 0,
        8, 90, 0, 8, 26, 0, 9, 148, 84, 7, 67, 0, 8, 122, 0, 8, 58, 0, 9, 212,
        82, 7, 19, 0, 8, 106, 0, 8, 42, 0, 9, 180, 0, 8, 10, 0, 8, 138, 0, 8,
        74, 0, 9, 244, 80, 7, 5, 0, 8, 86, 0, 8, 22, 192, 8, 0, 83, 7, 51, 0, 8,
        118, 0, 8, 54, 0, 9, 204, 81, 7, 15, 0, 8, 102, 0, 8, 38, 0, 9, 172, 0,
        8, 6, 0, 8, 134, 0, 8, 70, 0, 9, 236, 80, 7, 9, 0, 8, 94, 0, 8, 30, 0,
        9, 156, 84, 7, 99, 0, 8, 126, 0, 8, 62, 0, 9, 220, 82, 7, 27, 0, 8, 110,
        0, 8, 46, 0, 9, 188, 0, 8, 14, 0, 8, 142, 0, 8, 78, 0, 9, 252, 96, 7,
        256, 0, 8, 81, 0, 8, 17, 85, 8, 131, 82, 7, 31, 0, 8, 113, 0, 8, 49, 0,
        9, 194, 80, 7, 10, 0, 8, 97, 0, 8, 33, 0, 9, 162, 0, 8, 1, 0, 8, 129, 0,
        8, 65, 0, 9, 226, 80, 7, 6, 0, 8, 89, 0, 8, 25, 0, 9, 146, 83, 7, 59, 0,
        8, 121, 0, 8, 57, 0, 9, 210, 81, 7, 17, 0, 8, 105, 0, 8, 41, 0, 9, 178,
        0, 8, 9, 0, 8, 137, 0, 8, 73, 0, 9, 242, 80, 7, 4, 0, 8, 85, 0, 8, 21,
        80, 8, 258, 83, 7, 43, 0, 8, 117, 0, 8, 53, 0, 9, 202, 81, 7, 13, 0, 8,
        101, 0, 8, 37, 0, 9, 170, 0, 8, 5, 0, 8, 133, 0, 8, 69, 0, 9, 234, 80,
        7, 8, 0, 8, 93, 0, 8, 29, 0, 9, 154, 84, 7, 83, 0, 8, 125, 0, 8, 61, 0,
        9, 218, 82, 7, 23, 0, 8, 109, 0, 8, 45, 0, 9, 186, 0, 8, 13, 0, 8, 141,
        0, 8, 77, 0, 9, 250, 80, 7, 3, 0, 8, 83, 0, 8, 19, 85, 8, 195, 83, 7,
        35, 0, 8, 115, 0, 8, 51, 0, 9, 198, 81, 7, 11, 0, 8, 99, 0, 8, 35, 0, 9,
        166, 0, 8, 3, 0, 8, 131, 0, 8, 67, 0, 9, 230, 80, 7, 7, 0, 8, 91, 0, 8,
        27, 0, 9, 150, 84, 7, 67, 0, 8, 123, 0, 8, 59, 0, 9, 214, 82, 7, 19, 0,
        8, 107, 0, 8, 43, 0, 9, 182, 0, 8, 11, 0, 8, 139, 0, 8, 75, 0, 9, 246,
        80, 7, 5, 0, 8, 87, 0, 8, 23, 192, 8, 0, 83, 7, 51, 0, 8, 119, 0, 8, 55,
        0, 9, 206, 81, 7, 15, 0, 8, 103, 0, 8, 39, 0, 9, 174, 0, 8, 7, 0, 8,
        135, 0, 8, 71, 0, 9, 238, 80, 7, 9, 0, 8, 95, 0, 8, 31, 0, 9, 158, 84,
        7, 99, 0, 8, 127, 0, 8, 63, 0, 9, 222, 82, 7, 27, 0, 8, 111, 0, 8, 47,
        0, 9, 190, 0, 8, 15, 0, 8, 143, 0, 8, 79, 0, 9, 254, 96, 7, 256, 0, 8,
        80, 0, 8, 16, 84, 8, 115, 82, 7, 31, 0, 8, 112, 0, 8, 48, 0, 9, 193, 80,
        7, 10, 0, 8, 96, 0, 8, 32, 0, 9, 161, 0, 8, 0, 0, 8, 128, 0, 8, 64, 0,
        9, 225, 80, 7, 6, 0, 8, 88, 0, 8, 24, 0, 9, 145, 83, 7, 59, 0, 8, 120,
        0, 8, 56, 0, 9, 209, 81, 7, 17, 0, 8, 104, 0, 8, 40, 0, 9, 177, 0, 8, 8,
        0, 8, 136, 0, 8, 72, 0, 9, 241, 80, 7, 4, 0, 8, 84, 0, 8, 20, 85, 8,
        227, 83, 7, 43, 0, 8, 116, 0, 8, 52, 0, 9, 201, 81, 7, 13, 0, 8, 100, 0,
        8, 36, 0, 9, 169, 0, 8, 4, 0, 8, 132, 0, 8, 68, 0, 9, 233, 80, 7, 8, 0,
        8, 92, 0, 8, 28, 0, 9, 153, 84, 7, 83, 0, 8, 124, 0, 8, 60, 0, 9, 217,
        82, 7, 23, 0, 8, 108, 0, 8, 44, 0, 9, 185, 0, 8, 12, 0, 8, 140, 0, 8,
        76, 0, 9, 249, 80, 7, 3, 0, 8, 82, 0, 8, 18, 85, 8, 163, 83, 7, 35, 0,
        8, 114, 0, 8, 50, 0, 9, 197, 81, 7, 11, 0, 8, 98, 0, 8, 34, 0, 9, 165,
        0, 8, 2, 0, 8, 130, 0, 8, 66, 0, 9, 229, 80, 7, 7, 0, 8, 90, 0, 8, 26,
        0, 9, 149, 84, 7, 67, 0, 8, 122, 0, 8, 58, 0, 9, 213, 82, 7, 19, 0, 8,
        106, 0, 8, 42, 0, 9, 181, 0, 8, 10, 0, 8, 138, 0, 8, 74, 0, 9, 245, 80,
        7, 5, 0, 8, 86, 0, 8, 22, 192, 8, 0, 83, 7, 51, 0, 8, 118, 0, 8, 54, 0,
        9, 205, 81, 7, 15, 0, 8, 102, 0, 8, 38, 0, 9, 173, 0, 8, 6, 0, 8, 134,
        0, 8, 70, 0, 9, 237, 80, 7, 9, 0, 8, 94, 0, 8, 30, 0, 9, 157, 84, 7, 99,
        0, 8, 126, 0, 8, 62, 0, 9, 221, 82, 7, 27, 0, 8, 110, 0, 8, 46, 0, 9,
        189, 0, 8, 14, 0, 8, 142, 0, 8, 78, 0, 9, 253, 96, 7, 256, 0, 8, 81, 0,
        8, 17, 85, 8, 131, 82, 7, 31, 0, 8, 113, 0, 8, 49, 0, 9, 195, 80, 7, 10,
        0, 8, 97, 0, 8, 33, 0, 9, 163, 0, 8, 1, 0, 8, 129, 0, 8, 65, 0, 9, 227,
        80, 7, 6, 0, 8, 89, 0, 8, 25, 0, 9, 147, 83, 7, 59, 0, 8, 121, 0, 8, 57,
        0, 9, 211, 81, 7, 17, 0, 8, 105, 0, 8, 41, 0, 9, 179, 0, 8, 9, 0, 8,
        137, 0, 8, 73, 0, 9, 243, 80, 7, 4, 0, 8, 85, 0, 8, 21, 80, 8, 258, 83,
        7, 43, 0, 8, 117, 0, 8, 53, 0, 9, 203, 81, 7, 13, 0, 8, 101, 0, 8, 37,
        0, 9, 171, 0, 8, 5, 0, 8, 133, 0, 8, 69, 0, 9, 235, 80, 7, 8, 0, 8, 93,
        0, 8, 29, 0, 9, 155, 84, 7, 83, 0, 8, 125, 0, 8, 61, 0, 9, 219, 82, 7,
        23, 0, 8, 109, 0, 8, 45, 0, 9, 187, 0, 8, 13, 0, 8, 141, 0, 8, 77, 0, 9,
        251, 80, 7, 3, 0, 8, 83, 0, 8, 19, 85, 8, 195, 83, 7, 35, 0, 8, 115, 0,
        8, 51, 0, 9, 199, 81, 7, 11, 0, 8, 99, 0, 8, 35, 0, 9, 167, 0, 8, 3, 0,
        8, 131, 0, 8, 67, 0, 9, 231, 80, 7, 7, 0, 8, 91, 0, 8, 27, 0, 9, 151,
        84, 7, 67, 0, 8, 123, 0, 8, 59, 0, 9, 215, 82, 7, 19, 0, 8, 107, 0, 8,
        43, 0, 9, 183, 0, 8, 11, 0, 8, 139, 0, 8, 75, 0, 9, 247, 80, 7, 5, 0, 8,
        87, 0, 8, 23, 192, 8, 0, 83, 7, 51, 0, 8, 119, 0, 8, 55, 0, 9, 207, 81,
        7, 15, 0, 8, 103, 0, 8, 39, 0, 9, 175, 0, 8, 7, 0, 8, 135, 0, 8, 71, 0,
        9, 239, 80, 7, 9, 0, 8, 95, 0, 8, 31, 0, 9, 159, 84, 7, 99, 0, 8, 127,
        0, 8, 63, 0, 9, 223, 82, 7, 27, 0, 8, 111, 0, 8, 47, 0, 9, 191, 0, 8,
        15, 0, 8, 143, 0, 8, 79, 0, 9, 255,
      ],
      zip_f = [
        80, 5, 1, 87, 5, 257, 83, 5, 17, 91, 5, 4097, 81, 5, 5, 89, 5, 1025, 85,
        5, 65, 93, 5, 16385, 80, 5, 3, 88, 5, 513, 84, 5, 33, 92, 5, 8193, 82,
        5, 9, 90, 5, 2049, 86, 5, 129, 192, 5, 24577, 80, 5, 2, 87, 5, 385, 83,
        5, 25, 91, 5, 6145, 81, 5, 7, 89, 5, 1537, 85, 5, 97, 93, 5, 24577, 80,
        5, 4, 88, 5, 769, 84, 5, 49, 92, 5, 12289, 82, 5, 13, 90, 5, 3073, 86,
        5, 193, 192, 5, 24577,
      ],
      zip_ = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
        67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
      ],
      zip_h = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
        5, 5, 5, 5, 0, 112, 112,
      ],
      zip_w = [
        1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
        513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
      ],
      zip_b = [
        0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10,
        10, 11, 11, 12, 12, 13, 13,
      ],
      zip_p = 15;
    function zip_m() {
      let t, n, i, o, c, u;
      function d(t, n, a, d, f, _, h, w, b, m, g) {
        let y, x, k, v, S, z, A, U, D, E, F, T, O, C, W;
        (E = 0), (S = a);
        do {
          i[t[n + E]]++, E++, S--;
        } while (0 !== S);
        if (i[0] == a) return (h[0] = -1), (w[0] = 0), zip_e;
        for (U = w[0], z = 1; z <= zip_p && 0 === i[z]; z++);
        for (A = z, U < z && (U = z), S = zip_p; 0 !== S && 0 === i[S]; S--);
        for (k = S, U > S && (U = S), w[0] = U, C = 1 << z; z < S; z++, C <<= 1)
          if ((C -= i[z]) < 0) return zip_r;
        if ((C -= i[S]) < 0) return zip_r;
        for (i[S] += C, u[1] = z = 0, E = 1, O = 2; 0 != --S; )
          (u[O] = z += i[E]), O++, E++;
        (S = 0), (E = 0);
        do {
          0 !== (z = t[n + E]) && (g[u[z]++] = S), E++;
        } while (++S < a);
        for (
          a = u[k], u[0] = S = 0, E = 0, v = -1, T = -U, c[0] = 0, F = 0, W = 0;
          A <= k;
          A++
        )
          for (y = i[A]; 0 != y--; ) {
            for (; A > T + U; ) {
              if (
                (v++,
                (T += U),
                (W = k - T),
                (W = W > U ? U : W),
                (x = 1 << (z = A - T)) > y + 1 &&
                  ((x -= y + 1), (O = A), z < W))
              )
                for (; ++z < W && !((x <<= 1) <= i[++O]); ) x -= i[O];
              if (((W = 1 << z), m[0] + W > zip_l)) return zip_r;
              (c[v] = F = m[0]),
                (m[0] += W),
                0 !== v
                  ? ((u[v] = S),
                    (o[0] = z),
                    (o[1] = U),
                    (z = S >>> (T - U)),
                    (o[2] = F - c[v - 1] - z),
                    b.set(o, 3 * (c[v - 1] + z)))
                  : (h[0] = F);
            }
            for (
              o[1] = A - T,
                E >= a
                  ? (o[0] = 192)
                  : g[E] < d
                  ? ((o[0] = g[E] < 256 ? 0 : 96), (o[2] = g[E++]))
                  : ((o[0] = _[g[E] - d] + 16 + 64), (o[2] = f[g[E++] - d])),
                x = 1 << (A - T),
                z = S >>> T;
              z < W;
              z += x
            )
              b.set(o, 3 * (F + z));
            for (z = 1 << (A - 1); 0 != (S & z); z >>>= 1) S ^= z;
            for (S ^= z, D = (1 << T) - 1; (S & D) != u[v]; )
              v--, (T -= U), (D = (1 << T) - 1);
          }
        return 0 !== C && 1 != k ? zip_s : zip_e;
      }
      function f(e) {
        let r;
        for (
          t ||
            ((t = []),
            (n = []),
            (i = new Int32Array(zip_p + 1)),
            (o = []),
            (c = new Int32Array(zip_p)),
            (u = new Int32Array(zip_p + 1))),
            n.length < e && (n = []),
            r = 0;
          r < e;
          r++
        )
          n[r] = 0;
        for (r = 0; r < zip_p + 1; r++) i[r] = 0;
        for (r = 0; r < 3; r++) o[r] = 0;
        c.set(i.subarray(0, zip_p), 0), u.set(i.subarray(0, zip_p + 1), 0);
      }
      (this.inflate_trees_bits = function (e, i, a, o, l) {
        let c;
        return (
          f(19),
          (t[0] = 0),
          (c = d(e, 0, 19, 19, null, null, a, i, o, t, n)),
          c == zip_r
            ? (l.msg = "oversubscribed dynamic bit lengths tree")
            : (c != zip_s && 0 !== i[0]) ||
              ((l.msg = "incomplete dynamic bit lengths tree"), (c = zip_r)),
          c
        );
      }),
        (this.inflate_trees_dynamic = function (i, o, l, c, u, p, m, g, y) {
          let x;
          return (
            f(288),
            (t[0] = 0),
            (x = d(l, 0, i, 257, zip_, zip_h, p, c, g, t, n)),
            x != zip_e || 0 === c[0]
              ? (x == zip_r
                  ? (y.msg = "oversubscribed literal/length tree")
                  : x != zip_a &&
                    ((y.msg = "incomplete literal/length tree"), (x = zip_r)),
                x)
              : (f(288),
                (x = d(l, i, o, 0, zip_w, zip_b, m, u, g, t, n)),
                x != zip_e || (0 === u[0] && i > 257)
                  ? (x == zip_r
                      ? (y.msg = "oversubscribed distance tree")
                      : x == zip_s
                      ? ((y.msg = "incomplete distance tree"), (x = zip_r))
                      : x != zip_a &&
                        ((y.msg = "empty distance tree with lengths"),
                        (x = zip_r)),
                    x)
                  : zip_e)
          );
        });
    }
    zip_m.inflate_trees_fixed = function (t, n, i, r) {
      return (t[0] = 9), (n[0] = 5), (i[0] = zip_d), (r[0] = zip_f), zip_e;
    };
    const zip_g = 0,
      zip_y = 1,
      zip_x = 2,
      zip_k = 3,
      zip_v = 4,
      zip_S = 5,
      zip_z = 6,
      A = 7,
      zip_U = 8,
      D = 9;
    function zip_E() {
      const n = this;
      let a,
        s,
        l,
        c,
        u = 0,
        d = 0,
        f = 0,
        _ = 0,
        h = 0,
        w = 0,
        b = 0,
        p = 0,
        m = 0,
        E = 0;
      function F(n, i, a, s, l, c, u, d) {
        let f, _, h, w, b, p, m, g, y, x, k, v, S, z, A, U;
        (m = d.next_in_index),
          (g = d.avail_in),
          (b = u.bitb),
          (p = u.bitk),
          (y = u.write),
          (x = y < u.read ? u.read - y - 1 : u.end - y),
          (k = zip_o[n]),
          (v = zip_o[i]);
        do {
          for (; p < 20; ) g--, (b |= (255 & d.read_byte(m++)) << p), (p += 8);
          if (
            ((f = b & k), (_ = a), (h = s), (U = 3 * (h + f)), 0 !== (w = _[U]))
          )
            for (;;) {
              if (((b >>= _[U + 1]), (p -= _[U + 1]), 0 != (16 & w))) {
                for (
                  w &= 15, S = _[U + 2] + (b & zip_o[w]), b >>= w, p -= w;
                  p < 15;

                )
                  g--, (b |= (255 & d.read_byte(m++)) << p), (p += 8);
                for (f = b & v, _ = l, h = c, U = 3 * (h + f), w = _[U]; ; ) {
                  if (((b >>= _[U + 1]), (p -= _[U + 1]), 0 != (16 & w))) {
                    for (w &= 15; p < w; )
                      g--, (b |= (255 & d.read_byte(m++)) << p), (p += 8);
                    if (
                      ((z = _[U + 2] + (b & zip_o[w])),
                      (b >>= w),
                      (p -= w),
                      (x -= S),
                      y >= z)
                    )
                      (A = y - z),
                        y - A > 0 && 2 > y - A
                          ? ((u.win[y++] = u.win[A++]),
                            (u.win[y++] = u.win[A++]),
                            (S -= 2))
                          : (u.win.set(u.win.subarray(A, A + 2), y),
                            (y += 2),
                            (A += 2),
                            (S -= 2));
                    else {
                      A = y - z;
                      do {
                        A += u.end;
                      } while (A < 0);
                      if (((w = u.end - A), S > w)) {
                        if (((S -= w), y - A > 0 && w > y - A))
                          do {
                            u.win[y++] = u.win[A++];
                          } while (0 != --w);
                        else
                          u.win.set(u.win.subarray(A, A + w), y),
                            (y += w),
                            (A += w),
                            (w = 0);
                        A = 0;
                      }
                    }
                    if (y - A > 0 && S > y - A)
                      do {
                        u.win[y++] = u.win[A++];
                      } while (0 != --S);
                    else
                      u.win.set(u.win.subarray(A, A + S), y),
                        (y += S),
                        (A += S),
                        (S = 0);
                    break;
                  }
                  if (0 != (64 & w))
                    return (
                      (d.msg = "invalid distance code"),
                      (S = d.avail_in - g),
                      (S = p >> 3 < S ? p >> 3 : S),
                      (g += S),
                      (m -= S),
                      (p -= S << 3),
                      (u.bitb = b),
                      (u.bitk = p),
                      (d.avail_in = g),
                      (d.total_in += m - d.next_in_index),
                      (d.next_in_index = m),
                      (u.write = y),
                      zip_r
                    );
                  (f += _[U + 2]),
                    (f += b & zip_o[w]),
                    (U = 3 * (h + f)),
                    (w = _[U]);
                }
                break;
              }
              if (0 != (64 & w))
                return 0 != (32 & w)
                  ? ((S = d.avail_in - g),
                    (S = p >> 3 < S ? p >> 3 : S),
                    (g += S),
                    (m -= S),
                    (p -= S << 3),
                    (u.bitb = b),
                    (u.bitk = p),
                    (d.avail_in = g),
                    (d.total_in += m - d.next_in_index),
                    (d.next_in_index = m),
                    (u.write = y),
                    zip_t)
                  : ((d.msg = "invalid literal/length code"),
                    (S = d.avail_in - g),
                    (S = p >> 3 < S ? p >> 3 : S),
                    (g += S),
                    (m -= S),
                    (p -= S << 3),
                    (u.bitb = b),
                    (u.bitk = p),
                    (d.avail_in = g),
                    (d.total_in += m - d.next_in_index),
                    (d.next_in_index = m),
                    (u.write = y),
                    zip_r);
              if (
                ((f += _[U + 2]),
                (f += b & zip_o[w]),
                (U = 3 * (h + f)),
                0 === (w = _[U]))
              ) {
                (b >>= _[U + 1]), (p -= _[U + 1]), (u.win[y++] = _[U + 2]), x--;
                break;
              }
            }
          else (b >>= _[U + 1]), (p -= _[U + 1]), (u.win[y++] = _[U + 2]), x--;
        } while (x >= 258 && g >= 10);
        return (
          (S = d.avail_in - g),
          (S = p >> 3 < S ? p >> 3 : S),
          (g += S),
          (m -= S),
          (p -= S << 3),
          (u.bitb = b),
          (u.bitk = p),
          (d.avail_in = g),
          (d.total_in += m - d.next_in_index),
          (d.next_in_index = m),
          (u.write = y),
          zip_e
        );
      }
      (n.init = function (e, t, n, i, r, o) {
        (a = zip_g),
          (b = e),
          (p = t),
          (l = n),
          (m = i),
          (c = r),
          (E = o),
          (s = null);
      }),
        (n.proc = function (n, T, O) {
          let C,
            W,
            j,
            M,
            L,
            R,
            B,
            I = 0,
            N = 0,
            P = 0;
          for (
            P = T.next_in_index,
              M = T.avail_in,
              I = n.bitb,
              N = n.bitk,
              L = n.write,
              R = L < n.read ? n.read - L - 1 : n.end - L;
            ;

          )
            switch (a) {
              case zip_g:
                if (
                  R >= 258 &&
                  M >= 10 &&
                  ((n.bitb = I),
                  (n.bitk = N),
                  (T.avail_in = M),
                  (T.total_in += P - T.next_in_index),
                  (T.next_in_index = P),
                  (n.write = L),
                  (O = F(b, p, l, m, c, E, n, T)),
                  (P = T.next_in_index),
                  (M = T.avail_in),
                  (I = n.bitb),
                  (N = n.bitk),
                  (L = n.write),
                  (R = L < n.read ? n.read - L - 1 : n.end - L),
                  O != zip_e)
                ) {
                  a = O == zip_t ? A : D;
                  break;
                }
                (f = b), (s = l), (d = m), (a = zip_y);
              case zip_y:
                for (C = f; N < C; ) {
                  if (0 === M)
                    return (
                      (n.bitb = I),
                      (n.bitk = N),
                      (T.avail_in = M),
                      (T.total_in += P - T.next_in_index),
                      (T.next_in_index = P),
                      (n.write = L),
                      n.inflate_flush(T, O)
                    );
                  (O = zip_e),
                    M--,
                    (I |= (255 & T.read_byte(P++)) << N),
                    (N += 8);
                }
                if (
                  ((W = 3 * (d + (I & zip_o[C]))),
                  (I >>>= s[W + 1]),
                  (N -= s[W + 1]),
                  (j = s[W]),
                  0 === j)
                ) {
                  (_ = s[W + 2]), (a = zip_z);
                  break;
                }
                if (0 != (16 & j)) {
                  (h = 15 & j), (u = s[W + 2]), (a = zip_x);
                  break;
                }
                if (0 == (64 & j)) {
                  (f = j), (d = W / 3 + s[W + 2]);
                  break;
                }
                if (0 != (32 & j)) {
                  a = A;
                  break;
                }
                return (
                  (a = D),
                  (T.msg = "invalid literal/length code"),
                  (O = zip_r),
                  (n.bitb = I),
                  (n.bitk = N),
                  (T.avail_in = M),
                  (T.total_in += P - T.next_in_index),
                  (T.next_in_index = P),
                  (n.write = L),
                  n.inflate_flush(T, O)
                );
              case zip_x:
                for (C = h; N < C; ) {
                  if (0 === M)
                    return (
                      (n.bitb = I),
                      (n.bitk = N),
                      (T.avail_in = M),
                      (T.total_in += P - T.next_in_index),
                      (T.next_in_index = P),
                      (n.write = L),
                      n.inflate_flush(T, O)
                    );
                  (O = zip_e),
                    M--,
                    (I |= (255 & T.read_byte(P++)) << N),
                    (N += 8);
                }
                (u += I & zip_o[C]),
                  (I >>= C),
                  (N -= C),
                  (f = p),
                  (s = c),
                  (d = E),
                  (a = zip_k);
              case zip_k:
                for (C = f; N < C; ) {
                  if (0 === M)
                    return (
                      (n.bitb = I),
                      (n.bitk = N),
                      (T.avail_in = M),
                      (T.total_in += P - T.next_in_index),
                      (T.next_in_index = P),
                      (n.write = L),
                      n.inflate_flush(T, O)
                    );
                  (O = zip_e),
                    M--,
                    (I |= (255 & T.read_byte(P++)) << N),
                    (N += 8);
                }
                if (
                  ((W = 3 * (d + (I & zip_o[C]))),
                  (I >>= s[W + 1]),
                  (N -= s[W + 1]),
                  (j = s[W]),
                  0 != (16 & j))
                ) {
                  (h = 15 & j), (w = s[W + 2]), (a = zip_v);
                  break;
                }
                if (0 == (64 & j)) {
                  (f = j), (d = W / 3 + s[W + 2]);
                  break;
                }
                return (
                  (a = D),
                  (T.msg = "invalid distance code"),
                  (O = zip_r),
                  (n.bitb = I),
                  (n.bitk = N),
                  (T.avail_in = M),
                  (T.total_in += P - T.next_in_index),
                  (T.next_in_index = P),
                  (n.write = L),
                  n.inflate_flush(T, O)
                );
              case zip_v:
                for (C = h; N < C; ) {
                  if (0 === M)
                    return (
                      (n.bitb = I),
                      (n.bitk = N),
                      (T.avail_in = M),
                      (T.total_in += P - T.next_in_index),
                      (T.next_in_index = P),
                      (n.write = L),
                      n.inflate_flush(T, O)
                    );
                  (O = zip_e),
                    M--,
                    (I |= (255 & T.read_byte(P++)) << N),
                    (N += 8);
                }
                (w += I & zip_o[C]), (I >>= C), (N -= C), (a = zip_S);
              case zip_S:
                for (B = L - w; B < 0; ) B += n.end;
                for (; 0 !== u; ) {
                  if (
                    0 === R &&
                    (L == n.end &&
                      0 !== n.read &&
                      ((L = 0), (R = L < n.read ? n.read - L - 1 : n.end - L)),
                    0 === R &&
                      ((n.write = L),
                      (O = n.inflate_flush(T, O)),
                      (L = n.write),
                      (R = L < n.read ? n.read - L - 1 : n.end - L),
                      L == n.end &&
                        0 !== n.read &&
                        ((L = 0),
                        (R = L < n.read ? n.read - L - 1 : n.end - L)),
                      0 === R))
                  )
                    return (
                      (n.bitb = I),
                      (n.bitk = N),
                      (T.avail_in = M),
                      (T.total_in += P - T.next_in_index),
                      (T.next_in_index = P),
                      (n.write = L),
                      n.inflate_flush(T, O)
                    );
                  (n.win[L++] = n.win[B++]), R--, B == n.end && (B = 0), u--;
                }
                a = zip_g;
                break;
              case zip_z:
                if (
                  0 === R &&
                  (L == n.end &&
                    0 !== n.read &&
                    ((L = 0), (R = L < n.read ? n.read - L - 1 : n.end - L)),
                  0 === R &&
                    ((n.write = L),
                    (O = n.inflate_flush(T, O)),
                    (L = n.write),
                    (R = L < n.read ? n.read - L - 1 : n.end - L),
                    L == n.end &&
                      0 !== n.read &&
                      ((L = 0), (R = L < n.read ? n.read - L - 1 : n.end - L)),
                    0 === R))
                )
                  return (
                    (n.bitb = I),
                    (n.bitk = N),
                    (T.avail_in = M),
                    (T.total_in += P - T.next_in_index),
                    (T.next_in_index = P),
                    (n.write = L),
                    n.inflate_flush(T, O)
                  );
                (O = zip_e), (n.win[L++] = _), R--, (a = zip_g);
                break;
              case A:
                if (
                  (N > 7 && ((N -= 8), M++, P--),
                  (n.write = L),
                  (O = n.inflate_flush(T, O)),
                  (L = n.write),
                  (R = L < n.read ? n.read - L - 1 : n.end - L),
                  n.read != n.write)
                )
                  return (
                    (n.bitb = I),
                    (n.bitk = N),
                    (T.avail_in = M),
                    (T.total_in += P - T.next_in_index),
                    (T.next_in_index = P),
                    (n.write = L),
                    n.inflate_flush(T, O)
                  );
                a = zip_U;
              case zip_U:
                return (
                  (O = zip_t),
                  (n.bitb = I),
                  (n.bitk = N),
                  (T.avail_in = M),
                  (T.total_in += P - T.next_in_index),
                  (T.next_in_index = P),
                  (n.write = L),
                  n.inflate_flush(T, O)
                );
              case D:
                return (
                  (O = zip_r),
                  (n.bitb = I),
                  (n.bitk = N),
                  (T.avail_in = M),
                  (T.total_in += P - T.next_in_index),
                  (T.next_in_index = P),
                  (n.write = L),
                  n.inflate_flush(T, O)
                );
              default:
                return (
                  (O = zip_i),
                  (n.bitb = I),
                  (n.bitk = N),
                  (T.avail_in = M),
                  (T.total_in += P - T.next_in_index),
                  (T.next_in_index = P),
                  (n.write = L),
                  n.inflate_flush(T, O)
                );
            }
        }),
        (n.free = function () {});
    }
    const F = [
        16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
      ],
      zip_T = 0,
      O = 1,
      C = 2,
      W = 3,
      j = 4,
      M = 5,
      L = 6,
      R = 7,
      B = 8,
      I = 9;
    function N(n, a) {
      const c = this;
      let u,
        d = zip_T,
        f = 0,
        _ = 0,
        h = 0;
      const w = [0],
        b = [0],
        p = new zip_E();
      let g = 0,
        y = new Int32Array(3 * zip_l);
      const x = new zip_m();
      (c.bitk = 0),
        (c.bitb = 0),
        (c.win = new Uint8Array(a)),
        (c.end = a),
        (c.read = 0),
        (c.write = 0),
        (c.reset = function (e, t) {
          t && (t[0] = 0),
            d == L && p.free(e),
            (d = zip_T),
            (c.bitk = 0),
            (c.bitb = 0),
            (c.read = c.write = 0);
        }),
        c.reset(n, null),
        (c.inflate_flush = function (t, n) {
          let i, r, a;
          return (
            (r = t.next_out_index),
            (a = c.read),
            (i = (a <= c.write ? c.write : c.end) - a),
            i > t.avail_out && (i = t.avail_out),
            0 !== i && n == zip_s && (n = zip_e),
            (t.avail_out -= i),
            (t.total_out += i),
            t.next_out.set(c.win.subarray(a, a + i), r),
            (r += i),
            (a += i),
            a == c.end &&
              ((a = 0),
              c.write == c.end && (c.write = 0),
              (i = c.write - a),
              i > t.avail_out && (i = t.avail_out),
              0 !== i && n == zip_s && (n = zip_e),
              (t.avail_out -= i),
              (t.total_out += i),
              t.next_out.set(c.win.subarray(a, a + i), r),
              (r += i),
              (a += i)),
            (t.next_out_index = r),
            (c.read = a),
            n
          );
        }),
        (c.proc = function (n, a) {
          let s, l, k, v, S, z, A, U;
          for (
            v = n.next_in_index,
              S = n.avail_in,
              l = c.bitb,
              k = c.bitk,
              z = c.write,
              A = z < c.read ? c.read - z - 1 : c.end - z;
            ;

          ) {
            let D, E, N, P, V, q, H, K;
            switch (d) {
              case zip_T:
                for (; k < 3; ) {
                  if (0 === S)
                    return (
                      (c.bitb = l),
                      (c.bitk = k),
                      (n.avail_in = S),
                      (n.total_in += v - n.next_in_index),
                      (n.next_in_index = v),
                      (c.write = z),
                      c.inflate_flush(n, a)
                    );
                  (a = zip_e),
                    S--,
                    (l |= (255 & n.read_byte(v++)) << k),
                    (k += 8);
                }
                switch (((s = 7 & l), (g = 1 & s), s >>> 1)) {
                  case 0:
                    (l >>>= 3),
                      (k -= 3),
                      (s = 7 & k),
                      (l >>>= s),
                      (k -= s),
                      (d = O);
                    break;
                  case 1:
                    (D = []),
                      (E = []),
                      (N = [[]]),
                      (P = [[]]),
                      zip_m.inflate_trees_fixed(D, E, N, P),
                      p.init(D[0], E[0], N[0], 0, P[0], 0),
                      (l >>>= 3),
                      (k -= 3),
                      (d = L);
                    break;
                  case 2:
                    (l >>>= 3), (k -= 3), (d = W);
                    break;
                  case 3:
                    return (
                      (l >>>= 3),
                      (k -= 3),
                      (d = I),
                      (n.msg = "invalid block type"),
                      (a = zip_r),
                      (c.bitb = l),
                      (c.bitk = k),
                      (n.avail_in = S),
                      (n.total_in += v - n.next_in_index),
                      (n.next_in_index = v),
                      (c.write = z),
                      c.inflate_flush(n, a)
                    );
                }
                break;
              case O:
                for (; k < 32; ) {
                  if (0 === S)
                    return (
                      (c.bitb = l),
                      (c.bitk = k),
                      (n.avail_in = S),
                      (n.total_in += v - n.next_in_index),
                      (n.next_in_index = v),
                      (c.write = z),
                      c.inflate_flush(n, a)
                    );
                  (a = zip_e),
                    S--,
                    (l |= (255 & n.read_byte(v++)) << k),
                    (k += 8);
                }
                if (((~l >>> 16) & 65535) != (65535 & l))
                  return (
                    (d = I),
                    (n.msg = "invalid stored block lengths"),
                    (a = zip_r),
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                (f = 65535 & l),
                  (l = k = 0),
                  (d = 0 !== f ? C : 0 !== g ? R : zip_T);
                break;
              case C:
                if (0 === S)
                  return (
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                if (
                  0 === A &&
                  (z == c.end &&
                    0 !== c.read &&
                    ((z = 0), (A = z < c.read ? c.read - z - 1 : c.end - z)),
                  0 === A &&
                    ((c.write = z),
                    (a = c.inflate_flush(n, a)),
                    (z = c.write),
                    (A = z < c.read ? c.read - z - 1 : c.end - z),
                    z == c.end &&
                      0 !== c.read &&
                      ((z = 0), (A = z < c.read ? c.read - z - 1 : c.end - z)),
                    0 === A))
                )
                  return (
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                if (
                  ((a = zip_e),
                  (s = f),
                  s > S && (s = S),
                  s > A && (s = A),
                  c.win.set(n.read_buf(v, s), z),
                  (v += s),
                  (S -= s),
                  (z += s),
                  (A -= s),
                  0 != (f -= s))
                )
                  break;
                d = 0 !== g ? R : zip_T;
                break;
              case W:
                for (; k < 14; ) {
                  if (0 === S)
                    return (
                      (c.bitb = l),
                      (c.bitk = k),
                      (n.avail_in = S),
                      (n.total_in += v - n.next_in_index),
                      (n.next_in_index = v),
                      (c.write = z),
                      c.inflate_flush(n, a)
                    );
                  (a = zip_e),
                    S--,
                    (l |= (255 & n.read_byte(v++)) << k),
                    (k += 8);
                }
                if (
                  ((_ = s = 16383 & l), (31 & s) > 29 || ((s >> 5) & 31) > 29)
                )
                  return (
                    (d = I),
                    (n.msg = "too many length or distance symbols"),
                    (a = zip_r),
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                if (
                  ((s = 258 + (31 & s) + ((s >> 5) & 31)), !u || u.length < s)
                )
                  u = [];
                else for (U = 0; U < s; U++) u[U] = 0;
                (l >>>= 14), (k -= 14), (h = 0), (d = j);
              case j:
                for (; h < 4 + (_ >>> 10); ) {
                  for (; k < 3; ) {
                    if (0 === S)
                      return (
                        (c.bitb = l),
                        (c.bitk = k),
                        (n.avail_in = S),
                        (n.total_in += v - n.next_in_index),
                        (n.next_in_index = v),
                        (c.write = z),
                        c.inflate_flush(n, a)
                      );
                    (a = zip_e),
                      S--,
                      (l |= (255 & n.read_byte(v++)) << k),
                      (k += 8);
                  }
                  (u[F[h++]] = 7 & l), (l >>>= 3), (k -= 3);
                }
                for (; h < 19; ) u[F[h++]] = 0;
                if (
                  ((w[0] = 7),
                  (s = x.inflate_trees_bits(u, w, b, y, n)),
                  s != zip_e)
                )
                  return (
                    (a = s) == zip_r && ((u = null), (d = I)),
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                (h = 0), (d = M);
              case M:
                for (; (s = _), !(h >= 258 + (31 & s) + ((s >> 5) & 31)); ) {
                  let t, i;
                  for (s = w[0]; k < s; ) {
                    if (0 === S)
                      return (
                        (c.bitb = l),
                        (c.bitk = k),
                        (n.avail_in = S),
                        (n.total_in += v - n.next_in_index),
                        (n.next_in_index = v),
                        (c.write = z),
                        c.inflate_flush(n, a)
                      );
                    (a = zip_e),
                      S--,
                      (l |= (255 & n.read_byte(v++)) << k),
                      (k += 8);
                  }
                  if (
                    ((s = y[3 * (b[0] + (l & zip_o[s])) + 1]),
                    (i = y[3 * (b[0] + (l & zip_o[s])) + 2]),
                    i < 16)
                  )
                    (l >>>= s), (k -= s), (u[h++] = i);
                  else {
                    for (
                      U = 18 == i ? 7 : i - 14, t = 18 == i ? 11 : 3;
                      k < s + U;

                    ) {
                      if (0 === S)
                        return (
                          (c.bitb = l),
                          (c.bitk = k),
                          (n.avail_in = S),
                          (n.total_in += v - n.next_in_index),
                          (n.next_in_index = v),
                          (c.write = z),
                          c.inflate_flush(n, a)
                        );
                      (a = zip_e),
                        S--,
                        (l |= (255 & n.read_byte(v++)) << k),
                        (k += 8);
                    }
                    if (
                      ((l >>>= s),
                      (k -= s),
                      (t += l & zip_o[U]),
                      (l >>>= U),
                      (k -= U),
                      (U = h),
                      (s = _),
                      U + t > 258 + (31 & s) + ((s >> 5) & 31) ||
                        (16 == i && U < 1))
                    )
                      return (
                        (u = null),
                        (d = I),
                        (n.msg = "invalid bit length repeat"),
                        (a = zip_r),
                        (c.bitb = l),
                        (c.bitk = k),
                        (n.avail_in = S),
                        (n.total_in += v - n.next_in_index),
                        (n.next_in_index = v),
                        (c.write = z),
                        c.inflate_flush(n, a)
                      );
                    i = 16 == i ? u[U - 1] : 0;
                    do {
                      u[U++] = i;
                    } while (0 != --t);
                    h = U;
                  }
                }
                if (
                  ((b[0] = -1),
                  (V = []),
                  (q = []),
                  (H = []),
                  (K = []),
                  (V[0] = 9),
                  (q[0] = 6),
                  (s = _),
                  (s = x.inflate_trees_dynamic(
                    257 + (31 & s),
                    1 + ((s >> 5) & 31),
                    u,
                    V,
                    q,
                    H,
                    K,
                    y,
                    n,
                  )),
                  s != zip_e)
                )
                  return (
                    s == zip_r && ((u = null), (d = I)),
                    (a = s),
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                p.init(V[0], q[0], y, H[0], y, K[0]), (d = L);
              case L:
                if (
                  ((c.bitb = l),
                  (c.bitk = k),
                  (n.avail_in = S),
                  (n.total_in += v - n.next_in_index),
                  (n.next_in_index = v),
                  (c.write = z),
                  (a = p.proc(c, n, a)) != zip_t)
                )
                  return c.inflate_flush(n, a);
                if (
                  ((a = zip_e),
                  p.free(n),
                  (v = n.next_in_index),
                  (S = n.avail_in),
                  (l = c.bitb),
                  (k = c.bitk),
                  (z = c.write),
                  (A = z < c.read ? c.read - z - 1 : c.end - z),
                  0 === g)
                ) {
                  d = zip_T;
                  break;
                }
                d = R;
              case R:
                if (
                  ((c.write = z),
                  (a = c.inflate_flush(n, a)),
                  (z = c.write),
                  (A = z < c.read ? c.read - z - 1 : c.end - z),
                  c.read != c.write)
                )
                  return (
                    (c.bitb = l),
                    (c.bitk = k),
                    (n.avail_in = S),
                    (n.total_in += v - n.next_in_index),
                    (n.next_in_index = v),
                    (c.write = z),
                    c.inflate_flush(n, a)
                  );
                d = B;
              case B:
                return (
                  (a = zip_t),
                  (c.bitb = l),
                  (c.bitk = k),
                  (n.avail_in = S),
                  (n.total_in += v - n.next_in_index),
                  (n.next_in_index = v),
                  (c.write = z),
                  c.inflate_flush(n, a)
                );
              case I:
                return (
                  (a = zip_r),
                  (c.bitb = l),
                  (c.bitk = k),
                  (n.avail_in = S),
                  (n.total_in += v - n.next_in_index),
                  (n.next_in_index = v),
                  (c.write = z),
                  c.inflate_flush(n, a)
                );
              default:
                return (
                  (a = zip_i),
                  (c.bitb = l),
                  (c.bitk = k),
                  (n.avail_in = S),
                  (n.total_in += v - n.next_in_index),
                  (n.next_in_index = v),
                  (c.write = z),
                  c.inflate_flush(n, a)
                );
            }
          }
        }),
        (c.free = function (e) {
          c.reset(e, null), (c.win = null), (y = null);
        }),
        (c.set_dictionary = function (e, t, n) {
          c.win.set(e.subarray(t, t + n), 0), (c.read = c.write = n);
        }),
        (c.sync_point = function () {
          return d == O ? 1 : 0;
        });
    }
    const P = 32,
      V = 8,
      q = 0,
      H = 1,
      K = 2,
      Z = 3,
      G = 4,
      J = 5,
      Q = 6,
      X = 7,
      Y = 12,
      \$ = 13,
      ee = [0, 0, 255, 255];
    function te() {
      const a = this;
      function o(t) {
        return t && t.istate
          ? ((t.total_in = t.total_out = 0),
            (t.msg = null),
            (t.istate.mode = X),
            t.istate.blocks.reset(t, null),
            zip_e)
          : zip_i;
      }
      (a.mode = 0),
        (a.method = 0),
        (a.was = [0]),
        (a.need = 0),
        (a.marker = 0),
        (a.wbits = 0),
        (a.inflateEnd = function (t) {
          return a.blocks && a.blocks.free(t), (a.blocks = null), zip_e;
        }),
        (a.inflateInit = function (t, n) {
          return (
            (t.msg = null),
            (a.blocks = null),
            n < 8 || n > 15
              ? (a.inflateEnd(t), zip_i)
              : ((a.wbits = n),
                (t.istate.blocks = new N(t, 1 << n)),
                o(t),
                zip_e)
          );
        }),
        (a.inflate = function (a, o) {
          let l, c;
          if (!a || !a.istate || !a.next_in) return zip_i;
          const d = a.istate;
          for (o = o == zip_u ? zip_s : zip_e, l = zip_s; ; )
            switch (d.mode) {
              case q:
                if (0 === a.avail_in) return l;
                if (
                  ((l = o),
                  a.avail_in--,
                  a.total_in++,
                  (15 & (d.method = a.read_byte(a.next_in_index++))) != V)
                ) {
                  (d.mode = \$),
                    (a.msg = "unknown compression method"),
                    (d.marker = 5);
                  break;
                }
                if (8 + (d.method >> 4) > d.wbits) {
                  (d.mode = \$), (a.msg = "invalid win size"), (d.marker = 5);
                  break;
                }
                d.mode = H;
              case H:
                if (0 === a.avail_in) return l;
                if (
                  ((l = o),
                  a.avail_in--,
                  a.total_in++,
                  (c = 255 & a.read_byte(a.next_in_index++)),
                  ((d.method << 8) + c) % 31 != 0)
                ) {
                  (d.mode = \$),
                    (a.msg = "incorrect header check"),
                    (d.marker = 5);
                  break;
                }
                if (0 == (c & P)) {
                  d.mode = X;
                  break;
                }
                d.mode = K;
              case K:
                if (0 === a.avail_in) return l;
                (l = o),
                  a.avail_in--,
                  a.total_in++,
                  (d.need =
                    ((255 & a.read_byte(a.next_in_index++)) << 24) &
                    4278190080),
                  (d.mode = Z);
              case Z:
                if (0 === a.avail_in) return l;
                (l = o),
                  a.avail_in--,
                  a.total_in++,
                  (d.need +=
                    ((255 & a.read_byte(a.next_in_index++)) << 16) & 16711680),
                  (d.mode = G);
              case G:
                if (0 === a.avail_in) return l;
                (l = o),
                  a.avail_in--,
                  a.total_in++,
                  (d.need +=
                    ((255 & a.read_byte(a.next_in_index++)) << 8) & 65280),
                  (d.mode = J);
              case J:
                return 0 === a.avail_in
                  ? l
                  : ((l = o),
                    a.avail_in--,
                    a.total_in++,
                    (d.need += 255 & a.read_byte(a.next_in_index++)),
                    (d.mode = Q),
                    zip_n);
              case Q:
                return (
                  (d.mode = \$),
                  (a.msg = "need dictionary"),
                  (d.marker = 0),
                  zip_i
                );
              case X:
                if (((l = d.blocks.proc(a, l)), l == zip_r)) {
                  (d.mode = \$), (d.marker = 0);
                  break;
                }
                if ((l == zip_e && (l = o), l != zip_t)) return l;
                (l = o), d.blocks.reset(a, d.was), (d.mode = Y);
              case Y:
                return (a.avail_in = 0), zip_t;
              case \$:
                return zip_r;
              default:
                return zip_i;
            }
        }),
        (a.inflateSetDictionary = function (t, n, r) {
          let a = 0,
            s = r;
          if (!t || !t.istate || t.istate.mode != Q) return zip_i;
          const o = t.istate;
          return (
            s >= 1 << o.wbits && ((s = (1 << o.wbits) - 1), (a = r - s)),
            o.blocks.set_dictionary(n, a, s),
            (o.mode = X),
            zip_e
          );
        }),
        (a.inflateSync = function (t) {
          let n, a, l, c, u;
          if (!t || !t.istate) return zip_i;
          const d = t.istate;
          if (
            (d.mode != \$ && ((d.mode = \$), (d.marker = 0)),
            0 === (n = t.avail_in))
          )
            return zip_s;
          for (a = t.next_in_index, l = d.marker; 0 !== n && l < 4; )
            t.read_byte(a) == ee[l]
              ? l++
              : (l = 0 !== t.read_byte(a) ? 0 : 4 - l),
              a++,
              n--;
          return (
            (t.total_in += a - t.next_in_index),
            (t.next_in_index = a),
            (t.avail_in = n),
            (d.marker = l),
            4 != l
              ? zip_r
              : ((c = t.total_in),
                (u = t.total_out),
                o(t),
                (t.total_in = c),
                (t.total_out = u),
                (d.mode = X),
                zip_e)
          );
        }),
        (a.inflateSyncPoint = function (e) {
          return e && e.istate && e.istate.blocks
            ? e.istate.blocks.sync_point()
            : zip_i;
        });
    }
    function ne() {}
    ne.prototype = {
      inflateInit(e) {
        const t = this;
        return (t.istate = new te()), e || (e = 15), t.istate.inflateInit(t, e);
      },
      inflate(e) {
        const t = this;
        return t.istate ? t.istate.inflate(t, e) : zip_i;
      },
      inflateEnd() {
        const e = this;
        if (!e.istate) return zip_i;
        const t = e.istate.inflateEnd(e);
        return (e.istate = null), t;
      },
      inflateSync() {
        const e = this;
        return e.istate ? e.istate.inflateSync(e) : zip_i;
      },
      inflateSetDictionary(e, t) {
        const n = this;
        return n.istate ? n.istate.inflateSetDictionary(n, e, t) : zip_i;
      },
      read_byte(e) {
        return this.next_in[e];
      },
      read_buf(e, t) {
        return this.next_in.subarray(e, e + t);
      },
    };
    const ie = 4294967295,
      re = 65535,
      ae = 33639248,
      se = 101075792,
      oe = 1,
      le = 39169,
      ce = 10,
      ue = 1,
      de = 21589,
      fe = 28789,
      _e = 25461,
      he = 1,
      we = 6,
      be = 8,
      pe = 2048,
      me = void 0,
      ge = "undefined",
      ye = "function";
    class xe {
      constructor(e) {
        return class extends TransformStream {
          constructor(t, n) {
            const i = new e(n);
            super({
              transform(e, t) {
                t.enqueue(i.append(e));
              },
              flush(e) {
                const t = i.flush();
                t && e.enqueue(t);
              },
            });
          }
        };
      }
    }
    const ke = 64;
    let ve = 2;
    try {
      typeof navigator != ge &&
        navigator.hardwareConcurrency &&
        (ve = navigator.hardwareConcurrency);
    } catch (e) {}
    const Se = {
        chunkSize: 524288,
        maxWorkers: ve,
        terminateWorkerTimeout: 5e3,
        useWebWorkers: !0,
        useCompressionStream: !0,
        workerScripts: me,
        CompressionStreamNative:
          typeof CompressionStream != ge && CompressionStream,
        DecompressionStreamNative:
          typeof DecompressionStream != ge && DecompressionStream,
      },
      ze = Object.assign({}, Se);
    function Ae(e) {
      const {
        baseURL: t,
        chunkSize: n,
        maxWorkers: i,
        terminateWorkerTimeout: r,
        useCompressionStream: a,
        useWebWorkers: s,
        Deflate: o,
        Inflate: l,
        CompressionStream: c,
        DecompressionStream: u,
        workerScripts: d,
      } = e;
      if (
        (Ue("baseURL", t),
        Ue("chunkSize", n),
        Ue("maxWorkers", i),
        Ue("terminateWorkerTimeout", r),
        Ue("useCompressionStream", a),
        Ue("useWebWorkers", s),
        o && (ze.CompressionStream = new xe(o)),
        l && (ze.DecompressionStream = new xe(l)),
        Ue("CompressionStream", c),
        Ue("DecompressionStream", u),
        d !== me)
      ) {
        const { deflate: e, inflate: t } = d;
        if (((e || t) && (ze.workerScripts || (ze.workerScripts = {})), e)) {
          if (!Array.isArray(e))
            throw new Error("workerScripts.deflate must be an array");
          ze.workerScripts.deflate = e;
        }
        if (t) {
          if (!Array.isArray(t))
            throw new Error("workerScripts.inflate must be an array");
          ze.workerScripts.inflate = t;
        }
      }
    }
    function Ue(e, t) {
      t !== me && (ze[e] = t);
    }
    const De = [];
    for (let e = 0; e < 256; e++) {
      let t = e;
      for (let e = 0; e < 8; e++)
        1 & t ? (t = (t >>> 1) ^ 3988292384) : (t >>>= 1);
      De[e] = t;
    }
    class Ee {
      constructor(e) {
        this.crc = e || -1;
      }
      append(e) {
        let t = 0 | this.crc;
        for (let n = 0, i = 0 | e.length; n < i; n++)
          t = (t >>> 8) ^ De[255 & (t ^ e[n])];
        this.crc = t;
      }
      get() {
        return ~this.crc;
      }
    }
    class Fe extends TransformStream {
      constructor() {
        const e = new Ee();
        super({
          transform(t) {
            e.append(t);
          },
          flush(t) {
            const n = new Uint8Array(4);
            new DataView(n.buffer).setUint32(0, e.get()), t.enqueue(n);
          },
        });
      }
    }
    const Te = {
        concat(e, t) {
          if (0 === e.length || 0 === t.length) return e.concat(t);
          const n = e[e.length - 1],
            i = Te.getPartial(n);
          return 32 === i
            ? e.concat(t)
            : Te._shiftRight(t, i, 0 | n, e.slice(0, e.length - 1));
        },
        bitLength(e) {
          const t = e.length;
          if (0 === t) return 0;
          const n = e[t - 1];
          return 32 * (t - 1) + Te.getPartial(n);
        },
        clamp(e, t) {
          if (32 * e.length < t) return e;
          const n = (e = e.slice(0, Math.ceil(t / 32))).length;
          return (
            (t &= 31),
            n > 0 &&
              t &&
              (e[n - 1] = Te.partial(t, e[n - 1] & (2147483648 >> (t - 1)), 1)),
            e
          );
        },
        partial: (e, t, n) =>
          32 === e ? t : (n ? 0 | t : t << (32 - e)) + 1099511627776 * e,
        getPartial: (e) => Math.round(e / 1099511627776) || 32,
        _shiftRight(e, t, n, i) {
          for (void 0 === i && (i = []); t >= 32; t -= 32) i.push(n), (n = 0);
          if (0 === t) return i.concat(e);
          for (let r = 0; r < e.length; r++)
            i.push(n | (e[r] >>> t)), (n = e[r] << (32 - t));
          const r = e.length ? e[e.length - 1] : 0,
            a = Te.getPartial(r);
          return (
            i.push(Te.partial((t + a) & 31, t + a > 32 ? n : i.pop(), 1)), i
          );
        },
      },
      Oe = {
        bytes: {
          fromBits(e) {
            const t = Te.bitLength(e) / 8,
              n = new Uint8Array(t);
            let i;
            for (let r = 0; r < t; r++)
              0 == (3 & r) && (i = e[r / 4]), (n[r] = i >>> 24), (i <<= 8);
            return n;
          },
          toBits(e) {
            const t = [];
            let n,
              i = 0;
            for (n = 0; n < e.length; n++)
              (i = (i << 8) | e[n]), 3 == (3 & n) && (t.push(i), (i = 0));
            return 3 & n && t.push(Te.partial(8 * (3 & n), i)), t;
          },
        },
      },
      Ce = {
        sha1: class {
          constructor(e) {
            const t = this;
            (t.blockSize = 512),
              (t._init = [
                1732584193, 4023233417, 2562383102, 271733878, 3285377520,
              ]),
              (t._key = [1518500249, 1859775393, 2400959708, 3395469782]),
              e
                ? ((t._h = e._h.slice(0)),
                  (t._buffer = e._buffer.slice(0)),
                  (t._length = e._length))
                : t.reset();
          }
          reset() {
            const e = this;
            return (
              (e._h = e._init.slice(0)), (e._buffer = []), (e._length = 0), e
            );
          }
          update(e) {
            const t = this;
            "string" == typeof e && (e = Oe.utf8String.toBits(e));
            const n = (t._buffer = Te.concat(t._buffer, e)),
              i = t._length,
              r = (t._length = i + Te.bitLength(e));
            if (r > 9007199254740991)
              throw new Error("Cannot hash more than 2^53 - 1 bits");
            const a = new Uint32Array(n);
            let s = 0;
            for (
              let e = t.blockSize + i - ((t.blockSize + i) & (t.blockSize - 1));
              e <= r;
              e += t.blockSize
            )
              t._block(a.subarray(16 * s, 16 * (s + 1))), (s += 1);
            return n.splice(0, 16 * s), t;
          }
          finalize() {
            const e = this;
            let t = e._buffer;
            const n = e._h;
            t = Te.concat(t, [Te.partial(1, 1)]);
            for (let e = t.length + 2; 15 & e; e++) t.push(0);
            for (
              t.push(Math.floor(e._length / 4294967296)), t.push(0 | e._length);
              t.length;

            )
              e._block(t.splice(0, 16));
            return e.reset(), n;
          }
          _f(e, t, n, i) {
            return e <= 19
              ? (t & n) | (~t & i)
              : e <= 39
              ? t ^ n ^ i
              : e <= 59
              ? (t & n) | (t & i) | (n & i)
              : e <= 79
              ? t ^ n ^ i
              : void 0;
          }
          _S(e, t) {
            return (t << e) | (t >>> (32 - e));
          }
          _block(e) {
            const t = this,
              n = t._h,
              i = Array(80);
            for (let t = 0; t < 16; t++) i[t] = e[t];
            let r = n[0],
              a = n[1],
              s = n[2],
              o = n[3],
              l = n[4];
            for (let e = 0; e <= 79; e++) {
              e >= 16 &&
                (i[e] = t._S(1, i[e - 3] ^ i[e - 8] ^ i[e - 14] ^ i[e - 16]));
              const n =
                (t._S(5, r) +
                  t._f(e, a, s, o) +
                  l +
                  i[e] +
                  t._key[Math.floor(e / 20)]) |
                0;
              (l = o), (o = s), (s = t._S(30, a)), (a = r), (r = n);
            }
            (n[0] = (n[0] + r) | 0),
              (n[1] = (n[1] + a) | 0),
              (n[2] = (n[2] + s) | 0),
              (n[3] = (n[3] + o) | 0),
              (n[4] = (n[4] + l) | 0);
          }
        },
      },
      We = {
        aes: class {
          constructor(e) {
            const t = this;
            (t._tables = [
              [[], [], [], [], []],
              [[], [], [], [], []],
            ]),
              t._tables[0][0][0] || t._precompute();
            const n = t._tables[0][4],
              i = t._tables[1],
              r = e.length;
            let a,
              s,
              o,
              l = 1;
            if (4 !== r && 6 !== r && 8 !== r)
              throw new Error("invalid aes key size");
            for (
              t._key = [(s = e.slice(0)), (o = [])], a = r;
              a < 4 * r + 28;
              a++
            ) {
              let e = s[a - 1];
              (a % r == 0 || (8 === r && a % r == 4)) &&
                ((e =
                  (n[e >>> 24] << 24) ^
                  (n[(e >> 16) & 255] << 16) ^
                  (n[(e >> 8) & 255] << 8) ^
                  n[255 & e]),
                a % r == 0 &&
                  ((e = (e << 8) ^ (e >>> 24) ^ (l << 24)),
                  (l = (l << 1) ^ (283 * (l >> 7))))),
                (s[a] = s[a - r] ^ e);
            }
            for (let e = 0; a; e++, a--) {
              const t = s[3 & e ? a : a - 4];
              o[e] =
                a <= 4 || e < 4
                  ? t
                  : i[0][n[t >>> 24]] ^
                    i[1][n[(t >> 16) & 255]] ^
                    i[2][n[(t >> 8) & 255]] ^
                    i[3][n[255 & t]];
            }
          }
          encrypt(e) {
            return this._crypt(e, 0);
          }
          decrypt(e) {
            return this._crypt(e, 1);
          }
          _precompute() {
            const e = this._tables[0],
              t = this._tables[1],
              n = e[4],
              i = t[4],
              r = [],
              a = [];
            let s, o, l, c;
            for (let e = 0; e < 256; e++)
              a[(r[e] = (e << 1) ^ (283 * (e >> 7))) ^ e] = e;
            for (let u = (s = 0); !n[u]; u ^= o || 1, s = a[s] || 1) {
              let a = s ^ (s << 1) ^ (s << 2) ^ (s << 3) ^ (s << 4);
              (a = (a >> 8) ^ (255 & a) ^ 99),
                (n[u] = a),
                (i[a] = u),
                (c = r[(l = r[(o = r[u])])]);
              let d = (16843009 * c) ^ (65537 * l) ^ (257 * o) ^ (16843008 * u),
                f = (257 * r[a]) ^ (16843008 * a);
              for (let n = 0; n < 4; n++)
                (e[n][u] = f = (f << 24) ^ (f >>> 8)),
                  (t[n][a] = d = (d << 24) ^ (d >>> 8));
            }
            for (let n = 0; n < 5; n++)
              (e[n] = e[n].slice(0)), (t[n] = t[n].slice(0));
          }
          _crypt(e, t) {
            if (4 !== e.length) throw new Error("invalid aes block size");
            const n = this._key[t],
              i = n.length / 4 - 2,
              r = [0, 0, 0, 0],
              a = this._tables[t],
              s = a[0],
              o = a[1],
              l = a[2],
              c = a[3],
              u = a[4];
            let d,
              f,
              _,
              h = e[0] ^ n[0],
              w = e[t ? 3 : 1] ^ n[1],
              b = e[2] ^ n[2],
              p = e[t ? 1 : 3] ^ n[3],
              m = 4;
            for (let e = 0; e < i; e++)
              (d =
                s[h >>> 24] ^
                o[(w >> 16) & 255] ^
                l[(b >> 8) & 255] ^
                c[255 & p] ^
                n[m]),
                (f =
                  s[w >>> 24] ^
                  o[(b >> 16) & 255] ^
                  l[(p >> 8) & 255] ^
                  c[255 & h] ^
                  n[m + 1]),
                (_ =
                  s[b >>> 24] ^
                  o[(p >> 16) & 255] ^
                  l[(h >> 8) & 255] ^
                  c[255 & w] ^
                  n[m + 2]),
                (p =
                  s[p >>> 24] ^
                  o[(h >> 16) & 255] ^
                  l[(w >> 8) & 255] ^
                  c[255 & b] ^
                  n[m + 3]),
                (m += 4),
                (h = d),
                (w = f),
                (b = _);
            for (let e = 0; e < 4; e++)
              (r[t ? 3 & -e : e] =
                (u[h >>> 24] << 24) ^
                (u[(w >> 16) & 255] << 16) ^
                (u[(b >> 8) & 255] << 8) ^
                u[255 & p] ^
                n[m++]),
                (d = h),
                (h = w),
                (w = b),
                (b = p),
                (p = d);
            return r;
          }
        },
      },
      je = {
        getRandomValues(e) {
          const t = new Uint32Array(e.buffer),
            n = (e) => {
              let t = 987654321;
              const n = 4294967295;
              return function () {
                t = (36969 * (65535 & t) + (t >> 16)) & n;
                return (
                  ((((t << 16) + (e = (18e3 * (65535 & e) + (e >> 16)) & n)) &
                    n) /
                    4294967296 +
                    0.5) *
                  (Math.random() > 0.5 ? 1 : -1)
                );
              };
            };
          for (let i, r = 0; r < e.length; r += 4) {
            const e = n(4294967296 * (i || Math.random()));
            (i = 987654071 * e()), (t[r / 4] = (4294967296 * e()) | 0);
          }
          return e;
        },
      },
      Me = {
        ctrGladman: class {
          constructor(e, t) {
            (this._prf = e), (this._initIv = t), (this._iv = t);
          }
          reset() {
            this._iv = this._initIv;
          }
          update(e) {
            return this.calculate(this._prf, e, this._iv);
          }
          incWord(e) {
            if (255 == ((e >> 24) & 255)) {
              let t = (e >> 16) & 255,
                n = (e >> 8) & 255,
                i = 255 & e;
              255 === t
                ? ((t = 0),
                  255 === n ? ((n = 0), 255 === i ? (i = 0) : ++i) : ++n)
                : ++t,
                (e = 0),
                (e += t << 16),
                (e += n << 8),
                (e += i);
            } else e += 1 << 24;
            return e;
          }
          incCounter(e) {
            0 === (e[0] = this.incWord(e[0])) && (e[1] = this.incWord(e[1]));
          }
          calculate(e, t, n) {
            let i;
            if (!(i = t.length)) return [];
            const r = Te.bitLength(t);
            for (let r = 0; r < i; r += 4) {
              this.incCounter(n);
              const i = e.encrypt(n);
              (t[r] ^= i[0]),
                (t[r + 1] ^= i[1]),
                (t[r + 2] ^= i[2]),
                (t[r + 3] ^= i[3]);
            }
            return Te.clamp(t, r);
          }
        },
      },
      Le = {
        importKey: (e) => new Le.hmacSha1(Oe.bytes.toBits(e)),
        pbkdf2(e, t, n, i) {
          if (((n = n || 1e4), i < 0 || n < 0))
            throw new Error("invalid params to pbkdf2");
          const r = (1 + (i >> 5)) << 2;
          let a, s, o, l, c;
          const u = new ArrayBuffer(r),
            d = new DataView(u);
          let f = 0;
          const _ = Te;
          for (t = Oe.bytes.toBits(t), c = 1; f < (r || 1); c++) {
            for (a = s = e.encrypt(_.concat(t, [c])), o = 1; o < n; o++)
              for (s = e.encrypt(s), l = 0; l < s.length; l++) a[l] ^= s[l];
            for (o = 0; f < (r || 1) && o < a.length; o++)
              d.setInt32(f, a[o]), (f += 4);
          }
          return u.slice(0, i / 8);
        },
        hmacSha1: class {
          constructor(e) {
            const t = this,
              n = (t._hash = Ce.sha1),
              i = [[], []];
            t._baseHash = [new n(), new n()];
            const r = t._baseHash[0].blockSize / 32;
            e.length > r && (e = new n().update(e).finalize());
            for (let t = 0; t < r; t++)
              (i[0][t] = 909522486 ^ e[t]), (i[1][t] = 1549556828 ^ e[t]);
            t._baseHash[0].update(i[0]),
              t._baseHash[1].update(i[1]),
              (t._resultHash = new n(t._baseHash[0]));
          }
          reset() {
            const e = this;
            (e._resultHash = new e._hash(e._baseHash[0])), (e._updated = !1);
          }
          update(e) {
            (this._updated = !0), this._resultHash.update(e);
          }
          digest() {
            const e = this,
              t = e._resultHash.finalize(),
              n = new e._hash(e._baseHash[1]).update(t).finalize();
            return e.reset(), n;
          }
          encrypt(e) {
            if (this._updated)
              throw new Error("encrypt on already updated hmac called!");
            return this.update(e), this.digest(e);
          }
        },
      },
      Re =
        "undefined" != typeof crypto &&
        "function" == typeof crypto.getRandomValues,
      Be = "Invalid password",
      Ie = "Invalid signature";
    function Ne(e) {
      return Re ? crypto.getRandomValues(e) : je.getRandomValues(e);
    }
    const Pe = 16,
      Ve = "raw",
      qe = {
        name: "PBKDF2",
      },
      He = Object.assign(
        {
          hash: {
            name: "HMAC",
          },
        },
        qe,
      ),
      Ke = Object.assign(
        {
          iterations: 1e3,
          hash: {
            name: "SHA-1",
          },
        },
        qe,
      ),
      Ze = ["deriveBits"],
      Ge = [8, 12, 16],
      Je = [16, 24, 32],
      Qe = 10,
      Xe = [0, 0, 0, 0],
      Ye = "undefined",
      \$e = "function",
      et = typeof crypto != Ye,
      tt = et && crypto.subtle,
      nt = et && typeof tt != Ye,
      it = Oe.bytes,
      rt = We.aes,
      at = Me.ctrGladman,
      st = Le.hmacSha1;
    let ot = et && nt && typeof tt.importKey == \$e,
      lt = et && nt && typeof tt.deriveBits == \$e;
    class ct extends TransformStream {
      constructor({ password: e, signed: t, encryptionStrength: n }) {
        super({
          start() {
            Object.assign(this, {
              ready: new Promise((e) => (this.resolveReady = e)),
              password: e,
              signed: t,
              strength: n - 1,
              pending: new Uint8Array(),
            });
          },
          async transform(e, t) {
            const n = this,
              { password: i, strength: r, resolveReady: a, ready: s } = n;
            i
              ? (await (async function (e, t, n, i) {
                  const r = await ft(e, t, n, ht(i, 0, Ge[t])),
                    a = ht(i, Ge[t]);
                  if (r[0] != a[0] || r[1] != a[1]) throw new Error(Be);
                })(n, r, i, ht(e, 0, Ge[r] + 2)),
                (e = ht(e, Ge[r] + 2)),
                a())
              : await s;
            const o = new Uint8Array(e.length - Qe - ((e.length - Qe) % Pe));
            t.enqueue(dt(n, e, o, 0, Qe, !0));
          },
          async flush(e) {
            const { signed: t, ctr: n, hmac: i, pending: r, ready: a } = this;
            await a;
            const s = ht(r, 0, r.length - Qe),
              o = ht(r, r.length - Qe);
            let l = new Uint8Array();
            if (s.length) {
              const e = bt(it, s);
              i.update(e);
              const t = n.update(e);
              l = wt(it, t);
            }
            if (t) {
              const e = ht(wt(it, i.digest()), 0, Qe);
              for (let t = 0; t < Qe; t++)
                if (e[t] != o[t]) throw new Error(Ie);
            }
            e.enqueue(l);
          },
        });
      }
    }
    class ut extends TransformStream {
      constructor({ password: e, encryptionStrength: t }) {
        let n;
        super({
          start() {
            Object.assign(this, {
              ready: new Promise((e) => (this.resolveReady = e)),
              password: e,
              strength: t - 1,
              pending: new Uint8Array(),
            });
          },
          async transform(e, t) {
            const n = this,
              { password: i, strength: r, resolveReady: a, ready: s } = n;
            let o = new Uint8Array();
            i
              ? ((o = await (async function (e, t, n) {
                  const i = Ne(new Uint8Array(Ge[t])),
                    r = await ft(e, t, n, i);
                  return _t(i, r);
                })(n, r, i)),
                a())
              : await s;
            const l = new Uint8Array(o.length + e.length - (e.length % Pe));
            l.set(o, 0), t.enqueue(dt(n, e, l, o.length, 0));
          },
          async flush(e) {
            const { ctr: t, hmac: i, pending: r, ready: a } = this;
            await a;
            let s = new Uint8Array();
            if (r.length) {
              const e = t.update(bt(it, r));
              i.update(e), (s = wt(it, e));
            }
            (n.signature = wt(it, i.digest()).slice(0, Qe)),
              e.enqueue(_t(s, n.signature));
          },
        }),
          (n = this);
      }
    }
    function dt(e, t, n, i, r, a) {
      const { ctr: s, hmac: o, pending: l } = e,
        c = t.length - r;
      let u;
      for (
        l.length &&
          ((t = _t(l, t)),
          (n = (function (e, t) {
            if (t && t > e.length) {
              const n = e;
              (e = new Uint8Array(t)).set(n, 0);
            }
            return e;
          })(n, c - (c % Pe)))),
          u = 0;
        u <= c - Pe;
        u += Pe
      ) {
        const e = bt(it, ht(t, u, u + Pe));
        a && o.update(e);
        const r = s.update(e);
        a || o.update(r), n.set(wt(it, r), u + i);
      }
      return (e.pending = ht(t, u)), n;
    }
    async function ft(e, t, n, i) {
      e.password = null;
      const r = (function (e) {
          if ("undefined" == typeof TextEncoder) {
            e = unescape(encodeURIComponent(e));
            const t = new Uint8Array(e.length);
            for (let n = 0; n < t.length; n++) t[n] = e.charCodeAt(n);
            return t;
          }
          return new TextEncoder().encode(e);
        })(n),
        a = await (async function (e, t, n, i, r) {
          if (!ot) return Le.importKey(t);
          try {
            return await tt.importKey(e, t, n, i, r);
          } catch (e) {
            return (ot = !1), Le.importKey(t);
          }
        })(Ve, r, He, !1, Ze),
        s = await (async function (e, t, n) {
          if (!lt) return Le.pbkdf2(t, e.salt, Ke.iterations, n);
          try {
            return await tt.deriveBits(e, t, n);
          } catch (i) {
            return (lt = !1), Le.pbkdf2(t, e.salt, Ke.iterations, n);
          }
        })(
          Object.assign(
            {
              salt: i,
            },
            Ke,
          ),
          a,
          8 * (2 * Je[t] + 2),
        ),
        o = new Uint8Array(s),
        l = bt(it, ht(o, 0, Je[t])),
        c = bt(it, ht(o, Je[t], 2 * Je[t])),
        u = ht(o, 2 * Je[t]);
      return (
        Object.assign(e, {
          keys: {
            key: l,
            authentication: c,
            passwordVerification: u,
          },
          ctr: new at(new rt(l), Array.from(Xe)),
          hmac: new st(c),
        }),
        u
      );
    }
    function _t(e, t) {
      let n = e;
      return (
        e.length + t.length &&
          ((n = new Uint8Array(e.length + t.length)),
          n.set(e, 0),
          n.set(t, e.length)),
        n
      );
    }
    function ht(e, t, n) {
      return e.subarray(t, n);
    }
    function wt(e, t) {
      return e.fromBits(t);
    }
    function bt(e, t) {
      return e.toBits(t);
    }
    const pt = 12;
    class mt extends TransformStream {
      constructor({ password: e, passwordVerification: t }) {
        super({
          start() {
            Object.assign(this, {
              password: e,
              passwordVerification: t,
            }),
              kt(this, e);
          },
          transform(e, t) {
            const n = this;
            if (n.password) {
              const t = yt(n, e.subarray(0, pt));
              if (((n.password = null), t[11] != n.passwordVerification))
                throw new Error(Be);
              e = e.subarray(pt);
            }
            t.enqueue(yt(n, e));
          },
        });
      }
    }
    class gt extends TransformStream {
      constructor({ password: e, passwordVerification: t }) {
        super({
          start() {
            Object.assign(this, {
              password: e,
              passwordVerification: t,
            }),
              kt(this, e);
          },
          transform(e, t) {
            const n = this;
            let i, r;
            if (n.password) {
              n.password = null;
              const t = Ne(new Uint8Array(pt));
              (t[11] = n.passwordVerification),
                (i = new Uint8Array(e.length + t.length)),
                i.set(xt(n, t), 0),
                (r = pt);
            } else (i = new Uint8Array(e.length)), (r = 0);
            i.set(xt(n, e), r), t.enqueue(i);
          },
        });
      }
    }
    function yt(e, t) {
      const n = new Uint8Array(t.length);
      for (let i = 0; i < t.length; i++) (n[i] = St(e) ^ t[i]), vt(e, n[i]);
      return n;
    }
    function xt(e, t) {
      const n = new Uint8Array(t.length);
      for (let i = 0; i < t.length; i++) (n[i] = St(e) ^ t[i]), vt(e, t[i]);
      return n;
    }
    function kt(e, t) {
      const n = [305419896, 591751049, 878082192];
      Object.assign(e, {
        keys: n,
        crcKey0: new Ee(n[0]),
        crcKey2: new Ee(n[2]),
      });
      for (let n = 0; n < t.length; n++) vt(e, t.charCodeAt(n));
    }
    function vt(e, t) {
      let [n, i, r] = e.keys;
      e.crcKey0.append([t]),
        (n = ~e.crcKey0.get()),
        (i = At(Math.imul(At(i + zt(n)), 134775813) + 1)),
        e.crcKey2.append([i >>> 24]),
        (r = ~e.crcKey2.get()),
        (e.keys = [n, i, r]);
    }
    function St(e) {
      const t = 2 | e.keys[2];
      return zt(Math.imul(t, 1 ^ t) >>> 8);
    }
    function zt(e) {
      return 255 & e;
    }
    function At(e) {
      return 4294967295 & e;
    }
    const Ut = "deflate-raw";
    class Dt extends TransformStream {
      constructor(
        e,
        { chunkSize: t, CompressionStream: n, CompressionStreamNative: i },
      ) {
        super({});
        const {
            compressed: r,
            encrypted: a,
            useCompressionStream: s,
            zipCrypto: o,
            signed: l,
            level: c,
          } = e,
          u = this;
        let d,
          f,
          _ = Ft(super.readable);
        (a && !o) || !l || (([_, d] = _.tee()), (d = Ct(d, new Fe()))),
          r &&
            (_ = Ot(
              _,
              s,
              {
                level: c,
                chunkSize: t,
              },
              i,
              n,
            )),
          a && (o ? (_ = Ct(_, new gt(e))) : ((f = new ut(e)), (_ = Ct(_, f)))),
          Tt(u, _, async () => {
            let e;
            a && !o && (e = f.signature),
              (a && !o) ||
                !l ||
                ((e = await d.getReader().read()),
                (e = new DataView(e.value.buffer).getUint32(0))),
              (u.signature = e);
          });
      }
    }
    class Et extends TransformStream {
      constructor(
        e,
        { chunkSize: t, DecompressionStream: n, DecompressionStreamNative: i },
      ) {
        super({});
        const {
          zipCrypto: r,
          encrypted: a,
          signed: s,
          signature: o,
          compressed: l,
          useCompressionStream: c,
        } = e;
        let u,
          d,
          f = Ft(super.readable);
        a && (r ? (f = Ct(f, new mt(e))) : ((d = new ct(e)), (f = Ct(f, d)))),
          l &&
            (f = Ot(
              f,
              c,
              {
                chunkSize: t,
              },
              i,
              n,
            )),
          (a && !r) || !s || (([f, u] = f.tee()), (u = Ct(u, new Fe()))),
          Tt(this, f, async () => {
            if ((!a || r) && s) {
              const e = await u.getReader().read(),
                t = new DataView(e.value.buffer);
              if (o != t.getUint32(0, !1)) throw new Error(Ie);
            }
          });
      }
    }
    function Ft(e) {
      return Ct(
        e,
        new TransformStream({
          transform(e, t) {
            e && e.length && t.enqueue(e);
          },
        }),
      );
    }
    function Tt(e, t, n) {
      (t = Ct(
        t,
        new TransformStream({
          flush: n,
        }),
      )),
        Object.defineProperty(e, "readable", {
          get: () => t,
        });
    }
    function Ot(e, t, n, i, r) {
      try {
        e = Ct(e, new (t && i ? i : r)(Ut, n));
      } catch (i) {
        if (!t) throw i;
        e = Ct(e, new r(Ut, n));
      }
      return e;
    }
    function Ct(e, t) {
      return e.pipeThrough(t);
    }
    const Wt = "message",
      jt = "start",
      Mt = "pull",
      Lt = "data",
      Rt = "ack",
      Bt = "close",
      It = "inflate";
    class Nt extends TransformStream {
      constructor(e, t) {
        super({});
        const n = this,
          { codecType: i } = e;
        let r;
        i.startsWith("deflate") ? (r = Dt) : i.startsWith(It) && (r = Et);
        let a = 0;
        const s = new r(e, t),
          o = super.readable,
          l = new TransformStream({
            transform(e, t) {
              e && e.length && ((a += e.length), t.enqueue(e));
            },
            flush() {
              const { signature: e } = s;
              Object.assign(n, {
                signature: e,
                size: a,
              });
            },
          });
        Object.defineProperty(n, "readable", {
          get: () => o.pipeThrough(s).pipeThrough(l),
        });
      }
    }
    const Pt = typeof Worker != ge;
    class Vt {
      constructor(
        e,
        { readable: t, writable: n },
        {
          options: i,
          config: r,
          streamOptions: a,
          useWebWorkers: s,
          transferStreams: o,
          scripts: l,
        },
        c,
      ) {
        const { signal: u } = a;
        return (
          Object.assign(e, {
            busy: !0,
            readable: t.pipeThrough(new qt(t, a, r), {
              signal: u,
            }),
            writable: n,
            options: Object.assign({}, i),
            scripts: l,
            transferStreams: o,
            terminate() {
              const { worker: t, busy: n } = e;
              t && !n && (t.terminate(), (e.interface = null));
            },
            onTaskFinished() {
              (e.busy = !1), c(e);
            },
          }),
          (s && Pt ? Zt : Kt)(e, r)
        );
      }
    }
    class qt extends TransformStream {
      constructor(
        e,
        { onstart: t, onprogress: n, size: i, onend: r },
        { chunkSize: a },
      ) {
        let s = 0;
        super(
          {
            start() {
              t && Ht(t, i);
            },
            async transform(e, t) {
              (s += e.length), n && (await Ht(n, s, i)), t.enqueue(e);
            },
            flush() {
              (e.size = s), r && Ht(r, s);
            },
          },
          {
            highWaterMark: 1,
            size: () => a,
          },
        );
      }
    }
    async function Ht(e, ...t) {
      try {
        await e(...t);
      } catch (e) {}
    }
    function Kt(e, t) {
      return {
        run: () =>
          (async function (
            { options: e, readable: t, writable: n, onTaskFinished: i },
            r,
          ) {
            const a = new Nt(e, r);
            try {
              await t.pipeThrough(a).pipeTo(n, {
                preventClose: !0,
                preventAbort: !0,
              });
              const { signature: e, size: i } = a;
              return {
                signature: e,
                size: i,
              };
            } finally {
              i();
            }
          })(e, t),
      };
    }
    function Zt(e, { baseURL: t, chunkSize: n }) {
      return (
        e.interface ||
          Object.assign(e, {
            worker: Qt(e.scripts[0], t, e),
            interface: {
              run: () =>
                (async function (e, t) {
                  let n, i;
                  const r = new Promise((e, t) => {
                    (n = e), (i = t);
                  });
                  Object.assign(e, {
                    reader: null,
                    writer: null,
                    resolveResult: n,
                    rejectResult: i,
                    result: r,
                  });
                  const { readable: a, options: s, scripts: o } = e,
                    { writable: l, closed: c } = (function (e) {
                      const t = e.getWriter();
                      let n;
                      const i = new Promise((e) => (n = e)),
                        r = new WritableStream({
                          async write(e) {
                            await t.ready, await t.write(e);
                          },
                          close() {
                            t.releaseLock(), n();
                          },
                          abort: (e) => t.abort(e),
                        });
                      return {
                        writable: r,
                        closed: i,
                      };
                    })(e.writable),
                    u = Xt(
                      {
                        type: jt,
                        scripts: o.slice(1),
                        options: s,
                        config: t,
                        readable: a,
                        writable: l,
                      },
                      e,
                    );
                  u ||
                    Object.assign(e, {
                      reader: a.getReader(),
                      writer: l.getWriter(),
                    });
                  const d = await r;
                  try {
                    await l.close();
                  } catch (e) {}
                  return await c, d;
                })(e, {
                  chunkSize: n,
                }),
            },
          }),
        e.interface
      );
    }
    let Gt = !0,
      Jt = !0;
    function Qt(e, t, n) {
      const i = {
        type: "module",
      };
      let r, a;
      typeof e == ye && (e = e());
      try {
        r = new URL(e, t);
      } catch (t) {
        r = e;
      }
      if (Gt)
        try {
          a = new Worker(r);
        } catch (e) {
          (Gt = !1), (a = new Worker(r, i));
        }
      else a = new Worker(r, i);
      return (
        a.addEventListener(Wt, (e) =>
          (async function ({ data: e }, t) {
            const { type: n, value: i, messageId: r, result: a, error: s } = e,
              {
                reader: o,
                writer: l,
                resolveResult: c,
                rejectResult: u,
                onTaskFinished: d,
              } = t;
            try {
              if (s) {
                const { message: e, stack: t, code: n, name: i } = s,
                  r = new Error(e);
                Object.assign(r, {
                  stack: t,
                  code: n,
                  name: i,
                }),
                  f(r);
              } else {
                if (n == Mt) {
                  const { value: e, done: n } = await o.read();
                  Xt(
                    {
                      type: Lt,
                      value: e,
                      done: n,
                      messageId: r,
                    },
                    t,
                  );
                }
                n == Lt &&
                  (await l.ready,
                  await l.write(new Uint8Array(i)),
                  Xt(
                    {
                      type: Rt,
                      messageId: r,
                    },
                    t,
                  )),
                  n == Bt && f(null, a);
              }
            } catch (s) {
              f(s);
            }
            function f(e, t) {
              e ? u(e) : c(t), l && l.releaseLock(), d();
            }
          })(e, n),
        ),
        a
      );
    }
    function Xt(
      e,
      { worker: t, writer: n, onTaskFinished: i, transferStreams: r },
    ) {
      try {
        let { value: n, readable: i, writable: a } = e;
        const s = [];
        if (n) {
          const { buffer: t, length: i } = n;
          i != t.byteLength && (n = new Uint8Array(n)),
            (e.value = n.buffer),
            s.push(e.value);
        }
        if (
          (r && Jt
            ? (i && s.push(i), a && s.push(a))
            : (e.readable = e.writable = null),
          s.length)
        )
          try {
            return t.postMessage(e, s), !0;
          } catch (n) {
            (Jt = !1), (e.readable = e.writable = null), t.postMessage(e);
          }
        else t.postMessage(e);
      } catch (e) {
        throw (n && n.releaseLock(), i(), e);
      }
    }
    let Yt = [];
    const \$t = [];
    let en = 0;
    function tn(e) {
      const { terminateTimeout: t } = e;
      t && (clearTimeout(t), (e.terminateTimeout = null));
    }
    const nn = 65536,
      rn = "writable";
    class an {
      constructor() {
        this.size = 0;
      }
      init() {
        this.initialized = !0;
      }
    }
    class sn extends an {
      get readable() {
        const e = this,
          { chunkSize: t = nn } = e,
          n = new ReadableStream({
            start() {
              this.chunkOffset = 0;
            },
            async pull(i) {
              const { offset: r = 0, size: a, diskNumberStart: s } = n,
                { chunkOffset: o } = this;
              i.enqueue(await hn(e, r + o, Math.min(t, a - o), s)),
                o + t > a ? i.close() : (this.chunkOffset += t);
            },
          });
        return n;
      }
    }
    class on extends sn {
      constructor(e) {
        super(),
          Object.assign(this, {
            blob: e,
            size: e.size,
          });
      }
      async readUint8Array(e, t) {
        const n = this,
          i = e + t,
          r = e || i < n.size ? n.blob.slice(e, i) : n.blob;
        return new Uint8Array(await r.arrayBuffer());
      }
    }
    class ln extends an {
      constructor(e) {
        super();
        const t = new TransformStream(),
          n = [];
        e && n.push(["Content-Type", e]),
          Object.defineProperty(this, rn, {
            get: () => t.writable,
          }),
          (this.blob = new Response(t.readable, {
            headers: n,
          }).blob());
      }
      getData() {
        return this.blob;
      }
    }
    class cn extends ln {
      constructor(e) {
        super(e),
          Object.assign(this, {
            encoding: e,
            utf8: !e || "utf-8" == e.toLowerCase(),
          });
      }
      async getData() {
        const { encoding: e, utf8: t } = this,
          n = await super.getData();
        if (n.text && t) return n.text();
        {
          const t = new FileReader();
          return new Promise((i, r) => {
            Object.assign(t, {
              onload: ({ target: e }) => i(e.result),
              onerror: () => r(t.error),
            }),
              t.readAsText(n, e);
          });
        }
      }
    }
    class un extends sn {
      constructor(e) {
        super(), (this.readers = e);
      }
      async init() {
        const e = this,
          { readers: t } = e;
        (e.lastDiskNumber = 0),
          await Promise.all(
            t.map(async (t) => {
              await t.init(), (e.size += t.size);
            }),
          ),
          super.init();
      }
      async readUint8Array(e, t, n = 0) {
        const i = this,
          { readers: r } = this;
        let a,
          s = n;
        -1 == s && (s = r.length - 1);
        let o = e;
        for (; o >= r[s].size; ) (o -= r[s].size), s++;
        const l = r[s],
          c = l.size;
        if (o + t <= c) a = await hn(l, o, t);
        else {
          const r = c - o;
          (a = new Uint8Array(t)),
            a.set(await hn(l, o, r)),
            a.set(await i.readUint8Array(e + r, t - r, n), r);
        }
        return (i.lastDiskNumber = Math.max(s, i.lastDiskNumber)), a;
      }
    }
    class dn extends an {
      constructor(e, t = 4294967295) {
        super();
        const n = this;
        let i, r, a;
        Object.assign(n, {
          diskNumber: 0,
          diskOffset: 0,
          size: 0,
          maxSize: t,
          availableSize: t,
        });
        const s = new WritableStream({
          async write(t) {
            const { availableSize: s } = n;
            if (a)
              t.length >= s
                ? (await o(t.slice(0, s)),
                  await l(),
                  (n.diskOffset += i.size),
                  n.diskNumber++,
                  (a = null),
                  await this.write(t.slice(s)))
                : await o(t);
            else {
              const { value: s, done: o } = await e.next();
              if (o && !s)
                throw new Error("Writer iterator completed too soon");
              (i = s),
                (i.size = 0),
                i.maxSize && (n.maxSize = i.maxSize),
                (n.availableSize = n.maxSize),
                await fn(i),
                (r = s.writable),
                (a = r.getWriter()),
                await this.write(t);
            }
          },
          async close() {
            await a.ready, await l();
          },
        });
        async function o(e) {
          const t = e.length;
          t &&
            (await a.ready,
            await a.write(e),
            (i.size += t),
            (n.size += t),
            (n.availableSize -= t));
        }
        async function l() {
          (r.size = i.size), await a.close();
        }
        Object.defineProperty(n, rn, {
          get: () => s,
        });
      }
    }
    async function fn(e, t) {
      e.init && !e.initialized && (await e.init(t));
    }
    function _n(e) {
      return (
        Array.isArray(e) && (e = new un(e)),
        e instanceof ReadableStream &&
          (e = {
            readable: e,
          }),
        e
      );
    }
    function hn(e, t, n, i) {
      return e.readUint8Array(t, n, i);
    }
    const wn =
        "\\0☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !\\"#\$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ".split(
          "",
        ),
      bn = 256 == wn.length;
    function pn(e, t) {
      return t && "cp437" == t.trim().toLowerCase()
        ? (function (e) {
            if (bn) {
              let t = "";
              for (let n = 0; n < e.length; n++) t += wn[e[n]];
              return t;
            }
            return new TextDecoder().decode(e);
          })(e)
        : new TextDecoder(t).decode(e);
    }
    const mn = "filename",
      gn = "rawFilename",
      yn = "comment",
      xn = "rawComment",
      kn = "uncompressedSize",
      vn = "compressedSize",
      Sn = "offset",
      zn = "diskNumberStart",
      An = "lastModDate",
      Un = "rawLastModDate",
      Dn = "lastAccessDate",
      En = "rawLastAccessDate",
      Fn = "creationDate",
      Tn = "rawCreationDate",
      On = [
        mn,
        gn,
        vn,
        kn,
        An,
        Un,
        yn,
        xn,
        Dn,
        Fn,
        Sn,
        zn,
        zn,
        "internalFileAttribute",
        "externalFileAttribute",
        "msDosCompatible",
        "zip64",
        "directory",
        "bitFlag",
        "encrypted",
        "signature",
        "filenameUTF8",
        "commentUTF8",
        "compressionMethod",
        "version",
        "versionMadeBy",
        "extraField",
        "rawExtraField",
        "extraFieldZip64",
        "extraFieldUnicodePath",
        "extraFieldUnicodeComment",
        "extraFieldAES",
        "extraFieldNTFS",
        "extraFieldExtendedTimestamp",
      ];
    class Cn {
      constructor(e) {
        On.forEach((t) => (this[t] = e[t]));
      }
    }
    const Wn = "File format is not recognized",
      jn = "Zip64 extra field not found",
      Mn = "Compression method not supported",
      Ln = "Split zip file",
      Rn = "utf-8",
      Bn = "cp437",
      In = [
        [kn, ie],
        [vn, ie],
        [Sn, ie],
        [zn, re],
      ],
      Nn = {
        [re]: {
          getValue: Yn,
          bytes: 4,
        },
        [ie]: {
          getValue: \$n,
          bytes: 8,
        },
      };
    class Pn {
      constructor(e, t = {}) {
        Object.assign(this, {
          reader: _n(e),
          options: t,
          config: ze,
        });
      }
      async *getEntriesGenerator(e = {}) {
        const t = this;
        let { reader: n } = t;
        const { config: i } = t;
        if (
          (await fn(n),
          (n.size !== me && n.readUint8Array) ||
            ((n = new on(await new Response(n.readable).blob())), await fn(n)),
          n.size < 22)
        )
          throw new Error(Wn);
        n.chunkSize = (function (e) {
          return Math.max(e.chunkSize, ke);
        })(i);
        const r = await (async function (e, t, n, i, r) {
          const a = new Uint8Array(4);
          !(function (e, t, n) {
            e.setUint32(t, n, !0);
          })(ei(a), 0, t);
          const s = i + r;
          return (await o(i)) || (await o(Math.min(s, n)));
          async function o(t) {
            const r = n - t,
              s = await hn(e, r, t);
            for (let e = s.length - i; e >= 0; e--)
              if (
                s[e] == a[0] &&
                s[e + 1] == a[1] &&
                s[e + 2] == a[2] &&
                s[e + 3] == a[3]
              )
                return {
                  offset: r + e,
                  buffer: s.slice(e, e + i).buffer,
                };
          }
        })(n, 101010256, n.size, 22, 1048560);
        if (!r) {
          throw 134695760 == Yn(ei(await hn(n, 0, 4)))
            ? new Error(Ln)
            : new Error("End of central directory not found");
        }
        const a = ei(r);
        let s = Yn(a, 12),
          o = Yn(a, 16);
        const l = r.offset,
          c = Xn(a, 20),
          u = l + 22 + c;
        let d = Xn(a, 4);
        const f = n.lastDiskNumber || 0;
        let _ = Xn(a, 6),
          h = Xn(a, 8),
          w = 0,
          b = 0;
        if (o == ie || s == ie || h == re || _ == re) {
          const e = ei(await hn(n, r.offset - 20, 20));
          if (117853008 != Yn(e, 0))
            throw new Error("End of Zip64 central directory not found");
          o = \$n(e, 8);
          let t = await hn(n, o, 56, -1),
            i = ei(t);
          const a = r.offset - 20 - 56;
          if (Yn(i, 0) != se && o != a) {
            const e = o;
            (o = a), (w = o - e), (t = await hn(n, o, 56, -1)), (i = ei(t));
          }
          if (Yn(i, 0) != se)
            throw new Error("End of Zip64 central directory locator not found");
          d == re && (d = Yn(i, 16)),
            _ == re && (_ = Yn(i, 20)),
            h == re && (h = \$n(i, 32)),
            s == ie && (s = \$n(i, 40)),
            (o -= s);
        }
        if (f != d) throw new Error(Ln);
        if (o < 0 || o >= n.size) throw new Error(Wn);
        let p = 0,
          m = await hn(n, o, s, _),
          g = ei(m);
        if (s) {
          const e = r.offset - s;
          if (Yn(g, p) != ae && o != e) {
            const t = o;
            (o = e), (w = o - t), (m = await hn(n, o, s, _)), (g = ei(m));
          }
        }
        if (o < 0 || o >= n.size) throw new Error(Wn);
        const y = Zn(t, e, "filenameEncoding"),
          x = Zn(t, e, "commentEncoding");
        for (let r = 0; r < h; r++) {
          const a = new Vn(n, i, t.options);
          if (Yn(g, p) != ae)
            throw new Error("Central directory header not found");
          qn(a, g, p + 6);
          const s = Boolean(a.bitFlag.languageEncodingFlag),
            o = p + 46,
            l = o + a.filenameLength,
            c = l + a.extraFieldLength,
            u = Xn(g, p + 4),
            d = 0 == (0 & u),
            f = m.subarray(o, l),
            _ = Xn(g, p + 32),
            k = c + _,
            v = m.subarray(c, k),
            S = s,
            z = s,
            A = d && 16 == (16 & Qn(g, p + 38)),
            U = Yn(g, p + 42) + w;
          Object.assign(a, {
            versionMadeBy: u,
            msDosCompatible: d,
            compressedSize: 0,
            uncompressedSize: 0,
            commentLength: _,
            directory: A,
            offset: U,
            diskNumberStart: Xn(g, p + 34),
            internalFileAttribute: Xn(g, p + 36),
            externalFileAttribute: Yn(g, p + 38),
            rawFilename: f,
            filenameUTF8: S,
            commentUTF8: z,
            rawExtraField: m.subarray(l, c),
          });
          const [D, E] = await Promise.all([
            pn(f, S ? Rn : y || Bn),
            pn(v, z ? Rn : x || Bn),
          ]);
          Object.assign(a, {
            rawComment: v,
            filename: D,
            comment: E,
            directory: A || D.endsWith("/"),
          }),
            (b = Math.max(U, b)),
            await Hn(a, a, g, p + 6);
          const F = new Cn(a);
          (F.getData = (e, t) => a.getData(e, F, t)), (p = k);
          const { onprogress: T } = e;
          if (T)
            try {
              await T(r + 1, h, new Cn(a));
            } catch (e) {}
          yield F;
        }
        const k = Zn(t, e, "extractPrependedData"),
          v = Zn(t, e, "extractAppendedData");
        return (
          k && (t.prependedData = b > 0 ? await hn(n, 0, b) : new Uint8Array()),
          (t.comment = c ? await hn(n, l + 22, c) : new Uint8Array()),
          v &&
            (t.appendedData =
              u < n.size ? await hn(n, u, n.size - u) : new Uint8Array()),
          !0
        );
      }
      async getEntries(e = {}) {
        const t = [];
        for await (const n of this.getEntriesGenerator(e)) t.push(n);
        return t;
      }
      async close() {}
    }
    class Vn {
      constructor(e, t, n) {
        Object.assign(this, {
          reader: e,
          config: t,
          options: n,
        });
      }
      async getData(e, t, n = {}) {
        const i = this,
          {
            reader: r,
            offset: a,
            diskNumberStart: s,
            extraFieldAES: o,
            compressionMethod: l,
            config: c,
            bitFlag: u,
            signature: d,
            rawLastModDate: f,
            uncompressedSize: _,
            compressedSize: h,
          } = i,
          w = (i.localDirectory = {}),
          b = ei(await hn(r, a, 30, s));
        let p = Zn(i, n, "password");
        if (((p = p && p.length && p), o && 99 != o.originalCompressionMethod))
          throw new Error(Mn);
        if (0 != l && 8 != l) throw new Error(Mn);
        if (67324752 != Yn(b, 0))
          throw new Error("Local file header not found");
        qn(w, b, 4),
          (w.rawExtraField = w.extraFieldLength
            ? await hn(r, a + 30 + w.filenameLength, w.extraFieldLength, s)
            : new Uint8Array()),
          await Hn(i, w, b, 4),
          Object.assign(t, {
            lastAccessDate: w.lastAccessDate,
            creationDate: w.creationDate,
          });
        const m = i.encrypted && w.encrypted,
          g = m && !o;
        if (m) {
          if (!g && o.strength === me)
            throw new Error("Encryption method not supported");
          if (!p) throw new Error("File contains encrypted entry");
        }
        const y = a + 30 + w.filenameLength + w.extraFieldLength,
          x = r.readable;
        (x.diskNumberStart = s), (x.offset = y);
        const k = (x.size = h),
          v = Zn(i, n, "signal");
        (e = (function (e) {
          e.writable === me && typeof e.next == ye && (e = new dn(e)),
            e instanceof WritableStream &&
              (e = {
                writable: e,
              });
          const { writable: t } = e;
          return (
            t.size === me && (t.size = 0),
            e instanceof dn ||
              Object.assign(e, {
                diskNumber: 0,
                diskOffset: 0,
                availableSize: 1 / 0,
                maxSize: 1 / 0,
              }),
            e
          );
        })(e)),
          await fn(e, _);
        const { writable: S } = e,
          { onstart: z, onprogress: A, onend: U } = n,
          D = {
            options: {
              codecType: It,
              password: p,
              zipCrypto: g,
              encryptionStrength: o && o.strength,
              signed: Zn(i, n, "checkSignature"),
              passwordVerification:
                g && (u.dataDescriptor ? (f >>> 8) & 255 : (d >>> 24) & 255),
              signature: d,
              compressed: 0 != l,
              encrypted: m,
              useWebWorkers: Zn(i, n, "useWebWorkers"),
              useCompressionStream: Zn(i, n, "useCompressionStream"),
              transferStreams: Zn(i, n, "transferStreams"),
            },
            config: c,
            streamOptions: {
              signal: v,
              size: k,
              onstart: z,
              onprogress: A,
              onend: U,
            },
          };
        S.size += (
          await (async function (e, t) {
            const { options: n, config: i } = t,
              {
                transferStreams: r,
                useWebWorkers: a,
                useCompressionStream: s,
                codecType: o,
                compressed: l,
                signed: c,
                encrypted: u,
              } = n,
              {
                workerScripts: d,
                maxWorkers: f,
                terminateWorkerTimeout: _,
              } = i;
            t.transferStreams = r || r === me;
            const h = !(l || c || u || t.transferStreams);
            let w;
            (t.useWebWorkers = !h && (a || (a === me && i.useWebWorkers))),
              (t.scripts = t.useWebWorkers && d ? d[o] : []),
              (n.useCompressionStream =
                s || (s === me && i.useCompressionStream));
            const b = Yt.find((e) => !e.busy);
            if (b) tn(b), (w = new Vt(b, e, t, p));
            else if (Yt.length < f) {
              const n = {
                indexWorker: en,
              };
              en++, Yt.push(n), (w = new Vt(n, e, t, p));
            } else
              w = await new Promise((n) =>
                \$t.push({
                  resolve: n,
                  stream: e,
                  workerOptions: t,
                }),
              );
            return w.run();
            function p(e) {
              if (\$t.length) {
                const [{ resolve: t, stream: n, workerOptions: i }] = \$t.splice(
                  0,
                  1,
                );
                t(new Vt(e, n, i, p));
              } else
                e.worker
                  ? (tn(e),
                    Number.isFinite(_) &&
                      _ >= 0 &&
                      (e.terminateTimeout = setTimeout(() => {
                        (Yt = Yt.filter((t) => t != e)), e.terminate();
                      }, _)))
                  : (Yt = Yt.filter((t) => t != e));
            }
          })(
            {
              readable: x,
              writable: S,
            },
            D,
          )
        ).size;
        return (
          Zn(i, n, "preventClose") || (await S.close()),
          e.getData ? e.getData() : S
        );
      }
    }
    function qn(e, t, n) {
      const i = (e.rawBitFlag = Xn(t, n + 2)),
        r = (i & he) == he,
        a = Yn(t, n + 6);
      Object.assign(e, {
        encrypted: r,
        version: Xn(t, n),
        bitFlag: {
          level: (i & we) >> 1,
          dataDescriptor: (i & be) == be,
          languageEncodingFlag: (i & pe) == pe,
        },
        rawLastModDate: a,
        lastModDate: Gn(a),
        filenameLength: Xn(t, n + 22),
        extraFieldLength: Xn(t, n + 24),
      });
    }
    async function Hn(e, t, n, i) {
      const { rawExtraField: r } = t,
        a = (t.extraField = new Map()),
        s = ei(new Uint8Array(r));
      let o = 0;
      try {
        for (; o < r.length; ) {
          const e = Xn(s, o),
            t = Xn(s, o + 2);
          a.set(e, {
            type: e,
            data: r.slice(o + 4, o + 4 + t),
          }),
            (o += 4 + t);
        }
      } catch (e) {}
      const l = Xn(n, i + 4);
      Object.assign(t, {
        signature: Yn(n, i + 10),
        uncompressedSize: Yn(n, i + 18),
        compressedSize: Yn(n, i + 14),
      });
      const c = a.get(oe);
      c &&
        (!(function (e, t) {
          t.zip64 = !0;
          const n = ei(e.data),
            i = In.filter(([e, n]) => t[e] == n);
          for (let r = 0, a = 0; r < i.length; r++) {
            const [s, o] = i[r];
            if (t[s] == o) {
              const i = Nn[o];
              (t[s] = e[s] = i.getValue(n, a)), (a += i.bytes);
            } else if (e[s]) throw new Error(jn);
          }
        })(c, t),
        (t.extraFieldZip64 = c));
      const u = a.get(fe);
      u && (await Kn(u, mn, gn, t, e), (t.extraFieldUnicodePath = u));
      const d = a.get(_e);
      d && (await Kn(d, yn, xn, t, e), (t.extraFieldUnicodeComment = d));
      const f = a.get(le);
      f
        ? (!(function (e, t, n) {
            const i = ei(e.data),
              r = Qn(i, 4);
            Object.assign(e, {
              vendorVersion: Qn(i, 0),
              vendorId: Qn(i, 2),
              strength: r,
              originalCompressionMethod: n,
              compressionMethod: Xn(i, 5),
            }),
              (t.compressionMethod = e.compressionMethod);
          })(f, t, l),
          (t.extraFieldAES = f))
        : (t.compressionMethod = l);
      const _ = a.get(ce);
      _ &&
        (!(function (e, t) {
          const n = ei(e.data);
          let i,
            r = 4;
          try {
            for (; r < e.data.length && !i; ) {
              const t = Xn(n, r),
                a = Xn(n, r + 2);
              t == ue && (i = e.data.slice(r + 4, r + 4 + a)), (r += 4 + a);
            }
          } catch (e) {}
          try {
            if (i && 24 == i.length) {
              const n = ei(i),
                r = n.getBigUint64(0, !0),
                a = n.getBigUint64(8, !0),
                s = n.getBigUint64(16, !0);
              Object.assign(e, {
                rawLastModDate: r,
                rawLastAccessDate: a,
                rawCreationDate: s,
              });
              const o = Jn(r),
                l = Jn(a),
                c = {
                  lastModDate: o,
                  lastAccessDate: l,
                  creationDate: Jn(s),
                };
              Object.assign(e, c), Object.assign(t, c);
            }
          } catch (e) {}
        })(_, t),
        (t.extraFieldNTFS = _));
      const h = a.get(de);
      h &&
        (!(function (e, t) {
          const n = ei(e.data),
            i = Qn(n, 0),
            r = [],
            a = [];
          1 == (1 & i) && (r.push(An), a.push(Un));
          2 == (2 & i) && (r.push(Dn), a.push(En));
          4 == (4 & i) && (r.push(Fn), a.push(Tn));
          let s = 1;
          r.forEach((i, r) => {
            if (e.data.length >= s + 4) {
              const o = Yn(n, s);
              t[i] = e[i] = new Date(1e3 * o);
              const l = a[r];
              e[l] = o;
            }
            s += 4;
          });
        })(h, t),
        (t.extraFieldExtendedTimestamp = h));
    }
    async function Kn(e, t, n, i, r) {
      const a = ei(e.data),
        s = new Ee();
      s.append(r[n]);
      const o = ei(new Uint8Array(4));
      o.setUint32(0, s.get(), !0),
        Object.assign(e, {
          version: Qn(a, 0),
          signature: Yn(a, 1),
          [t]: await pn(e.data.subarray(5)),
          valid: !r.bitFlag.languageEncodingFlag && e.signature == Yn(o, 0),
        }),
        e.valid && ((i[t] = e[t]), (i[t + "UTF8"] = !0));
    }
    function Zn(e, t, n) {
      return t[n] === me ? e.options[n] : t[n];
    }
    function Gn(e) {
      const t = (4294901760 & e) >> 16,
        n = 65535 & e;
      try {
        return new Date(
          1980 + ((65024 & t) >> 9),
          ((480 & t) >> 5) - 1,
          31 & t,
          (63488 & n) >> 11,
          (2016 & n) >> 5,
          2 * (31 & n),
          0,
        );
      } catch (e) {}
    }
    function Jn(e) {
      return new Date(Number(e / BigInt(1e4) - BigInt(116444736e5)));
    }
    function Qn(e, t) {
      return e.getUint8(t);
    }
    function Xn(e, t) {
      return e.getUint16(t, !0);
    }
    function Yn(e, t) {
      return e.getUint32(t, !0);
    }
    function \$n(e, t) {
      return Number(e.getBigUint64(t, !0));
    }
    function ei(e) {
      return new DataView(e.buffer);
    }
    Ae({
      Inflate: function (n) {
        const i = new ne(),
          r = n && n.chunkSize ? Math.floor(2 * n.chunkSize) : 131072,
          a = zip_c,
          o = new Uint8Array(r);
        let l = !1;
        i.inflateInit(),
          (i.next_out = o),
          (this.append = function (n, c) {
            const u = [];
            let d,
              f,
              _ = 0,
              h = 0,
              w = 0;
            if (0 !== n.length) {
              (i.next_in_index = 0), (i.next_in = n), (i.avail_in = n.length);
              do {
                if (
                  ((i.next_out_index = 0),
                  (i.avail_out = r),
                  0 !== i.avail_in || l || ((i.next_in_index = 0), (l = !0)),
                  (d = i.inflate(a)),
                  l && d === zip_s)
                ) {
                  if (0 !== i.avail_in) throw new Error("inflating: bad input");
                } else if (d !== zip_e && d !== zip_t)
                  throw new Error("inflating: " + i.msg);
                if ((l || d === zip_t) && i.avail_in === n.length)
                  throw new Error("inflating: bad input");
                i.next_out_index &&
                  (i.next_out_index === r
                    ? u.push(new Uint8Array(o))
                    : u.push(o.slice(0, i.next_out_index))),
                  (w += i.next_out_index),
                  c &&
                    i.next_in_index > 0 &&
                    i.next_in_index != _ &&
                    (c(i.next_in_index), (_ = i.next_in_index));
              } while (i.avail_in > 0 || 0 === i.avail_out);
              return (
                u.length > 1
                  ? ((f = new Uint8Array(w)),
                    u.forEach(function (e) {
                      f.set(e, h), (h += e.length);
                    }))
                  : (f = u[0] || new Uint8Array()),
                f
              );
            }
          }),
          (this.flush = function () {
            i.inflateEnd();
          });
      },
    }); // CONCATENATED MODULE: ./main.js

    /**
     * PDF
     * - fixed-layout.js
     * - scale is sometimes 0
     * Paginator
     * - font size increases when switching from paginated to scrolled
     * - happens in scrolled on line 247 inside the paginator view?? <- maybe styles dont get passed?
     */

    const toReactMessage = (e) => {
      window.ReactNativeWebView.postMessage(JSON.stringify(e));
    };
    toReactMessage({
      type: "onStarted",
    });
    const makeZipLoader = async (file) => {
      try {
        Ae({
          useWebWorkers: false,
        });
        const reader = new Pn(new on(file));
        const entries = await reader.getEntries();
        const map = new Map(entries.map((entry) => [entry.filename, entry]));
        const load =
          (f) =>
          (name, ...args) =>
            map.has(name) ? f(map.get(name), ...args) : null;
        const loadText = load((entry) => entry.getData(new cn()));
        const loadBlob = load((entry, type) => entry.getData(new ln(type)));
        const getSize = (name) => map.get(name)?.uncompressedSize ?? 0;
        return {
          entries,
          loadText,
          loadBlob,
          getSize,
        };
      } catch (err) {
        debug("[makeZipLoader] " + err);
      }
    };
    const blobToBase64 = (blob) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
      });
    const getCSS = ({ lineHeight, justify, hyphenate, theme, fontSize }) => \`
@namespace epub "http://www.idpf.org/2007/ops";
@media print {
    html {
        column-width: auto !important;
        height: auto !important;
        width: auto !important;
    }
}
html, body {
  background: none !important;
  color: \${theme.fg};
  font-size: \${fontSize}%;
}
body *{
  background-color: \${theme.bg} !important;
  color: inherit !important;
}
html, body, p, li, blockquote, dd {
    line-height: \${lineHeight};
    text-align: \${justify ? "justify" : "start"};
    -webkit-hyphens: \${hyphenate ? "auto" : "manual"};
    hyphens: \${hyphenate ? "auto" : "manual"};
    -webkit-hyphenate-limit-before: 3;
    -webkit-hyphenate-limit-after: 2;
    -webkit-hyphenate-limit-lines: 2;
    hanging-punctuation: allow-end last;
    widows: 2;
}
/* prevent the above from overriding the align attribute */
[align="left"] { text-align: left; }
[align="right"] { text-align: right; }
[align="center"] { text-align: center; }
[align="justify"] { text-align: justify; }

pre {
    white-space: pre-wrap !important;
}
aside[epub|type~="endnote"],
aside[epub|type~="footnote"],
aside[epub|type~="note"],
aside[epub|type~="rearnote"] {
    display: none;
}
\`;
    /**
     *
     * @param {Blob} file
     * @returns {boolean}
     */
    const isZip = async (file) => {
      const arr = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      return (
        arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04
      );
    };
    const isPDF = async (file) => {
      const arr = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      return (
        arr[0] === 0x25 &&
        arr[1] === 0x50 &&
        arr[2] === 0x44 &&
        arr[3] === 0x46 &&
        arr[4] === 0x2d
      );
    };
    const isCBZ = ({ name, type }) =>
      type === "application/vnd.comicbook+zip" || name.endsWith(".cbz");
    const isFB2 = ({ name, type }) =>
      type === "application/x-fictionbook+xml" || name.endsWith(".fb2");
    const isFBZ = ({ name, type }) =>
      type === "application/x-zip-compressed-fb2" ||
      name.endsWith(".fb2.zip") ||
      name.endsWith(".fbz");
    const getView = async (file) => {
      if (!file.size) {
        toReactMessage({
          type: "onDisplayError",
          reason: "book-error-not-found",
        });
        debug("GETVIEW ERROR not founds");
        return;
      }
      let book;
      if (await isZip(file)) {
        const loader = await makeZipLoader(file);
        if (isCBZ(file)) {
          debug("[GETVIEW] Making cbz");
          book = makeComicBook(loader, file);
        } else if (isFBZ(file)) {
          debug("[GETVIEW] Making fbz");
          const { entries } = loader;
          const entry = entries.find((entry) =>
            entry.filename.endsWith(".fb2"),
          );
          const blob = await loader.loadBlob((entry ?? entries[0]).filename);
          book = await makeFB2(blob);
        } else {
          debug("[GETVIEW] Making epub");
          book = await new EPUB(loader).init();
        }
      } else if (await isPDF(file)) {
        book = await makePDF(file);
      } else {
        if (await isMOBI(file)) {
          debug("[GETVIEW] Making mobi");
          book = await new MOBI({
            unzlib: _,
          }).open(file);
          debug("[GETVIEW] DONE MAKING MOBI");
        } else if (isFB2(file)) {
          debug("[GETVIEW] Making fb2");
          book = await makeFB2(file);
        }
      }
      if (!book) {
        toReactMessage({
          type: "onDisplayError",
          reason: "unsupported-type",
        });
        debug("GETVIEW ERROR");
        return;
      }
      const view = document.createElement("foliate-view");
      await view.open(book);
      document.body.append(view);
      return view;
    };
    class Reader {
      #tocMap;
      #currentTocPos;
      #isPdf;
      style = {
        lineHeight: 1.4,
        justify: true,
        hyphenate: true,
      };
      constructor(path, bookLocation) {
        this.path = path;
        this.initalLocation = bookLocation;
        this.currentLocation = undefined;
        if (path) {
          this.getBookBlob(path).catch((error) => {
            var err = new Error("Cannot load book at " + path);
            debug(\`[READER] ERROR \${JSON.stringify(err)} or \${error}\`);
          });
        }
        this.#tocMap = new Map();
        debug("[READER] CONSTRUCTED");
      }
      getBookBlob = (input) => {
        var opening;
        opening = request(input, "binary").then(this.openEpub.bind(this));
        return opening;
      };

      /**
       * Open an archived epub
       * @private
       * @param  {binary} data
       * @param  {string} [encoding]
       * @return {Promise}
       */
      openEpub = (data, encoding) => {
        var blobData = new Blob([data]);
        var file = new File([blobData], this.path);
        this.open(file);
      };
      open = async (file) => {
        try {
          this.#isPdf = await isPDF(file);
          this.view = await getView(file);
          this.view.addEventListener("relocate", this.onRelocate);
          if (!this.#isPdf) {
            this.view.renderer.addEventListener("next", this.showNext, {
              passive: false,
            });
            this.view.renderer.addEventListener("previous", this.showPrevious, {
              passive: false,
            });
          }
          const { book } = this.view;
          const toc = book.toc;
          let count = 0;
          toc?.flatMap((item, i) => {
            if (item.subitems?.length > 0) {
              return item.subitems.map((subitem) => {
                this.#tocMap.set(count, {
                  label: subitem?.label,
                  id: subitem?.id,
                });
                count += 1;
              });
            } else {
              this.#tocMap.set(count, {
                label: item?.label,
                id: item?.id,
              });
              count += 1;
            }
          });
          if (!this.#isPdf) {
            this.initalLocation
              ? await this.view.goTo(this.initalLocation)
              : this.view.renderer.next();
          } else this.view.renderer.next();
          toReactMessage({
            type: "onReady",
            book,
          });
        } catch (err) {
          debug("[READER_OPEN_ERROR] " + err);
          toReactMessage({
            type: "onDisplayError",
            reason: "book-error-failed-to-open",
          });
        }
      };
      showNext = (ev) => {
        /**
         * TODO instead of rendering a component in react do it here.
         */
        const nextLabel = ev.detail.show
          ? this.#tocMap.get(this.#currentTocPos?.id + 1)?.label
          : null;
        toReactMessage({
          type: "showNext",
          show: ev.detail.show,
          label: nextLabel,
        });
      };
      showPrevious = (ev) => {
        const prevLabel = ev.detail.show
          ? this.#tocMap.get(this.#currentTocPos?.id - 1)?.label
          : null;
        toReactMessage({
          type: "showPrevious",
          show: ev.detail.show,
          label: prevLabel,
        });
      };
      onRelocate = (e) => {
        const { fraction, location, tocItem, pageItem } = e.detail;
        this.#currentTocPos = {
          id: tocItem?.id,
          label: tocItem?.label,
        };
        toReactMessage({
          type: "onLocationChange",
          fraction,
          location,
          tocItem,
          pageItem,
        });
      };
      next = () => {
        this.view?.renderer?.next();
      };
      prev = () => {
        this.view?.renderer?.prev();
      };
      setTheme = ({ style, layout }) => {
        Object.assign(this.style, style);
        const { theme } = style;
        const \$style = document.documentElement.style;
        \$style.setProperty("--bg", theme.bg);
        \$style.setProperty("--fg", theme.fg);
        const renderer = this.view?.renderer;
        if (renderer) {
          renderer.setAttribute("flow", layout.flow ? "scrolled" : "paginated");
          renderer.setAttribute("gap", layout.gap * 100 + "%");
          renderer.setAttribute("max-inline-size", layout.maxInlineSize + "px");
          renderer.setAttribute("max-block-size", layout.maxBlockSize + "px");
          renderer.setAttribute("max-column-count", layout.maxColumnCount);
          renderer.setStyles?.(getCSS(this.style));
        }
      };
      async getCover() {
        try {
          const blob = await this.book.getCover?.();
          return blob ? blobToBase64(blob) : null;
        } catch (e) {
          console.warn(e);
          console.warn("Failed to load cover");
          return null;
        }
      }
    }
    /* harmony default export */ const main = Reader;

    /**
     * use epubjs request function
     * check if it works with ios
     * import it with fileuri like react-native-epub
     * make scrolling continous view
     */

    /**
     * Paginator
     * adjacentIndex
     * - make timer that says you cant turn the page within 100 milliseconds ?
     * -
     */
    __webpack_exports__ = __webpack_exports__["default"];
    /******/ return __webpack_exports__;
    /******/
  })();
});
//# sourceMappingURL=foliate.js.map
`;
