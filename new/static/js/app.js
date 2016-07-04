ZeroClipboard.config({trustedDomains: ["*"], "title": "Копировать"});
angular.module('app', [])
        .controller('MainCtrl', ['$scope', '$filter', '$interval', function ($scope, $filter, $interval) {
                $scope.$watch('[start,end]', function (newVals) {
                    if (!newVals || !newVals[0] || !newVals[1]) {
                        $('.resultfield').val(undefined);
                        return;
                    }
                    var start = newVals[0];
                    var end = newVals[1];
                    if (start.isAfter(end)) {
                        end.add(1, 'day');
                    }
                    $('.resultfield').val($filter('number')((parseInt(end.valueOf()) - parseInt(start.valueOf())) / 1000 / 60 / 60));
                });
                var interval;
                $scope.$watch(function () {
                    return getCookie('start_time_redmine');
                }, function (val) {
                    $scope.startDay = val;
                    interval && $interval.cancel(interval);
                    if (val != null) {
                        interval = $interval(function () {
                            $scope.left = $filter('number')(8 - ((moment().valueOf() - moment(val, 'HH:mm').valueOf()) / 1000 / 60 / 60));
                        }, 100);
                    }
                });
            }])
        .directive('clockpicker', ['$timeout', function ($timeout) {
                return {
                    restrict: 'E',
                    template: [
                        '<form><div class="input-group">',
                        '       <div ng-if="leftText" class="input-group-addon" style="width: 50px" ng-bind="leftText"></div>',
                        '	<input ng-class={resultfield:result} ng-model="test" type="text" class="form-control input-lg" placeholder="{{placeholder}}">',
                        '	<span ng-if="!result" class="input-group-addon">',
                        '		<span class="glyphicon glyphicon-time"></span>',
                        '	</span>',
                        '       <span ng-if="result" class="input-group-btn">',
                        '           <button data-clipboard-text="Copy Me!" class="btn btn-default clip_button" type="button" style="height:46px"><i class="fa icon-copy"></i></button>',
                        '       </span>',
                        '</div></form>'].join(''),
                    scope: {
                        leftText: '@',
                        now: '@',
                        result: '@',
                        model: '=',
                        getEnd: '=',
                        getStart: '=',
                        cookie: '@'
                    },
                    transclude: true,
                    link: function (scope, elem) {
                        scope.test = undefined;
                        if (!scope.result) {
                            if (scope.cookie && getCookie('prev_time_redmine')) {
                                setTimeout(function () {
                                    onComplete(moment(getCookie('prev_time_redmine'), 'HH:mm:ss:SSS').format('HH:mm:ss:S'));
                                    elem.find('input').val(moment(getCookie('prev_time_redmine'), 'HH:mm:ss:SSS').format('HH:mm:ss.S'));
                                });
                            }
                            elem.find('input').clockpicker({
                                autoclose: true,
                                placement: 'left',
                                afterDone: function (e) {
                                    onComplete(elem.find('input').val())
                                },
                                beforeHide: function (e) {
                                    if (elem.find('input').hasClass('ng-dirty') && scope.now && (elem.find('input').val().match(/:/g) || []).length > 1) {
                                        elem.find('input').removeClass('ng-dirty');
                                        updateTime();
                                    }
                                }
                            });
                            var SPMaskBehavior = function (val) {
                                return val.toString().charAt(0) == '2' ? '23:59' : '29:59';
                            };
                            elem.find('input').mask(SPMaskBehavior, {
                                onComplete: onComplete,
                                onChange: function () {
                                    scope.$apply(function () {
                                        scope.model = undefined;
                                    });
                                },
                                translation: {
                                    '2': {pattern: /[0-2]/},
                                    '3': {pattern: /[0-3]/},
                                    '5': {pattern: /[0-5]/},
                                    '9': {pattern: /[0-9]/}
                                },
                                onKeyPress: function (val, e, field, options) {
                                    field.mask(SPMaskBehavior.apply({}, arguments), options);
                                }});
                            function onComplete(time) {
                                scope.$apply(function () {
                                    scope.model = moment(time, "HH:mm:ss:SSS");
                                });
                            }

                            if (scope.now) {
                                updateTime();

                                function updateTime() {
                                    $timeout(function () {
                                        if (elem.find('input').hasClass('ng-dirty')) {
                                            return;
                                        }
                                        var m = moment();
                                        elem.find('input').val(m.format('HH:mm:ss.S'));
                                        onComplete(m.format('HH:mm:ss:SSS'));
                                        updateTime();
                                    }, 100);
                                }
                            }
                        } else {
                            scope.placeholder = 'Результат';
                            elem.find('input').attr('disabled', 'disabled');
                            $timeout(function () {
                                var client = new ZeroClipboard(elem.find('button'));
                                client.on("copy", function (event) {
                                    if (!elem.find('input').val())
                                        return;
                                    var clipboard = event.clipboardData;
                                    clipboard.setData("text/plain", elem.find('input').val());
                                    clipboard.setData("text/html", elem.find('input').val());
                                    bootbox.dialog({
                                        message: "Скопировано",
                                        backdrop: false,
                                        closeButton: false,
                                        className: 'copy_success'
                                    });
                                    setTimeout(bootbox.hideAll, 2000);
                                    setCookie('prev_time_redmine', scope.getEnd.format('HH:mm:ss:SSS'), {
                                        expires: scope.getEnd.endOf('day').toDate()
                                    });
                                    if (!getCookie('start_time_redmine')) {
                                        setCookie('start_time_redmine', scope.getStart.format('HH:mm'), {
                                            expires: scope.getStart.endOf('day').toDate()
                                        });
                                    }
                                });
                            });
                        }
                    }
                };
            }]);

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(name) {
    setCookie(name, "", {expires: -1})
}

