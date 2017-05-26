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

var setSong = function(songNumber) {
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: ["mp3"],
    preload: true
  });
  setVolume(currentVolume);
};
var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};
var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};
var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]"');
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
      var nowPlaying = getSongNumberCell(currentlyPlayingSongNumber);
      nowPlaying.html(currentlyPlayingSongNumber);
    } else if (currentlyPlayingSongNumber === songNumber) {
      if (currentSoundFileisPaused()) {
        $(this).html(pauseButtonTemplate);
        $(".main-controls .play-pause").html(playerBarPauseButton);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        updatePlayerBarSong();
      } else {
        $(this).html(playButtonTemplate);
        $(".main-controls .play-pause").html(playerBarPlayButton);
        currentSoundFile.pause();
        updateSeekBarWhileSongPlays();
        updatePlayerBarSong();
      }
    } else if (currentlyPlayingSongNumber !== songNumber) {
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
      var $volumeFill = $(".volume .fill");
      var $volumeThumb = $(".volume .thumb");
      $volumeFill.width(currentVolume + "%");
      $volumeThumb.css({left: currentVolume + "%"});
      $(this).html(pauseButtonTemplate);
      updatePlayerBarSong();
    }
  };
  var onHover = function(event) {
    var songNumberCell = parseInt($(this).find(".song-item-number"));
    var songNumber = parseInt(songNumberCell.attr("data-song-number"));
        if (songNumber !== currentlyPlayingSongNumber) {
          songNumberCell.html(playButtonTemplate);
        }
  };
  var offHover = function(event) {
    var songNumberCell = parseInt($(this).find(".song-item-number"));
    var songNumber = parseInt(songNumberCell.attr("data-song-number"));
      if (songNumber !== currentlyPlayingSongNumber) {
        songNumberCell.html(songNumber);
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
var updateSeekBarWhileSongPlays = function () {
  if (currentSoundFile) {
    currentSoundFile.bind("timeupdate", function(event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $(".seek-control .seek-bar");
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};
var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);
  var percentageString = offsetXPercent + "%";
  $seekBar.find(".fill").width(percentageString);
  $seekBar.find(".thumb").css({left: percentageString});
};
var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};
var setupSeekBars = function() {
  var $seekBars = $(".player-bar .seek-bar");
  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;
    if ($(this).parent().attr("class") == "seek-control") {
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
      setVolume(seekBarFillRatio * 100);
    }
    updateSeekPercentage($(this), seekBarFillRatio);
  });
  $seekBars.find(".thumb").mousedown(function(event) {
    var $seekBar = $(this).parent();
    $(document).bind("mousemove.thumb", function (event) {
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();;
      var seekBarFillRatio = offsetX / barWidth;
      if ($seekBar.parent().attr("class") == "seek-control") {
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
        setVolume(seekBarFillRatio);
      }
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
    $(document).bind(".mouseup.thumb", function() {
      $(document).unbind("mousemove.thumb");
      $(document).unbind("mouseup.thumb");
    });
  });
};

$(document).ready(function() {
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});
var updatePlayerBarSong = function() {
    $(".currently-playing .song-name").text(currentSongFromAlbum.title);
    $(".currently-playing .artist-song-mobile").text(currentSongFromAlbum.title + " - " + currentSongFromAlbum.artist);
    $(".currently-playing .artist-name").text(currentSongFromAlbum.artist);
    $(".main-controls .play-pause").html(playerBarPauseButton);
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
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSong);
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
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
  $(".main-controls .play-pause").html(playerBarPuaseButton);
  var $prevSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
  $prevSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSong);
}
