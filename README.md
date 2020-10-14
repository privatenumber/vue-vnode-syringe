# :syringe: vNode Syringe [![Latest version](https://badgen.net/npm/v/vue-vnode-syringe)](https://npm.im/vue-vnode-syringe) [![Monthly downloads](https://badgen.net/npm/dm/vue-vnode-syringe)](https://npm.im/vue-vnode-syringe) [![Install size](https://packagephobia.now.sh/badge?p=vue-vnode-syringe)](https://packagephobia.now.sh/result?p=vue-vnode-syringe) [![Bundle size](https://badgen.net/bundlephobia/minzip/vue-vnode-syringe)](https://bundlephobia.com/result?p=vue-vnode-syringe)

Add _attributes_ and _event-listeners_ to component `<slot>`s

```html
<template>
    <div>
        <vnode-syringe
            class="new-class"
            @click="handleClick"
        >
            <slot />   ⬅ The class and event-listener gets added to every element passed in
        </vnode-syringe>
    </div>
</template>
```

## 🙋‍♂️ Why?
- **🔥 Add attributes & event-listeners** to content passed into the `<slot>`!
- **🧠 Smart merging strategies** Pick between merging, overwriting, or falling-back!
- **🐥 Tiny** `985 B` minzipped!

## 🚀 Install
```sh
npm i vue-vnode-syringe
```

## 💠 Merging strategies

### Fallback
This is the _default behavior_, and the class `new-class` and event-listener `newOnClick` only gets added if there isn't one added yet.

```html
<vnode-syringe
    class="new-class"
    @click="newOnClick"
>
    <slot />
</vnode-syringe>
```

For example, given the following `<slot>` content, only the event-listener `newOnClick` will be added:

```html
<div class="some-class">
    some content
</div>
```

### Overwrite `!`
Add `!` at the end of the attribute or event-listener to overwrite what exists.

```html
<vnode-syringe
    class!="new-class"
    @click!="newOnClick"
>
    <slot />
</vnode-syringe>
```

For example, given the following `<slot>` content, both the class and event-listener will _overwrite_ the existing class and event-listener.

```html
<div
    class="some-class"
    @click="existing"
>
    some content
</div>
```

### Merge `&`
Add `&` at the end of the attribute or event-listener to merge with what exists.

```html
<vnode-syringe
    class&="new-class"
    @click&="newOnClick"
>
    <slot />
</vnode-syringe>
```

For example, given the following `<slot>` content, both the class and event-listener will _merge_ with the existing class and event-listener. When merging event-listeners, both event-listeners will be called.

```html
<div
    class="some-class"
    @click="existing"
>
    some content
</div>
```

## 👨🏻‍🏫 Examples
Have you ever wanted to add classes or event-listeners on content passed into a slot? vNode Syringe lets you do just that!

Just wrap the `<slot>` element with vNode Syringe, and start adding attributes to it and they will be inherited by every immediate element resolved by the slot.

<details>
    <summary>
        <strong>Demo 1:</strong> Passing down attributes
        <a href="https://jsfiddle.net/hirokiosame/k4wyuq9o/"><img align="center" src="https://img.shields.io/badge/JSFiddle-Open%20Demo-blue/?logo=jsfiddle&logoColor=lightblue"></a>
    </summary>

<br>

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
</details>


<details>
    <summary>
        <strong>Demo 2:</strong> Merging and Overwriting classes
        <a href="https://jsfiddle.net/hirokiosame/9qpygc8w/"><img align="center" src="https://img.shields.io/badge/JSFiddle-Open%20Demo-blue/?logo=jsfiddle&logoColor=lightblue"></a>
    </summary>

<br>

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

         <!-- Gets overwritten to button button-group__button -->
        class="button"

        <!-- Gets overwritten to type="button" -->
        type="submit"

        <!-- Will be inherit parent's disabled state -->
    >
        Button 1
    </button>

    <button
         <!-- Gets overwritten to button button-group__button -->
        class="button"

        <!-- Won't inherit parent's disabled state -->
        :disabled="false"
    >
        Button 2
    </button>
</button-group>
```
</details>

## 💁‍♀️ FAQ
### How can I add attributes/event-listeners to a specific element in the `<slot>`?

You can use [Subslot](https://github.com/privatenumber/vue-subslot) to pick out specific elements in the slot.

For example, if you only want to accept `<button>`s in your slot:

```vue
<template>
    <div class="button-group">
        <vnode-syringe
            class&="button-group-item"
            @click="onClick"
        >
            <subslot element="button" />
        </vnode-syringe>
    </div>
</template>

<script>
import Subslot from 'vue-subslot';
import vnodeSyringe from 'vue-vnode-syringe';

export default {
    components: {
        Subslot,
        vnodeSyringe
    },

    ...,

    methods: {
        onClick() {
            ...
        }
    }
};
</script>
```

## 👨‍👩‍👧 Related
- [vue-proxi](https://github.com/privatenumber/vue-proxi) - 💠 Tiny proxy component
- [vue-subslot](https://github.com/privatenumber/vue-subslot) - 💍 Pick 'n choose what you want from a slot passed into your Vue component
- [vue-pseudo-window](https://github.com/privatenumber/vue-pseudo-window) - 🖼 Declaratively interface window/document in your Vue template
- [vue-vnode-syringe](https://github.com/privatenumber/vue-v) - render vNodes via component template
- [vue-frag](https://github.com/privatenumber/vue-frag) - 🤲 Directive to return multiple root elements

