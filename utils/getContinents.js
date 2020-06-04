const axios = require('axios');
const { cyan, dim } = require('chalk');
const numberFormat = require('./numberFormat');
const { sortingContinentKeys } = require('./table.js');
const to = require('await-to-js').default;
const handleError = require('cli-handle-error');
const orderBy = require('lodash.orderby');
const sortValidation = require('./sortValidation.js');

module.exports = async (
	spinner,
	output,
	states,
	continents,
	{ sortBy, limit, reverse, bar, json }
) => {
	if (continents && !states && !bar) {
		sortValidation(sortBy, spinner);
		const [err, response] = await to(
			axios.get(`https://corona.lmao.ninja/v2/continents`)
		);
		handleError(`API is down, try again later.`, err, false);
		let allContinents = response.data;

		// Format.
		const format = numberFormat(json);

		// Sort & reverse.
		const direction = reverse ? 'asc' : 'desc';
		allContinents = orderBy(
			allContinents,
			[sortingContinentKeys[sortBy]],
			[direction]
		);

		// Limit.
		allContinents = allContinents.slice(0, limit);

		// Push selected data.
		allContinents.map((continent, count) => {
			output.push([
				count + 1,
				continent.continent,
				format(continent.cases),
				format(continent.todayCases),
				format(continent.deaths),
				format(continent.todayDeaths),
				format(continent.recovered),
				format(continent.active),
				format(continent.critical),
				format(continent.casesPerOneMillion)
			]);
		});

		spinner.stopAndPersist();
		const isRev = reverse ? `${dim(` & `)}${cyan(`Order`)}: reversed` : ``;
		if (!json) {
			spinner.info(`${cyan(`Sorted by:`)} ${sortBy}${isRev}`);
		}
		console.log(output.toString());
	}
};
