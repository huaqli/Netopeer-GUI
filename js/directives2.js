'use strict';

var counts = {
  object: 0
};

angular.module('JSONedit', ['ui.sortable', 'ui.bootstrap'])
.directive('ngModelOnblur', function() {
    // override the default input to update on blur
    // from http://jsfiddle.net/cn8VF/
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;
            
            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(elm.val());
                });         
            });
        }
    };
})
.directive('json', ["$compile", "$log", function($compile, $log) {
  return {
    restrict: 'E',
    scope: {
      child: '=',
      type: '@',
      defaultCollapsed: '='
    },
    link: function(scope, element, attributes) {
        var stringName = "Text";
        var objectName = "Object";
        var arrayName = "Array";
        var numberName = "Number";
        var urlName = "Url";
        var refName = "Reference";
        var boolName = "Boolean";
        var literalName = "Literal";

        //scope.valueTypes = [stringName, objectName, arrayName, numberName, urlName, refName, boolName, literalName];
        scope.valueTypes = [stringName, objectName, arrayName, refName, boolName];
        scope.sortableOptions = {
            axis: 'y'
        };
        if (scope.$parent.defaultCollapsed === undefined) {
            scope.collapsed = false;
        } else {
            scope.collapsed = scope.defaultCollapsed;
        }
        if (scope.collapsed) {
            scope.chevron = "glyphicon-menu-right";
        } else {
            scope.chevron = "glyphicon-menu-down";
        }
        

        //////
        // Helper functions
        //////
        var isNumberType = function(type) {
            return type.indexOf('int') >= 0;
        };

        var isUrlType = function(type) {
            return type === "inet:uri";
        };

        var getType = function(obj) {
            // get custom yang datatype
            var type = Object.prototype.toString.call(obj);

            if (type === "[object Object]") {
                return objectName;
            } else if(type === "[object Array]"){
                return arrayName;
            }

            if (typeof obj['@type'] !== "undefined") {
                type = obj['@type'];
            }

            if(type === "Boolean" || type === "[object Boolean]"){
                return boolName;
            } else if(isNumberType(type) || type === "[object Number]"){
                // TODO: check range
                return numberName;
            } else {
                return literalName;
            }
        };
        var isNumber = function(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        };
        scope.getType = function(obj) {
            return getType(obj);
        };

        var editBarVisible = function(obj) {
            if (typeof obj['@type'] !== "undefined") {
                var type = obj['@type'];
                return (type == "list" || type == "leaf-list" || type == "container");
            }

            return false;
        };
        scope.editBarVisible = function(obj) {
            return editBarVisible(obj);
        };
        scope.toggleCollapse = function() {
            if (scope.collapsed) {
                scope.collapsed = false;
                scope.chevron = "glyphicon-menu-down";
            } else {
                scope.collapsed = true;
                scope.chevron = "glyphicon-menu-right";
            }
        };
        scope.moveKey = function(obj, key, newkey) {
            //moves key to newkey in obj
            if (key !== newkey) {
                obj[newkey] = obj[key];
                delete obj[key];
            }
        };
        scope.deleteKey = function(obj, key) {
            if (getType(obj) == "Object") {
                if( confirm('Delete "'+key+'" and all it contains?') ) {
                    delete obj[key];
                }
            } else if (getType(obj) == "Array") {
                if( confirm('Delete "'+obj[key]+'"?') ) {
                    obj.splice(key, 1);
                }
            } else {
                console.error("object to delete from was " + obj);
            }
        };
        scope.addItem = function(obj) {
            if (getType(obj) == "Object") {
                // check input for key
                if (scope.keyName == undefined || scope.keyName.length == 0){
                    alert("Please fill in a name");
                } else if (scope.keyName.indexOf("$") == 0){
                    alert("The name may not start with $ (the dollar sign)");
                } else if (scope.keyName.indexOf("_") == 0){
                    alert("The name may not start with _ (the underscore)");
                } else {
                    if (obj[scope.keyName]) {
                        if( !confirm('An item with the name "'+scope.keyName
                            +'" exists already. Do you really want to replace it?') ) {
                            return;
                        }
                    }
                    // add item to object
                    switch(scope.valueType) {
                        case stringName: obj[scope.keyName] = scope.valueName ? scope.possibleNumber(scope.valueName) : "";
                                        break;
                        case objectName:  obj[scope.keyName] = {};
                                        break;
                        case arrayName:   obj[scope.keyName] = [];
                                        break;
                        case refName: obj[scope.keyName] = {"Reference!!!!": "todo"};
                                        break;
                        case boolName: obj[scope.keyName] = false;
                                        break;
                    }
                    //clean-up
                    scope.keyName = "";
                    scope.valueName = "";
                    scope.showAddKey = false;
                }
            } else if (getType(obj) == "Array") {
                // add item to array
                switch(scope.valueType) {
                    case stringName: obj.push(scope.valueName ? scope.valueName : "");
                                    break;
                    case objectName:  obj.push({});
                                    break;
                    case arrayName:   obj.push([]);
                                    break;
                    case boolName:   obj.push(false);
                                    break;
                    case refName: obj.push({"Reference!!!!": "todo"});
                                    break;
                }
                scope.valueName = "";
                scope.showAddKey = false;
            } else {
                console.error("object to add to was " + obj);
            }
        };
        scope.possibleNumber = function(val) {
            return isNumber(val) ? parseFloat(val) : val;
        };

        //////
        // Template Generation
        //////

        // Note:
        // sometimes having a different ng-model and then saving it on ng-change
        // into the object or array is necessary for all updates to work
        
        // recursion
        var switchTemplate = 
            '<span ng-switch on="getType(val)" >'
                + '<json ng-switch-when="Object" child="val" type="object" default-collapsed="defaultCollapsed"></json>'
                + '<json ng-switch-when="Array" child="val" type="array" default-collapsed="defaultCollapsed"></json>'
                + '<span ng-switch-when="Boolean" type="boolean">'
                    + '<input type="checkbox" ng-model="val" ng-model-onblur ng-change="child[key] = val">'
                + '</span>'
                + '<span ng-switch-when="Number" type="number">'
                    + '<input type="number" ng-model="val" ng-model-onblur ng-change="child[key] = val">'
                + '</span>'
                + '<span ng-switch-default class="jsonLiteral"><input type="text" ng-model="val" '
                    + 'placeholder="Empty" ng-model-onblur ng-change="child[key] = possibleNumber(val)"/>'
                + '</span>'
            + '</span>';
        
        // display either "plus button" or "key-value inputs"
        var addItemTemplate = 
        '<div ng-switch on="showAddKey" class="block" >'
            + '<span ng-switch-when="true">';
                if (scope.type == "object"){
                   // input key
                    addItemTemplate += '<input placeholder="Name" type="text" ui-keyup="{\'enter\':\'addItem(child)\'}" '
                        + 'class="form-control input-sm addItemKeyInput" ng-model="$parent.keyName" /> ';
                }
                addItemTemplate += 
                // value type dropdown
                '<select ng-model="$parent.valueType" ng-options="option for option in valueTypes" class="form-control input-sm"'
                    + 'ng-init="$parent.valueType=\''+stringName+'\'" ui-keydown="{\'enter\':\'addItem(child)\'}"></select>'
                // input value
                + '<span ng-show="$parent.valueType == \''+stringName+'\'"> : <input type="text" placeholder="Value" '
                    + 'class="form-control input-sm addItemValueInput" ng-model="$parent.valueName" ui-keyup="{\'enter\':\'addItem(child)\'}"/></span> '
                // Add button
                + '<button class="btn btn-primary btn-sm" ng-click="addItem(child)">Add</button> '
                + '<button class="btn btn-default btn-sm" ng-click="$parent.showAddKey=false">Cancel</button>'
            + '</span>'
            + '<span ng-switch-default>'
                // plus button
                + '<button class="addObjectItemBtn" ng-click="$parent.showAddKey = true"><i class="glyphicon glyphicon-plus"></i></button>'
            + '</span>'
        + '</div>';
    
        // start template
        if (scope.type == "object"){
            var template = '';
            if (counts.object++ > 0) {
                template += '<i ng-click="toggleCollapse()" class="glyphicon" ng-class="chevron"></i>';
            }
            template = template
            //+ '<span class="jsonItemDesc">'+objectName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                // repeat
                + '<span class="block" ng-repeat="(key, val) in child | skipAttributes">'
                    // object key
                    + '<span class="jsonObjectKey">'
                        + '<input class="keyinput" type="text" ng-model="newkey" ng-init="newkey=key" '
                            + 'ng-blur="moveKey(child, key, newkey)"/>'
                        // delete button
                        + '<i class="iconButton deleteKeyBtn glyphicon glyphicon-trash" ng-click="deleteKey(child, key)" ng-if="!child[\'$@\'+key][\'mandatory\']"></i>'
                        // info button
                        + '<i class="iconButton glyphicon glyphicon-info-sign" tooltip-placement="left" uib-tooltip="{{child[\'$@\'+key][\'description\']}}" ng-if="child[\'$@\'+key][\'description\']"></i>'
                    + '</span>'
                    // object value
                    + '<span class="jsonObjectValue">' + switchTemplate + '</span>'
                + '</span>'
                // repeat end
                + addItemTemplate
            + '</div>';
        } else if (scope.type == "array") {
            var template = ''
            +  '<i ng-click="toggleCollapse()" class="glyphicon"'
            + 'ng-class="chevron"></i>'
            //+ '<span class="jsonItemDesc">'+arrayName+'</span>'
            + '<div class="jsonContents" ng-hide="collapsed">'
                + '<ol class="arrayOl" ui-sortable="sortableOptions" ng-model="child">'
                    // repeat
                    + '<li class="arrayItem" ng-repeat="val in child track by $index">'
                        + '<span>' + switchTemplate + '</span>'
                    + '</li>'
                    // repeat end
                + '</ol>'
                + addItemTemplate
            + '</div>';
        } else {
            console.error("scope.type was "+ scope.type);
        }

        var newElement = angular.element(template);
        $compile(newElement)(scope);
        element.replaceWith ( newElement );
    }
  };
}])
.filter('skipAttributes', function() {
    return function(items) {
        var result = {};
        angular.forEach(items, function(value, key) {
            if (key.indexOf('@') !== 0) {
                result[key] = value;
            }
        });
        return result;
    };
});
