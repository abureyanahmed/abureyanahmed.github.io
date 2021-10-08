function draw()
{
  var txt = document.getElementById("input_text").value;
  var lines = txt.split('\n');
  var all_edges = [];
  var edge_list = [];
  var node_list = [];
  for(var i=0;i<lines.length;i++)
  {
    if(lines[i].replace(/\s/g, "")=="")continue;
    var edge = lines[i].split("--");
    edge[0] = edge[0].replace(/\s/g, "");
    edge[1] = edge[1].replace(/\s/g, "");
    //if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    //if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }
  node_list.push(all_edges[0].source_label);
  all_edges.reverse();
  window.all_edges = all_edges;
  //console.log(edge_list);
  //console.log(node_list);
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  var nodes = [];
  for(var i=0;i<node_list.length;i++)
  {
    nodes.push({"label":node_list[i]});
  }

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  edge_list.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })

  var rev_scale = d3.scaleLinear().domain([1, 10]).range([1, .1]);
  var stability = rev_scale(parseInt(document.getElementById("myRange").value));

  var manyBody = d3.forceManyBody().strength(-50 * stability);
  var forceLink = d3.forceLink().strength(stability);
  //var forceLink = d3.forceLink();
  var center = d3.forceCenter().x(width/2).y(height/2);

  var simulation = d3.forceSimulation()
   .force("charge", manyBody)
   .force("center", center)
   .force("link", forceLink)
   .nodes(nodes)
   .on("tick", updateNetwork);  
  window.simulation = simulation;

  simulation.force("link").links(edge_list);

  d3.select("svg")
   .selectAll("circle")
   .data(nodes)
   .enter()
   .append("circle")
   .style("fill", "red")
   .attr("r", 5);

  d3.select("svg").selectAll("line.link")
   .data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

  function updateNetwork() {
   d3.selectAll("circle")
     .attr("cx", d => d.x)
     .attr("cy", d => d.y);
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);
  }

  window.addEdgeInterval = setInterval(addEdge, 1000*rev_scale(parseInt(document.getElementById("speedRange").value)));
}

function addEdge()
{
  if(window.all_edges.length>0)
  {
    var simulation = window.simulation;
    var edge = window.all_edges.pop();
    var sourceIndex = simulation.nodes().findIndex(d => d.label == edge.source_label);
    var sourceNode = simulation.nodes()[sourceIndex];
    var targetNodeLabel = edge.target_label;
    simulation.stop();
    var oldEdges = simulation.force("link").links()
    var oldNodes = simulation.nodes()
    var newNode = {"label":targetNodeLabel, x: sourceNode.x, y: sourceNode.y};
    var newEdge = {source: sourceNode, target: newNode};
    oldEdges.push(newEdge);
    oldNodes.push(newNode);
    simulation.force("link").links(oldEdges);
    simulation.nodes(oldNodes);

    d3.select("svg")
     .selectAll("circle")
     .data(oldNodes)
     .enter()
     .append("circle")
     .style("fill", "red")
     .attr("r", 5);

    d3.select("svg").selectAll("line.link")
     .data(oldEdges, d => `${d.source_label}-${d.target_label}`) .enter()
     .append("line")
     .attr("class", "link")
     .style("opacity", .5)
     .style("stroke-width", d => d.weight);

    simulation.alpha(0.1);
    simulation.restart();
  }
  else
  {
    clearInterval(window.addEdgeInterval);
  }
}

