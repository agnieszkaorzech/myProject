define(
    'emuia_rejestr_miejscowosci_przestrzenGML',
    [
        'jquery',
        'iw_kendo',
        'perun_ajax',
        'perun_api',
        'iw_notification',
        'text!emuia_rejestr_miejscowosci_przestrzenGML_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 perunAjax,
                 perunApi,
                 iwNotification,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                IdOwner: null,
                data: iwKendo.kendo.observable({
                    Id: null,
                    EmuiaGmlNamespace: null
                }),
                update: function () {
                    var that = this;
                    perunAjax.ajax({
                        url: perunApi.getResourceAddress("emuia_przestrzen_gmlGet"),
                        method: "GET"
                    }).then(function (data) {
                        that.set("data", data);
                    });
                },
                onZamknijOkno: function () {
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                },
                onZapisz: function () {
                    this.zmianaPrzesprzeniGml(this.data.Id);
                    this.onZamknijOkno();
                },
                zmianaPrzesprzeniGml: function (id) {
                    var that = this;
                    var dane = {
                        'EmuiaGmlNamespace': that.data.EmuiaGmlNamespace
                    };
                    perunAjax.ajax({
                        url: perunApi.getResourceAddress("emuia_przestrzen_gmlPut", id),
                        method: "PUT",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                            iwNotification.warn("Przestrzeń nazw GML została zmieniona");
                    });
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
