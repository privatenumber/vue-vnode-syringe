export const classStyleProps = {
	M_staticClass: 'staticClass',
	M_class: 'class',
	M_staticStyle: 'staticStyle',
	M_style: 'style',
};

export function Syringe(value, modifier) {
	this.M_value = value;
	this.M_modifier = modifier;
};

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

export const set = (obj, attr, { M_modifier, M_value }) => {
	// Overwrite
	if (M_modifier === '!' || !hasOwn(obj, attr)) {
		obj[attr] = M_value;
		return;
	}

	const base = obj[attr];
	if (M_modifier === '&' && base) {
		if (attr === classStyleProps.M_class) {
			obj[attr] = [base, M_value];
			return;
		}

		if (attr === classStyleProps.M_staticClass) {
			obj[attr] += ` ${M_value}`;
			return;
		}

		if (Array.isArray(base)) {
			if (Array.isArray(M_value)) {
				base.push.apply(base, M_value);
			} else {
				base.push(M_value);
			}
			return;
		}

		if (typeof base === 'object') {
			Object.assign(base, M_value);
			return;
		}

		if (typeof base === 'function' && typeof M_value === 'function') {
			obj[attr] = function () {
				base.apply(this, arguments);
				M_value.apply(this, arguments);
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
