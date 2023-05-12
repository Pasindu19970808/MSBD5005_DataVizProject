/**
 * 
 */

function main(venue, year) {
	d3.csv('rest_checkin.csv', d => _.mapKeys({ ...d, Count: +d.count, VenueId: +d.venueId, VenueType: d.venueType }, (v, k) => _.camelCase(k)))
		.then(
			function(restaurantData) {


				const height = 600;
				const width = 1118;

				//const svg = d3.select(DOM.svg(width, height)); 

				var svg = d3.selectAll("#svg1")
					.append("svg")
					.attr("width", width)
					.attr("height", height);

				const margin = { left: 100, top: 10, right: 10, bottom: 20 };

				// Find the track information by "trackName", mostly we want the trackId

				//var year_list = ["2022", "2023"];

				// add the options to the button
				/*
				var year = '2022';
				d3.select("#selectButton")
					.selectAll('myOptions')
					.data(year_list)
					.enter()
					.append('option')
					.text(function(d) { return d; }) // text showed in the menu
					.attr("value", function(d) { return d; });

				var venue_list = [1804, 895, 446, 1801, 1348, 1802, 1803, 1347, 1345, 1805, 897,
					899, 449, 1346, 448, 445, 447, 896, 898, 1349];

				// add the options to the button
				var venue = 1804;
				d3.select("#selectButton2")
					.selectAll('myOptions')
					.data(venue_list)
					.enter()
					.append('option')
					.text(function(d) { return d; }) // text showed in the menu
					.attr("value", function(d) { return d; });

*/
				//const venue = 1804;

				// Go through a chain of process with "spotifyDailyGlobalRanking" dataset
				const data = _.chain(restaurantData)
					// Filter the dataset to only the data of selected track
					.filter(d => d.venueId === venue)
					.filter(d => d.year === year)
					// Group data by month
					.groupBy(d => d.date.substring(0, 7))
					// Calculate the average of each month
					.map((list, date) => ({ date, count: _.sumBy(list, 'count') }))
					// Lodash keeps track of the chain with other information, .value() declares we are
					// done with the process, and returns the end result, which in our case, is an array
					// of the daily average streams of each month
					.value();

				const xScale = d3.scaleBand()
					.padding(0.1)
					.range([margin.left, width - margin.right])
					.domain(_.range(1, 13).map(d => moment(year + `-${d}`, 'YYYY-M').format('YYYY-MM')));

				svg.append('g')
					.call(d3.axisBottom(xScale))
					.attr('transform', `translate(0,${height - margin.bottom})`);

				const yScale = d3.scaleLinear()
					.range([height - margin.bottom, margin.top])
					// Use "maxDailyStreams" instead of calculating from the filtered data to keep the
					// chart consistent across different songs
					.domain([0, 1500]);

				let color = d3.scaleSequential()
					.domain([d3.min(data.map(d => d.count)), d3.max(data.map(d => d.count))])
					.interpolator(d3.interpolateBlues);

				svg.append('g')
					.call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')))
					.attr('transform', `translate(${margin.left},0)`);

				// Make the column chart with "rect", its attributes can be found in the documentation:
				// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
				var graph = svg.selectAll('rect')
					.data(data)
					.enter()
					.append('rect')
					.attr('x', d => xScale(d.date))
					.attr('y', d => yScale(d.count))
					.attr('height', d => yScale(0) - yScale(d.count))
					.attr('width', xScale.bandwidth())
					.attr('fill', d => color(d.count))
					.append('title')
					.text(d => `${d.date}: ${Math.round(d.count)}`);

				svg.node();



				function update(venue, year) {
					console.log(venue, year);
					const data = _.chain(restaurantData)
						// Filter the dataset to only the data of selected track
						.filter(d => d.venueId === venue)
						.filter(d => d.year === year)
						// Group data by month
						.groupBy(d => d.date.substring(0, 7))
						// Calculate the average of each month
						.map((list, date) => ({ date, count: _.sumBy(list, 'count') }))
						// Lodash keeps track of the chain with other information, .value() declares we are
						// done with the process, and returns the end result, which in our case, is an array
						// of the daily average streams of each month
						.value();
					xScale.domain(_.range(1, 13).map(d => moment(year + `-${d}`, 'YYYY-M').format('YYYY-MM')));
					graph
						.data(data)
						.transition()
						.duration(1000)
						.attr('x', d => xScale(d.date))
						.attr('y', d => yScale(d.count))
						.attr('height', d => yScale(0) - yScale(d.count))
						.attr('width', xScale.bandwidth())
						.attr('fill', d => color(d.count))
						.text(d => `${d.date}: ${Math.round(d.count)}`);

				}

				d3.select("#selectButton").on("change", function(event, d) {
					// recover the option that has been chosen
					const year = d3.select(this).property("value")
					d3.select("graph").remove()
					// run the updateChart function with this selected option
					update(venue, year)
				});
				d3.select("#selectButton2").on("change", function(event, d) {
					// recover the option that has been chosen
					const venue = d3.select(this).property("value")
					d3.select("graph").remove()
					// run the updateChart function with this selected option
					update(venue, year)
				});

			})
};