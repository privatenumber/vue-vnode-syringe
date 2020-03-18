import { mount } from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';
import Vue from 'vue';

describe('Error handling', () => {
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
		expect(wrapper.isEmpty()).toBe(true);
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
		expect(spans.at(1).attributes()).toEqual({ title: 'test' });
		expect(spans.at(2).attributes()).toEqual({ class: 'class' });
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
		expect(comps.at(1).attributes()).toEqual({ title: 'test' });
		expect(comps.at(2).attributes()).toEqual({ class: 'class' });
	});
});

describe('Native element support', () => {
	test('Apply attributes to single child', () => {
		const usage = {
			template: `
				<vnode-syringe
					a="1"
					b="2"
					c="3"
				>
					<div />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('a')).toBe('1');
		expect(wrapper.attributes('b')).toBe('2');
		expect(wrapper.attributes('c')).toBe('3');
	});

	test('Apply attributes to multiple children', () => {
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

		const a = wrapper.findAll('[a="1"]');
		expect(a.length).toBe(3);

		const b = wrapper.findAll('[b="2"]');
		expect(b.length).toBe(3);

		const c = wrapper.findAll('[c="3"]');
		expect(c.length).toBe(3);
	});

	test('Overwrites attributes', () => {
		const usage = {
			template: `
				<vnode-syringe
					a="1"
					b="2"
					c="3"
				>
					<div
						a="3"
						b="1"
						c="2"
						d="4"
					/>
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('a')).toBe('1');
		expect(wrapper.attributes('b')).toBe('2');
		expect(wrapper.attributes('c')).toBe('3');
		expect(wrapper.attributes('d')).toBe('4');
	});

	test('Apply static style', () => {
		const usage = {
			template: `
				<vnode-syringe
					style="color:red"
				>
					<div />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('style')).toBe('color: red;');
	});

	test('Apply computed style', () => {
		const usage = {
			template: `
				<vnode-syringe
					:style="{ color: 'blue' }"
				>
					<div />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('style')).toBe('color: blue;');
	});

	test('Apply static class', () => {
		const usage = {
			template: `
				<vnode-syringe
					class="static-class"
				>
					<div />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('class')).toBe('static-class');
	});

	test('Apply computed class', () => {
		const usage = {
			template: `
				<vnode-syringe
					:class="['computed-class', { objClass: true }]"
				>
					<div />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('class')).toBe('computed-class objClass');
	});


	test('Inherit event listeners', () => {
		const onClick = jest.fn();
		const usage = {
			template: `
				<vnode-syringe
					@click="onClick"
				>
					<span />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
			},
			methods: {
				onClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.trigger('click');
		expect(onClick).toHaveBeenCalled();
	});

	test('Overwrites event listeners', () => {
		const onClick = jest.fn();
		const dontClick = jest.fn();
		const usage = {
			template: `
				<vnode-syringe
					@click="onClick"
				>
					<span
						@click="dontClick"
					/>
				</vnode-syringe>
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
		wrapper.trigger('click');
		expect(dontClick).not.toHaveBeenCalled();
		expect(onClick).toHaveBeenCalled();
	});

	describe('Reactivity', () => {
		test('attribute', async () => {
			const usage = {
				template: `
					<vnode-syringe
						:title="title"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
				data() {
					return {
						title: 'Static title',
					};
				},
				mounted() {
					this.title = 'Dynamic title';
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('title')).toBe('Static title');
			await Vue.nextTick();
			expect(wrapper.attributes('title')).toBe('Dynamic title');
		});

		test('class', async () => {
			const usage = {
				template: `
					<vnode-syringe
						:class="classes"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
				data() {
					return {
						classes: ['static-class'],
					};
				},
				mounted() {
					this.classes.push('dyanamic-class');
				},
			};

			const wrapper = mount(usage);
			await Vue.nextTick();
			expect(wrapper.attributes('class')).toBe('static-class dyanamic-class');
		});
	});
});

describe('Component support', () => {
	test('Apply attributes to single component', () => {
		const ChildComp = {
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe
					class="static-class"
					style="color: red"
					title="title"
				>
					<child-comp />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('class')).toBe('static-class');
		expect(wrapper.attributes('style')).toBe('color: red;');
		expect(wrapper.attributes('title')).toBe('title');
	});

	test('inheritAttrs: false and v-bind="$attrs"', () => {
		const ChildComp = {
			inheritAttrs: false,
			template: `
				<div>
					<span v-bind="$attrs"></span>
				</div>
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					class="static-class"
					style="color: red"
					title="title"
					fake-inherit="true"
				>
					<child-comp real-inherit="true" />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('class')).toBe('static-class');
		expect(wrapper.attributes('style')).toBe('color: red;');
		expect(wrapper.attributes('title')).toBe(undefined);
		expect(wrapper.attributes('fake-inherit')).toBe(undefined);

		const span = wrapper.find('span');
		expect(span.attributes('title')).toBe('title');
		expect(span.attributes('real-inherit')).toBe('true');
		expect(span.attributes('fake-inherit')).toBe('true');
	});

	test('Should not inherit event listeners', () => {
		const dontClick = jest.fn();

		const ChildComp = {
			template: `
				<div>
					Click me
				</div>
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					@click="dontClick"
				>
					<child-comp />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			methods: {
				dontClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.trigger('click');
		expect(dontClick).not.toHaveBeenCalled();
	});


	test('Inherit event listeners', () => {
		const onClick = jest.fn();

		const ChildComp = {
			props: ['id'],
			template: `
				<div>
					<span :id="id" v-on="$listeners"></span>
				</div>
			`,
		};

		const usage = {
			template: `
				<div>
					<vnode-syringe
						@click="onClick"
					>
						<child-comp id="a" />
						<child-comp id="b" />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			methods: {
				onClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('#a').trigger('click');
		wrapper.find('#b').trigger('click');
		expect(onClick.mock.calls.length).toBe(2);
	});

	test('Inherit native event listeners', () => {
		const onClick = jest.fn();

		const ChildComp = {
			template: `
				<section>
					<span v-on="$listeners"></span>
				</section>
			`,
		};

		const usage = {
			template: `
				<div>
					<vnode-syringe
						@click.native="onClick"
					>
						<child-comp id="a" />
						<child-comp id="b" />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			methods: {
				onClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('#a').trigger('click');
		wrapper.find('#b').trigger('click');
		expect(onClick.mock.calls.length).toBe(2);
	});

	test('Inherit mixed event listeners', () => {
		const onClick = jest.fn();
		const onHover = jest.fn();

		const ChildComp = {
			template: `
				<section>
					<span v-on="$listeners"></span>
				</section>
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					@hover="onHover"
					@click.native="onClick"
				>
					<child-comp />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			methods: {
				onClick,
				onHover,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('section').trigger('click');
		wrapper.find('span').trigger('hover');
		expect(onClick).toHaveBeenCalled();
		expect(onHover).toHaveBeenCalled();
	});

	test('Overwrites event listeners', () => {
		const onClick = jest.fn();
		const dontClick = jest.fn();

		const ChildComp = {
			template: `
				<section>
					<span v-on="$listeners"></span>
				</section>
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					@click="onClick"
				>
					<child-comp @click="dontClick"/>
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			methods: {
				onClick,
				dontClick,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('span').trigger('click');
		expect(onClick).toHaveBeenCalled();
		expect(dontClick).not.toHaveBeenCalled();
	});

	test('Pass in props', () => {
		const ChildComp = {
			inheritAttrs: false,
			props: {
				showArticle: Boolean,
			},
			template: `
				<section>
					<article
						v-if="showArticle"
						v-bind="$attrs"
					/>
				</section>
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					show-article
					title="title"
				>
					<child-comp />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
		};

		const wrapper = mount(usage);
		const article = wrapper.find('article');
		expect(article.exists()).toBe(true);
		expect(article.attributes('title')).toBe('title');
	});

	test('Prop overwrite', () => {
		const ChildComp = {
			props: {
				showArticle: Boolean,
				showNav: Boolean,
			},
			template: `
				<section>
					<article
						v-if="showArticle"
					/>
					<nav
						v-if="showNav"
					/>
				</section>
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					:show-article="false"
					title="title"
				>
					<child-comp
						show-article
						show-nav
					/>
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.find('article').exists()).toBe(false);
		expect(wrapper.find('nav').exists()).toBe(true);
		expect(wrapper.attributes('title')).toBe('title');
	});

	test('Reactive props', async () => {
		const ChildComp = {
			props: {
				string: String,
			},
			template: `
				<div :title="string" />
			`,
		};

		const usage = {
			template: `
				<vnode-syringe
					:string="str"
				>
					<child-comp />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			data() {
				return {
					str: 'static string',
				};
			},
			mounted() {
				this.str = 'reactive string';
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.attributes('title')).toBe('static string');
		await Vue.nextTick();
		expect(wrapper.attributes('title')).toBe('reactive string');
	});

	test('Custom events', () => {
		const onSomeEvent = jest.fn();

		const ChildComp = {
			props: {
				id: String,
			},
			template: `
				<div>
					<span
						:id="id"
						@click="$emit('some-event', id)"
					/>
				</div>
			`,
		};

		const usage = {
			template: `
				<div>
					<vnode-syringe
						@some-event="onSomeEvent"
					>
						<child-comp id="a" />
						<child-comp id="b" />
						<child-comp id="c" />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			methods: {
				onSomeEvent,
			},
		};

		const wrapper = mount(usage);
		wrapper.find('#c').trigger('click');
		wrapper.find('#a').trigger('click');
		wrapper.find('#b').trigger('click');
		expect(onSomeEvent.mock.calls).toEqual([['c'], ['a'], ['b']]);
	});

	test('Shouldn\'t destroy component', async () => {
		const beforeUpdate = jest.fn();
		const beforeDestroy = jest.fn();

		const ChildComp = {
			props: {
				data: String,
			},
			beforeUpdate,
			beforeDestroy,
			render(h) {
				return h('div', [this.data]);
			},
		};

		const usage = {
			template: `
				<vnode-syringe>
					<child-comp
						:data="data"
					/>
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			data() {
				return {
					data: 'data',
				};
			},
		};

		const wrapper = mount(usage);
		wrapper.setData({ data: 'shouldnt destroy' });
		await Vue.nextTick();
		expect(beforeUpdate).toHaveBeenCalled();
		expect(beforeDestroy).not.toHaveBeenCalled();
	});

	// test('Shouldn\'t create new VM instance', async () => {
	// 	const ChildComp = {
	// 		props: {
	// 			data: String,
	// 		},
	// 		render(h) {
	// 			return h('div', [this.data]);
	// 		},
	// 	};

	// 	const usage = {
	// 		template: `
	// 			<div>
	// 				<vnode-syringe>
	// 					<child-comp
	// 						v-for="data in items"
	// 						ref="child"
	// 						:data="data"
	// 						:key="data"
	// 					/>
	// 				</vnode-syringe>
	// 			</div>
	// 		`,
	// 		components: {
	// 			VnodeSyringe,
	// 			ChildComp,
	// 		},
	// 		data() {
	// 			return {
	// 				items: ['a', 'b'],
	// 			};
	// 		},
	// 	};

	// 	const wrapper = mount(usage);
	// 	const uids = wrapper.findAll({ ref: 'child' }).wrappers.map(w => w.vm._uid);
	// 	wrapper.setData({ items: ['b', 'a'] });
	// 	await Vue.nextTick();
	// 	const newUids = wrapper.findAll({ ref: 'child' }).wrappers.map(w => w.vm._uid);
	// 	expect(newUids).toEqual(uids);
	// });
});
