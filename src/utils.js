/* eslint-disable camelcase, prefer-spread, no-unused-expressions, unicorn/prevent-abbreviations */

export const classStyleProps = {
	staticClass: 'staticClass',
	class: 'class',
	staticStyle: 'staticStyle',
	style: 'style',
};

const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = string => string.replace(hyphenateRE, '-$1').toLowerCase();

const {hasOwnProperty} = Object.prototype;
export const hasOwn = (object, key) => hasOwnProperty.call(object, key);

// From https://github.com/vuejs/vue/blob/6fe07eb/src/platforms/web/util/style.js#L5
export const parseStyleText = cssText => {
	const res = {};
	const listDelimiter = /;(?![^(]*\))/g;
	const propertyDelimiter = /:(.+)/;
	cssText.split(listDelimiter).forEach(item => {
		if (item) {
			const temporary = item.split(propertyDelimiter);
			temporary.length > 1 && (res[temporary[0].trim()] = temporary[1].trim());
		}
	});
	return res;
};

export function normalizeModifiers(object, handlers) {
	for (const key in object) {
		if (!hasOwn(object, key)) {
			continue;
		}

		const modifier = key[key.length - 1];
		if (modifier === '&' || modifier === '!') {
			const strippedKey = key.slice(0, -1);

			const handler = handlers && handlers[strippedKey];
			if (handler) {
				handler(object[key], modifier);
			} else {
				object[strippedKey] = {
					value: object[key],
					modifier
				};
			}

			delete object[key];
		} else {
			object[key] = {
				value: object[key],
			};
		}
	}
}

export const set = (object, attr, {modifier, value}) => {
	// Overwrite
	if (modifier === '!' || !hasOwn(object, attr)) {
		object[attr] = value;
		return;
	}

	const base = object[attr];
	if (modifier === '&' && base) {
		if (attr === classStyleProps.class) {
			object[attr] = [base, value];
			return;
		}

		if (attr === classStyleProps.staticClass) {
			object[attr] += ` ${value}`;
			return;
		}

		if (Array.isArray(base)) {
			if (Array.isArray(value)) {
				base.push.apply(base, value);
			} else {
				base.push(value);
			}

			return;
		}

		if (typeof base === 'object') {
			Object.assign(base, value);
			return;
		}

		if (typeof base === 'function' && typeof value === 'function') {
			object[attr] = function () {
				Reflect.apply(base, this, arguments);
				Reflect.apply(value, this, arguments);
			};
		}
	}
};

export const assign = (target, object) => {
	for (const attr in object) {
		if (hasOwn(object, attr)) {
			set(target, attr, object[attr]);
		}
	}

	return target;
};
