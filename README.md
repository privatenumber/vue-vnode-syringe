# :syringe: vNode Syringe <a href="https://npm.im/vue-vnode-syringe"><img src="https://badgen.net/npm/v/vue-vnode-syringe"></a> <a href="https://npm.im/vue-vnode-syringe"><img src="https://badgen.net/npm/dm/vue-vnode-syringe"></a> <a href="https://packagephobia.now.sh/result?p=vue-vnode-syringe"><img src="https://packagephobia.now.sh/badge?p=vue-vnode-syringe"></a>
> 🧬 Mutate your vNodes with vNode Syringe 💉

## :rocket: Quick setup
#### Install
```sh
npm i vue-vnode-syringe
```

#### Import and use as a Vue component
```js
import vnodeSyringe from 'vue-vnode-syringe';

export default {
	...
	components: {
		vnodeSyringe
	}
	...
}
```

## :beginner: Use case
Have you ever wanted to add classes or event-listeners on content passed into a slot? vNode Syringe lets you do just that!

Just wrap the `<slot>` element with vNode Syringe, and start adding attributes to it and they will be inherited by every immediate element resolved by the slot.

### Demo 1: Passing down attributes
In this demo, the `class="button-group__button"` attribute is passed down to all of its `<slot>` content.

_ButtonGroup.vue_
```html
<template>
	<div class="button-group">
		<vnode-syringe
			class="button-group__button"
		>
			<slot />
		</vnode-syringe>
	</div>
</template>

<style scoped>
.button-group { ... }
.button-group__button { ... }
</style>
```

_Usage.vue_
```html
<button-group>
	<button>Button 1</button> <!-- Will render with the `button-group__button` class -->
	<button>Button 2</button> <!-- Will render with the `button-group__button` class -->
	<button>Button 3</button> <!-- Will render with the `button-group__button` class -->
</button-group>
```

### Demo 2: Merging and Overwriting classes [![JSFiddle Demo]](https://img.shields.io/badge/JSFiddle-Open%20Demo-blue/?logo=jsfiddle&logoColor=lightblue)](https://jsfiddle.net/hirokiosame/461yq0om/)
By default, vNode Syringe only adds the attribute/event-listener if it doesn't already exist. To merge with or overwrite the existing one, use the  `&` (merge) or `!` (overwrite) suffix.

_ButtonGroup.vue_
```html
<template>
	<div class="button-group">
		<vnode-syringe

			<!-- Merge with existing class -->
			class&="button-group__button"

			<!-- Force all buttons to have type="button" -->
			type!="button"

			<!-- Only gets added if child doesn't specify `disabled` -->
			:disabled="disabled"
		>
			<slot />
		</vnode-syringe>
	</div>
</template>

<script>
export default {
	props: {
		disabled: Boolean
	}
};
</script>

<style scoped>
.button-group { ... }
.button-group__button { ... }
</style>
```

_Usage.vue_
```html
<button-group disabled>
	<button

		 <!-- Renders as `button button-group__button` -->
		class="button"

		<!-- Will be overwritten to type="button" -->
		type="submit"

		<!-- Will be inherit parent's disabled state -->
	>
		Button 1
	</button>

	<button
		 <!-- Renders as `button button-group__button` -->
		class="button"

		<!-- Won't inherit parent's disabled state -->
		:disabled="false"
	>
		Button 2
	</button>
</button-group>
```

### Demo 3: Passing down attributes to specific elements
But what if the user passes in a non-button element? Combining it with [Subslot](https://github.com/privatenumber/vue-subslot), we can filter out what we want from the slot and apply it specifically to the `<button>` element.

_ButtonGroup.vue_
```html
<template>
	<div class="button-group">
		<vnode-syringe
			class="button-group__button"
		>
			<subslot
				element="button"
			/>
		</vnode-syringe>
	</div>
</template>
```

_Usage.vue_
```html
<button-group>
	<button>Button 1</button> <!-- Will render with the `button-group__button` class -->
	...
	<div>Some noise</div> <!-- Won't be rendered -->
	Hello <!-- Won't be rendered -->
</button-group>
```
