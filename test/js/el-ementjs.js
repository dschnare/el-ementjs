/**
 * @preserve Module: el-ementjs
 * Author: Darren Schnare
 * Keywords: javascript,DOM,element,generation,create,manipulation
 * Based On: https://github.com/joestelmach/laconic
 * License: MIT ( http://www.opensource.org/licenses/mit-license.php )
 * Repo: https://github.com/dschnare/el-ementjs
 */
/*global 'XPORT' */
/*jslint browser: true, sub: true */
(function (xport) {
	'use strict';

	// properly-cased attribute names for IE setAttribute support
	var attributeMap = {
			'acceptcharset': 'acceptCharset',
			'accesskey': 'accessKey',
			'allowtransparency': 'allowTransparency',
			'bgcolor': 'bgColor',
			'cellpadding': 'cellPadding',
			'cellspacing': 'cellSpacing',
			'class': 'className',
			'classname': 'className',
			'colspan': 'colSpan',
			'csstext': 'style',
			'defaultchecked': 'defaultChecked',
			'defaultselected': 'defaultSelected',
			'defaultvalue': 'defaultValue',
			'for': 'htmlFor',
			'frameborder': 'frameBorder',
			'hspace': 'hSpace',
			'htmlfor': 'htmlFor',
			'longdesc': 'longDesc',
			'maxlength': 'maxLength',
			'marginwidth': 'marginWidth',
			'marginheight': 'marginHeight',
			'noresize': 'noResize',
			'noshade': 'noShade',
			'readonly': 'readOnly',
			'rowspan': 'rowSpan',
			'tabindex': 'tabIndex',
			'valign': 'vAlign',
			'vspace': 'vSpace'
		},
		// html 4 tags
		deprecatedTags = ['acronym', 'applet', 'basefont', 'big', 'center', 'dir',
			'font', 'frame', 'frameset', 'noframes', 'strike', 'tt', 'u', 'xmp'],
		// html 5 tags
		tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b',
			'base', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption',
			'cite', 'code', 'col', 'colgroup', 'command', 'datalist', 'dd', 'del',
			'details', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
			'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5',
			'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img',
			'input', 'ins', 'keygen', 'kbd', 'label', 'legend', 'li', 'link', 'map',
			'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol',
			'optgroup', 'option', 'output', 'p', 'param', 'pre', 'progress', 'q', 'rp',
			'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small',
			'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table',
			'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
			'ul', 'var', 'video', 'wbr'].concat(deprecatedTags),


		// The laconic function serves as a generic method for generating
		// DOM content, and also as a placeholder for helper functions.
		//
		// The first parameter MUST be a string specifying the element's
		// tag name.
		//
		// An optional object of element attributs may follow directly
		// after the tag name.
		//
		// Additional arguments will be considered children of the new
		// element and may consist of elements, strings, or numbers.
		//
		// for example:
		// laconic('div', {'class' : 'foo'}, 'bar');
		makeElement = (function () {
			var doc = document,
				nativeToString = ({}).toString;

			function create(o) {
				function F() {}
				F.prototype = o;
				return new F();
			}

			function makeEventHandler(handler, thisObj) {
				return function (event) {
					var returnValue = true,
						nativeEvent = event || window.event;

					event = create(event);

					if (typeof event.preventDefault === 'function') {
						event["preventDefault"] = function () {
							nativeEvent["preventDefault"]();
							returnValue = false;
						};
					} else {
						event["preventDefault"] = function () {
							event["returnValue"] = false;
							returnValue = false;
						};
					}

					handler.call(thisObj, event);

					return returnValue;
				};
			}

			function parseAttributes(el, attributes) {
				var attributeName,
					attributeValue,
					isEventAttribute,
					ctx;

				for (attributeName in attributes) {
					if (attributes.hasOwnProperty(attributeName)) {
						attributeValue = attributes[attributeName];

						if (attributeValue !== null && attributeValue !== undefined) {
							attributeName = attributeName.toLowerCase();
							attributeName = attributeMap[attributeName] || attributeName;

							// If the attributeName represents an event (onclick, onchange, etc)
							// we'll set the href to '#' if none is given, and we'll apply
							// the attribute directly to the element for IE7 support.
							isEventAttribute = attributeName.substr(0, 2) === 'on';

							if (isEventAttribute) {
								if (attributes.href === undefined && attributeName === 'onclick') {
									el.setAttribute('href', '#');
								}

								ctx = {"el": el};
								attributeValue = makeEventHandler(attributeValue, ctx);
								ctx["handler"] = attributeValue;
								// Rely on our wrapper method to take of adding an event handler (if necessary).
								el.addEventListener(attributeName.substring(2), attributeValue, false);
							// If we're setting the style attribute, we may need to
							// use the cssText property.
							} else if (attributeName === 'style' && el.style.setAttribute) {
								el.style.setAttribute('cssText', attributeValue);
							// If we're setting an attribute that's not properly supported
							// by IE7's setAttribute implementation, then we apply the
							// attribute directly to the element
							} else if (attributeName === 'className' || attributeName === 'htmlFor') {
								el[attributeName] = attributeValue;
							// Otherwise, we use the standard setAttribute.
							} else {
								el.setAttribute(attributeName, attributeValue);
							}
						}
					}
				}
			}

			function parseChildren(el, children) {
				var i, len = children.length, child;

				for (i = 0; i < len; i += 1) {
					child = children[i];

					if (child) {
						// Encountered a string or number.
						if (typeof child === 'string' ||
								typeof child === 'number') {
							el.appendChild(doc.createTextNode(child.toString()));
						// Element.
						} else if (child.nodeType === 1) {
							el.appendChild(child);
						// Otherwise we convert the child to a string.
						} else {
							el.appendChild(doc.createTextNode(child.toString()));
						}
					}
				}
			}

			function getArgType(arg) {
				if (arg === undefined || arg === null) {
					return 'undefined';
				}

				if (arg.nodeType === 1) {
					return 'element';
				}

				if (typeof arg === 'string') {
					return 'string';
				}

				if (typeof arg === 'number') {
					return 'number';
				}

				if (Object.prototype.toString.call(arg) === '[object Array]') {
					return 'array';
				}

				return 'object';
			}

			// Decorate element with missing/added methods.
			function decorateElement(el) {
				// Add an appendTo method to the newly created element, which will allow
				// the DOM insertion to be method chained to the creation.  For example:
				// $el.div('foo').appendTo(document.body);
				el["appendTo"] = function (parentNode) {
					if (parentNode.nodeType === 1 && this.nodeType === 1) {
						parentNode.appendChild(this);
					}
					return el;
				};

				// Ensure that the element has a familiar event API.
				if (typeof el["attatchEvent"] === 'function') {
					el["addEventListener"] = function (type, handler) {
						el.attachEvent(type, handler);
					};
					el["removeEventListener"] = function (type, handler) {
						el.detatchEvent(type, handler);
					};
				} else if (typeof el["addEventListener"] !== 'function') {
					el["addEventListener"] = function (type, handler) {
						el['on' + type] = handler;
					};
					el["removeEventListener"] = function (type, handler) {
						el['on' + type] = undefined;
					};
				}
			}

			return function (elementName, attributes) {
				// create a new element of the requested type
				var el = doc.createElement(elementName),
					i = 1,
					len = arguments.length,
					arg,
					type;

				decorateElement(el);

				if (attributes &&
						typeof attributes === 'object' &&
						attributes.nodeType === undefined &&
						attributes.toString === nativeToString) {

					parseAttributes(el, attributes);
					// Be sure to offset our index to skip the attributes.
					i = 2;
				}

				// walk through the rest of the arguments
				while (i < len) {
					arg = arguments[i];
					type = getArgType(arg);

					switch (type) {
					case 'element':
						el.appendChild(arg);
						break;
					case 'string':
					case 'number':
					case 'object':
						el.appendChild(doc.createTextNode(arg.toString()));
						break;
					case 'array':
						parseChildren(el, arg);
						break;
					}

					// Increment.
					i += 1;
				}

				return el;
			};
		}());

	(function () {
		function makeApply(tagName) {
			return function () {
				var args = [tagName];
				args = args.concat(Array.prototype.slice.call(arguments));
				return makeElement.apply(this, args);
			};
		}

		var i, len = tags.length, tag;

		for (i = 0; i < len; i += 1) {
			tag = tags[i];
			makeElement[tag] = makeApply(tag);
		}
	}());

	// We don't export the 'makeElement' function directly
	// when using a module system because the CommonJS spec
	// does not support assigning directly to the 'exports'
	// object. So we must export an object with a property
	// that	will be exported to the 'exports' object.
	// Of cours using AMD we don't have this problem.
	xport.module({
		"el": makeElement
	}, function () {
		xport('EL', makeElement);
	});
}(window['XPORT']));