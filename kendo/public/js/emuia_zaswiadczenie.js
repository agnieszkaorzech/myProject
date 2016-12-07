/**
 * 'emuia_zaswiadczenie'
 *
 * Obsługa zaświadczeń o nadaniu numeru adresowego
 *
 * @author Jakub Łęgowik
 */
define(
    [
        'jquery',
        'wE_loadingInfo',
        'wE_info',
        'wE_console',
        'wE_utils',
        'wE_download',
        'emuia_settings'
    ],
    function (
        $,
        loadingInfo,
        wE_info,
        wE_console,
        utils,
        wE_download,
        settings
    ) {

        "use strict";
        /*jslint sub:true*/

    /* Referencje do funkcji zewnętrznych. */

        var external = {
            log : wE_console['log'],
            info: wE_info,
            loadingInfoDone: loadingInfo['done'],
            isNotEmptyStr: utils['isNotEmptyStr'],
            emptyFunction: utils['emptyFunction'],
            download: wE_download['download']
        };

        var url = {
            download_url: settings['routes']['emuia_zaswiadczenie_download']
        };

    /* Init & private */

        var send = function (adresId, fileName, fileFormat, spraweProwadzi) {
            external.download({
                'url': url.download_url,
                'data': collectParameters(adresId, fileName, fileFormat, spraweProwadzi)
            });
        };

        var collectParameters = function (adresId, fileName, fileFormat, spraweProwadzi) {
            var parameters = {};

            if (external.isNotEmptyStr(adresId) && 
                    external.isNotEmptyStr(fileName) && 
                    external.isNotEmptyStr(fileFormat)) {

                parameters['adres_id'] = adresId;
                parameters['file_name'] = fileName;
                parameters['file_format'] = fileFormat;
                parameters['sprawe_prowadzi'] = spraweProwadzi;

                return parameters;
            } else {
                external.log("Nieprawidłowe parametry dla pobrania zaświadczenia.", "red");
                external.info("Nieprawidłowe parametry dla pobrania zaświadczenia.", 'error');
            }

        };

    /* Public */

        /**
         * Pobiera zaświadczenie
         * 
         * @param {integer}  adresId
         * @param {string}   fielName
         * @param {string}   fileFormat
         * @param {string}   spraweProwadzi
         *
         * @returns {object}
         */
        var download = function (adresId, fileName, fileFormat, spraweProwadzi) {
            send(adresId, fileName, fileFormat, spraweProwadzi);
        };

        external.loadingInfoDone("emuia_zaswiadczenie");
        external.log("Załadowano: emuia_zaswiadczenie");

    /* Upublicznianie */

        return {
            'download': download
        };

    }
);