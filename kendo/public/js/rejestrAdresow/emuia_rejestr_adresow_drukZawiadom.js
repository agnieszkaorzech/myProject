define(
    'emuia_rejestr_adresow_drukZawiadom',
    [
        'jquery',
        'iw_kendo',
        'iw_class_FileGetter',
        'iw_notification',
        'emuia_settings',
        'text!emuia_rejestr_adresow_drukZawiadom_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 FileGetter,
                 iwNotification,
                 settings,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                data: iwKendo.kendo.observable({
                    adresId: null,
                    spraweProwadzi: null
                }),
                update: function (adresId) {
                    this.data.set('adresId', adresId);
                },
                onClearAndHide: function () {
                    this.data.set('spraweProwadzi', null);
                    this.data.set('adresId', null);
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                },
                onDownload: function () {
                    this.downloadZaswiadczenie();
                    this.onClearAndHide();
                },
                downloadZaswiadczenie: function () {
                    var ReportFileGetter = new FileGetter({
                        'url': settings.routes.emuia_zaswiadczenie_download
                    });
                    ReportFileGetter.send({
                        'adres_id': this.data.adresId,
                        'sprawe_prowadzi': this.data.spraweProwadzi
                    });
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });

