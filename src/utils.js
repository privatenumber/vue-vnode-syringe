const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

const isUndef = (v) => v === undefined || v === null;
const isDef = (v) => v !== undefined && v !== null;

const { hasOwnProperty } = Object.prototype;
const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

// From https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/helpers/extract-props.js#L52
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

// From https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/helpers/extract-props.js#L12
export function extractPropsFromVNodeData(attrs, Ctor) {
	const propOptions = Ctor.options.props;
	if (isUndef(propOptions)) {
		return;
	}
	const res = {};
	const props = {};
	for (const key in propOptions) {
		const altKey = hyphenate(key);
		checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false);
	}
	return res;
}

export const isEmpty = (obj) => {
	for (const k in obj) {
		return false;
	}
	return true;
};

export const { assign } = Object;
