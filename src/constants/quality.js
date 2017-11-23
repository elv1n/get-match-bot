const NAMES = [
	{
		p: 144,
		name: 'mobile'
	},
	{
		p: 240,
		name: 'lowest'
	},
	{
		p: 360,
		name: 'low'
	},
	{
		p: 480,
		name: 'sd'
	},
	{
		p: 576,
		name: 'sd'
	},
	{
		p: 720,
		name: 'hd'
	},
	{
		p: 1080,
		name: 'fullhd'
	}
];
const INDEX = NAMES.map(({ name }) => name);
const INDEX_P = NAMES.map(({ p }) => p);
module.exports = { NAMES, INDEX, INDEX_P };
