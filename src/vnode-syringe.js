
const isEmpty = object => {
	// eslint-disable-next-line no-unreachable-loop
	for (const key in object) {
		return false;
	}

	return true;
};

const mergeStatic = (data, name) => {
	const staticProp = 'static' + name[0].toUpperCase() + name.slice(1);
	if (!data[name] && !data[staticProp]) {
		return;
	}

	data[name] = [data[staticProp], data[name]].filter(Boolean).flat(Infinity);
	if (data[name].length === 0) {
		data[name] = undefined;
	}
	delete data[staticProp];
};

const {hasOwnProperty} = Object.prototype;

function merge(dest, src) {
	for (const key in src) {
		if (src[key]) {
			const {value, modifier} = src[key];
			const destValue = dest[key];
			if (
				destValue === undefined
				|| destValue === null
				|| modifier === OVERWRITE
			) {
				dest[key] = value;
			} else if (modifier === MERGE) {
				if (Array.isArray(destValue)) {
					if (Array.isArray(value)) {
						destValue.push(...value);
					} else {
						destValue.push(value);
					}
				}else if (typeof destValue === 'object' && typeof value === 'object') {
					Object.assign(destValue, value);
				}else if (typeof destValue === 'function' && typeof value === 'function') {
					dest[key] = function () {
						Reflect.apply(destValue, this, arguments);
						Reflect.apply(value, this, arguments);
					};
				} else {
					dest[key] += value;
				}
			}
		}
	}

	return dest;
}

const hyphenateRE = /\B([A-Z])/g;
const hyphenate = string => string.replace(hyphenateRE, '-$1').toLowerCase();

const camelizeRE = /-(\w)/g;
const camelize = string => string.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');

function findProp(attrs, prop) {
	if (hasOwnProperty.call(attrs, prop)) {
		return prop;
	}

	const kebab = hyphenate(prop);
	if (hasOwnProperty.call(attrs, kebab)) {
		return kebab;
	}

	return false;
}

function getPropsData(componentOptions, attrs) {
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

const FALLBACK = 0;
const OVERWRITE = 1;
const MERGE = 2;

const modifiers = {
	'!': OVERWRITE,
	'&': MERGE,
};

function parseModifiers(object) {
	const normalized = {};
	for (let key in object) {
		const value = object[key];
		let modifier = modifiers[key.slice(-1)];
		if (modifier) {
			key = key.slice(0, -1);
		} else {
			modifier = FALLBACK;
		}

		normalized[key] = {value, modifier};
	}

	return normalized;
}

const getStyle = (name, attrs, data) => {
	const val = attrs[name];
	if (val) {
		delete attrs[name];
		return val;
	}

	const staticProp = 'static' + name[0].toUpperCase() + name.slice(1);
	const value = [data[staticProp], data[name]].filter(Boolean).flat(Infinity);

	if (!value.length) {
		return undefined;
	}

	return {
		value,
		modifier: FALLBACK,
	};
};

const vnodeSyringe = {
	functional: true,
	render(h, {children, data}) {
		if (!children || isEmpty(data)) {
			return children;
		}

		const attrs = parseModifiers(data.attrs);
		const on = parseModifiers(data.on);
		const nativeOn = parseModifiers(data.nativeOn);
		const _class = getStyle('class', attrs, data);
		const style = getStyle('style', attrs, data);

		if (style && typeof style.value === 'string') {
			style.value = Object.fromEntries(style.value.split(';').filter(Boolean).map(pair => {
				const [key, value] = pair.split(':');
				return [camelize(key.trim()), value.trim()];
			}));
		}

		return children.map(vnode => {
			if (vnode.tag) {
				if (!vnode.data) {
					vnode.data = {};
				}

				const {
					data: vnodeData,
					componentOptions,
				} = vnode;

				// If component
				if (componentOptions) {
					const propsData = getPropsData(componentOptions, attrs);
					merge(componentOptions.propsData, propsData);
					componentOptions.listeners = merge(componentOptions.listeners || {}, on);

					vnodeData.nativeOn = merge(vnodeData.nativeOn || {}, nativeOn);
					vnodeData.on = vnodeData.nativeOn;
				} else {
					vnodeData.on = merge(vnodeData.on || {}, on);
				}

				vnodeData.attrs = merge(vnodeData.attrs || {}, attrs);

				mergeStatic(vnodeData, 'class');
				mergeStatic(vnodeData, 'style');
				merge(vnodeData, {
					class: _class,
					style,
				});
			}

			return vnode;
		});
	},
};

export default vnodeSyringe;
