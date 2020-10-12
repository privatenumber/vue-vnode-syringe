import {mount} from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';

describe('Modifiers', () => {
	test('Styles', () => {
		const ChildComp = {
			props: ['someProp'],
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe

					style="color: red;"
					style&="color: green;"
					style!="color: blue;"

					class="static-a"
					class&="static-b"
					class!="static-c"

					some-attr="1"
					some-attr&="2"
					some-attr!="3"

					another-attr="1"

					some-prop="1"
					some-prop&="2"
					some-prop!="3"

					another-prop="2"

					@some-event="eventHandler"
					@some-event&="eventHandler"
					@some-event!="eventHandler"
				>
					<child-comp />
				</vnode-syringe>
			`,

			components: {
				VnodeSyringe,
				ChildComp,
			},

			methods: {
				eventHandler() {},
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.html()).toBe('<div some-attr="3" another-attr="1" another-prop="2" class="static-c" style="color: blue;">Child component</div>');
	});

	test('Styles', () => {
		const ChildComp = {
			props: ['someProp'],
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe
					:style="{ color: 'red' }"
					:style="{ color: 'green' }"
					:style!="{ color: 'blue' }"

					:class="['computed-a']"
					:class&="['computed-b']"
					:class!="['computed-c']"

					:some-attr="'a'"
					:some-attr&="'b'"
					:some-attr!="'c'"

					:another-attr="1"

					:some-prop="'a'"
					:some-prop&="'b'"
					:some-prop!="'c'"

					:another-prop="false"

					@some-event="eventHandler"
					@some-event&="eventHandler"
					@some-event!="eventHandler"
				>
					<child-comp />
				</vnode-syringe>
			`,

			components: {
				VnodeSyringe,
				ChildComp,
			},

			methods: {
				eventHandler() {},
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.html()).toBe('<div some-attr="c" another-attr="1" class="computed-c" style="color: blue;">Child component</div>');
	});
});
