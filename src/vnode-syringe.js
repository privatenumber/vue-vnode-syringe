import {
	isEmpty,
	parseDirectives,
	parseModifiers,
	parseStyles,
	getStaticPair,
	getPropsData,
	assign,
	assignDirectives,
	set,
	getAndRemoveAttr,
	createFallback,
	cloneVNode,
} from './utils';

const vnodeSyringe = {
	functional: true,
	render(h, {children, data}) {
		if (!children || isEmpty(data)) {
			return children;
		}

		const attrs = parseModifiers(data.attrs);
		const on = parseModifiers(data.on);
		const nativeOn = parseModifiers(data.nativeOn);
		const _class = getAndRemoveAttr(attrs, 'class') || createFallback(getStaticPair(data, 'class'));
		const style = getAndRemoveAttr(attrs, 'style') || createFallback(getStaticPair(data, 'style'));
		const key = getAndRemoveAttr(attrs, 'key') || createFallback(data.key);
		const directives = parseDirectives(data.directives);

		if (style && typeof style.value === 'string') {
			style.value = parseStyles(style.value);
		}

		return children.map(vnode => {
			vnode = cloneVNode(vnode);

			if (vnode.tag) {
				if (!vnode.data) {
					vnode.data = {};
				}

				const _attrs = Object.assign({}, attrs);
				const {
					data: vnodeData,
					componentOptions,
				} = vnode;

				// If component
				if (componentOptions) {
					const propsData = getPropsData(componentOptions, _attrs);
					assign(componentOptions, 'propsData', propsData);
					assign(componentOptions, 'listeners', on);

					assign(vnodeData, 'nativeOn', nativeOn);
					vnodeData.on = vnodeData.nativeOn;
				} else {
					assign(vnodeData, 'on', on);
				}

				assign(vnodeData, 'attrs', _attrs);

				vnodeData.class = getStaticPair(vnodeData, 'class');
				vnodeData.style = getStaticPair(vnodeData, 'style');
				set(vnodeData, 'class', _class);
				set(vnodeData, 'style', style);
				set(vnode, 'key', key);

				if (directives) {
					assignDirectives(vnodeData, directives);
					// Expose locally registered directives?
					// Object.assign(vnode.context.$options.directives, parent.$options.directives);
				}
			}

			return vnode;
		});
	},
};

export default vnodeSyringe;
