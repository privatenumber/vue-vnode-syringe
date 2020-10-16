import Vue from 'vue';
import {mount} from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';

describe('Error handling', () => {
	test('No children', () => {
		const wrapper = mount({
			template: '<div><vnode-syringe /></div>',
			components: {
				VnodeSyringe,
			},
		});
		expect(wrapper.html()).toBe('<div>\n  <!---->\n</div>');
	});

	test('No elements', () => {
		const wrapper = mount({
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
		});
		expect(wrapper.text()).toBe('Hello World');
	});

	test('No usage', () => {
		const wrapper = mount({
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
		});
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

		const wrapper = mount({
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
		});
		const comps = wrapper.findAll('section');
		expect(comps.length).toBe(3);
		expect(comps.at(0).attributes()).toEqual({});
		expect(comps.at(1).attributes()).toEqual({title: 'test'});
		expect(comps.at(2).attributes()).toEqual({class: 'class'});
	});

	test('warn multiple keys', () => {
		const warnHandler = jest.fn();
		Vue.config.warnHandler = warnHandler;

		mount({
			template: `
				<div>
					<vnode-syringe key="1">
						<div>a</div>
						<div>b</div>
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		});
		expect(warnHandler).toBeCalled();
	});
});
