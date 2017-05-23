var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new.buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: ["mp3"],
    preload: true
  });
  setVolume(currentVolume);
};
var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};
var getSongNumCell = function(number) {
  return $(".song-item-number[data-song-number="" + number + ""]");
};
var createSongRow = function(songNumber, songName, songLength) {
  var template =
    '<tr class="album-view-song-item">'
  + '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '<td class="song-item-title">' + songName + '</td>'
  + '<td class="song-item-duration">' + songLength + '</td>'
  + '</tr>';
  var $row = $(template);
  var clickHandler = function() {
    var songNumber = parseInt($(this).attr("data-song-number"));
    if (currentlyPlayingSongNumber !== null) {
      var nowPlaying = getSongNumCell(currentlyPlayingSongNumber);
      nowPlaying.html(currentlyPlayingSongNumber);
    } else if (currentlyPlayingSongNumber === songNumber)) {
      if (currentSoundFileisPaused()) {
        $(this).html(pauseButtonTemplate);
        $(".main-controls .play-pause").html(playerBarPauseButton);
        currentSoundFile.play();
      } else {
        $(this).html(playButtonTemplate);
        $(".main-controls .play-pause").html(playerBarPlayButton);
        currentSoundFile.pause();
      }
    } else if (currentlyPlayingSongNumber !== songNumber)) {
      $(this).html(pauseButtonTemplate);
      currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
      setSong(songNumber);
      currentSoundFile.play();
      updatePlayerBarSong();
    }
  };
  var onHover = function(event) {
    var songNumCell = parseInt($(this).find(".song-item-number"));
    var songNumber = parseInt(songNumCell.attr("data-song-number"));
        if (songNumber !== currentlyPlayingSongNumber) {
          songNumCell.html(playButtonTemplate);
        }
  };
  var offHover = function(event) {
    var songNumCell = parseInt($(this).find(".song-item-number"));
    var songNumber = parseInt(songNumCell.attr("data-song-number"));
      if (songNumber !== currentlyPlayingSongNumber) {
        songNumCell.html(songNumber);
      }
  };
  $row.find(".song-item-number").click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};
var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $(".album-view-title");
  var $albumArtist = $(".album-view-artist");
  var $albumReleaseInfo = $(".album-view-release-info");
  var $albumImage = $(".album-cover-art");
  var $albumSongList = $(".album-view-song-list");
  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + " " + album.label);
  $albumImage.attr("src", album.albumArtURL);
  $albumSongList.empty();
  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};
var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $(".main-controls .previous");
var $nextButton = $(".main-controls .next");
var $togglePlay = $(".main-controls .play-pause");
$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $togglePlay.click(togglePlayFromPlayerBar);
});
var updatePlayerBarSong = function() {
    $(".currently-playing .song-name").text(currentSongFromAlbum.title);
    $(".currently-playing .artist-song-mobile").text(currentSongFromAlbum.title + " - " + currentSongFromAlbum.artist);
    $(".currently-playing .artist-name").text(currentSongFromAlbum.artist);
    $(".main-controls .play-pause").html(playerBarPauseButton);
};
var togglePlayFromPlayerBar = function() {
  if (currentSoundFileisPaused) {
    var nowPlaying = getSongNumCell(currentlyPlayingSongNumber);
    songNumCell.html(playerBarPauseButton);
    $(".main-controls .play-pause").html(playerBarPauseButton);
  } else {
    var nowPlaying = getSongNumCell(currentlyPlayingSongNumber);
    songNumCell.html(playerBarPlayButton);
    $(".main-controls .play-pause").html(playerBarPlayButton);
  }
};
var nextSong = function() {
  var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentIndex++;
  if (currentIndex >= currentAlbum.songs.length) {
    currentSongIndex = 0;
  }
  var lastSong = currentlyPlayingSongNumber;
  setSong(currentIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();
  var $nextSongNumCell = getSongNumCell(currentlyPlayingSongNumber);
  var $lastSongNumCell = getSongNumCell(lastSongNumber);
  $nextSongNumCell.html(pauseButtonTemplate);
  $lastSongNumbCell.html(lastSong);
};
var previousSong = function() {
  var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
  currentIndex--;
  if (currentIndex < 0) {
    currentSongIndex = currentAlbum.songs.length - 1;
  }
  var lastSong = currentlyPlayingSongNumber;
  setSong(currentIndex + 1);
  currentSoundFile.play();
  updatePlayerBarSong();
  $(".main-controls .play-pause").html(playerBarPauseButton);
  var $prevSongNumCell = getSongNumCell(currentlyPlayingSongNumber);
  var $lastSongNumCell = getSongNumCell(lastSongNumber);
  $prevSongNumCell.html(pauseButtonTemplate);
  $lastSongNumbCell.html(lastSong);
}
