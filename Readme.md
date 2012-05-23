# Overview

El is a module based on the [laconic ](https://github.com/joestelmach/laconic) project.
This module exports a single function that will create DOM elements.

The following changes have been introduced to the original laconic project:

- Refactor so that source passes jslint.
- Refactor so that source adheres to JavaScript strict mode.
- Refactor so that source can be compiled using the Closure Compiler.
- Change the name of the project and exported module to 'el'.
- Add support for adding extra text child elements via string/number arguments.
- Remove the `registerElement` method.
- Changed how event handlers are handled.

# Support

The following browsers are supported (more will be added as testing insues):

- Chrome
- FireFox
- IE 7/8/9/10

# Build Products

This project contains several modules that get built into the 'build' directory.

**src/xport** - The xport module that exports a function used to export symbols for the Closure Compiler (< 1Kb when compiled).

- build/xport.js
- build/xport.min.js

**src/el** - The el module that exports the el API. Depends on the xport module.

- build/el.js
- build/el.min.js
- build/el-complete.js (contains xport module)
- build/el-complete.min.js (contains compiled xport module)

# API

	EL(elementName, ...)
	EL(elementName, attributes, ...)

Variadic arguments can either be DOM elements, strings, numbers, objects or an array with these kinds of elements. If a DOM element is specified then it will be appended
to the element being created. Otherwise if a string or a number is specified then a child `TEXT` element will be appended
to the element being created. Otherwise if an object is specified then it will be converted to a string via its custom `toString` method
and a new child `TEXT` element will be appended to the element being created.

All elements created with this function will have the following methods defined:

	appendTo(parentElement)
	addEventListener(eventType, handler, useCapture)
	removeEventListener(eventType, handler)

`appendTo` returns the element being appended and the event related methods are wrappers that will either call `attachEvent`, `detatchEvent` respectively
or will assign and unassign an event property directly. If the event methods already exist then they will not be overridden.

	EL('p',
		'-->',
		EL.a({
			title: 'Google',
			href: 'http://www.google.com/'
		}, 'Google'),
		'<--'
	).appendTo(document.body);

Results in the following elements being added to the document body:

	<p>--><a href="http://www.google.com/">Google</a><--</p>


This example could have been created using an array of children like this as well:

	var children = [
		'-->',
		EL.a({
			title: 'Google',
			href: 'http://www.google.com/'
		}, 'Google'),
		'<--'
	];
	EL.p(children).appendTo(document.body);

---

For convenience all elements have a shorthand function for creation. For example:

	EL.a({
		id: 'myLink',
		href: 'http://google.com/',
		onclick: function (event) {
			console.log('clicked');
			event.preventDefault();
		}
	}, 'Google').appendTo(document.body);

All `event` objects are guaranteed to have a `preventDefault` method defined. The context for an event handler is an object with the follwing properties:

	{
		el: The element the handler was added to,
		handler: The actually event handler that was added as the event listener. This is the wrapper that wraps the custom handler.
	}

To remove the handler from the element you must do the following:

	EL.a({
		id: 'myLink',
		href: 'http://google.com/',
		onclick: function (event) {
			console.log('clicked');
			event.preventDefault();
			// Removes the handler as a listener.
			this.el.removeEventListener('click', this.handler);
		}
	}, 'Google').appendTo(document.body);

# Exports

When this module is loaded in an HTML page without a module system then the module will export a function with the name `EL` on `window`.

When this module is loaded using an AMD or CommonJS module loader then the module will export an object: `{el: fn}`.