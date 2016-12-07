define(
    'emuia_rejestr_adresow_edytuj',
    [
        'jquery',
        'iw_kendo',
        'emuia_settings',
        'perun_ajax',
        'iw_notification',
        'text!emuia_rejestr_adresow_edytuj_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 settings,
                 perunAjax,
                 iwNotification,
                 template) {

        "use strict";

        var external = {
            edytujAdres: settings.routes.emuia_nrPorzAddAndEdit_edit
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                title: "Edytuj numer porządkowy",
                isChecked: false,
                result: false,
                value: iwKendo.kendo.observable({
                    emuia: null,
                    kodPoczt: null,
                    numer: null,
                    status: null,
                    ulicaId: null,
                    ulicaNazwa: null,
                    uwagi: null,
                    adresId: null
                }),
                adresStatus: [
                    {Symbol: 'I', Nazwa: 'istniejący'},
                    {Symbol: 'P', Nazwa: 'projektowany'}
                ],
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                update: function (data, ulicaId) {
                    this.value.set("emuia", data.emuia);
                    this.value.set("kodPoczt", data.kodPoczt);
                    this.value.set("numer", data.numer);
                    this.value.set("ulicaNazwa", data.ulica);
                    this.value.set("uwagi", data.uwagi);
                    this.value.set("adresId", data.id);
                    this.value.set("ulicaId", ulicaId);
                    if (!!this.value.emuia) {
                        this.set("isChecked", true);
                    }
                    if (data.status === "Istniejący") {
                        this.value.set("status", "I");

                        return;
                    }
                    this.value.set("status", "P");
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
                            "adresId": this.value.adresId
                        };
                        perunAjax.ajax({
                            url: external.edytujAdres,
                            method: "POST",
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
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
