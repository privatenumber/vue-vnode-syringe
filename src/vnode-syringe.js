import {
	assign,
	extractPropsFromVNodeData,
} from './utils';

export default {
	functional: true,
	render(h, ctx) {
		if (!ctx.children) { return undefined; }

		const { on, attrs } = ctx.data;
		return ctx.children.map((c) => {
			if (!c.tag) { return c; }

			const nodeAttrs = assign({}, attrs);
			let nodeOn = assign({}, on);

			const { componentOptions: comOpts } = c;
			if (comOpts) {
				const props = extractPropsFromVNodeData(nodeAttrs, comOpts.Ctor);

				if (props) {
					comOpts.propsData = assign(comOpts.propsData || {}, props);
				}

				// Logic from https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/create-component.js#L168
				comOpts.listeners = assign(comOpts.listeners || {}, nodeOn);
				nodeOn = null;
			}

			if (!c.data) {
				c.data = {};
			}

			if (nodeAttrs) {
				c.data.attrs = assign(c.data.attrs || {}, nodeAttrs);
			}

			if (nodeOn) {
				c.data.on = assign(c.data.on || {}, nodeOn);
			}

			return h({ inheritAttrs: false, render: () => c }, ctx.data);
		});
	},
};
