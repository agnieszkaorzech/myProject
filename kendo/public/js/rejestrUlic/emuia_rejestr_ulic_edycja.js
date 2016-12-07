define(
    'emuia_rejestr_ulic_edycja',
    [
        'jquery',
        'iw_kendo',
        'emuia_tools',
        'perun_ajax',
        'perun_api',
        'emuia_settings',
        'iw_notification',
        'emuia_rejestr_ulic_dodaj_dodajDokument',
        'text!emuia_rejestr_ulic_edycja_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 tools,
                 perunAjax,
                 perunApi,
                 settings,
                 iwNotification,
                 dodajDokument,
                 template) {

        "use strict";

        var external = {
            edytujUlice: settings.routes.emuia_ulicaAddAndEdit_edit
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                isVisibleGrid: true,
                title: "Edycja ulicy",
                miejscId: null,
                result: false,
                singleRowSelect: null,
                isGridSelected: false,
                value: iwKendo.kendo.observable({
                    UlicaId: null,
                    Nazwa: null,
                    NazwaPrzedrostek1: null,
                    NazwaPrzedrostek2: null,
                    NazwaSkr: null,
                    NazwaCzesc: null,
                    NazwaGlowna: null,
                    NazwaMniejszosci: null,
                    NazwaPesel: null,
                    NazwaTeryt: null,
                    IdTerytSymUl: null,
                    RodzUlId: null,
                    Status: null,
                    WaznyOd: null,
                    WaznyDo: null,
                    Dokumenty: null,
                }),
                rodzajUlicy: [
                    {Id: 6, Nazwa: 'rondo - rondo'},
                    {Id: 1, Nazwa: 'ulica - ul.'},
                    {Id: 2, Nazwa: 'aleja - al.'},
                    {Id: 3, Nazwa: 'plac - pl.'},
                    {Id: 4, Nazwa: 'osiedle - os.'},
                    {Id: 5, Nazwa: 'inna'}
                ],
                ulicaStatus: [
                    {Symbol: 'I', Nazwa: 'istniejący'},
                    {Symbol: 'P', Nazwa: 'projektowany'}
                ],
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                update: function (miejscId, ulicaId) {
                    this.set("miejscId", miejscId);
                    this.value.set("UlicaId", ulicaId);
                    var that = this;
                    perunAjax.ajax({
                        url: perunApi.getResourceAddress("emuia_ulice_szczegoly", ulicaId),
                        method: "GET"
                    }).then(function (data) {
                        if (data.Nazwa === "???") {
                            data.response.Nazwa = "BEZ ULICY";
                            data.response.NazwaSkr = "BEZ ULICY";
                        }
                        data.WaznyOd = tools.changeFormatDate(data.WaznyOd);
                        data.WaznyDo = tools.changeFormatDate(data.WaznyDo);
                        that.dokumentDataSource.read({
                            data: data.Dokumenty
                        });
                        that.set("value", data);
                    });
                },
                onSave: function () {
                    if (this.value.RodzUlId === null || this.value.Status === null) {
                        iwNotification.warn("Rodzaj ulicy oraz Status są wymagane.");

                        return;
                    }
                    if (!!this.value.NazwaGlowna) {
                        var idDokumentow = [];
                        $.each(viewModel.dokumentDataSource.data(), function (key, value) {
                            idDokumentow.push(value.Id);
                        });
                        this.value.NazwaPesel = (this.value.NazwaPesel !== null) ? this.value.NazwaPesel.toUpperCase() : this.value.NazwaPesel;
                        var dane = {
                            'miejscId': this.miejscId,
                            'rodzUlSelect': this.value.RodzUlId,
                            'przedrostek1': this.value.NazwaPrzedrostek1,
                            'przedrostek2': this.value.NazwaPrzedrostek2,
                            'nazwaCzesc1': this.value.NazwaCzesc,
                            'nazwaGlowna': this.value.NazwaGlowna,
                            'ulShortName': this.value.NazwaSkr,
                            'ulPesel': this.value.NazwaPesel,
                            'ulTeryt': this.value.NazwaTeryt,
                            'ulFullName': this.value.Nazwa,
                            'nazwaMniejszosci': this.value.NazwaMniejszosci,
                            'ulStatus': this.value.Status,
                            'waznyDo': tools.changeFormatDate(this.value.WaznyDo),
                            'waznyOd': tools.changeFormatDate(this.value.WaznyOd),
                            'ulNr': this.value.IdTerytSymUl,
                            'dokId': idDokumentow,
                            'ulicaId': this.value.UlicaId
                        };
                        perunAjax.ajax({
                            url: external.edytujUlice,
                            method: "POST",
                            dataType: "json",
                            data: JSON.stringify(dane)
                        }).then(function (data) {
                            if (data.response.success) {
                                iwNotification.info(data.response.message);
                                if (typeof(viewModel.result) === 'function') {
                                    viewModel.result(data.response.success);
                                }
                                viewModel.onClearAndHide();
                                return;
                            }
                            iwNotification.warn(data.response.message);
                        });

                        return;
                    }
                    iwNotification.warn("Nazwa główna jest wymagana.");
                },
                dokumentDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                autocompleData: function () {
                    this.value.set('NazwaPesel', this.value.NazwaGlowna.toUpperCase());
                    this.value.set('NazwaSkr', this.value.NazwaGlowna);
                    this.value.set('Nazwa', this.value.NazwaGlowna);
                    this.value.set('NazwaTeryt', this.value.NazwaGlowna);
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.singleRowSelect = grid.select();
                    this.selectedRow = grid.dataItem(this.singleRowSelect);
                },
                usunDokument: function () {
                    viewModel.$root.find("[data-role='grid']").data("kendoGrid").removeRow(this.singleRowSelect);
                },
                onDodajDokument: function () {
                    var dodajDokumentViewModel = dodajDokument.create();
                    dodajDokumentViewModel.showForSelect({
                        success: function (data) {
                            var dane = [];
                            var atr = {
                                "DataDok": data.DataDok,
                                "DataWplywu": data.DataWplywu,
                                "Id": data.Id,
                                "NazwaRodzDok": data.NazwaRodzDok,
                                "NrWWydz": data.NrWWydz,
                                "Opis": data.Opis,
                                "Sygnatura": data.Sygnatura,
                                "WydanyPrzez": data.WydanyPrzez
                            };
                            dane.push(atr);
                            if (viewModel.dokumentDataSource.data() === null) {
                                this.dokumentDataSource.read({
                                    read: dane
                                });

                                return;
                            }
                            tools.addRowToGridDataSource(tools.compareId(viewModel.dokumentDataSource.data(), dane), viewModel);
                        }
                    });
                },
                onMenuSelect: function (e) {
                    var selectedId = $(e.item).data("menu-id");
                    switch (selectedId) {
                        case "usunDok":
                            this.usunDokument();
                            break;
                        case "dodajDok":
                            this.onDodajDokument();
                            break;
                        default:
                            iwNotification.error("Błąd funkcji onMenuSelect, brak wartości: " + selectedId);
                    }
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
