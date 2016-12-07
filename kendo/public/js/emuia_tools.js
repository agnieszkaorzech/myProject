define(
    'emuia_tools',
    [
        'jquery',
        'iw_kendo',
        'iw_utils',
        'ol3'
    ],
    function ($,
              iwKendo,
              utils,
              ol) {

        "use strict";

        //zmiania format daty na rrrr-mm-dd
        var changeFormatDate = function (date) {
            var result;
            if (!!date) {
                var countDigit = function (digit) {
                    return (digit > 9 ? digit.toString() : "0" + digit);
                };
                if (date !== null) {
                    var dates = new Date(date);
                    var year = dates.getFullYear();
                    var month = dates.getMonth() + 1;
                    var day = dates.getDate();
                    result = year + '-' + countDigit(month) + '-' + countDigit(day);
                }
            }

            return result;
        };
        //porownuje Id dwóch arrays of objects i zwraca różnice,
        var compareId = function (datasource, pushItem) {
            var result = [];
            result = pushItem.filter(function (current) {
                return datasource.filter(function (current_datasource) {
                        return current_datasource.Id === current.Id;
                    }).length === 0;
            });

            return result;
        };

        var addRowToGridDataSource = function (data, nazwaViewModelu) {
            var grid = nazwaViewModelu.$root.find("[data-role='grid']").data("kendoGrid");
            for (var i = 0; i < data.length; i++) {
                grid.dataSource.insert(data[i]);
            }
        };
        var parseArea = function (str) {
            return utils.formatNumber(parseFloat(str), 4).replace(/,/g, '.');
        };
        var parseLength = function (str) {
            return utils.formatNumber(parseFloat(str), 2).replace(/,/g, '.');
        };
        var parseCoord = function (str) {
            return utils.formatNumber(parseFloat(str), 3);
        };
        var geoJSONParser = new ol.format.GeoJSON();
        var wktParser = new ol.format.WKT();

        var parserGeoJSON = function (geom) {
            var wkt = wktParser.readGeometry(geom.geom);
            var geojson = geoJSONParser.writeGeometry(wkt);
            return JSON.parse(geojson);
        };

        return {
            'changeFormatDate': changeFormatDate,
            'compareId': compareId,
            'addRowToGridDataSource': addRowToGridDataSource,
            'parseArea': parseArea,
            'parseLength': parseLength,
            'parseCoord': parseCoord,
            'parserGeoJSON':parserGeoJSON

        };
    });
