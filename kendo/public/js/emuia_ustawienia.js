define(
    'emuia_ustawienia',
    [
        'jquery',
        'iw_kendo',
        'emuia_rejestr_miejscowosci_przestrzenGML',
        'text!emuia_ustawienia_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 przestrzenGml,
                 template) {

        "use strict";

        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                przestrzenGmlViewModel: null,
                onCreateGmlViewWindow: function () {
                    if (this.przestrzenGmlViewModel === null) {
                        this.przestrzenGmlViewModel = przestrzenGml.create();
                    }
                    this.przestrzenGmlViewModel.update();
                    this.przestrzenGmlViewModel.show({
                        parent: this,
                        modal: "window"
                    });
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
