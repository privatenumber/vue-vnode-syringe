const FALLBACK = 0;
const OVERWRITE = 1;
const MERGE = 2;
const MODIFIERS = {
	'!': OVERWRITE,
	'&': MERGE,
};

const hyphenateRE = /\B([A-Z])/g;
const camelizeRE = /-(\w)/g;

function hyphenate(string) {
	return string.replace(hyphenateRE, '-$1').toLowerCase();
}

function camelize(string) {
	return string.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');
}

export function isEmpty(object) {
	// eslint-disable-next-line no-unreachable-loop
	for (const key in object) {
		return false;
	}

	return true;
}

function merge(dest, src) {
	if (Array.isArray(dest)) {
		if (Array.isArray(src)) {
			dest.push(...src);
		} else {
			dest.push(src);
		}

		return dest;
	}

	if (typeof dest === 'object' && typeof src === 'object') {
		return Object.assign(dest, src);
	}

	if (typeof dest === 'function' && typeof src === 'function') {
		return function () {
			Reflect.apply(dest, this, arguments);
			Reflect.apply(src, this, arguments);
		};
	}

	return dest + src;
}

export function set(dest, key, valueData) {
	if (!valueData) {
		return;
	}

	const {value, modifier} = valueData;
	const destValue = dest[key];
	if (
		destValue === undefined ||
		destValue === null ||
		modifier === OVERWRITE
	) {
		dest[key] = value;
	} else if (modifier === MERGE) {
		dest[key] = merge(destValue, value);
	}
}

export function assign(destObject, property, src) {
	if (!destObject[property]) {
		destObject[property] = {};
	}

	const dest = destObject[property];

	for (const key in src) {
		set(dest, key, src[key]);
	}
}

const findIndex = (array, predicate) => {
	// eslint-disable-next-line unicorn/no-for-loop
	for (let i = 0; i < array.length; i++) {
		if (predicate(array[i])) {
			return i;
		}
	}

	return -1;
};

export function assignDirectives(vnodeData, directives) {
	if (!vnodeData.directives) {
		vnodeData.directives = [];
	}

	const {directives: vnodeDirectives} = vnodeData;
	directives.forEach(({value, modifier}) => {
		const existsIdx = findIndex(vnodeDirectives, d => d.name === value.name);

		if (existsIdx === -1) {
			vnodeDirectives.push(value);
		} else if (modifier === OVERWRITE) {
			vnodeDirectives.splice(existsIdx, 1, value);
		} else if (modifier === MERGE) {
			vnodeDirectives[existsIdx].value = merge(vnodeDirectives[existsIdx].value, value.value);
		}
	});
}

function findProp(attrs, prop) {
	if (prop in attrs) {
		return prop;
	}

	const kebab = hyphenate(prop);
	if (kebab in attrs) {
		return kebab;
	}

	return false;
}

export function getPropsData(componentOptions, attrs) {
	const {props} = componentOptions.Ctor.options;
	const propsData = {};

	if (props) {
		// Iterate over props to find attrs that are props
		// By iterating over props instead of attrs, we can leverage Vue's camelization
		for (const prop in props) {
			const isProp = findProp(attrs, prop);
			if (isProp) {
				propsData[prop] = attrs[isProp];
				delete attrs[isProp];
			}
		}
	}

	return propsData;
}

const getDirectiveModifier = modifiers => {
	for (const modifier in modifiers) {
		const hasModifier = MODIFIERS[modifier];
		if (hasModifier) {
			delete modifiers[modifier];
			return hasModifier;
		}
	}

	return FALLBACK;
};

export function parseDirectives(directives) {
	if (directives) {
		return directives.map(value => ({
			value,
			modifier: getDirectiveModifier(value.modifiers),
		}));
	}
}

export function parseModifiers(object) {
	const normalized = {};
	for (let key in object) {
		const value = object[key];
		let modifier = MODIFIERS[key.slice(-1)];
		if (modifier) {
			key = key.slice(0, -1);
		} else {
			modifier = FALLBACK;
		}

		normalized[key] = {value, modifier};
	}

	return normalized;
}

export function getStaticPair(object, name) {
	const staticProp = camelize('static-' + name);
	const pair = [object[staticProp], object[name]].filter(Boolean).flat(Infinity);
	if (pair.length === 0) {
		return undefined;
	}

	delete object[staticProp];
	return pair;
}

export function getAndRemoveAttr(attrs, attrName) {
	const value = attrs[attrName];
	if (value) {
		delete attrs[attrName];
		return value;
	}
}

export function createFallback(value) {
	return value && {
		value,
		modifier: FALLBACK,
	};
}

export function parseStyles(styleString) {
	return Object.fromEntries(
		styleString
			.split(';')
			.map(pair => {
				const [property, value] = pair.split(':');
				return (property && value) && [camelize(property.trim()), value.trim()];
			})
			.filter(Boolean),
	);
}

let VNode;
export function cloneVNode(vnode) {
	if (!VNode) {
		VNode = Object.getPrototypeOf(vnode).constructor;
	}

	const clonedVNode = new VNode();
	Object.assign(clonedVNode, vnode);

	if (clonedVNode.componentOptions) {
		clonedVNode.componentOptions = Object.assign({}, clonedVNode.componentOptions);
		clonedVNode.componentOptions.propsData = Object.assign({}, clonedVNode.componentOptions.propsData);
	}

	return clonedVNode;
}
