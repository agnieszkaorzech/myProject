define(
    'emuia_rejestr_ulic_okno_usunOs',
    [
        'jquery',
        'iw_kendo',
        'text!emuia_rejestr_ulic_okno_usunOs_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                result: false,
                show: function (result) {
                    iwKendo.windowViewModel.fn.show.call(this);
                    this.result = result;
                    $(".js-oknoPotwierdzenia").data("kendoiwworkplacewindow").center();
                },
                onClose: function () {
                    if (typeof(this.result) === 'function') {
                        this.result(false);
                    }
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                },
                onConfirm: function () {
                    if (typeof(this.result) === 'function') {
                        this.result(true);
                    }
                    viewModel.$root.data("kendoiwworkplacewindow").close();
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
