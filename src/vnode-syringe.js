import {
	assign,
	isEmpty,
	extractPropsFromVNodeData,
} from './utils';

export default {
	functional: true,
	render(h, ctx) {
		if (!ctx.children) { return undefined; }

		// TODO: Add more tests to make sure I can remove cloning here
		const clonedNativeOn = assign({}, ctx.data.nativeOn);
		const clonedOn = assign({}, ctx.data.on);
		const clonedAttrs = assign({}, ctx.data.attrs);

		if (
			isEmpty(clonedOn)
			&& isEmpty(clonedAttrs)
			&& isEmpty(clonedNativeOn)
		) {
			return ctx.children;
		}

		return ctx.children.map((c) => {
			const attrs = assign({}, clonedAttrs);
			let on = assign({}, clonedOn);

			if (c.componentOptions) {
				const props = extractPropsFromVNodeData(attrs, c.componentOptions.Ctor);

				if (Object.keys(props).length) {
					c.componentOptions.propsData = assign(c.componentOptions.propsData || {}, props);
				}

				// Logic from https://github.com/vuejs/vue/blob/v2.6.11/src/core/vdom/create-component.js#L168
				c.componentOptions.listeners = assign(c.componentOptions.listeners || {}, on);
				on = assign({}, clonedNativeOn);
			}

			if (!c.data) {
				c.data = {};
			}

			if (attrs) {
				c.data.attrs = assign(c.data.attrs || {}, attrs);
			}

			if (on) {
				c.data.on = assign(c.data.on || {}, on);
			}

			return c;
		});
	},
};
