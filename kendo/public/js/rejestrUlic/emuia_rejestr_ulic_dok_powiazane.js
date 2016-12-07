define(
    'emuia_rejestr_ulic_dok_powiazane',
    [
        'jquery',
        'iw_kendo',
        'perun_ajax',
        'perun_api',
        'eod_dok_przych_edycja',
        'eod_dok_przych_rejestr',
        'text!emuia_rejestr_ulic_dok_powiazane_html',
        'underscore',
        'iw_notification',
        'emuia_tools',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 perunAjax,
                 perunApi,
                 dokPrzychEdycja,
                 dokPrzychDodaj,
                 template,
                 _,
                 iwNotification,
                 tools) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                toArchive: false,
                dokGridFilter: [],
                isGridSelected: false,
                edycjaViewModel: null,
                idUlicy: null,
                selectedRow: null,
                result: false,
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                updateIdMiejscowosci: function (id) {
                    var that = this;
                    this.set("idUlicy", id);
                    perunAjax.ajax({
                        method: "GET",
                        url: perunApi.getResourceAddress("emuia_dokument_dla_ul", id)
                    }).then(function (data) {
                        var dokumenty = [];
                        $.each(data.Response, function (key, value) {
                            value.DataD = tools.changeFormatDate(value.DataD);
                            value.DataK = tools.changeFormatDate(value.DataK);
                            dokumenty.push(value);
                        });
                        that.toArchive = false;
                        that.dokGridFilter = dokumenty;
                        that.dokumentyDataSource.read({
                            data: _(dokumenty).filter(function (x) {
                                return x.DataK === null || x.DataK === undefined;
                            })
                        });
                    });
                },
                dokumentyDataSource: new iwKendo.kendo.data.DataSource({
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
                    this.multiRowsSelect = grid.select();
                    this.selectedRow = grid.dataItem(this.multiRowsSelect);
                },
                onDataBound: function (e) {
                    var dataItems = e.sender.dataSource.view();
                    for (var j = 0; j < dataItems.length; j++) {
                        var status = dataItems[j].get("DataK");
                        var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
                        if (!!status) {
                            row.addClass("statusy-archiwalne");
                            $(".statusy-archiwalne").css({
                                "background-color": "#FF6666"
                            });
                        }

                    }
                },
                onMenuSelect: function (e) {
                    var that = this;
                    var selectedId = $(e.item).data("menu-id");
                    switch (selectedId) {
                        case "dodajDokument": {
                            var dodDokViewModel = dokPrzychDodaj.create();
                            dodDokViewModel.showForSelect({
                                success: function (data) {
                                    var dane = {
                                        "DokId": data.Id,
                                        "UlicaId": that.idUlicy,
                                    };
                                    perunAjax.ajax({
                                        method: "POST",
                                        url: perunApi.getResourceAddress("emuia_dokument_dla_ul_zapis", viewModel.idUlicy),
                                        data: JSON.stringify(dane)
                                    }).then(function (data) {
                                        iwNotification.info("Dokument został dodany.");
                                        that.updateIdMiejscowosci(that.idUlicy);
                                        if (typeof(viewModel.result) === 'function') {
                                            viewModel.result(true);
                                        }
                                    });

                                }
                            });
                            this.set('selectedRow',null);
                            break;
                        }
                        case "edytujDokument": {
                            if (!this.selectedRow) {
                                iwNotification.warn('Nie wybrano dokumentu.');
                                break;
                            }
                            if (this.edycjaViewModel === null) {
                                this.edycjaViewModel = dokPrzychEdycja.create();
                            }
                            this.edycjaViewModel.edit({
                                id: viewModel.selectedRow.DokId,
                                success: function (data) {
                                    that.updateIdMiejscowosci(that.idUlicy);
                                    if (typeof(viewModel.result) === 'function') {
                                        viewModel.result(true);
                                    }
                                }
                            });
                            this.set('selectedRow',null);
                            break;
                        }
                        case "usunDokument": {
                            if (!this.selectedRow) {
                                iwNotification.warn('Nie wybrano dokumentu.');
                                break;
                            }
                            perunAjax.ajax({
                                method: "DELETE",
                                url: perunApi.getResourceAddress("emuia_dokument_dla_ul_usun", viewModel.selectedRow.Id)
                            }).then(function (data) {
                                iwNotification.warn("Dokument został usunięty.");
                                that.updateIdMiejscowosci(that.idUlicy);
                                if (typeof(viewModel.result) === 'function') {
                                    viewModel.result(true);
                                }
                            });
                            this.set('selectedRow',null);
                            break;
                        }
                        case "toArchiwum": {
                            if (!this.selectedRow) {
                                iwNotification.warn('Nie wybrano dokumentu.');
                                break;
                            }
                            if (!!this.selectedRow.DataK) {
                                iwNotification.warn('Dokument posiada status archiwalny.');

                                return;
                            }
                            perunAjax.ajax({
                                method: "PUT",
                                url: perunApi.getResourceAddress("emuia_dokument_to_arch", viewModel.selectedRow.Id),
                                data: JSON.stringify({"Id": viewModel.selectedRow.Id})
                            }).then(function (data) {
                                iwNotification.warn("Dokument przeniesiono do stanu archiwalnego.");
                                that.updateIdMiejscowosci(that.idUlicy);
                            });
                            this.set('selectedRow',null);
                            break;
                        }
                        case "fromArchiwum": {
                            if (!this.selectedRow) {
                                iwNotification.warn('Nie wybrano dokumentu.');
                                break;
                            }
                            if (!!this.selectedRow.DataK) {
                                perunAjax.ajax({
                                    method: "PUT",
                                    url: perunApi.getResourceAddress("emuia_dokument_from_arch", viewModel.selectedRow.Id),
                                    data: JSON.stringify({"Id": viewModel.selectedRow.Id})
                                }).then(function (data) {
                                    iwNotification.warn("Dokument przywrócono do stanu aktualnego.");
                                    that.updateIdMiejscowosci(that.idUlicy);
                                });

                                return;
                            }
                            iwNotification.warn('Dokument posiada status aktualny.');
                            this.set('selectedRow',null);
                            break;
                        }
                        case "pokazArchiwizowane": {
                            this.toArchive = !this.toArchive;
                            var datasource = this.dokGridFilter;
                            if (this.toArchive) {
                                this.dokumentyDataSource.read({
                                    data: datasource
                                });

                                return;
                            }
                            this.dokumentyDataSource.read({
                                data: _(datasource).filter(function (x) {
                                    return x.DataK === null || x.DataK === undefined;
                                })
                            });

                            break;
                        }
                    }
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
