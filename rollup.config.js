import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';

const isProd = process.env.NODE_ENV === 'production';

const rollupConfig = {
	input: 'src/vnode-syringe.js',
	plugins: [
		babel(),
		isProd && terser(),
		isProd && filesize(),
	],
	output: [
		{
			format: 'umd',
			file: 'dist/vnode-syringe.js',
			name: 'VnodeSyringe',
			exports: 'default',
		},
		{
			format: 'es',
			file: 'dist/vnode-syringe.esm.js',
		},
	],
};

export default rollupConfig;
