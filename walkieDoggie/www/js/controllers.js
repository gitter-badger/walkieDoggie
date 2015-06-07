angular.module('starter.controllers', [])

.controller('AuthCtrl', function($scope, $state, Auth, User) {

  $scope.auth = {};

  $scope.login = function() {
    Auth.login($scope.auth);
  };

  $scope.facebookConnect = function() {
    Auth.facebook();
  };

  $scope.register = function() {
    Auth.register($scope.auth).then(function(userData) {
      User.create($scope.auth, userData);
      Auth.login($scope.auth);
    });
  };

})

.controller('MitgliederCtrl', function($scope, $stateParams, User) {
  $scope.allUsers = User.all();
  if($stateParams.userId){
    $scope.user = User.get($stateParams.userId);
  }
})

// .controller('MitgliederDetailCtrl', function($scope, $stateParams, User) {
// 	$scope.mitglied = User.get($stateParams.mitgliedId);
// })

.controller('ProfilCtrl', function($rootScope, $scope, $stateParams, User, Dog, $ionicActionSheet, $cordovaCamera, $cordovaDatePicker) {

  // Profil
  $rootScope.user = User.get();
  $scope.editScope = {};
  $scope.isProfil = true;

  // Hunde Profil
  $scope.allDogs = Dog.all();
  $scope.dogDetail = function(dogId) {
    $scope.dog = Dog.get(dogId);
  }

  $scope.edit = function(originScope) {
    $scope.editScope = {};
    angular.forEach(originScope, function(value, key) {
      this[key] = value;
    }, $scope.editScope);
  }

  $scope.save = function(originScope) {
    angular.forEach($scope.editScope, function(value, key) {
      this[key] = value;
    }, originScope);
    User.save(originScope);
  }

  $scope.changePhoto = function() {

    var sourceType;
    
    $ionicActionSheet.show({
      buttons: [
        { text: 'Neues Bild aufnehmen' },
        { text: 'Bild auswählen' }
      ],
      titleText: 'Profilbild ändern',
      cancelText: 'Abbrechen',
      buttonClicked: function(index) {
        switch (index) {
          case 0 :
            sourceType = Camera.PictureSourceType.CAMERA;
            getPicture(sourceType);
            return true;
          case 1 :
            sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            getPicture(sourceType);
            return true;
          }
      }
    });
    
    function getPicture(sourceType) {
      var options = {
        quality : 70,
        destinationType : Camera.DestinationType.DATA_URL,
        sourceType : sourceType,
        allowEdit : true,
        correctOrientation: true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 100,
        targetHeight: 100,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.editUser.image = imageData;
      });
    };
  }

  $scope.datePicker = function() {
    var options = {
      date: new Date($scope.editUser.geburtsdatum),
      mode: 'date', // or 'time' // TIME HERE
      minDate: new Date() - 10000,
      allowOldDates: true,
      allowFutureDates: false,
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000'
    };

   $cordovaDatePicker.show(options).then(function (date) {
       $scope.editUser.geburtsdatum = date.toJSON();
   });
  }

})


.controller('MapCtrl', function($scope, $ionicLoading) {

        var myLatlng = new google.maps.LatLng(49.3716253, 9.1489621);
 
        var mapOptions = {
            center: myLatlng,
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.SATELLITE
			/*mapTypeId: google.maps.MapTypeId.ROADMAP*/
        };
 
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
 
        navigator.geolocation.getCurrentPosition(function(pos) {
            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                map: map,
                title: "My Location"
            });
        });
 
        $scope.map = map;
		
		$scope.refreshMap = function(){
			setTimeout(function(){
				var div = document.getElementById("map");
				reattachMap($scope.map,div);
			},1);
		}
		
		function reattachMap(map,div) {
		  if (!isDom(div)) {
			console.log("div is not dom");
			return map;
		  } else {
			map.set("div", div);

			while(div.parentNode) {
			  div.style.backgroundColor = 'rgba(0,0,0,0)';
			  div = div.parentNode;
			}

			return map;
		  }
		}

		function isDom(element) {
		  return !!element &&
				 typeof element === "object" &&
				 "getBoundingClientRect" in element;
		}
});
/*
.controller('MapCtrl', function($scope, $ionicLoading, $compile) {
      function initialize() {
        var myLatlng = new google.maps.LatLng(49.3716253, 9.1489621);
        
        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'DHBW'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      }
      google.maps.event.addDomListener(window, 'load', initialize);
      
      $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };
      
      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };
      
    });*/











