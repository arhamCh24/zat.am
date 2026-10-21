const urlParams = new URLSearchParams(window.location.search);
var setCount = Math.min(wlist.length, ilist.length);
var set = urlParams.get('s');
if (!set || !Number.isInteger(Number(set)) || Number(set) < 0 || Number(set) >= setCount)
	set=0;
else
	set=Number(set);
var t = urlParams.get('t');
if (!t || isNaN(t))
	t=1;
var h = urlParams.get('h');
if (!h || isNaN(h))
	h=1;
var imgs = ilist[parseInt(set)];
var words=wlist[parseInt(set)];

$(function(){
	let choicesVisible = Number(h) === 0;
	const choiceButtons = $('#pres-btns');
	const choicesToggle = $('#show-choices');
	const setChoice = $('#set-choice');
	for (let index = 0; index < setCount; index++) {
		setChoice.append(new Option(String(index), String(index)));
	}
	setChoice.val(String(set));
	
	[
		['#btn-top-next', topNext],
		['#btn-top-prev', topPrev],
		['#btn-mid-next', midNext],
		['#btn-mid-prev', midPrev],
		['#btn-bottom-next', bottomNext],
		['#btn-bottom-prev', bottomPrev],
	].forEach(([selector, handler]) => $(selector).click(handler));
	$('#random-button').click( randomEC );
	$('.pres-btn').each(function () {
		const sectionId = Number(this.id.slice('btn-'.length));
		$(this).click(function () { selectEC(sectionId, this); });
	});
	choicesToggle.click(function () {
		choicesVisible = !choicesVisible;
		choiceButtons.toggle(choicesVisible);
		choicesToggle.text(choicesVisible ? 'Hide choices' : 'Show choices');

		const url = new URL(window.location.href);
		url.searchParams.set('h', choicesVisible ? '0' : '1');
		window.history.replaceState(null, '', url.href);
	});
	setChoice.change(function () {
		const url = new URL(window.location.href);
		url.searchParams.set('s', this.value);
		window.location.assign(url.href);
	});

	$('.arrow-btn').hover(
		function(){ btnOn(this) },
		function(){ btnOff(this) }
	);
	
	var curTop = 0;
	var curMid = 0;
	var curBottom = 0;
	var nextTop = 0;
	var nextMid = 0;
	var nextBottom = 0;

	var lastSection = 12;

	setTimeout(randomEC, 1000);

	function randomEC(){
		while(nextTop == curTop) nextTop = Math.floor(Math.random() * 12) + 1;
		while(nextMid == curMid) nextMid = Math.floor(Math.random() * 12) + 1;
		while(nextBottom == curBottom) nextBottom = Math.floor(Math.random() * 12) + 1;
		
		var t = curTop;
		var m = curMid;
		var b = curBottom;
	
		animateSection('top', t, nextTop, -1);
		setTimeout(function(){ animateSection('mid', m, nextMid, -1) }, 250);
		setTimeout(function(){ animateSection('bottom', b, nextBottom, -1) }, 500);
	
		curTop = nextTop;
		curMid = nextMid;
		curBottom = nextBottom;

		clearActiveEC();
	}
	
	function selectEC( id, btnElement ){
		if($(btnElement).hasClass("active") == false){
			nextTop = nextMid = nextBottom = id;
			var t = curTop;
			var m = curMid;
			var b = curBottom;
		
			var delay = 0;
		
			if(nextTop != curTop){ 
				animateSection('top', t, nextTop, -1);
				delay += 250;
			}

			if(nextMid != curMid){
				setTimeout(function(){ animateSection('mid', m, nextMid, -1) }, delay);
				delay += 250;
			}
		
			if(nextBottom != curBottom) setTimeout(function(){ animateSection('bottom', b, nextBottom, -1) }, delay);
	
			curTop = nextTop;
			curMid = nextMid;
			curBottom = nextBottom;
		
			clearActiveEC();
			$(btnElement).addClass("active");
		}
	}
	
	function clearActiveEC(){
		if ((curTop == curMid) && (curMid== curBottom)) 
			document.getElementById("wrd").innerHTML=words[curMid-1];
		else
			document.getElementById("wrd").innerHTML="?";

if (t==1)
	document.getElementById("wrd").innerHTML +=  " - " + Sanscript.t(document.getElementById("wrd").innerHTML, 'devanagari','itrans');
		var activeBtn = $(".active");
		if(activeBtn.length){
			$(activeBtn).removeClass("active");
		}

	}
	function animateSection(section, curID, nextID, dir){
		var slideWidth = $('#presidents').width();
		if(curID != 0){ $('#' + section + '-section-' + curID).animate( {left: (slideWidth * dir)}, 500 ); }
		$('#' + section + '-section-' + nextID).css( {left: (-slideWidth * dir)} );
		$('#' + section + '-section-' + nextID).animate( {left: 0}, 500 );
	}

	function topNext(){
		nextTop = (curTop >= lastSection) ? 1 : curTop + 1;
		animateSection('top', curTop, nextTop, -1);
		curTop = nextTop;
		clearActiveEC();
	}
	
	function topPrev(){
		nextTop = (curTop <= 1) ? lastSection : curTop - 1;
		animateSection('top', curTop, nextTop, 1);
		curTop = nextTop;
		clearActiveEC();
	}

	function midNext(){
		nextMid = (curMid >= lastSection) ? 1 : curMid + 1;
		animateSection('mid', curMid, nextMid, -1);
		curMid = nextMid;
		clearActiveEC();
	}
	
	function midPrev(){
		nextMid = (curMid <= 1) ? lastSection : curMid - 1;
		animateSection('mid', curMid, nextMid, 1);
		curMid = nextMid;
		clearActiveEC();
	}

	function bottomNext(){
		nextBottom = (curBottom >= lastSection) ? 1 : curBottom + 1;
		animateSection('bottom', curBottom, nextBottom, -1);
		curBottom = nextBottom;
		clearActiveEC();
	}
	
	function bottomPrev(){
		nextBottom = (curBottom <= 1) ? lastSection : curBottom - 1;
		animateSection('bottom', curBottom, nextBottom, 1);
		curBottom = nextBottom;
		clearActiveEC();
	}
	
	function btnOn(element){
		element.src = element.src.replace("_off", "_on");
	}
	
	function btnOff(element){
		element.src = element.src.replace("_on", "_off");
	}
	
for (let i = 1; i <= 12; i++) {
	const imageUrl = `url('${imgs[i - 1]}')`;
	document.querySelector(`.top${i}`).style.backgroundImage = imageUrl;
	document.querySelector(`.mid${i}`).style.backgroundImage = imageUrl;
	document.querySelector(`.bottom${i}`).style.backgroundImage = imageUrl;
	document.getElementById(`btn-${i}`).innerHTML = words[i - 1];
}
	choiceButtons.toggle(choicesVisible);
	choicesToggle.text(choicesVisible ? 'Hide choices' : 'Show choices');
});
