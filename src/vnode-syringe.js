import {
	hyphenate,
	hasOwn,
	assign,
	set,
	Syringe,
	parseStyleText,
	normalizeModifiers,
} from './utils';

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
				const propOptions = comOpts.Ctor.options.props;
				if (propOptions) {
					d.attrs = Object.assign({}, d.attrs);

					for (const prop in propOptions) {
						[prop, hyphenate(prop)].some((propp) => {
							for (const key in d.attrs) {
								if (hasOwn(d.attrs, key) && key === propp) {
									set(comOpts.propsData, prop, d.attrs[key]);
									delete d.attrs[key];
									return true;
								}
							}
						});
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
