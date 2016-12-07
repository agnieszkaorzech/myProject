define(
    'emuia_rejestr_ulic_dodaj',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_ulic_dodaj_html',
        'emuia_rejestr_ulic_dodaj_dodajDokument',
        'emuia_tools',
        'perun_ajax',
        'emuia_settings',
        'iw_notification',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template,
                 dodajDokument,
                 tools,
                 perunAjax,
                 settings,
                 iwNotification) {

        "use strict";

        var external = {
            dodajUlice: settings.routes.emuia_ulicaAddAndEdit_add
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                title : "Dodaj ulicę",
                dodajDokumentViewModel: null,
                isVisibleButton: true,
                isVisibleGrid: false,
                singleRowSelect: [],
                isGridSelected: false,
                selectedRow: null,
                result: false,
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
                value: iwKendo.kendo.observable({
                    rodzUlSelect: null,
                    przedrostek1: null,
                    przedrostek2: null,
                    nazwaCzesc1: null,
                    nazwaGlowna: null,
                    ulShortName: null,
                    ulPesel: null,
                    ulTeryt: null,
                    ulFullName: null,
                    nazwaMniejszosci: null,
                    ulStatus: null,
                    waznyDo: null,
                    waznyOd: null,
                    dokId: null,
                    miejscId: null,
                    ulicaId: null,
                    ulKod: null,
                    ulNr: null,
                }),
                windowClose:function () {
                    this.onClearAndHide();
                },
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                updateIdMiejscowosci: function (id) {
                    this.value.set('miejscId', id);
                },
                onSave: function () {
                    if (this.value.rodzUlSelect === null) {
                        iwNotification.warn("Wymagane uzupełnienie pola rodzaj ulicy.");
                    }
                    if ( this.value.ulStatus === null) {
                        iwNotification.warn("Wymagane uzupełnienie pola status ulicy.");
                    }
                    if(this.value.ulStatus === null || this.value.rodzUlSelect === null){
                        return;
                    }
                    if (!!this.value.nazwaGlowna) {
                        var idDokumentow = [];
                        $.each(viewModel.dokumentDataSource.data(), function (key, value) {
                            idDokumentow.push(value.Id);
                        });
                        var dane = {
                            'rodzUlSelect': this.value.rodzUlSelect,
                            'przedrostek1': this.value.przedrostek1,
                            'przedrostek2': this.value.przedrostek2,
                            'nazwaCzesc1': this.value.nazwaCzesc1,
                            'nazwaGlowna': this.value.nazwaGlowna,
                            'ulShortName': this.value.ulShortName,
                            'ulPesel': this.value.ulPesel,
                            'ulTeryt': this.value.ulTeryt,
                            'ulFullName': this.value.ulFullName,
                            'nazwaMniejszosci': this.value.nazwaMniejszosci,
                            'ulStatus': this.value.ulStatus,
                            'waznyDo': tools.changeFormatDate(this.value.waznyDo),
                            'waznyOd': tools.changeFormatDate(this.value.waznyOd),
                            'ulKod': this.value.ulKod,
                            'ulNr': this.value.ulNr,
                            'dokId': idDokumentow,
                            'miejscId': this.value.miejscId,
                            'ulicaId': 0
                        };
                        perunAjax.ajax({
                            url: external.dodajUlice,
                            method: "PUT",
                            dataType: "json",
                            data: JSON.stringify(dane)
                        }).then(function (data) {
                            if (data.response.success) {
                                iwNotification.info(data.response.message);
                                if (typeof(viewModel.result) === 'function') {
                                    viewModel.result(data.response.success);
                                }
                                return;
                            }
                            iwNotification.warn(data.response.message);
                        });
                        this.onClearAndHide();
                        return;
                    }
                    iwNotification.warn("Wymagane uzupełnienie pola nazwa główna.");
                },
                changeToUpperCase: function () {
                    this.value.set('ulPesel', this.value.ulFullName.toUpperCase());
                },
                autocompleData: function () {
                    this.value.set('ulPesel', this.value.nazwaGlowna.toUpperCase());
                    this.value.set('ulShortName', this.value.nazwaGlowna);
                    this.value.set('ulFullName', this.value.nazwaGlowna);
                    this.value.set('ulTeryt', this.value.nazwaGlowna);
                },
                onDodajDokument: function () {
                    if (this.dodajDokumentViewModel === null) {
                        this.dodajDokumentViewModel = dodajDokument.create();
                    }
                    this.dodajDokumentViewModel.show({
                        parent: this,
                        modal: "window"
                    });
                    this.dodajDokumentViewModel.showForSelect({
                        success: function (data) {
                            var dane =[];
                            var atr ={
                                "DataDok":data.DataDok,
                                "DataWplywu":data.DataWplywu,
                                "Id":data.Id,
                                "NazwaRodzDok":data.NazwaRodzDok,
                                "NrWWydz":data.NrWWydz,
                                "Opis":data.Opis,
                                "Sygnatura":data.Sygnatura,
                                "WydanyPrzez":data.WydanyPrzez
                            };
                            dane.push(atr);
                            viewModel.activationGrid(dane);
                        }
                    });
                },
                activationGrid: function (dokumenty) {
                    this.set('isVisibleButton', false);
                    this.set('isVisibleGrid', true);
                    if (viewModel.dokumentDataSource.data() === null) {
                        this.dokumentDataSource.read({
                            read: dokumenty
                        });

                        return;
                    }
                    tools.addRowToGridDataSource(tools.compareId(viewModel.dokumentDataSource.data(), dokumenty), viewModel);
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
                            iwNotification.warn("Błąd funkcji onMenuSelect, brak wartości: " + selectedId);
                    }
                },
                usunDokument: function () {
                    viewModel.$root.find("[data-role='grid']").data("kendoGrid").removeRow(this.singleRowSelect);
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.singleRowSelect = grid.select();
                    this.selectedRow = grid.dataItem(this.singleRowSelect);
                },
                onClearAndHide: function () {
                    this.value.set('rodzUlSelect', null);
                    this.value.set('przedrostek1', null);
                    this.value.set('przedrostek2', null);
                    this.value.set('nazwaCzesc1', null);
                    this.value.set('nazwaGlowna', null);
                    this.value.set('ulShortName', null);
                    this.value.set('ulPesel', null);
                    this.value.set('ulTeryt', null);
                    this.value.set('ulFullName', null);
                    this.value.set('nazwaMniejszosci', null);
                    this.value.set('ulKod', null);
                    this.value.set('waznyOd', null);
                    this.value.set('waznyDo', null);
                    this.value.set('ulNr', null);
                    this.value.set('dokId', null);
                    this.value.set('miejscId', null);
                    this.value.set('ulStatus', null);
                    this.hide();
                    this.set('isVisibleButton', true);
                    this.set('isVisibleGrid', false);
                    this.dokumentDataSource.read({
                        data:[]
                    });
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
