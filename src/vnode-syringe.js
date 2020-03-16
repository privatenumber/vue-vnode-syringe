const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

const isUndef = (v) => v === undefined || v === null;
const isDef = (v) => v !== undefined && v !== null;

const { hasOwnProperty } = Object.prototype;
const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

function extractPropsFromVNodeData(data, Ctor) {
	const propOptions = Ctor.options.props;
	if (isUndef(propOptions)) {
		return;
	}
	const res = {};
	const { attrs, props = {} } = data;
	if (isDef(attrs) || isDef(props)) {
		for (const key in propOptions) {
			const altKey = hyphenate(key);
			checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false);
		}
	}
	return res;
}

function checkProp(
	res,
	hash,
	key,
	altKey,
	preserve,
) {
	if (isDef(hash)) {
		if (hasOwn(hash, key)) {
			res[key] = hash[key];
			if (!preserve) {
				delete hash[key];
			}
			return true;
		} if (hasOwn(hash, altKey)) {
			res[key] = hash[altKey];
			if (!preserve) {
				delete hash[altKey];
			}
			return true;
		}
	}
	return false;
}
const isEmpty = obj => {
    for (var k in obj) {
        return false
    }
    return true;
};

const { assign } = Object;

export default {
	functional: true,
	render(h, ctx) {
		if (!ctx.children) { return undefined; }

		const clonedNativeOn = assign({}, ctx.data.nativeOn);
		const clonedOn = assign({}, ctx.data.on);
		const clonedAttrs = assign({}, ctx.data.attrs);

		if (
			isEmpty(clonedOn)
			&& isEmpty(clonedAttrs)
			&& isEmpty(clonedNativeOn)
		) {
			return ctx.children;
		}

		return ctx.children.map((c) => {
			const attrs = assign({}, clonedAttrs);
			let on = assign({}, clonedOn);

			if (c.componentOptions) {
				// Optimize props
				const props = extractPropsFromVNodeData({ attrs }, c.componentOptions.Ctor);

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
	},
};
