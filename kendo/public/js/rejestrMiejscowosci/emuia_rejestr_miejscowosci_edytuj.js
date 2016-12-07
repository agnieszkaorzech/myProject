define(
    'emuia_rejestr_miejscowosci_edytuj',
    [
        'jquery',
        'iw_kendo',
        'perun_dicts',
        'iw_alert',
        'iw_notification',
        'emuia_settings',
        'perun_ajax',
        'perun_api',
        'emuia_rejestr_miejscowosci_dodajObreb',
        'text!emuia_rejestr_miejscowosci_edytuj_html',
        'emuia_tools',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 perunDict,
                 iwAlert,
                 iwNotification,
                 settings,
                 perunAjax,
                 perunApi,
                 dodajObrebVM,
                 template,
                 tools) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                isLoaded: true,
                sloGminyHandler: null,
                dodajObrebViewModel: null,
                data: null,
                isGridSelected: false,
                selectedRow: null,
                sloObreby: [],
                slownikGminy: [],
                slownikKraj: [],
                slownikRodzaj: [],
                singleRowSelect: [],
                successEvent: null,
                isEnableXYDok: false,
                isEnabled: true,
                model: iwKendo.kendo.observable({
                    Id: null,
                    Nazwa: null,
                    gmina: null,
                    kraj: null,
                    NazwaWTeryt: null,
                    NazwaMniejsz: null,
                    JezykMniejsz: null,
                    WaznyOd: null,
                    WaznyDo: null,
                    Pow: null,
                    IdWTeryt: null,
                    rodzMsc: null,
                    obr_miejsc: null,
                    rodzMscId: null,
                    gminaId: null,
                    krajId: null,
                    DokSygnatura: null,
                    WspX: null,
                    WspY: null
                }),
                updateSlownik: function (sloObreby, sloGminy, sloKraj, sloRodzaj) {
                    this.set('sloObreby', sloObreby);
                    this.set('slownikKraj', sloKraj);
                    this.set('slownikRodzaj', sloRodzaj);
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
                onMenuSelect: function (e) {
                    var that = this;
                    var selectedId = $(e.item).data("menu-id");
                    switch (selectedId) {
                        case "usunObrebRM":
                            this.usunObreb();
                            break;
                        case "dodajObrebRM":
                            if (this.dodajObrebViewModel === null) {
                                this.dodajObrebViewModel = dodajObrebVM.create();
                            }
                            this.dodajObrebViewModel.show({
                                parent: this,
                                modal: "global",
                                addRow: (addRow) => {
                                    this.addRowToDataSource(this.compareNazwa(viewModel.obrebDataSource.data(), addRow));
                                }
                            });
                            this.dodajObrebViewModel.updateSlownikObreb(this.sloObreby);
                            break;
                        default:
                            iwAlert.createAndShow({
                                parent: that,
                                modal: "global",
                                html: "Błąd funkcji onMenuSelect, brak wartości: " + selectedId,
                                title: 'Informacja'
                            });
                    }
                },
                update: function (id) {
                    var that = this;
                    perunAjax.ajax({
                        url: perunApi.getResourceAddress("emuia_szczegoly_miejscowosci", id),
                        method: "GET"
                    }).then(function (data) {
                        var obreby = [];
                        that.model.set('gminaId', data.IdGmina);
                        that.model.set('krajId', data.IdKraj);
                        that.model.set('rodzMscId', data.IdRodzMsc);
                        $.each(data.Obreby, function (key, value) {
                            obreby.push(value);
                        });
                        that.obrebDataSource.read({
                            data: obreby
                        });
                        if (data.Pow !== null) {
                            data.Pow = tools.parseArea(data.Pow);
                        } else {
                            data.Pow = '';
                        }
                        if (data.WspX !== null) {
                            data.WspX = tools.parseLength(data.WspX);
                        } else {
                            data.WspX = '';
                        }
                        if (data.WspY !== null) {
                            data.WspY = tools.parseLength(data.WspY);
                        } else {
                            data.WspY = '';
                        }
                        that.set('model', data);

                        $("#dropDownListKrajRM").data("kendoDropDownList").select(viewModel.compareIds(viewModel.slownikKraj, data.NazwaKraj, 'krajId'));
                        $("#dropDownListRodzajRM").data("kendoDropDownList").select(viewModel.compareIds(viewModel.slownikRodzaj, data.NazwaRodzMsc, 'rodzMscId'));
                        $("#dropDownListGminaRM").data("kendoDropDownList").select(viewModel.compareIds(viewModel.slownikGminy, data.NazwaGmina, 'gminaId'));

                    });
                },
                obrebDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                onClearAndHide: function () {
                    this.model.set('gmina', null);
                    this.model.set('idterytSym', null);
                    this.model.set('jezykMniejszosci', null);
                    this.model.set('kraj', null);
                    this.model.set('nazwa', null);
                    this.model.set('nazwaMniejszosci', null);
                    this.model.set('nazwaTeryt', null);
                    this.model.set('powierzchnia', null);
                    this.model.set('rodzMsc', null);
                    this.model.set('waznyOd', null);
                    this.model.set('waznyDo', null);
                    this.model.set('gminaId', null);
                    this.model.set('krajId', null);
                    this.model.set('rodzMscId', null);
                    this.hide();
                },
                onSave: function () {
                    var that = this;
                    if (this.model.Nazwa === null) {
                        iwAlert("Nazwa miejscowości jest wymagana");

                        return;
                    }
                    var atrybutObrebu = [];
                    $.each(viewModel.obrebDataSource.data(), function (key, value) {
                        atrybutObrebu.push(value.Id);
                    });
                    this.model.NazwaWTeryt = (this.model.NazwaWTeryt !== null) ? this.model.NazwaWTeryt.replace(/_/g, '') : this.model.NazwaWTeryt;
                    var dane = {
                        'gmina': this.model.gminaId,
                        'idteryt_sym': this.model.IdWTeryt,
                        'miejscId': this.model.Id,
                        'jezyk_mniejszosci': this.model.JezykMniejsz,
                        'kraj': this.model.krajId,
                        'nazwa': this.model.Nazwa,
                        'nazwa_mniejszosci': this.model.NazwaMniejsz,
                        'nazwa_teryt': this.model.NazwaWTeryt,
                        'pow': this.model.Pow,
                        'rodzaj': this.model.rodzMscId,
                        'wazny_do': tools.changeFormatDate(this.model.WaznyDo),
                        'wazny_od': tools.changeFormatDate(this.model.WaznyOd),
                        'obr_miejsc': atrybutObrebu
                    };
                    perunAjax.ajax({
                        url: settings.routes.emuia_miejscAddAndEdit_edit,
                        method: "POST",
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
                            html: "Zmiany zapisano, będą one widoczne po przeładowaniu strony (lub automatycznie po wybraniu opcji z paska menu 'Szczegóły miejscowości')",
                            title: 'Informacja'
                        });
                        that.onClearAndHide();
                    });
                },
                usunObreb: function () {
                    viewModel.$root.find("[data-role='grid']").data("kendoGrid").removeRow(this.singleRowSelect);
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.singleRowSelect = grid.select();
                    this.selectedRow = grid.dataItem(this.singleRowSelect);
                },
                addRowToDataSource: function (data) {
                    var grid = viewModel.$root.find("[data-role='grid']").data("kendoGrid");
                    for (var i = 0; i < data.length; i++) {
                        grid.dataSource.add(data[i]);
                    }
                },
                compareNazwa: function (datasource, pushItem) {
                    var result = [];
                    result = pushItem.filter(function (current) {
                        return datasource.filter(function (current_datasource) {
                                return current_datasource.Id === current.Id;
                            }).length === 0;
                    });

                    return result;
                },
                compareIds: function (data1, data2Id, atrybut) {
                    var result = {};
                    var idResult = null;
                    $.each(data1, function (key, value) {
                        if (value.Nazwa === data2Id) {
                            result = data1.indexOf(value);
                            idResult = value.Id;
                        }
                    });
                    this.model.set(atrybut, idResult);

                    return result;
                }

            });

            return viewModel;
        };

        return {
            create: create
        };
    });
