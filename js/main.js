$(document).ready(function(){
	var audio     = document.getElementById('music'),
			isPlaying = true;

	for (var i = 0; i < playlist.length; i++){
		var item = playlist[i];
		$('.play-list ul').append('<li class="item' + i + '">' + item.title + ' - ' + item.artist + '</li>');
	}

	/* 播放事件 */

	var Saru_EventPlay = function(){
		$('#player').addClass('playing');
		$('.start i').addClass('playing').removeClass('fa-play').addClass('fa-pause');
	}

	/* 暂停事件 */

	var Saru_EventStop = function(){
		$('#player').removeClass('playing');
		$('.start i').removeClass('playing').removeClass('fa-pause').addClass('fa-play');
	}

	/* 进度条更新事件 */

	var Saru_EventUpdateProgress = function() {
		$('#progress .current').css({'width': audio.currentTime / audio.duration * 100 + '%'});
	}

	/* 音乐播放 */

	var playMusic = function(i){
		item = playlist[i];

		audio.setAttribute("src", item['sources'][0]['source']);
		audio.addEventListener('play',  Saru_EventPlay, false);
		audio.addEventListener('pause', Saru_EventStop, false);
		audio.addEventListener('timeupdate', Saru_EventUpdateProgress, false);
		//audio.addEventListener('ended', autoChange, false);


		// 设置封面
		cover = item['cover'] ? item['cover'] : 'img/album.jpg';

		$('#cover').attr({
			'style': 'background-image:url(' + cover + ');',
			'title': item['title'] + ' - ' + item['artist']
		});

		// 设置标题
		$('hgroup h1').html(item['title']);
		$('hgroup h2').html(item['artist']);

		// 播放列表
		$('.play-list ul li').removeClass('playing').eq(i).addClass('playing');

		// 开始播放
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
