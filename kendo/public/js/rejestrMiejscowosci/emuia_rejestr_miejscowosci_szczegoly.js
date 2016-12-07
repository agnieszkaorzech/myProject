define(
    'emuia_rejestr_miejscowosci_szczegoly',
    [
        'jquery',
        'iw_kendo',
        'emuia_settings',
        'perun_ajax',
        'perun_api',
        'emuia_tools',
        'text!emuia_rejestr_miejscowosci_szczegoly_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 settings,
                 perunAjax,
                 perunApi,
                 tools,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                isLoaded: true,
                data: null,
                title: "Szczegóły miejscowosci",
                update: function (id) {
                    var that = this;
                    perunAjax.ajax({
                        url: perunApi.getResourceAddress("emuia_szczegoly_miejscowosci", id),
                        method: "GET"
                    }).then(function (data) {
                        var obreby = [];
                        $.each(data.Obreby, function (key, value) {
                            obreby.push(value.Nazwa);
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
                        data.ObrebyString = obreby.join();
                        if (!!data.WaznyOd) {
                            data.WaznyOdString = tools.changeFormatDate(data.WaznyOd);
                        }
                        if (!!data.WaznyDo) {
                            data.WaznyDoString = tools.changeFormatDate(data.WaznyDo);
                        }
                        that.set('data', data);
                    });
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
