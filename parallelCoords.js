parallelCoords = [{filename:'parallelCoords.csv'}]
const dimensions = ['Eating','Recreating','Workplace','TravelMinutes','NumActivities','Home','Leave Home','Come Back','joviality']

//https://stackoverflow.com/questions/29573481/d3-js-scatterplot-with-different-colors-and-symbols-issues-encountered (Color Scale)
let plotClusterFunc = (result,svgnum) => {
    let svgitem = d3.select(`#parallelCoords`)
    .attr('width',400)
    .attr('height',400)
    const width = 300
    const height = 300
    const margin = {
    left: 60, top: 10, right: 10, bottom: 20
    }

    minX1 = _.minBy(result,function (o){return o.X1}).X1
    maxX1 = _.maxBy(result,function (o){return o.X1}).X1
    minX2 = _.minBy(result,function (o){return o.X2}).X2
    maxX2 = _.maxBy(result,function (o){return o.X2}).X2
    console.log(minX1)
    
    const xScale = d3.scaleLinear()
    .domain([minX1 - 10,maxX1 + 10])
    .range([margin.left,width - margin.right])

    const yScale = d3.scaleLinear()
    .domain([minX2 - 10,maxX2 + 10])
    .range([height - margin.bottom,margin.top])

    //add scales
    svgitem.append('g').call(d3.axisBottom(xScale))
    .attr('transform',`translate(0,${height - margin.bottom})`)


    svgitem.append('g').call(d3.axisLeft(yScale))
    .attr('transform',`translate(${margin.left},0)`)

    svgitem.append('text')
    .attr('text-anchor','middle')
    .attr('x',width/2)
    .attr('y',margin.top)
    .text(`TSNE Perplexity : ${svgnum*10}`)

    svgitem.append('text')
    .attr('text-anchor','end')
    .attr('x',width/2 + 100)
    .attr('y',height + margin.bottom)
    .text('Reduced Dimension 1')

    svgitem.append('text')
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x", -50)
    .text("Reduced Dimension 2")

    // Define the div for the tooltip
    // var tooltip = d3.select("svg")
    // .append("div")
    // .style("opacity", 0)
    // .attr("class", "tooltip")
    // .style("background-color", "white")
    // .style("border", "solid")
    // .style("border-width", "1px")
    // .style("border-radius", "5px")
    // .style("padding", "10px")

    // var mouseover = function(d) {
    //     tooltip
    //       .style("opacity", 1)
    //   }
    
    //   var mousemove = function(e,d) {
    //     coords = d3.pointer(e)
    //     tooltip
    //       .html(`Participant ID ${d.pID}. Cluster ${d.Cluster}`)
    //       .style("left", (coords[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    //       .style("top", (coords[1]) + "px")
    //   }
    
    //   // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    //   var mouseleave = function(d) {
    //     tooltip
    //       .transition()
    //       .duration(200)
    //       .style("opacity", 0)
    //   }

    svgitem.selectAll('circle')
    .data(result)
    .enter()
    .append('circle')
    .attr('cx',d=>xScale(d.X1))
    .attr('cy',d=>yScale(d.X2))
    .attr('r',2)
    .style('fill',function (d){
        if (d.Cluster == 1){
            return 'green'
        }
        else if (d.Cluster == 2){
            return 'red'
        }
        else{
            return 'orange'
        }
    })
    // .on('mouseover',mouseover)
    // .on('mousemove',mousemove)
    // .on('mouseleave',mouseleave)




}


let processPromise = (result) => {
    console.log(result)
    participantData = []
    // for (participant of result){
    //     participantData.push({pID:participant.pID,X1:participant.X1,X2:participant.X2,Cluster:participant.Cluster})
    // }
    // plotClusterFunc(participantData,val)

}

const promise1 = d3.csv(parallelCoords[0].filename,
    function(d){
        return {
            pID:+d.pID,
            Cluster:+d.Cluster,
            eating:+d.Eating,
            recreation:+d.Recreating,
            workplace:+d.WorkPlace,
            travelMinutes:+d.TravelMinutes,
            numActivities:+d.NumActivities,
            home:+d.Home,
            leaveHome:+d['Leave Home'],
            comeback:+d['Come Back'],
            joviality:+d.joviality

        }
    })

promise1.then((result) => processPromise(result))


