angular.module('app')
.controller('TvShowListCtrl', ['$scope', '$filter',
  function TvShowListCtrl($scope, $filter) {
    $scope.loading = true;
    $scope.scanning = false;
    $scope.fetching = false;

    $scope.requestItemsBy = 50;
    $scope.total = Infinity;
    $scope.tvshows = [];

    function onTvShowsFromSource(result) {
      var tvshows = result ? result.tvshows : [];
      $scope.total = result ? result.limits.total : Infinity;
      if($scope.scanning) {
        if(!angular.equals($scope.tvshows, tvshows)) {
          $scope.tvshows = tvshows;
        }
      } else {
        $scope.tvshows = $scope.tvshows.concat(tvshows);
      }

      updateRandomShow();
      $scope.loading = false;
      $scope.scanning = false;
      $scope.fetching = false;
    };

    function onLoad() {
      var limits =  {
        'start' : 0,
        'end' : $scope.requestItemsBy
      }
      $scope.xbmc.getTVShows(onTvShowsFromSource, limits);
    };

    function updateRandomShow() {
      if($scope.tvshows.length) {
        var randomIndex = Math.floor(Math.random()*$scope.tvshows.length);
        $scope.randomShow = $scope.tvshows[randomIndex];
      }
    };

    $scope.xbmc.register('VideoLibrary.OnScanFinished', {
      fn: onLoad,
      scope: this
    });

    if ($scope.xbmc.isConnected()) {
      onLoad();
    } else {
      $scope.xbmc.register('Websocket.OnConnected', {
        fn: onLoad,
        scope: this
      });
    }

    $scope.getEpisodesPath = function(show) {
      return '/tvshow/'+show.tvshowid;
    };

    $scope.getExtra = function (show) {
      return show.episode + ' espisodes';
    };

    $scope.getFanart = function (show) {
      return $scope.getImage(show.art.fanart);
    };

    $scope.getPoster = function (show) {
      return $scope.getImage(show.thumbnail);
    };

    $scope.getImage = function (image, fallback) {
      fallback = fallback || 'img/icons/foxy-512.png'
      var url = $filter('asset')(image, $scope.host);
      return $filter('fallback')(url, fallback);
    };

    $scope.loadMore = function () {
      if(!$scope.scanning && $scope.tvshows.length < $scope.total) {
        $scope.fetching = true;
        var limits =  {
          'start' : $scope.tvshows.length,
          'end' : Math.min($scope.tvshows.length+$scope.requestItemsBy, $scope.total)
        };
        $scope.xbmc.getTVShows(onTvShowsFromSource, limits);
      }
    };

    $scope.scan = function () {
      if(!$scope.fetching) {
        $scope.scanning = true;
        $scope.xbmc.scan('VideoLibrary');
      }
    };
  }
]);