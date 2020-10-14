import {
	isEmpty,
	parseModifiers,
	getStyle,
	parseStyles,
	getStaticPair,
	getPropsData,
	merge,
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
		const _class = getStyle('class', attrs, data);
		const style = getStyle('style', attrs, data);

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
					merge(componentOptions.propsData, propsData);
					componentOptions.listeners = merge(componentOptions.listeners || {}, on);

					vnodeData.nativeOn = merge(vnodeData.nativeOn || {}, nativeOn);
					vnodeData.on = vnodeData.nativeOn;
				} else {
					vnodeData.on = merge(vnodeData.on || {}, on);
				}

				vnodeData.attrs = merge(vnodeData.attrs || {}, attrs);

				vnodeData.class = getStaticPair(vnodeData, 'class');
				vnodeData.style = getStaticPair(vnodeData, 'style');
				merge(vnodeData, {
					class: _class,
					style,
				});
			}

			return vnode;
		});
	},
};

export default vnodeSyringe;
