/**
 * 
 */

function main() {
	d3.csv('pub_checkin.csv', d => _.mapKeys({ ...d, Count: +d.count, VenueId: d.venueId, VenueType: d.venueType }, (v, k) => _.camelCase(k)))
		.then(function(pubData) {
			d3.csv('pubs_processed.csv', d => _.mapKeys({PubId: +d.pubId, HourlyCost: +d.hourlyCost, MaxOccupancy: +d.maxOccupancy, BuildingId: +d.buildingId, Longitude: +d.longitude, Latitude: +d.latitude }, (v, k) => _.camelCase(k)))
				.then(function(pub_radar) {

					// Find the track information by "trackName", mostly we want the trackId

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

					var venue_list = ["1798", "894", "893", "892", "1799", "443", "1342", "1344", "1343", "442", "1800", "444"];

					// add the options to the button
					var venue = "1798";
					d3.select("#selectButton2")
						.selectAll('myOptions')
						.data(venue_list)
						.enter()
						.append('option')
						.text(function(d) { return d; }) // text showed in the menu
						.attr("value", function(d) { return d; });


					function m2(venue, year) {

						//d3.select("svg").remove();
						const height = 600;
						const width = 1118;

						//const svg = d3.select(DOM.svg(width, height)); 

						var svg = d3.selectAll("#svg1")
							.append("svg")
							.attr("width", width)
							.attr("height", height);

						const margin = { left: 100, top: 10, right: 10, bottom: 20 };


						//const venue = 1804;

						// Go through a chain of process with "spotifyDailyGlobalRanking" dataset
						const data = _.chain(pubData)
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
						console.log(pub_radar.map(d=>d.pubId));
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
							// Use "maxDailyStreams" instead of calculating from the filtered data to keep the
							// chart consistent across different songs
							//.domain([0, 3800]);
							.domain([0, (d3.max(data.map(d => d.count)) + 200)]);
						//.domain(d3.extent(data.map(d => d.count)));

						let color = d3.scaleSequential()
							.domain([d3.min(data.map(d => d.count)), d3.max(data.map(d => d.count))])
							.interpolator(d3.interpolateBlues);

						svg.append('g')
							.call(d3.axisLeft(yScale).tickFormat(d3.format('.2s')))
							.attr('transform', `translate(${margin.left},0)`);

						// Make the column chart with "rect", its attributes can be found in the documentation:
						// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
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


					function radarChart(venue) {
						
						//d3.select("#svg2").remove();
						// Radius of radar chart
						const r = 300;
						
						const margin = { left: 30, top: 30, right: 30, bottom: 30 };
						// Need to handle the view box carefully, to ensure the plot is centered, surrounded by margins
						var svg2 = d3.selectAll("#svg2")
							.append("svg")
							.attr("width", r*2)
							.attr("height", r*2)
							.attr('viewBox',`-${margin.left},-${margin.top},${r * 2 + margin.left + margin.right},${r * 2 + margin.bottom + margin.top}`);

						
				

						const dimensions = ['PubId', 'HourlyCost', 'MaxOccupancy', 'BuildingId', 'Latitude', 'Longitude'];

						// Line generator for radial lines
						const radialLine = d3.lineRadial();

						// Radar chart is a circle, the length of each axis is the radius of the circle
						// Mapping 0 - 255 to 0 - r
						const yScale = d3.scaleLinear()
							.range([0, r])
							.domain([0, 255]);

						// The default tick marks is not ideal, override it with a customized one
						const ticks = [50, 100, 150, 200, 255];
						// One axis for each dimension
						dimensions.forEach((dimension, i) => {
							// We first build an axis at the origin, enclosed inside a "g" element
							// then transform it to the right position and right orientation
							const g = svg2.append('g')
								.attr('transform', `translate(${r}, ${r}) rotate(${i * 60})`);

							// Combining a left oriented axis with a right oriented axis
							// to make an axis with tick marks on both side
							// Reminded that, these are "g" elements inside the outer "g" element
							// and will be transformed to the right position with its parent element
							g.append('g')
								.call(d3.axisLeft(yScale).tickFormat('').tickValues(ticks));
							g.append('g')
								.call(d3.axisRight(yScale).tickFormat('').tickValues(ticks));

							// Add a text label for each axis, put it at the edge
							// Again, this "text" element is inside the outer "g" element,
							// and will be transformed to the right position with its parent element
							g.append('text')
								.text(dimension)
								.attr('text-anchor', 'middle')
								.attr('transform', `translate(0, -${r + 10})`);
						});
						
						
						/*const data1 = _.chain(pub_radar)
							// Filter the dataset to only the data of selected track
							.filter(function(d){return d.pubId === venue}).value;
							//.value();*/
							
						//const data1 = pub_radar.filter(function(d){return d.pubId === venue})
						console.log(pub_radar.map(d=>d.pubId));
						// Line for the base stats of Snorlax
						svg2.append('g')
							.selectAll('path')
							.data(pub_radar)
							.enter()
							.filter(function(d) {return d.pubId === venue}) 
							.append('path')
							.attr('d', d =>
								radialLine([
									d.pubId,
									d.hourlyCost,
									d.maxOccupancy,
									d.buildingId,
									d.latitude,
									d.longitude,
									d.pubId
								].map((v, i) => [Math.PI * 2 * i / 6 /* radian */, yScale(v) /* distance from the origin */]))
							)
							// Move to the center
							.attr('transform', `translate(${r}, ${r})`)
							.attr('stroke', 'SteelBlue')
							.attr('stroke-width', 5)
							.attr('fill', 'rgba(70, 130, 180, 0.3)');
						
						// Gird lines for references
						svg2.append('g')
							.selectAll('path')
							.data(ticks)
							.enter()
							.append('path')
							.attr('d', d => radialLine(_.range(7).map((v, i) => [Math.PI * 2 * i / 6, yScale(d)])))
							.attr('transform', `translate(${r}, ${r})`)
							.attr('stroke', 'grey')
							.attr('opacity', 0.5)
							.attr('fill', 'none');

						svg2.node();
					}



					function update(venue, year) {
						console.log(venue, year);
						d3.select("svg").remove();
						//d3.select("#svg2").remove();
						m2(venue, year);
						radarChart(venue);
						

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
					})

				})
		})
}