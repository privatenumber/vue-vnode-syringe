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

function isEmpty(object) {
	// eslint-disable-next-line no-unreachable-loop
	for (const key in object) {
		return false;
	}

	return true;
}

function merge(dest, src) {
	for (const key in src) {
		if (src[key]) {
			const {value, modifier} = src[key];
			const destValue = dest[key];
			if (
				destValue === undefined ||
				destValue === null ||
				modifier === OVERWRITE
			) {
				dest[key] = value;
			} else if (modifier === MERGE) {
				if (Array.isArray(destValue)) {
					if (Array.isArray(value)) {
						destValue.push(...value);
					} else {
						destValue.push(value);
					}
				} else if (typeof destValue === 'object' && typeof value === 'object') {
					Object.assign(destValue, value);
				} else if (typeof destValue === 'function' && typeof value === 'function') {
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

function parseModifiers(object) {
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

function getStaticPair(object, name) {
	const staticProp = camelize('static-' + name);
	const pair = [object[staticProp], object[name]].filter(Boolean).flat(Infinity);
	if (pair.length === 0) {
		return undefined;
	}

	delete object[staticProp];
	return pair;
}

function getStyle(name, attrs, data) {
	const value_ = attrs[name];
	if (value_) {
		delete attrs[name];
		return value_;
	}

	const pair = getStaticPair(data, name);
	if (!pair) {
		return undefined;
	}

	return {
		value: pair,
		modifier: FALLBACK,
	};
}

function parseStyles(styleString) {
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
			style.value = parseStyles(style.value);
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

				vnodeData.class = getStaticPair(vnodeData, 'class');
				vnodeData.style = getStaticPair(vnodeData, 'style');
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
