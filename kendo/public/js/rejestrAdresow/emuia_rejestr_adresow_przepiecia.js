define(
    'emuia_rejestr_adresow_przepiecia',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_adresow_przepiecia_html',
        'perun_ajax',
        'iw_notification',
        'iw_alert',
        'emuia_settings',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template,
                 perunAjax,
                 iwNotification,
                 iwAlert,
                 settings) {

        "use strict";

        var external = {
            przepnijAdres: settings.routes.emuia_joinadres_joinadres
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                sloUliceDoPrzepiecia: [],
                result: false,
                value: iwKendo.kendo.observable({
                    ulicaNazwa: null,
                    adresOdchId: null,
                    adresZastepId: null,
                    miejscowoscNazwa: null
                }),
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                updatePrzepiecia: function (chooseAdres, data) {
                    var that = this;
                    iwAlert.createAndShow({
                        parent: that,
                        modal: "global",
                        html: 'UWAGA! Modyfikacja adresu spowoduje zmianę adresu dla każdego podmiotu i przedmiotu, który go używa',
                        title: 'Informacja'
                    });
                    this.set('sloAdresyDoPrzepiecia', data);
                    this.value.set('ulicaNazwa', chooseAdres.ulica);
                    this.value.set('miejscowoscNazwa', chooseAdres.miejsc);
                    this.value.set('adresOdchId', chooseAdres.id);
                },
                onSave: function () {
                    var dane = {
                        'adresOdchId': this.value.adresOdchId,
                        'adresZastepId': this.value.adresZastepId,
                        'przepArch': true
                    };
                    if (this.value.adresOdchId === this.value.adresZastepId) {
                        iwNotification.warn("Wartość odchodząca nie może być równa wartości zastępującej");

                        return;
                    }
                    if (this.value.adresOdchId === null || this.value.adresZastepId === null) {
                        iwNotification.warn("Wartość odchodząca oraz wartość zastępująca muszą być zadeklarowane");

                        return;
                    }
                    perunAjax.ajax({
                        url: external.przepnijAdres,
                        method: "POST",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        iwNotification.warn("Numer porządkowy został przepięty pomyślnie, wartość odchodząca została zastąpiona wartością zastępującą");
                        if (typeof(viewModel.result) === 'function') {
                            viewModel.result(data.success);
                        }
                    });
                    this.onClearAndHide();
                },
                onClearAndHide: function () {
                    this.value.set('ulicaNazwa', null);
                    this.value.set('adresOdchId', null);
                    this.value.set('adresZastepId', null);
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                }

            });

            return viewModel;
        };

        return {
            create: create
        };
    });

