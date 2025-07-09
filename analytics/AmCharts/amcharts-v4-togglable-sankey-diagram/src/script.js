/**
 * --------------------------------------------------------
 * This demo was created using amCharts V4 preview release.
 * 
 * V4 is the latest installement in amCharts data viz
 * library family, to be released in the first half of
 * 2018.
 *
 * For more information and documentation visit:
 * https://www.amcharts.com/docs/v4/
 * --------------------------------------------------------
 */

am4core.useTheme(am4themes_animated);

/**
 * The data
 */
var data = [
  { from: "Smartphones", to: "Others", value: 569, value2: 39, value3: 82 },
  { from: "Smartphones", to: "Samsung", value: 317 ,value2: 22, value3: 93 },
  { from: "Smartphones", to: "Apple", value: 216, value2: 15, value3: 77 },
  { from: "Smartphones", to: "Huawei", value: 153, value2: 10, value3: 92 },
  { from: "Smartphones", to: "OPPO", value: 112, value2: 8, value3: 100 },
  { from: "Smartphones", to: "Xiaomi", value: 92, value2: 6, value3: 100 },

  { from: "PC", to: "Others", value: 58, value2: 22, value3: 8  },
  { from: "PC", to: "Apple", value: 19, value2: 7, value3: 7 },
  { from: "PC", to: "Lenovo", value: 55, value2: 21, value3: 85 },
  { from: "PC", to: "HP Inc",  value: 55, value2: 21, value3: 100 },
  { from: "PC", to: "Dell", value: 40, value2: 15, value3: 100 },
  { from: "PC", to: "Asus", value: 18, value2: 7, value3: 100 },
  { from: "PC", to: "Acer", value: 17, value2: 6, value3: 100 },

  { from: "Tablets", to: "Others", value: 71 },
  { from: "Tablets", to: "Samsung", value: 24 },
  { from: "Tablets", to: "Apple", value: 44 },
  { from: "Tablets", to: "Huawei", value: 13 },
  { from: "Tablets", to: "Lenovo", value: 10 },
  { from: "Tablets", to: "Amazon", value: 12 }
];

/**
 * Sankey version of the chart
 */

// Create chart instance
var chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
chart.data = data;
chart.dataFields.fromName = "from";
chart.dataFields.toName = "to";
chart.dataFields.value = "value";
chart.padding(0, 100, 10, 0);

// Add title
chart.titles.template.fontSize = 20;
chart.titles.create().text = "Shipment of devices by vendor, 2017";

// Configure links
chart.links.template.colorMode = "gradient";
chart.links.template.tooltipText = "{fromName} → {toName}: [bold]{value}[/] Mio units\n{fromName} contribute [bold]{value3} %[/] in {toName} sales: \n{toName} contributes [bold]{value2} %[/] in {fromName} sales";
var hoverState = chart.links.template.states.create("hover");
hoverState.properties.fillOpacity = 1;

// Exporting
chart.exporting.menu = new am4core.ExportMenu();

// Configure nodes
chart.nodes.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
chart.nodes.template.readerTitle = "Click to show/hide or drag to rearrange";
chart.nodes.template.showSystemTooltip = true;

chart.nodes.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;