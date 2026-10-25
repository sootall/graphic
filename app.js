const $=s=>document.querySelector(s),data=window.PORTFOLIO;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
document.documentElement.classList.toggle('still',paused);
reduced.addEventListener('change',e=>{paused=e.matches;document.documentElement.classList.toggle('still',paused)});
function registration(value){$('#register').value=value;$('#offset').value=value;document.documentElement.style.setProperty('--offset',value+'px')};$('#register').oninput=e=>registration(e.target.value);$('#align').onclick=()=>registration(0);
let active=0,slide=0,opener;const dialog=$('#viewer');
const viewerControls=attachViewerControls($('#viewer-stage'),$('#viewer-img'),dialog);
let viewerRequest=0;
function showImage(){
 const w=data[active],request=++viewerRequest,full=w.images[slide],viewer=$('#viewer-img');
 $('#viewer-title').textContent=w.title;
 viewer.dataset.ratio=w.width/w.height;viewerControls.reset();
 viewer.src=w.previews?.[slide]||full;viewer.decoding='async';
 viewer.alt=w.title+' — '+w.captions[slide];viewer.setAttribute('aria-busy','true');
 $('#viewer-caption').textContent=w.captions[slide]+' · 載入原圖中…';
 $('#prev').hidden=$('#next').hidden=w.images.length<2;
 portfolioImages.load(full,'high').then(()=>{
  if(request!==viewerRequest||!dialog.open)return;
  viewer.src=full;viewer.setAttribute('aria-busy','false');
  $('#viewer-caption').textContent=w.captions[slide];
 }).catch(()=>{
  if(request!==viewerRequest||!dialog.open)return;
  viewer.setAttribute('aria-busy','false');$('#viewer-caption').textContent=w.captions[slide]+' · 原圖暫時無法載入，請關閉後重試';
 });
}
function openViewer(i,j,button){active=i;slide=j;opener=button;showImage();dialog.showModal();document.body.style.overflow='hidden'}
function closeViewer(){dialog.close()};$('#close').onclick=closeViewer;dialog.addEventListener('close',()=>{viewerRequest++;document.body.style.overflow='';opener?.focus()});dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeViewer()}};
function step(n){slide=(slide+n+data[active].images.length)%data[active].images.length;showImage()};$('#prev').onclick=()=>step(-1);$('#next').onclick=()=>step(1);dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}if(e.key==='ArrowRight'){e.preventDefault();step(1)}});
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
data.forEach((w,i)=>{const article=el('article','project');article.dataset.category=w.category;article.id='project-'+(i+1);const visual=el('div','visual'),stage=el('div','image-stage');const button=el('button','image-open');button.setAttribute('aria-label','放大 '+w.title);const img=el('img');img.src=w.previews?.[0]||w.images[0];img.alt=w.title+' — '+w.captions[0];img.loading='eager';img.decoding='async';img.width=w.width;img.height=w.height;button.append(img,el('span','zoom-hint','↗'));button.lastChild.setAttribute('aria-hidden','true');attachCardTilt(button,img);button.onclick=()=>openViewer(i,0,button);stage.append(button);visual.append(stage);const info=el('div','project-info'),meta=el('div','meta');meta.append(el('span','','PROJECT '+String(i+1).padStart(2,'0')),el('span','',w.category));info.append(meta,el('h3','',w.title));article.append(visual,info);$('#projects').append(article)});
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!paused)e.target.classList.add('reveal');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.project').forEach(n=>observer.observe(n))}
let ticking=false;function progress(){const height=document.documentElement.scrollHeight-innerHeight;$('.progress').style.width=(height>0?scrollY/height*100:0)+'%';ticking=false}addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(progress);ticking=true}},{passive:true});addEventListener('resize',progress);progress();

portfolioImages.preloadAfterLoad(data.flatMap(w=>w.images));
