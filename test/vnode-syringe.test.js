import { mount } from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';
// import CardHeader from './fixtures/CardHeader.vue';
// import CardFooter from './fixtures/CardFooter.vue';

describe('Foundation', () => {
	test('No usage', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe>
						<div />
						<div />
						<div />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.element).toMatchSnapshot();
	});

	test('No children', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe />
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.element).toMatchSnapshot();
	});
});

describe('Native element support', () => {
	test('Inherit attributes', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe
						a="1"
						b="2"
						c="3"
					>
						<div />
						<div />
						<div />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.element).toMatchSnapshot();
	});

	test('Overwrites attributes', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe
						a="1"
						b="2"
						c="3"
					>
						<div c="1" b="3" a="2" />
						<span d="3" e="2" f="1" />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.element).toMatchSnapshot();
	});

	test('Inherit event listeners', () => {
		const onClick = jest.fn();
		const usage = {
			template: `
				<div>
					<vnode-syringe
						@click="onClick"
					>
						<span />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
			methods: {
				onClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('span').trigger('click');
		expect(onClick).toHaveBeenCalled();
	});

	test('Overwrites event listeners', () => {
		const onClick = jest.fn();
		const dontClick = jest.fn();
		const usage = {
			template: `
				<div>
					<vnode-syringe
						@click="onClick"
					>
						<span
							@click="dontClick"
						/>
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
			},
			methods: {
				onClick,
				dontClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('span').trigger('click');
		expect(dontClick).not.toHaveBeenCalled();
		expect(onClick).toHaveBeenCalled();
	});
});

describe('Component support', () => {
	const MultiButton = {
		template: `
			<div class="multi-button">
				<button
					:class="theme"
					v-bind="$attrs"
					v-on="$listeners"
				>
					Option 1
				</button>
				<button
					:class="theme"
					v-bind="$attrs"
					v-on="$listeners"
				>
					Option 2
				</button>
			</div>
		`,
		inheritAttrs: false,
		props: {
			theme: {
				type: String,
				default: 'normal',
			},
		},
		mounted() {
			this.$emit('some-event');
		},
	};

	test('Pass to component $attrs', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe
						title="I'm a Button"
					>
						<multi-button />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				MultiButton,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.element).toMatchSnapshot();
	});

	test('Pass to component $listeners', () => {
		const onClick = jest.fn();
		const usage = {
			template: `
				<div>
					<vnode-syringe
						@click="onClick"
					>
						<multi-button />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				MultiButton,
			},
			methods: {
				onClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('button').trigger('click');
		expect(onClick).toHaveBeenCalled();
	});

	test('Pass to component props', () => {
		const usage = {
			template: `
				<div>
					<vnode-syringe
						some-attr="1"
						theme="dark"
					>
						<multi-button />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				MultiButton,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.element).toMatchSnapshot();
	});

	test('Custom event', () => {
		const onSomeEvent = jest.fn();
		const usage = {
			template: `
				<div>
					<vnode-syringe
						@some-event="onSomeEvent"
					>
						<multi-button />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				MultiButton,
			},
			methods: {
				onSomeEvent,
			},
		};

		const wrapper = mount(usage);
		expect(onSomeEvent).toHaveBeenCalled();
	});
});
