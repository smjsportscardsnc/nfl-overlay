
const teams=[
['ari','#97233F'],['atl','#A71930'],['bal','#241773'],['buf','#00338D'],
['car','#0085CA'],['chi','#0B162A'],['cin','#FB4F14'],['cle','#311D00'],
['dal','#003594'],['den','#FB4F14'],['det','#0076B6'],['gb','#203731'],
['hou','#03202F'],['ind','#002C5F'],['jax','#006778'],['kc','#E31837'],
['lv','#A5ACAF'],['lac','#0080C6'],['lar','#003594'],['mia','#008E97'],
['min','#4F2683'],['ne','#002244'],['no','#D3BC8D'],['nyg','#0B2265'],
['nyj','#125740'],['phi','#004C54'],['pit','#FFB612'],['sf','#AA0000'],
['sea','#002244'],['tb','#D50A0A'],['ten','#4B92DB'],['wsh','#5A1414']
];

const grid=document.getElementById('teamsGrid');
teams.forEach(t=>{
 const div=document.createElement('div');
 div.className='team-box';
 div.style.setProperty('--teamColor',t[1]);
 div.innerHTML=`<img src="https://a.espncdn.com/i/teamlogos/nfl/500/${t[0]}.png">`;
 grid.appendChild(div);
});

const videoLayer=document.getElementById('videoLayer');
const overlayVideo=document.getElementById('overlayVideo');

const videos={
stash:'assets/videos/stash-or-pass.mp4',
spin:'assets/videos/spin-2-choose-1.mp4',
full:'assets/videos/break-full.mp4',
hit:'assets/videos/big-hit.mp4'
};

window.SMJOverlay={
playVideo(key){
 if(!videos[key]) return;
 overlayVideo.src=videos[key];
 videoLayer.classList.remove('hidden');
 overlayVideo.play();
 overlayVideo.onended=()=>{
   videoLayer.classList.add('hidden');
   overlayVideo.src='';
 };
}
};
