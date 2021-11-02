
function delete_val(dict, val)
{
  var keys = Object.keys(dict);
  for(var i=0;i<keys.length;i++)
  {
    if(dict[keys[i]]==val)delete dict[keys[i]];
  }
}

// All top vertices are ordered from 0 to |V_t|-1
// The bottom vertices are numbered from |V_t| to |V_t|+|V_b|-1
// We need to return pi_b = bottom_order
// adj is the adjacency list
// n_top = |V_t|
// bottom_degree contains the degree of the bottom vertices
// top start is the index of the leftmost top vertex
// reuse_last_bot indicates there was a neighbor that is common between current top node and previous top node
function crossing_removal_k_split(top_start, n_top, adj, bottom_order, bottom_degree, reuse_last_bot){
  var V = Object.keys(adj);

  // If there is a common neighbor with previous node, add the edge with common neighbor
  if(reuse_last_bot)
  {
    bottom_degree[bottom_degree.length-1] += 1;
    var u = top_start+"";
    var N_u = Object.values(adj[u]);
    var bot_ngbr = bottom_order[bottom_order.length-1];
    var N_w_dict = adj[bot_ngbr+""];
    delete_val(N_w_dict, parseInt(u));
    delete_val(adj[u], bot_ngbr);
    if(Object.keys(N_w_dict).length==0)delete N_w_dict;
    else{
      // we know there are multiple vertices at top
      var v = (top_start+1)+"";
      var N_v = Object.values(adj[v]);
      // we need to check whether we are done with u, and do bot_ngbr is a neighbor of v too
      // check the degree of u
      if((N_u.length==1)&&(N_v.indexOf(bot_ngbr)!=-1))reuse_last_bot = true;
      else reuse_last_bot = false;
    }
    if(N_u.length==1)
    {
      delete adj[u];
      crossing_removal_k_split(top_start+1, n_top, adj, bottom_order, bottom_degree, reuse_last_bot);
    }
  }

  //var mins = findMins(n_top, V);
  //if(mins.min2==-1)
  if((top_start+1)>=n_top)
  {
    //if(mins.min1!=-1)
    if(top_start<n_top)
    {
      //var u = V[mins.min1];
      var u = top_start+"";
      var N_u = Object.values(adj[u]);
      for(var i=0;i<N_u.length;i++)
      {
        bottom_order.push(N_u[i]);
        bottom_degree.push(1);
      }
    }
    return;
  }

  //var u = V[mins.min1];
  //var v = V[mins.min2];
  var u = top_start+"";
  var v = (top_start+1)+"";
  var N_u = Object.values(adj[u]);
  var N_v = Object.values(adj[v]);
  var common_neighbors = [];
  for(var i=0;i<N_u.length;i++)
  {
    if(N_v.indexOf(N_u[i])!=-1)
    {
      common_neighbors.push(N_u[i]);
    }
  }
  var first_common = -1;
  reuse_last_bot = false;
  if(common_neighbors.length>0)
  {
    first_common = common_neighbors[0];
    reuse_last_bot = true;
  }
  for(var i=0;i<N_u.length;i++)
  {
    if(N_u[i]==first_common)continue;
    var N_w_dict = adj[N_u[i]+""];
    bottom_order.push(N_u[i]);
    bottom_degree.push(1);
    delete_val(N_w_dict, parseInt(u));
    if(Object.keys(N_w_dict).length==0)delete N_w_dict;
  }
  if(first_common!=-1)
  {
    var N_w_dict = adj[first_common+""];
    bottom_order.push(first_common);
    //bottom_degree.push(2);
    bottom_degree.push(1);
    delete_val(N_w_dict, parseInt(u));
    //delete_val(N_w_dict, parseInt(v));
    //if(Object.keys(N_w_dict).length==0)delete N_w_dict;
    //delete_val(adj[v], first_common);
  }
  delete adj[u];
  crossing_removal_k_split(top_start+1, n_top, adj, bottom_order, bottom_degree, reuse_last_bot);
}
/*
var bottom_order = [];
var bottom_degree = [];
var adj = {0:{0:2, 1:3}, 1:{0:2, 1:3}, 2:{0:0, 1:1}, 3:{0:0,1:1}};
crossing_removal_k_split(0, 2, adj, bottom_order, bottom_degree, false);
console.log("bottom_order", bottom_order);
console.log("bottom_degree", bottom_degree);
*/
function draw()
{
  d3.select("svg").selectAll("*").remove();
  var txt = document.getElementById("input_text").value;
  /*
  var lines = txt.split('\n');
  var all_edges = [];
  var all_nodes = [];
  var n_top = parseInt(lines[0].replace(/\s/g, ""));
  var adj = {};
  for(var i=1;i<lines.length;i++)
  {
    if(lines[i].replace(/\s/g, "")=="")continue;
    var edge = lines[i].split("--");
    edge[0] = edge[0].replace(/\s/g, "");
    edge[1] = edge[1].replace(/\s/g, "");
    if(Object.keys(adj).indexOf(edge[0])==-1)adj[edge[0]] = {};
    if(Object.keys(adj).indexOf(edge[1])==-1)adj[edge[1]] = {};
    adj[edge[0]][Object.keys(adj[edge[0]]).length+""] = parseInt(edge[1]);
    adj[edge[1]][Object.keys(adj[edge[1]]).length+""] = parseInt(edge[0]);
    if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }
  */

  var G_json = JSON.parse(txt);
  var all_edges = [];
  var all_nodes = [];
  var n_top = G_json["n_top"];
  var adj = {}
  for(var i=0;i<G_json["edges"].length;i++)
  {
    var edge = [G_json["edges"][i]["source"]+"", G_json["edges"][i]["target"]+""];
    if(Object.keys(adj).indexOf(edge[0])==-1)adj[edge[0]] = {};
    if(Object.keys(adj).indexOf(edge[1])==-1)adj[edge[1]] = {};
    adj[edge[0]][Object.keys(adj[edge[0]]).length+""] = parseInt(edge[1]);
    adj[edge[1]][Object.keys(adj[edge[1]]).length+""] = parseInt(edge[0]);
    if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }

  //node_list.push(all_edges[0].source_label);
  //all_edges.reverse();
  //window.all_edges = all_edges;
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  var nodes = [];
  var top_x = 300;
  var bot_x = 300;
  for(var i=0;i<all_nodes.length;i++)
  {
    if(parseInt(all_nodes[i])<n_top)
    {
      nodes.push({"label":all_nodes[i], "txt":G_json.node_id_to_txt[all_nodes[i]], "x":top_x, "y":100});
      top_x += 200;
    }
    else
    {
      nodes.push({"label":all_nodes[i], "txt":G_json.node_id_to_txt[all_nodes[i]], "x":bot_x, "y":300});
      bot_x += 200;
    }
  }

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  all_edges.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })

  console.log(all_edges);

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node");

  node.append("circle")
   .style("fill", "red")
   .attr("r", 5);

  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    //.text(function(d) { return d.label });
    .text(function(d) { return d.txt });

  d3.select("svg").selectAll("line.link")
   //.data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   //.data(all_edges, d => `${d.source_label}-${d.target_label}`) .enter()
   .data(all_edges) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

   d3.selectAll(".node")
     .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);

  var bottom_order = [];
  var bottom_degree = [];
  var adj2 = JSON.parse(JSON.stringify(adj));
  crossing_removal_k_split(0, 2, adj, bottom_order, bottom_degree, false);
  adj = adj2;
  console.log("bottom_order", bottom_order);
  console.log("bottom_degree", bottom_degree);
  var split_txt = n_top+"\n";
  var total_split_edges = 0;
  for(var i=0;i<bottom_degree.length;i++)
  {
    total_split_edges += bottom_degree[i];
  }
  var top_degree = [];
  for(var i=0;i<n_top;i++)
  {
    top_degree.push(Object.values(adj[i+""]).length);
  }
  var cur_top_i = 0;
  var cur_bot_i = 0;
  var bottom_counter = {};
  var id_to_label = {};
  var bot_id = n_top;
  var u = bottom_order[cur_bot_i];
  bottom_counter[u] = 1;
  id_to_label[bot_id] = G_json.node_id_to_txt[u] + ":" + bottom_counter[u];
  for(var i=0;i<total_split_edges;i++)
  {
    split_txt += cur_top_i+"--"+bot_id+"\n";
    bottom_degree[cur_bot_i] -= 1;
    top_degree[cur_top_i] -= 1;
    if(i!=(total_split_edges-1))
    {
      if(bottom_degree[cur_bot_i]==0)
      {
        cur_bot_i+=1;
        bot_id += 1;
        u = bottom_order[cur_bot_i];
        if(Object.keys(bottom_counter).indexOf(u+"")==-1)bottom_counter[u] = 1;
        else bottom_counter[u] += 1;
        id_to_label[bot_id] = G_json.node_id_to_txt[u] + ":" + bottom_counter[u];
      }
      if(top_degree[cur_top_i]==0)cur_top_i+=1;
    }
  }
  for(var i=0;i<n_top;i++)
  {
    id_to_label[i] = G_json.node_id_to_txt[i];
  }
  console.log(split_txt);
  console.log(bottom_counter);
  console.log(id_to_label);
  window.split_txt = split_txt;
  window.id_to_label = id_to_label;

}

function split()
{
  d3.select("svg").selectAll("*").remove();
  var txt = window.split_txt;
  var lines = txt.split('\n');
  var all_edges = [];
  var all_nodes = [];
  var n_top = parseInt(lines[0].replace(/\s/g, ""));
  var adj = {};
  for(var i=1;i<lines.length;i++)
  { 
    if(lines[i].replace(/\s/g, "")=="")continue;
    var edge = lines[i].split("--"); 
    edge[0] = edge[0].replace(/\s/g, "");
    edge[1] = edge[1].replace(/\s/g, "");
    if(Object.keys(adj).indexOf(edge[0])==-1)adj[edge[0]] = {};
    if(Object.keys(adj).indexOf(edge[1])==-1)adj[edge[1]] = {};
    adj[edge[0]][Object.keys(adj[edge[0]]).length+""] = parseInt(edge[1]);
    adj[edge[1]][Object.keys(adj[edge[1]]).length+""] = parseInt(edge[0]);
    if(all_nodes.findIndex(x => x==edge[0])==-1)all_nodes.push(edge[0]);
    if(all_nodes.findIndex(x => x==edge[1])==-1)all_nodes.push(edge[1]);
    all_edges.push({source_label:edge[0], target_label:edge[1]});
  }
  //node_list.push(all_edges[0].source_label);
  all_edges.reverse();
  window.all_edges = all_edges;
  var svg = d3.select("svg");
  var width = 952,
    height = 500;

  var nodes = [];
  var top_x = 300;
  var bot_x = 300;
  for(var i=0;i<all_nodes.length;i++)
  {
    if(parseInt(all_nodes[i])<n_top)
    {
      nodes.push({"label":all_nodes[i], "txt":window.id_to_label[all_nodes[i]], "x":top_x, "y":100});
      top_x += 200;
    }
    else
    {
      //nodes.push({"label":all_nodes[i], "x":bot_x, "y":300});
      nodes.push({"label":all_nodes[i], "txt":window.id_to_label[all_nodes[i]], "x":bot_x, "y":300});
      bot_x += 200;
    }
  }

  var nodeHash = nodes.reduce((hash, node) => {hash[node.label] = node;
    return hash;
    }, {})

  all_edges.forEach(edge => {
    edge.weight = 1;
    edge.source = nodeHash[edge.source_label];
    edge.target = nodeHash[edge.target_label];
    })

  console.log(all_edges);

  var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node");

  node.append("circle")
   .style("fill", "red")
   .attr("r", 5);

  node.append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.txt });

  d3.select("svg").selectAll("line.link")
   //.data(edge_list, d => `${d.source_label}-${d.target_label}`) .enter()
   //.data(all_edges, d => `${d.source_label}-${d.target_label}`) .enter()
   .data(all_edges) .enter()
   .append("line")
   .attr("class", "link")
   .style("opacity", .5)
   .style("stroke-width", d => d.weight);

   d3.selectAll(".node")
     .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
   d3.selectAll("line.link")
     .attr("x1", d => d.source.x)
     .attr("x2", d => d.target.x)
     .attr("y1", d => d.source.y)
     .attr("y2", d => d.target.y);

}
