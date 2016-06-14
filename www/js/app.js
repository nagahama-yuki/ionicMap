// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova','firebase','ion-google-place','firebase','ngMap'])
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
.controller('mapCtrl', function ($scope, ShareData, $ionicModal, $ionicLoading, $cordovaProgress, $cordovaActionSheet, storageData, creditStorageData, $cordovaToast) {  

    //localStorage.clear();
    $scope.firstInit = function(){
        storageData.data = JSON.parse(localStorage.getItem('localData'));
        creditStorageData.data = JSON.parse(localStorage.getItem('localDataCredit'));
        $scope.checkExplain = JSON.parse(localStorage.getItem('checkExplain'));
        console.log(creditStorageData.data);
        console.log(storageData.data);
        console.log($scope.checkExplain);
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
                        ShareData.pickupLat = centerLat;
                        ShareData.pickupLng = centerLng;
                        pickupPosition = new plugin.google.maps.LatLng(centerLat, centerLng);
                        $cordovaToast.showShortTop('集荷場所を登録しました。').then(function(success) {}, function (error) {});
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
                        ShareData.dropoffLat = centerLats;
                        ShareData.dropoffLng = centerLngs;
                        $cordovaToast.showShortTop('配達場所を登録しました。').then(function(success) {}, function (error) {});
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

    $scope.exhide = function(){
        $("#first-ex").fadeOut();
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
.controller("detailCtrl", function($scope, ShareData, $ionicModal, $ionicSlideBoxDelegate, $ionicHistory, $rootScope, storageData, creditStorageData, $firebaseArray, NgMap){

    //ProgressIndicator.showDeterminateWithLabel(false, 10000, '計算しています...')
    $scope.ShareData = ShareData;
    $scope.detailUniqueData = storageData;
    $scope.detailUniqueCardData = creditStorageData;
    var checkExplains = {
      checkEX: "checked" 
    };
    localStorage.setItem('checkExplain', JSON.stringify(checkExplains));
    //Angular Fire
    var ref = new Firebase("https://fkhfaejfilejifencdjsjhfe.firebaseio.com");
    $scope.firebase = $firebaseArray(ref);
    
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
            ProgressIndicator.showDeterminateWithLabel(false, 10000, '計算しています...')
        }
    });


})
.controller("sendCtrl", function($scope, $cordovaActionSheet, ShareData, $ionicModal){

    var options = {
        title: 'What do you want with this image?',
        buttonLabels: ['この内容で送信'],
        addCancelButtonWithLabel: 'Cancel',
        androidEnableCancelButton : true,
        winphoneEnableCancelButton : true
    };

    $scope.sends = function(){

        $cordovaActionSheet.show(options).then(function(btnIndex) {
            if(btnIndex == 1){
                $scope.firesend();
                ProgressIndicator.showDeterminateWithLabel(true, 50000, '予約しています')
            }
        });
        
        $scope.firesend = function(){
            $scope.firebase.$add({
                from: {
                from_name: "長浜",
                from_address: ShareData.pickup,
                from_lat: ShareData.pickupLat,
                from_lng: ShareData.pickupLng
                },
                to: {
                    to_name: "久野",
                    to_address: ShareData.dropoff,
                    to_lat: ShareData.dropoffLat,
                    to_Lng: ShareData.dropoffLng
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
            $scope.sendModal.show()
        };

    };

  $ionicModal.fromTemplateUrl('sendModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.sendModal = modal;
  });

})
.controller("creditCtrl", function($scope, storageData, creditStorageData){
    
    $scope.uniqueCardData = creditStorageData;

    $scope.creditInit = function(){
        storageData.data = JSON.parse(localStorage.getItem('localData'));
        creditStorageData.data = JSON.parse(localStorage.getItem('localDataCredit'));
        console.log(creditStorageData.data);
        console.log(storageData.data);
        //$scope.uniqueData = storageData;
    };

    $scope.registration = function(){
        var localCreditDatas = {
          creditNum: $scope.credit.creditNum,
          creditName: $scope.credit.creditName,
          creditLine: $scope.credit.creditLine,
          creditCVV: $scope.credit.creditCVV
        };
        localStorage.setItem('localDataCredit', JSON.stringify(localCreditDatas));
        $scope.credit.hide()
        $scope.sessionCardData();
        console.log("ローカルに格納");
        $scope.creditInit();
    };

    $scope.deleteCredit = function(){
        localStorage.removeItem('localDataCredit');
        $scope.credit.hide()
        $scope.creditInit();
    };

    $scope.sessionCardData = function(){
        $scope.credit.creditNum = "";
        $scope.credit.creditName = "";
        $scope.credit.creditLine = "";
        $scope.credit.creditCVV = "";
    };

    $scope.creditHide = function(){
        $scope.credit.hide()
        $scope.sessionCardData();
    };

    $scope.$watch('credit.creditNum', function() {
        if($scope.credit.creditNum.length == 4 || $scope.credit.creditNum.length == 9 || $scope.credit.creditNum.length == 14){
            $scope.credit.creditNum = $scope.credit.creditNum + " ";
        } else if ($scope.credit.creditNum.length == 19){
            document.getElementById("creditNameValue").focus();
        }
    });

})
.controller('accountCtrl', function($scope, ShareData, $ionicModal, storageData, $cordovaToast){

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
                    $cordovaToast.showShortTop('アカウントを作成しました。' + responce.email + 'さんこんにちは。').then(function(success) {}, function (error) {});                
                },
                error: function(responce){
                    console.log("error");
                }
            });
        };
    };
})
.controller("loginCtrl", function($scope, $cordovaToast){

    $scope.logins = function(){
        var loginEmail = document.getElementById("logID").value;
        var loginPass = document.getElementById("logPass").value;
        $.ajax({
            url: "http://160.16.206.129:3000/sessions.json",
            type: 'POST',
            headers: {
                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
            },
            dataType: 'json',
            data: {
                email: loginEmail,
                password: loginPass
            },
            success: function(responce){
                console.log(responce);
                var localDatas = {
                  email: responce.email,
                  id: responce.id
                };
                localStorage.setItem('localData', JSON.stringify(localDatas));
                $scope.login.hide();
                $scope.firstInit();
                $cordovaToast.showShortTop('ログインしました。').then(function(success) {}, function (error) {});
            },
            error: function(responce){
                console.log("error");
            }
        });
    };

})
.controller("mypageCtrl", function($scope, $ionicModal, ShareData, storageData, $ionicPopup, $timeout){

    $scope.thisUniqueData = storageData;

  $ionicModal.fromTemplateUrl('myeditor.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.myeditor = modal;
  });

    $scope.edit = function(){
        var editName = document.getElementById("editName").value;
        var editTel = document.getElementById("editTel").value;
        var editAddress = document.getElementById("editAddress").value;
        if(editName == "" && editTel == "" && editAddress == ""){
            // An alert dialog
                var alertPopup = $ionicPopup.alert({
                    title: 'Attention!',
                    template: '空欄があります。'
                });
        } else {
            var confirmPopup = $ionicPopup.confirm({
             title: 'Are you OK?',
             template: 'この内容で送信しますか?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    $scope.ajaxEditor();
                } else {}
            });

            $scope.ajaxEditor = function(){
                $.ajax({
                    url: "http://160.16.206.129:3000/users/" + storageData.data.id + ".json",
                    type: 'PUT',
                    headers: {
                        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                    },
                    dataType: 'json',
                    data: {
                        user: {
                            username: editName,
                            tel: editTel,
                            address_1: editAddress
                        }
                    },
                    success: function(responce){
                        console.log("success");
                        var localDatas = {
                          email: storageData.data.email,
                          id: storageData.data.id,
                          username: editName,
                          tel: editTel,
                          address_1: editAddress
                        };
                        localStorage.setItem('localData', JSON.stringify(localDatas));
                        $scope.firstInit();
                        $scope.myeditor.hide();
                    },
                    error: function(responce){
                        console.log("error");
                    }
                });
            };
        }
    };
    
})
.controller("slideboxCtrl", function($scope, $ionicSlideBoxDelegate){
    $scope.next = function(){
        $ionicSlideBoxDelegate.next();
    };

    $scope.slideHasChanged = function(index) {
        $scope.slideIndex = index;
    };

})
.controller("logoutCtrl", function($scope, $ionicPopup, $cordovaToast){
    
    $scope.logout = function(){

        $scope.showConfirm = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: '本当にログアウトしますか?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    localStorage.clear();
                    $scope.firstInit();
                    $("#side-menu").animate({
                        left: "-70%"
                    },300);
                    $("#modal-cover").fadeOut(100);
                    $("#first-ex").css("display", "none");
                    $cordovaToast.showShortTop('ログアウトしました。').then(function(success) {}, function (error) {});
                } else {
                    console.log('You are not sure');
                }
            });
        };
        $scope.showConfirm();

    };

})
;

