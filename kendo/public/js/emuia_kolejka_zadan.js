define(
    'emuia_kolejka_zadan',
    [
        'jquery',
        'iw_kendo',
        'perun_ajax',
        'emuia_settings',
        'text!emuia_kolejka_zadan_html',
        'css!emuia_css'
    ], function ($,
                 iwKendo,
                 perunAjax,
                 settings,
                 template) {

        "use strict";

        var external = {
            showTask: settings.routes.task_getTasks,
            removeTask: settings.routes.task_removeTasks
        };
        var create = function () {
            var viewModel = new iwKendo.windowViewModel({
                html: template,
                selectedMultipleRows: [],
                selectedRow: null,
                isGridSelected: false,
                kolejkaZadanDataSource: new iwKendo.kendo.data.DataSource({
                    transport: {
                        read: {
                            type: "POST",
                            url: external.showTask
                        }
                    },
                    batch: true,
                    schema: {
                        parse: function (response) {
                            var data = [];
                            $.each(response.response, function (key, value) {
                                if (value.taskType === 1) {
                                    value.taskType = 'Generowanie GML';
                                } else {
                                    return value.taskType;
                                }
                                switch (value.status) {
                                    case "1":
                                        value.status = 'Oczekujące';
                                        break;
                                    case "2":
                                        value.status = 'W trakcie realizacji';
                                        break;
                                    case "3":
                                        value.status = 'Zakończone sukcesem';
                                        break;
                                    case "4":
                                        value.status = 'Zakończone niepowodzeniem';
                                        break;
                                    case "5":
                                        value.status = 'Zadanie wygasło';
                                        break;
                                    case null:
                                        value.status = '-';
                                        break;
                                }
                                data.push(value);
                            });
                            return data;
                        }
                    }
                }),
                onOdswiezGrid: function () {
                    this.kolejkaZadanDataSource.read();
                },
                onUsun: function () {
                    var data = {
                        'taskIdArr': this.countSelectedRow()
                    };
                    perunAjax.ajax({
                        url: external.removeTask,
                        method: "POST",
                        dataType: "json",
                        data: JSON.stringify(data)
                    });
                    this.usunZaznaczoneWiersze();
                },
                usunZaznaczoneWiersze: function () {
                    var grid = viewModel.$root.find("[data-role='grid']").data("kendoGrid");
                    $.each(this.selectedMultipleRows, function (key, value) {
                        grid.removeRow(value);
                    });
                },
                countSelectedRow: function () {
                    var items = [];
                    var grid = viewModel.$root.find("[data-role='grid']").data("kendoGrid");
                    if (this.selectedMultipleRows.length > 0) {
                        for (var j = 0; j < this.selectedMultipleRows.length; j++) {
                            var item = grid.dataItem(this.selectedMultipleRows[j]);
                            items.push(item.id);
                        }
                    }

                    return items;
                },
                onGridChange: function (e) {
                    this.set("isGridSelected", true);
                    var grid = e.sender;
                    this.selectedMultipleRows = grid.select();
                    this.selectedRow = grid.dataItem(this.selectedMultipleRows);
                }
            });

            return viewModel;
        };

        return {
            create: create
        };
    });
