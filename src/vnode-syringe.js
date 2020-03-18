import {
	assign,
	extractPropsFromVNodeData,
} from './utils';

export default {
	functional: true,
	render(h, ctx) {
		if (!ctx.children) { return undefined; }

		const {
			staticStyle,
			style,
			class: dynamicClass,
			staticClass,
			attrs,
			on,
			nativeOn,
		} = ctx.data;

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
				nodeOn = assign({}, nativeOn);
			}

			if (!v.data) {
				v.data = {};
			}

			if (staticClass) {
				if (v.data.staticClass) {
					v.data.staticClass += ` ${staticClass}`;
				} else {
					v.data.staticClass = staticClass;
				}
			}

			if (dynamicClass) {
				v.data.class = [v.data.class, dynamicClass];
			}


			if (staticStyle) {
				v.data.staticStyle = assign(v.data.staticStyle || {}, staticStyle);
			}

			if (style) {
				v.data.style = assign(v.data.style || {}, style);
			}

			if (nodeAttrs) {
				v.data.attrs = assign(v.data.attrs || {}, nodeAttrs);
			}

			if (nodeOn) {
				v.data.on = assign(v.data.on || {}, nodeOn);
			}

			return v;
		});
	},
};
