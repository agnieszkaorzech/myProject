define(
    'emuia_rejestr_adresow_szczegoly',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_adresow_szczegoly_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                title: "Szczegóły adresu",
                data: iwKendo.kendo.observable({
                    emuia: null,
                    kodPoczt: null,
                    numer: null,
                    status: null,
                    ulicaId: null,
                    ulicaNazwa: null,
                    uwagi: null,
                    adresId: null
                }),
                updateDetails:function (data) {
                    this.set("data",data);
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
