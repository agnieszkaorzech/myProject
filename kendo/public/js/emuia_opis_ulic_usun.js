/**
 * 'emuia_opis_ulic_usun'
 *
 */
define(
    [
        'jquery',
        'iEwid',
        'wE_utils',
        'wE_Class_Ajax',
        'wE_Class_JqDialog',
        'wE_info',
        'wE_alert',
        'emuia_settings'
    ],
    function ($,
              iEwid,
              utils,
              Ajax,
              JqDialog,
              wE_info,
              wE_alert,
              emuiaSettings) {

        "use strict";

        var url = {
            getUlcDescriptions_url: emuiaSettings.routes.getUlcDescriptions,
            deleteUlcDescription_url: emuiaSettings.routes.deleteUlcDescription
        };

        var external = {
            isNotEmptyObj: utils.isNotEmptyObj,
            isNotEmptyStr: utils.isNotEmptyStr,
            isNotEmptyArr: utils.isNotEmptyArr,
            info: wE_info,
            JqDialog: JqDialog,
            alert: wE_alert,
            iEwidShowOnMap: iEwid.Functions.showOnMap
        };
        var brakOpisuTxt = "Brak opisów";

        //div pod okienko dialog    
        var main_div = $("<div id='emuiaOpisUlicUsunDialog'>");

        /**
         * Dodaje pojedyńczy opis ulicy do okienka.
         * 
         * @param {Object} singleElementObj - obiekt z parametrami elementu.
         * np. 
         *    {
         *      'mslink' : 1,
         *      'wspx' : 1234567.00,
         *      'wspy' : 1234567.00,
         *      'nazwa' : 1 Maja 
         *    }
         * 
         * @returns {boolean} - czy prawidłowo dodano...
         */
        var addSingleElement = function (singleElementObj) {
            if (external.isNotEmptyObj(singleElementObj) && singleElementObj.hasOwnProperty('nazwa') && singleElementObj.hasOwnProperty('mslink')) {
                main_div.append('<p data-mslink=' + singleElementObj.mslink + ' data-wspx=' + singleElementObj.wsp_x + ' data-wspy=' + singleElementObj.wsp_y + '>' + singleElementObj.nazwa + '</p>');
                return true;
            }
            return false;
        };

        /**
         * Dodaje do okienka kilka opisów ulic.
         * 
         * @param {Array} elementsArr - tablica z obiektami opisującymi pojedyncze elementy
         * 
         * @returns {boolean} - czy prawidłowo dodano...
         */
        var addElements = function (elementsArr) {
            var key;
            if (external.isNotEmptyArr(elementsArr)) {
                for (key in elementsArr) {
                    addSingleElement(elementsArr[key]);
                }
                return true;
            }
            return false;
        };

        /**
         * Sprawdza czy okienko posiada jakikolwiek opis ulicy.
         * 
         * @returns {boolean} - jeśli true to w okienku jest chociaż jeden rekord opisujący
         * pojedynczy opis ulicy
         */
        var hasAnyDescription = function () {
            var element = main_div['find']('p');
            if (element.length > 0) {
                return true;
            }
            return false;
        };

        /**
         * Usuwa pojedynczy opis ulicy z okienka bazując na mslink.
         * 
         * @param {string} mslink - mslink opisu ulicy do usunięcia
         * 
         * @returns {boolean} - informuje czy udało usunąć element
         */
        var deleteElement = function (mslink) {
            var elementToDelete = main_div.find('p[data-mslink=' + mslink + ']');
            var mslinkToDel = elementToDelete.attr('data-mslink');

            if (external.isNotEmptyStr(mslinkToDel)) {
                elementToDelete.remove();
                return true;
            }
            return false;
        };

        /**
         * Ustawia w okienku napis "Brak opisu".
         * 
         * @returns {boolean} - informuje czy opis został ustawiony
         */
        var setBrakOpisu = function () {
            var brakOpisuObj = main_div.find('#emuia_usunOpis_brakOpisu');
            if (brakOpisuObj.length === 0) {
                main_div.append('<div id="emuia_usunOpis_brakOpisu">' + brakOpisuTxt + '</div>');
                return true;
            }
            return false;
        };

        /**
         * Usuwa w okienku napis "Brak opisu".
         * 
         * @returns {boolean} - informuje czy udało usunąć opis
         */
        var removeBrakOpisu = function () {
            var brakOpisuObj = main_div.find('#brak_opisu');
            if (brakOpisuObj.length > 0) {
                brakOpisuObj.remove();
                return true;
            }
            return false;
        };

        /**
         * Usuwa kilka opisów ulic z okienka
         * 
         * @param {Array} mslinkArr - tablica z mslinkami do usunięcia
         * 
         * @returns {boolean} - informuje czy udało usunąć opisy ulic
         */
        var deleteFewElements = function (mslinkArr) {
            var index = 0;
            for (index; index < mslinkArr.length; index++) {
                if (!deleteElement(mslinkArr[index])) {
                    return false;
                }
            }
            if (!hasAnyDescription()) {
                setBrakOpisu();
            }
            return true;
        };

        /**
         * Usuwa wszystkie opisy ulic z okienka.
         */
        var deleteAll = function () {
            main_div.empty();
        };

        /**
         * Sprawdza wskazany element jest podświetlony (aktywny)
         * 
         * @param {Object} jQueryObj - obiekt wyselekcjonawamy przez jQuery
         * 
         * @returns {boolean} - informuje czy rekord jest aktywny
         */
        var isActive = function (jQueryObj) {
            if (jQueryObj.hasClass('on')) {
                return true;
            }
            return false;
        };

        /**
         * Zwraca aktywne opisy ulic z okienka.
         * 
         * @returns {boolean} - informuje czy rekord jest aktywny
         */
        var getActiveObjects = function () {
            var activeRecords = main_div.find('p.on');

            return activeRecords;
        };

        /**
         * Zwraca mslinki opisów ulic które są aktywne (wybrane w okienku).
         * 
         * @returns {Array} arr - tablica z mslinkami
         */
        var getActiveMslinks = function () {
            var arr = [];
            var index = 0;
            var activeRecords = getActiveObjects();
            var singleRecord;
            activeRecords.each(function () {
                singleRecord = $(this);
                arr.push(singleRecord.attr('data-mslink'));
            });

            return arr;
        };

        /**
         * Zwraca WKT punktu na podstawie współrzędnych X i Y
         * 
         * @param {string} x - współrzedna x
         * @param {string} y - współrzedna y
         * 
         * @returns {string} - WKT punktu
         */
        var xyToPointWkt = function (x, y) {
            var result = "POINT(" + String(x).replace(',', ".") + " " + String(y).replace(',', ".") + ")";
            return result;
        };

        /**
         * Zwraca tablicę z obiektami dla wybranych z okienka opisów ulic
         * 
         * @returns {Array} - tablica obiektów geometrycznych postaci:
         *      [{
         *          geom: POINT(xxx,xxx)
         *      }]
         *
         */
        var getActiveGeom = function () {
            var arr = [];
            var index = 0;
            var activeRecords = getActiveObjects();
            var singleRecord;
            for (index; index < activeRecords.length; index++) {
                singleRecord = $(activeRecords[index]);
                arr.push(
                    {
                        'geom': xyToPointWkt(singleRecord.attr('data-wspx'), singleRecord.attr('data-wspy'))
                    }
                );
            }

            return arr;
        };

        var onLoadDataSuccess = function (response, jsonResponse) {
            if (external.isNotEmptyArr(jsonResponse.response)) {
                addElements(jsonResponse.response);
            } else {
                setBrakOpisu();
            }
        };

        var selMslinks;
        var onDeleteDescriptionSuccess = function (response, jsonResponse) {
            selMslinks = getActiveMslinks();
            if (external.isNotEmptyArr(selMslinks)) {
                deleteFewElements(selMslinks);
            } else {
                external.alert(('Nie wybrano opisów ulic do usunięcia')['fontcolor']('red'));
            }
            external.info(jsonResponse.message, 'success');
        };

        /* Ajax */
        var ajaxLoadData = new Ajax({
                'url': url.getUlcDescriptions_url,
                'name': "emuia_ulice_load_data",
                'startLog': "Trwa pobieranie danych ...",
                'allowAbort': true,
                'statusHandlers': {
                    'success': onLoadDataSuccess
                }
            });

        var ajaxDeleteDescription = new Ajax({
                'url': url.deleteUlcDescription_url,
                'name': "emuia_ulice_delete_description",
                'startLog': "Trwa usuwanie opisu ulicy ...",
                'allowAbort': false,
                'statusHandlers': {
                    'success': onDeleteDescriptionSuccess
                }
            });

        /**
         * Pobiera dane o opisach uliy dla zadanego ulicaId i wstawia je do okienka
         * 
         * @param {string} ulicaId - id ulic z tabeli SLO_ULICE
         */
        var loadDataForUlcId = function (ulicaId) {
            ajaxLoadData.send({
                'ulicaId' : ulicaId
            });
        };

        /**
         * Usuwa opis ulicy z okienka i wysyła zapytanie Ajax do funkcji usuwającej
         * opisy ulic z Oracle i Postgres
         * 
         * @param {string} x - współrzedna x
         */
        var deleteDescription = function (mslinkArr) {
            ajaxDeleteDescription.send({
                'mslink': mslinkArr
            });
        };

      /* Map */
        /**
         * Zoom na mapie do wybranej geometrii
         */
        var zoomToGeom = function (geom) {
            var geomObj;
            if (external.isNotEmptyObj(geom)) {
                geomObj = [geom];
            } else {
                geomObj = geom;
            }
            external.iEwidShowOnMap(geomObj, {
                'renderText': false,
                'callerName': 'map.zoomToGeom',
                'deletePrevious': true
            });
        };

      /* events */
        main_div.on('click', 'p', function () {
            var self = $(this);
            var wkt = xyToPointWkt(self.attr('data-wspx'), self.attr('data-wspy'));
            if (self.hasClass('on')) {
                self.removeClass('on');
            } else {
                self.addClass('on');
                zoomToGeom({'geom': wkt});
            }
        });
      /* Init */

        /* inicjalizacja głównego okna dialogowego */
        var close, open, mslinksToDel, geom;
        var dialog = new external.JqDialog(
            $('<div>').html(main_div), {
                'resizable': false,
                'maxHeight': 300,
                'width': 220,
                'autoOpen': false,
                'title': 'Opisy ulic',
                'buttons' : {
                    "ZBLIŻ" : function () {
                        geom = getActiveGeom();
                        zoomToGeom(geom);
                    },
                    "USUŃ" : function () {
                        mslinksToDel = getActiveMslinks();
                        if (external.isNotEmptyArr(mslinksToDel)) {
                            deleteDescription(mslinksToDel);
                        } else {
                            external.alert(('Nie wybrano opisów ulic do usunięcia')['fontcolor']('red'));
                        }
                    },
                    "ANULUJ" : function () {
                        close();
                    }
                }
            }
        );

      /* Public */
        /* otwiera okienko z opisami ulic */
        open = function () {
            deleteAll();
            dialog.open();
        };
        /* zamyka okienko */
        close = function () {
            dialog.close();
        };

        return {
            'open' : open,
            'close' : close,
            'loadData' : loadDataForUlcId
        };
    }
);
