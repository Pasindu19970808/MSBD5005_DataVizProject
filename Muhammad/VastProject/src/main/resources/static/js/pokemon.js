/**
 * 
 
 
  
alert("Hello");
d3.select("body").append("p").text("New paragraph!");
d3 = require('d3@5');
d3 = require('d3', 'd3-svg-legend');
	_ = require('lodash');	
d3.select("#svg1").append("h").text("New paragraph!");
https://raw.githubusercontent.com/leoyuholo/learning-vis-tools/master/tutorial06/lab6/pokemon_tsne.csv
*/

function main(){
d3.csv('pokemon_tsne.csv', d => _.mapValues(d, s => isNaN(parseFloat(s)) ? s : parseFloat(s))).then(
function (pokemonBaseStats)
{
	
	const height = 600;
	const width = 1118; 
	
	//const svg = d3.select(DOM.svg(width, height)); 
	
	var svg = d3.selectAll("#svg1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    
	const margin = { left: 100, top: 10, right: 10, bottom: 20 }; 
	
	const xScale = d3.scaleLinear().range([margin.left, width - margin.right]).domain(d3.extent(pokemonBaseStats.map(d => d.pokedex_number)));

	svg.append('g').call(d3.axisBottom(xScale)).attr('transform',`translate(0,${height - margin.bottom})`); 
	
	const yScale = d3.scaleLinear() .range([height - margin.bottom, margin.top]).domain(d3.extent(pokemonBaseStats.map(d => d.base_total)));
	
	// const colorScale2 = d3.scaleOrdinal().range(d3.schemeCategory10) 
	
	const colorScale2 = d3.scaleOrdinal() .range(d3.schemeCategory10).domain(d3.extent(pokemonBaseStats.map(d => d.type1))); 
	
	svg.append('g').call(d3.axisLeft(yScale)).attr('transform',`translate(${margin.left},0)`); 
	
	svg.selectAll('circle').data(pokemonBaseStats).enter().append('circle').attr('cy', d => yScale(d.base_total)).attr('r', 5).attr('fill', d => colorScale2(d.type1)).attr('cx', d => xScale(d.pokedex_number)); 
	
	svg.node();
})
}

