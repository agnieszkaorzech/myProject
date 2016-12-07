define(
    'emuia_rejestr_ulic_szczegoly',
    [
        'jquery',
        'iw_kendo',
        'emuia_settings',
        'perun_ajax',
        'perun_api',
        'iw_utils',
        'emuia_tools',
        'text!emuia_rejestr_ulic_szczegoly_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 settings,
                 perunAjax,
                 perunApi,
                 utils,
                 tools,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                isLoaded: true,
                obreb: null,
                data: null,
                title: "Szczegóły ulicy",
                update: function (id) {
                    var that = this;
                    perunAjax.ajax({
                        url: perunApi.getResourceAddress("emuia_ulice_szczegoly", id),
                        method: "GET"
                    }).then(function (data) {

                        var dzialki = [];
                        $.each(data.Dzialki, function (key, value) {
                            $.each(value.NrDzialek, function (key2, value2) {
                                dzialki.push(value2.Nr);
                            });
                        });
                        var dokumenty = [];
                        $.each(data.Dokumenty, function (key, value) {
                            dokumenty.push(value.Sygnatura);
                        });
                        data.Dzialki = dzialki.join();
                        data.Dokumenty = dokumenty.join();
                        if (data.Nazwa === "???") {
                            data.response.Nazwa = "BEZ ULICY";
                            data.response.NazwaSkr = "BEZ ULICY";
                        }
                        if (data.Status === "I") {
                            data.Status = "Istniejący";
                        }
                        if (data.Status === "P") {
                            data.Status = "Projektowany";
                        }
                        data.WaznyOd = tools.changeFormatDate(data.WaznyOd);
                        data.WaznyDo = tools.changeFormatDate(data.WaznyDo);
                        data.DataD = tools.changeFormatDate(data.DataD);
                        data.DataM = tools.changeFormatDate(data.DataM);
                        data.DataK = tools.changeFormatDate(data.DataK);
                        that.set("data", data);
                    });
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
