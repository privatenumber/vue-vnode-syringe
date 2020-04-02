const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

const { hasOwnProperty } = Object.prototype;
const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

function move(res, hash, key, preserve) {
	if (!hash || !hasOwn(hash, key)) {
		return false;
	}
	res[key] = hash[key];
	if (!preserve) {
		delete hash[key];
	}
	return true;
}

// From https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/helpers/extract-props.js#L52
function checkProp(
	res,
	hash,
	key,
	altKey,
	preserve,
) {
	if (!hash) { return false; }
	return move(res, hash, key, preserve) || move(res, hash, altKey, preserve);
}

// From https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/helpers/extract-props.js#L12
export function extractPropsFromVNodeData(attrs, Ctor) {
	const propOptions = Ctor.options.props;
	if (!propOptions) {
		return;
	}
	const res = {};
	for (const key in propOptions) {
		const altKey = hyphenate(key);
		checkProp(res, attrs, key, altKey, false);
	}
	return res;
}

export const { assign } = Object;
