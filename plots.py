import plotly.graph_objects as go
import json

def plot_hists(hist1,hist2,title,chi_square,label1,label2):
  file_name1 =hist1
  file_name2 = hist2

  with open(file_name1, 'r') as file:
      data_dict1 = json.load(file)


  with open(file_name2, 'r') as file:
      data_dict2 = json.load(file)

  counts = data_dict1['counts']
  bins = np.array(data_dict1['bins'])
  bin_centers = 0.5*(bins[:-1] + bins[1:])

  counts2 = data_dict2['counts']
  bins2 = np.array(data_dict2['bins'])
  bin_centers2 = 0.5*(bins2[:-1] + bins2[1:])

  fig = go.Figure()

  fig.add_trace(go.Bar(x=bin_centers,y=counts,opacity=0.5, name= label1))
  fig.add_trace(go.Bar(x=bin_centers2,y=counts2,opacity=0.6, name = label2))

  fig.update_layout(
      title_text=title + ". Chi Square: " + str(data_dict1[chi_square]),  # Set the main title
      xaxis_title="Pixel Value",  # Set the x-axis title
      yaxis_title="Normalized Count"   # Set the y-axis title
  )

  fig.show()

plot_hists('Spruce_Lidhem_HD_Hist.json', 'Larch_HD_Hist.json','Spruce Lidhem HD vs Larch HD','chi_square__with_larchHD', 'Spruce HD', 'Larch HD')
plot_hists('Spruce_Lidhem_HD_Hist.json', 'Larch_LD_Hist.json','Spruce Lidhem HD vs Larch LD','chi_square_with_larchLD', 'Spruce HD', 'Larch LD')
plot_hists('Spruce_Lidhem_HD_Hist.json', 'Larch_H_Hist.json','Spruce Lidhem HD vs Larch Healthy','chi_square_with_larchHealthy', 'Spruce HD', 'Larch Healthy')

plot_hists('Spruce_Vikem_HD_Hist.json', 'Larch_HD_Hist.json','Spruce Viken HD vs Larch HD','chi_square_with_larchHD', 'Spruce HD', 'Larch HD')
plot_hists('Spruce_Vikem_HD_Hist.json', 'Larch_LD_Hist.json','Spruce Viken HD vs Larch LD','chi_square_with_larchLD', 'Spruce HD', 'Larch LD')
plot_hists('Spruce_Vikem_HD_Hist.json', 'Larch_H_Hist.json','Spruce Viken HD vs Larch Healthy','chi_square_with_larchHealthy', 'Spruce HD', 'Larch Healthy')

plot_hists('Spruce_Backsjon_HD_Hist.json', 'Larch_HD_Hist.json','Spruce Backsjon HD vs Larch HD','chi_square__with_larchHD', 'Spruce HD', 'Larch HD')
plot_hists('Spruce_Backsjon_HD_Hist.json', 'Larch_LD_Hist.json','Spruce Backsjon HD vs Larch LD','chi_square_with_larchLD', 'Spruce HD', 'Larch LD')
plot_hists('Spruce_Backsjon_HD_Hist.json', 'Larch_H_Hist.json','Spruce Backsjon HD vs Larch Healthy','chi_square_with_larchHealthy', 'Spruce HD', 'Larch Healthy')
