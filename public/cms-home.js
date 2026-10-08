(async function(){
 'use strict';
 function safeUrl(value,image){try{if(typeof value!=='string'||!value.trim())return null;const u=new URL(value,location.origin);if(u.protocol!=='https:'&&u.origin!==location.origin)return null;if(image&&!/\.(png|jpe?g|webp|gif)$/i.test(u.pathname))return null;return u.href;}catch{return null;}}
 function setBannerBackground(slide,item){const src=safeUrl(item.image,true);if(!src||!slide)return;const img=new Image();img.onload=()=>{slide.style.backgroundImage='url('+JSON.stringify(src)+')';slide.classList.add('hero-has-background');};img.src=src;}
 function setBannerCopy(slide,item){
  if(!slide||!item)return;
  const copy=slide.querySelector('.hero-copy');if(!copy)return;
  const fields=[['label','.hero-kicker'],['title','h1'],['description','p'],['button_label','.hero-cta']];
  fields.forEach(([key,selector])=>{
    if(typeof item[key]!=='string'||!item[key].trim())return;
    const el=copy.querySelector(selector);if(!el)return;
    if(key==='title'){el.textContent=item[key];el.style.whiteSpace='pre-line';}
    else el.textContent=item[key];
  });
  if(typeof item.link==='string'&&item.link.trim()){
    const href=safeUrl(item.link,false),button=copy.querySelector('.hero-cta');
    if(href&&button)button.href=href;
  }
}
 function setImage(container,item){const src=safeUrl(item.image,true);if(!src||!container)return;const img=document.createElement('img');img.src=src;img.alt=String(item.alt||'');img.style.cssText='width:100%;height:100%;object-fit:contain;border-radius:16px;display:block';img.onload=()=>{container.replaceChildren(img);if(img.alt)container.removeAttribute('aria-hidden');};}
 try{const r=await fetch('/content/home.json',{cache:'no-cache'});if(!r.ok)return;const data=await r.json();
 (data.banners||[]).forEach(item=>{if(!Number.isInteger(Number(item.id))||Number(item.id)<1)return;const slide=document.querySelectorAll('#heroTrack .hero-slide')[Number(item.id)-1];if(!slide)return;setBannerBackground(slide,item);setBannerCopy(slide,item);});
 if(typeof window.teumSetActiveBanners==='function')window.teumSetActiveBanners((data.banners||[]));
 (data.cards||[]).forEach(item=>{const card=document.querySelectorAll('.ai-feed-card')[Number(item.id)-1];if(card)setImage(card.querySelector('.ai-feed-image'),item);});
 }catch{/* Keep the existing homepage when content is unavailable. */}
})();
