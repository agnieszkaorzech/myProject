define(
    'emuia_rejestr_adresow_sprawa',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_adresow_sprawa_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                result: null,
                title:'Sprawa',
                value: iwKendo.kendo.observable({
                    prfxSprId: null,
                    sprawaNr: null,
                    sprawaRok: null
                }),
                prefixSprawySlo: [
                    {Id: '292', Nazwa: 'GN-I.6812'}
                ],
                show: function (options = {}) {
                    iwKendo.windowViewModel.fn.show.call(this, options);
                    this.result = options.result;
                },
                updateSprawa: function () {
                    var dates = new Date();
                    var year = dates.getFullYear();
                    this.value.set('sprawaRok', year);
                    this.value.set('prfxSprId', 292);
                },
                onSave: function () {
                    var data = {
                        'prfxSprId': this.value.prfxSprId,
                        'sprawaNr': this.value.sprawaNr,
                        'sprawaRok': this.value.sprawaRok
                    };
                    if (typeof(viewModel.result) === 'function') {
                        viewModel.result(data);
                    }
                    this.onClearAndHide();
                },
                onClearAndHide: function () {
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                    this.value.set('prfxSprId', null);
                    this.value.set('sprawaNr', null);
                    this.value.set('sprawaRok', null);
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
