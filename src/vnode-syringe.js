const hyphenateRE = /\B([A-Z])/g;
const hyphenate = string => string.replace(hyphenateRE, '-$1').toLowerCase();

const camelizeRE = /-(\w)/g;
const camelize = string => string.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '');

const isEmpty = object => {
	// eslint-disable-next-line no-unreachable-loop
	for (const key in object) {
		return false;
	}

	return true;
};

const isNil = value => value === undefined || value === null;

const mergeStatic = (data, name) => {
	const staticProp = 'static' + name[0].toUpperCase() + name.slice(1);
	if (!data[name] && !data[staticProp]) {
		return;
	}

	data[name] = [data[staticProp], data[name]].filter(Boolean).flat(Infinity);
	delete data[staticProp];
};

const {hasOwnProperty} = Object.prototype;

function merge(dest, src) {
	for (const key in src) {
		const destValue = dest[key];
		const {value, modifier} = src[key];
		if (isNil(destValue) || modifier === OVERWRITE) {
			dest[key] = value;
		} else if (modifier === MERGE) {
			if (Array.isArray(destValue)) {
				if (Array.isArray(value)) {
					destValue.push(...value);
				} else {
					destValue.push(value);
				}

				continue;
			}

			if (typeof destValue === 'object' && typeof value === 'object') {
				Object.assign(destValue, value);
				continue;
			}

			if (typeof destValue === 'function' && typeof value === 'function') {
				dest[key] = function () {
					Reflect.apply(destValue, this, arguments);
					Reflect.apply(value, this, arguments);
				};

				continue;
			}

			dest[key] += value;
		}
	}

	return dest;
}

function findProp(propDefs, attr) {
	if (hasOwnProperty.call(propDefs, attr)) {
		return attr;
	}

	const kebab = hyphenate(attr);
	if (hasOwnProperty.call(propDefs, kebab)) {
		return kebab;
	}

	const camel = camelize(attr);
	if (hasOwnProperty.call(propDefs, camel)) {
		return camel;
	}

	return false;
}

function getPropsData(componentOptions, attrs) {
	const {props} = componentOptions.Ctor.options;
	const propsData = {};

	// Iterate over given attrs
	for (const attr in attrs) {
		// Check if the attr is a prop
		const isProp = findProp(props, attr);
		if (isProp) {
			propsData[isProp] = attrs[attr];
			delete attrs[attr];
		}
	}

	return propsData;
}

const FALLBACK = 'FALLBACK';
const OVERWRITE = 'OVERWRITE';
const MERGE = 'MERGE';

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
	const value = attrs[name];
	if (value) {
		delete attrs[name];
		return value;
	}

	const staticProp = 'static' + name[0].toUpperCase() + name.slice(1);
	return {
		value: [data[staticProp], data[name]].filter(Boolean).flat(Infinity),
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

		if (typeof style.value === 'string') {
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
