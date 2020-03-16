(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.VnodeSyringe = factory());
}(this, (function () { 'use strict';

	var hyphenateRE = /\B([A-Z])/g;

	var hyphenate = function hyphenate(str) {
	  return str.replace(hyphenateRE, '-$1').toLowerCase();
	};

	var isUndef = function isUndef(v) {
	  return v === undefined || v === null;
	};

	var isDef = function isDef(v) {
	  return v !== undefined && v !== null;
	};

	var hasOwnProperty = Object.prototype.hasOwnProperty;

	var hasOwn = function hasOwn(obj, key) {
	  return hasOwnProperty.call(obj, key);
	};

	function checkProp(res, hash, key, altKey, preserve) {
	  if (isDef(hash)) {
	    if (hasOwn(hash, key)) {
	      res[key] = hash[key];

	      if (!preserve) {
	        delete hash[key];
	      }

	      return true;
	    }

	    if (hasOwn(hash, altKey)) {
	      res[key] = hash[altKey];

	      if (!preserve) {
	        delete hash[altKey];
	      }

	      return true;
	    }
	  }

	  return false;
	}

	function extractPropsFromVNodeData(data, Ctor) {
	  var propOptions = Ctor.options.props;

	  if (isUndef(propOptions)) {
	    return;
	  }

	  var res = {};
	  var attrs = data.attrs,
	      _data$props = data.props,
	      props = _data$props === void 0 ? {} : _data$props;

	  if (isDef(attrs) || isDef(props)) {
	    for (var key in propOptions) {
	      var altKey = hyphenate(key);
	      checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false);
	    }
	  }

	  return res;
	}
	var isEmpty = function isEmpty(obj) {
	  for (var k in obj) {
	    return false;
	  }

	  return true;
	};
	var assign = Object.assign;

	var vnodeSyringe = {
	  functional: true,
	  render: function render(h, ctx) {
	    if (!ctx.children) {
	      return undefined;
	    }

	    var clonedNativeOn = assign({}, ctx.data.nativeOn);
	    var clonedOn = assign({}, ctx.data.on);
	    var clonedAttrs = assign({}, ctx.data.attrs);

	    if (isEmpty(clonedOn) && isEmpty(clonedAttrs) && isEmpty(clonedNativeOn)) {
	      return ctx.children;
	    }

	    return ctx.children.map(function (c) {
	      var attrs = assign({}, clonedAttrs);
	      var on = assign({}, clonedOn);

	      if (c.componentOptions) {
	        // Optimize props
	        var props = extractPropsFromVNodeData({
	          attrs: attrs
	        }, c.componentOptions.Ctor);

	        if (Object.keys(props).length) {
	          c.componentOptions.propsData = assign(c.componentOptions.propsData || {}, props);
	        }

	        c.componentOptions.listeners = assign(c.componentOptions.listeners || {}, on);
	        on = assign({}, clonedNativeOn);
	      }

	      if (!c.data) {
	        c.data = {};
	      }

	      if (attrs) {
	        c.data.attrs = assign(c.data.attrs || {}, attrs);
	      }

	      if (on) {
	        c.data.on = assign(c.data.on || {}, on);
	      }

	      return c;
	    });
	  }
	};

	return vnodeSyringe;

})));
