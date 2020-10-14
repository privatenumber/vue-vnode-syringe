import {mount} from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';

describe('Error handling', () => {
	test('No children', () => {
		const usage = {
			template: '<div><vnode-syringe /></div>',
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.html()).toBe('<div>\n  <!---->\n</div>');
	});

	test('No elements', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe>
						Hello World
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.text()).toBe('Hello World');
	});

	test('No usage', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe>
						<span />
						<span title="test" />
						<span class="class" />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		const spans = wrapper.findAll('span');
		expect(spans.length).toBe(3);
		expect(spans.at(0).attributes()).toEqual({});
		expect(spans.at(1).attributes()).toEqual({title: 'test'});
		expect(spans.at(2).attributes()).toEqual({class: 'class'});
	});

	test('No usage with component', () => {
		const ChildComp = {
			template: '<section>Child component</section>',
		};

		const usage = {
			template: `
				<div>
					<vnode-syringe>
						<child-comp />
						<child-comp title="test" />
						<child-comp class="class" />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
		};

		const wrapper = mount(usage);
		const comps = wrapper.findAll('section');
		expect(comps.length).toBe(3);
		expect(comps.at(0).attributes()).toEqual({});
		expect(comps.at(1).attributes()).toEqual({title: 'test'});
		expect(comps.at(2).attributes()).toEqual({class: 'class'});
	});
});
