/**
 * 
 */

function main() {
	d3.csv('rest_checkin.csv', d => _.mapKeys({ ...d, Count: +d.count, VenueId: d.venueId, VenueType: d.venueType }, (v, k) => _.camelCase(k)))
	.then(function (restaurantData){

	

	var year_list = ["2022", "2023"];

	// add the options to the button
	var year = '2022';
	d3.select("#selectButton")
		.selectAll('myOptions')
		.data(year_list)
		.enter()
		.append('option')
		.text(function(d) { return d; }) // text showed in the menu
		.attr("value", function(d) { return d; });

	var venue_list = ["1804", "895", "446", "1801", "1348", "1802", "1803", "1347", "1345", "1805", "897",
		"899", "449", "1346", "448", "445", "447", "896", "898", "1349"];

	// add the options to the button
	var venue = 1804;
	d3.select("#selectButton2")
		.selectAll('myOptions')
		.data(venue_list)
		.enter()
		.append('option')
		.text(function(d) { return d; }) // text showed in the menu
		.attr("value", function(d) { return d; });


	function m2(venue, year) {

		d3.select("svg").remove();
		const height = 600;
		const width = 1118;

		//const svg = d3.select(DOM.svg(width, height)); 

		var svg = d3.selectAll("#svg1")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		const margin = { left: 100, top: 10, right: 10, bottom: 20 };

		
		//const venue = 1804;

		// Go through a chain of process with "restaurantData" dataset
		const data = _.chain(restaurantData)
			// Filter the dataset to only the data of selected venue and year
			.filter(d => d.venueId === venue)
			.filter(d => d.year === year)
			// Group data 
			.groupBy(d => d.date.substring(0, 7))
			// Calculate the sum of each month
			.map((list, date) => ({ date, count: _.sumBy(list, 'count') }))
			.value();

		const xScale = d3.scaleBand()
			.padding(0.1)
			.range([margin.left, width - margin.right])
			.domain(_.range(1, 13).map(d => moment(year + `-${d}`, 'YYYY-M').format('YYYY-MM')));

		svg.append('g')
			.call(d3.axisBottom(xScale))
			.attr('transform', `translate(0,${height - margin.bottom})`);
			//.attr('transform', `translate(0,${height})`);

		const yScale = d3.scaleLinear()
			.range([height - margin.bottom, margin.top])

			//.domain([0, 3800]);
			.domain([0,(d3.max(data.map(d => d.count))+200)]);
			//.domain(d3.extent(data.map(d => d.count)));

		let color = d3.scaleSequential()
			.domain([d3.min(data.map(d => d.count)), d3.max(data.map(d => d.count))])
			.interpolator(d3.interpolateBlues);

		svg.append('g')
			.call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')))
			.attr('transform', `translate(${margin.left},0)`);


		svg.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('x', d => xScale(d.date))
			.attr('y', d => yScale(d.count))
			.attr('height', d => yScale(0) - yScale(d.count))
			//.attr('height', d => yScale(50) - yScale(d.count))
			.attr('width', xScale.bandwidth())
			.attr('fill', d => color(d.count))
			.append('title')
			.text(d => `${d.date}: ${Math.round(d.count)}`);

		svg.node();
	}
	function update(venue, year) {
		console.log(venue, year);
		m2(venue, year);

	}
	d3.select("#selectButton").on("change", function(event, d) {
		// recover the option that has been chosen
		year = d3.select(this).property("value");
		// run the updateChart function with this selected option
		update(venue, year);
	});

	d3.select("#selectButton2").on("change", function(event, d) {
		// recover the option that has been chosen
		venue = d3.select(this).property("value");
		// run the updateChart function with this selected option
		update(venue, year);
	});


})}