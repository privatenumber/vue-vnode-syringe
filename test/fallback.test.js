import {mount} from '@vue/test-utils';
import VnodeSyringe from 'vue-vnode-syringe';

describe('fallback', () => {
	describe('native element', () => {
		test('apply new attributes', () => {
			const wrapper = mount({
				template: `
					<vnode-syringe
						class="static-class"
						:class="['dynamic-class', 2, ['3', 2]]"
						style="color:red"
						:style="{ font: 'serif' }"
						a="1"
						:b="2"
						:c="'3'"
					>
						<div/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
				},
			});
			expect(wrapper.html()).toBe('<div a="1" b="2" c="3" class="static-class dynamic-class 3" style="color: red; font: serif;"></div>');
		});

		test('preserve existing attributes', () => {
			const wrapper = mount({
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
			});
			expect(wrapper.html()).toBe('<div a="3" b="1" c="2" class="some-class" style="color: blue;"></div>');
		});

		test('multiple elements', () => {
			const wrapper = mount({
				template: `
					<div>
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
							/>
							<div
								:class="'some-class'"
							/>
							<div
								style="color:blue"
							/>
							<div
								:style="{color:'blue'}"
							/>
							<div
								b="c"
							/>
						</vnode-syringe>
					</div>
				`,
				components: {
					VnodeSyringe,
				},
			});
			expect(wrapper.html()).toBe('<div>\n  <div a="1" b="2" c="3" class="some-class" style="color: red;"></div>\n  <div a="1" b="2" c="3" class="some-class" style="color: red;"></div>\n  <div a="1" b="2" c="3" class="static-class dynamic-class" style="color: blue;"></div>\n  <div a="1" b="2" c="3" class="static-class dynamic-class" style="color: blue;"></div>\n  <div b="c" a="1" c="3" class="static-class dynamic-class" style="color: red;"></div>\n</div>');
		});

		describe('event-handlers', () => {
			test('apply new @handler', async () => {
				const onClick = jest.fn();
				const onFocus = jest.fn();
				const wrapper = mount({
					template: `
						<vnode-syringe
							@click="onClick"
							@focus="onFocus"
						>
							<div/>
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).toHaveBeenCalled();
			});

			test('preserve existing @handlers', async () => {
				const onClick = jest.fn();
				const onFocus = jest.fn();
				const wrapper = mount({
					template: `
						<vnode-syringe
							@click="onClick"
							@focus="onFocus"
						>
							<div @click=""/>
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).not.toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).toHaveBeenCalled();
			});

			// V-on.native is not allowed on native elements

			test('multiple elements', async () => {
				const onClick = jest.fn();

				const wrapper = mount({
					template: `
						<div>
							<vnode-syringe
								class="static-class"
								:class="'dynamic-class'"
								style="color:red"
								:style="'font:serif'"
								a="1"
								:b="2"
								:c="'3'"
								@click="onClick"
							>
								<div
									class="some-class"
									@click=""
								/>
								<div
									:class="'some-class'"
								/>
								<div
									style="color:blue"
									@click=""
								/>
								<div
									:style="{color:'blue'}"
								/>
								<div
									b="c"
								/>
							</vnode-syringe>
						</div>
					`,
					components: {
						VnodeSyringe,
					},
					methods: {
						onClick,
					},
				});

				const divs = wrapper.findAll('div');
				await divs.trigger('click');
				expect(onClick).toHaveBeenCalledTimes(3);
			});
		});
	});

	describe('component', () => {
		let TestComp;

		beforeEach(() => {
			TestComp = {
				props: ['camelCase', 'kebab-case', 'PascalCase', 'snake_case', 'UPPER_CASE'],
				template: '<div v-on="$listeners">{{ camelCase }} {{ kebabCase }} {{ PascalCase }} {{ snake_case }} {{ UPPER_CASE }}</div>',
			};
		});

		test('only apply new attributes/props', () => {
			const wrapper = mount({
				template: `
					<vnode-syringe
						class="static-class"
						:class="['dynamic-class', 2, ['3', 2]]"
						style="color:red"
						:style="{ font: 'serif' }"
						camelCase="-"
						kebab-case="-"
						PascalCase="-"
						snake_case="-"
						UPPER_CASE="-"
						random-attr="123"
					>
						<test-comp
							class="some-class"
							camelCase="camelCase"
							kebab-case="kebab-case"
							PascalCase="PascalCase"
							snake_case="snake_case"
						/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					TestComp,
				},
			});
			expect(wrapper.html()).toBe('<div random-attr="123" class="some-class" style="color: red; font: serif;">camelCase kebab-case PascalCase snake_case -</div>');
		});

		test('dont apply if inheritAttrs: false', () => {
			const NoInheritAttrs = {
				...TestComp,
				inheritAttrs: false,
			};

			const wrapper = mount({
				template: `
					<vnode-syringe
						class="static-class"
						:class="['dynamic-class', 2, ['3', 2]]"
						style="color:red"
						:style="{ font: 'serif' }"
						a="1"
						:b="2"
						:c="'3'"
						camelCase="-"
					>
						<no-inherit-attrs/>
					</vnode-syringe>
				`,
				components: {
					VnodeSyringe,
					NoInheritAttrs,
				},
			});
			expect(wrapper.html()).toBe('<div class="static-class dynamic-class 3" style="color: red; font: serif;">- </div>');
		});

		describe('event-handlers', () => {
			test('dont apply without v-on="$listeners"', async () => {
				const NoInheritListeners = {
					...TestComp,
					template: '<div></div>',
				};

				const onClick = jest.fn();
				const onFocus = jest.fn();

				const wrapper = mount({
					template: `
						<vnode-syringe
							@click="onClick"
							@focus="onFocus"
						>
							<no-inherit-listeners />
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
						NoInheritListeners,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).not.toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).not.toHaveBeenCalled();
			});

			test('apply new @handler', async () => {
				const onClick = jest.fn();
				const onFocus = jest.fn();

				const wrapper = mount({
					template: `
						<vnode-syringe
							@click="onClick"
							@focus="onFocus"
						>
							<test-comp />
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
						TestComp,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).toHaveBeenCalled();
			});

			test('preserve existing @handler', async () => {
				const onClick = jest.fn();
				const onFocus = jest.fn();

				const wrapper = mount({
					template: `
						<vnode-syringe
							@click="onClick"
							@focus="onFocus"
						>
							<test-comp @click=""/>
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
						TestComp,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).not.toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).toHaveBeenCalled();
			});

			test('apply new @handler.native', async () => {
				const NoInheritListeners = {
					...TestComp,
					template: '<div></div>',
				};

				const onClick = jest.fn();
				const onFocus = jest.fn();

				const wrapper = mount({
					template: `
						<vnode-syringe
							@click.native="onClick"
							@focus.native="onFocus"
						>
							<no-inherit-listeners />
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
						NoInheritListeners,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).toHaveBeenCalled();
			});

			test('preserve existing @handler.native', async () => {
				const NoInheritListeners = {
					...TestComp,
					template: '<div></div>',
				};

				const onClick = jest.fn();
				const onFocus = jest.fn();

				const wrapper = mount({
					template: `
						<vnode-syringe
							@click.native="onClick"
							@focus.native="onFocus"
						>
							<no-inherit-listeners @click.native=""/>
						</vnode-syringe>
					`,
					components: {
						VnodeSyringe,
						NoInheritListeners,
					},
					methods: {
						onClick,
						onFocus,
					},
				});
				await wrapper.trigger('click');
				expect(onClick).not.toHaveBeenCalled();
				await wrapper.trigger('focus');
				expect(onFocus).toHaveBeenCalled();
			});

			test('multiple elements', async () => {
				const NoInheritListeners = {
					...TestComp,
					template: '<div></div>',
				};
				const onClick = jest.fn();
				const onNativeClick = jest.fn();

				const wrapper = mount({
					template: `
						<div>
							<vnode-syringe
								@click="onClick"
								@click.native="onNativeClick"
							>
								<no-inherit-listeners
									class="some-class"
									@click=""
								/>
								<no-inherit-listeners
									:class="'some-class'"
								/>
								<div
									style="color:blue"
								/>
								<no-inherit-listeners
									:style="{color:'blue'}"
								/>
								<test-comp />
								<test-comp
									b="c"
								/>
								<test-comp
									b="c"
									@click
								/>
							</vnode-syringe>
						</div>
					`,
					components: {
						VnodeSyringe,
						TestComp,
						NoInheritListeners,
					},
					methods: {
						onClick,
						onNativeClick,
					},
				});

				const divs = wrapper.findAll('div');
				await divs.trigger('click');
				expect(onClick).toHaveBeenCalledTimes(3);
				expect(onNativeClick).toHaveBeenCalledTimes(6);
			});
		});
	});
});
