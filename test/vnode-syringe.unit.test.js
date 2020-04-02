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

	describe('Doesn\'t overwrite', () => {
		test('Attributes', () => {
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
			expect(wrapper.attributes('a')).toBe('3');
			expect(wrapper.attributes('b')).toBe('1');
			expect(wrapper.attributes('c')).toBe('2');
			expect(wrapper.attributes('d')).toBe('4');
		});

		test('Static style', () => {
			const usage = {
				template: `
					<vnode-syringe
						style="color: blue; border: 1px solid red"
					>
						<div
							style="color: red; background: blue"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: red; background: blue;');
		});

		test('Computed style', () => {
			const usage = {
				template: `
					<vnode-syringe
						:style="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<div
							:style="{
								color: 'red',
								background: 'blue',
							}"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: red; background: blue;');
		});


		test('Static class', () => {
			const usage = {
				template: `
					<vnode-syringe
						class="class-a"
					>
						<div
							class="class-b"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b');
		});


		test('Computed class', () => {
			const usage = {
				template: `
					<vnode-syringe
						:class="['class-a']"
					>
						<div
							:class="['class-b']"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b');
		});

		test('Event listeners', () => {
			const onClick = jest.fn();
			const dontClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click="dontClick"
					>
						<span
							@click="onClick"
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
	});

	describe('Merge modifier', () => {
		test('Attributes', () => {
			const usage = {
				template: `
					<vnode-syringe
						a&="1"
						b&="2"
						c="3"
					>
						<div
							a="3"
							:b="[1]"
							d="4"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('a')).toBe('3');
			expect(wrapper.attributes('b')).toBe('1,2');
			expect(wrapper.attributes('c')).toBe('3');
			expect(wrapper.attributes('d')).toBe('4');
		});

		test('Static style - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						style&="color: blue; border: 1px solid red"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Static style', () => {
			const usage = {
				template: `
					<vnode-syringe
						style&="color: blue; border: 1px solid red"
					>
						<div
							style="color: red; background: blue"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; background: blue; border: 1px solid red;');
		});

		test('Computed style - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						:style&="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Computed style', () => {
			const usage = {
				template: `
					<vnode-syringe
						:style&="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<div
							:style="{
								color: 'red',
								background: 'blue',
							}"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; background: blue; border: 1px solid red;');
		});

		test('Static class - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						class&="class-a"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Static class', () => {
			const usage = {
				template: `
					<vnode-syringe
						class&="class-a"
					>
						<div
							class="class-b"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b class-a');
		});

		test('Computed class - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						:class&="{ 'class-a': true }"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Computed class', () => {
			const usage = {
				template: `
					<vnode-syringe
						:class&="{ 'class-a': true }"
					>
						<div
							:class="['class-b']"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b class-a');
		});

		test('Event listeners - no base', () => {
			const onClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click&="onClick"
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

		test('Event listeners', () => {
			const onClick = jest.fn();
			const dontClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click&="dontClick"
					>
						<span
							@click="onClick"
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
			expect(dontClick).toHaveBeenCalled();
			expect(onClick).toHaveBeenCalled();
		});
	});

	describe('Overwrite modifier', () => {
		test('Attributes', () => {
			const usage = {
				template: `
					<vnode-syringe
						a!="1"
						b!="2"
						c!="3"
					>
						<div
							a="3"
							:b="[1]"
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

		test('Static style - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						style!="color: blue; border: 1px solid red"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Static style', () => {
			const usage = {
				template: `
					<vnode-syringe
						style!="color: blue; border: 1px solid red"
					>
						<div
							style="color: red; background: blue"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Computed style - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						:style!="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Computed style', () => {
			const usage = {
				template: `
					<vnode-syringe
						:style!="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<div
							:style="{
								color: 'red',
								background: 'blue',
							}"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Static class - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						class!="class-a"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Static class', () => {
			const usage = {
				template: `
					<vnode-syringe
						class!="class-a"
					>
						<div
							class="class-b"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Computed class - no base', () => {
			const usage = {
				template: `
					<vnode-syringe
						:class!="{ 'class-a': true }"
					>
						<div />
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Computed class', () => {
			const usage = {
				template: `
					<vnode-syringe
						:class!="{ 'class-a': true }"
					>
						<div
							:class="['class-b']"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Event listeners - no base', () => {
			const onClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click!="onClick"
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

		test('Event listeners', () => {
			const onClick = jest.fn();
			const dontClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click!="onClick"
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
	});
});

describe('Component support', () => {
	test('Apply attributes to single child', () => {
		const ChildComp = {
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe
					a="1"
					b="2"
					c="3"
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
		expect(wrapper.attributes('a')).toBe('1');
		expect(wrapper.attributes('b')).toBe('2');
		expect(wrapper.attributes('c')).toBe('3');
	});

	test('Applies class & style', () => {
		const ChildComp = {
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe
					class="class-a"
					style="color: red"
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
		expect(wrapper.attributes('class')).toBe('class-a');
		expect(wrapper.attributes('style')).toBe('color: red;');
	});

	test('Applies computed class & style', () => {
		const ChildComp = {
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe
					:class="{ 'class-a': true }"
					:style="{
						color: 'red'
					}"
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
		expect(wrapper.attributes('class')).toBe('class-a');
		expect(wrapper.attributes('style')).toBe('color: red;');
	});

	test('Apply attributes to multiple children', () => {
		const ChildComp = {
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<div>
					<vnode-syringe
						a="1"
						b="2"
						c="3"
					>
						<child-comp />
						<child-comp />
						<child-comp />
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				ChildComp
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

	test('No attributes ', () => {
		const ChildComp = {
			template: '<div>Child component</div>',
		};

		const usage = {
			template: `
				<vnode-syringe>
					<child-comp />
				</vnode-syringe>
			`,
			components: {
				VnodeSyringe,
				ChildComp
			},
		};

		const wrapper = mount(usage);
		expect(wrapper.html()).toBe('<div>Child component</div>');
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
		await wrapper.vm.$nextTick();
		expect(wrapper.attributes('title')).toBe('reactive string');
	});

	test('Custom events', () => {
		const onSomeEvent = jest.fn();

		const ChildComp = {
			props: {
				id: String,
			},
			template: `
				<span
					:id="id"
					@click="$emit('some-event', id)"
				/>
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
		await wrapper.vm.$nextTick();
		expect(beforeUpdate).toHaveBeenCalled();
		expect(beforeDestroy).not.toHaveBeenCalled();
	});

	test('Shouldn\'t create new VM instance', async () => {
		const ChildComp = {
			props: {
				data: String,
			},
			render(h) {
				return h('div', [this.data]);
			},
		};

		const usage = {
			template: `
				<div>
					<vnode-syringe>
						<child-comp
							v-for="data in items"
							ref="child"
							:data="data"
							:key="data"
						/>
					</vnode-syringe>
				</div>
			`,
			components: {
				VnodeSyringe,
				ChildComp,
			},
			data() {
				return {
					items: ['a', 'b'],
				};
			},
		};

		const wrapper = mount(usage);
		const uids = wrapper.findAll({ ref: 'child' }).wrappers.map((w) => w.vm._uid);
		wrapper.setData({ items: ['b', 'a'] });
		await wrapper.vm.$nextTick();
		const newUids = wrapper.findAll({ ref: 'child' }).wrappers.map((w) => w.vm._uid);
		expect(newUids).toEqual(uids);
	});

	describe('Doesn\'t overwrite', () => {
		test('Attributes', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						a="1"
						b="2"
						c="3"
					>
						<child-comp
							a="3"
							b="1"
							c="2"
							d="4"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('a')).toBe('3');
			expect(wrapper.attributes('b')).toBe('1');
			expect(wrapper.attributes('c')).toBe('2');
			expect(wrapper.attributes('d')).toBe('4');
		});

		test('Props', () => {
			const ChildComp = {
				props: ['text'],
				template: '<div>{{ text }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						text="goodbye world"
					>
						<child-comp
							text="hello world"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.text()).toBe('hello world');
		});

		test('Computed props', () => {
			const ChildComp = {
				props: ['text'],
				template: '<div>{{ text }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:text="'goodbye world'"
					>
						<child-comp
							:text="'hello world'"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.text()).toBe('hello world');
		});

		test('Static style', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						style="color: blue; border: 1px solid red"
					>
						<child-comp
							style="color: red; background: blue"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: red; background: blue;');
		});

		test('Computed style', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						style="background: green"
						:style="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<child-comp
							:style="{
								color: 'red',
								background: 'blue',
							}"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('background: blue; color: red;');
		});

		test('Static class', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						class="class-a"
					>
						<child-comp
							class="class-b"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b');
		});

		test('Computed class', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						class="class-c"
						:class="['class-a']"
					>
						<child-comp
							:class="['class-b']"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-c class-b');
		});

		test('Event listeners', () => {
			const ChildComp = {
				template: '<div v-on="$listeners">Child component</div>',
			};

			const onClick = jest.fn();
			const dontClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click="dontClick"
					>
						<child-comp
							@click="onClick"
						/>
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
			wrapper.trigger('click');
			expect(dontClick).not.toHaveBeenCalled();
			expect(onClick).toHaveBeenCalled();
		});
	});

	describe('Merge modifier', () => {

		test('Attributes', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						a&="1"
						:b&="[2,3,4]"
						:c&="3"
					>
						<child-comp
							a="3"
							:b="[1]"
							:c="[2]"
							d="4"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('a')).toBe('3');
			expect(wrapper.attributes('b')).toBe('1,2,3,4');
			expect(wrapper.attributes('c')).toBe('2,3');
			expect(wrapper.attributes('d')).toBe('4');
		});

		test('Props', () => {
			const ChildComp = {
				props: ['text', 'obj'],
				template: '<div>{{ text }} - {{ JSON.stringify(obj) }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						text&="goodbye world"
						:obj&="{ a: 1 }"
					>
						<child-comp
							text="hello world"
							:obj="{ c: 1 }"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.text()).toBe('hello world - {"c":1,"a":1}');
		});

		test('Static style', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						style&="color: blue; border: 1px solid red"
					>
						<child-comp
							style="color: red; background: blue"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; background: blue; border: 1px solid red;');
		});

		test('Computed style', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				// Colliding prop name, gets ignored by the vue-template-compile
				template: `
					<vnode-syringe
						style&="width: 100px"
						:style&="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<child-comp
							:style="{
								color: 'red',
								background: 'blue',
							}"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; background: blue; border: 1px solid red;');
		});

		test('Static class', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						class&="class-a"
					>
						<child-comp
							class="class-b"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b class-a');
		});


		test('Computed class', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:class&="['class-a']"
					>
						<child-comp
							:class="['class-b']"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-b class-a');
		});

		test('Event listeners', () => {
			const ChildComp = {
				template: '<div v-on="$listeners">Child component</div>',
			};

			const onClick = jest.fn();
			const dontClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click&="dontClick"
					>
						<child-comp
							@click="onClick"
						/>
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
			wrapper.trigger('click');
			expect(dontClick).toHaveBeenCalled();
			expect(onClick).toHaveBeenCalled();
		});
	});

	describe('Overwrite modifier', () => {

		test('Attributes', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						a!="1"
						b!="2"
						c!="3"
					>
						<child-comp
							a="3"
							b="1"
							c="2"
							d="4"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('a')).toBe('1');
			expect(wrapper.attributes('b')).toBe('2');
			expect(wrapper.attributes('c')).toBe('3');
			expect(wrapper.attributes('d')).toBe('4');
		});

		test('Props', () => {
			const ChildComp = {
				props: ['text', 'camelCase'],
				template: '<div>{{ text.join() }}-{{ camelCase.join() }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:text!="[1, 2, 3]"
						:camel-case!="[2]"
					>
						<child-comp
							:text="[3, 2, 1]"
							:camel-case="[1, 2, 3]"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.text()).toBe('1,2,3-2');
		});

		test('Props casing: camelCase onto kebab-case', () => {
			const ChildComp = {
				props: ['helloWorld'],
				template: '<div>{{ helloWorld.join() }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:helloWorld!="[2]"
					>
						<child-comp
							:hello-world="[1, 2, 3]"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.text()).toBe('2');
		});

		test('Props casing: kebab-case onto camelCase', () => {
			const ChildComp = {
				props: ['helloWorld'],
				template: '<div>{{ helloWorld.join() }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:hello-world!="[2]"
					>
						<child-comp
							:helloWorld="[1, 2, 3]"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.text()).toBe('2');
		});

		test('Props casing: kebab-case & camelCase onto camelCase', () => {
			const ChildComp = {
				props: ['helloWorld'],
				template: '<div>{{ helloWorld.join() }}</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:hello-world!="[2]"
						:helloWorld!="[3]"
					>
						<child-comp
							:helloWorld="[1, 2, 3]"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.html()).toBe('<div hello-world="2">3</div>');
		});

		test('Static style', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						style!="color: blue; border: 1px solid red"
					>
						<child-comp
							style="color: red; background: blue"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Computed style', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:style!="{
							color: 'blue',
							border: '1px solid red',
						}"
					>
						<child-comp
							:style="{
								color: 'red',
								background: 'blue',
							}"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('style')).toBe('color: blue; border: 1px solid red;');
		});

		test('Static class', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						class!="class-a"
					>
						<child-comp
							class="class-b"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Computed class', () => {
			const ChildComp = {
				template: '<div>Child component</div>',
			};

			const usage = {
				template: `
					<vnode-syringe
						:class!="['class-a']"
					>
						<child-comp
							:class="['class-b']"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					ChildComp,
				},
			};

			const wrapper = mount(usage);
			expect(wrapper.attributes('class')).toBe('class-a');
		});

		test('Event listeners', () => {
			const ChildComp = {
				template: '<div v-on="$listeners">Child component</div>',
			};

			const onClick = jest.fn();
			const dontClick = jest.fn();
			const usage = {
				template: `
					<vnode-syringe
						@click!="onClick"
					>
						<child-comp
							@click="dontClick"
						/>
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
			wrapper.trigger('click');
			expect(dontClick).not.toHaveBeenCalled();
			expect(onClick).toHaveBeenCalled();
		});

		// Limitation with native event listeners
		// test('Native event listeners', () => {
		// 	const ChildComp = {
		// 		template: '<div>Child component</div>',
		// 		mounted() {
		// 			this.$emit('click');
		// 		},
		// 	};

		// 	const onClick = jest.fn();
		// 	const dontClick = jest.fn();
		// 	const usage = {
		// 		template: `
		// 			<vnode-syringe
		// 				@click!.native="onClick"
		// 			>
		// 				<child-comp
		// 					@click.native="dontClick"
		// 				/>
		// 			</vnode-syringe>
		// 		`,
		// 		components: {
		// 			VnodeSyringe,
		// 			ChildComp,
		// 		},
		// 		methods: {
		// 			onClick,
		// 			dontClick,
		// 		},
		// 	};

		// 	const wrapper = mount(usage);
		// 	wrapper.trigger('click');
		// 	expect(dontClick).not.toHaveBeenCalled();
		// 	expect(onClick).toHaveBeenCalled();
		// });
	});
});
