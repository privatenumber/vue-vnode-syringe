import {
	assign,
	extractPropsFromVNodeData,
} from './utils';

export default {
	functional: true,
	render(h, { children, data }) {
		if (!children) { return undefined; }

		return children.map((v) => {
			if (!v.tag) { return v; }

			const d = Object.create(data);
			const { componentOptions: comOpts } = v;

			if (comOpts) {
				d.attrs = assign({}, d.attrs);
				const props = extractPropsFromVNodeData(d.attrs, comOpts.Ctor);

				if (props) {
					comOpts.propsData = assign(comOpts.propsData || {}, props);
				}

				// Logic from https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/create-component.js#L168
				comOpts.listeners = assign(comOpts.listeners || {}, d.on);
				d.on = data.nativeOn;
			}

			if (!v.data) {
				v.data = {};
			}

			if (d.staticClass) {
				if (v.data.staticClass) {
					v.data.staticClass += ` ${d.staticClass}`;
				} else {
					v.data.staticClass = d.staticClass;
				}
			}

			if (d.class) {
				if (v.data.class) {
					v.data.class = [v.data.class, d.class];
				} else {
					v.data.class = d.class;
				}
			}

			['staticStyle', 'style', 'attrs', 'on'].forEach((prop) => {
				v.data[prop] = assign(v.data[prop] || {}, d[prop]);
			});

			return v;
		});
	},
};
