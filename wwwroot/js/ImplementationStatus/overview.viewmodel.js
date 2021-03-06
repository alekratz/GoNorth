(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(CompareDialog) {

            /**
             * Compare Dialog View Model
             * @class
             */
            CompareDialog.ViewModel = function()
            {
                this.isOpen = new ko.observable(false);
                this.objectName = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.markAsImplementedPromise = null;
                this.flagAsImplementedMethodUrlPostfix = null;

                this.doesSnapshotExists = new ko.observable(false);
                this.difference = new ko.observableArray();
            };

            CompareDialog.ViewModel.prototype = {
                /**
                 * Opens the compare dialog for an npc compare call
                 * 
                 * @param {string} id Id of the npc
                 * @param {string} npcName Name of the npc to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openNpcCompare: function(id, npcName) {
                    this.isOpen(true);
                    this.objectName(npcName ? npcName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagNpcAsImplemented?npcId=" + id;

                    return this.loadCompareResult("CompareNpc?npcId=" + id);
                },

                /**
                 * Opens the compare dialog for an item compare call
                 * 
                 * @param {string} id Id of the item
                 * @param {string} itemName Name of the item to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openItemCompare: function(id, itemName) {
                    this.isOpen(true);
                    this.objectName(itemName ? itemName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagItemAsImplemented?itemId=" + id;

                    return this.loadCompareResult("CompareItem?itemId=" + id);
                },

                /**
                 * Opens the compare dialog for a dialog compare call
                 * 
                 * @param {string} id Id of the dialog
                 * @param {string} dialogName Name of the dialog to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openDialogCompare: function(id, dialogName) {
                    this.isOpen(true);
                    this.objectName(dialogName ? dialogName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagDialogAsImplemented?dialogId=" + id;

                    return this.loadCompareResult("CompareDialog?dialogId=" + id);
                },

                /**
                 * Opens the compare dialog for a quest compare call
                 * 
                 * @param {string} id Id of the quest
                 * @param {string} questName Name of the quest to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openQuestCompare: function(id, questName) {
                    this.isOpen(true);
                    this.objectName(questName ? questName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagQuestAsImplemented?questId=" + id;

                    return this.loadCompareResult("CompareQuest?questId=" + id);
                },
                
                /**
                 * Opens the compare dialog for a marker compare call
                 * 
                 * @param {string} mapId Id of the map
                 * @param {string} markerId Id of the marker
                 * @param {string} markerType Type of the marker
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openMarkerCompare: function(mapId, markerId, markerType) {
                    this.isOpen(true);
                    this.objectName("");
                    this.flagAsImplementedMethodUrlPostfix = "FlagMarkerAsImplemented?mapId=" + mapId + "&markerId=" + markerId + "&markerType=" + markerType;

                    return this.loadCompareResult("CompareMarker?mapId=" + mapId + "&markerId=" + markerId + "&markerType=" + markerType);
                },


                /**
                 * Loads a compare result
                 * 
                 * @param {string} urlPostfix Postfix for the url
                 */
                loadCompareResult: function(urlPostfix) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    this.difference([]);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ImplementationStatusApi/" + urlPostfix, 
                        type: "GET"
                    }).done(function(compareResult) {
                        self.isLoading(false);
                        self.addExpandedObservable(compareResult.compareDifference);
                        self.doesSnapshotExists(compareResult.doesSnapshotExist);
                        if(compareResult.compareDifference)
                        {
                            self.difference(compareResult.compareDifference);
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.markAsImplementedPromise = new jQuery.Deferred();
                    return this.markAsImplementedPromise.promise();
                },

                /**
                 * Adds the expanded observable to all compare results
                 * 
                 * @param {object[]} compareResults Compare REsults to which the expanded observable must be added
                 */
                addExpandedObservable: function(compareResults) {
                    if(!compareResults)
                    {
                        return;
                    }

                    for(var curResult = 0; curResult < compareResults.length; ++curResult)
                    {
                        compareResults[curResult].isExpanded = new ko.observable(true);
                        this.addExpandedObservable(compareResults[curResult].subDifferences);
                    }
                },

                /**
                 * Toggles a compare result to be epanded or not
                 * 
                 * @param {object} compareResult Compare Result
                 */
                toggleCompareResultExpanded: function(compareResult) {
                    compareResult.isExpanded(!compareResult.isExpanded());
                },


                /**
                 * Marks the object for which the dialog is opened as implemented
                 */
                markAsImplemented: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ImplementationStatusApi/" + this.flagAsImplementedMethodUrlPostfix, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function() {
                        self.isLoading(false);
                        self.isOpen(false);

                        if(window.refreshImplementationStatusList)
                        {
                            window.refreshImplementationStatusList();
                        }

                        self.markAsImplementedPromise.resolve();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.isOpen(false);
                }
            };

        }(ImplementationStatus.CompareDialog = ImplementationStatus.CompareDialog || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Base Implementation for implementation status object list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusObjectList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                this.isInitialized = false;
                this.hasMarkerTypeRow = false;

                this.compareDialog = compareDialog;

                this.objects = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.currentPage = new ko.observable(0);

                this.isLoading = loadingObs;
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.errorOccured = errorOccuredObs;

                this.pageSize = 50;
            };

            Overview.ImplementationStatusObjectList.prototype = {
                /**
                 * Loads the objects
                 * 
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadObjects: function() {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                },

                /**
                 * Opens the compare
                 * 
                 * @param {object} obj Object to check
                 */
                openCompare: function(obj) {
                    var self = this;
                    this.openCompareDialog(obj).done(function() {
                        self.loadPage();
                    });
                },

                /**
                 * Opens the compare dialog for an object
                 * 
                 * @param {object} obj Object to check
                 * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openCompareDialog: function(obj) {

                },

                /**
                 * Builds the url for an object
                 * 
                 * @param {object} obj Object to open
                 * @returns {string}  Url of the object
                 */
                buildObjectUrl: function(obj) {

                },
                

                /**
                 * Initializes the list
                 */
                init: function() {
                    if(!this.isInitialized)
                    {
                        this.loadPage();
                        this.isInitialized = true;
                    }
                },

                /**
                 * Loads a page with objects
                 */
                loadPage: function() {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    this.loadObjects().done(function(data) {
                       self.objects(data.objects);
                       self.hasMore(data.hasMore);

                       self.resetLoadingState();
                    }).fail(function() {
                        self.errorOccured(true);
                        self.resetLoadingState();
                    });
                },

                /**
                 * Resets the loading state
                 */
                resetLoadingState: function() {
                    this.isLoading(false);
                    this.prevLoading(false);
                    this.nextLoading(false);
                },

                /**
                 * Loads the previous page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);
                    this.prevLoading(true);

                    this.loadPage();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    this.nextLoading(true);

                    this.loadPage();
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status npc list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusNpcList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusNpcList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusNpcList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KortistoApi/GetNotImplementedNpcs?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.flexFieldObjects,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusNpcList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openNpcCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusNpcList.prototype.buildObjectUrl = function(obj) {
                return "/Kortisto/Npc#id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status dialog list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusDialogList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusDialogList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusDialogList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/TaleApi/GetNotImplementedDialogs?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.dialogs,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusDialogList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openDialogCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusDialogList.prototype.buildObjectUrl = function(obj) {
                return "/Tale#npcId=" + obj.relatedObjectId;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status item list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusItemList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusItemList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusItemList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/StyrApi/GetNotImplementedItems?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.flexFieldObjects,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusItemList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openItemCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusItemList.prototype.buildObjectUrl = function(obj) {
                return "/Styr/Item#id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status quest list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusQuestList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusQuestList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusQuestList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/AikaApi/GetNotImplementedQuests?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.quests,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusQuestList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openQuestCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusQuestList.prototype.buildObjectUrl = function(obj) {
                return "/Aika/Quest#id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status marker list
             * 
             * @param {object} markerTypes Marker types Lookup Object to marker names for passing to karta
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusMarkerList = function(markerTypes, loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);

                this.markerTypes = markerTypes;
                this.hasMarkerTypeRow = true;
            };

            Overview.ImplementationStatusMarkerList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusMarkerList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/KartaApi/GetNotImplementedMarkers?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.markers,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusMarkerList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openMarkerCompare(obj.mapId, obj.id, obj.type);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusMarkerList.prototype.buildObjectUrl = function(obj) {
                var zoomOnMarkerParam = "&zoomOnMarkerType=" + this.markerTypes[obj.type] + "&zoomOnMarkerId=" + obj.id;
                return "/Karta#id=" + obj.mapId + zoomOnMarkerParam;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /// List Type for npcs
            var listTypeNpc = 0;

            /// List Type for dialogs
            var listTypeDialog = 1;

            /// List Type for items
            var listTypeItem = 2;

            /// List Type for quests
            var listTypeQuest = 3;

            /// List Type for marker
            var listTypeMarker = 4;

            /**
             * Overview View Model
             * @param {object} nonLocalizedMarkerTypes Non Localized Marker Types
             * @param {object} markerTypes Marker Types
             * @class
             */
            Overview.ViewModel = function(nonLocalizedMarkerTypes, markerTypes)
            {
                this.markerTypes = markerTypes;

                this.compareDialog = new ImplementationStatus.CompareDialog.ViewModel();

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false); 

                this.currentListToShow = new ko.observable(-1);
                this.isNpcListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeNpc;
                }, this);
                this.isDialogListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeDialog;
                }, this);
                this.isItemListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeItem;
                }, this);
                this.isQuestListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeQuest;
                }, this);
                this.isMarkerListSelected = new ko.computed(function() {
                    return this.currentListToShow() == listTypeMarker;
                }, this);

                this.npcList = new Overview.ImplementationStatusNpcList(this.isLoading, this.errorOccured, this.compareDialog);
                this.dialogList = new Overview.ImplementationStatusDialogList(this.isLoading, this.errorOccured, this.compareDialog);
                this.itemList = new Overview.ImplementationStatusItemList(this.isLoading, this.errorOccured, this.compareDialog);
                this.questList = new Overview.ImplementationStatusQuestList(this.isLoading, this.errorOccured, this.compareDialog);
                this.markerList = new Overview.ImplementationStatusMarkerList(nonLocalizedMarkerTypes, this.isLoading, this.errorOccured, this.compareDialog);

                // Select first list user has access to
                if(GoNorth.ImplementationStatus.Overview.hasKortistoRights)
                {
                    this.selectNpcList();
                }
                else if(GoNorth.ImplementationStatus.Overview.hasTaleRights)
                {
                    this.selectDialogList();
                }
                else if(GoNorth.ImplementationStatus.Overview.hasStyrRights)
                {
                    this.selectItemList();
                }
                else if(GoNorth.ImplementationStatus.Overview.hasAikaRights)
                {
                    this.selectQuestList();
                }
                else if(GoNorth.ImplementationStatus.Overview.hasKartaRights)
                {
                    this.selectMarkerList();
                }
            };

            Overview.ViewModel.prototype = {
                /**
                 * Selects the npc list
                 */
                selectNpcList: function() {
                    this.currentListToShow(listTypeNpc);
                    this.npcList.init();
                },

                /**
                 * Selects the dialog list
                 */
                selectDialogList: function() {
                    this.currentListToShow(listTypeDialog);
                    this.dialogList.init();
                },

                /**
                 * Selects the item list
                 */
                selectItemList: function() {
                    this.currentListToShow(listTypeItem);
                    this.itemList.init();
                },

                /**
                 * Selects the quest list
                 */
                selectQuestList: function() {
                    this.currentListToShow(listTypeQuest);
                    this.questList.init();
                },

                /**
                 * Selects the marker list
                 */
                selectMarkerList: function() {
                    this.currentListToShow(listTypeMarker);
                    this.markerList.init();
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));