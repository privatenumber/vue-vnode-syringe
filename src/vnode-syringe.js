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
	const { attrs, props } = data;
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

export default {
	functional: true,
	render(h, ctx) {
		if (!ctx.children) { return undefined; }

		const clonedNativeOn = { ...ctx.data.nativeOn };
		const clonedOn = { ...ctx.data.on };
		const clonedAttrs = { ...ctx.data.attrs };

		if (!(
			Object.keys(clonedOn).length
			|| Object.keys(clonedAttrs).length
			|| Object.keys(clonedNativeOn).length
		)) {
			return ctx.children;
		}

		return ctx.children.map((c) => {
			const attrs = { ...clonedAttrs };
			let on = { ...clonedOn };

			if (c.componentOptions) {
				const props = extractPropsFromVNodeData({ attrs, props: {} }, c.componentOptions.Ctor);

				if (Object.keys(props).length) {
					c.componentOptions.propsData = Object.assign(c.componentOptions.propsData || {}, props);
				}

				c.componentOptions.listeners = Object.assign(c.componentOptions.listeners || {}, on);
				on = { ...clonedNativeOn };
			}

			if (!c.data) {
				c.data = {};
			}

			if (attrs) {
				c.data.attrs = Object.assign(c.data.attrs || {}, attrs);
			}

			if (on) {
				c.data.on = Object.assign(c.data.on || {}, on);
			}

			return h({ render: () => c });
		});
	},
};
