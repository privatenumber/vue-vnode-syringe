const hyphenateRE = /\B([A-Z])/g;
const hyphenate = string => string.replace(hyphenateRE, '-$1').toLowerCase();

const {hasOwnProperty} = Object.prototype;
const hasOwn = (object, key) => hasOwnProperty.call(object, key);

// From https://github.com/vuejs/vue/blob/6fe07eb/src/platforms/web/util/style.js#L5
const parseStyleText = cssText => {
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

function normalizeModifiers(object, handlers) {
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

const set = (object, attr, {modifier, value}) => {
	// Overwrite
	if (modifier === '!' || !hasOwn(object, attr)) {
		object[attr] = value;
		return;
	}

	const base = object[attr];
	if (modifier === '&' && base) {
		if (attr === 'class') {
			object[attr] = [base, value];
			return;
		}

		if (attr === 'staticClass') {
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

const assign = (target, object) => {
	for (const attr in object) {
		if (hasOwn(object, attr)) {
			set(target, attr, object[attr]);
		}
	}

	return target;
};

const classStyleProps = {
	staticClass: 'staticClass',
	class: 'class',
	staticStyle: 'staticStyle',
	style: 'style',
};

const classStyles = Object.values(classStyleProps);

const isEmpty = (obj) => {
	for (const key in obj) {
		return false;
	}
	return true;
}
const vnodeSyringe = {
	functional: true,
	render(h, {children, data}) {
		if (!children) {
			return;
		}

		if (isEmpty(data)) {
			return children;
		}

		classStyles.forEach(prop => {
			if (data[prop]) {
				data[prop] = {
					value: data[prop],
				};
			}
		});

		normalizeModifiers(data.attrs, {
			style(value, modifier) {
				let prop = 'style';
				if (typeof value === 'string') {
					prop = 'staticStyle';
					value = parseStyleText(value);
				}

				data[prop] = {
					value: value,
					modifier: modifier,
				};
			},
			class(value, modifier) {
				const prop = typeof value === 'string' ? 'staticClass' : 'class';
				data[prop] = {
					value: value,
					modifier: modifier,
				};
			},
		});

		normalizeModifiers(data.on);

		return children.map(vnode => {
			if (vnode.tag) {
				const d = Object.create(data);
				const {componentOptions: comOptions} = vnode;

				if (comOptions) {
					const propOptions = comOptions.Ctor.options.props;
					if (propOptions) {
						d.attrs = Object.assign({}, d.attrs);

						for (const prop in propOptions) {
							if (!hasOwn(propOptions, prop)) {
								continue;
							}

							[prop, hyphenate(prop)].some(propp => {
								for (const key in d.attrs) {
									if (hasOwn(d.attrs, key) && key === propp) {
										set(comOptions.propsData, prop, d.attrs[key]);
										delete d.attrs[key];
										return true;
									}
								}

								return false;
							});
						}
					}

					// Logic from https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/create-component.js#L168
					comOptions.listeners = assign(comOptions.listeners || {}, d.on);
					d.on = undefined;
				}

				if (!vnode.data) {
					vnode.data = {};
				}

				classStyles.forEach(prop => {
					if (d[prop]) {
						set(vnode.data, prop, d[prop]);
					}
				});

				['attrs', 'on'].forEach(prop => {
					if (d[prop]) {
						vnode.data[prop] = assign(vnode.data[prop] || {}, d[prop]);
					}
				});
			}

			return vnode;
		});
	},
};

export default vnodeSyringe;
