// Mouse drag rotates only the presentation plane. The original image stays unchanged.
window.attachCardTilt=function(button,img){
  const shine=document.createElement('span');shine.className='metal-shine';shine.setAttribute('aria-hidden','true');button.append(shine);
  const mask='url('+JSON.stringify(img.getAttribute('src'))+')';shine.style.maskImage=mask;shine.style.webkitMaskImage=mask;
  img.draggable=false;button.title='按住左鍵拖曳觀看角度；點擊放大';
  let pointer=null,startX=0,startY=0,dragged=false,suppressClick=false,width=1,height=1;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function shadow(x,y,dragging){
    const stage=button.closest('.image-stage');if(!stage)return;
    stage.classList.toggle('shadow-dragging',dragging);
    // A restrained ground projection, relative to the resting card angle.
    const lift=Math.abs(y),turn=Math.abs(x);
    const values={'--shadow-x':(-x*.85)+'px','--shadow-y':(y*.55)+'px',
      '--shadow-width':String(1-turn*.012),'--shadow-depth':String(1+lift*.035),
      '--shadow-blur':(14+lift*.45)+'px','--contact-blur':(7+lift*.28)+'px',
      '--shadow-opacity':String(1-lift*.022),'--shadow-turn':(-3+x*.32)+'deg'};
    for(const [name,value] of Object.entries(values))stage.style.setProperty(name,value);
  }
  function finish(){
    if(pointer===null)return;const id=pointer;pointer=null;suppressClick=dragged;
    button.classList.remove('tilting');button.style.setProperty('--tilt-x','2deg');button.style.setProperty('--tilt-y','-9deg');button.style.setProperty('--shine-opacity','0');
    shadow(0,0,false);
    if(button.hasPointerCapture(id))button.releasePointerCapture(id);
  }
  button.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='mouse'||e.button!==0||!e.isPrimary)return;
    pointer=e.pointerId;startX=e.clientX;startY=e.clientY;dragged=false;suppressClick=false;
    width=button.offsetWidth||1;height=button.offsetHeight||1;button.setPointerCapture(pointer);
  });
  button.addEventListener('pointermove',e=>{
    if(e.pointerId!==pointer)return;if(!(e.buttons&1)){finish();return}
    const dx=e.clientX-startX,dy=e.clientY-startY;
    if(!dragged&&Math.hypot(dx,dy)<4)return;
    dragged=true;button.classList.add('tilting');
    const x=clamp(dx/width*30,-12,12),y=clamp(-dy/height*30,-10,10);
    shadow(x,y,true);
    button.style.setProperty('--tilt-x',(2+y)+'deg');button.style.setProperty('--tilt-y',(-9+x)+'deg');
    button.style.setProperty('--shine-x',(50+x*2.5)+'%');button.style.setProperty('--shine-y',(45-y*2.5)+'%');
    button.style.setProperty('--shine-angle',(115+x*2-y)+'deg');button.style.setProperty('--shine-opacity',String(.12+Math.min(Math.hypot(x,y)/18,1)*.2));
  });
  button.addEventListener('pointerup',e=>{if(e.pointerId===pointer)finish()});
  button.addEventListener('pointercancel',e=>{if(e.pointerId===pointer)finish()});
  button.addEventListener('lostpointercapture',e=>{if(e.pointerId===pointer)finish()});
  button.addEventListener('dragstart',e=>e.preventDefault());
  button.addEventListener('click',e=>{if(suppressClick&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();suppressClick=false}},true);
  window.addEventListener('blur',finish);document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
};
