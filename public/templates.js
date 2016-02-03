angular.module("configurationTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("directives/addItem.html","<div ng-switch on=\"showAddKey\" class=\"block\" >\n	<span ng-switch-when=\"true\">\n		<span ng-show=\"getType(key, child, $parent) == \'Object\'\">\n			<input placeholder=\"Name\" type=\"text\" ui-keyup=\"{\'enter\':\'addItem(key, child, $parent)\'}\"\n						 class=\"form-control input-sm addItemKeyInput\" ng-model=\"$parent.keyName\" /> :\n		</span>\n\n\n		<select ng-model=\"$parent.valueType\" ng-options=\"option for option in valueTypes\" class=\"form-control input-sm\" ng-init=\"$parent.valueType=\'\'+stringName+\'\'\" ui-keydown=\"{\'enter\':\'addItem(key, child, $parent)\'}\"></select>\n\n		<input ng-show=\"$parent.valueType == stringName\" type=\"text\" placeholder=\"Value\" class=\"form-control input-sm addItemValueInput\" ng-model=\"$parent.valueName\" ui-keyup=\"{\'enter\':\'addItem(key, child, $parent)\'}\"/>\n\n		<button class=\"btn btn-primary btn-sm\" ng-click=\"addItem(key, child, $parent)\">\n			Add\n		</button>\n		<button class=\"btn btn-default btn-sm\" ng-click=\"$parent.showAddKey=false\">\n			Cancel\n		</button>\n	</span>\n	<span ng-switch-default>\n		<button class=\"addObjectItemBtn\" ng-click=\"$parent.showAddKey = true\">\n			<i class=\"fa fa-plus\"></i>\n		</button>\n	</span>\n</div>");
$templateCache.put("directives/switchItem.html","<span ng-switch on=\"getType(key, val, child)\">\n	<json ng-switch-when=\"Object\" child=\"val\" type=\"object\" default-collapsed=\"defaultCollapsed\"></json>\n	<json ng-switch-when=\"Array\" child=\"val\" type=\"array\" default-collapsed=\"defaultCollapsed\"></json>\n\n	<span ng-switch-when=\"Boolean\" type=\"boolean\">\n		<input type=\"checkbox\" ng-model=\"val\" ng-model-onblur ng-change=\"child[key] = val\" ng-if=\"isConfig(key, child)\">\n		<span class=\"val\" ng-if=\"!isConfig(key, child)\">{{ val }}</span>\n	</span>\n	<span ng-switch-when=\"Number\" type=\"number\">\n		<input type=\"number\" ng-model=\"val\" ng-model-onblur ng-change=\"child[key] = val\" ng-if=\"isConfig(key, child)\">\n		<span class=\"val\" ng-if=\"!isConfig(key, child)\">{{ val }}</span>\n	</span>\n	<span ng-switch-default class=\"jsonLiteral\">\n		<input type=\"text\" ng-model=\"val\" placeholder=\"Empty\" ng-model-onblur ng-change=\"child[key] = possibleNumber(val)\"  ng-if=\"isConfig(key, child)\">\n		<span class=\"val\" ng-if=\"!isConfig(key, child)\">{{ val }}</span>\n	</span>\n</span>");
$templateCache.put("types/array.html","<i ng-click=\"toggleCollapse()\" class=\"fa\" ng-class=\"chevron\"></i>\n<div class=\"jsonContents\" ng-hide=\"collapsed\">\n	<ol class=\"arrayOl\" ui-sortable=\"sortableOptions\" ng-model=\"child\">\n		<li class=\"arrayItem\" ng-repeat=\"val in child track by $index\">\n			<span><switch-item></switch-item></span>\n		</li>\n	</ol>\n	<add-item></add-item>\n</div>");
$templateCache.put("types/object.html","<i ng-click=\"toggleCollapse()\" class=\"fa\" ng-class=\"chevron\" ng-if=\"!hideCollapse\"></i>\n<div class=\"jsonContents\" ng-hide=\"collapsed\">\n	<span class=\"block\" ng-repeat=\"(key, val) in child | skipAttributes\">\n		<span class=\"jsonObjectKey\">\n			<span class=\"key-name\" ng-model=\"newkey\" ng-init=\"newkey=key\">{{ key }}</span>\n			<!--<input class=\"keyinput\" type=\"text\" ng-model=\"newkey\" ng-init=\"newkey=key\" ng-blur=\"moveKey(child, key, newkey)\"/>-->\n			<i class=\"iconButton deleteKeyBtn fa fa-trash\" ng-click=\"deleteKey(key, child, $parent)\" ng-if=\"!child[\'$@\'+key][\'mandatory\']\"></i>\n\n			<i class=\"iconButton fa fa-question-circle\" tooltip-placement=\"left\" uib-tooltip=\"{{child[\'$@\'+key][\'description\']}}\" ng-if=\"child[\'$@\'+key][\'description\']\"></i>\n		</span>\n		<span class=\"jsonObjectValue\"><switch-item></switch-item></span>\n	</span>\n	<add-item></add-item>\n</div>");}]);