$(document).ready(function(){
	var audio     = document.getElementById('music');

	for (var i = 0; i < playlist.length; i++){
		var item = playlist[i];
		$('.play-list ul').append('<li class="item' + i + '">' + item.title + ' - ' + item.artist + '</li>');
	}

	var currentMusic = localStorage.currentMusic;
	var repeat = parseInt(localStorage.repeat);
	var quality = 0;
	var relist = ['fa-random', 'fa-refresh', 'fa-retweet'];
	var retitle = ['Random', 'Cycle', 'Order'];

	if(!quality){
		$('.control .quality i').removeClass('fa-star').addClass('fa-star-half').attr('title','Normal Quality');
	} else {
		$('.control .quality i').removeClass('fa-star-half').addClass('fa-star').attr('title','High Quality');
	}
	$('.control .repeat i').removeClass().addClass('fa').addClass(relist[repeat]).attr('title',retitle[repeat]);

	var updateProgress = function(){
		$('#progress .current').css({'width': audio.currentTime / audio.duration * 100 + '%'});
	}

	var playMusic = function(i){
		audio.setAttribute("src", playlist[i]['sources'][0]['source']);
		audio.addEventListener('play', playEvent, false);
		audio.addEventListener('pause', stopEvent, false);
		audio.addEventListener('timeupdate', updateProgress, false);
		//audio.addEventListener('ended', autoChange, false);

		cover = 'img/album.jpg';
		$('.album img').attr({'src': cover, 'alt': item.artist});
		$('#wrap .title h1').html(item.title);
		$('#wrap .title h2').html(item.artist);
		$('.play-list ul li').removeClass('playing').eq(i).addClass('playing');
		audio.play();
	}

	playMusic(0);


	var randomNum = function(min,max){
		var radx;
		while( !radx || radx == localStorage.currentMusic ){
            radx = Math.floor(min + Math.random() * (max - min));
        }
        return radx;
	}

	/*'fa-random', 'fa-refresh', 'fa-retweet'*/
	var autoChange = function(){
		audio.pause();
		var nextMusic = 0;
		switch(repeat){
			case 0: nextMusic = randomNum(0, playlist.length);
				changeMusic(nextMusic);
				break;
			case 1: audio.currentTime = 0.0;
				audio.play();
				break;
			case 2: if(currentMusic == playlist.length - 1){
					changeMusic(0);
				} else {
					changeMusic(currentMusic + 1);
				}
				break;
		}
	}

	var playEvent = function(){
		$('.album').addClass('playing');
		$('#wrap .progress').animate({opacity:"1"});
		$('.start i').addClass('playing').removeClass('fa-play').addClass('fa-pause');
	}

	var stopEvent = function(){
		$('.album').removeClass('playing');
		$('.start i').removeClass('playing').removeClass('fa-pause').addClass('fa-play');
	}

	$('.center').click(function(){
		if ($('.start i').hasClass('playing')){
			audio.pause();
		} else {
			audio.play();
			if(window.webkitNotifications){
				if (window.webkitNotifications.checkPermission() != 0) {
					window.webkitNotifications.requestPermission();
				}
			}
		}
	});

	$('.control .pre').click(function(){
		audio.pause();
		if((currentMusic * 1 + 1) != localStorage.prevplay && localStorage.prevplay > -1){
			changeMusic(localStorage.prevplay);
		} else if(currentMusic == 0){
			changeMusic(playlist.length - 1);
		} else {
			changeMusic(currentMusic - 1);
		}
	})

	$('.control .next').click(function(){
		audio.pause();
		if(localStorage.repeat == 0){
			nextMusic = randomNum(0, playlist.length);
			changeMusic(nextMusic);
		} else if(currentMusic == playlist.length - 1){
			changeMusic(0);
		} else {
			changeMusic(currentMusic * 1 + 1);
		}
	})

	$('.play-list ul li').click(function(){
		if(!$(this).hasClass('playing')){
			var className = $(this).attr('class');
			var num       = parseInt(className.substr(4));
			$('#wrap .list-button').animate({marginRight: -5},300);
			$('#wrap .play-list ul').animate({marginRight: -400},300);
			audio.pause();
			changeMusic(num);
		}
	});
});
