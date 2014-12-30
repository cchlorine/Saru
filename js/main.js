$(document).ready(function(){

	/* 本地数据初始化 */

	if(typeof(localStorage.SaruQuality) == "undefined")
		localStorage.SaruQuality = 0;

	if(typeof(localStorage.SaruRepeat) == "undefined")
		localStorage.SaruRepeat = 0;

	if(typeof(localStorage.SaruLike) == "undefined")
		localStorage.SaruLike = '[]';

	/* 常量 */

	var audio     = document.getElementById('music'),
			isPlaying = true,
			SaruData  = {
				'current' : 0,
				'prev'    : -1,
				'quality' : parseInt(localStorage.SaruQuality),
				'pmode'   : parseInt(localStorage.SaruRepeat)
			},
			SaruLike = JSON.parse(localStorage.SaruLike);

	/* 播放顺序 */

	var relist  = ['fa-random', 'fa-refresh', 'fa-retweet'],
			retitle = ['Random', 'Cycle', 'Order'];

	$('.control .repeat i').addClass(relist[SaruData['pmode']]).attr('title',retitle[SaruData['pmode']]);

	for (var i = 0; i < playlist.length; i++){
		var item = playlist[i];
		$('.play-list ul').append('<li class="item' + i + '">' + item.title + ' - ' + item.artist + '</li>');
	}

	/* 依赖函数 */

	var extFunct = {
		randNum: function(min, max) {
			var radx;

			// 避免只有一首时死循环
			if ((+max - min) <= 1) return 0;

			// 随机避免和现在重复
			while ( !radx || radx === SaruData['current'] ) {
				radx = Math.floor(min + Math.random() * (max - min));
			}

			return radx;
		},

		decodeXiami: function(sourceString) {
			var _loc9 = Number(sourceString.charAt(0));
			var _loc7 = sourceString.substring(1);
			var _loc5 = Math.floor(_loc7.length / _loc9);
			var _loc6 = _loc7.length % _loc9;
			var _loc2 = new Array();
			for (var _loc3 = 0; _loc3 < _loc6; ++_loc3) {
				if (_loc2[_loc3] == undefined) {
					_loc2[_loc3] = "";
				} // end if
				_loc2[_loc3] = _loc7.substr((_loc5 + 1) * _loc3, _loc5 + 1);
			} // end of for

			for (var _loc3 = _loc6; _loc3 < _loc9; ++_loc3) {
				_loc2[_loc3] = _loc7.substr(_loc5 * (_loc3 - _loc6) + (_loc5 + 1) * _loc6, _loc5);
			} // end of for

			var _loc4 = "";
			for (var _loc3 = 0; _loc3 < _loc2[0].length; ++_loc3) {
				for (var _loc1 = 0; _loc1 < _loc2.length; ++_loc1) {
					_loc4 = _loc4 + _loc2[_loc1].charAt(_loc3);
				} // end of for
			} // end of for

			_loc4 = unescape(_loc4);
			var _loc8 = "";
			for (var _loc3 = 0; _loc3 < _loc4.length; ++_loc3) {
				if (_loc4.charAt(_loc3) == "^") {
					_loc8 = _loc8 + "0";
					continue;
				} // end if
				_loc8 = _loc8 + _loc4.charAt(_loc3);

			} // end of for //trans ^ to 0
			return (_loc8);
		}
	};

	/* 播放控制 */

	var SaruControl = {
		Prev: function() { // 上一首
			audio.pause();

			if ((+SaruData['current'] + 1) === SaruData['prev'] && SaruData['prev'] > -1) {
				loadMusic(SaruData['prev']);
			} else if (+SaruData['current'] == 0){
				loadMusic(playlist.length - 1);
			} else if (SaruData['current'] == playlist.length) {
				loadMusic(SaruData['current']);
			} else {
				loadMusic(SaruData['current'] - 1);
			}
		},

		Next: function() { // 下一首
			audio.pause();
			var nextMusic = 0;

			switch(SaruData['pmode']) {
				case 0: // 随机播放
				default:
					loadMusic(extFunct.randNum(0, playlist.length));
					break;

				case 1: // 单曲循环
					audio.currentTime = 0.0;
					audio.play();
					break;

				case 2: // 列表顺序
					if (SaruData['current'] == playlist.length - 1){
						loadMusic(0);
					} else {
						loadMusic(SaruData['current'] + 1);
					}
					break;
			}
		},

		PlayMode: function() { // 播放顺序
				if(SaruData['pmode'] == 2){
					$('.control .repeat i').removeClass(relist[SaruData['pmode']]).addClass(relist[0]).attr('title',retitle[0]);
					SaruData['pmode'] = localStorage.SaruRepeat = 0;
				} else {
					$('.control .repeat i').removeClass(relist[SaruData['pmode']]).addClass(relist[SaruData['pmode'] + 1]).attr('title', retitle[SaruData['pmode'] + 1]);
					SaruData['pmode'] = localStorage.SaruRepeat = SaruData['pmode'] + 1;
				}
		}
	};

	/* 播放事件 */

	var SaruEvent = {
		Play: function() { // 播放事件
			$('#player').addClass('playing');
			$('.start i').removeClass('fa-play').addClass('fa-pause');
		},

		Stop: function() { // 暂停事件
			$('#player').removeClass('playing');
			$('.start i').removeClass('fa-pause').addClass('fa-play');
		},

		UpdateProgress: function() { // 进度条更新事件
			$('#progress .current').css({'width': audio.currentTime / audio.duration * 100 + '%'});
		},

		End: function() { // 结束事件
			SaruControl.Next();
		}
	};

	/* 音乐品质处理 */

	var SaruExp = {
		Normal: function(v){
			if (typeof v.type == undefined)
				return false;

				switch (v.type) {
					case 'xiami':
						$.ajax({
							type: "GET",
							cache: false,
							dataType: 'jsonp',
							jsonp: 'callback',
							async: false,
							url: 'http://www.xiami.com/song/playlist/id/' + v.source +'/object_name/collect/object_id/' + v.source + '/cat/json?_ksTS=1&callback=?',
							success: function(data){
								var item = playlist[v.id];

								if (!data)
									SaruControl.Next();

								if (!item.cover)
									playlist[v.id]['cover'] = data['data']['trackList'][0]['pic'];

								playMusic({id: v.id, source: extFunc.decodeXiami(data['data']['trackList'][0]['location'])});
							}
						});
						break;

					case '163':
						AV.initialize("fvyglppby9vbe7x772p7r8ddrxzcq2tcljkxyrf9fo5spbfr", "fspuitd5h1fz3fftya2go8fg293fpwthivno5vjdic2cmwz4");
						AV.Cloud.run('get163', {id: v.source, type: "song"}, function (result) {

						var data = JSON.parse(result)['songs'][0],
						item = playlist[v.id];

						if (!data)
							SaruControl.Next();

						if (!item.cover)
							playlist[v.id]['cover'] = data['blurPicUrl'];

						playMusic({id: v.id, source: data['mp3Url']});
					});
					break;

				case 'file':
					Saru_ExpTest(v);
					break;
			}
		}
	};

	/* 音乐格式测试 */

	var Saru_ExpTest = function(v) {
		playMusic({id: v.id, source: v['source']});
	}

	/* 音乐播放 */

	var loadMusic = function(i){

		var source_dir = {'lossless': 0, 'high': 1, 'normal': 2}, sources = [];
		playlist[0]['sources'].forEach(function(v, k, c){
			sources[source_dir[v.quality]] = v;
			sources[source_dir[v.quality]]['id'] = k;
		});

		SaruExp.Normal(sources[2]);
	}

	var playMusic = function(ritem) {
		var item = playlist[ritem.id];

		// 记录
		SaruData['prev']    = localStorage.SaruPrev    = SaruData['current'];
		SaruData['current'] = localStorage.SaruCurrent = item.id;
		location.hash = '#!' + item.id;

		// 判断是否喜欢
		/*if (SaruLike.indexOf(item.id) > -1) {
			if (!$('.control .like').hasClass('likeit'))
				$('.control .like').addClass('likeit');
		} else {
			if ($('.control .like').hasClass('likeit'))
				$('.control .like').removeClass('likeit');
		}*/

		audio.setAttribute("src", ritem['source']);
		audio.addEventListener('play',  SaruEvent.Play, false);
		audio.addEventListener('pause', SaruEvent.Stop, false);
		audio.addEventListener('timeupdate', SaruEvent.UpdateProgress, false);
		audio.addEventListener('ended', SaruEvent.End, false);

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

		// 提示
		Notification.requestPermission(function (perm) {
			if (perm == "granted") {
				var notification = new Notification (item['title'], {
					dir: "auto",
					lang: "hi",
					tag: "SaruFM",
					icon: item['cover'],
					body: item['title'] + ' - ' + item['artist']
				});
				notification.onshow = function(){
					setTimeout(function(){
						notification.close();
					}, 5000);
				}
			}
		});

		// 开始播放
		audio.play();
	}

	if (location.hash.match(/[\d]+/)) {
		var hash = location.hash.match(/[\d]+/)[0];
		if (hash < playlist.length)
			loadMusic(hash);
	} else if (localStorage.SaruPrev > -1 && localStorage.SaruPrev < playlist.length) {
		loadMusic(localStorage.SaruPrev);
	} else {
		loadMusic(extFunct.randNum(0,playlist.length));
	}

	$('.center').click(function() {
		if ($('#player').hasClass('playing')){
			audio.pause();
		} else {
			audio.play();
		}
	});

	$('.control .prev').click(function(){
		SaruControl.Prev();
	});

	$('.control .next').click(function(){
		SaruControl.Next();
	});

	$('.control .repeat').click(function(){
		SaruControl.PlayMode();
	});

	$('.control .like').click(function(){
		//Saru_LikeDislikeIt();
	});

	/* HotKey */
	$(document).keydown(function(e) {
		var keycode = e.keyCode || e.which || e.charCode;

		switch (keycode) {
			case 39:
			case 78: // 右键, n键; 下一首
				SaruControl.Next();
				break;

			case 37: // 左键; 上一首
				SaruControl.Prev();
				break;

			case 80:
			case 32: // P键, 空格键; 播放暂停
				if ($('#player').hasClass('playing')){
					audio.pause();
				} else {
					audio.play();
				}
				break;

			case 77: //M键; 播放顺序
				SaruControl.PlayMode();
				break;

			case 76: //L键; 喜欢; 不喜欢
				//Saru_LikeDislikeIt();
				break;
		}
	});
});
