import {
	isEmpty,
	parseModifiers,
	parseStyles,
	getStaticPair,
	getPropsData,
	merge,
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

		if (style && typeof style.value === 'string') {
			style.value = parseStyles(style.value);
		}

		return children.map(vnode => {
			vnode = cloneVNode(vnode);

			if (vnode.tag) {
				if (!vnode.data) {
					vnode.data = {};
				}

				const {
					data: vnodeData,
					componentOptions,
				} = vnode;

				// If component
				if (componentOptions) {
					const propsData = getPropsData(componentOptions, attrs);
					merge(componentOptions, 'propsData', propsData);
					merge(componentOptions, 'listeners', on);

					merge(vnodeData, 'nativeOn', nativeOn);
					vnodeData.on = vnodeData.nativeOn;
				} else {
					merge(vnodeData, 'on', on);
				}

				merge(vnodeData, 'attrs', attrs);

				vnodeData.class = getStaticPair(vnodeData, 'class');
				vnodeData.style = getStaticPair(vnodeData, 'style');
				set(vnodeData, 'class', _class);
				set(vnodeData, 'style', style);
				set(vnode, 'key', key);
			}

			return vnode;
		});
	},
};

export default vnodeSyringe;
