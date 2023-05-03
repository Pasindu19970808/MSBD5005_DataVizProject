dataArray = [{filename:'Perplexity_10.csv',svgnum:1},
{filename:'Perplexity_20.csv',svgnum:2},
{filename:'Perplexity_30.csv',svgnum:3},
{filename:'Perplexity_40.csv',svgnum:4},
{filename:'Perplexity_50.csv',svgnum:5},
{filename:'Perplexity_60.csv',svgnum:6},
{filename:'Perplexity_70.csv',svgnum:7},
{filename:'Perplexity_80.csv',svgnum:8},
{filename:'Perplexity_90.csv',svgnum:9}]
parallelCoords = [{filename:'parallelCoordsExpense.csv',svgnum:1}]
const dimensions = ['joviality','NumActivities','TravelMinutes','Recreating','Eating','Home','WorkPlace','Leave Home','Come Back',
                    'Average Expenses','Average Income']

// ['NumActivities','Eating','Recreating','WorkPlace','TravelMinutes','Home','Leave Home','Come Back','joviality']


//https://stackoverflow.com/questions/29573481/d3-js-scatterplot-with-different-colors-and-symbols-issues-encountered (Color Scale)
let plotClusterFunc = (result,svgnum) => {
    let svgitem = d3.select(`#svg${svgnum}`)
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

async function getminmax(promise){
    result = await promise
    return result

}

// let makeYscales = (d,res,height,margin) => {
//     return }
// }

let getYval = (func,d) =>{
    return func(d)
}

let getXval = (func,d) =>{
    return func(dimensions[d])
}

//to work with async function, define the function as async first
//then to obtain values that are read externally
//use another async function to be called inside this async function
//use await to wait until you get the result from the other async function
async function plotParallelCoords(data,svgnum){
    const mappeddata= data.map(d => dimensions.map(dimension => d[dimension]))
    // console.log(mappeddata)
    let yScales = []
    svgparallel = d3.select(`#parallelCoords${svgnum}`)
    .attr('width',1750)
    .attr('height',1250)
    width = 1500
    height = 1000
    const margin = {
        left: 60, top: 10, right: 10, bottom: 20
        }

    const minmax_promise = d3.json('minmax.json',function (d){
        return d})

    var res = await getminmax(minmax_promise)

    const xScaleParallel = d3.scalePoint()
    .range([margin.left,width - margin.right])
    .domain(dimensions)

    // for(d of dimensions){
    //     yScales[d] = d3.scaleLinear()
    //     .domain([res[d].Min,res[d].Max])
    //     .range([height - margin.bottom,margin.top])
    // }
    dimensions.forEach((d,i) => yScales.push(d3.scaleLinear()
    .domain([+res[d].Min,+res[d].Max])
    .range([height - margin.bottom,margin.top + 10])))


    svgparallel.append('g')
    .call(d3.axisBottom(xScaleParallel))
    .attr('transform',`translate(0,${margin.top - 15})`)
    .selectAll('path')
    .attr('stroke','none')

    
    

    dimensions.forEach((d,i) => svgparallel.append('g')
    .call(d3.axisLeft(yScales[i]))
    .attr('transform',`translate(${xScaleParallel(d)},${margin.top})`))

    // line generator
    const line  = d3.line()
    .x((d,i) => getXval(xScaleParallel,i))
    .y((d,i) => getYval(yScales[i],d))

    // const line  = d3.line()
    // .x((d,i) => xScaleParallel(i))
    // .y((d,i) => getYval(yScales[i],d))


    // xScaleParallel(dimensions[i]
    //d3 takes a single array, 
    //then put it in a nested array as [[1,2,3]]
    //then pass in [[1,2,3]]
    //in the line generator, it sends in each single value
    //at one time to get values. 
    //Remember that a single [1,2,3] corresponds to one line

    data.forEach((d2,i2) =>{
        console.log(d2)
        cluster = d2.Cluster
        data = dimensions.map(d => d2[d])
        svgparallel.append('g')
        .selectAll('path')
        .data([data])
        .enter()
        .append('path')
            .attr('d', d => line(d))
            .attr('fill', 'none')
            .attr('stroke', 
            function (){
                if (cluster == 1){
                    return 'green'
                }
                else if(cluster == 2){
                    return 'red'
                }
                else if(cluster == 3){
                    return 'orange'
                }
            })
            .attr('opacity','0.25')
        
        
    })

    d3.selectAll(`#parallelCoords${svgnum} .tick`).attr('font-size','1rem')
    
    
}



let processPromise = (result,val) => {
    participantData = []
    for (participant of result){
        participantData.push({pID:participant.pID,X1:participant.X1,X2:participant.X2,Cluster:participant.Cluster})
    }
    plotClusterFunc(participantData,val)

}

let processParallelPromise = (result,svgnum) => {  
    participantData = []
    for (participant of result){
        participantData.push({'pID':participant['pID'],
        'Cluster':participant['Cluster'],
        'Eating':participant['Eating'],
        'Recreating':participant['Recreating'],
        'WorkPlace':participant['WorkPlace'],
        'TravelMinutes':participant['TravelMinutes'],
        'NumActivities':participant['NumActivities'],
        'Home':participant['Home'],
        'Leave Home':participant['Leave Home'],
        'Come Back':participant['Come Back'],
        'joviality':participant['joviality'],
        'Average Expenses':participant['Average Expenses'],
        'Average Income':participant['Average Income']})
    }
    plotParallelCoords(participantData,svgnum)
}


const promise1 = d3.csv(dataArray[0].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise2 = d3.csv(dataArray[1].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise3 = d3.csv(dataArray[2].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise4 = d3.csv(dataArray[3].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise5 = d3.csv(dataArray[4].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise6 = d3.csv(dataArray[5].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise7 = d3.csv(dataArray[6].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise8 = d3.csv(dataArray[7].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })
const promise9 = d3.csv(dataArray[8].filename,
    function(d){
        return {
            pID:+d.pID,
            X1:+d.X1,
            X2:+d.X2,
            Cluster:+d.Cluster
        }
    })


const parallelCoordPromise1 = d3.csv(parallelCoords[0].filename,
    function(d){
        return {
            'pID':+d.pID,
            'Cluster':+d.Cluster,
            'Eating':+d.Eating,
            'Recreating':+d.Recreating,
            'WorkPlace':+d.WorkPlace,
            'TravelMinutes':+d.TravelMinutes,
            'NumActivities':+d.NumActivities,
            'Home':+d.Home,
            'Leave Home':+d['Leave Home'],
            'Come Back':+d['Come Back'],
            'joviality':+d.joviality,
            'Average Expenses':+d['Average Expenses'],
            'Average Income':+d['Average Income']
        }
    })

// const parallelCoordPromise2 = d3.csv(parallelCoords[1].filename,
//     function(d){
//         return {
//             'pID':+d.pID,
//             'Cluster':+d.Cluster,
//             'Eating':+d.Eating,
//             'Recreating':+d.Recreating,
//             'WorkPlace':+d.WorkPlace,
//             'TravelMinutes':+d.TravelMinutes,
//             'NumActivities':+d.NumActivities,
//             'Home':+d.Home,
//             'Leave Home':+d['Leave Home'],
//             'Come Back':+d['Come Back'],
//             'joviality':+d.joviality

//         }
//     })



    // const dimensions = ['NumActivities','Eating','Recreating','WorkPlace',\
    // 'TravelMinutes','Home','Leave Home','Come Back','joviality']
promise1.then((result) => processPromise(result,dataArray[0].svgnum))
promise2.then((result) => processPromise(result,dataArray[1].svgnum))
promise3.then((result) => processPromise(result,dataArray[2].svgnum))
promise4.then((result) => processPromise(result,dataArray[3].svgnum))
promise5.then((result) => processPromise(result,dataArray[4].svgnum))
promise6.then((result) => processPromise(result,dataArray[5].svgnum))
promise7.then((result) => processPromise(result,dataArray[6].svgnum))
promise8.then((result) => processPromise(result,dataArray[7].svgnum))
promise9.then((result) => processPromise(result,dataArray[8].svgnum))

parallelCoordPromise1.then((result) => processParallelPromise(result,parallelCoords[0].svgnum))
// parallelCoordPromise2.then((result) => processParallelPromise(result,parallelCoords[1].svgnum))

