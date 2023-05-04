class MainApp extends React.Component {
    constructor() {
        super();
        this.state={useGroup:true, key: "", time: "none", day: "0", selectedHeatPoint: -1, hasGlyphs: true};
        this.screenshotList = [];
        this.selectedCanvas = 0;
        window.app = this;
        this.ArrowDict = {};
        window.ArrowDict = this.ArrowDict;
        this.inflowColor = "#2BA8D9"; //0B9FD9
        this.outflowColor = "#FFA31D"; //FF931D
        this.opacities = [];
        for(var i=0; i<500; i++) {
            this.opacities.push(1.0);
        }
    }
    render() {
        return(
            <div>
                <div style={{width: "20%", height: "34.5%", left: 0, top: 0, position: "absolute", "border-width": "1px", "border-style": "solid", "border-color":"#132c33", "border-radius": "5px", overflow: "hidden", margin: "2px", "box-shadow": "0px 0px 2px"}}>
                    <div id="scatter" style={{width:"100%", height: "100%", bottom: 0, position:"absolute"}}></div>
                    <div class="headerbar"><span class="header">Embedding View</span></div>
                </div>
                <div style={{width: "20%", height: "39.5%", left: 0, top: "35%", position: "absolute", "border-width": "1px", "border-style": "solid", "border-color":"#132c33", "border-radius": "5px", overflow: "hidden", margin: "2px", "box-shadow": "0px 0px 2px"}}>
                    <div class="headerbar">
                        <span class="header" >Radial View</span>
                    </div>
                    <div class="chart" id="chart1" style={{height: "100%", width: "100%", bottom:0, left:0, position: "absolute", "padding-left": "20px"}}></div>
                </div>
                <div id="mapcontainer" style={{width: "64.6%", height: "74.5%", right: "15%", top: 0, position: "absolute", "border-width": "1px", "border-style": "solid", "border-color":"#132c33", "border-radius": "5px", overflow: "hidden", margin: "2px", "box-shadow": "0px 0px 2px"}}>
                    <div id="mapid" style={{width: "100%", height: "100%", bottom: 0, position: "absolute"}}/>
                    <div class="headerbar">
                        <div>
                            <span class="header" >Map View</span>
                            <antd.Radio.Group value={this.state.useGroup} onChange={(e)=>{
                                this.setState({useGroup: e.target.value});
                                if(e.target.value==false) {
                                    for (let i = 0; i < this.points.length; i++) {
                                        if(this.ArrowDict[i.toString()]==undefined) continue;
                                        for(let ii=0; ii<this.ArrowDict[i.toString()].length; ii++) {
                                            this.ArrowDict[i.toString()][ii].removeFrom(this.map);
                                        }
                                    }
                                    if (Object.keys(this.heatPointGroup).length > 0) {
                                        let heatPointGrouopLength = Object.keys(this.heatPointGroup).length;
                                        for (let i = 0; i < heatPointGrouopLength; i++) {
                                            this.heatPointGroup[Object.keys(this.heatPointGroup)[i]].removeFrom(this.map);
                                        }
                                    }
                                    this.fillOpacityRatio = 1.0;
                                }
                                else {
                                    if(this.state.time!="none") {
                                        this.fillOpacityRatio = 0.5;
                                        this.initArrow(this.state.time);
                                    }
                                }
                                this.setTimeOpacity(this.state.time, e.target.value);
                                }}>
                                <antd.Radio value={true}>Global</antd.Radio>
                                <antd.Radio value={false}>Local</antd.Radio>
                            </antd.Radio.Group>
                            <antd.Select value={this.state.day} style={{"margin-left":"20px"}} size="small" onChange={(e)=>{this.setState({day: e})}}>
                                <antd.Select.Option value="1">Day 1</antd.Select.Option>
                                <antd.Select.Option value="2">Day 2</antd.Select.Option>
                                <antd.Select.Option value="3">Day 3</antd.Select.Option>
                                <antd.Select.Option value="4">Day 4</antd.Select.Option>
                                <antd.Select.Option value="5">Day 5</antd.Select.Option>
                                <antd.Select.Option value="6">Day 6</antd.Select.Option>
                                <antd.Select.Option value="7">Day 7</antd.Select.Option>
                                <antd.Select.Option value="0">Average</antd.Select.Option>
                            </antd.Select>
                            <antd.Select value={this.state.time} style={{"margin-left":"20px"}} size="small"
                            onChange={    //處理input
                                (e)=>{
                                    var _this = this;
                                    console.log("time on change:", e);
                                    this.setState({time: e})
                                    //清除上一次的arrow 顯示
                                    for (let i = 0; i < this.points.length; i++) {
                                        if(this.ArrowDict[i.toString()]==undefined) continue;
                                        for(let ii=0; ii<this.ArrowDict[i.toString()].length; ii++) {
                                            this.ArrowDict[i.toString()][ii].removeFrom(this.map);
                                        }
                                    }
                                    if (Object.keys(this.heatPointGroup).length > 0) {
                                        let heatPointGrouopLength = Object.keys(this.heatPointGroup).length;
                                        for (let i = 0; i < heatPointGrouopLength; i++) {
                                            this.heatPointGroup[Object.keys(this.heatPointGroup)[i]].removeFrom(this.map);
                                        }
                                    }
                                    this.setTimeOpacity(e);
                                    if(this.state.useGroup) {
                                        if(e=="none") {   
                                            this.fillOpacityRatio = 1.0;
                                            this.resetPoly();
                                            return;
                                        }
                                        this.fillOpacityRatio = 0.5;
                                        this.resetPoly();
                                        let x = e;
                                        if (x.length === 1) {
                                            x = "0" + x;
                                        }
                                        this.initArrow(x);
                                    }
                                }}>
                                <antd.Select.Option value="none">Please Select Time</antd.Select.Option>
                                <antd.Select.Option value="00">00:00 - 03:00</antd.Select.Option>
                                <antd.Select.Option value="03">03:00 - 06:00</antd.Select.Option>
                                <antd.Select.Option value="06">06:00 - 09:00</antd.Select.Option>
                                <antd.Select.Option value="09">09:00 - 12:00</antd.Select.Option>
                                <antd.Select.Option value="12">12:00 - 15:00</antd.Select.Option>
                                <antd.Select.Option value="15">15:00 - 18:00</antd.Select.Option>
                                <antd.Select.Option value="18">18:00 - 21:00</antd.Select.Option>
                                <antd.Select.Option value="21">21:00 - 24:00</antd.Select.Option>
                            </antd.Select>
                            <antd.Button size="small" style={{"margin-left" : "10px"}} onClick={()=>{
                                var _this = this;
                                html2canvas(mapid, {
                                    allowTaint: true,
                                    useCORS: true}).then((canvas)=>{
                                    console.log("onrendered", canvas);
                                    canvas.setAttribute("style", "max-width: 100%; height: auto");
                                    // canvas.setAttribute("index", _this.screenshotList.length);
                                    canvas.addEventListener("click", (e)=>{
                                        for(var i=0; i<_this.screenshotList.length; i++) {
                                            _this.screenshotList[i].setAttribute("style", "max-width: 100%; height: auto; border-width: 0px;border-style: solid;border-color:#132c33; box-shadow: 0px 0px 0px");
                                        }
                                        e.target.setAttribute("style", "max-width: 100%; height: auto; border-width: 1px;border-style: solid;border-color:#132c33; box-shadow: 0px 0px 4px");
                                        _this.selectedCanvas = e.target;
                                    })
                                    canvas.state = _this.state;
                                    _this.screenshotList.push(canvas);
                                    screenshots.appendChild(canvas);
                                });
                            }}>
                                <antd.Icon type="save"/>
                            </antd.Button>
                        </div>
                    </div>
                </div>
                <div style={{width: "14.8%", height: "74.5%", right: 0, top: 0, position: "absolute", "border-width": "1px", "border-style": "solid", "border-color":"#132c33", "border-radius": "5px", overflow: "hidden", margin: "2px", "box-shadow": "0px 0px 2px"}}>
                    <div class="headerbar">
                        <span class="header" >Snapshot Panel</span>
                        <antd.Button size="small" onClick={()=>{
                            console.log(this.selectedCanvas.state);
                            var state = this.selectedCanvas.state;
                            this.setState(state);
                            this.fillOpacityRatio = 1.0;
                            if(state.time!="none") {
                                this.fillOpacityRatio = 0.5;
                                for (let i = 0; i < this.points.length; i++) {
                                    if(this.ArrowDict[i.toString()]==undefined) continue;
                                    for(let ii=0; ii<this.ArrowDict[i.toString()].length; ii++) {
                                        this.ArrowDict[i.toString()][ii].removeFrom(this.map);
                                    }
                                }
                                // console.log("load time: ", state.time);
                                this.initArrow(state.time);
                                // this.ArrowDict[String(state.selectedHeatPoint)].addTo(this.map);
                            }
                            if(this.state.key=="") {
                                this.resetPoly();
                            }
                            else {
                                this.highlightPoly(state.key);
                            }
                        }}><antd.Icon type="folder-open"/></antd.Button>
                        <antd.Button size="small" style={{"margin-left" : "10px"}}><antd.Icon type="delete"/></antd.Button>
                    </div>
                <div id="screenshots" style={{width: "100%", height:"100%", position:"absolute", padding: "10px", "padding-top": "30px", bottom: 0, align: "center", overflow: "scroll"}}/>
                </div>
                <div style={{width: "100%", height: "25%", position:"absolute", bottom: 0}}>
                    <div id="poiview" style={{width: "39.5%", height:"99%", position:"absolute", bottom: 0, left: 0, "border-width": "1px", "border-style": "solid", "border-color":"#132c33", "border-radius": "5px", overflow: "hidden", margin: "2px", "box-shadow": "0px 0px 2px"}}>
                        <div id="chart" style={{width: "100%", height:"100%", position:"absolute", bottom: 0, right: 0}}></div><div id="dataset-picker"></div>
                        <div class="headerbar"><span class="header" >POI Ranking View</span></div>
                    </div>
                    <div style={{width: "60%", height:"99%", position:"absolute", bottom: 0, right: 0,align: "center", "border-width": "1px", "border-style": "solid", "border-color":"#132c33", "border-radius": "5px", overflow: "hidden", margin: "2px", "box-shadow": "0px 0px 2px"}}>
                        <div id="glyphview" style={{width: "100%", height:"100%", position:"absolute", padding: "10px", "padding-top": "30px", bottom: 0, align: "center"}}/>
                        <div class="headerbar"><span class="header" >Intra-flow View</span></div>
                    </div>
                </div>
            </div>
        )
    }

    drawOneGlyph(width,centerColorIndex, innerR, max,arcData1, arcData2, name="") {
        // let width = 240;
        var _this = this;
        let height = 240;
        let svg = d3.select("#glyphview")
            .append("svg")
            .attr("width", width)
            .attr("height", height);


        // let max = d3.extent([d3.extent(arcData1)[1],d3.extent(arcData2)][1])[1]
        // console.log("max",max)

        //画arc的工厂函数1
        let arcFactory1 = d3.svg.arc()
            .innerRadius(innerR)
            .outerRadius(function (d) {
                let da = arcData1[d];
                if (arcData2[d] > arcData1[d]) {
                    da = arcData2[d]
                }
                // if( da/max* 55 + innerR>85){
                //     return 85
                // }

                // if(da/max* 55 + innerR<=0){
                //     return innerR;
                // }
                if (da > 0) {
                    return da/max* 65 + innerR
                }

                else {
                    return innerR;
                }
            })
            .startAngle(function (d) {
                return Math.PI / 12 * d
            })
            .endAngle(function (d) {
                return Math.PI / 12 * (d + 1)
            });

        //画arc的工厂函数2
        let arcFactory = d3.svg.arc()
            .innerRadius(innerR)
            .outerRadius(function (d) {
                let da = arcData1[d];
                // console.log("d2:",da/max* 55 + height / 10);
                if (arcData1[d] >= arcData2[d]) {
                    da = arcData2[d]
                }
                // if(da/max* 55 + innerR>85){
                //     return 85
                // }
                // if(da/max* 55 + innerR<=0){
                //     return innerR;
                // }
                if (da > 0) {

                    return da/max* 65 + innerR
                }
                else {
                    return innerR;
                }
            })
            .startAngle(function (d) {
                return Math.PI / 12 * d
            })
            .endAngle(function (d) {
                return Math.PI / 12 * (d + 1) 
            });

            for(var i=1; i<4; i++) {
                svg.append("circle")
                    .attr("stroke", "#000000")
                    .attr("stroke-width","0.5px")
                    .attr("stroke-dasharray", "5,5")
                    .attr("fill", "none")
                    .attr("r", 70/4*i+innerR)
                    .attr("cx", width/2)
                    .attr("cy", height/2)
            }
            svg.append("circle")
            .attr("stroke", "#000000")
            .attr("stroke-width","1")
            .attr("fill", "none")
            .attr("r", 70+innerR)
            .attr("cx", width/2)
            .attr("cy", height/2)

        //画第一组24个的arc
        for (let index = 0; index < 25; index++) {
            let da, color;
            if (arcData1[index] > arcData2[index]) {
                da = arcData1[index]
                color = _this.inflowColor //blue 蓝色
            }
            else {
                da = arcData2[index]
                color = _this.outflowColor;
            }
            // console.log("2",da)
            let g1 = svg.append("g")
                .data([index])
                .append("path")
                .attr("class", "arc")
            g1.attr("fill", color)
                .attr("stroke", "LightGrey")
                .attr("stroke-width","0.2px")
                .attr("d", arcFactory1)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        }
        //画第二组24个的arc
        for (let index = 0; index < 25; index++) {
            let da, color;
            if (arcData1[index] > arcData2[index]) {
                da = arcData2[index]
                color = _this.outflowColor;
            }
            else {
                da = arcData1[index]
                color = _this.inflowColor;
            }

            // console.log("1",da)
            let g = svg.append("g")
                .data([index])
                .append("path")
                .attr("class", "arc")
                .attr("fill", color)
                .attr("stroke", "LightGrey")
                .attr("stroke-width","0.2px")
                .attr("d", arcFactory)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        }


        var innerLineColor = "#a7535a";
        var delta = 70+innerR;
        var lineNum = 8;
        for(var i=0; i<lineNum; i++) {
            var dx = delta*Math.sin(Math.PI*2/lineNum*i);
            var dy = -delta*Math.cos(Math.PI*2/lineNum*i)
            svg.append("line")
                .attr("stroke", innerLineColor)
                .attr("stroke-width", "0.5")
                .attr("stroke-dasharray", "2,2")
                .attr("x1", width/2)
                .attr("y1", height/2)
                .attr("x2", width/2+dx)
                .attr("y2", height/2+dy)
            var tx = -(delta-dx)*0.1;
            var ty = (delta+dy)*0.1-2;
            svg.append("text").attr("class", "mono").text(String(Math.floor(24/lineNum)*i)).attr("x", width/2+dx+tx).attr("y", height/2+dy+ty)
        }

        //绘制内圆
        // svg.append("circle")
        //     .attr("stroke", "LightGrey")
        //     .attr("fill", centerColorIndex)
        //     .attr("r",innerR) //半径为240/10=24
        //     .attr("stroke-width","0.4px")
        //     .attr("cx", width / 2)
        //     .attr("cy", height / 2)
        
        // svg.append("rect")
        //     .attr("x", width/2-13)
        //     .attr("y", 5)
        //     .attr("width", 26)
        //     .attr("height", 20)
        //     .attr("fill", centerColorIndex)
        //     .attr("rx", 4)
        //     .attr("ry", 4);

        svg.append("text")
            .attr("x", width/2)
            .attr("y", 20)
            .text(name)
            .style("text-anchor", "middle")
            .attr("fill", centerColorIndex)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("font-weight", 600);
        //绘制外圆
        // svg.append("circle")
        //     .attr("stroke", "LightGrey")
        //     .attr("fill", "none")
        //     .attr("r", 85+innerR)
        //     .attr("stroke-width","2px")
        //     .attr("cx", width / 2)
        //     .attr("cy", height / 2)

        return svg;
    };

    drawGlyphID(id, pid) {
        var _this=this;
        this.glyphs = {};
        var _this = this;
        d3.csv("onOffTotalV_hour.csv", function(data){
            var d1 = [];
            var d2 = [];
            for(var i=0; i<data.length; i++) {
                if(data[i].region==id) {
                    d1.push(Number(data[i].onV));
                    d2.push(Number(data[i].offV));
                }
            }
            var width = 187;
            var max={"P0":0,"P1":0,"P2":0,"P3":0,"P4":0,"P5":0,};
            for(var i=0; i<data.length; i++) {
                if(_this.polygonlist[_this.polyInvList[data[i].region]].group==pid) {
                    if(Number(data[i].onV)>max[pid]) max[pid]=Number(data[i].onV);
                    if(Number(data[i].offV)>max[pid]) max[pid]=Number(data[i].offV);
                }
            }
            _this.drawOneGlyph(width,_this.colorScale[pid],0,max[pid],d1,d2, "Region#"+id)
        });
    }

    drawGlyph() {
        var _this=this;
        this.glyphs = {};
        var _this = this;
        d3.json("onOffTime.json", function(data){
            console.log(data);
            var keyList = []
            for(var key in data){
                keyList.push(key);
            }
            console.log("keyList:", keyList)

            var width = 187;
            for (var i = 0; i<1; i++){
                // console.log(data[keyList[i]])
                var d1 = data[keyList[i]][0];
                var d2 = data[keyList[i]][1];

                var c = d3.scale.category10();
                var colorScale=_this.colorScale;
                // console.log("color:",color);

                // console.log("d1:",d1);
                // console.log("d2:",d2);

                d3.json("total.json", function(data1){
                    var max = d3.extent(data1)[1]
                    console.log("max:", max)
                    for(let i = 0;i<6;i++){
                        var chart = _this.drawOneGlyph(width,colorScale[keyList[i]],0,max,data[keyList[i]][0],data[keyList[i]][1], "F#"+i)
                        // console.log(chart);
                        _this.glyphs[keyList[i]] = chart[0][0];
                    }
                    console.log("_this.glyphs", _this.glyphs);
                });
            }
        });
    }

    drawPOI() {
        var c10 = [
            "#1f77b4",
            "#fe8a1a",
            "#ffc60d",
            "#df2d21",
            "#a7286b",
            "#7db22f"
           ] 
        var margin = { top: 50, right: 0, bottom: 100, left: 50 },
            width = 960 - margin.left - margin.right,
            height = 930 - margin.top - margin.bottom,
            gridSize = Math.floor(width / 34),
            legendElementWidth = gridSize * 1,
            // buckets = 9,
    
            colors = [
            "#ffffd9",
            "#edf8b1",
            "#c7e9b4",
            "#7fcdbb",
            "#41b6c4",
            "#1d91c0",
            // "#225ea8",
            // "#253494",
            ], // alternatively colorbrewer.YlGnBu[9]
            POICatergories = [
            "ChiRes",
            "FasRes",
            "ShopM",
            "ElecP",
            "SupMa",
            "FurBu",
            "StaSh",
            "Bank",
            "CarSe",
            "GovAg",
            "Hospt",
            "Hotel",
            "IO/Br",
            "livSe",
            "NightL",
            "Recre",
            "Resid",
            "Scenic",
            "Station",
            "Univer"
            ],
        regionPatterns = ["F#0", "F#1", "F#2", "F#3","F#4", "F#5"];//, "F6", "F7"
        var datasets = ["POIRank.tsv"];
    
        var svg = d3
            .select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // var regionBackground = svg
        //     .selectAll(".RPLabelBack")
        //     .data(regionPatterns).enter()
        //     .append("rect")
        //     .attr("x", -gridSize-4)
        //     .attr("y", function(d, i) {
        //         return (i+0.1) * gridSize;
        //     })
        //     .attr("height", gridSize*0.8)
        //     .attr("width", gridSize)
        //     .attr("rx", 4)
        //     .attr("ry", 4)
        //     .style("fill",function(d,i){ return c10[i]})
        //     .attr("class", function(d, i) {
        //         return "RPLabelBack mono axis P"+i;
        //     });
    
        // 绘制regionPattern标签
        var RegionPLabels = svg
            .selectAll(".RPLabel")
            .data(regionPatterns)
            .enter()
            .append("text")
            .text(function(d) {
            return d;
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
            return i * gridSize;
            })
            .style("text-anchor", "end")
            .style("fill",function(d,i){ return c10[i];})
            .attr("font-weight", 600)
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            // .attr("font-size","80px")
            .attr("class", function(d, i) {
            return "RPLabel mono axis P"+i;
            });
    
        // 绘制POICatergories标签
        // var POICatergoriesLabels = svg
        //   .selectAll(".timeLabel")
        //   .data(POICatergories)
        //   .enter()
        //   .append("text")
        //   .text(function(d) {
        //     return d;
        //   })
        //   .attr("x", function(d, i) {
        //     return i * gridSize;
        //   })
        //   .attr("y", 0)
        //   .style("text-anchor", "middle")
        //   .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        //   .attr("class", function(d, i) {
        //     return i >= 7 && i <= 16
        //       ? "timeLabel mono axis axis-worktime"
        //       : "timeLabel mono axis";
        //   });
        var POICatergoriesLabels = svg
            .selectAll(".timeLabel")
            .data(POICatergories)
            .enter()
            .append("text")
            .text(function(d) {
            return d;
            })
            // .attr("x", function(d, i) {
            //   return i * gridSize;
            // })
            // .attr("y", 4)
            // .selectAll("text")
            // .attr("transform","rotate(-45)")
            .style("text-anchor", "middle")
            .style("transform",function(d,i){ return "translate(" + (gridSize / 2 +i*gridSize+12).toString()+ "px, -12px) "+"rotate(-30deg)"})
            .attr("class", function(d, i) {
            return i >= 7 && i <= 16
                ? "timeLabel mono axis axis-worktime"
                : "timeLabel mono axis axis-worktime";
            });
    
    
        const average = (...arr) => {
            const nums = [].concat(...arr);
            return nums.reduce((acc, val) => acc + val, 0) / nums.length;
        };
    
        var heatmapChart = function(tsvFile) {
            d3.tsv(
            tsvFile,
            function(d) {
                return {
                RP: +d.RP,
                categories: +d.categories,
                value: +d.value,
                measureValue: +parseInt(d.measureValue)
                };
            },
            function(error, data) {
                var colorScale = d3.scale
                .quantile()
                .domain(
                    d3.extent(d3.max(data,function(d, i) {
                    // console.log(d,i)
                    let resultArray = [];
                    for (let index = 0; index < data.length; index = index + 1) {
                        if (data[index].categories === d.categories) {
                        resultArray.push(data[index].measureValue);
                        } else {
                        }
                    }
                    return resultArray;
                    })
                ))
                .range(colors);
    
    
                var cards = svg.selectAll(".categories").data(data, function(d) {
                return d.RP + ":" + d.categories;
                });
    
                cards.append("title");
    
                cards
                .enter()
                .append("rect")
                .attr("x", function(d) {
                    return (d.categories - 1) * gridSize;
                })
                .attr("y", function(d) {
                    return (d.RP - 1) * gridSize;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", function(d) {return "categories bordered P"+(d.RP - 1)})
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);
                
                
                cards
                .transition()
                .duration(1000)
                .style("fill", function(d) {
                    return colorScale(d.measureValue);
                });
    
                cards.enter().append("circle")
                .attr("cx", function(d) {
                    return (d.categories - 1) * gridSize+gridSize/2;
                })
                .attr("cy", function(d) {
                    return (d.RP - 1) * gridSize+gridSize/2;
                })
                .attr("r", function(d){
                    // return 4
                    return d.value/4*gridSize/2;
                })
                .attr("class", function(d) {return "circle P"+(d.RP - 1)})
                .style("fill","#ff931d")
    
                cards.select("title").text(function(d) {
                return d.measureValue;
                });
    
                cards.exit().remove();
    
    
                //绘制Legend
                var legend = svg.selectAll(".legend")
                    .data([0].concat(colorScale.quantiles()), function(d) { return d; });
                legend.enter().append("g")
                    .attr("class", "legend");
                legend.append("rect")
                .attr("x", 650)
                .attr("y", function(d, i) { return legendElementWidth * (5-i); })
                .attr("width", gridSize / 2)
                .attr("height", legendElementWidth)
                .style("fill", function(d, i) { return colors[i]; });
                legend.append("text")
                .attr("class", "mono")
                .text(function(d, i) { if(i==0) return 1; if(i==5) return 6; return ""; })
                .attr("x", 650 + gridSize)
                .attr("y", function(d, i) { return legendElementWidth * (5-i)+20; });
                legend.append("text").attr("class", "mono").text("ER").attr("x", 650).attr("y", legendElementWidth*6+18);
                legend.exit().remove();
    
    
                //绘制circleLegend
                var circleLegend = svg.selectAll(".circleLegend")
                .data([0,0.2,0.4,0.6,0.8,1]);
                circleLegend.enter().append("g").attr("class","circleLegend");
                circleLegend.append("circle")
                .attr("cx", 620)
                .attr("cy", function(d, i) { return legendElementWidth * (5-i)+15; })
                .attr("r",function(d){return d*gridSize/2})
                .style("fill","#ff931d")
                circleLegend.append("text")
                .attr("class","mono")
                .text(function(d,i) { 
                    return (i*0.2*4).toFixed(1); })
                .attr("x", 550 + gridSize)
                .attr("y", function(d, i) { return legendElementWidth * (5-i)+18; });
                circleLegend.append("text").attr("class", "mono").text("IR").attr("x", 615).attr("y", legendElementWidth*6+18);
                circleLegend.exit().remove();
    
            }
            );

            console.log("svg.P0", svg.selectAll(".P0"));
        };
    
        heatmapChart(datasets[0]);
    }

    componentDidMount() {
        var _this=this;
        this.fillOpacityRatio = 1.0;
        console.log("componentDidMount");

        setTimeout(()=>{
            mapid.style.height = String(mapid.clientHeight-30)+"px";
            scatter.style.height = String(scatter.clientHeight-30)+"px";
            chart.style.height = String(chart.clientHeight-30)+"px";
            screenshots.style.height = String(screenshots.clientHeight-30)+"px";
            chart1.style.height = String(chart1.clientHeight-30)+"px";
        }, 100);
        // glyphview.style.height = String(glyphview.clientHeight-30)+"px";

        var map = L.map('mapid', {zoomDelta: 0.25, zoomSnap: 0, wheelPxPerZoomLevel: 180}).setView([30.26, 120.19], 11);
        this.map = map;
        window.map = map;

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ',
            id: 'mapbox.light',
        }).addTo(map);

        var coords = [[30.132932, 119.963804],[30.132932, 120.437324],[30.409347999999998, 120.437324],
            [30.409347999999998, 119.963804],[30.132932, 119.963804]];
        this.points = [[30.25378485, 120.17532209], [30.352731, 120.127945], [30.275079, 120.031128],
            [30.321915, 120.320206], [30.281702, 120.19013], [30.181935, 120.100479]];
        this.bottom = 30.012;
        this.up = 30.4439;
        this.left = 119.8691;
        this.right = 120.461;
        this.mapbounds = [[this.bottom, this.left], [this.top, this.right]];
        this.blockCount = 100;
        this.wideRange = this.right - this.left;
        this.heightRange = this.up - this.bottom;
        this.wideDistance = this.wideRange / this.blockCount;
        this.heightDistance = this.heightRange / this.blockCount;

        var polyline = L.polyline(coords, {color: 'black',opacity:0.5, weight: 0.5}).addTo(map);

        var dict = undefined;
        d3.json("./regionVerticenew.json", function(data){
            dict = data;
        });

        var polygonlist = []
        this.polygonlist = polygonlist;

        // 设置色相
        // var c = d3.scale.category10();
        // var colorScale=d3.scale.ordinal().domain(['P0','P1','P2','P3','P4','P5','P6','P7']).range([c(0),c(1),c(2),c(3),c(4),c(5),c(6),c(7)]);
        this.colorScale = {
            "P0": "#1f77b4",
            "P1": "#fe8a1a",
            "P2": "#ffc60d",
            "P3": "#df2d21",
            "P4": "#a7286b",
            "P5": "#7db22f",
        };
        var colorScale = this.colorScale;
        
        window.setRegionColor = (k, c)=>{
            colorScale[k] = c;
            for(var i=0; i<polygonlist.length; i++) {
                if(polygonlist[i].group==k) {
                    polygonlist[i].setStyle({color: colorScale[k]});
                }
            }
        };

        var counter = 0;
        this.polyInvList = []
        var polyInvList = this.polyInvList;

        setTimeout(()=>{
        // 绘制带区域功能的多边形
            $.getJSON("./RP_new.json",function(data){
            $.each(data,function(key,value){		
                // console.log(key,value);
                for (var i = 0; i< value.length; i += 1){
                    var color=colorScale[key];
                    console.log(key,color);
                    polyInvList[value[i]] = polygonlist.length;
                    polygonlist.push(L.polygon(dict[value[i]], {color:color,opacity:0.8, weight: 0.5, fillOpacity: 0.5}).addTo(map));
                    var poly = polygonlist[polygonlist.length-1];
                    // 高亮整体
                    poly.group = key;
                    // 高亮一个
                    poly.id = String(value[i]);
                    counter++;
                    poly.on("click", (e)=> {
                        if(_this.state.useGroup) {
                            console.log("click "+e.target.group);
                            _this.highlightPoly(e.target.group);
                        }
                        else {
                            console.log("click "+e.target.id);
                            _this.highlightPoly(e.target.id);
                        }
                    })
                }

                // d3.csv("./onOffTotalV.csv", (data)=>{
                //     var max=0;
                //     for(var i=0; i<_this.opacities.length; i++) _this.opacities[i] = 0.0;
                //     for(var i=0; i<data.length; i++) {
                //         _this.opacities[data[i].region] = _this.opacities[data[i].region]+Number(data[i].totalV);
                //         if(max<_this.opacities[data[i].region]) {
                //             max=_this.opacities[data[i].region];
                //         }
                //     }
                //     console.log("max=", max);
                //     for(var i=0; i<_this.opacities.length; i++) {
                //         _this.opacities[i] = _this.opacities[i]/max;
                //         var kk=0.7;
                //         _this.opacities[i] = Math.log2(_this.opacities[i]+1);
                //         _this.opacities[i] = _this.opacities[i]*kk+(1-kk);
                //     }
                //     console.log("load csv");
                //     _this.resetPoly();
                // });
            })	
            });
        }, 500);

        var svg = d3.select("#scatter")
            .append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
            .append("g")
        this.svg = svg;

        var minx = 1e20, maxx = -1e20, miny=1e20, maxy=-1e20;
        var cssdata = undefined;
        d3.csv("./tsne.csv", (data)=> {
            cssdata = data;
            for(var i=0; i<data.length; i++) {
                var x = Number(data[i].X);
                var y = Number(data[i].Y);
                data[i].id = String(i);
                if(x<minx) minx=x;
                if(x>maxx) maxx=x;
                if(y<miny) miny=y;
                if(y>maxy) maxy=y;
            }
            var midx = (maxx+minx)/2;
            var sx = (maxx-minx);
            var midy = (maxy+miny)/2;
            var sy = (maxy-miny);
            var width = scatter.clientWidth-100;
            var height = scatter.clientHeight-100;
            svg.append('g')
                    .selectAll("dot")
                    .data(cssdata)
                    .enter()
                    .append("circle")
                    .attr("cx", (d)=>(Number(d.X)-midx)/sx*width+width/2+50 )
                    .attr("cy", (d)=>(Number(d.Y)-midy)/sy*height+height/2+50 )
                    .attr("r", 3)
                    .style("fill", (d)=>colorScale["P"+d.label])
                    .on("click", (e)=>{
                        if(_this.state.useGroup) {
                            _this.setState({key: "P"+String(e.label)});
                            this.highlightPoly("P"+String(e.label));
                        }
                        else {
                            _this.setState({key: String(e.id)});
                            this.highlightPoly(String(e.id));
                        }
                    });
        });

        map.on("click", (e)=>{
            var lat=e.latlng.lat;
            var lng=e.latlng.lng;
            if(lat<30.132932 || lat>30.409347999999998 || lng<119.963804 || lng>120.437324) {
                this.setState({key:""});
                this.resetPoly();
            }
        })

        this.drawPOI();
        this.drawGlyph();

        this.heatPointGroup = {};
        //先從00小時開始繪製箭頭
        // this.initArrow("00");
        this.trafficChart();
    }

        // 返回一个有前缀的小时时间
    judgeHourTime(hourTime) {
        let x = hourTime;
        if (x.length === 1) {
            return "0" + x;
        } else {
            return x;
        }
    }

    // 计算所要画箭头的头尾
    calHeadTail(point1, point2, ratio1, ratio2) {

        return [
            //side
            point1[0] >= point2[0] ? [point1[0], point1[1] + this.wideDistance * ratio1 * 3 / 2] : [point1[0] + this.heightDistance * ratio1 * 3, point1[1] + this.wideDistance * ratio1 * 3 / 2],
            point1[1] >= point2[1] ? [point2[0] + this.heightDistance * ratio2 * 3 / 2, point2[1] + this.wideDistance * ratio2 * 3] : [point2[0] + this.heightDistance * ratio2 * 3 / 2, point2[1]],
            //center
            // [point1[0] + heightDistance * 3 / 2, point1[1] + wideDistance * 3 / 2],
            // [point2[0] + heightDistance * 3 / 2, point2[1] + wideDistance * 3 / 2],
            point1[0] >= point2[0] ? 1 : 0,
            point1[1] >= point2[1] ? 1 : 0,
        ]
    }

    /*
     * @basePoint:  发射区域的中心点
     * @arrowPoint: 指向区域的中心点
     * @deviation:  需要偏离多少 default=0.003
     */
    getArrowCoordinateResult(basePoint, arrowPoint, shortenRatio = 14 / 15, deviation = 0.002, translateRight = 0) {
        //计算转移矩阵
        function createTransformMatrix(a, b, c, d) {
            let matrixTransform = math.matrix([
                [a, c],
                [b, d],
            ]);
            return matrixTransform;
        }

        function calcAngleRadians(x, y) {
            // return Math.atan2(y, x) * 180 / Math.PI;//degree
            return Math.atan2(y, x);
        }

        var deltax = arrowPoint[1] - basePoint[1];//lng
        var deltay = arrowPoint[0] - basePoint[0];//lat
        let a = math.matrix([
            deltax,//lng
            deltay//lat
        ]);
        let theta = calcAngleRadians(deltay, deltax);
        //先对于b进行变换矩阵变成直线上进行作业
        let b = math.chain(math.multiply(
            createTransformMatrix(
                Math.cos(theta),
                Math.sin(theta),
                -Math.sin(theta),
                Math.cos(theta)
            ),
            a
        ))
            .squeeze()
            .done();
        let tmpLng = (b.subset(math.index(0)));//lng
        let tmpLat = (b.subset(math.index(1)));//lat

        //找到直线上面的两个点
        let completeShortenRatio = 1 - shortenRatio;
        let d1 = [this.points[0][0] + tmpLat, this.points[0][1] + tmpLng];
        let newPoint1 = [basePoint[0] + tmpLat * shortenRatio, basePoint[1] + tmpLng * shortenRatio + deviation + translateRight];
        let newPoint2 = [basePoint[0] + tmpLat * completeShortenRatio, basePoint[1] + tmpLng * completeShortenRatio + deviation + translateRight];
        let newPoint1Mx = math.matrix([
            newPoint1[1] - basePoint[1],//lng
            newPoint1[0] - basePoint[0]//lat
        ]);
        let newPoint2Mx = math.matrix([
            newPoint2[1] - basePoint[1],//lng
            newPoint2[0] - basePoint[0]//lat
        ]);
        //换回原来的线性空间找出箭头的起始与终点
        let r1 = math.chain(math.multiply(
            math.inv(
                createTransformMatrix(
                    Math.cos(theta),
                    Math.sin(theta),
                    -Math.sin(theta),
                    Math.cos(theta)
                )),
            newPoint1Mx
        ))
            .squeeze()
            .done();
        let r2 = math.chain(math.multiply(
            math.inv(
                createTransformMatrix(
                    Math.cos(theta),
                    Math.sin(theta),
                    -Math.sin(theta),
                    Math.cos(theta)
                )),
            newPoint2Mx
        ))
            .squeeze()
            .done();

        tmpLat = (r1.subset(math.index(1)));//lat
        tmpLng = (r1.subset(math.index(0)));//lng

        let rp1 = [basePoint[0] + tmpLat, basePoint[1] + tmpLng];
        tmpLat = (r2.subset(math.index(1)));//lat
        tmpLng = (r2.subset(math.index(0)));//lng
        let rp2 = [basePoint[0] + tmpLat, basePoint[1] + tmpLng];
        return [
            rp2,//close to base
            rp1,//the other side
            basePoint[0] >= arrowPoint[0] ? 1 : 0,
            basePoint[1] >= arrowPoint[1] ? 1 : 0,
        ]
    }

    //画箭头
    drawArrow(p1, p2, value, arrowDictIndex1, arrowDictIndex2) {
        //exception process
        let sPoints;
        let myFactor;
        if (arrowDictIndex1 === "0" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 9/10,0.002,0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.1 : -0.1;
        }
        else if (arrowDictIndex1 === "1" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 9 / 10);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.3 : -0.3;
        } else if (arrowDictIndex1 === "1" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 9 / 10, 0.002, -0.004);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.3 : 0.3;
        } else if (arrowDictIndex1 === "2" && arrowDictIndex2 === "3") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 19 / 20, 0.001, -0.004);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.3 : 0.3;
        } else if (arrowDictIndex1 === "2" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 14 / 15, 0.001, 0.005);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.2 : -0.2;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 14 / 15, 0.001, -0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.2 : 0.2;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "2") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 14 / 15, 0.001, 0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.3 : -0.3;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 14 / 15, 0.001);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.1 : -0.1;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "5") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 59 / 60, 0.001,-0.008);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.5 : 0.5;
        } else if (arrowDictIndex1 === "4" && arrowDictIndex2 === "5") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 29 / 30, 0.001, 0.002);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.1 : -0.1;
        } else if (arrowDictIndex1 === "5" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 14 / 15, 0.001, 0.002);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.1 : -0.1;
        } else if (arrowDictIndex1 === "5" && arrowDictIndex2 === "3") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 29 / 30, 0.001, 0.005);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.3 : -0.3;
        } else if (arrowDictIndex1 === "5" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p1, p2, 14 / 15, 0.001, -0.002);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.1 : -0.1;
        } else {
            sPoints = this.getArrowCoordinateResult(p1, p2);
            /**
             * 1 & 1 指向的box在 上 & 右方
             * 0 & 1             下 & 右方
             * 1 & 0             上 & 左方
             * 0 & 0             下 & 左方
             */
            myFactor = sPoints[2] ^ sPoints[3] ? -0.1 : -0.1;
        }
        /**
         *  ------                      ------
         * | box1 |                    | box2 |
         *  ------                      ------
         *     right_arrow       left_arrow
         *              ------
         *             | box3 |
         *              ------
         *    left_arrow         right_arrow
         *  ------                      ------
         * | box4 |                    | box5 |
         *  ------                      ------
         *
         */
        let arrowHeadDirection = sPoints[2] ^ sPoints[3] ? "#arrow_right_blue" : "#arrow_left_blue";
        const swoopy1 = L.swoopyArrow(sPoints[0], sPoints[1], {
            label: '',
            labelFontSize: 12,
            iconAnchor: [20, 10],
            iconSize: [20, 16],
            weight: value * 5 + 1,
            factor: myFactor,
            color: this.outflowColor,
            opacity: 0.8,
            // arrowFilled: false,
            // hideArrowHead: true,
            // arrowId:"#arrow_orange"
        });
        this.ArrowDict[arrowDictIndex1].push(swoopy1);
        // swoopy1.addTo(this.ArrowDict[arrowDictIndex2]);

        //shoot back
        if (arrowDictIndex1 === "0" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 9/10,0.002,-0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.1 : 0.1;
        }
        else if (arrowDictIndex1 === "1" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 9 / 10);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.3 : 0.3;
        } else if (arrowDictIndex1 === "1" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 9 / 10, 0.002, 0.004);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.3 : -0.3;
        } else if (arrowDictIndex1 === "2" && arrowDictIndex2 === "3") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 19 / 20, 0.001, 0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.3 : -0.3;
        } else if (arrowDictIndex1 === "2" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 14 / 15, 0.001, -0.005);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.2 : 0.2;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 14 / 15, 0.001, 0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.2 : -0.2;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "2") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 14 / 15, 0.001, -0.003);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.3 : 0.3;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 14 / 15, 0.001);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.1 : 0.1;
        } else if (arrowDictIndex1 === "3" && arrowDictIndex2 === "5") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 59 / 60, 0.001,0.008);
            myFactor = sPoints[2] ^ sPoints[3] ? -0.5 : -0.5;
        } else if (arrowDictIndex1 === "4" && arrowDictIndex2 === "5") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 29 / 30, 0.001, -0.002);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.1 : 0.1;
        } else if (arrowDictIndex1 === "5" && arrowDictIndex2 === "0") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 14 / 15, 0.001, -0.002);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.1 : 0.1;
        } else if (arrowDictIndex1 === "5" && arrowDictIndex2 === "3") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 29 / 30, 0.001, -0.005);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.3 : 0.3;
        } else if (arrowDictIndex1 === "5" && arrowDictIndex2 === "4") {
            sPoints = this.getArrowCoordinateResult(p2, p1, 14 / 15, 0.001, 0.002);
            myFactor = sPoints[2] ^ sPoints[3] ? 0.1 : 0.1;
        } else {
            sPoints = this.getArrowCoordinateResult(p2, p1);
            /**
             * 1 & 1 指向的box在 上 & 右方
             * 0 & 1             下 & 右方
             * 1 & 0             上 & 左方
             * 0 & 0             下 & 左方
             */
            myFactor = sPoints[2] ^ sPoints[3] ? 0.1 : 0.1;
        }
        /**
         *  ------                      ------
         * | box1 |                    | box2 |
         *  ------                      ------
         *     right_arrow       left_arrow
         *              ------
         *             | box3 |
         *              ------
         *    left_arrow         right_arrow
         *  ------                      ------
         * | box4 |                    | box5 |
         *  ------                      ------
         *
         */
        arrowHeadDirection = sPoints[2] ^ sPoints[3] ? "#arrow_right_blue" : "#arrow_left_blue";
        const swoopy2 = L.swoopyArrow(sPoints[0], sPoints[1], {
            label: '',
            labelFontSize: 12,
            iconAnchor: [20, 10],
            iconSize: [20, 16],
            weight: value * 5 + 1,
            factor: myFactor,
            color: this.inflowColor,
            opacity: 0.8,
            // arrowFilled: false,
            // hideArrowHead: true,
            // arrowId: arrowHeadDirection
        });
        this.ArrowDict[arrowDictIndex1].push(swoopy2);
        // swoopy2.addTo(this.ArrowDict[arrowDictIndex2]);
    }

    //循環加入箭頭
    initArrow(startHour) {
        let searchHour = startHour;
        var _this = this;
        $.getJSON("./RPPattern_volume.json", function (flowValue) {

            function arraysEqual(a, b) {
                if (a === b) return true;
                if (a == null || b == null) return false;
                if (a.length != b.length) return false;

                // If you don't care about the order of the elements inside
                // the array, you should sort both arrays here.
                // Please note that calling sort on an array will modify that array.
                // you might want to clone your array first.

                for (var i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) return false;
                }
                return true;
            }

            //处理热点被点击的事件
            function onHeatPointClick(e) {
                console.log("onHeatPointClick", e);
                function isPointInside(leftBottomPoint, rightTopPoint, point) {
                    if (rightTopPoint[0] > point[0] && point[0] > leftBottomPoint[0] && rightTopPoint[1] > point[1] && point[1] > leftBottomPoint[1]) {
                        return true;
                    } else return false;
                }

                e.target.setStyle({fillColor: _this.inflowColor, fillOpacity: 1});
                e.sourceTarget.setStyle({fillColor: _this.outflowColor, fillOpacity: 1});
                let ptSW = e.layer._bounds._southWest;
                let ptNE = e.layer._bounds._northEast;
                let leftBottomPoint = [ptSW.lat, ptSW.lng];
                let rightTopPoint = [ptNE.lat, ptNE.lng];
                for (let i = 0; i < _this.points.length; i++) {
                    if (isPointInside(leftBottomPoint, rightTopPoint, _this.points[i])) {
                        for(var ii=0; ii<_this.ArrowDict[i.toString()].length; ii++)
                            _this.ArrowDict[i.toString()][ii].addTo(_this.map);
                    } else {
                        for(var ii=0; ii<_this.ArrowDict[i.toString()].length; ii++)
                            _this.ArrowDict[i.toString()][ii].removeFrom(_this.map);
                    }
                }
            }

            /*
             * level relation: heatPointGroup>map
             *                 addHeatPoint>heatPointGroup>click>onHeatPointClick>show arrow
             */
            console.log(_this.heatPointGroup);
            if (Object.keys(_this.heatPointGroup).length > 0) {
                let heatPointGrouopLength = Object.keys(_this.heatPointGroup).length;
                for (let i = 0; i < heatPointGrouopLength; i++) {
                    _this.heatPointGroup[Object.keys(_this.heatPointGroup)[i]].removeFrom(_this.map);
                }
            }
            _this.heatPointGroup[searchHour] = L.featureGroup().addTo(_this.map);

            function addHeatPoint(hourTime) {
                let ratioList = [];//for arrow ratio
                let searchTime = _this.judgeHourTime(hourTime);
                console.log(searchHour);
                let regionValueList = [];
                for (var i = 0; i < _this.points.length; i++) {
                    let name = "P" + i.toString() + "_P" + i.toString() + "_" + searchTime;
                    regionValueList.push(flowValue[name]);
                }
                let max = Math.max(...regionValueList);
                for (var i = 0; i < _this.points.length; i++) {
                    let ratio = regionValueList[i] / max;
                    ratioList.push(ratio);
                    var bound = [
                        [_this.points[i][0] - _this.heightDistance * ratio * 3 / 2, _this.points[i][1] - _this.wideDistance * ratio * 3 / 2],
                        [_this.points[i][0] + _this.heightDistance * ratio * 3 / 2, _this.points[i][1] + _this.wideDistance * ratio * 3 / 2]
                    ];
                    var heatPoint = L.rectangle(bound, {
                        color: '#696969',
                        fillColor: '#696969',
                        opacity: 1,
                        weight: 1
                    }).addTo(_this.heatPointGroup[searchTime]);
                }


                //循环加入箭头
                for (let i = 0; i < _this.points.length; i++) {
                    // if(_this.ArrowDict[i.toString()]) {
                    //     _this.ArrowDict[i.toString()].removeFrom(_this.map);
                    // }
                    _this.ArrowDict[i.toString()] = [];
                }
                for (let i = 0; i < _this.points.length; i++) {
                    for (let j = 0; j < _this.points.length; j++) {
                        if (i === j) {
                            continue;
                        } else {
                            let name = "P" + i.toString() + '_' + 'P' + j.toString() + '_' + searchHour;
                            _this.drawArrow(_this.points[i], _this.points[j], parseFloat(flowValue[name]) / 467, i.toString(), j.toString())
                            // console.log("drawArrow: ", name);
                            // console.log("  after draw: ", i, _this.ArrowDict[i.toString()].length, j, _this.ArrowDict[j.toString()].length);
                        }
                    }
                }
            }//finish add Heat point

            addHeatPoint(searchHour);
            _this.heatPointGroup[searchHour].on('click', onHeatPointClick);
            console.log(_this.heatPointGroup);

        });
    }

    // 设置高亮
    highlightPoly(key) {
        this.setState({key: key});
        // console.log(key);
        // console.log(polygonlist);
        var pid=key;
        for(var i=0; i<this.polygonlist.length; i++) {
            var regionOpacity = Number(this.opacities[this.polygonlist[i].id]);
            if(this.state.useGroup) {
                if(this.polygonlist[i].group==key) {
                    this.polygonlist[i].setStyle({opacity:1.0, weight: 1.0, fillOpacity: 0.6*this.fillOpacityRatio*regionOpacity});
                }
                else {
                    this.polygonlist[i].setStyle({opacity:0.2, weight: 0.5, fillOpacity: 0.3*this.fillOpacityRatio*regionOpacity});
                }
            }
            else {
                if(this.polygonlist[i].id==key) {
                    pid = this.polygonlist[i].group;
                    this.polygonlist[i].setStyle({opacity:1.0, weight: 1.0, fillOpacity: 0.6*this.fillOpacityRatio*regionOpacity});
                }
                else {
                    this.polygonlist[i].setStyle({opacity:0.2, weight: 0.5, fillOpacity: 0.3*this.fillOpacityRatio*regionOpacity});
                }
            }
        }

        if(this.state.useGroup) {
            console.log("pid=", pid);
            if(this.glyphs[pid]!=undefined) {
                Object.keys(this.glyphs).forEach((k)=>{
                    if(pid==k) {
                        this.glyphs[k].setAttribute("opacity", 1.0);
                    }
                    else {
                        this.glyphs[k].setAttribute("opacity", 0.3);
                    }
                });
    
                for(var i=0; i<6; i++) {
                    var pi = document.getElementsByClassName("P"+i);
                    if("P"+i==pid) {
                        for(var j=0; j<pi.length; j++) {
                            pi[j].setAttribute("opacity", 1.0);
                        }
                    }
                    else {
                        for(var j=0; j<pi.length; j++) {
                            pi[j].setAttribute("opacity", 0.3);
                        }
                    }
                }
            }
        } else {
            if(this.state.hasGlyphs) {
                while(glyphview.childElementCount>0) {
                    glyphview.removeChild(glyphview.children[0]);
                }
            }
            this.setState({hasGlyphs: false});
            while(glyphview.childElementCount>5) {
                glyphview.removeChild(glyphview.children[0]);
            }
            this.drawGlyphID(key, pid);
        }

        var points = this.svg.selectAll('circle')[0];
        // console.log(points);
        for( var i=0; i<points.length; i++) {
            if(this.state.useGroup) {
                if("P"+points[i].__data__.label==key) {
                    points[i].style.opacity=1.0;
                }
                else {
                    points[i].style.opacity=0.2;
                }
            }
            else {
                if(points[i].__data__.id==key) {
                    points[i].style.opacity=1.0;
                }
                else {
                    points[i].style.opacity=0.2;
                }
            }
        }
    }

    // 回复样式
    resetPoly() {
        this.setState({key: ""});
        if(!this.state.hasGlyphs){
            for(var i=glyphview.childElementCount-1; i>=0; i--) {
                glyphview.removeChild(glyphview.children[i]);
            }
            this.drawGlyph();
        }
        this.setState({hasGlyphs: true});
        for(var i=0; i<this.polygonlist.length; i++) {
            var regionOpacity = Number(this.opacities[this.polygonlist[i].id]);
            this.polygonlist[i].setStyle({opacity:0.8, weight: 0.5, fillOpacity: 0.5*this.fillOpacityRatio*regionOpacity});
        }
        var points = this.svg.selectAll('circle')[0];
        for( var i=0; i<points.length; i++) {
            points[i].style.opacity=1.0;
        }
        Object.keys(this.glyphs).forEach((k)=>{
            this.glyphs[k].setAttribute("opacity", 1.0);
        });

        for(var i=0; i<6; i++) {
            var pi = document.getElementsByClassName("P"+i);
            for(var j=0; j<pi.length; j++) {
                pi[j].setAttribute("opacity", 1.0);
            }
        }
    }

    trafficChart() {
        d3.csv("trafficVolume.csv",function(error,csvdata){
            if(error){
                console.log(error);
            }
            let mydata = [];
            for (var i = 0; i < 168; i++) {
                var temp = csvdata[i].onVolume;
                var temp1 = parseInt(temp);
                mydata.push(temp1);
            }
            var colors = [
                "#ffffd9",
                "#edf8b1",
                "#c7e9b4",
                "#7fcdbb",
                "#41b6c4",
                "#1d91c0",
                // "#225ea8",
                // "#253494",
            ];
            var chart1 = circularHeatChart()
                    .innerRadius(27)
                    .segmentHeight(18)
                    .range(["#ffffd9", "#1d91c0"])
                    .radialLabels(["1", "2", "3", "4", "5", "6", "7"])
                    .segmentLabels(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                        "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]);
        
            d3.select('#chart1')
                    .selectAll('svg')
                    .data([mydata])
                    .enter()
                    .append('svg')
                    .attr("height", "85%")
                    .attr("width", "100%")
                    .attr("font-size", "10px")
                    .call(chart1);
            
            var colorScale = d3.scale.linear()
                    .domain([0,8])
                    .range(["#ffffd9", "#1d91c0"]);
            var dataScale = d3.scale.linear()
                    .domain([0,8])
                    .range(d3.extent(mydata));
            var mysvg = d3.select('#chart1')
                    .append('svg')
                    .attr("width", "100%");
            var legend = mysvg.selectAll(".legend")
                    .data([0,1,2,3,4,5,6,7,8]);
            legend.enter().append("g")
                    .attr("class", "legend");
            legend.append("rect")
                    .attr("x", function(d, i) { return 37*i; })
                    .attr("y", 0)
                    .attr("width", 37)
                    .attr("height", 20)
                    .style("fill", function(d, i) { return colorScale(d); });
            legend.append("text")
                    .attr("class", "mono")
                    .attr("font-size", "10")
                    .text(function(d,i) {
                        if(d>7) return "≥"+Math.round(dataScale(d));
                        return  Math.round(dataScale(d));
                    })
                    .attr("x", function(d, i) { return 37* i+5; })
                    .attr("y", function(d, i) { if(i%2==0) return 35; else return 35; });
            legend.exit().remove();
        });
    }

    setTimeOpacity(time, useGroup=undefined) {
        console.log("setTimeOpacity", time, useGroup);
        var _this = this;
        if(useGroup==undefined) useGroup=this.state.useGroup;
        if(useGroup) {
            for(var i=0; i<_this.opacities.length; i++) _this.opacities[i] = 1.0;
            _this.resetPoly();
            return;
        }
        d3.csv("./onOffTotalV.csv", (data)=>{
            var max={"P0":0,"P1":0,"P2":0,"P3":0,"P4":0,"P5":0,};
            for(var i=0; i<_this.opacities.length; i++) _this.opacities[i] = 0.0;
            for(var i=0; i<data.length; i++) {
                if(time!="none" && Number(time)!=Number(data[i].time)) continue;
                var pid = _this.polygonlist[_this.polyInvList[data[i].region]].group;
                _this.opacities[data[i].region] = _this.opacities[data[i].region]+Number(data[i].totalV);
                if(max[pid]<_this.opacities[data[i].region]) {
                    max[pid]=_this.opacities[data[i].region];
                }
            }
            console.log("max of onOffTotalV is ", max);
            for(var i=0; i<425; i++) {
                var pid = _this.polygonlist[_this.polyInvList[i]].group;
                _this.opacities[i] = _this.opacities[i]/max[pid];
                var kk=0.7;
                _this.opacities[i] = Math.log2(_this.opacities[i]+1);
                _this.opacities[i] = _this.opacities[i]*kk+(1-kk);
            }
            // console.log("load csv");
            _this.resetPoly();
        });
    }
}

ReactDOM.render(<MainApp/>, document.getElementById('root'));