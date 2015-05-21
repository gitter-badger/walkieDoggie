angular.module('starter.services', ['firebase'])

.factory('Auth', ['$firebaseAuth', 'FBURL', '$state', function($firebaseAuth, FBURL, $state) {
  var ref = new Firebase(FBURL);
  var auth = $firebaseAuth(ref);
  return {
    register: function (user) {
      return auth.$createUser({
        email: user.email, 
        password: user.password
      })
    },
    login: function (user) {
      return auth.$authWithPassword({
        email: user.email, 
        password: user.password
      }).then(function(authData) {
          console.log("Nutzer " + authData.uid + " wurde eingeloggt");
          $state.go('tab.feed.alle');
          console.log("Weiterleitung auf den Feed");
      }).catch(function(error) {
          console.error("Authentication failed:", error);
      })
    },
    facebook: function() {
      return auth.$authWithOAuthPopup("facebook")
      .then(function(authData) {
          $state.go('tab.feed.alle');
          console.log(authData);
      }).catch(function(error) {
          console.error("Authentication failed:", error);
      })
    },
    logout: function () {
      return auth.$unauth();
    },
    getAuth: function() {
      return auth.$getAuth();
    }
  };
}])

.factory('User', ['$firebaseObject', '$firebaseArray', 'Auth', 'FBURL', function($firebaseObject, $firebaseArray, Auth, FBURL) {
  var ref = new Firebase(FBURL);
  var userRef = ref.child("users");
  return {
    all: function() {
      return $firebaseArray(userRef);
    },
    create: function(auth,userData) {
      return userRef.child(userData.uid).set(auth);
    },
    get: function(id) {
      if (id === undefined) {
        id = Auth.getAuth().uid;
      }
      return $firebaseObject(userRef.child(id));
    },
    save: function(user) {
      return user.$save();
    },
    userRef: userRef
  }
}])

.factory('Dog', ['$firebaseArray', 'User', 'FBURL', 'Auth', function($firebaseArray, User, FBURL,Auth) {
  var ref = new Firebase(FBURL);
  var dogRef = ref.child("dogs");
  return {
    all: function() {
      return $firebaseArray(dogRef);
    },
    add: function(dog, dogs) {
      return dogs.$add(dog).then(function(ref) {
         User.userRef.child(Auth.getAuth().uid).child("dogs").child(ref.key()).set(true);
      })
    }
  }
}]);

