$(document).ready(function(){
	//�򿪹رղ����б�
	listStatus = 0;
	$('.list-button').click(function(){
		listWidth = $('#wrap .play-list ul').width();
		if(!listStatus){
			$(this).animate({marginRight: listWidth - 5},300);
			$('#wrap .play-list ul').animate({marginRight: 0},300);
			listStatus = 1;
		} else {
			$(this).animate({marginRight: -5},300);
			$('#wrap .play-list ul').animate({marginRight: -400},300);
			listStatus = 0;
		}	
	})
	//console.log(localStorage.currentMusic + '-' + localStorage.repeat + '-' + localStorage.quality);
	//���ر������ݣ������еĻ���
	if(typeof(localStorage.repeat) == undefined || isNaN(localStorage.repeat))
		localStorage.repeat = '0';
	if(typeof(localStorage.quality) == undefined || isNaN(localStorage.quality))
		localStorage.quality = '0';
	if(typeof(localStorage.prevplay) == undefined || isNaN(localStorage.prevplay))
		localStorage.prevplay = '-1';
	if(typeof(localStorage.prevplay) == currentMusic || isNaN(localStorage.currentMusic) || !playlist[localStorage.currentMusic])
		localStorage.currentMusic = '0';
	//localStorage.currentMusic = 0;
	//������Ҫ�õ��ı���
	var audio = document.getElementById('music');
	var isPlaying    = false;
	var currentMusic = localStorage.currentMusic;
	var repeat = parseInt(localStorage.repeat);
	var quality = 0;
	var relist = ['fa-random', 'fa-refresh', 'fa-retweet'];
	var retitle = ['Random', 'Cycle', 'Order'];

	//����״̬�޸�ͼ��
	if(!quality){
		$('.control .quality i').removeClass('fa-star').addClass('fa-star-half').attr('title','Normal Quality'); 
	} else {
		$('.control .quality i').removeClass('fa-star-half').addClass('fa-star').attr('title','High Quality'); 
	}
	$('.control .repeat i').removeClass().addClass('fa').addClass(relist[repeat]).attr('title',retitle[repeat]); 

	console.log('Current Music: ' + currentMusic + ' Repeat: '+ repeat + ' Quality: '+ quality);

	//���ز����б�
	for (var i = 0; i < playlist.length; i++){
		var item = playlist[i];
		$('.play-list ul').append('<li class="item' + i + '">' + item.title + '</li>');
	}    
	
	/**
	* Request notification permissions
	*/
	function request_permission()
	{
		// 0 means we have permission to display notifications
		
	}
	//����ͼƬ�������ļ�
	var loadMusic = function(i){
		if(localStorage.currentMusic > -1)
		localStorage.setItem('prevplay', localStorage.currentMusic * 1);
		currentMusic = localStorage.currentMusic = i;
		var item = playlist[i];

		$.ajax({
			type: "POST",
			cache: false,
		    dataType: 'jsonp',
		    jsonp: 'callback',
		    async: false,
		    url: 'http://er.fantuanpu.com/xiami.php?id=' + item.id + '&type=song&callback=?',
		    success: function(data) {
				//ѡ����ͬ�����������ļ�
		    	if(!quality){
					src = item.mp3_h;
				} else {
					src = data.song_src;
				}
				src = data.song_src;
				//���ظ��ֶ���
				audio.setAttribute("src", src);
				audio.addEventListener('play', playEvent, false);
				audio.addEventListener('pause', stopEvent, false);
				audio.addEventListener('timeupdate', updateProgress, false);
				audio.addEventListener('ended', autoChange, false);
				cover = data.song_cover;
				cover = cover.replace('_1','_4');
				cover = cover.replace('_2','_4');
				cover = cover.replace('_3','_4');
				cover = cover.replace('_4','_4');
				cover = cover;
				if(!cover)
					cover = 'img/album.jpg';
				$('.album img').attr({'src': cover, 'alt': item.artist});
				$('#wrap .title h1').html(item.title);
				$('#wrap .title h2').html(item.artist);
				$('.play-list ul li').removeClass('playing').eq(i).addClass('playing');
				
				audio.play();

				if(window.webkitNotifications && window.webkitNotifications.checkPermission() == 0){
					var information = window.webkitNotifications.createNotification(cover, item.title, item.artist);
					information.onclick = function(){
						window.focus();
						information.cancel();
					}
					information.show(); 
					setTimeout(function(){information.cancel()},2000);
				}
				console.log('Song Title: ' + item.title + ' Song Artist: ' + item.artist);
		    },
		});	
	}
	loadMusic(currentMusic);
	
	var changeMusic = function(i){
		loadMusic(i);
		audio.play();
	}

	var randomNum = function(min,max){
		var radx = Math.floor(min + Math.random() * (max - min));
		if(radx != localStorage.currentMusic)
			return radx;
		else
			return Math.floor(min + Math.random() * (max - min));
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

	var updateProgress = function(){
		$('#wrap .progress .current').css({'width': audio.currentTime / audio.duration * 100 + '%'});
	}
	
	var playEvent = function(){
		$('.album').addClass('playing');
		$('#wrap .progress').animate({opacity:"1"});
		$('.start i').addClass('playing').removeClass('fa-play').addClass('fa-pause');
		isPlaying = true;
	}
	
	var stopEvent = function(){
		$('.album').removeClass('playing');
		$('.start i').removeClass('playing').removeClass('fa-pause').addClass('fa-play');
		isPlaying = false;
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
			listStatus = 0;
			audio.pause();
			changeMusic(num);
		}
	})

	$('.control .repeat').click(function(){
		console.log('repeat ' + repeat);
		if(repeat == 2){
			$('.control .repeat i').removeClass(relist[repeat]).addClass(relist[0]).attr('title',retitle[0]); 
			repeat = localStorage.repeat = 0;
		} else {
			$('.control .repeat i').removeClass(relist[repeat]).addClass(relist[repeat + 1]).attr('title',retitle[repeat + 1]); 
			repeat = localStorage.repeat = repeat + 1;
		}	
	})
	
	$('.control .quality').click(function(){
		if(quality){
			$('.control .quality i').removeClass('fa-star').addClass('fa-star-half').attr('title','Normal Quality'); 
			quality = localStorage.quality = 0;
		} else {
			$('.control .quality i').removeClass('fa-star-half').addClass('fa-star').attr('title','High Quality'); 
			quality = localStorage.quality = 1;
		}	
	})
	
	$('.player').click(function(){
		if(listStatus){
		$('#wrap .list-button').animate({marginRight: -5},300);
		$('#wrap .play-list ul').animate({marginRight: -400},300);
		listStatus = 0;
		}
	})
	
	$('.setting').click(function(){
		
	})
	
	$('.iniciel_control').click(function(){
			if($('.iniciel_control i').hasClass('fa-plus')){
				$('.iniciel_control i').removeClass('fa-plus');
				$('.iniciel_control i').addClass('fa-minus');
			} else {
				$('.iniciel_control i').removeClass('fa-minus');
				$('.iniciel_control i').addClass('fa-plus');
			}
			$('#wrap .control').toggle(300);
		}
	)
	
	$('.home').click(function(){
		window.open('http://www.dsu.pw');
	})
})
