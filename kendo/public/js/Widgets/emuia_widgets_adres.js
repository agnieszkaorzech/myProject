define(
    'emuia_widgets_adres',
    [
        'jquery',
        'underscore',
        'iw_kendo',
        'perun_api',
        'iw_console',
        'text!emuia_widgets_adres_html'
    ], function ($, _, iwKendo, perunApi, iwConsole, template) {

        "use strict";

        var kendo = iwKendo.kendo;

        var iwSearchAdresWidget = kendo.ui.Widget.extend({
            init: function (element, options) {
                var that = this;
                kendo.ui.Widget.fn.init.call(that, element, options);
                that.element.append(template);

                var $root = $(that.element);

                that.miejscId = 0;
                that.ulicaId = 0;

                that.$numerBud = $root.find(".iwSearchAdresWidgetNumerBud");
                that.$numerLok = $root.find(".iwSearchAdresWidgetNumerLok");
                that.$miejscowosc = $root.find(".iwSearchAdresWidgetMiejsc");
                that.$ulica = $root.find(".iwSearchAdresWidgetUlica");
                that.$kod = $root.find(".iwSearchAdresWidgetKod");
                that.$nieMa = $root.find(".iwSearchAdresWidgetNieMa");

                if (!_.contains(["global", "osrodek"], that.options.scope)) {
                    iwConsole.error("Nieprawidłowa wartość dla właciwości scope widgetu iwSearchAdresWidget", that.options.scope);
                }

                let changeProxy = $.proxy(that._change, that);

                that.miejscowosc = that.$miejscowosc.kendoComboBox({
                    dataSource: {
                        transport: {
                            read: {
                                type: "POST",
                                url: perunApi.getResourceAddress((that.options.scope === "global") ? "emuia_miejscowosc_autocomplete" : "emuia_miejscowosc_osrodek_autocomplete"),
                                dataType: "json",
                                contentType: "application/json"
                            },
                            parameterMap: function (data, type) {
                                return kendo.stringify(data);
                            }
                        },
                        serverFiltering: true
                    },
                    dataTextField: "Nazwa",
                    dataValueField: "Id",
                    filter: "startswith",
                    minLength: 3,
                    enforceMinLength: true,
                    template: '<span data-recordid="#= Id #"> #: Nazwa # #if(!!TerytSymbol) {#[#: TerytSymbol #]#} # #if(!!GminaNazwa) {#[#: GminaNazwa #]#} ##if(!!KrajNazwa) {#[#: KrajNazwa #]#} #</span>',
                    select: function (e) {
                        if ((e.dataItem || null) === null) {
                            return;
                        }
                        that.miejscId = e.dataItem.Id;
                        that._setUliceDataSource(that.miejscId);
                    },
                    change: function (e) {
                        var widget = e.sender;

                        if (widget.value() && widget.select() === -1) {
                            widget.suggest("");
                        }
                        that._change();
                    }
                }).data("kendoComboBox");

                that.ulica = that.$ulica.kendoComboBox({
                    dataTextField: "Nazwa",
                    dataValueField: "Id",
                    filter: "startswith",
                    minLength: 3,
                    enforceMinLength: true,
                    template: '<span data-recordid="#= Id #"> #= Nazwa #</span>',
                    select: function (e) {
                        if ((e.dataItem || null) === null) {
                            return;
                        }
                        that.ulicaId = e.dataItem.Id;
                    },
                    change: changeProxy
                }).data("kendoComboBox");

                that.kod = that.$kod.kendoMaskedTextBox({
                    mask: "00-000",
                    change: changeProxy
                }).data("kendoMaskedTextBox");

                that.$numerLok.bind("change", changeProxy);
                that.$numerBud.bind("change", changeProxy);

                that.$nieMa = $root.find(".iwSearchAdresWidgetNieMa");
                that.$nieMa.change(this._onNieMaChange.bind(this));
            },
            _setUliceDataSource(miejscId) {
                this.ulica.setDataSource(new kendo.data.DataSource({
                    transport: {
                        read: {
                            type: "POST",
                            url: perunApi.getResourceAddress("emuia_ulica_autocomplete", miejscId),
                            dataType: "json",
                            contentType: "application/json"
                        },
                        parameterMap: function (data, type) {
                            return kendo.stringify(data);
                        }
                    },
                    serverFiltering: true
                }));
            },
            _onNieMaChange: function () {
                var isChecked = this.$nieMa.is(":checked");
                if (isChecked) {
                    this.miejscowosc.value(null);
                    this.kod.value(null);
                    this.ulica.value(null);
                    this.$numerBud.val(null);
                    this.$numerLok.val(null);
                }
                this.miejscowosc.enable(!isChecked);
                this.ulica.enable(!isChecked);
                this.$kod.prop("disabled", isChecked);
                this.$numerBud.prop("disabled", isChecked);
                this.$numerLok.prop("disabled", isChecked);
                this._change();
            },
            _setValue: function (data) {
                if (data) {
                    this.$nieMa.prop("checked", false);
                    this.kod.value(data.kod || null);
                    this.$numerBud.val(data.numerBudynku || null);
                    this.$numerLok.val(data.numerLokalu || null);
                    this.miejscowosc.value(data.miejscowoscId || null);
                    this._setUliceDataSource(data.miejscowoscId || null);
                    this.ulica.value(data.ulicaId || null);
                } else {
                    if (data === null) {
                        this.$nieMa.prop("checked", true);
                    } else {
                        this.$nieMa.prop("checked", false);
                    }
                    this.miejscowosc.value('');
                    this.kod.value('');
                    this.ulica.value('');
                    this.$numerBud.val('');
                    this.$numerLok.val('');
                }
            }, _getValue: function () {
                var adres;
                if (this.$nieMa.is(":checked")) {
                    adres = null;
                } else {
                    adres = {
                        miejscowoscId: this.miejscowosc.value() || undefined,
                        miejscowoscNazwa: this.miejscowosc.text() || undefined,
                        kod: this.kod.value() || undefined,
                        ulicaNazwa: this.ulica.text() || undefined,
                        ulicaId: this.ulica.value() || undefined,
                        numerBudynku: this.$numerBud.val() || undefined,
                        numerLokalu: this.$numerLok.val() || undefined
                    };
                    let defined = false;
                    for (let prop in adres) {
                        if (adres.hasOwnProperty(prop)) {
                            if (adres[prop] !== undefined) {
                                defined = true;
                            }
                        }
                    }
                    if (!defined) {
                        adres = undefined;
                    }
                }
                return adres;
            }, value: function (data) {
                if (data !== undefined) {
                    return this._setValue(data);
                }
                return this._getValue();
            },
            events: [
                "change"
            ],
            _change: function () {
                this.trigger("change");
            },
            options: {
                name: 'iwSearchAdresWidget',
                width: 400,
                scope: "global"
            }
        });
        kendo.ui.plugin(iwSearchAdresWidget);
    });
