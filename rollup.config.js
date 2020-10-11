import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';

const isProd = process.env.NODE_ENV === 'production';

const rollupConfig = {
	input: 'src/vnode-syringe.js',
	plugins: [
		babel(),
		isProd && terser({
			mangle: {
				properties: {
					regex: /^M_/,
				},
			},
		}),
		isProd && filesize(),
	],
	output: {
		dir: 'dist',
		format: 'umd',
		name: 'VnodeSyringe',
	},
};

export default rollupConfig;
