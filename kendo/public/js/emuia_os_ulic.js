define(
    [
        'wE_Class_Ajax',
        'wE_info',
        'emuia_settings'
    ],
    function (Ajax, wE_info, settings) {

        "use strict";

     /* Private */

        //Referencje
        var url = {
            addAxis_url: settings['routes']['addUlcAxis'],
            deleteAxis_url: settings['routes']['deleteUlcAxis']
        };

        var external = {
            info: wE_info
        };

        var onAddAxisSuccess = function (response, jsonResponse) {
            external.info(jsonResponse['message'], 'success');
        };

        var onDeleteAxisSuccess = function (response, jsonResponse) {
            external.info(jsonResponse['message'], 'success');
        };

        /* Ajax */
        var AjaxAddAxis = new Ajax({
                'url': url.addAxis_url,
                'name': "emuia_ulice_add_os",
                'startLog': "Trwa dodawanie osi ulicy ...",
                'allowAbort': false,
                'statusHandlers': {
                    'success': onAddAxisSuccess
                }
            });

        var AjaxDeleteAxis = new Ajax({
                'url': url.deleteAxis_url,
                'name': "emuia_ulice_usun_os",
                'startLog': "Trwa usuwanie osi ulicy ...",
                'allowAbort': false,
                'statusHandlers': {
                    'success': onDeleteAxisSuccess
                }
            });

        /**
         * Dodaje oś ulicy, jeśli dla danej ulicy oś już istnieje nowa geometria zostanie
         * dopisana
         * 
         * @param {int} ulicaId - ulicaId dla której rysowana jest oś
         * @param {string} wkt - wkt linii opisującej oś ulicy
         */
        var addAxis = function (ulicaId, wkt) {
            AjaxAddAxis['send']({
                'ulicaId' : ulicaId,
                'wkt' : wkt
            });
        };

        /**
         * Usuwa oś ulicy, jeśli dla danej ulicy oś już istnieje nowa geometria zostanie
         * dopisana
         * 
         * @param {int} ulicaId - ulicaId dla której rysowana jest oś
         */
        var deleteAxis = function (ulicaId) {
            AjaxDeleteAxis['send']({
                'ulicaId' : ulicaId
            });
        };

        return {
            'addAxis' : addAxis,
            'deleteAxis' : deleteAxis
        };
    }
);