var USER = {name:'user1'};

/**
 * Phần này quan trọng không được xóa
 */
const constName = {
  BASEMAP: 'dulieunen',
  INDEX_HANHCHINHXA: 4,
  INDEX_HANHCHINHHUYEN: 5,
  DONG_HO: 0
}
//  var socket = io();
require([
  "ditagis/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/OpenStreetMapLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Expand",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",
  "esri/widgets/Search",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "ditagis/classes/SystemStatusObject",

  "ditagis/widgets/LayerEditor",
  "ditagis/widgets/Popup",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/sniff",
  "css!ditagis/styling/dtg-map.css"


], function (mapconfigs, Map, MapView, OpenStreetMapLayer, MapImageLayer, FeatureLayer,
  Expand, Locate, LayerList, Search,
  QueryTask, Query,
  SystemStatusObject,
  LayerEditor, Popup,
  on, domConstruct, has
) {
  'use strict';
  try {
    var systemVariable = new SystemStatusObject();
    systemVariable.user = {
      userName:'ditagis'
    }
    var map = new Map({
      // basemap: 'osm'
    });


    var view = new MapView({
      container: "map", // Reference to the scene div created in step 5
      map: map, // Reference to the map object created before the scene
      center: mapconfigs.center,
      zoom: mapconfigs.zoom
    });


    view.systemVariable = systemVariable;
    const initBaseMap = () => {
      let bmCfg = mapconfigs.basemap; //basemap config
      let worldImage = new MapImageLayer({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/',
        title: 'Ảnh vệ tinh',
        id: 'worldimagery',
        visible: false,
        imageFormat:'gif',
        imageTransparency:false,
        sublayers:[
          {id:0,visible:false},
          {id:1,visible:false},
          {id:2,visible:false},
          {id:3,visible:false},
          {id:4,visible:false}
        ]
      });
      let osm = new OpenStreetMapLayer({
        title: 'Open Street Map',
        id: 'osm',
      })
      map.addMany([osm, worldImage])

      function watchVisible(newValue, oldValue, property, target) {
        if (newValue) {
          switch (target) {
            case osm:
              worldImage.visible = !newValue;
              break;
            case worldImage:
              osm.visible = !newValue;
              break;
          }
        }
      }
      osm.watch('visible', watchVisible)
      worldImage.watch('visible', watchVisible)
    }
    const initFeatureLayers = () => {
      /**
       * Lấy attachments của feature layer
       */
      FeatureLayer.prototype.getAttachments = function (id) {
        return new Promise((resolve, reject) => {
          var url = this.url + "/" + this.layerId + "/" + id;
          esriRequest(url + "/attachments?f=json", {
            responseType: 'json',
            method: 'get'
          }).then(result => {
            resolve(result.data || null);
          });
        });
      }
      let ksDHNLayer = new FeatureLayer(mapconfigs.KSDongHoNuocLayer);
      map.add(ksDHNLayer);
      let table = new FeatureLayer(mapconfigs.BangMaDanhBo);
      map.add(table);
      console.log(table);
    }
    const initWidgets = () => {
      view.ui.move(["zoom"], "bottom-right");
      //LAYER LIST
      view.ui.add(new Expand({
        expandIconClass: "esri-icon-layer-list",
        view: view,
        content: new LayerList({
          container: document.createElement("div"),
          view: view
        })
      }), "top-left");


      //LOCATE
      view.ui.add(new Locate({
        view: view
      }), "top-left");
      //neu khong phai la thiet bi di dong

      // Widget Search Features //
      var searchWidget = new Search({
        view: view,
        allPlaceholder: "Nhập nội dung tìm kiếm",
        sources: [{
          featureLayer: map.findLayerById(constName.DONG_HO),
          searchFields: ["NAMEDBDONGHONUOC"],
          displayField: "NAMEDBDONGHONUOC",
          exactMatch: false,
          outFields: ["*"],
          name: "Đồng hồ nước",
          placeholder: "Tìm kiếm mã danh bộ",
        }]
      });
      // Add the search widget to the top left corner of the view
      view.ui.add(searchWidget, {
        position: "top-right"
      });
      /**
       * Layer Editor
       */
      var layerEditor = new LayerEditor(view);
      layerEditor.startup();



      var popup = new Popup(view);
      popup.startup();


    }

    initBaseMap();
    initFeatureLayers();
    initWidgets();


    Loader.hide();
  } catch (error) {
    console.log(error);
  }


});