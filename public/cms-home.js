(async function(){
 'use strict';
 function safeUrl(value,image){try{if(typeof value!=='string'||!value.trim())return null;const u=new URL(value,location.origin);if(u.protocol!=='https:'&&u.origin!==location.origin)return null;if(image&&!/\.(png|jpe?g|webp|gif)$/i.test(u.pathname))return null;return u.href;}catch{return null;}}
 function setImage(container,item){const src=safeUrl(item.image,true);if(!src||!container)return;const img=document.createElement('img');img.src=src;img.alt=String(item.alt||'');img.style.cssText='width:100%;height:100%;object-fit:contain;border-radius:16px;display:block';img.onload=()=>{container.replaceChildren(img);if(img.alt)container.removeAttribute('aria-hidden');};}
 try{const r=await fetch('/content/home.json',{cache:'no-cache'});if(!r.ok)return;const data=await r.json();
 (data.banners||[]).forEach(item=>{if(!Number.isInteger(Number(item.id))||Number(item.id)<1)return;const slide=document.querySelectorAll('#heroTrack .hero-slide')[Number(item.id)-1];if(!slide)return;setImage(slide.querySelector('.hero-art'),item);const title=slide.querySelector('h1');if(item.title&&title){title.textContent=item.title;title.style.whiteSpace='pre-line';}if(item.description)slide.querySelector('.hero-copy p').textContent=item.description;const button=slide.querySelector('.hero-cta');if(item.button_label)button.textContent=item.button_label;const href=safeUrl(item.link,false);if(href)button.href=href;});
 (data.cards||[]).forEach(item=>{const card=document.querySelectorAll('.ai-feed-card')[Number(item.id)-1];if(card)setImage(card.querySelector('.ai-feed-image'),item);});
 }catch{/* Keep the existing homepage when content is unavailable. */}
})();
