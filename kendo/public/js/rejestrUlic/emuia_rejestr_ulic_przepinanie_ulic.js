define(
    'emuia_rejestr_ulic_przepinanie_ulic',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_ulic_przepinanie_ulic_html',
        'perun_ajax',
        'iw_notification',
        'emuia_settings',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template,
                 perunAjax,
                 iwNotification,
                 settings) {

        "use strict";

        var external = {
            przepnijUlice: settings.routes.emuia_ulicaMerge_merge
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                sloUliceDoPrzepiecia: [],
                includeArchive: true,
                result: false,
                value: iwKendo.kendo.observable({
                    miejscowoscNazwa: null,
                    ulOdchodzId: null,
                    ulZastepId: null
                }),
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                update: function (data, nazwaMiejscowosci) {
                    this.set('sloUliceDoPrzepiecia', data);
                    this.value.set('miejscowoscNazwa', nazwaMiejscowosci);
                },
                windowClose: function () {
                    this.value.set('ulOdchodzId', null);
                    this.value.set('ulZastepId', null);
                },
                onSave: function () {
                    var dane = {
                        'includeArchive': this.includeArchive,
                        'ulOdchodzId': this.value.ulOdchodzId,
                        'ulZastepId': this.value.ulZastepId
                    };
                    if (this.value.ulOdchodzId === this.value.ulZastepId) {
                        iwNotification.warn("Wartość odchodząca nie może być równa wartości zastępującej");

                        return;
                    }
                    if (this.value.ulOdchodzId === null || this.value.ulZastepId === null) {
                        iwNotification.warn("Wartość odchodząca oraz wartość zastępująca muszą być zadeklarowane");
                        return;
                    }
                    perunAjax.ajax({
                        url: external.przepnijUlice,
                        method: "POST",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        iwNotification.warn("Ulica została przepięta pomyślnie, wartość odchodząca została zastąpiona wartością zastępującą");
                        if (typeof(viewModel.result) === 'function') {
                            viewModel.result(data.success);
                        }
                    });
                    this.onClearAndHide();
                },
                onClearAndHide: function () {
                    this.value.set('miejscowoscNazwa', null);
                    this.value.set('ulOdchodzId', null);
                    this.value.set('ulZastepId', null);
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                }

            });

            return viewModel;
        };

        return {
            create: create
        };
    });
