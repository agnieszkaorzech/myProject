define(
    'emuia_rejestr_adresow_dodaj',
    [
        'jquery',
        'iw_kendo',
        'emuia_settings',
        'perun_ajax',
        'iw_notification',
        'text!emuia_rejestr_adresow_dodaj_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 settings,
                 perunAjax,
                 iwNotification,
                 template) {

        "use strict";

        var external = {
            dodajAdres: settings.routes.emuia_nrPorzAddAndEdit_add
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                title: "Dodaj numer porządkowy",
                isChecked: false,
                result: false,
                value: iwKendo.kendo.observable({
                    emuia: null,
                    kodPoczt: null,
                    numer: null,
                    status: null,
                    ulicaId: null,
                    ulicaNazwa: null,
                    uwagi: null
                }),
                adresStatus: [
                    {Symbol: 'I', Nazwa: 'istniejący'},
                    {Symbol: 'P', Nazwa: 'projektowany'}
                ],
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this,options);
                    this.result = options.result;
                },
                updateAdres: function (id, nazwa) {
                    this.value.set("ulicaNazwa", nazwa);
                    this.value.set("ulicaId", id);
                    this.value.set("status", "I");
                },
                update: function (id, nazwa) {
                    this.value.set("ulicaId", id);
                    this.value.set("ulicaNazwa", nazwa);
                    this.value.set("status", "I");
                },
                onSave: function () {
                    if (this.isChecked) {
                        this.value.set("emuia", "on");
                    }
                    if (!!this.value.numer) {
                        var dane = {
                            "emuia": this.value.emuia,
                            "kodPoczt": this.value.kodPoczt,
                            "numer": this.value.numer,
                            "status": this.value.status,
                            "ulicaId": this.value.ulicaId,
                            "uwagi": this.value.uwagi,
                            "adresId": 0
                        };
                        perunAjax.ajax({
                            url: external.dodajAdres,
                            method: "PUT",
                            data: JSON.stringify(dane)
                        }).then(function (data) {
                            iwNotification.info(data.message);
                            if (typeof(viewModel.result) === 'function') {
                                viewModel.result(true);
                            }
                        });
                        this.onClearAndHide();

                        return;
                    }
                    iwNotification.warn("Proszę uzupełnić pole 'Numer'");
                },
                onClearAndHide: function () {
                    this.value.set("emuia", null);
                    this.value.set("kodPoczt", null);
                    this.value.set("numer", null);
                    this.value.set("status", null);
                    this.value.set("ulicaNazwa", null);
                    this.value.set("uwagi", null);
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
