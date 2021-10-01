function draw()
{
  var txt = document.getElementById("input_text").value;
  var lines = txt.split('\n');
  var edge_list = [];
  var node_list = [];
  for(var i=0;i<lines.length;i++)
  {
    if(lines[i].replace(/\s/g, "")=="")continue;
    var edge = lines[i].split("--");
    edge[0] = edge[0].replace(/\s/g, "");
    edge[1] = edge[1].replace(/\s/g, "");
    if(node_list.findIndex(x => x==edge[0])==-1)node_list.push(edge[0]);
    if(node_list.findIndex(x => x==edge[1])==-1)node_list.push(edge[1]);
    edge_list.push({source:{index:node_list.findIndex(x => x==edge[0])}, target:{index:node_list.findIndex(x => x==edge[1])}});
  }
  //console.log(edge_list);
  //console.log(node_list);
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  //node_list = d3.range(100).map((d,i) => ({r: 50 - i * .5}));
  var nodes = [];
  for(var i=0;i<node_list.length;i++)
  {
    nodes.push({"id":node_list[i]});
  }

  var rev_scale = d3.scaleLinear().domain([1, 10]).range([10, 1]);
  var manyBody = d3.forceManyBody().strength(rev_scale(parseInt(document.getElementById("myRange").value)));
  var center = d3.forceCenter().x(width/2).y(height/2);

  d3.forceSimulation()
   .force("charge", manyBody)
   .force("center", center)
   .nodes(nodes)
   .on("tick", updateNetwork);  

  d3.select("svg")
   .selectAll("circle")
   .data(nodes)
   .enter()
   .append("circle")
   .style("fill", "red")
   .attr("r", 5);

  function updateNetwork() {
   d3.selectAll("circle")
     .attr("cx", d => d.x)
     .attr("cy", d => d.y)
  }

}
