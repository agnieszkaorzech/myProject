define(
    'emuia_rejestr_miejscowosci_dodaj',
    [
        'jquery',
        'iw_kendo',
        'iw_alert',
        'perun_ajax',
        'perun_dicts',
        'emuia_settings',
        'iw_notification',
        'text!emuia_rejestr_miejscowosci_dodaj_html',
        'emuia_tools',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 iwAlert,
                 perunAjax,
                 perunDict,
                 settings,
                 iwNotification,
                 template,
                 tools) {

        "use strict";

        var external = {
            dodajMiejscowosc: settings.routes.emuia_miejscAddAndEdit_add
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                obrebySelected: null,
                sloGminyHandler: null,
                isVisibleMultiselect: true,
                isEnabled: true,
                isEnableXYDok: false,
                slownikObreby: [],
                slownikGminy: [],
                slownikKraj: [],
                slownikRodzaj: [],
                value: iwKendo.kendo.observable({
                    nazwa: null,
                    idteryt_sym: null,
                    gmina: null,
                    kraj_id: null,
                    rodz_msc_id: null,
                    jezyk_mniejszosci: null,
                    nazwa_mniejszosci: null,
                    nazwa_teryt: null,
                    pow: null,
                    wazny_od: null,
                    wazny_do: null,
                    miejscId: null,
                    obreb_id: null
                }),
                windowClose: function () {
                    this.onClearAndHide();
                },
                onClearAndHide: function () {
                    this.value.set('nazwa', null);
                    this.value.set('idteryt_sym', null);
                    this.value.set('gmina', null);
                    this.value.set('rodz_msc_id', null);
                    this.value.set('jezyk_mniejszosci', null);
                    this.value.set('nazwa_mniejszosci', null);
                    this.value.set('nazwa_teryt', null);
                    this.value.set('kraj', null);
                    this.value.set('pow', null);
                    this.value.set('wazny_od', null);
                    this.value.set('wazny_do', null);
                    this.value.set('miejscId', null);
                    this.set('obrebySelected', null);
                    this.hide();
                },
                onSave: function () {
                    var that = this;
                    if (this.value.nazwa === null) {
                        iwNotification.warn("Wymagane uzupełnienie pola nazwa miejscowosci.");
                    }
                    if (this.obrebySelected === null) {
                        iwNotification.warn("Wymagane uzupełnienie pola nazwa obrębu.");
                    }
                    if (this.value.nazwa === null || this.obrebySelected === null) {
                        return;
                    }
                    var idObrebu = [];
                    $.each(this.obrebySelected, function (key, value) {
                        idObrebu.push(value.id);
                    });
                    var dane = {
                        'nazwa': this.value.nazwa,
                        'idteryt_sym': this.value.idteryt_sym,
                        'gmina': this.value.gmina,
                        'kraj': this.value.kraj,
                        'rodzaj': this.value.rodz_msc_id,
                        'jezyk_mniejszosci': this.value.jezyk_mniejszosci,
                        'nazwa_mniejszosci': this.value.nazwa_mniejszosci,
                        'nazwa_teryt': this.value.nazwa_teryt,
                        'pow': this.value.pow,
                        'wazny_od': tools.changeFormatDate(this.value.wazny_od),
                        'wazny_do': tools.changeFormatDate(this.value.wazny_do),
                        'obr_miejsc': idObrebu,
                        'miejscId': 0
                    };
                    perunAjax.ajax({
                        url: external.dodajMiejscowosc,
                        method: "PUT",
                        dataType: "json",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        if (!data.success) {
                            iwNotification.error(data.message);

                            return;
                        }
                        iwAlert.createAndShow({
                            parent: that,
                            modal: "global",
                            html: "Zmiany zapisano (będą one widoczne po przeładowaniu strony)",
                            title: 'Informacja'
                        });
                        that.onClearAndHide();
                    });
                },
                _registerDicts: function () {
                    iwKendo.windowViewModel.fn._registerDicts.call(this);
                    var that = this;
                    that.sloGminyHandler = perunDict.registerRequest("emuia_slo_gminy", function (data) {
                        that.set('slownikGminy', data);
                    });
                },
                _unregisterDicts: function () {
                    perunDict.unregisterRequest(this.sloGminyHandler);
                    this.set('data', null);
                    iwKendo.windowViewModel.fn._unregisterDicts.call(this);
                },
                updateSlownik: function (sloObreby, sloGminy, sloKraj, sloRodzaj) {
                    this.set('slownikObreby', this.extractObreb(sloObreby));
                    this.set('slownikKraj', sloKraj);
                    this.set('slownikRodzaj', sloRodzaj);
                },
                extractObreb: function (data) {
                    var obreby = [];
                    var obiektObreby = {};
                    for (var j = 0; j < data.length; j++) {
                        for (var i = 0; i < data[j].Obreby.length; i++) {
                            var obrebyInfo = data[j].Obreby[i];
                            obiektObreby[i] = {
                                'id': obrebyInfo.Id,
                                'nazwa': obrebyInfo.Nazwa
                            };
                            obreby.push(obiektObreby[i]);
                        }
                    }

                    return obreby;
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
