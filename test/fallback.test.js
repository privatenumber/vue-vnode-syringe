import {mount} from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';


describe('fallback attrs', () => {

	test('Apply attributes to single child', () => {
		const usage = {
			template: `
				<vnode-syringe
					class="static-class"
					:class="'dynamic-class'"
					style="color:red"
					:style="'font:serif'"
					a="1"
					:b="2"
					:c="'3'"
				>
					<div />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.html()).toBe('<div a="1" b="2" c="3" class="static-class dynamic-class" style="color: red; font: serif;"></div>');
	});

	test('Apply attributes to single child', () => {
		const usage = {
			template: `
				<vnode-syringe
					class="static-class"
					:class="'dynamic-class'"
					style="color:red"
					:style="'font:serif'"
					a="1"
					:b="2"
					:c="'3'"
				>
					<div
						class="some-class"
						style="color:blue"
						a="3"
						b="1"
						c="2"
					/>
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.html()).toBe('<div a="3" b="1" c="2" class="some-class" style="color: blue;"></div>');
	});




});
