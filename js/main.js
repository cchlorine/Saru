/* 本地数据初始化 */

if(typeof(localStorage.SaruQuality) == 'undefined')
	localStorage.SaruQuality = 0;

if(typeof(localStorage.SaruRepeat) == 'undefined')
	localStorage.SaruRepeat = 0;

if(typeof(localStorage.SaruLike) == 'undefined')
	localStorage.SaruLike = '[]';

var Saru = {
	audio: document.getElementById('music'),
	Prev: -1,
	Current: 0,
	isPlaying: false,
	Like: JSON.parse(localStorage.SaruLike),
	Repeat: {
		Mode: parseInt(localStorage.SaruRepeat),
		List: ['fa-random', 'fa-refresh', 'fa-retweet'],
		Title: ['Random', 'Cycle', 'Order']
	},
	Quality: parseInt(localStorage.SaruQuality),

	/* 初始化 */
	Init: function() {
		// 循环模式设置
		$('.control .repeat i').addClass(this.Repeat.List[this.Repeat.Mode]).attr('title', this.Repeat.Title[this.Repeat.Mode]);

		if (localStorage.SaruPrev > -1 && localStorage.SaruPrev < playlist.length) {
			this.Load(localStorage.SaruPrev);
		} else {
			this.Load(this.extFunc.randNum(0,playlist.length));
		}
	},

	/* 搜索 */
	Search: {
		Id: function(i) {
			var left = 0,
					right = playlist.length;

			while (left <= right) {
				var center = Math.floor((left + right) / 2);
				if (playlist[center].id == i)
					return playlist[center];
				if (i < playlist[center].id) {
					right = center - 1;
				} else {
					left = center + 1;
				}
			}

			return false;
		}
	},

	/* 控制 */
	Control: {
		Prev: function() { // 上一首
			Saru.audio.pause();

			if ((+Saru.Current + 1) === Saru.Prev && Saru.Prev > -1) {
				Saru.Load(Saru.Prev);
			} else if (+Saru.Current == 0){
				Saru.Load(playlist.length - 1);
			} else if (Saru.Current == playlist.length) {
				Saru.Load(Saru.Current);
			} else {
				Saru.Load(Saru.Current - 1);
			}
		},

		Next: function() { // 下一首
			Saru.audio.pause();
			var nextMusic = 0;

			switch(Saru.Repeat.Mode) {
				case 0: // 随机播放
				default:
					Saru.Load(Saru.extFunc.randNum(0, playlist.length));
					break;

					case 1: // 单曲循环
					audio.currentTime = 0.0;
					audio.play();
					break;

				case 2: // 列表顺序
					if (Saru.Current == playlist.length - 1){
						Saru.Load(0);
					} else {
						Saru.Load(Saru.Current + 1);
					}
					break;
			}
		},

		PlayMode: function() { // 播放顺序
			if(Saru.Repeat.Mode == 2){
				$('.control .repeat i').removeClass(Saru.Repeat.List[Saru.Repeat.Mode]).addClass(Saru.Repeat.List[0]).attr('title', Saru.Repeat.Title[0]);
				Saru.Repeat.Mode = localStorage.SaruRepeat = 0;
			} else {
				$('.control .repeat i').removeClass(Saru.Repeat.List[Saru.Repeat.Mode]).addClass(Saru.Repeat.List[Saru.Repeat.Mode + 1]).attr('title', Saru.Repeat.Title[Saru.Repeat.Mode + 1]);
				Saru.Repeat.Mode = localStorage.SaruRepeat = Saru.Repeat.Mode + 1;
			}
		}
	},

	/* 播放事件 */
	Event: {
		Play: function() { // 播放事件
			$('#player').addClass('playing');
			$('.start i').removeClass('fa-play').addClass('fa-pause');
		},

		Stop: function() { // 暂停事件
			$('#player').removeClass('playing');
			$('.start i').removeClass('fa-pause').addClass('fa-play');
		},

		UpdateProgress: function() { // 进度条更新事件
			$('#progress .current').css({'width': Saru.audio.currentTime / Saru.audio.duration * 100 + '%'});
		},

		End: function() { // 结束事件
			Saru.Control.Next();
		}
	},

	/* 音质处理 */
	Exp: {
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
									Saru.Control.Next();

								if (!item.cover)
									playlist[v.id]['cover'] = data['data']['trackList'][0]['pic'];

								Saru.Play({id: v.id, source: Saru.extFunc.decodeXiami(data['data']['trackList'][0]['location'])});
							}
						});
						break;

					case '163':
						AV.initialize("fvyglppby9vbe7x772p7r8ddrxzcq2tcljkxyrf9fo5spbfr", "fspuitd5h1fz3fftya2go8fg293fpwthivno5vjdic2cmwz4");
						AV.Cloud.run('get163', {id: v.source, type: "song"}, function (result) {

						var data = JSON.parse(result)['songs'][0],
							item = playlist[v.id];

							if (!data)
								Saru.Control.Next();

							if (!item.cover)
								playlist[v.id]['cover'] = data['blurPicUrl'];

							Saru.Play({id: v.id, source: data['mp3Url']});
						});
						break;

					case 'file':
						this.Test(v);
						break;
			}
		},

		Test: function(v) {
			var ext = {
				m4a: ['audio', 'audio/mp4; codecs="mp4a.40.5"'],
				oog: ['audio', 'audio/ogg; codecs="vorbis"'],
				mp3: [true]
			};

			var data = ext[v['songext']];
			if (data[0] == true) {
				return Saru.Play({id: v.id, source: v['source']});
			} else if (typeof ext[v['songext']] == 'undefined') {
				return Saru.Play({id: v.id, source: v['source']});
			} else {
				var tester = document.createElement(data[0]);
				if (tester.canPlayType(data[1]))
					return Saru.Play({id: v.id, source: v['source']});
				else
					return Saru.Control.Next();
			}
		}
	},

	/* 音乐播放 */
	Play: function(ritem) {
		var item = playlist[ritem.id];
		if (!item)
			return this.Control.Next();

		// 记录
		this.Prev    = localStorage.SaruPrev    = this.Current;
		this.Current = localStorage.SaruCurrent = item.id;
		location.hash = '#!' + item.id;

		this.audio.setAttribute('src', ritem['source']);
		this.audio.addEventListener('play',  this.Event.Play, false);
		this.audio.addEventListener('pause', this.Event.Stop, false);
		this.audio.addEventListener('timeupdate', this.Event.UpdateProgress, false);
		this.audio.addEventListener('ended', this.Event.End, false);
		this.audio.addEventListener('error', this.Control.Next, false);

		// 设置封面
		cover = item['cover'] ? item['cover'] : 'img/album.jpg';

		$('#cover').attr({
			'style': 'background-image:url(' + cover + ');',
			'title': item['title'] + ' - ' + item['artist']
		});

		// 设置标题
		$('hgroup h1').html(item['title']);
		$('hgroup h2').html(item['artist']);

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
		this.audio.play();
	},

	/* 音乐预加载 */
	Load: function(i) {
		var source_dir = {'lossless': 0, 'high': 1, 'normal': 2}, sources = [];
		playlist[i]['sources'].forEach(function(v, k, c){
			sources[source_dir[v.quality]] = v;
			sources[source_dir[v.quality]]['id'] = i;
		});

		this.Exp.Normal(sources[1]);
	},

	/* 依赖函数 */
	extFunc: {
		randNum: function(min, max) {
			var radx;

			// 避免只有一首时死循环
			if ((+max - min) <= 1) return 0;

			// 随机避免和现在重复
			while ( !radx || radx === this.Current ) {
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
	}
};

$(document).ready(function(){

	Saru.Init();

	$('.center').click(function() {
		if ($('#player').hasClass('playing')){
			Saru.audio.pause();
		} else {
			Saru.audio.play();
		}
	});

	$('.control .prev').click(function(){
		Saru.Control.Prev();
	});

	$('.control .next').click(function(){
		Saru.Control.Next();
	});

	$('.control .repeat').click(function(){
		Saru.Control.PlayMode();
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
				Saru.Control.Next();
				break;

			case 37: // 左键; 上一首
				Saru.Control.Prev();
				break;

			case 80:
			case 32: // P键, 空格键; 播放暂停
				if ($('#player').hasClass('playing')){
					Saru.audio.pause();
				} else {
					Saru.audio.play();
				}
				break;

			case 77: //M键; 播放顺序
				Saru.Control.PlayMode();
				break;

			case 76: //L键; 喜欢; 不喜欢
				//Saru_LikeDislikeIt();
				break;
		}
	});
});
