angular.module('app')
.controller('ShowsCtrl', ['$scope',
  function ShowsCtrl($scope) {
    $scope.loading = true;
    $scope.fetching = false;

    $scope.requestItemsBy = 50;
    $scope.total = Infinity;
    $scope.tvshows = [];

    function onTvShowsFromSource(result) {
      var tvshows = result ? result.tvshows : [];
      $scope.total = result ? result.limits.total : Infinity;
      $scope.tvshows = $scope.tvshows.concat(tvshows);
      $scope.loading = false;
      $scope.fetching = false;
    };

    function onLoad() {
      var limits =  {
        'start' : 0,
        'end' : $scope.requestItemsBy
      }
      $scope.xbmc.getTVShows(onTvShowsFromSource, limits);
    };

    if ($scope.xbmc.isConnected()) {
      onLoad();
    } else {
      $scope.xbmc.register('Websocket.OnConnected', {
        fn: onLoad,
        scope: this
      });
    }

    $scope.loadMore = function () {
      if( $scope.tvshows.length < $scope.total) {
        $scope.fetching = true;
        var limits =  {
          'start' : $scope.tvshows.length,
          'end' : Math.min($scope.tvshows.length+$scope.requestItemsBy, $scope.total)
        };
        $scope.xbmc.getTVShows(onTvShowsFromSource, limits);
      }
    };

    $scope.toggleWatched = function (show) {
      var newValue =  show.playcount ? 0 : 1;
      $scope.xbmc.setTVShowDetails({
        tvshowid : show.tvshowid,
        playcount  :newValue
      },  function(result) {
        if(result === 'OK') {
          show.playcount = newValue;
        }
      })
    };
  }
]);