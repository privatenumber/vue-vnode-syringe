import {
	hyphenate,
} from './utils';

// from https://github.com/vuejs/vue/blob/6fe07eb/src/platforms/web/util/style.js#L5
const parseStyleText = function (cssText) {
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

function Syringe(value, modifier) {
	this.value = value;
	this.modifier = modifier;
}

function normalizeModifiers(obj, handlers) {
	for (const key in obj) {
		if (!obj.hasOwnProperty(key)) { continue; }

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

function set(obj, attr, { modifier, value }) {
	// Overwrite
	if (modifier === '!' || !obj.hasOwnProperty(attr)) {
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
}

const assign = (target, obj) => {
	for (const attr in obj) {
		if (obj.hasOwnProperty(attr)) {
			set(target, attr, obj[attr]);
		}
	}
	return target;
};

export default {
	functional: true,
	render(h, { children, data }) {
		if (!children) { return undefined; }

		['staticClass', 'class', 'staticStyle', 'style'].forEach((prop) => {
			if (data[prop]) {
				data[prop] = new Syringe(data[prop]);
			}
		});

		normalizeModifiers(data.attrs, {
			style(value, modifier) {
				let prop = 'style';
				if (typeof value === 'string') {
					prop = 'staticStyle';
					value = parseStyleText(value);
				}
				data[prop] = new Syringe(value, modifier);
			},
			class(value, modifier) {
				const prop = typeof value === 'string' ? 'staticClass' : 'class';
				data[prop] = new Syringe(value, modifier);
			},
		});

		normalizeModifiers(data.on);

		return children.map((vnode) => {
			if (!vnode.tag) { return vnode; }

			const d = Object.create(data);
			const { componentOptions: comOpts } = vnode;

			if (comOpts) {
				if (d.attrs) {
					// Why clone? -- test with multiple children
					d.attrs = { ...d.attrs };

					const propOptions = comOpts.Ctor.options.props;
					if (propOptions) {
						for (const prop in propOptions) {
							[prop, hyphenate(prop)].some((propp) => {
								for (const key in d.attrs) {
									if (d.attrs.hasOwnProperty(key) && key === propp) {
										set(comOpts.propsData, prop, d.attrs[key]);
										delete d.attrs[key];
										return true;
									}
								}
							});
						}
					}
				}

				// Logic from https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/create-component.js#L168
				comOpts.listeners = assign(comOpts.listeners || {}, d.on);
				d.on = d.nativeOn;
			}

			if (!vnode.data) {
				vnode.data = {};
			}

			['staticClass', 'class', 'staticStyle', 'style'].forEach((prop) => {
				if (d[prop]) {
					set(vnode.data, prop, d[prop]);
				}
			});

			['attrs', 'on'].forEach((prop) => {
				vnode.data[prop] = assign(vnode.data[prop] || {}, d[prop]);
			});

			return vnode;
		});
	},
};
