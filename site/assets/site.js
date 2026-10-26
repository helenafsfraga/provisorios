(function(){
  var corpo=document.body,q=function(s){return document.querySelector(s)},qa=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
  var calmo=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* menu do celular */
  var abre=q('#abre-menu'),fecha=q('#fecha-menu'),gaveta=q('#gaveta');
  function menu(a){corpo.classList.toggle('menu-aberto',a);abre.setAttribute('aria-expanded',a);gaveta.setAttribute('aria-hidden',!a);(a?fecha:abre).focus()}
  if(abre){abre.addEventListener('click',function(){menu(true)});fecha.addEventListener('click',function(){menu(false)});
    gaveta.addEventListener('click',function(e){if(e.target.closest('a')){corpo.classList.remove('menu-aberto');abre.setAttribute('aria-expanded',false);gaveta.setAttribute('aria-hidden',true)}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&corpo.classList.contains('menu-aberto'))menu(false)})}

  /* antes e depois */
  qa('.compara').forEach(function(c){c.querySelector('input').addEventListener('input',function(){c.style.setProperty('--pos',this.value+'%')})});

  /* galeria de antes e depois: roda sozinha e devagar; para com o mouse em cima; setas e dedo andam para os dois lados; nao tem fim */
  document.querySelectorAll(".galeria").forEach(function(gal){
    var gt=gal.querySelector(".galeria-trilho"),setas=gal.previousElementSibling,n=gt.children.length;
    Array.prototype.slice.call(gt.children).forEach(function(k){var d=k.cloneNode(true);d.setAttribute("aria-hidden","true");gt.appendChild(d)});
    gt.classList.add("rola");
    var calma=window.matchMedia("(prefers-reduced-motion: reduce)").matches,em=false,ate=0,pos=0,antes=0,VEL=22;
    function volta(){return gt.scrollWidth/2}
    /* mantem a posicao no meio das duas copias, para sobrar caminho para os dois lados */
    function centra(){var H=volta(),a=Math.max(0,(H-gal.clientWidth)/2),s=gal.scrollLeft,z=s;while(z<a)z+=H;while(z>=a+H)z-=H;if(z!==s)gal.scrollLeft=z;pos=gal.scrollLeft}
    function espera(ms){ate=Math.max(ate,performance.now()+ms)}
    gal.addEventListener("mouseenter",function(){em=true});
    gal.addEventListener("mouseleave",function(){em=false;espera(600)});
    ["touchstart","touchmove","wheel","pointerdown"].forEach(function(ev){gal.addEventListener(ev,function(){espera(4000)},{passive:true})});
    gal.addEventListener("touchend",function(){espera(4000)},{passive:true});
    if(setas&&setas.classList.contains("gal-setas")){
      setas.addEventListener("mouseenter",function(){em=true});
      setas.addEventListener("mouseleave",function(){em=false;espera(600)});
      setas.addEventListener("click",function(e){
        var b=e.target.closest("button");if(!b)return;
        var q=gt.children[0],passo=q.getBoundingClientRect().width+parseFloat(getComputedStyle(q).marginRight);
        centra();espera(5000);
        gal.scrollBy({left:passo*(+b.getAttribute("data-dir")),behavior:calma?"auto":"smooth"});
      });
    }
    centra();
    if(calma)return;
    requestAnimationFrame(function passo(t){
      var dt=Math.min(64,t-(antes||t));antes=t;
      if(!em&&t>ate&&gal.getBoundingClientRect().bottom>0&&gal.getBoundingClientRect().top<innerHeight){
        if(Math.abs(gal.scrollLeft-pos)>2)centra();
        pos+=VEL*dt/1000;var H=volta();if(pos>=H+Math.max(0,(H-gal.clientWidth)/2))pos-=H;
        gal.scrollLeft=pos;
      }
      requestAnimationFrame(passo);
    });
  });

  /* audios: carrossel estatico, anda so pelas setas ou pelo dedo */
  var ta=q('#trilho-audio');
  if(ta){q('#au-volta').addEventListener('click',function(){ta.scrollBy({left:-374,behavior:'smooth'})});q('#au-avanca').addEventListener('click',function(){ta.scrollBy({left:374,behavior:'smooth'})})}
  (function(){
    var cs=Array.prototype.slice.call(document.querySelectorAll('#trilho-audio .audio[data-src]')),som=null,atual=null;
    function mmss(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
    function pinta(c,k){var b=c.querySelectorAll('.onda i'),n=Math.round(k*b.length);for(var i=0;i<b.length;i++)b[i].classList.toggle('ja',i<n)}
    function estado(c,t){c.classList.toggle('tocando',t);c.querySelector('.tocar').setAttribute('aria-label',(t?'Pausar':'Ouvir')+' o depoimento de '+c.dataset.nome)}
    function zera(c){estado(c,false);pinta(c,0);c.querySelector('.tempo').textContent=mmss(+c.dataset.seg)}
    function toca(c,k){
      if(!som){som=new Audio();som.preload='none';
        som.addEventListener('timeupdate',function(){if(!atual)return;var d=isFinite(som.duration)&&som.duration?som.duration:+atual.dataset.seg;pinta(atual,som.currentTime/d);atual.querySelector('.tempo').textContent=mmss(d-som.currentTime)});
        som.addEventListener('play',function(){if(atual)estado(atual,true)});
        som.addEventListener('pause',function(){if(atual&&som.paused)estado(atual,false)});
        som.addEventListener('ended',function(){if(atual)zera(atual)});
        som.addEventListener('error',function(){if(atual)zera(atual)})}
      if(atual!==c){if(atual)zera(atual);atual=c;som.src=c.dataset.src}
      if(k!=null){try{som.currentTime=Math.max(0,Math.min(.98,k))*(+c.dataset.seg)}catch(e){}}
      var p=som.play();if(p&&p.catch)p.catch(function(){estado(c,false)})}
    cs.forEach(function(c){
      c.querySelector('.tocar').addEventListener('click',function(){if(atual===c&&!som.paused)som.pause();else toca(c)});
      c.querySelector('.onda').addEventListener('click',function(e){var r=this.getBoundingClientRect();toca(c,(e.clientX-r.left)/r.width)})});
  })();
  (function(){
    var tv=document.getElementById('trilho-video');
    function passo(tr,sel){var c=tr.querySelector(sel);return c?c.offsetWidth+parseFloat(getComputedStyle(tr).columnGap||16):tr.clientWidth}
    if(tv){
      var anda=function(s){var p=passo(tv,'.video');tv.scrollBy({left:s*Math.max(1,Math.floor(tv.clientWidth/p))*p,behavior:'smooth'})};
      document.getElementById('vi-volta').addEventListener('click',function(){anda(-1)});
      document.getElementById('vi-avanca').addEventListener('click',function(){anda(1)});
    }
    /* audios e videos andam sozinhos, dois cartoes a cada 5 segundos; param com o mouse em cima, depois de um toque e enquanto um audio toca */
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    [[document.getElementById('trilho-audio'),'.audio'],[tv,'.video']].forEach(function(x){
      var tr=x[0];if(!tr)return;var parado=false,ate=0;
      tr.addEventListener('mouseenter',function(){parado=true});
      tr.addEventListener('mouseleave',function(){parado=false});
      ['touchstart','pointerdown','focusin'].forEach(function(ev){tr.addEventListener(ev,function(){ate=Date.now()+15000},{passive:true})});
      var setas=tr.parentNode.querySelector('.setas');if(setas)setas.addEventListener('click',function(){ate=Date.now()+15000});
      setInterval(function(){
        if(parado||Date.now()<ate||document.hidden||tr.querySelector('.tocando'))return;
        var r=tr.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
        if(tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4)tr.scrollTo({left:0,behavior:'smooth'});
        else tr.scrollBy({left:2*passo(tr,x[1]),behavior:'smooth'});
      },5000);
    });
  })();
  (function(){
    var cs=document.querySelectorAll('.video[data-embed]');if(!cs.length)return;
    var j=document.createElement('div');j.className='janela';j.hidden=true;j.setAttribute('role','dialog');j.setAttribute('aria-modal','true');j.setAttribute('aria-label','Vídeo');
    j.innerHTML='<div class="janela-caixa"><button class="janela-fecha" type="button" aria-label="Fechar vídeo">&times;</button><div class="janela-quadro"></div></div>';
    document.body.appendChild(j);
    var quadro=j.querySelector('.janela-quadro'),x=j.querySelector('.janela-fecha'),volta=null;
    function abre(c){volta=c;j.classList.toggle('paisagem',c.classList.contains('paisagem'));
      var f=document.createElement('iframe');f.src=c.getAttribute('data-embed');f.title=c.getAttribute('aria-label')||'Vídeo';f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');f.setAttribute('allowfullscreen','');
      quadro.innerHTML='';quadro.appendChild(f);j.hidden=false;document.body.classList.add('com-janela');x.focus()}
    function fecha(){quadro.innerHTML='';j.hidden=true;document.body.classList.remove('com-janela');if(volta)volta.focus()}
    Array.prototype.forEach.call(cs,function(c){c.addEventListener('click',function(){abre(c)})});
    x.addEventListener('click',fecha);j.addEventListener('click',function(e){if(e.target===j)fecha()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!j.hidden)fecha()});
  })();

  /* avaliacoes: 3 conjuntos de 30 que se revezam a cada semana */
  var trilhos=qa('.roda-trilho');
  if(trilhos.length===2&&window.AVALIACOES){
    var conj=window.AVALIACOES,sem=Math.floor(Date.now()/6048e5)%conj.length,lista=conj[sem],G="<svg class=\"glogo\" viewBox=\"0 0 48 48\" aria-label=\"Google\"><path fill=\"#EA4335\" d=\"M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z\"/><path fill=\"#4285F4\" d=\"M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z\"/><path fill=\"#FBBC05\" d=\"M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z\"/><path fill=\"#34A853\" d=\"M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z\"/></svg>";
    var esc=function(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML};
    var cor=function(n){var s=0;for(var i=0;i<n.length;i++)s+=n.charCodeAt(i);return s%7};
    var cartao=function(a){return '<article class="gcard"><header><span class="gav c'+cor(a[0])+'">'+esc(a[0].charAt(0).toUpperCase())+'</span><div><b>'+esc(a[0])+'</b><span class="gst"><i>\u2605\u2605\u2605\u2605\u2605</i>'+esc(a[2])+'</span></div>'+G+'</header><p>'+esc(a[1])+'</p></article>'};
    trilhos[0].innerHTML=lista.slice(0,15).map(cartao).join('');
    trilhos[1].innerHTML=lista.slice(15).map(cartao).join('');
    if(!calmo){trilhos.forEach(function(rt){Array.prototype.slice.call(rt.children).forEach(function(k){var d=k.cloneNode(true);d.setAttribute('aria-hidden','true');rt.appendChild(d)});rt.classList.add('girando')})}
  }

  /* frase em destaque: palavra a palavra */
  var frase=q('#frase'),palavras=[];
  if(frase){(function fatia(no){Array.prototype.slice.call(no.childNodes).forEach(function(f){
      if(f.nodeType===3){var frag=document.createDocumentFragment();f.textContent.split(/(\s+)/).forEach(function(t){if(!t.trim()){frag.appendChild(document.createTextNode(t));return}var s=document.createElement('span');s.className='p';s.textContent=t;frag.appendChild(s)});no.replaceChild(frag,f)}
      else if(f.nodeType===1){fatia(f)}})})(frase);palavras=qa('#frase .p')}

  if(!('IntersectionObserver' in window)||calmo){qa('.surge,.linha-tempo').forEach(function(e){e.classList.add('dentro')});palavras.forEach(function(p){p.style.opacity=1});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('dentro');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  qa('.surge,.linha-tempo').forEach(function(e){io.observe(e)});
  if(frase){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){palavras.forEach(function(p,i){setTimeout(function(){p.style.opacity=1},i*70)});o.disconnect()}},{threshold:.4}).observe(frase)}
  function conta(el){var ate=parseFloat(el.dataset.ate),casas=+(el.dataset.casas||0),suf=el.dataset.sufixo||'',t0=null;
    function fmt(v){return casas?v.toFixed(casas).replace('.',','):Math.round(v).toLocaleString('pt-BR')}
    function passo(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1600);k=1-Math.pow(1-k,3);el.textContent=fmt(ate*k)+suf;if(k<1)requestAnimationFrame(passo)}
    requestAnimationFrame(passo)}
  var nio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){conta(e.target);nio.unobserve(e.target)}})},{threshold:.6});
  qa('.numeros strong[data-ate]').forEach(function(e){nio.observe(e)});
})();
