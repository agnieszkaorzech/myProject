define(
    'emuia_rejestr_miejscowosci',
    [
        'jquery',
        'iw_kendo',
        'iw_notification',
        'iw_info',
        'perun_ajax',
        'perun_dicts',
        'emuia_settings',
        'iw_settings',
        'iw_alert',
        'emuia_rejestr_miejscowosci_szczegoly',
        'emuia_rejestr_miejscowosci_dodaj',
        'emuia_rejestr_miejscowosci_edytuj',
        'text!emuia_rejestr_miejscowosci_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 iwNotification,
                 iwInfo,
                 perunAjax,
                 perunDict,
                 settings,
                 globalSettings,
                 iwAlert,
                 szczegoly,
                 dodajMiescowosc,
                 edytujMiescowosc,
                 template) {

        "use strict";

        var external = {
            addTaskToQueue: settings.routes.rest_public_addTaskToQueue
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                isVisibleFiltr: true,
                isEnabled: true,
                szczegolyViewModel: null,
                dodajViewModel: null,
                edytujViewModel: null,
                sloObrebyHandler: null,
                sloMiejscowosciHandler: null,
                sloObreby: [],
                sloMiejscowosci: [],
                sloKrajHandler: null,
                sloKraj: [],
                sloRodzPracHandler: null,
                sloRodzajPrac: [],
                isGridSelected: false,
                selectedRow: null,
                windowClose: function () {
                    this.set('selectedRow', null);
                },
                onMenuSelect: function (e) {
                    var that = this;
                    var text = $(e.item).data('menuId');
                    switch (text) {
                        case"szczegoly":
                            if (this.selectedRow !== null) {
                                if (this.szczegolyViewModel === null) {
                                    this.szczegolyViewModel = szczegoly.create();
                                }
                                this.updateSzczegoly();
                                this.szczegolyViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });
                                this.set('selectedRow', null);

                                return;
                            }
                            iwNotification.warn('Proszę wybrać miejscowość');
                            break;
                        case"dodajM":
                            if (this.dodajViewModel === null) {
                                this.dodajViewModel = dodajMiescowosc.create();
                            }
                            this.dodajViewModel.updateSlownik(this.sloObreby, this.extractGminy(this.sloObreby), this.sloKraj, this.sloRodzajPrac);
                            this.dodajViewModel.show({
                                parent: this,
                                modal: "window"
                            });
                            this.set('selectedRow', null);
                            break;
                        case"edytujM":
                            if (this.selectedRow !== null) {
                                if (this.edytujViewModel === null) {
                                    this.edytujViewModel = edytujMiescowosc.create();
                                }
                                this.edytujViewModel.updateSlownik(this.sloObreby, this.extractGminy(this.sloObreby), this.sloKraj, this.sloRodzajPrac);
                                this.edytujViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });
                                this.updateEdycja();
                                this.set('selectedRow', null);

                                return;
                            }
                            iwNotification.warn('Proszę wybrać miejscowość');
                            break;
                        case"gmlMiejsc":
                            if (this.selectedRow !== null) {
                                this.addTask(this.selectedRow.Id, 'miejsc');
                                iwAlert.createAndShow({
                                    parent: that,
                                    modal: "global",
                                    html: 'Zadanie dodano do kolejki. Możesz je sprawdzić w EMUiA->Kolejka zadań',
                                    title: 'Informacja'
                                });
                                this.set('selectedRow', null);

                                return;
                            }
                            iwNotification.warn('Proszę wybrać miejscowość');
                            break;
                        case"gmlGmina":
                            if (this.selectedRow !== null) {
                                this.addTask(this.selectedRow.Id, 'gmina');
                                iwAlert.createAndShow({
                                    parent: that,
                                    modal: "global",
                                    html: 'Zadanie dodano do kolejki. Możesz je sprawdzić w EMUiA->Kolejka zadań',
                                    title: 'Informacja'
                                });
                                this.set('selectedRow', null);

                                return;
                            }
                            iwNotification.warn('Proszę wybrać miejscowość');
                            break;
                    }
                },
                sloMiejscowosciDS: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.selectedRow = grid.dataItem(grid.select());
                    if (this.szczegolyViewModel !== null && !this.szczegolyViewModel.isWindowDisposed) {
                        this.updateSzczegoly();
                    }
                },
                updateSzczegoly: function () {
                    if (!this.isGridSelected || this.szczegolyViewModel === null) {
                        return;
                    }
                    this.szczegolyViewModel.update(this.selectedRow.Id);
                },
                updateEdycja: function () {
                    if (!this.isGridSelected || this.edytujViewModel === null) {
                        return;

                    }
                    this.edytujViewModel.update(this.selectedRow.Id);
                },
                _registerDicts: function () {
                    iwKendo.windowViewModel.fn._registerDicts.call(this);
                    var that = this;
                    that.sloObrebyHandler = perunDict.registerRequest("egib_slo_gminy", function (data) {
                        that.set('sloObreby', data);
                    });
                    that.sloMiejscowosciHandler = perunDict.registerRequest("emuia_slo_miejscowosci_dlapowiatow", function (data) {
                        that.set('sloMiejscowosci', data);
                        that.sloMiejscowosciDS.read({
                            data: that.sloMiejscowosci
                        });
                    });
                    that.sloKrajHandler = perunDict.registerRequest("emuia_slo_kraj", function (data) {
                        that.set('sloKraj', data);
                    });
                    that.sloRodzPracHandler = perunDict.registerRequest("emuia_slo_rodzaj_prac", function (data) {
                        that.set('sloRodzajPrac', data);
                    });
                },
                _unregisterDicts: function () {
                    perunDict.unregisterRequest(this.sloObrebyHandler);
                    perunDict.unregisterRequest(this.sloMiejscowosciHandler);
                    perunDict.unregisterRequest(this.sloKrajHandler);
                    perunDict.unregisterRequest(this.sloRodzPracHandler);
                    this.set('data', null);
                    iwKendo.windowViewModel.fn._unregisterDicts.call(this);
                },
                addTask: function (id, type) {
                    var dane = {
                        'objType': type,
                        'objId': id,
                        'taskType': 1
                    };
                    perunAjax.ajax({
                        url: external.addTaskToQueue,
                        method: "POST",
                        data: JSON.stringify(dane)
                    });
                },
                extractGminy: function (data) {
                    var obreby = [];
                    var obiektObreby = {};
                    for (var j = 0; j < data.length; j++) {
                        var obrebyInfo = data[j];
                        obiektObreby[j] = {
                            'id': obrebyInfo.Id,
                            'nazwa': obrebyInfo.Nazwa,
                        };
                        obreby.push(obiektObreby[j]);
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
