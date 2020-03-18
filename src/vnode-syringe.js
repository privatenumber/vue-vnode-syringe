import {
	assign,
	extractPropsFromVNodeData,
} from './utils';

const renderVnode = {
	props: ['v'],
	inheritAttrs: false,
	render() { return this.v; },
};

export default {
	functional: true,
	render(h, ctx) {
		if (!ctx.children) { return undefined; }

		const { on, attrs } = ctx.data;
		return ctx.children.map((v) => {
			if (!v.tag) { return v; }

			const nodeAttrs = assign({}, attrs);
			let nodeOn = assign({}, on);

			const { componentOptions: comOpts } = v;
			if (comOpts) {
				const props = extractPropsFromVNodeData(nodeAttrs, comOpts.Ctor);

				if (props) {
					comOpts.propsData = assign(comOpts.propsData || {}, props);
				}

				// Logic from https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/create-component.js#L168
				comOpts.listeners = assign(comOpts.listeners || {}, nodeOn);
				nodeOn = null;
			}

			if (!v.data) {
				v.data = {};
			}

			if (nodeAttrs) {
				v.data.attrs = assign(v.data.attrs || {}, nodeAttrs);
			}

			if (nodeOn) {
				v.data.on = assign(v.data.on || {}, nodeOn);
			}

			return h(renderVnode, { ...ctx.data, props: { v } });
		});
	},
};
