define(
    'emuia_rejestr_ulic_dodaj_dodajDokument',
    [
        'jquery',
        'iw_kendo',
        'perun_dicts',
        'perun_api',
        'perun_ajax',
        'text!emuia_rejestr_ulic_dodaj_dodajDokument_html',
        'perun_filter_builder',
        'iw_utils',
        'emuia_tools',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 perunDict,
                 perunApi,
                 perunAjax,
                 template,
                 perunFilterBuilder,
                 iwUtils,
                 tools) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                title: "Dodaj dokument do ulicy",
                mode: null,
                sloDokumenty: [],
                selectedRow:null,
                isGridSelected:false,
                sloDokumentyHandler: null,
                selectOneSuccessCallback: null,
                pokazDokViewModel: null,
                hasFilterChanged: false,
                filter: iwKendo.kendo.observable({
                    RodzajDokId: null,
                    Sygnatura: null,
                    NrRok: null,
                    NrKol: null,
                    WydanyPrzez: null,
                    DataDok: null,
                    DataWplywu: null
                }),
                pokazDokumentDS: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: {
                            type: "POST",
                            url: perunApi.getResourceAddress("emuia_rodz_dokumentow"),
                            dataType: "json",
                            contentType: "application/json"
                        },
                        parameterMap: function (data, type) {
                            return iwKendo.kendo.stringify(data);
                        }
                    },
                    pageSize: 20,
                    filter: null,
                    schema: {
                        data: "Response",
                        total: "TotalCount",
                        model: {
                            id: "Id",
                            fields: {
                                "Id": {}
                            }
                        },
                        parse: function (response) {
                            var data = response.Response;
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].DataDok) {
                                    data[i].DataDok = tools.changeFormatDate(data[i].DataDok);
                                }
                                if (data[i].DataWplywu) {
                                    data[i].DataWplywu = tools.changeFormatDate(data[i].DataWplywu);
                                }
                            }
                            response.Response = data;
                            return response;
                        }
                    },
                    serverFiltering: true,
                    serverPaging: true,
                    serverSorting: true
                }),
                onFilterApply: function () {
                    this.set("hasFilterChanged", false);
                    var filter = perunFilterBuilder.createBuilder();
                    if (this.filter.RodzajDokId) {
                        filter.equals("RodzajDokId", this.filter.RodzajDokId, null);
                    }
                    if (this.filter.Sygnatura) {
                        filter.searchUpperText("Sygnatura", this.filter.Sygnatura, null);
                    }
                    if (this.filter.WydanyPrzez) {
                        filter.searchUpperText("WydanyPrzez", this.filter.WydanyPrzez, null);
                    }
                    if (this.filter.NrRok) {
                        filter.equals("NrRok", this.filter.NrRok, null);
                    }
                    if (this.filter.NrKol) {
                        filter.equals("NrKol", this.filter.NrKol, null);
                    }
                    if (this.filter.DataDok) {
                        filter.equals("DataDok", this.filter.DataDok, null);
                    }
                    if (this.filter.DataWplywu) {
                        filter.equals("DataWplywu", this.filter.DataWplywu, null);
                    }
                    this.pokazDokumentDS.filter(filter.toArray());
                },
                onClear: function () {
                    for (var p in this.value) {
                        if (this.value.hasOwnProperty(p)) {
                            this.value[p] = null;
                        }
                    }
                },
                onClearAndHide: function () {
                    this.onClear();
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                },
                onCancelSelectOne: function (e) {
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                },
                showForSelect: function ({
                    success = iwUtils.reqDefault("success")
                }) {
                    this.selectOneSuccessCallback = success;
                    iwKendo.windowViewModel.fn.show.call(this);
                },
                onConfirmSelectOne: function () {
                    this.onCancelSelectOne();
                    if (typeof this.selectOneSuccessCallback === 'function') {
                        this.selectOneSuccessCallback(this.selectedRow);
                    }
                },
                _registerDicts: function () {
                    iwKendo.windowViewModel.fn._registerDicts.call(this);
                    var that = this;
                    that.sloDokumentyHandler = perunDict.registerRequest("emuia_slo_rodz_dokumentow", function (data) {
                        that.set('sloDokumenty', data);
                    });
                },
                _unregisterDicts: function () {
                    perunDict.unregisterRequest(this.sloDokumentyHandler);
                    this.set('data', null);
                    iwKendo.windowViewModel.fn._unregisterDicts.call(this);
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.selectedRow = grid.dataItem(grid.select());
                }
            });
            viewModel.filter.bind("change", function () {
                viewModel.set("hasFilterChanged", true);
            });
            return viewModel;
        };

        return {
            create: create
        };
    });
