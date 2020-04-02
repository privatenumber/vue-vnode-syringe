const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

const { hasOwnProperty } = Object.prototype;
export const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

// from https://github.com/vuejs/vue/blob/6fe07eb/src/platforms/web/util/style.js#L5
export const parseStyleText = (cssText) => {
	const res = {};
	const listDelimiter = /;(?![^(]*\))/g;
	const propertyDelimiter = /:(.+)/;
	cssText.split(listDelimiter).forEach((item) => {
		if (item) {
			const tmp = item.split(propertyDelimiter);
			tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
		}
	});
	return res;
};

export function Syringe(value, modifier) {
	this.value = value;
	this.modifier = modifier;
}

export function normalizeModifiers(obj, handlers) {
	for (const key in obj) {
		if (!hasOwn(obj, key)) { continue; }

		const modifier = key[key.length - 1];
		if (modifier === '&' || modifier === '!') {
			const strippedKey = key.slice(0, -1);

			const handler = handlers && handlers[strippedKey];
			if (handler) {
				handler(obj[key], modifier);
			} else {
				obj[strippedKey] = new Syringe(obj[key], modifier);
			}

			delete obj[key];
		} else {
			obj[key] = new Syringe(obj[key]);
		}
	}
}

export const set = (obj, attr, { modifier, value }) => {
	// Overwrite
	if (modifier === '!' || !hasOwn(obj, attr)) {
		obj[attr] = value;
		return;
	}

	const base = obj[attr];
	if (modifier === '&' && base) {
		if (attr === 'class') {
			obj[attr] = [base, value];
			return;
		}

		if (attr === 'staticClass') {
			obj[attr] += ` ${value}`;
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
			obj[attr] = function () {
				base.apply(this, arguments);
				value.apply(this, arguments);
			};
		}
	}
};

export const assign = (target, obj) => {
	for (const attr in obj) {
		if (hasOwn(obj, attr)) {
			set(target, attr, obj[attr]);
		}
	}
	return target;
};
