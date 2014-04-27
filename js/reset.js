
$(document).ready(function(){
	//randomBackground();
	/*windowsHeight = $(window).height();
	windowsWidth  = $(window).width();
	mainHeight    = $('.middle').height();
	toTop         = (windowsHeight - mainHeight) / 2;*/
	//$('.middle').css({'margin-top': toTop});

	document.getElementById("pic").onload = function() {

		$('#wrap .player').css({'visibility': 'visible'});
		$('#wrap .center').css({'width': $("#wrap .album img").width(), 'margin-left': '-' + $("#wrap .album img").width()/2 + 'px', 'height': $("#wrap .album img").height(), 'margin-top': '-' + (($("#wrap .album img").height()/2) * 1 + 8) + 'px'});
		$("#wrap .center").fadeIn();
		
	};
	
	$(window).resize(function(){
		$('#wrap .center').css({'width': $("#wrap .album img").width(), 'margin-left': '-' + $("#wrap .album img").width()/2 + 'px', 'height': $("#wrap .album img").height(), 'margin-top': '-' + (($("#wrap .album img").height()/2) * 1 + 8) + 'px'});
	});
})