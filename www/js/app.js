// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova','firebase','ion-google-place'])
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
.factory('ShareData', function () {
    return {
    };
})
.factory('storageData', function () {
    return {
    };
})
.factory('creditStorageData', function () {
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
    .state('detail', {
      url: '/detail',
      templateUrl: 'detail.html',
      controller: 'detailCtrl'
    })
  ;

  $urlRouterProvider.otherwise("/");

})
.controller('mapCtrl', function ($scope, ShareData, $ionicModal, $ionicLoading, $cordovaProgress, $cordovaActionSheet, storageData, creditStorageData) {  

    //localStorage.clear();
    $scope.firstInit = function(){
        storageData.data = JSON.parse(localStorage.getItem('localData'));
        creditStorageData.data = JSON.parse(localStorage.getItem('localDataCredit'));
        console.log(creditStorageData.data);
        console.log(storageData.data);
        $scope.uniqueData = storageData;
    };

    //サイドメニュー
    $scope.sideMenuOpen = function(){
        $("#side-menu").animate({
            left: "0%"
        },300);
        $("#modal-cover").fadeIn(100);
    };

    //サイドメニュー閉じる
    $("#modal-cover").on("touchstart mousedown", function(){
        $("#side-menu").animate({
            left: "-70%"
        },300);
        $("#modal-cover").fadeOut(100);
    });

    //現在位置に移動「通常」
    $scope.nowLocation = function(){
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
    };

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
        $("#speedgogo-logo").addClass("active");
        map.animateCamera({
            "target": pickupPosition,
            "zoom": 15,
            "duration": 500
        });
    };

    $scope.doback = function(){
        $scope.firstcheck = "";
        $("#speedgogo-logo").removeClass("active");
        map.animateCamera({
            "target": pickupPosition,
            "zoom": 17,
            "duration": 500
        });
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

    $scope.placeModal = function(){
        $("#googlePlaceCover, .ion-google-place-container.modal").fadeIn(0).animate({
            top: "0%"
        },300);
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
                    location.href = "#/detail";
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
        $("#speedgogo-logo, #centerdropoff, #centerPindrop, #backBtn, #dropoffAction, #dropoffArea").fadeOut();
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

  $ionicModal.fromTemplateUrl('mypage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.mypage = modal;
  });

  $ionicModal.fromTemplateUrl('slidebox.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.slidebox = modal;
  });

  $ionicModal.fromTemplateUrl('credit.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.credit = modal;
  });

  $scope.$on('modal.shown', function() {
    $("#googlePlaceCover").fadeIn(0);
    $("#side-menu").animate({
        left: "-70%"
    },300);
    $("#modal-cover").fadeOut(100);
  });

  $scope.$on('modal.hidden', function() {
    $("#googlePlaceCover").fadeOut(0);
  });


})
.controller("detailCtrl", function($scope, ShareData, $ionicModal, $ionicSlideBoxDelegate, $ionicHistory, $rootScope, storageData, creditStorageData){

    $scope.ShareData = ShareData;
    $scope.detailUniqueData = storageData;
    //$scope.creditStorageData = JSON.parse(localStorage.getItem('localDataCredit'));
    $scope.creditData = creditStorageData;
    $scope.mapInit = function(){
        mapDrow(centerLat, centerLng);
        //mapDrow(33.67812656,134.4601305);
    };

    function mapDrow(lat, lng){
        //var myMapStyles = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"lightness":"6"}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]}];
        var myMapStyles = [{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"saturation":"-21"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"},{"hue":"#00b2ff"}]},{"featureType":"landscape.natural.landcover","elementType":"labels.text.fill","stylers":[{"saturation":"66"},{"hue":"#00ff78"}]},{"featureType":"landscape.natural.terrain","elementType":"labels.text.fill","stylers":[{"saturation":"26"},{"hue":"#00ff3f"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#28afe6"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"hue":"#009bff"},{"visibility":"on"},{"saturation":"20"},{"lightness":"79"},{"weight":"4.72"}]}];
        var pickuplatlng = new google.maps.LatLng(lat, lng);
        var option = {
            zoom : 15,
            center : pickuplatlng,
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            disableDoubleClickZoom: true,
            draggable: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            styles: myMapStyles
        };
        detailMaps = new google.maps.Map(document.getElementById("onMaps"), option);
    }

    $scope.slideNum = function(num){
        $ionicSlideBoxDelegate.slide(num);
        checkTab(num);
    };

    $scope.slideHasChanged = function(index) {
        checkTab(index);
    };


    function checkTab(n){
        if(n == 0){
            $("#tab0").addClass("active");
            $("#tab1,#tab2").removeClass("active");
        } else if (n == 1){
            $("#tab1").addClass("active");
            $("#tab0,#tab2").removeClass("active");
        } else {
            $("#tab2").addClass("active");
            $("#tab0,#tab1").removeClass("active");
        }
    }

    $scope.myGoBack = function() {
        $ionicHistory.goBack();
    };

  $ionicModal.fromTemplateUrl('credit.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.credit = modal;
  });

  $scope.$on('modal.shown', function() {
    $("#googlePlaceCovers").fadeIn(0);
  });

  $scope.$on('modal.hidden', function() {
    $("#googlePlaceCovers").fadeOut(0);
  });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if(toState.templateUrl == "detail.html"){
            detailMaps.panTo(new google.maps.LatLng(34.6784656,135.4601305));
        }
    });


})
.controller("creditCtrl", function($scope, creditStorageData){

    $scope.creditData = creditStorageData;

    $scope.$watch('credit.creditNumber', function() {
        var creditNumberValue = document.getElementById("creditNumber").value;
        if(creditNumberValue.length == 4 || creditNumberValue.length == 9 || creditNumberValue.length == 14){
            document.getElementById("creditNumber").value = creditNumberValue + " ";
        } else if(creditNumberValue.length == 19){
            document.getElementById("creditName").focus();
        }
    });

    $scope.creditCheck = function(status){
        $scope.credit.hide()
        if(status == "1"){
            $scope.credit.creditNumber = "";
            $scope.credit.creditName = "";
            $scope.credit.deadline = "";
            $scope.credit.creditCVV = "";
        } else if(status == "2"){
            $scope.credit.check = "checked";
            $scope.credit.creditNumber = "";
            $scope.credit.creditName = "";
            $scope.credit.deadline = "";
            $scope.credit.creditCVV = "";
            document.getElementById("creditNumber").value = "";
            document.getElementById("creditName").value = "";
            document.getElementById("deadline").value = "";
            document.getElementById("creditCVV").value = "";
            var localCreditDatas = {
              creditNum: $scope.credit.creditNumber,
              creditName: $scope.credit.creditName,
              creditLine: $scope.credit.deadline,
              creditCVV: $scope.credit.cvv
            };
            localStorage.setItem('localDataCredit', JSON.stringify(localCreditDatas));
            $scope.firstInit();
        }
    };

    $scope.reCredit = function(){
        console.log("re");
    };

    $scope.deleteCredit = function(){
        localStorage.removeItem('localDataCredit');
    };

})
.controller('accountCtrl', function($scope, ShareData, $ionicModal, storageData){

    $scope.checkId = function(){
        var uniqueId = document.getElementById("uniqueId").value;
        var stringPassword = document.getElementById("stringPassword").value;    

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
                url: "http://160.16.206.129:3000/sessions.json",
                type: 'POST',
                headers: {
                    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                data: {
                    email: uniqueId,
                    password: stringPassword
                },
                success: function(responce){
                    console.log(responce);
                    var localDatas = {
                      email: responce.email
                    };
                    localStorage.setItem('localData', JSON.stringify(localDatas));
                    $scope.account.hide();
                    $scope.mypage.show();
                    $scope.firstInit();
                },
                error: function(responce){
                    console.log("error");
                }
            });
        };
    };
})
.controller("loginCtrl", function($scope){
    $scope.login = function(){
        $.ajax({
            url: "http://160.16.206.129:3000/sessions.json",
            type: 'POST',
            headers: {
                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            },
            dataType: 'json',
            data: {
                email: "yuuki4104453@yahoo.co.jps",
                password: "yms8413555"
            },
            success: function(responce){
                console.log(responce);
                var localDatas = {
                  email: responce.email
                };
                localStorage.setItem('localData', JSON.stringify(localDatas));
                $scope.firstInit();
            },
            error: function(responce){
                console.log("error");
            }
        });
    };
})
.controller("mypageCtrl", function($scope, storageData){

    $scope.thisUniqueData = storageData;

})
.controller("slideboxCtrl", function($scope, $ionicSlideBoxDelegate){
    $scope.next = function(){
        $ionicSlideBoxDelegate.next();
    };

    $scope.slideHasChanged = function(index) {
        $scope.slideIndex = index;
    };

})
.controller("logoutCtrl", function($scope){
    $scope.logout = function(){
        $.ajax({
            url: "http://160.16.206.129:3000/sessions.json",
            type: 'DELETE',
            headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            },
            dataType: 'json',
            data: {
                email: "yuuki4104453@yahoo.co.jps",
                password: "yms8413555"
            },
            success: function(responce){
                console.log("success");
                $scope.login.show()
            }
            //error: function(responce){
            //    console.log("error");
                //localStorage.clear();
                //$scope.firstInit();
            //    $("#side-menu").animate({
            //        left: "-70%"
            //    },300);
            //    $("#modal-cover").fadeOut(100);
            //}
        });
    };
})
;


