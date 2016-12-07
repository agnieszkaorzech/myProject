define(
    'emuia_rejestr_adresow',
    [
        'jquery',
        'iw_kendo',
        'emuia_rejestr_adresow_dodaj',
        'emuia_rejestr_adresow_edytuj',
        'emuia_rejestr_adresow_szczegoly',
        'emuia_rejestr_adresow_przepiecia',
        'emuia_rejestr_adresow_listaDzBud_szczegoly',
        'eod_dok_przych_rejestr',
        'emuia_rejestr_ulic_szczegoly',
        'emuia_rejestr_adresow_drukZawiadom',
        'emuia_rejestr_adresow_sprawa',
        'text!emuia_rejestr_adresow_html',
        'iw_class_FileGetter',
        'perun_dicts',
        'perun_ajax',
        'perun_api',
        'iw_alert',
        'iw_confirm',
        'underscore',
        'map',
        'map_drawing',
        'iw_notification',
        'emuia_settings',
        'iw_settings',
        'emuia_tools',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 adresDodaj,
                 adresEdytuj,
                 adresSzczegoly,
                 przepieciaSzczegoly,
                 listaDzBud,
                 dokPrzychDodaj,
                 uliceSzczegoly,
                 drukujZawiadom,
                 sprawa,
                 template,
                 FileGetter,
                 perunDict,
                 perunAjax,
                 perunApi,
                 iwAlert,
                 iwConfirm,
                 _,
                 iwMap,
                 mapDrawing,
                 iwNotification,
                 settings,
                 globalSettings,
                 tools) {

        "use strict";

        var external = {
            autocompleteUlice: settings.routes.emuia_autocomplete_ulicajson,
            usunNrPorz: settings.routes.emuia_adresRemove_remove,
            toArchiwum: settings.routes.emuia_adresRemove_sendToArchive,
            fromArchiwum: settings.routes.emuia_adresRemove_bringFromArchive,
            changeEB: settings.routes.emuia_ewAdresEb_changeEb4Adres,
            usunEBAdres: settings.routes.emuia_ewAdresRemove_sendToArchive,
            wniosekDodaj: settings.routes.emuia_wniosek4adres_add,
            wniosekUsun: settings.routes.emuia_wniosek4adres_remove,
            zawiadomienieDodaj: settings.routes.emuia_zawiadomienie4adres_add,
            zawiadomienieUsun: settings.routes.emuia_zawiadomienie4adres_remove,
            publicDzialkaSearch: globalSettings.route.publicDzialkaSearch,
            publicBudynekSearch: globalSettings.route.publicBudynekSearch,
            activatePointAtMap: mapDrawing.activatePointer,
            deactivatePointAtMap: mapDrawing.deactivatePointer,
            openMap: iwMap.open,
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                mode: null,
                toArchive: false,
                listaXY: false,
                uliceGridFilter: [],
                sloMiejscowosci: [],
                listaXYData: [],
                isGridSelectedAdr: false,
                isGridSelectedUl: false,
                isGridSelectedDzBud: false,
                selectedRowAdr: null,
                selectedRowUl: null,
                selectedRowDzBud: null,
                selectedMiejscowosc: null,
                szczegolyUlViewModel: null,
                drukujZawiadViewModel: null,
                przepieciaAdresViewModel: null,
                dodajAdresViewModel: null,
                listaDzBudViewModel: null,
                edytujAdresViewModel: null,
                szczegolyAdresViewModel: null,
                sloMiejscowosciHandler: null,
                sprawaViewModel: null,
                selectOnePanelVisible: false,
                adresyGridFilter: [],
                windowClose: function () {
                    this.set('selectedMiejscowosc', null);
                    this.set('selectedRowDzBud', null);
                    this.set('selectedRowUl', null);
                    this.set('selectedRowAdr', null);
                    this.set('isGridSelectedAdr', false);
                    this.set('isGridSelectedUl', false);
                    this.set('isGridSelectedDzBud', false);
                    this.ulicaDataSource.read({
                        data: []
                    });
                    this.adresyDzBudDataSource.read({
                        data: []
                    });
                    this.adresyDataSource.read({
                        data: []
                    });
                },
                onClick: function () {
                    if (this.selectOnePanelVisible === false) {
                        this.set('selectOnePanelVisible', true);

                        return;
                    }
                    this.set('selectOnePanelVisible', false);
                },
                updateInfo: function () {
                    if (viewModel.isWindowDisposed) {
                        var that = this;
                        if (this.mode === null) {
                            iwAlert.createAndShow({
                                parent: that,
                                modal: "global",
                                html: 'Proszę wybrać miejscowość, a następnie ulicę z listy.',
                                title: 'Informacja'
                            });
                        }
                    }
                },
                model: iwKendo.kendo.observable({
                    idMiejscowosc: null,
                    nazwaMiejscowosci: null,
                    idUlicy: null,
                    autocompleteUlice: null
                }),
                addAdressToMap: iwKendo.kendo.observable({
                    DzialkaId: null,
                    BudynekId: null,
                    OpisK: 0,
                    WspX: null,
                    WspY: null,
                    Wkt: null
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
                adresyDzBudDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                adresyDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var data = operation.data.data || [];
                            operation.success(data);
                        }
                    },
                    batch: true
                }),
                onMenuSelect: function (e) {
                    var that = this;
                    var selectedId = $(e.item).data("menu-id");
                    switch (selectedId) {
                        case "dodajAdres":
                            if (this.isGridSelectedUl || this.model.idUlicy !== null) {
                                if (this.dodajAdresViewModel === null) {
                                    this.dodajAdresViewModel = adresDodaj.create();
                                }
                                if (this.mode !== null) {
                                    this.dodajAdresViewModel.updateAdres(this.model.idUlicy, this.model.autocompleteUlice);
                                } else {
                                    this.dodajAdresViewModel.updateAdres(this.selectedRowUl.id, this.selectedRowUl.nazwa);
                                }
                                this.dodajAdresViewModel.show({
                                    parent: this,
                                    modal: "window",
                                    result: (result) => {
                                        if (result) {
                                            that.updateAdr();
                                        }
                                    }
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "edytujAdres":
                            if (this.isGridSelectedAdr) {
                                if (this.edytujAdresViewModel === null) {
                                    this.edytujAdresViewModel = adresEdytuj.create();
                                }
                                this.edytujAdresViewModel.update(this.selectedRowAdr, this.model.idUlicy);
                                this.edytujAdresViewModel.show({
                                    parent: this,
                                    modal: "window",
                                    result: (result) => {
                                        if (result) {
                                            that.updateAdr();
                                        }
                                    }
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case"szczegolyAdres":
                            if (this.isGridSelectedAdr) {
                                if (this.szczegolyAdresViewModel === null) {
                                    this.szczegolyAdresViewModel = adresSzczegoly.create();
                                }
                                this.szczegolyAdresViewModel.updateDetails(this.selectedRowAdr);
                                this.szczegolyAdresViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case 'usunNumerPrz':
                            if (this.isGridSelectedAdr) {
                                var daneUsun = {
                                    "adresId": this.selectedRowAdr.id
                                };
                                perunAjax.ajax({
                                    url: external.usunNrPorz,
                                    method: "DELETE",
                                    data: JSON.stringify(daneUsun)
                                }).then(function (data) {
                                    iwNotification.info(data.response.message);
                                    that.updateAdr();
                                });
                                this.set('selectedRowAdr', null);

                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case 'pokazArchiwizowane':
                            this.toArchive = !this.toArchive;
                            if (this.isGridSelectedUl || this.model.idUlicy !== null) {
                                var datasource = this.adresyGridFilter;
                                if (this.toArchive) {
                                    this.adresyDataSource.read({
                                        data: datasource
                                    });

                                    return;
                                }
                                this.adresyDataSource.read({
                                    data: _(datasource).filter(function (x) {
                                        return x.data_k === null;
                                    })
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "toArchiwum":
                            if (this.isGridSelectedAdr) {
                                if (!!this.selectedRowAdr.data_k) {
                                    iwNotification.error("Numer porządkowy posiada status archiwalny");
                                    return;
                                }
                                var daneToArch = {
                                    "adresId": that.selectedRowAdr.id
                                };
                                perunAjax.ajax({
                                    url: external.toArchiwum,
                                    method: "POST",
                                    data: JSON.stringify(daneToArch)
                                }).then(function (data) {
                                    iwNotification.info(data.response.message);
                                    that.updateAdr();
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "fromArchiwum":
                            if (this.isGridSelectedAdr) {
                                if (this.selectedRowAdr.data_k === null) {
                                    iwNotification.error("Numer porządkowy nie posiada statusu archiwalny");
                                    return;
                                }
                                var daneFromArch = {
                                    "adresId": that.selectedRowAdr.id
                                };
                                perunAjax.ajax({
                                    url: external.fromArchiwum,
                                    method: "POST",
                                    data: JSON.stringify(daneFromArch)
                                }).then(function (data) {
                                    iwNotification.info(data.response.message);
                                    that.updateAdr();
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "przepinajAdresy":
                            if (this.selectedRowAdr !== null) {
                                if (this.przepieciaAdresViewModel === null) {
                                    this.przepieciaAdresViewModel = przepieciaSzczegoly.create();
                                }
                                this.przepieciaAdresViewModel.updatePrzepiecia(this.selectedRowAdr, this.adresyGridFilter);
                                this.przepieciaAdresViewModel.show({
                                    parent: this,
                                    modal: "global",
                                    result: (result) => {
                                        if (result) {
                                            that.updateAdr();
                                        }
                                    }
                                });
                                this.set("selectedRowAdr", null);
                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "szczegolyListaDzBud":
                            if (this.isGridSelectedDzBud) {
                                if (this.listaDzBudViewModel === null) {
                                    this.listaDzBudViewModel = listaDzBud.create();
                                }
                                this.listaDzBudViewModel.updateDetails(this.selectedRowDzBud, this.selectedRowAdr);
                                this.listaDzBudViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać działkę/budynek powiązany z adresem");
                            break;
                        case "srodekSciana":
                            if (this.selectedRowDzBud !== null) {
                                this.changeEB(1, this.selectedRowDzBud.ewAdresId);
                                return;
                            }
                            iwNotification.info("Proszę wybrać działkę/budynek powiązany z adresem");
                            break;
                        case "srodekWejscie":
                            if (this.selectedRowDzBud !== null) {
                                this.changeEB(2, this.selectedRowDzBud.ewAdresId);
                                return;
                            }
                            iwNotification.info("Proszę wybrać działkę/budynek powiązany z adresem");
                            break;
                        case "srodekCiezkowosci":
                            if (this.selectedRowDzBud !== null) {
                                this.changeEB(3, this.selectedRowDzBud.ewAdresId);
                                return;
                            }
                            iwNotification.info("Proszę wybrać działkę/budynek powiązany z adresem");
                            break;
                        case "pokazListeXY":
                            this.listaXY = !this.listaXY;
                            this.pokazListaXY();
                            break;
                        case "usunEBAdres":
                            if (this.isGridSelectedDzBud) {
                                var daneUsunEw = {
                                    "ewAdresId": that.selectedRowDzBud.ewAdresId
                                };
                                perunAjax.ajax({
                                    url: external.usunEBAdres,
                                    method: "DELETE",
                                    data: JSON.stringify(daneUsunEw)
                                }).then(function (data) {
                                    iwNotification.info('Osadzenie punktu adresowego zostało usunięte.');
                                    that.updateListaDzBud();
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać działkę/budynek powiązany z adresem");
                            break;
                        case "dodNowWniosek":
                            if (this.selectedRowAdr === null) {
                                iwNotification.info("Proszę wybrać adres");
                                break;
                            }
                            var dodNowWniosekViewModel = dokPrzychDodaj.create();
                            iwAlert.createAndShow({
                                parent: this,
                                modal: "global",
                                html: "Wybierz w menu głównym opcję '+Dodaj', następnie ustaw jako rodzaj dokumentu:'Wniosek o nadanie nr adresowego' i zapisz. Nowy dokument pojawi sie w oknie 'Rejestr dokumentów przychodzących'.",
                                title: 'Informacja'
                            });
                            dodNowWniosekViewModel.showForSelect({
                                success: function (data) {
                                    if (viewModel.sprawaViewModel === null) {
                                        viewModel.sprawaViewModel = sprawa.create();
                                    }
                                    viewModel.sprawaViewModel.updateSprawa();
                                    viewModel.sprawaViewModel.show({
                                        parent: this,
                                        modal: "global",
                                        result: (result) => {
                                            var daneSprawa = {
                                                "adresId": viewModel.selectedRowAdr.id,
                                                "dokId": data.Id,
                                                "sprawaRok": result.sprawaRok,
                                                "prfxSprId": result.prfxSprId,
                                                "sprawaNr": result.sprawaNr,
                                                "dialog": false
                                            };
                                            perunAjax.ajax({
                                                url: external.wniosekDodaj,
                                                method: "POST",
                                                data: JSON.stringify(daneSprawa)
                                            }).then(function (data) {
                                                if (data.success) {
                                                    iwNotification.info("Wniosek został dodany pomyślnie");
                                                    that.updateAdr();

                                                    return;
                                                }
                                                iwNotification.error("Wystąpił błąd");
                                            });
                                        }
                                    });
                                }
                            });
                            break;
                        case "dodIstWniosek":
                            if (this.selectedRowAdr === null) {
                                iwNotification.info("Proszę wybrać adres");
                                break;
                            }
                            var dodIstWniosekViewModel = dokPrzychDodaj.create();
                            iwAlert.createAndShow({
                                parent: that,
                                modal: "global",
                                html: "Proszę wybrać z listy rozwijalnej 'Rodzaj':'Wniosek o nadanie nr adresowego', nacisnąć przycisk 'Zastosuj filtr' i wybrać dokument",
                                title: 'Informacja'
                            });
                            dodIstWniosekViewModel.showForSelect({
                                success: function (data) {
                                    if (viewModel.sprawaViewModel === null) {
                                        viewModel.sprawaViewModel = sprawa.create();
                                    }
                                    viewModel.sprawaViewModel.updateSprawa();
                                    viewModel.sprawaViewModel.show({
                                        parent: this,
                                        modal: "global",
                                        result: (result) => {
                                            var daneSprawa = {
                                                "adresId": viewModel.selectedRowAdr.id,
                                                "dokId": data.Id,
                                                "sprawaRok": result.sprawaRok,
                                                "prfxSprId": result.prfxSprId,
                                                "sprawaNr": result.sprawaNr,
                                                "dialog": false
                                            };
                                            perunAjax.ajax({
                                                url: external.wniosekDodaj,
                                                method: "POST",
                                                data: JSON.stringify(daneSprawa)
                                            }).then(function (data) {
                                                if (data.success) {
                                                    iwNotification.info("Wniosek został dodany pomyślnie");
                                                    that.updateAdr();

                                                    return;
                                                }
                                                iwNotification.error("Wystąpił błąd");
                                            });
                                        }
                                    });
                                }
                            });
                            break;
                        case "usunWniosek":
                            if (this.isGridSelectedAdr) {
                                if (this.selectedRowAdr.wniosek === null) {
                                    iwNotification.info("Adres nie posiada wniosku.");
                                    return;
                                }
                                var wniosekUsun = {
                                    "adresId": this.selectedRowAdr.id
                                };
                                perunAjax.ajax({
                                    url: external.wniosekUsun,
                                    method: "DELETE",
                                    data: JSON.stringify(wniosekUsun)
                                }).then(function (data) {
                                    iwNotification.info("Wniosek został odłączony");
                                    that.updateAdr();
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "dodNowZawiadomienie":
                            if (this.selectedRowAdr === null) {
                                iwNotification.info("Proszę wybrać adres");
                                break;
                            }
                            if (this.selectedRowAdr.sprawa === null) {
                                iwAlert.createAndShow({
                                    parent: that,
                                    modal: "global",
                                    html: "Brak numeru sprawy dla wybranego adresu",
                                    title: 'Informacja'
                                });
                                break;
                            }
                            iwAlert.createAndShow({
                                parent: this,
                                modal: "global",
                                html: "Wybierz w menu głównym opcję '+Dodaj', następnie ustaw jako rodzaj dokumentu:'Zawiadomienie o nadanie nr adresowego' i zapisz. Nowy dokument pojawi sie w oknie 'Rejestr dokumentów przychodzących'.",
                                title: 'Informacja'
                            });
                            this.dodajZawiadomienie();
                            break;
                        case "dodIstZawiadomienie":
                            if (this.selectedRowAdr === null) {
                                iwNotification.info("Proszę wybrać adres");
                                break;
                            }
                            if (this.selectedRowAdr.sprawa === null) {
                                iwAlert.createAndShow({
                                    parent: that,
                                    modal: "global",
                                    html: "Brak numeru sprawy dla wybranego adresu",
                                    title: 'Informacja'
                                });
                                break;
                            }
                            iwAlert.createAndShow({
                                parent: this,
                                modal: "global",
                                html: "Wybierz jako rodzaj dokumentu : 'Zawiadomienie o nadanie nr adresowego', naciśnij przycisk 'Zastosuj filtr' i wybierz dokument.",
                                title: 'Informacja'
                            });
                            this.dodajZawiadomienie();
                            break;
                        case "usunZawiadomienie":
                            if (this.isGridSelectedAdr) {
                                if (this.selectedRowAdr.zawiadomienie === null) {
                                    iwNotification.info("Adres nie posiada zawiadomienia.");
                                    return;
                                }
                                var zawiadomienieUsun = {
                                    "adresId": this.selectedRowAdr.id
                                };
                                perunAjax.ajax({
                                    url: external.zawiadomienieUsun,
                                    method: "DELETE",
                                    data: JSON.stringify(zawiadomienieUsun)
                                }).then(function (data) {
                                    iwNotification.info("Zawiadomienie zostało odłączone");
                                    that.updateAdr();
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "printZaswiadcz":
                            if (this.isGridSelectedAdr) {
                                if (this.selectedRowAdr.zawiadomienie === null) {
                                    iwAlert.createAndShow({
                                        parent: that,
                                        modal: "global",
                                        html: "Brak zawiadomienia dla adresu.",
                                        title: 'Uwaga'
                                    });
                                    break;
                                }
                                if (this.drukujZawiadViewModel === null) {
                                    this.drukujZawiadViewModel = drukujZawiadom.create();
                                }
                                this.drukujZawiadViewModel.update(this.selectedRowAdr.id);
                                this.drukujZawiadViewModel.show({
                                    parent: this,
                                    modal: "global"
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case"printZawiad":
                            if (this.isGridSelectedAdr) {
                                if (this.selectedRowAdr.zawiadomienie === null) {
                                    iwAlert.createAndShow({
                                        parent: that,
                                        modal: "global",
                                        html: "Brak zawiadomienia dla adresu.",
                                        title: 'Uwaga'
                                    });
                                    break;
                                }
                                var ReportFileGetter = new FileGetter({
                                    'url': settings.routes.emuia_blobsByZawiadIdJson
                                });
                                ReportFileGetter.send({
                                    'id': that.selectedRowAdr.id
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "pokazArchiwizowaneUl":
                            this.toArchive = !this.toArchive;
                            if (this.selectedMiejscowosc !== null) {
                                var datasourceUl = this.uliceGridFilter;
                                if (this.toArchive) {
                                    this.ulicaDataSource.read({
                                        data: datasourceUl
                                    });

                                    return;
                                }
                                this.ulicaDataSource.read({
                                    data: _(datasourceUl).filter(function (x) {
                                        return x.data_k === null;
                                    })
                                });

                                return;
                            }
                            iwNotification.info("Proszę wybrać miejscowość");
                            break;
                        case "szczegolyUlic":
                            if (this.isGridSelectedUl) {
                                if (this.szczegolyUlViewModel === null) {
                                    this.szczegolyUlViewModel = uliceSzczegoly.create();
                                }
                                this.szczegolyUlViewModel.show({
                                    parent: this,
                                    modal: "window"
                                });
                                this.updateSzczegolyUlica();

                                return;
                            }
                            iwNotification.info("Proszę wybrać ulicę");
                            break;
                        case "usunOsadzenieAdres":
                            if (this.isGridSelectedDzBud) {
                                if (this.selectedRowDzBud.wsp_x === null || this.selectedRowDzBud.wsp_y === null) {
                                    iwAlert.createAndShow({
                                        parent: that,
                                        modal: "global",
                                        html: 'Adres nie występuje na mapie.',
                                        title: 'Błąd'
                                    });
                                    break;
                                }
                                perunAjax.ajax({
                                    url: perunApi.getResourceAddress("emuia_adresEB_usun_osadzenie", this.selectedRowDzBud.ewAdresId),
                                    method: "PUT"
                                }).then(function (data) {
                                    that.updateListaDzBud();
                                    iwNotification.info('Usunięto osadzenie punktu adresowago.');
                                });
                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                        case "addOsadzenieAdres":
                            if (this.isGridSelectedDzBud) {
                                external.openMap();
                                viewModel.minimize();
                                external.activatePointAtMap({
                                    'clickCallback': function (objGeom) {
                                        if (that.selectedRowDzBud.dlkMslink !== null) {
                                            perunAjax.ajax({
                                                url: external.publicDzialkaSearch,
                                                method: "POST",
                                                data: JSON.stringify(objGeom)
                                            }).then(function (data) {
                                                viewModel.addAdressToMap.set('DzialkaId', data.response[0].dzialka_id);
                                            });
                                        }
                                        if (that.selectedRowDzBud.budMslink !== null) {
                                            perunAjax.ajax({
                                                url: external.publicBudynekSearch,
                                                method: "POST",
                                                data: JSON.stringify(objGeom)
                                            }).then(function (data) {
                                                viewModel.addAdressToMap.set('BudynekId', data.response[0].budynek_id);
                                            });
                                        }
                                        var coord = tools.parserGeoJSON(objGeom);
                                        setTimeout(function () {
                                            var addAdresData = {
                                                'AdresId': that.selectedRowDzBud.adres_id,
                                                'WspY': coord.coordinates[0],
                                                'WspX': coord.coordinates[1],
                                                'DzialkaId': that.addAdressToMap.DzialkaId,
                                                'BudynekId': that.addAdressToMap.BudynekId,
                                                'OpisK': that.addAdressToMap.OpisK,
                                                'Wkt': objGeom.geom
                                            };
                                            perunAjax.ajax({
                                                url: perunApi.getResourceAddress("emuia_adresEB_dodaj_osadzenie", that.selectedRowDzBud.adres_id),
                                                method: "PUT",
                                                data: JSON.stringify(addAdresData)
                                            }).then(function (data) {
                                                that.updateListaDzBud();
                                                iwNotification.info('Dodano adres do mapy.');
                                            });
                                            viewModel.restore();
                                            external.deactivatePointAtMap();
                                        }, 1000);
                                    }
                                });
                                if (that.selectedRowDzBud.dlkMslink !== null) {
                                    iwMap.showData(this.selectedRowDzBud.geomDlkWKT);
                                    that.addAdressToMap.set('BudynekId', null);
                                }
                                if (that.selectedRowDzBud.budMslink !== null) {
                                    iwMap.showData(this.selectedRowDzBud.geomBudWKT);
                                    that.addAdressToMap.set('DzialkaId', null);
                                }
                                return;
                            }
                            iwNotification.info("Proszę wybrać adres");
                            break;
                    }
                },
                selectedMiejscowoscFunction: function () {
                    if (this.mode === null) {
                        this.model.set('idMiejscowosc', this.selectedMiejscowosc.Id);
                    }
                    this.adresyDzBudDataSource.read({
                        data: []
                    });
                    this.adresyDataSource.read({
                        data: []
                    });
                    var that = this;
                    perunAjax.ajax({
                        url: settings.routes.emuia_ulicelist_getulicelist.replace("{miejscId}", this.model.idMiejscowosc),
                        method: "GET"
                    }).then(function (data) {
                        if (data.success) {
                            var ulice = [];
                            $.each(data.response, function (key, value) {
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
                updateAdr: function () {
                    var that = this;
                    if (this.isGridSelectedUl) {
                        this.model.set("idUlicy", this.selectedRowUl.id);
                    }
                    perunAjax.ajax({
                        url: settings.routes.emuia_adreslist_getadreslist.replace("{ulicaId}", this.model.idUlicy),
                        method: "GET"
                    }).then(function (data) {
                        $.each(data.response, function (key, value) {
                            if (value.emuia === "1") {
                                value.emuia = "EMUiA";
                            } else {
                                value.emuia = '';
                            }
                            if (value.status === "I") {
                                value.status = "Istniejący";
                            } else {
                                value.status = "Projektowany";
                            }
                        });
                        that.toArchive = false;
                        that.adresyGridFilter = data.response;
                        that.adresyDataSource.read({
                            data: _(data.response).filter(function (x) {
                                return x.data_k === null;
                            })
                        });
                    });
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
                updateSzczegoly: function () {
                    if (!this.onGridChangeAdresy || this.szczegolyAdresViewModel === null) {
                        return;
                    }
                    this.szczegolyAdresViewModel.updateDetails(this.selectedRowAdr);
                },
                updateSzczegolyListaDzBud: function () {
                    if (!this.onGridDzBudChangeAdresy || this.listaDzBudViewModel === null) {
                        return;
                    }
                    this.listaDzBudViewModel.updateDetails(this.selectedRowDzBud, this.selectedRowAdr);
                },
                onGridChangeUlice: function (e) {
                    this.set("isGridSelectedUl", true);
                    var grid = e.sender;
                    this.selectedRowUl = grid.dataItem(grid.select());
                    this.updateAdr();
                    this.adresyDzBudDataSource.read({
                        data: []
                    });
                    if (this.szczegolyUlViewModel !== null && !this.szczegolyUlViewModel.isWindowDisposed) {
                        this.updateSzczegolyUlica();
                    }
                    this.set('mode', null);
                },
                onGridDzBudChangeAdresy: function (e) {
                    this.set("isGridSelectedDzBud", true);
                    var grid = e.sender;
                    this.selectedRowDzBud = grid.dataItem(grid.select());
                    if (this.listaDzBudViewModel !== null && !this.listaDzBudViewModel.isWindowDisposed) {
                        this.updateSzczegolyListaDzBud();
                    }
                    this.set('mode', null);
                },
                onGridChangeAdresy: function (e) {
                    this.set("isGridSelectedAdr", true);
                    var grid = e.sender;
                    this.selectedRowAdr = grid.dataItem(grid.select());
                    if (this.szczegolyAdresViewModel !== null && !this.szczegolyAdresViewModel.isWindowDisposed) {
                        this.updateSzczegoly();
                    }
                    this.updateListaDzBud();
                    this.set('mode', null);
                },
                updateDodajAdres: function (miejscId, selectedMiejscowosc, ulicaId, ulicaNazwa) {
                    this.model.set('idUlicy', ulicaId);
                    this.model.set('idMiejscowosc', miejscId);
                    this.model.set('autocompleteUlice', ulicaNazwa);
                    this.set('mode', "singleChoice");
                    this.set('selectedMiejscowosc', selectedMiejscowosc);
                    this.selectedMiejscowoscFunction();
                    if (this.model.idUlicy !== null) {
                        this.updateAdr();
                    }
                    if (viewModel.isWindowDisposed) {
                        this.show();
                    }
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
                onDataBoundAdresy: function (e) {
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
                updateListaDzBud: function () {
                    var that = this;
                    perunAjax.ajax({
                        url: settings.routes.emuia_ewadreslist_ewadreslist4adres.replace("{adresId}", this.selectedRowAdr.id),
                        method: "GET"
                    }).then(function (data) {
                        var dane = [];
                        $.each(data.response, function (k, v) {
                            v.zmodyfikowal = v.zmodyfikowal + ' (' + v.data_modyf + ')';
                            v.utworzyl = v.utworzyl + ' (' + v.data_utworz + ')';
                            v.lp = k + 1;
                            if (!!v.wsp_x) {
                                v.wsp_x = tools.parseLength(v.wsp_x);
                            }
                            if (!!v.wsp_y) {
                                v.wsp_y = tools.parseLength(v.wsp_y);
                            }
                            dane.push(v);
                        });
                        that.listaXYData = dane;
                        that.adresyDzBudDataSource.read({
                            data: dane
                        });
                        that.listaXY = false;
                    });
                },
                changeEB: function (ebId, ewAdresId) {
                    var that = this;
                    var dane = {
                        "ebId": ebId,
                        "ewAdresId": ewAdresId
                    };
                    perunAjax.ajax({
                        url: external.changeEB,
                        method: "POST",
                        data: JSON.stringify(dane)
                    }).then(function (data) {
                        iwNotification.info("Element budynku reprezentujący punkt adresowy został zmieniony");
                        that.updateListaDzBud();
                    });
                },
                pokazListaXY: function () {
                    var dane = [];
                    $.each(viewModel.listaXYData, function (k, v) {
                        if (!!v.wsp_x && !!v.wsp_y) {
                            dane.push(v);
                        }
                    });
                    if (this.listaXY) {
                        this.adresyDzBudDataSource.read({
                            data: dane
                        });

                        return;
                    }
                    this.adresyDzBudDataSource.read({
                        data: viewModel.listaXYData
                    });
                },
                dodajZawiadomienie: function () {
                    var that = this;
                    var dodNowZawiadViewModel = dokPrzychDodaj.create();
                    dodNowZawiadViewModel.showForSelect({
                        success: function (data) {
                            var zawiadomieniDodaj = {
                                "adresId": that.selectedRowAdr.id,
                                "dokId": data.Id
                            };
                            perunAjax.ajax({
                                url: external.zawiadomienieDodaj,
                                method: "POST",
                                data: JSON.stringify(zawiadomieniDodaj)
                            }).then(function (data) {
                                iwNotification.info("Zawiadomienie zostało dodane");
                                that.updateAdr();
                            });
                        }
                    });
                },
                updateSzczegolyUlica: function () {
                    if (!this.isGridSelectedUl || this.szczegolyUlViewModel === null) {
                        return;
                    }
                    this.szczegolyUlViewModel.update(this.selectedRowUl.id);
                },
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
