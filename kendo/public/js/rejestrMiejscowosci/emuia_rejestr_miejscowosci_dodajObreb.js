define(
    'emuia_rejestr_miejscowosci_dodajObreb',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_miejscowosci_dodajObreb_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 html) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: html,
                isVisibleMultiselect: true,
                isEnabled: true,
                obrebySelected: null,
                addRow: [],
                slownikObreby: [],
                windowClose:function () {
                    this.set('obrebySelected',null);
                },
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.addRow = options.addRow;
                },
                updateSlownikObreb: function (sloObreby) {
                    this.set('slownikObreby', this.editObreb(sloObreby));
                },
                onDodajObreb: function () {
                    if (typeof(this.addRow) === 'function') {
                        this.addRow(this.obrebySelected);
                    }
                    viewModel.hide();
                },
                editObreb: function (data) {
                    var obreby = [];
                    var obiektObreby = {};
                    for (var j = 0; j < data.length; j++) {
                        for (var i = 0; i < data[j].Obreby.length; i++) {
                            var obrebyInfo = data[j].Obreby[i];
                            obiektObreby[i] = {
                                'Id': obrebyInfo.Id,
                                'Nazwa': obrebyInfo.Nazwa,
                            };
                            obreby.push(obiektObreby[i]);
                        }
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
