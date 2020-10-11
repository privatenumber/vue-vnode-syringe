module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				loose: true,
				targets: 'ie 11',
			},
		],
	],
	env: {
		test: {
			presets: [
				[
					'@babel/preset-env',
					{
						useBuiltIns: 'usage',
						corejs: 3,
					},
				],
			],
		},
	},
};
