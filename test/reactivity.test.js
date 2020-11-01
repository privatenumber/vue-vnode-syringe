import {mount} from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';

describe('Reactivity', () => {
	test('Fallback', async () => {
		const ChildComp = {
			props: ['number'],
			template: '<div>{{ number }}</div>',
		};

		const ParentComp = {
			template: '<div>{{ number }} <vnode-syringe :number="number"><slot /></vnode-syringe></div>',
			components: {
				VnodeSyringe,
			},
			data() {
				return {
					number: 1,
				};
			},
		};

		const usage = {
			template: '<parent-comp ref="parent"><child-comp /><child-comp /></parent-comp>',
			components: {
				ParentComp,
				ChildComp,
			},
		};

		const wrapper = mount(usage);

		const parent = wrapper.findComponent({ref: 'parent'});

		expect(wrapper.html()).toBe('<div>1 <div>1</div>\n  <div>1</div>\n</div>');

		await parent.setData({number: 2});

		expect(wrapper.html()).toBe('<div>2 <div>2</div>\n  <div>2</div>\n</div>');

		await parent.setData({number: 3});

		expect(wrapper.html()).toBe('<div>3 <div>3</div>\n  <div>3</div>\n</div>');
	});

	test('Overwrite', async () => {
		const ChildComp = {
			props: ['number'],
			template: '<div>{{ number }}</div>',
		};

		const ParentComp = {
			template: '<div>{{ number }} <vnode-syringe :number!="number"><slot /></vnode-syringe></div>',
			components: {
				VnodeSyringe,
			},
			data() {
				return {
					number: 1,
				};
			},
		};

		const usage = {
			template: '<parent-comp ref="parent"><child-comp number="asdf" /><child-comp number="asdf" /></parent-comp>',
			components: {
				ParentComp,
				ChildComp,
			},
		};

		const wrapper = mount(usage);

		const parent = wrapper.findComponent({ref: 'parent'});

		expect(wrapper.html()).toBe('<div>1 <div>1</div>\n  <div>1</div>\n</div>');

		await parent.setData({number: 2});

		expect(wrapper.html()).toBe('<div>2 <div>2</div>\n  <div>2</div>\n</div>');

		await parent.setData({number: 3});

		expect(wrapper.html()).toBe('<div>3 <div>3</div>\n  <div>3</div>\n</div>');
	});

	test('Merge', async () => {
		const ChildComp = {
			props: ['number'],
			template: '<div>{{ number }}</div>',
		};

		const ParentComp = {
			template: '<div>{{ number }} <vnode-syringe :number&="number"><slot /></vnode-syringe></div>',
			components: {
				VnodeSyringe,
			},
			data() {
				return {
					number: 1,
				};
			},
		};

		const usage = {
			template: '<parent-comp ref="parent"><child-comp number="1" /><child-comp number="1" /></parent-comp>',
			components: {
				ParentComp,
				ChildComp,
			},
		};

		const wrapper = mount(usage);

		const parent = wrapper.findComponent({ref: 'parent'});

		expect(wrapper.html()).toBe('<div>1 <div>11</div>\n  <div>11</div>\n</div>');

		await parent.setData({number: 2});

		expect(wrapper.html()).toBe('<div>2 <div>12</div>\n  <div>12</div>\n</div>');

		await parent.setData({number: 3});

		expect(wrapper.html()).toBe('<div>3 <div>13</div>\n  <div>13</div>\n</div>');
	});
});
