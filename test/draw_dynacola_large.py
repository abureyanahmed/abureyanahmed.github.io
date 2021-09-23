from utils import *
import sys
import matplotlib.pyplot as plt
from crossings import *
from stress import *
import json

#output_folder = "dynacola/"
#output_folder = "dynacola_math/"
#output_folder = "dynacola_tol/"
#output_folder = "dynacola_cute/"
#output_folder = "dynasafe/"
#output_folder = "dynasafe_cute/"
#output_folder = "dynasafe_math/"
#output_folder = "dynasafe_tol/"
#output_folder = "dagre/"
#output_folder = "dagre_cute/"
#output_folder = "dagre_math/"
#output_folder = "dagre_tol/"
#output_folder = "dagre_math/"
output_folder = "radial_math/"
#output_folder = "radial_tol/"
f = open(output_folder+"result.json", 'r')
s = f.read()
f.close()
json_obj = json.loads(s)

#node_size = 50-5
#node_size = 100
#node_size = 200
#node_size = 300
#node_size = 400
node_size = 495
#node_size = 499 # for dynasafe

#node_size = 200
#node_size = 400
#node_size = 600
#node_size = 800
#node_size = 995

time_indices = sorted([int(x) for x in list(json_obj["x_coords"].keys())])
#print(time_indices)

x_coords = json_obj["x_coords"]
y_coords = json_obj["y_coords"]

#print(x_coords)
#print(y_coords)

my_inf = 10000000

def draw_graph(x, y, edge_list, id_to_labels, output_file):
 global my_inf
 fig, ax = plt.subplots()
 plt.axis('off')
 xmin = my_inf
 xmax = -1
 ymin = my_inf
 ymax = -1
 #for i in range(len(x)):
 for i in x.keys():
  if xmin > x[i]: xmin = x[i]
  if xmax < x[i]: xmax = x[i]
  if ymin > y[i]: ymin = y[i]
  if ymax < y[i]: ymax = y[i]
 #for i in range(len(x)):
 for i in x.keys():
  circle = plt.Circle((x[i], y[i]), (xmax+ymax-xmin-ymin)/200.00, clip_on=False)
  ax.add_artist(circle)
  #ax.text(x[i]-.5, y[i]-.5, id_to_labels[i][:16], fontsize=6)
  ax.text(x[i], y[i], id_to_labels[i][:16], fontsize=12)
  #ax.text(x[i]-10, y[i], id_to_labels[i], fontsize=12)
 for i in range(len(edge_list)):
  if (edge_list[i][0] not in x.keys()) or (edge_list[i][1] not in x.keys()):continue
  ax.plot([x[edge_list[i][0]], x[edge_list[i][1]]], [y[edge_list[i][0]], y[edge_list[i][1]]], 'k-', lw=2)
 ax.set_xlim([min(xmin,ymin),max(xmax,ymax)])
 ax.set_ylim([min(xmin,ymin),max(xmax,ymax)])
 fig.savefig(output_file)
 plt.close(fig)

edge_list = json_obj["edge_list"]

crd_x = x_coords[str(node_size)]
crd_y = y_coords[str(node_size)]


edge_list2 = []
for e in edge_list:
  u, v = e["source"]["index"], e["target"]["index"]
  u, v = str(u), str(v)
  if u not in crd_x.keys() or v not in crd_x.keys():
    continue
  edge_list2.append(e)
edge_list = edge_list2


'''
print("x_coords[\"9\"]", x_coords["9"])
print("y_coords[\"9\"]", y_coords["9"])
print("edge_list[:9]", edge_list[:9])
'''

id_to_labels = json_obj["id_to_label"]
'''
for k in id_to_labels:
  if id_to_labels[k].isnumeric():
    id_to_labels[k] = ''
'''

#print("id_to_labels", id_to_labels)

'''
for t in time_indices:
  t = str(t)
  if t in x_coords.keys():
    draw_graph(x_coords[t], y_coords[t], edge_list, id_to_labels, output_folder+"time_"+str(int(t)+1)+".pdf")
'''

gs = 0
gc = 0
for node in x_coords[str(node_size)]:
#for node in x_coords[str(time_indices[-1])]:
  s = 0
  c = 0
  for t in time_indices:
    if node in x_coords[str(t)]:
      if str(t-1) in x_coords.keys() and node in x_coords[str(t-1)]:
        s += math.sqrt((x_coords[str(t)][node]-x_coords[str(t-1)][node])**2+(y_coords[str(t)][node]-y_coords[str(t-1)][node])**2)
        c += 1
  gs += s
  gc += 1

#print("Instability:", gs/gc)

#scale = 1.7 # dynacola large
#scale = 4.0 # dynacola
#scale = 0.10 # dynacola
#scale = 0.09 # dynasafe large
#scale = 0.01 # dynasafe large 100
#scale = 0.09 # dynasafe large 499
#scale = 0.12 # dynasafe after convergence
#scale = 0.14 # dynasafe after convergence
#scale = 0.11 # dynasafe
#scale = 7.0 # dagre large
scale = 0.00001 
last_time = str(node_size)
'''
last_time = str(time_indices[-1])
crd_x = x_coords[last_time]
crd_y = y_coords[last_time]
'''
label_len = dict()
label_area = 0
for u in crd_x.keys():
  #print(u, G.nodes[u])
  cur_len = len(id_to_labels[u])
  label_len[u] = cur_len
  label_area += 0.6*scale*scale*cur_len
total_area = (max(list(crd_x.values()))-min(list(crd_x.values())))*(max(list(crd_y.values()))-min(list(crd_y.values())))

print("Instability:", (gs/gc)/total_area)

def doOverlap(l1_x, l1_y, r1_x, r1_y, l2_x, l2_y, r2_x, r2_y):
          # If one rectangle is on left side of other
          if (l1_x >= r2_x) or (l2_x >= r1_x):
            return False

          # If one rectangle is above other
          if (l1_y <= r2_y) or (l2_y <= r1_y):
            return False

          return True

'''
node_lst = list(crd_x.keys())
for i, node_i in enumerate(node_lst):
    for j2, node_j in enumerate(node_lst[i+1:]):
        # check overlap
        j = i+1+j2
        l1_x = crd_x[node_i]
        l1_y = crd_y[node_i]+scale
        r1_x = crd_x[node_i]+label_len[node_i]*scale*.6
        r1_y = crd_y[node_i]
        l2_x = crd_x[node_j]
        l2_y = crd_y[node_j]+scale
        r2_x = crd_x[node_j]+label_len[node_j]*scale*.6
        r2_y = crd_y[node_j]
        if doOverlap(l1_x, l1_y, r1_x, r1_y, l2_x, l2_y, r2_x, r2_y):
          print("overlap found!")
          quit()
'''

#print("Compactness:", label_area/total_area)
print("Compactness:", total_area/label_area)

G = nx.Graph()
for e in edge_list:
  u, v = e["source"]["index"], e["target"]["index"]
  u, v = str(u), str(v)
  if u not in crd_x.keys() or v not in crd_x.keys():
    continue
  #G.add_edge(e["source"]["id"], e["target"]["id"])
  G.add_edge(e["source"]["index"], e["target"]["index"])
for u in G.nodes():
  G.nodes[u]["pos"] = str(crd_x[str(u)]) + ',' + str(crd_y[str(u)])

'''
cross_pair = count_crossings(G)[0]
e1, e2, _, _ = cross_pair
print(id_to_labels[str(e1[0])], id_to_labels[str(e1[1])])
print(id_to_labels[str(e2[0])], id_to_labels[str(e2[1])])
print("edge1")
print(crd_x[str(cross_pair[0][0])], crd_y[str(cross_pair[0][0])])
print(crd_x[str(cross_pair[0][1])], crd_y[str(cross_pair[0][1])])
print("edge2")
print(crd_x[str(cross_pair[1][0])], crd_y[str(cross_pair[1][0])])
print(crd_x[str(cross_pair[1][1])], crd_y[str(cross_pair[1][1])])
quit()
'''
nCrossings = len(count_crossings(G))
print("Crossings:", nCrossings)

total_len = 0
for e in edge_list:
 #u, v = str(e["source"]["id"]), str(e["target"]["id"])
 u, v = str(e["source"]["index"]), str(e["target"]["index"])
 ux, uy = crd_x[u], crd_y[u]
 vx, vy = crd_x[v], crd_y[v]
 total_len += math.sqrt((crd_x[u]-crd_x[v])**2 + (crd_y[u]-crd_y[v])**2)
m = len(edge_list)
avg_len = total_len/m
#print("avg_len", avg_len)
edge_distance = {i:avg_len for i in range(m)}

def ideal_edge_length_preservation(links, ideal_lengths):
  total_difference = 0;
  for i, lnk in enumerate(links):
    #u, v = str(e["source"]["id"]), str(e["target"]["id"])
    u, v = str(e["source"]["index"]), str(e["target"]["index"])
    x1 = crd_x[u]
    y1 = crd_y[u]
    x2 = crd_x[v]
    y2 = crd_y[v]
    dist = math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    diff = abs(ideal_lengths[i] - dist);
    total_difference += math.pow(diff / ideal_lengths[i], 2);
  average_difference = math.sqrt(total_difference / len(links));
  return average_difference;

print("DEL", ideal_edge_length_preservation(edge_list, edge_distance))

print("Stress", stress(G))

#'''
max_id = dict()
max_x, max_y, min_x, min_y = x_coords['0']['0'], y_coords['0']['0'], x_coords['0']['0'], y_coords['0']['0']
#print("max_x, max_y, min_x, min_y", max_x, max_y, min_x, min_y)
for t in time_indices:
  max_id[t] = 0
  for k in x_coords[str(t)]:
    if max_x<x_coords[str(t)][k]:
      max_x = x_coords[str(t)][k]
    if max_y<y_coords[str(t)][k]:
      max_y = y_coords[str(t)][k]
    if min_x>x_coords[str(t)][k]:
      min_x = x_coords[str(t)][k]
    if min_y>y_coords[str(t)][k]:
      min_y = y_coords[str(t)][k]
    max_id[t] = max(int(k), max_id[t])
#print("max_x, max_y, min_x, min_y", max_x, max_y, min_x, min_y)
x_border = (max_x-min_x)*.1
max_x += x_border
min_x -= x_border
y_border = (max_y-min_y)*.1
max_y += y_border
min_y -= y_border
for t in time_indices:
  x_coords[str(t)][str(max_id[t]+1)] = min_x
  y_coords[str(t)][str(max_id[t]+1)] = min_y
  x_coords[str(t)][str(max_id[t]+2)] = min_x
  y_coords[str(t)][str(max_id[t]+2)] = max_y
  x_coords[str(t)][str(max_id[t]+3)] = max_x
  y_coords[str(t)][str(max_id[t]+3)] = min_y
  x_coords[str(t)][str(max_id[t]+4)] = max_x
  y_coords[str(t)][str(max_id[t]+4)] = max_y
#'''

node_suffix = 10
#t = time_indices[-1]
for t in time_indices:
  '''
  #if t%10==4:
  if t%6==0:
    f = open(output_folder + "nodes_" + str(node_suffix) + ".js", 'w')
    #f.write("nodes_" + str(node_suffix) + " = " + str([id_to_labels[k] for k in x_coords[str(t)].keys()]) + '\n')
    f.write("cur_nodes" + " = " + str({id_to_labels[k]:0 for k in x_coords[str(t)].keys()}) + '\n')
    node_suffix += 10
    f.close()
  '''
  my_edges = []
  edge_distance = dict()
  #print(edge_list)
  #n_edges_t = len(x_coords[str(t)].keys())-1
  n_edges_t = len(x_coords[str(t)].keys())-5
  for i, e in enumerate(edge_list[:n_edges_t]):
    u = e["target"]["index"]
    v = e["source"]["index"]
    my_edges.append([id_to_labels[str(u)], id_to_labels[str(v)]])
    #edge_distance[i] = avg_len
    edge_distance[i] = 150
  '''
  my_edges.append([str(max_id[t]+1), str(max_id[t]+2)])
  my_edges.append([str(max_id[t]+2), str(max_id[t]+3)])
  my_edges.append([str(max_id[t]+3), str(max_id[t]+4)])
  my_edges.append([str(max_id[t]+4), str(max_id[t]+1)])
  '''
  #print(x_coords[str(t)])
  label_to_id = dict()
  for k in id_to_labels:
    v = id_to_labels[k]
    label_to_id[v] = k
  f = open(output_folder + "graph_" + str(t) + ".js", 'w')
  #if t==10:print("my_edges = " + str(my_edges) + '\n')
  f.write("my_edges = " + str(my_edges) + '\n')
  f.write("label_to_id = " + str(label_to_id) + '\n')
  f.write("id_to_label = " + str(id_to_labels) + '\n')
  f.write("edge_distance = " + str(edge_distance) + '\n')
  f.close()
  #coordinates=[{id:0, name:"algorithmic ", x:2593.047296764621, y:-2373.673492975836}
  coordinates = []
  f = open(output_folder + "coordinates_" + str(t) + ".js", 'w')
  for i in range(len(x_coords[str(t)].keys())):
    entry = dict()
    entry["id"] = i
    if str(i) in id_to_labels.keys():
      entry["name"] = id_to_labels[str(i)]
    else:
      entry["name"] = ''
    entry["x"] = x_coords[str(t)][str(i)]
    entry["y"] = y_coords[str(t)][str(i)]
    coordinates.append(entry)
  coordinates = sorted(coordinates, key=lambda x:x["id"])
  f.write("coordinates=" + str(coordinates) + '\n')
  f.close()


