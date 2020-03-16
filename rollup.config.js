import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';

const isProd = process.env.NODE_ENV === 'production';

export default {
	input: 'src/vnode-syringe.js',
	plugins: [
		babel({
			exclude: 'node_modules/**',
		}),
		// isProd && terser(),
		filesize(),
	],
	output: {
		dir: 'dist',
		format: 'umd',
		name: 'VnodeSyringe',
	},
};
