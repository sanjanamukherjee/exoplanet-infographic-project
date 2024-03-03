var showModal = true;
// var modalElement = d3.select('instruction-modal');

function handleShowModal() {
    console.log("explore button clicked", showModal)
    if(!showModal){
        // modalElement.style("display", "flex");
        document.getElementsByClassName("instruction-modal")[0].style.display = "flex";
    }
    else{
        // console.log("inside else")
        // modalElement.style("display", "none");
        document.getElementsByClassName("instruction-modal")[0].style.display = "none";
    }
    showModal = !showModal;
}

// var selectedPlanetType = "";
var selectedPlanet;
// earthImage = "./assets/Earth.png"
earthImage = "./assets/Rotating_earth.gif"
superEarthImagePath = "./assets/SuperEarthType.png"
neptuneLikeImagePath = "./assets/NeptuneLike.png"
// neptuneLikeImagePath = "./assets/neptune.gif"
terrestrialImagePath = "./assets/TerrestrialType.png"
// terrestrialImagePath = "./assets/terrestrial.gif"

planetTypes = ["Super Earth", "Neptune-like", "Terrestrial"]

const imagePaths = {
    "Super Earth": superEarthImagePath,
    "Neptune-like": neptuneLikeImagePath,
    "Terrestrial": terrestrialImagePath
}

const svg = d3.select(".vis-chart")
const width = +svg.style('width').replace('px', '');
const height = +svg.style('height').replace('px', '');

document.addEventListener('DOMContentLoaded', function () {

    var legendSvg = d3.selectAll(".legend-svg")
    var legendWidth = +legendSvg.style('width').replace('px', '');
    var legendHeight = +legendSvg.style('height').replace('px', '');
    console.log("legendWidth, legendHeight - ", legendWidth, legendHeight)
    var legend = legendSvg.selectAll(".legend")
                          .data(planetTypes)
                          .enter().append("g")
                          .attr("class", "legend")
                          .append("image")
                            .attr("xlink:href", d => imagePaths[d])
                            .attr("class", "legend-image")
                            .attr("x", 10)
                            .attr("y", (d,i) => 10 + i*50)
                            .attr("width", 40)
                            .attr("height", 40)
    
    var legendText = legendSvg.selectAll(".legend")
                                .append("text")
                                .attr("x", 60)
                                .attr("y", (d,i) => 35 + i*50)
                                .text(d => d)
                                .attr("font-size", "16px")
                                .attr("fill", "white")


    Promise.all([d3.csv('./dv_data.csv')])
        .then(function (csv_data){
            planetsData = csv_data[0]
            planetsData.forEach(function(d) {
                d.distance = +d.distance; 
                d.radius_multiplier = +d.radius_multiplier;
              })
            console.log(planetsData)    

            //defining xScale
            console.log("width, height - ", width , height)
            console.log("min ", d3.min(planetsData, d => d.distance))
            console.log("max d -", d3.max(planetsData, d => d.distance))
            const xScale = d3.scaleLinear()
                        .domain([0, d3.max(planetsData, d => d.distance)])
                        .range([50, 0.9*width - 30]);
            
            var xAxis = d3.axisBottom(xScale);
            
            //defining radiusScale
            var earthRadius = 6378
            console.log("maxRadius - ", d3.max(planetsData, d => d.radius_multiplier*earthRadius))
            const radiusScale = d3.scaleLinear()
                        .domain([0, d3.max(planetsData, d => d.radius_multiplier*earthRadius)])
                        .range([5, 20]);
            
            // Tooltip = d3.selectAll('.vis-div').append('div').style("opacity",0).attr("class","tooltip")
            // .style("position", "absolute")
            // .attr("text-anchor", "middle")
            // .style("font-size", "50px")
            // .style("color", "yellow");
            Tooltip = d3.select(".tooltip")
            svg.append("g")
                .attr("class", "x-axis")
                .style("color", "white")
                .attr("transform", `translate(0, ${0.9*height})`)
                .call(xAxis);
            svg.selectAll(".planet-group")
                        .data(planetsData)
                        .join(
                            enter => {
                                const planetGroups = enter.append("g").attr("class", "planet-group");
                                
                                planetGroups
                                    .append("image")
                                    .attr("xlink:href", d => imagePaths[d.planet_type])
                                    .attr("class", "planet-image")
                                    .attr("x", d => xScale(d.distance)-(radiusScale(d.radius_multiplier*earthRadius) * 10)) // Adjust the scaling factor
                                    .attr("y", 100 ) // Adjust the scaling factor
                                    .attr("width", d => radiusScale(d.radius_multiplier*earthRadius)*20) // Adjust the scaling factor
                                    .attr("height", d => radiusScale(d.radius_multiplier*earthRadius)*20)
                                    // .append("title") // Add title element for tooltip
                                    // .text(d => d.name)
                                    .on("mouseover", function (e,d){
                                        // console.log("mouseover event here", d)
                                        d3.selectAll(".planet-image")
                                            .style("opacity", 0.3);
                                        d3.select(this)
                                            .style("cursor", "pointer")
                                            .style("opacity", 1);
                                        Tooltip.html("Planet Name : "+d.name + `<br/>Distance from Earth: ` + d.distance + ` light years <br/> Radius: ` + d.radius_multiplier*earthRadius + ` km`
                                            ).style("opacity",1);
                                        // Tooltip.style("left", xScale(d.distance)-(radiusScale(d.radius_multiplier*earthRadius) * 10)+"px")
                                        //     .style("top", 100+"px");
                                        Tooltip.style("left", e.pageX + 15+ "px")
                            .style("top", e.pageY - 50 + "px")
                                            
                                    })   
                                    .on("mouseout", function () {
                                        d3.select(this)
                                            // .style("cursor", "pointer")
                                            .style("opacity", 1);
                                        Tooltip.style("opacity", 0);
                                        d3.selectAll(".planet-image")
                                            .style("opacity", 1);
                                    })
                                    .on("click", function (e,d){
                                        // console.log("click event here", d)
                                        // updateSeeSaw(d);
                                        planetGroups.selectAll("circle").remove();
                                        selectedPlanet = d;
                                        weighScale(d);
                                        // makeSeeSaw(d);
                                        updatePlanetInfo(d);

                                        planetGroups.append("circle")
                                        .attr("cx", xScale(d.distance))
                                        .attr("cy", 100+radiusScale(d.radius_multiplier*earthRadius)*10)
                                        .attr("r", radiusScale(d.radius_multiplier*earthRadius)*12) // Adjust the radius as needed
                                        .style("fill", "none")
                                        .style("stroke", "yellow")
                                        .style("z-index", 5)
                                        .style("stroke-width", 3);

                                        
                                    });
                            }
                        );
            
            var planetInfoDiv = d3.select(".planet-info-div")
                            .style("text-align", "right")
                            .style("padding-right", "20px")
                            .style("font-family", "monospace")
                            .style("font-size", "16px")
                            .style("color", "white");
                            // .style("white-space", "nowrap");

            function updatePlanetInfo(d) {
                planetInfoDiv.selectAll('*').remove();

                var textContent  = `<b>Planet Name: </b><span class="highlighted-class">`+d.name + `</span><br/> <b>Distance from Earth:</b> ` + d.distance + ` light years <br/> <b>Radius: </b>` + d.radius_multiplier*earthRadius + ` km`+ `<br/> <b>Mass: </b>` + d.mass_multiplier + ` kg <br/> <b>Stellar magnitude: </b>`+ d.stellar_magnitude + `<br/> <b>Discovery year: </b>`+ d.discovery_year + `<br/> <b>Orbital radius: </b>`+ d.orbital_radius + ` AU <br/> <b>Orbital period: </b>`+ d.orbital_period + ` days <br/> <b>Eccentricity: </b>`+ d.eccentricity + `<br/> <b>Detection method: </b>`+ d.detection_method;

                planetInfoDiv.html(textContent);
                
                // var textContent = ["Planet Name: "+d.name, "Distance from Earth:" + d.distance + " light years", "Radius: " + d.radius_multiplier*earthRadius + " km", "Mass: " + d.mass_multiplier + " kg", "Stellar magnitude: "+ d.stellar_magnitude, "Discovery year: "+ d.discovery_year, "Orbital radius: "+ d.orbital_radius + " AU", "Orbital period: "+ d.orbital_period + " days", "Eccentricity: "+ d.eccentricity, "Detection method: "+ d.detection_method]

                // planetInfoDiv.text(textContent[0])
                // .attr("x", 0)
                // .attr("y", 20)


                // var textContent = [
                //     "Planet Name: " + d.name,
                //     "Distance from Earth:" + d.distance + " light years",
                //     "Radius: " + d.radius_multiplier * earthRadius + " km",
                //     "Mass: " + d.mass_multiplier + " kg",
                //     "Stellar magnitude: " + d.stellar_magnitude,
                //     "Discovery year: " + d.discovery_year,
                //     "Orbital radius: " + d.orbital_radius + " AU",
                //     "Orbital period: " + d.orbital_period + " days",
                //     "Eccentricity: " + d.eccentricity,
                //     "Detection method: " + d.detection_method
                // ];
                
                /*
                // Clear existing content
                // planetInfoDiv.html("");
                planetInfoDiv.text(textContent[0])
                .attr("x", 0)

                // Add a tspan for each line
                for (let i = 1; i < textContent.length; i++) {
                    let line = textContent[i];
                    let durationPerChar = 50; // Adjust the duration per character

                    let tspan = planetInfoDiv.append("tspan")
                        .attr("x", 0)
                        .attr("y", 20*(i+1))
                        .attr("dy", 1.2*i+"em")  // Adjust line height
                        .style("opacity", 0); // Set initial opacity to 0

                    for (let j = 0; j < line.length; j++) {
                        tspan.transition()
                            .delay(i * 100 + j * durationPerChar)  // Adjust the delay
                            .style("opacity", 1) // Fade in each character
                            .text(line.charAt(j));
                    }
                }
                */

                }

            
            
        
            var massSvg = d3.selectAll(".mass-svg")
            var massWidth = +massSvg.style('width').replace('px', '');
            var massHeight = +massSvg.style('height').replace('px', '');
            seeSawLength = 300

            function weighScale(d) {
                // massSvg.selectAll('*').remove();
                // create triangle 
                const point1 = [240, 10];
                const point2 = [100, 50];
                const point3 = [380, 50];

                const earthMass = 5972
                const planetMass = d.mass_multiplier*earthMass
                const earthMassRadius = radiusScale(earthRadius)
                const planetMassRadius = radiusScale(d.radius_multiplier*earthRadius)
                const earthMassX = point2[0]-earthMassRadius*4
                const planetMassX = point3[0]-planetMassRadius*4

                if(d.mass_multiplier<1){
                    earthY = 140 + d.mass_multiplier * 10 *3
                    planetY = 140 - d.mass_multiplier * 10 *3
                }
                else{
                    earthY = 140 - d.mass_multiplier *3
                    planetY = 140 + d.mass_multiplier *3
                }
                
                // create line1
                const line1 = massSvg.append('line')
                    .attr('class', 'seesaw')
                    .attr('x1', point1[0])
                    .attr('y1', point1[1])
                    .attr('x2', point2[0])
                    .attr('y2', point2[1])
                    .style('stroke', 'white')
                    .style('stroke-width', 3);

                const line2 = massSvg.append('line')
                    .attr('class', 'seesaw')
                    .attr('x1', point1[0])
                    .attr('y1', point1[1])
                    .attr('x2', point3[0])
                    .attr('y2', point3[1])
                    .style('stroke', 'white')
                    .style('stroke-width', 3);

                // const earthLine = massSvg.append('line')
                //     .attr('class', 'seesaw')
                //     .attr('x1', point2[0])
                //     .attr('y1', point2[1])
                //     .attr('x2', point2[0])
                //     .attr('y2', 150)
                //     .style('stroke', 'white')
                //     .style('stroke-width', 3)
                //     .transition()
                //     .duration(1000)
                //     .attr('y2', earthY+5);

                massSvg.selectAll('.earthLine')
                    .data(planetsData)
                    .join(
                        enter => {
                            enter.append('line')
                            .attr('class', 'earthLine')
                            .attr('x1', point2[0])
                            .attr('y1', point2[1])
                            .attr('x2', point2[0])
                            .attr('y2', 150)
                            .style('stroke', 'white')
                            .style('stroke-width', 3)
                            .transition()
                            .duration(1000)
                            .attr('y2', earthY+5);

                            
                        },

                        update=>{
                            update.transition()
                            .duration(1000)
                            .attr('y2', earthY+5);
                        }
                    )

                massSvg.selectAll('.earth-image')
                .data(planetsData)
                .join(
                    enter => {

                        enter.append("image")
                            .attr("xlink:href", earthImage)
                            .attr('class', 'earth-image')
                            .attr('x', earthMassX)
                            .attr('y', 140)
                            .attr("width", radiusScale(earthRadius)*8) // Adjust the scaling factor
                            .attr("height", radiusScale(earthRadius)*8)
                            .transition()
                            .duration(1000)
                            .attr('y', earthY)
                    },

                    update=>{
                        update.transition()
                        .duration(1000)
                        .attr('y', earthY);
                    }
                )

                massSvg.selectAll('.planetLine')
                    .data(planetsData)
                    .join(
                        enter => {
                            enter.append('line')
                            .attr('class', 'planetLine')
                            .attr('x1', point3[0])
                            .attr('y1', point3[1])
                            .attr('x2', point3[0])
                            .attr('y2', 150)
                            .style('stroke', 'white')
                            .style('stroke-width', 3)
                            .transition()
                            .duration(1000)
                            .attr('y2', planetY+5);
                        },

                        update=>{
                            update.transition()
                            .duration(1000)
                            .attr('y2', planetY+5);
                        }
                    )

                massSvg.selectAll('.planet-image')
                .data(planetsData)
                .join(
                    enter => {

                        enter.append("image")
                        .attr("xlink:href", imagePaths[d.planet_type])
                        .attr('class', 'planet-image')
                        .attr('x', planetMassX)
                        .attr('y', 140)
                        .attr("width", planetMassRadius*8) // Adjust the scaling factor
                        .attr("height", planetMassRadius*8)
                        .transition()
                        .duration(1000)
                        .attr('y', planetY)
                    },

                    update=>{
                        update
                        .attr("xlink:href", imagePaths[d.planet_type])
                        .transition()
                        .duration(1000)
                        .attr('y', planetY);
                    }
                )

                massSvg.selectAll('text').remove();
                    
                textX = planetMassX+planetMassRadius*8+5
                textY = planetY+planetMassRadius*2
                
                var massText = massSvg.append("text")
                .attr("x", textX)
                .attr("y", textY)
                .attr('font-size', '12px')
                .attr('fill', 'white');

                massText.append("tspan")
                .attr("x", textX)
                .attr("y", textY)
                .text(""+d.mass_multiplier+" times")

                massText.append("tspan")
                .attr("x", textX)
                .attr("y", textY+20)
                .text("heavier than")

                massText.append("tspan")
                .attr("x", textX)
                .attr("y", textY+40)
                .text("Earth")                
                
                // const planetX = pivotX + seeSawLength / 2 * Math.sin(angle);
            }
            
            /*
            function updateSeeSaw(d) {
                // console.log("updateSeeSaw called with d - ", d)
                const pivotX = massWidth / 2;
                const pivotY = massHeight - 150;
              
                const leftX = pivotX - seeSawLength / 2;
                const rightX = pivotX + seeSawLength / 2;

                // massSvg.selectAll('.seesaw').remove();
                massSvg.selectAll('*').remove();

                const line = massSvg.append('line')
                    .attr('class', 'seesaw')
                    .attr('x1', leftX)
                    .attr('y1', pivotY)
                    .attr('x2', rightX)
                    .attr('y2', pivotY)
                    .style('stroke', 'white');
                
                

                massSvg.append("image")
                    .attr("xlink:href", imagePaths["Super Earth"])
                    .attr('class', 'weight')
                    .attr('x', leftX-radiusScale(earthRadius))
                    .attr('y', pivotY-radiusScale(earthRadius)*10)
                    .attr("width", radiusScale(earthRadius)*10) // Adjust the scaling factor
                    .attr("height", radiusScale(earthRadius)*10)
                
                var angle = 0
                const earthMass = 5972
                console.log("min max mass - ", d3.min(planetsData, d=>d.mass_multiplier), d3.max(planetsData, d => d.mass_multiplier))  
                var multiplierScale = d3.scaleLinear()
                                    .domain([d3.min(planetsData, d=>d.mass_multiplier*earthMass), d3.max(planetsData, d => d.mass_multiplier*earthMass)])
                                    .range([-30, 30]);
                
                // const massMultiplier = Math.min(1, Math.max(-1, d.mass_multiplier));
                // const angle = Math.acos(multiplierScale(d.mass_multiplier));
                

                angle = multiplierScale(-d.mass_multiplier*earthMass)
                console.log("angle - ", angle)

                line.transition()
                .duration(1000)  // Adjust the duration as needed
                .attrTween("transform", function () {
                    return d3.interpolateString("rotate(0, 100, 100)", "rotate("+angle+", 100, 100)");
                });

                const planetX = pivotX + seeSawLength / 2 * Math.sin(angle);
                const planetY = pivotY - seeSawLength / 2 * Math.cos(angle);

                massSvg.append("image")
                    .attr("xlink:href", imagePaths[d.planet_type])
                    .attr('class', 'weight')
                    .attr('x', planetX-radiusScale(earthRadius))
                    .attr('y', planetY-radiusScale(earthRadius))
                    .attr("width", radiusScale(earthRadius)*10) // Adjust the scaling factor
                    .attr("height", radiusScale(earthRadius)*10)              
                
            }
            */

            // function makeSeeSaw(d) {

            //     var earthY = 100
            //     var planetY = 100

            //     massSvg.selectAll('*').remove();

            //     if(d.mass_multiplier<1){
            //         earthY = earthY + d.mass_multiplier * 10 *3
            //         planetY = planetY - d.mass_multiplier * 10 *3
            //     }
            //     else{
            //         earthY = earthY - d.mass_multiplier *3
            //         planetY = planetY + d.mass_multiplier *3
            //     }
            //     const line = massSvg.append('line')
            //         .attr('class', 'seesaw')
            //         .style('stroke', 'white')
            //         .style('stroke-width', 3)
            //         .attr('x1', 25+radiusScale(earthRadius)*5)
            //         .attr('y1', 70+radiusScale(earthRadius)*5)
            //         .attr('x2', massWidth - 10 - radiusScale(d.radius_multiplier*earthRadius)*5)
            //         .attr('y2', 70+radiusScale(d.radius_multiplier*earthRadius)*5)
            //         .transition()
            //         .duration(1000)
            //         .attr('y1', earthY+radiusScale(earthRadius)*5)
            //         .attr('y2', planetY+radiusScale(d.radius_multiplier*earthRadius)*5);

            //     massSvg.append("image")
            //         .attr("xlink:href", earthImage)
            //         .attr('class', 'weight')
            //         .attr('x', 25)
            //         .attr('y', 70)
            //         .attr("width", radiusScale(earthRadius)*10) // Adjust the scaling factor
            //         .attr("height", radiusScale(earthRadius)*10)
            //         .transition()
            //         .duration(1000)
            //         .attr('y', earthY)

            //     massSvg.append("image")
            //         .attr("xlink:href", imagePaths[d.planet_type])
            //         .attr('class', 'weight')
            //         .attr('x', massWidth - 10 - radiusScale(d.radius_multiplier*earthRadius)*10)
            //         .attr('y', 70)
            //         .attr("width", radiusScale(d.radius_multiplier*earthRadius)*10) // Adjust the scaling factor
            //         .attr("height", radiusScale(d.radius_multiplier*earthRadius)*10)
            //         .transition()
            //         .duration(1000)
            //         .attr('y', planetY)     
            // }

            // mae();
            
        })

})
