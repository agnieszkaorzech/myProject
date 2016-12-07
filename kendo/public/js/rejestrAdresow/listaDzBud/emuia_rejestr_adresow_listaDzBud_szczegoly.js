define(
    'emuia_rejestr_adresow_listaDzBud_szczegoly',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_adresow_listaDzBud_szczegoly_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                title: "Szczegóły punktu adresowego",
                dataLista: iwKendo.kendo.observable({
                    nrDlk: null,
                    nieruchId: null,
                    wsp_x: null,
                    wsp_y: null,
                    utworzyl: null,
                    zmodyfikowal: null,
                    data_utworz: null,
                    data_modyf: null,
                    rodzaj: null,
                    elReprezent: null,
                }),
                dataAdres: iwKendo.kendo.observable({
                    miejsc: null,
                    ulica: null,
                    numer: null,
                    status: null,
                    emuia: null
                }),
                updateDetails: function (dataLista, dataAdres) {
                    if (dataLista.nrDlk === null) {
                        dataLista.nrDlk = "-";
                    } else {
                        dataLista.rodzaj = "Punkt adresowy działki";
                    }
                    if (dataLista.nieruchId === null) {
                        dataLista.nieruchId = "-";
                    } else {
                        dataLista.rodzaj = "Punkt adresowy budynku";
                    }
                    this.set("dataLista", dataLista);
                    this.set("dataAdres", dataAdres);
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
