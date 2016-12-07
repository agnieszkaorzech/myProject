define(
    'emuia_rejestr_ulic_listaPowiazan',
    [
        'jquery',
        'iw_kendo',
        'perun_ajax',
        'emuia_settings',
        'iw_notification',
        'iw_confirm',
        'text!emuia_rejestr_ulic_listaPowiazan_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 perunAjax,
                 settings,
                 iwNotification,
                 iwConfirm,
                 template) {

        "use strict";

        var external = {
            usunPowiazanie: settings.routes.emuia_dlk4streetAssignment_remove
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                selectedSingleRow: [],
                selectedRow: null,
                isGridSelected: false,
                idUlicy: null,
                update: function (id) {
                    this.set('idUlicy', id);
                    var url = settings.routes.emuia_dlk4streetlist_getList.replace("{ulicaId}", id);
                    perunAjax.ajax({
                        url: url,
                        method: "POST"
                    }).then(function (data) {
                        viewModel.listaPowiazanDataSource.read({
                            data: data.response
                        });
                    });
                },
                listaPowiazanDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                onMenuSelect: function (e) {
                    var selectedId = $(e.item).data("menu-id");
                    switch (selectedId) {
                        case "usunPowiazanie":
                            if (this.isGridSelected) {
                                var that = this;
                                var dane = {
                                    'uliceOpId': that.selectedRow.uliceOpId,
                                };
                                perunAjax.ajax({
                                    url: external.usunPowiazanie,
                                    method: "DELETE",
                                    data: JSON.stringify(dane)
                                }).then(function (data) {
                                    iwNotification.warn(data.response.message);
                                    that.update(that.idUlicy);
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać działkę");
                            break;
                    }
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.selectedSingleRow = grid.select();
                    this.selectedRow = grid.dataItem(this.selectedSingleRow);
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
