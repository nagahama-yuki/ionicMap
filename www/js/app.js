// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova','firebase'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      //StatusBar.styleLightContent();
      StatusBar.styleDefault();
    }

    div = document.getElementById("map_canvas");
    map = plugin.google.maps.Map.getMap(div,{
        'camera': {
            'latLng': setPosition(33.5903035,130.3994934),
            'zoom': 16
        }
    });


    // Capturing event when Map load are ready.
    map.addEventListener(plugin.google.maps.event.MAP_READY, function(){
        var locateOption = {
            enableHighAccuracy: true      // Force GPS
        };
        map.getMyLocation(locateOption, onSuccess, onError);
        function onSuccess(position) {
            userPosition = setPosition(position.latLng.lat, position.latLng.lng);
            map.animateCamera({
                "target": userPosition,
                "zoom": 17,
                "duration": 1000
            });
        }
        function onError(error_msg) {
            //alert("位置情報を取得できませんでした。");
        }

    });

    // Function that return a LatLng Object to Map
    function setPosition(lat, lng) {
        return new plugin.google.maps.LatLng(lat, lng);
    }
  });
})
.factory('ShareData', function() {
    return {
    };
})
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home.html',
      controller: 'mapCtrl'
    })
    /*.state('detail', {
      url: '/detail',
      templateUrl: 'detail.html',
      controller: 'detailCtrl'
    })*/
    .state('feed', {
      url: '/feed',
      templateUrl: 'feed.html',
      controller: 'feedCtrl'
    })
    /*.state('options', {
      url: '/detail/options',
      templateUrl: 'options.html'
    })*/
  ;

  $urlRouterProvider.otherwise("/");

})
.controller('mapCtrl', function ($scope, ShareData, $ionicModal, $ionicLoading, $cordovaProgress, $cordovaActionSheet) {
    
    $scope.uniqueData = JSON.parse(localStorage.getItem('storageData'));
    //サイドメニュー
    $("#humberger").on("touchend mouseup", function(){
        $("#side-menu").animate({
            left: "0%"
        },300);
        $("#modal-cover").fadeIn(100);
    });

    //サイドメニュー閉じる
    $("#modal-cover").on("touchstart mousedown", function(){
        $("#side-menu").animate({
            left: "-70%"
        },300);
        $("#modal-cover").fadeOut(100);
    });

    //現在位置に移動「通常」
    var nowLocate = $(document.getElementById("nowLocate"));
    nowLocate.on("touchend mousedown", function(){
        var locateOption = {
            enableHighAccuracy: true      // Force GPS
        };
        map.getMyLocation(locateOption, onSuccess, onError);
        function onSuccess(position) {
            var nowPosition = new plugin.google.maps.LatLng(position.latLng.lat, position.latLng.lng);
            map.animateCamera({
                "target": nowPosition,
                "zoom": 17,
                "duration": 1000
            });
        }
        function onError(error_msg) {
            //alert("位置情報を取得できませんでした。");
        }
    });

    $scope.pickup = function(){
        ProgressIndicator.showSimpleWithLabel(false, 'Loading...')
        map.getCameraPosition(function(centerPosition) {
            centerLat = centerPosition.target.lat, centerLng = centerPosition.target.lng;
            $.ajax({
                url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + centerLat + "," + centerLng + "&sensor=true",
                data: {name: "long_name"},
                datatype: "json",
                    success: function(data){
                        var dataArray = data.results;
                        $scope.pickupAddress = dataArray[0].formatted_address.replace(/(\d+)/g, "").replace("日本, ", "").replace("-", "").replace("〒", "").replace(" ", "");
                        pickupAddress = dataArray[0].formatted_address.replace(/(\d+)/g, "").replace("日本, ", "").replace("-", "").replace("〒", "").replace(" ", "");
                        document.getElementById("pickupInner").value = pickupAddress;
                        ShareData.pickup = pickupAddress;
                        pickupPosition = new plugin.google.maps.LatLng(centerLat, centerLng);
                        ProgressIndicator.hide()
                    },
                    error: function(data){
                        ProgressIndicator.hide()
                        alert("住所の読み込みに失敗しました。");
                    }
            });
        });
        $("#pickupAction").fadeIn();
    };

    var pickupPosition;
    $scope.donext = function(){
        $scope.firstcheck = "checked";
        $("#humberger, #nowLocate, #speedgogo-logo").addClass("active");
        map.animateCamera({
            "target": pickupPosition,
            "zoom": 15,
            "duration": 500
        });
        /*$("#centerPickup, #centerPinpick").fadeOut(0);
        $("#pickupArea").animate({
            left: "-100%"
        },300);
        //$("#pickupArea, #pickupAction").delay(300).fadeOut(0);
        $("#dropoffAction, #centerdropoff, #dropoffArea, #centerPindrop, #backBtn").delay(300).fadeIn(0);
        map.animateCamera({
            "target": pickupPosition,
            "zoom": 15,
            "duration": 500
        });*/

    };

    $scope.doback = function(){
        $scope.firstcheck = "";
        $("#humberger, #nowLocate, #speedgogo-logo").removeClass("active");
        map.animateCamera({
            "target": pickupPosition,
            "zoom": 17,
            "duration": 500
        });
        /*$("#dropoffAction, #centerdropoff, #dropoffArea, #centerPindrop, #backBtn").fadeOut(0);
        $("#pickupArea").delay(300).animate({
            left: "5%"
        },300);
        $("#centerPickup, #centerPinpick").delay(300).fadeIn(0);
        map.animateCamera({
            "target": pickupPosition,
            "zoom": 17,
            "duration": 500
        });*/


    };

    $scope.dropoff = function(){
        ProgressIndicator.showSimpleWithLabel(false, 'Loading...')
        map.getCameraPosition(function(centerPosition) {
            centerLats = centerPosition.target.lat, centerLngs = centerPosition.target.lng;
            $.ajax({
                url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + centerLats + "," + centerLngs + "&sensor=true",
                data: {name: "long_name"},
                datatype: "json",
                    success: function(data){
                        var dataArray = data.results;
                        $scope.dropoffAddress = dataArray[0].formatted_address.replace(/(\d+)/g, "").replace("日本, ", "").replace("-", "").replace("〒", "").replace(" ", "");
                        dropoffAddress = dataArray[0].formatted_address.replace(/(\d+)/g, "").replace("日本, ", "").replace("-", "").replace("〒", "").replace(" ", "");
                        document.getElementById("dropoffInner").value = dropoffAddress;
                        ShareData.dropoff = dropoffAddress;
                        ProgressIndicator.hide()
                    },
                    error: function(data){
                        ProgressIndicator.hide()
                        alert("住所の読み込みに失敗しました。");
                    }
            });
        });
        $("#dropoffAction").fadeIn();
    };


    var option = {
        title: 'What do you want with this image?',
        buttonLabels: ['プレビュー', '詳細へ'],
        addCancelButtonWithLabel: 'Cancel',
        androidEnableCancelButton : true,
        winphoneEnableCancelButton : true
        //addDestructiveButtonWithLabel : 'Delete it'
      };

    function resultOptions(){
        $.ajax({
            url: "https://maps.googleapis.com/maps/api/directions/json?origin=" + pickupAddress + "&destination=" + dropoffAddress + "&key=AIzaSyChoHfe-ZUXo6TcHVBpL2_7mJuCLW34bks",
            data: {name: "route"},
            type: "GET",
            datatype: "json",
                success: function(data){
                    ShareData.distance = data.routes[0].legs[0].distance.text;
                    ShareData.time = data.routes[0].legs[0].duration.text;
                    var distance_mater = data.routes[0].legs[0].distance.value;
                    ShareData.price = Math.round(distance_mater * 0.3) + "円";
                    location.href = "#/feed";
                },
                error: function(data){
                    alert("計算できませんでした");
                }
        });
    }

    $scope.detailactionsheet = function() {
        $cordovaActionSheet.show(option).then(function(btnIndex) {
            var index = btnIndex;
            if(index == 1){
                $scope.preview();
            } else if (index == 2){
                resultOptions();
            } else {

            }
        });
    };


    //経路のプレビュー
    $scope.preview = function(){
        $("#humberger, #speedgogo-logo, #nowLocate, #centerdropoff, #centerPindrop, #backBtn, #dropoffAction, #dropoffArea").fadeOut();
        $("#praviewBack").fadeIn();
        bounds = [
            new plugin.google.maps.LatLng(centerLat, centerLng),
            new plugin.google.maps.LatLng(centerLats, centerLngs)
        ];
        map.animateCamera({
            "target": bounds,
            "duration": 1000,
        });
        ////////
        map.addMarker({
          "position": pickupPosition,
          "title": "荷物の集荷場所",
          "icon": {
            "url": "http://cargogo.jp/speedgogo/newspeedgogoIMG/to-start-marker.png",
            "size": {
              "width": 40,
              "height": 62
            }
          }
        });
        dropoffAddress = new plugin.google.maps.LatLng(centerLats, centerLngs);
        map.addMarker({
          "position": dropoffAddress,
          "title": "荷物の配達先",
          "icon": {
            "url": "http://cargogo.jp/speedgogo/newspeedgogoIMG/to-goal-marker.png",
            "size": {
              "width": 40,
              "height": 62
            }
          }  
        });
    };

    $scope.previewBack = function(){
        $("#praviewBack").fadeOut();
        $("#humberger, #speedgogo-logo, #nowLocate, #centerdropoff, #centerPindrop, #backBtn, #dropoffAction, #dropoffArea").fadeIn();
        map.animateCamera({
            "target": dropoffAddress,
            "zoom": 17,
            "duration": 500
        });
        map.clear();
        //map.off();
    };


  $ionicModal.fromTemplateUrl('account.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.account = modal;
  });
  
  $ionicModal.fromTemplateUrl('login.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.login = modal;
  });

  $ionicModal.fromTemplateUrl('inputbar.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.inputbar = modal;
  });

  $ionicModal.fromTemplateUrl('mypage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.mypage = modal;
  });

  $scope.$on('modal.shown', function() {
    $("#side-menu").animate({
        left: "-70%"
    },300);
    $("#modal-cover").fadeOut(100);
  });


})  
/*.controller('detailCtrl', function ($scope, ShareData, $cordovaActionSheet, $ionicHistory, $ionicModal) {

    //StatusBar.styleLightContent();
    $scope.ShareData = ShareData;

    $scope.myGoBack = function() {
        $ionicHistory.goBack();
        //StatusBar.styleDefault();
    };

    var option = {
        title: 'この内容で予約をしますか?',
        buttonLabels: ['宅配依頼'],
        addCancelButtonWithLabel: 'Cancel',
        androidEnableCancelButton : true,
        winphoneEnableCancelButton : true
        //addDestructiveButtonWithLabel : 'Delete it'
    };

      
    $scope.actionsheet = function(){
        $cordovaActionSheet.show(option).then(function(btnIndex) {
            var index = btnIndex;
        });
    };

  $ionicModal.fromTemplateUrl('option.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.option = modal;
  });

    $scope.showDatePicker = function(){
        var options = {
            date: new Date(),
            mode: "date",
            minDate: new Date() - 10000,
            doneButtonLabel: "決定",
            okText: "決定",
            locale: "ja",
            clearButton: true
        };
        function onSuccess(date) {
            document.getElementById("pickupDate").innerHTML = date.getMonth() + 1 + "月" + date.getDate() + "日";
            ShareData.pickupDate = date;
        }
        function onError(error) { // Android only
            alert('Error' + error);
            $scope.pickupDate = "";
        }
        datePicker.show(options, onSuccess, onError);
    };

    $scope.showTimePicker = function(){
        var options = {
            date: new Date(),
            mode: "time",
            doneButtonLabel: "決定",
            okText: "決定",
            minuteInterval: 10,
            locale: "ja",
            clearButton: true
        };
        function onSuccess(date) {
            document.getElementById("pickupTime").innerHTML = date.getHours() + "時" + date.getMinutes() + "分";
            ShareData.pickupTime = date;
        }
        function onError(error) { // Android only
            alert('Error' + error);
            $scope.pickupTime = "";
        }
        datePicker.show(options, onSuccess, onError);
    };
    

  

    
})
.controller('optionCtrl', function($scope){
    $scope.text = "テスト";
})*/
.controller('feedCtrl', function($scope, ShareData, $rootScope, $cordovaProgress, $cordovaActionSheet, $ionicModal, $firebaseArray){

    var ref = new Firebase("https://fkhfaejfilejifencdjsjhfe.firebaseio.com");
    $scope.reserveData = $firebaseArray(ref);

    var pickupmapDiv = "mapField";
    var dropoffmapDiv = "mapFieldsecond";
    var modalMap = "modalMap";
    
    $scope.mapInit = function() {

        $scope.onmap = function(locate, area){
            $.ajax({
                url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + locate + "&sensor=false",
                data: {name: "long_name"},
                datatype: "json",
                    success: function(data){
                        var dataArray = data.results;
                        geolocate = dataArray[0].geometry.location;
                        var option = {
                            zoom : 15,
                            center : new google.maps.LatLng(geolocate.lat, geolocate.lng),
                            mapTypeId : google.maps.MapTypeId.ROADMAP,
                            scrollwheel: false,
                            disableDoubleClickZoom: true,
                            draggable: false
                        };
                        //地図本体描画
                        var pickupLongMap = new google.maps.Map(document.getElementById(area), option);
                    },
                    error: function(data){
                        alert("住所の読み込みに失敗しました。");
                    }
            });
        };
        //ProgressIndicator.showDeterminate(false, 10000)
        //$scope.nowTime = new Date();
        var hours,minutes,ampm;
        function AmPmChecker(date) {
            hours = date.getHours();
            minutes = date.getMinutes();
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
        $scope.nowTimeCheck = AmPmChecker(new Date());
        $scope.ShareData = ShareData;
        $scope.onmap(pickupAddress, pickupmapDiv);
        $scope.onmap(dropoffAddress, dropoffmapDiv);
    
    };

    var option = {
        title: 'この内容で予約をしますか?',
        buttonLabels: ['宅配依頼'],
        addCancelButtonWithLabel: 'Cancel',
        androidEnableCancelButton : true,
        winphoneEnableCancelButton : true
        //addDestructiveButtonWithLabel : 'Delete it'
    }; 
    $scope.actionsheet = function(){
        $cordovaActionSheet.show(option).then(function(btnIndex) {
            var index = btnIndex;
            if(index == 1){
                $scope.addMessage();
            } else {
            }
        });
    };


    $scope.addMessage = function() {
        $scope.reserveData.$add({
            from: {
                from_name: "長浜",
                from_address: ShareData.pickup,
            },
            to: {
                to_name: "久野",
                to_address: dropoffAddress,
            },
            info: {
                distance: ShareData.distance,
                price: ShareData.price,
                time: ShareData.time,
                date: new Date().getTime(),
                date_real: new Date(new Date().getTime()).toLocaleString()
            },
            check: {
                flag: "one"
            }
        });
        $cordovaProgress.showDeterminateWithLabel(true, 50000, "宅配依頼中")
        setTimeout(success, 6000);
        setTimeout(successClose, 8000);
        function success(){
            $cordovaProgress.showSuccess(true, "Success!")
            setTimeout(sendModal,1000);
            function sendModal(){
                $scope.sendModal.show();
                $scope.onmap(pickupAddress, modalMap);
            }
        }
        function successClose(){
            $cordovaProgress.hide()
        }
    };

      $ionicModal.fromTemplateUrl('sendModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.sendModal = modal;
      });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if(toState.templateUrl == "feed.html"){
            $scope.mapInit();
        }
    });


})
.controller('accountCtrl', function($scope, ShareData, $ionicModal){

    $scope.checkId = function(){
        var uniqueId = document.getElementById("uniqueId").value;
        var stringPassword = document.getElementById("stringPassword").value;    
        /*if(uniqueId == "" || stringPassword == ""){
            console.log("j");
        } else {
            console.log("d");
        }*/
        $.ajax({
            url: 'http://160.16.206.129:3000/users',
            type: 'POST',
            dataType: 'json',
            data: {
                user: {
                    email: uniqueId,
                    password: stringPassword
                }
            },
            success: function(data){
                console.log(data);
                $scope.tokenData = data;
                tokenId = data.id;
                tokenEmail = data.email;
                tokenPass = data.crypted_password;
                $scope.token();
            },
            error: function(data){
                console.log("error");
            }
        });

        $scope.token = function(){
            $.ajax({
                url: 'http://160.16.206.129:3000/oauth/token.json',
                type: 'POST',
                dataType: 'json',
                data: {
                    grant_type: 'password',
                    client_id: 'fed3f93ef9efe5e62f2b2b58c07e893725461fb32fa6e6141d799d2db9eee495',
                    client_secret: '472c5a3d05752ad74bd2a1a038601994fb6ab9db91c69e76365c5bd2b0096c59',
                    username: tokenEmail,
                    password: stringPassword
                },
                success: function(data){
                    console.log(data);
                    accessToken = data.access_token;
                    $scope.lust();
                },
                error: function(data){
                    console.log("error");
                }
            });
        };

        $scope.lust = function(){
            $.ajax({
                url: 'http://160.16.206.129:3000/users' + '/' + tokenId + '?access_token=' + accessToken,
                type: 'GET',
                dataType: 'json',
                success: function(responce){
                    $scope.mypage.show();
                    $scope.account.hide();
                    console.log(responce);
                },
                error: function(responce){
                    console.log("error");
                }
                });
            };
        };

    $scope.nagahama = function(){
        var storageData = {
          email: 'a',
          name: 'b',
          address: 'c'
        };
        localStorage.setItem('storageData', JSON.stringify(storageData));
        //localData.data = JSON.parse(localStorage.getItem('storageData'));
    };    
})
;

