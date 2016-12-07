define(
    'emuia_rejestr_ulic',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_ulic_html',
        'perun_ajax',
        'iw_alert',
        'iw_download',
        'iw_settings',
        'iw_notification',
        'emuia_settings',
        'emuia_rejestr_ulic_szczegoly',
        'emuia_rejestr_ulic_dodaj',
        'emuia_rejestr_ulic_przepinanie_ulic',
        'emuia_rejestr_ulic_okno_usunOs',
        'emuia_rejestr_ulic_edycja',
        'emuia_rejestr_ulic_dok_powiazane',
        'emuia_rejestr_ulic_listaPowiazan',
        'emuia_rejestr_adresow_dodaj',
        'emuia_rejestr_adresow',
        'iw_class_FileGetter',
        'iw_confirm',
        'underscore',
        'emuia_tools',
        'map',
        'map_drawing',
        'perun_dicts',
        'perun_api',
        'egbil_rejestr_dzialek',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 html,
                 perunAjax,
                 iwAlert,
                 iwDownload,
                 globalSettings,
                 iwNotification,
                 settings,
                 uliceSzczegoly,
                 uliceDodaj,
                 przepnijUlice,
                 deleteUlWindow,
                 uliceEdycja,
                 dokPowiazane,
                 uliceListaPowiazan,
                 dodajAdresDoUlicy,
                 rejestrAdresow,
                 FileGetter,
                 iwConfirm,
                 _,
                 tools,
                 iwMap,
                 mapDrawing,
                 perunDict,
                 perunApi,
                 rejestrDzialek) {

        "use strict";

        var external = {
            uliceData: settings.routes.emuia_ulicelist_getulicelist,
            uliceAutocompleteFiltr: settings.routes.emuia_autocomplete_ulicajson,
            usunUlice: settings.routes.emuia_ulicaRemove_remove,
            przywrocUlice: settings.routes.emuia_ulicaRemove_bringFromArchive,
            archiwizujUlice: settings.routes.emuia_ulicaRemove_sendToArchive,
            pokazUliceNaMapie: settings.routes.emuia_dlk4streetlist_getWktForDlk4Street,
            assignDzialKartoteka: settings.routes.emuia_dlk4streetAssignment_assign,
            assignDzialMapa: settings.routes.emuia_dlk4streetAssignment_assignFromWkt,
            listaPowiazanUl: settings.routes.emuia_dlk4streetlist_getList,
            openMap: iwMap.open,
            dodajOs: settings.routes.emuia_add_ulc_axis,
            usunOs: settings.routes.emuia_delete_ulc_axis,
            dzialkaGeom: globalSettings.route.dzialkaGeom,
            publicDzialkaSearch: globalSettings.route.publicDzialkaSearch,
            activatePointAtMap: mapDrawing.activatePointer,
            deactivatePointAtMap: mapDrawing.deactivatePointer
        };
        var create = function () {
            var viewModel = new iwKendo.leftMenuWindowViewModel({
                html: html,
                isGridSelected: false,
                updateUsunUlice: false,
                updatePrzywUlice: false,
                updateArchUlice: false,
                toArchive: false,
                autocompleteValue: null,
                multiRowsSelect: [],
                sloMiejscowosci: [],
                uliceGridFilter: [],
                selectedRow: null,
                sloMiejscowosciHandler: null,
                rejestrAdresViewModel: null,
                oknoPotwierdzeniaViewModel: null,
                szczegolyViewModel: null,
                listaPowiazanViewModel: null,
                przepnijUliceViewModel: null,
                dodajUliceViewModel: null,
                edytujUliceViewModel: null,
                dokPowiazaneUliceViewModel: null,
                dodajAdresViewModel: null,
                selectedMiejscowosc: null,
                oknoUsunieciaOsi: null,
                egbilDzialki: null,
                model: iwKendo.kendo.observable({
                    idMiejscowosc: null,
                    filtrUlic: null,
                    nazwaMiejscowosci: null
                }),
                ulicaDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                windowClose: function () {
                    this.set('selectedMiejscowosc', null);
                    this.set('selectedRow', null);
                    this.set('isGridSelected', false);
                    this.model.set('idMiejscowosc', null);
                    this.model.set('filtrUlic', null);
                    this.model.set('nazwaMiejscowosci', null);
                    this.ulicaDataSource.read({
                        data: []
                    });
                },
                onMenuSelect: function (e) {
                    var selectedId = $(e.item).data("menu-id");
                    var that = this;
                    switch (selectedId) {
                        case "szczegolyUlic":
                            if (this.selectedRow !== null) {
                                if (this.szczegolyViewModel === null) {
                                    this.szczegolyViewModel = uliceSzczegoly.create();
                                }
                                this.szczegolyViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });
                                this.updateSzczegoly();
                                this.set('selectedRow', null);
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "pokazArchiwizowane":
                            this.toArchive = !this.toArchive;
                            if (this.selectedMiejscowosc !== null) {
                                var datasource = this.uliceGridFilter;
                                if (this.toArchive) {
                                    this.ulicaDataSource.read({
                                        data: datasource
                                    });

                                    return;
                                }
                                this.ulicaDataSource.read({
                                    data: _(datasource).filter(function (x) {
                                        return x.data_k === null;
                                    })
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać miejscowość");
                            break;
                        case "dodajUlice":
                            if (!!this.model.idMiejscowosc) {
                                if (this.dodajUliceViewModel === null) {
                                    this.dodajUliceViewModel = uliceDodaj.create();
                                }
                                this.dodajUliceViewModel.updateIdMiejscowosci(this.model.idMiejscowosc);
                                this.dodajUliceViewModel.show({
                                    parent: this,
                                    modal: "window",
                                    result: (result) => {
                                        if (result) {
                                            viewModel.selectedMiejscowoscFunction();
                                        }
                                    }
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać miejscowość, dla której ma być dodana ulica");
                            break;
                        case "edytujUlice":
                            if (this.selectedRow === null) {
                                iwNotification.info("Proszę wybrać ulicę");

                                return;
                            }
                            if (this.edytujUliceViewModel === null) {
                                this.edytujUliceViewModel = uliceEdycja.create();
                            }
                            this.edytujUliceViewModel.update(this.model.idMiejscowosc, this.selectedRow.id);
                            this.edytujUliceViewModel.show({
                                parent: this,
                                modal: "window",
                                result: (result) => {
                                    if (result) {
                                        viewModel.selectedMiejscowoscFunction();
                                    }
                                }
                            });
                            this.set('selectedRow', null);
                            break;
                        case "dokumentyPowiazane":
                            if (this.selectedRow !== null) {
                                if (this.dokPowiazaneUliceViewModel === null) {
                                    this.dokPowiazaneUliceViewModel = dokPowiazane.create();
                                }
                                this.dokPowiazaneUliceViewModel.updateIdMiejscowosci(this.selectedRow.id);
                                this.dokPowiazaneUliceViewModel.show({
                                    parent: this,
                                    modal: "window",
                                    result: (result) => {
                                        if (result) {
                                            viewModel.selectedMiejscowoscFunction();
                                        }
                                    }
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case"usunUlice":
                            if (this.selectedRow === null) {
                                iwNotification.info("Proszę wybrać ulicę");

                                return;
                            }
                            this.usunUlice();
                            this.set('selectedRow', null);
                            break;
                        case "toArchiwum":
                            if (this.selectedRow === null) {
                                iwNotification.info("Proszę wybrać ulicę");
                            }
                            if (!!this.selectedRow.data_k) {
                                iwNotification.error("Ulica posiada status archiwalny");
                            }
                            if (this.selectedRow === null || !!this.selectedRow.data_k) {
                                return;
                            }
                            this.archiwizujUlice();
                            this.set('selectedRow', null);
                            break;
                        case "fromArchiwum":
                            if (this.selectedRow === null) {
                                iwNotification.info("Proszę wybrać ulicę");
                            }
                            if (this.selectedRow.data_k === null) {
                                iwNotification.error("Ulica nie posiada statusu archiwalny");
                            }
                            if (this.selectedRow === null || this.selectedRow.data_k === null) {
                                return;
                            }
                            this.przywrocZarchiwizowanaUlice();
                            this.set('selectedRow', null);
                            break;
                        case "przepnijUlice":
                            if (!!this.model.idMiejscowosc) {
                                if (this.przepnijUliceViewModel === null) {
                                    this.przepnijUliceViewModel = przepnijUlice.create();
                                }
                                this.przepnijUliceViewModel.update(this.selekcjaUlicNieZarchiwizowanych(viewModel.ulicaDataSource.data()), this.model.nazwaMiejscowosci);
                                this.przepnijUliceViewModel.show({
                                    parent: this,
                                    modal: "window",
                                    result: (result) => {
                                        if (result) {
                                            viewModel.selectedMiejscowoscFunction();
                                        }
                                    }
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać miejscowość, dla której ma być przepięta ulica");
                            break;
                        case "pokazUlicePowZMapa":
                            if (this.selectedRow !== null) {
                                this.showOnMap();
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "dodajOs":
                            if (this.selectedRow !== null) {
                                iwAlert.createAndShow({
                                    parent: that,
                                    modal: "global",
                                    html: "Aby dodać oś ulicy, wybierz narzędzie 'Rysuj linię' a nastepnie naciśnij przycisk 'Gotowe'.",
                                    title: 'Informacja'
                                });
                                this.drawOnMap();
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "usunOs":
                            if (this.selectedRow !== null) {
                                var dane = {
                                    'ulicaId': that.selectedRow.id
                                };
                                perunAjax.ajax({
                                    url: perunApi.getResourceAddress("emuia_ulice_osUlicyUsun", viewModel.selectedRow.id),
                                    method: "DELETE",
                                    data: JSON.stringify(dane)
                                }).then(function (data) {
                                    iwNotification.info("Oś ulicy została usunięta.");
                                    that.selectedMiejscowoscFunction();
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "kartotekaDzialek":
                            if (this.selectedRow !== null) {
                                if (this.egbilDzialki === null) {
                                    this.egbilDzialki = rejestrDzialek.create();
                                }
                                this.egbilDzialki.show({
                                    parent: this,
                                    modal: "global",
                                    mode: "selectOne",
                                    onSuccess: (dlk) => {
                                        var dane = {
                                            'dlkId': dlk.id,
                                            'ulicaId': viewModel.selectedRow.id
                                        };
                                        perunAjax.ajax({
                                            url: external.assignDzialKartoteka,
                                            method: "POST",
                                            data: JSON.stringify(dane)
                                        }).then(function (data) {
                                            if (data.success) {
                                                iwNotification.info("Działka została przypięta do ulicy, relację dodano do 'Listy powiązań'.");

                                                return;
                                            }
                                            iwNotification.info(data.message);
                                        });
                                    }
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę, dla której ma być przypięta działka");
                            break;
                        case "listaPowiazanUl":
                            if (this.selectedRow !== null) {
                                if (this.listaPowiazanViewModel === null) {
                                    this.listaPowiazanViewModel = uliceListaPowiazan.create();
                                }
                                this.listaPowiazanViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });
                                this.listaPowiazanViewModel.update(this.selectedRow.id);
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "dodajAdresDoUlicy":
                            if (this.selectedRow !== null) {
                                this.dodajAdresViewModel = dodajAdresDoUlicy.create();
                                this.dodajAdresViewModel.update(this.selectedRow.id, this.selectedRow.nazwa, this.selectedMiejscowosc);
                                this.dodajAdresViewModel.show({
                                    parent: this,
                                    modal: "global",
                                    result: (result) => {
                                        if (result) {
                                            if (that.rejestrAdresViewModel === null) {
                                                that.rejestrAdresViewModel = rejestrAdresow.create();
                                            }
                                            that.rejestrAdresViewModel.updateDodajAdres(that.model.idMiejscowosc, that.selectedMiejscowosc, that.selectedRow.id, that.selectedRow.nazwa);
                                        }
                                    }
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "mapa":
                            if (this.isGridSelected) {
                                external.openMap();
                                this.showOnMap();
                                viewModel.minimize();
                                external.activatePointAtMap({
                                        'clickCallback': function (objGeom) {
                                            var dataWkt = {
                                                'UlicaId': viewModel.selectedRow.id,
                                                'Wkt': objGeom.geom
                                            };
                                            var onSuccess = function (Geom) {
                                                var coord = tools.parserGeoJSON(Geom);
                                                var dane = {
                                                    'y': coord.coordinates[0],
                                                    'x': coord.coordinates[1],
                                                    'ulicaId': viewModel.selectedRow.id
                                                };
                                                perunAjax.ajax({
                                                    url: external.assignDzialMapa,
                                                    method: "POST",
                                                    data: JSON.stringify(dane)
                                                }).then(function (data) {
                                                    if (data.success) {
                                                        iwNotification.info("Działka została przypięta do ulicy");

                                                        return;
                                                    }
                                                    iwNotification.info(data.message);
                                                });
                                            };
                                            perunAjax.ajax({
                                                url: perunApi.getResourceAddress("emuia_dzialki_sasiadujace"),
                                                method: "POST",
                                                data: JSON.stringify(dataWkt)
                                            }).then(function (data) {
                                                if (data) {
                                                    onSuccess(objGeom);
                                                } else {
                                                    iwAlert.createAndShow({
                                                        parent: that,
                                                        modal: "global",
                                                        html: "Wskazana działka nie sąsiaduje z działkami należacymi do ulicy.",
                                                        title: 'Informacja'
                                                    });
                                                }
                                                viewModel.restore();
                                                external.deactivatePointAtMap();
                                            });
                                        }
                                    }
                                );

                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "raportNrPorz":
                            if (this.selectedMiejscowosc !== null) {
                                var ReportNrPorzFileGetter = new FileGetter({
                                    'url': perunApi.getResourceAddress("emuia_raport_nrPorz"),
                                });
                                ReportNrPorzFileGetter.send({
                                    'MscIdOrUlId': viewModel.model.idMiejscowosc,
                                    'MscOrUl': 0
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać miejscowość");
                            break;
                        case "usunOpis":
                            break;
                    }
                },
                _registerDicts: function () {
                    iwKendo.windowViewModel.fn._registerDicts.call(this);
                    var that = this;
                    that.sloMiejscowosciHandler = perunDict.registerRequest("emuia_slo_miejscowosci_dlapowiatow", function (data) {
                        that.set('sloMiejscowosci', data);
                    });
                },
                _unregisterDicts: function () {
                    perunDict.unregisterRequest(this.sloMiejscowosciHandler);
                    this.set('data', null);
                    iwKendo.windowViewModel.fn._unregisterDicts.call(this);
                },
                updateInf: function () {
                    if (viewModel.isWindowDisposed) {
                        var that = this;
                        iwAlert.createAndShow({
                            parent: that,
                            modal: "global",
                            html: 'Proszę wybrać miejscowość.',
                            title: 'Informacja'
                        });
                    }
                },
                selectedMiejscowoscFunction: function () {
                    var that = this;
                    this.model.set('idMiejscowosc', this.selectedMiejscowosc.Id);
                    this.model.set('nazwaMiejscowosci', this.selectedMiejscowosc.Nazwa);
                    perunAjax.ajax({
                        url: settings.routes.emuia_ulicelist_getulicelist.replace("{miejscId}", this.model.idMiejscowosc),
                        method: "GET"
                    }).then(function (data) {
                        if (data.success) {
                            var ulice = [];
                            $.each(data.response, function (key, value) {
                                if (value.geom !== null) {
                                    value.os = "jest";
                                }
                                if (value.nazwa === "???") {
                                    value.nazwa = "BEZ ULICY";
                                }
                                value.nazwa = value.nazwa + " " + value.przedrostek;
                            });
                            that.toArchive = false;
                            that.uliceGridFilter = data.response;
                            that.ulicaDataSource.read({
                                data: _(data.response).filter(function (x) {
                                    return x.data_k === null;
                                })
                            });

                            return;
                        }
                        iwNotification.warn(data.message);
                    });
                },
                onClickToRejestrAdresow: function () {
                    this.rejestrAdresViewModel = rejestrAdresow.create();
                    if (this.selectedRow !== null) {
                        this.rejestrAdresViewModel.updateDodajAdres(this.model.idMiejscowosc, this.selectedMiejscowosc, this.selectedRow.id, this.selectedRow.nazwa);

                        return;
                    }
                    this.rejestrAdresViewModel.updateInfo();
                    this.rejestrAdresViewModel.updateDodajAdres(this.model.idMiejscowosc, this.selectedMiejscowosc, null, null);
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.multiRowsSelect = grid.select();
                    this.selectedRow = grid.dataItem(this.multiRowsSelect);
                    if (this.szczegolyViewModel !== null && !this.szczegolyViewModel.isWindowDisposed) {
                        this.updateSzczegoly();
                    }
                },
                updateSzczegoly: function () {
                    if (!this.isGridSelected || this.szczegolyViewModel === null) {
                        return;
                    }
                    this.szczegolyViewModel.update(this.selectedRow.id);
                },
                onDataBound: function (e) {
                    var dataItems = e.sender.dataSource.view();
                    for (var j = 0; j < dataItems.length; j++) {
                        var status = dataItems[j].get("data_k");
                        var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
                        if (status !== null) {
                            row.addClass("statusy-archiwalne");
                            $(".statusy-archiwalne").css({
                                "background-color": "#FF6666"
                            });
                        }
                    }
                },
                usunUlice: function () {
                    var that = this;
                    var dane = {
                        'ulicaId': that.selectedRow.id
                    };
                    perunAjax.ajax({
                        url: external.usunUlice,
                        method: "DELETE",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        iwNotification.info(data.response.message);
                        that.selectedMiejscowoscFunction();
                    });
                },
                archiwizujUlice: function () {
                    var that = this;
                    var dane = {
                        'ulicaId': that.selectedRow.id
                    };
                    perunAjax.ajax({
                        url: external.archiwizujUlice,
                        method: "POST",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        iwNotification.info("Ulica została zarchiwizowana pomyślnie");
                        that.selectedMiejscowoscFunction();
                    });
                },
                przywrocZarchiwizowanaUlice: function () {
                    var that = this;
                    var dane = {
                        'ulicaId': that.selectedRow.id
                    };
                    perunAjax.ajax({
                        url: external.przywrocUlice,
                        method: "POST",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        iwNotification.warn("Ulica została przywrócona pomyślnie");
                        that.selectedMiejscowoscFunction();
                    });
                },
                selekcjaUlicNieZarchiwizowanych: function (data) {
                    var dane = [];
                    $.each(data, function (key, value) {
                        if (value.data_k === null) {
                            dane.push(value);
                        }
                    });
                    return dane;
                },
                showOnMap: function () {
                    var urlPokazDzialkePowiazaneNaMapie = settings.routes.emuia_dlk4streetlist_getWktForDlk4Street.replace("{ulicaId}", this.selectedRow.id);
                    perunAjax.ajax({
                        url: urlPokazDzialkePowiazaneNaMapie,
                        method: "GET"
                    }).then(function (data) {
                        external.openMap();
                        iwMap.showData(data.response[0].geom);
                    });
                },
                drawOnMap: function () {
                    var that = this;
                    viewModel.minimize();
                    external.openMap();
                    this.showOnMap();
                    mapDrawing.activate({
                        'what': "linestring",
                        'doneCallback': function (geometryObjectsArray) {
                            var dane = {
                                'UlicaId': viewModel.selectedRow.id,
                                'Wkt': geometryObjectsArray[0].geom
                            };
                            perunAjax.ajax({
                                url: perunApi.getResourceAddress("emuia_ulice_osUlicyDodaj", viewModel.selectedRow.id),
                                method: "PUT",
                                data: JSON.stringify(dane)
                            }).then(function (data) {
                                iwNotification.info("Oś ulicy została dodana.");
                                that.selectedMiejscowoscFunction();
                            });
                            viewModel.restore();
                        },
                        'sessionName': "rysowanieOsiUlicy",
                        'allowPoint': false,
                        'allowLine': true,
                        'allowPolygon': false,
                        'cleanAfterDone': false
                    });
                }

            });

            return viewModel;
        };
        return {
            create: create
        };
    });
