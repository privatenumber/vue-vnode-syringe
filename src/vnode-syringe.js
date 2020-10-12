

const hyphenateRE = /\B([A-Z])/g;
const hyphenate = string => string.replace(hyphenateRE, '-$1').toLowerCase();

const camelizeRE = /-(\w)/g;
const camelize = (function (str) {
	return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

const isEmpty = (obj) => {
	for (const key in obj) {
		return false;
	}
	return true;
}

const isNil = val => val === undefined || val === null;

const mergeStatic = (data, name) => {
	const staticProp = 'static' + name[0].toUpperCase() + name.slice(1);
	if (!data[name] && !data[staticProp]) {
		return;
	}
	data[name] = [
		data[staticProp] ? data[staticProp] : [],
		data[name] ? data[name] : [],
	].flat(Infinity);
	delete data[staticProp];
};

const { hasOwnProperty } = Object.prototype;

/*
Needs to handle
attrs: {
	a: 1,
	b: 2,
	c: 3
}
*/
function merge(dest, fromObj) {
	if (isNil(fromObj)) {
		return dest;
	}

	if (isNil(dest)) {
		return /*Array.isArray(fromObj) ? fromObj.slice(0) :*/ fromObj;
	}

	else if (!Array.isArray(dest) && typeof dest === 'object') {
		return Object.assign({}, fromObj, dest);
	}

	return dest;
}


function findProp(propDefs, attr) {
	if (hasOwnProperty.call(propDefs, attr)) {
		return attr;
	}

	const kebab = hyphenate(attr);
	if (hasOwnProperty.call(propDefs, kebab)) {
		return kebab;
	}

	const camel = camelize(attr);
	if (hasOwnProperty.call(propDefs, camel)) {
		return camel;
	}

	return false;
}

function getPropsData(componentOptions, attrs) {
	const { props } = componentOptions.Ctor.options;
	const propsData = {};

	// Iterate over given attrs
	for (const attr in attrs) {

		// Check if the attr is a prop
		const isProp = findProp(props, attr);
		if (isProp) {
			propsData[isProp] = attrs[attr];
			attrs[attr] = undefined;
		}
	}
	return propsData;
}

const vnodeSyringe = {
	functional: true,
	render(h, {children, data}) {
		if (!children || isEmpty(data)) {
			return children;
		}

		mergeStatic(data, 'class');
		mergeStatic(data, 'style');

		return children.map(vnode => {
			if (vnode.tag) {
				if (!vnode.data) {
					vnode.data = {};
				}
				const {data: vnodeData} = vnode;

				mergeStatic(vnodeData, 'class');
				mergeStatic(vnodeData, 'style');

				const attrs = { ...data.attrs };
				const on = { ...data.on };
				const nativeOn = { ...data.nativeOn };

				// If component
				const {componentOptions} = vnode;
				if (componentOptions) {
					const propsData = getPropsData(componentOptions, attrs);
					componentOptions.propsData = merge(componentOptions.propsData, propsData);
					componentOptions.listeners = merge(componentOptions.listeners, on);

					vnodeData.nativeOn = merge(vnodeData.nativeOn, nativeOn);
					vnodeData.on = vnodeData.nativeOn;
				} else {
					vnodeData.on = merge(vnodeData.on, on);
				}
				vnodeData.attrs = merge(vnodeData.attrs, attrs);

				vnode.data = merge(vnodeData, {
					class: data.class,
					style: data.style,
				});
			}

			return vnode;
		});
	},
};

export default vnodeSyringe;
