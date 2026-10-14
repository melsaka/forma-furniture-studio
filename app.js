'use strict';

const products = [
  {id:'sofa',name:'The Sol Sofa',category:'Seating',price:2490,material:'Caramel velvet',badge:'The signature piece',colors:['#b87943','#956443','#d9c7ad'],description:'A generous place to pause. Sol combines a low, sculptural silhouette with soft, enveloping curves and the rich warmth of caramel velvet. A quiet centerpiece for long conversations and wonderfully uneventful Sundays.',dimensions:'W 240 × D 98 × H 74 cm · Seat height 42 cm',construction:'Imagined in tactile velvet upholstery with a concealed timber structure and generous cushions.',care:'Vacuum gently using an upholstery attachment. Blot spills with a soft, dry cloth; avoid rubbing and prolonged direct sunlight.'},
  {id:'chair',name:'The Lune Chair',category:'Seating',price:890,material:'Ivory bouclé · pale oak',badge:'Soft by nature',colors:['#e5ded0','#c5b394','#9b8f73'],description:'Your own little everyday escape. A cloudlike bouclé shell wraps around a deep, welcoming seat, while the pale oak base brings a gentle touch of structure. Lune is a beautiful reason to stay a little longer.',dimensions:'W 90 × D 87 × H 78 cm · Seat height 43 cm',construction:'Imagined with textured ivory bouclé upholstery, a solid pale oak base, and softly rounded arms.',care:'Brush and vacuum lightly. Blot marks with a clean cloth and use a professional upholstery cleaner for deeper cleaning.'},
  {id:'table',name:'The Ova Table',category:'Tables',price:740,material:'Natural travertine',badge:'Naturally sculptural',colors:['#d8c4a6','#bfa88b','#eee4d2'],description:'A little architecture for your living room. A softly rounded oval rests on two substantial stone pillars. The warm, imperfect character of travertine makes Ova feel grounded, generous, and quietly distinctive.',dimensions:'W 120 × D 65 × H 35 cm',construction:'Imagined in cream travertine with a rounded slab top, two sculptural pedestal legs, and naturally varied pores and veining.',care:'Use coasters and wipe with a soft, damp cloth. Avoid acidic cleaners and standing liquids on natural stone.'},
  {id:'lamp',name:'The Noma Lamp',category:'Lighting',price:185,material:'Terracotta · ivory',badge:'A warmer kind of glow',colors:['#b67950','#e8dfc9','#945b3c'],description:'Small in scale, full of personality. An earthy ceramic base meets a generous ivory shade in a warm, playful silhouette. Noma adds a soft note to a bedside table, a quiet corner, or your favorite shelf.',dimensions:'Ø 40 × H 46 cm · Concept shade Ø 40 cm',construction:'Imagined with a terracotta ceramic base and a matte ivory mushroom shade. Electrical specifications are illustrative only.',care:'Dust with a soft, dry cloth. Keep ceramic surfaces dry and avoid abrasive cleaners.'},
  {id:'sideboard',name:'The Rill Sideboard',category:'Storage',price:1290,material:'Fluted walnut',badge:'Beautifully understated',colors:['#73503a','#a2754c','#4e392b'],description:'Beautiful rhythm, everyday order. Rich walnut fluting runs across a clean, gently curved silhouette. With its low proportions and discreet doors, Rill brings warmth to a room while keeping the everyday beautifully tucked away.',dimensions:'W 180 × D 45 × H 65 cm',construction:'Imagined with walnut veneer panels, soft rounded corners, three handleless doors, and adjustable interior shelves.',care:'Wipe with a slightly damp cloth and dry immediately. Avoid heat, harsh chemicals, and prolonged direct sunlight.'},
  {id:'dining',name:'The Arc Dining Chair',category:'Seating',price:340,material:'Walnut · sand linen',badge:'Pull up a chair',colors:['#624331','#d1c1a7','#937151'],description:'Made for the conversation after dinner. A flowing walnut frame forms a continuous curve around a soft linen seat. Light in appearance and rich in character, Arc brings a little everyday elegance to the table.',dimensions:'W 56 × D 54 × H 76 cm · Seat height 46 cm',construction:'Imagined in solid walnut with a curved horseshoe back, rounded legs, and a sand linen upholstered seat.',care:'Dust wood regularly and wipe gently with a damp cloth. Blot upholstery spills promptly and keep out of strong direct sunlight.'}
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const productById = id => products.find(p => p.id === id);
const money = amount => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(amount);
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const quantity = value => Math.min(20,Math.max(1,Math.trunc(Number(value))||1));
const storage = {
  read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value ?? fallback;}catch{return fallback;}},
  write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
};
const savedRaw = storage.read('forma-saved-v1',[]);
const bagRaw = storage.read('forma-bag-v1',[]);
let saved = new Set(Array.isArray(savedRaw)?savedRaw.filter(id=>productById(id)):[]);
let bag = Array.isArray(bagRaw)?bagRaw.filter(item=>item && productById(item.id)).map(item=>({id:item.id,qty:quantity(item.qty)})):[];
let category = 'all';
let query = '';
let savedOnly = false;
let sort = 'featured';
let activeProduct = null;
let toastTimer;
const countBag = () => bag.reduce((sum,item)=>sum+item.qty,0);
const subtotal = () => bag.reduce((sum,item)=>sum+productById(item.id).price*item.qty,0);
const shipping = () => subtotal()>=1500?0:79;

function persist(){storage.write('forma-saved-v1',[...saved]);storage.write('forma-bag-v1',bag);updateHeader();}
function updateHeader(){
  const count=countBag();
  $('#bag-count').textContent=count;
  $('#bag-button').setAttribute('aria-label',`Open shopping bag, ${count} ${count===1?'item':'items'}`);
  $('.saved-dot').hidden=saved.size===0;
  $('#wishlist-button').setAttribute('aria-label',`View saved pieces, ${saved.size} saved`);
}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000);}
function openDialog(id){
  $$('dialog[open]').forEach(d=>d.close());
  const dialog=$('#'+id);if(!dialog.open)dialog.showModal();
}
function matchingProducts(term){
  const words=term.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter(p=>words.every(word=>`${p.name} ${p.category} ${p.material} ${p.description}`.toLowerCase().includes(word)));
}
function visibleProducts(){
  let list=matchingProducts(query).filter(p=>(category==='all'||p.category===category)&&(!savedOnly||saved.has(p.id)));
  if(sort==='price-low')list.sort((a,b)=>a.price-b.price);
  if(sort==='price-high')list.sort((a,b)=>b.price-a.price);
  if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}
function productCard(p){
  const isSaved=saved.has(p.id);
  return `<article class="product-card reveal"><div class="product-image"><button class="product-image-link" data-product="${p.id}" aria-label="View ${p.name}"><img src="assets/${p.id}.webp" alt="${p.name}, ${p.material.toLowerCase()}, on a light gray studio background" width="1200" height="1200" loading="lazy"></button><span class="product-badge">${p.badge}</span><button class="icon-button save-product ${isSaved?'saved':''}" data-save="${p.id}" aria-label="${isSaved?'Unsave':'Save'} ${p.name}" aria-pressed="${isSaved}">${icon('heart')}</button><button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to bag">${icon('plus')}</button></div><div class="product-meta"><button data-product="${p.id}"><h3>${p.name}</h3><p>${p.material}</p></button><span class="product-price">${money(p.price)}</span></div><div class="product-colors" aria-label="Material color palette: ${p.material}">${p.colors.map(color=>`<span class="color-dot" style="--swatch:${color}" aria-hidden="true"></span>`).join('')}<span>Material tones</span></div></article>`;
}
const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.06}):null;
function watchReveals(){ $$('.reveal:not(.in-view)').forEach(el=>observer?observer.observe(el):el.classList.add('in-view')); }
function renderProducts(){
  const list=visibleProducts();
  $('#product-grid').innerHTML=list.length?list.map(productCard).join(''):`<div class="empty-grid"><h3>${savedOnly?'Make room for a favorite.':'No pieces found.'}</h3><p>${savedOnly?'Tap the heart on a piece you love. Your saved edit will appear here.':'Try another material or browse the full collection.'}</p><button class="button button-dark" data-reset>Explore all pieces ${icon('arrow')}</button></div>`;
  $$('.category-tab').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active);});
  $('#active-filter').hidden=!query&&!savedOnly;
  $('#filter-description').textContent=[savedOnly?'Your saved edit':null,query?`Search: “${query}”`:null].filter(Boolean).join(' · ');
  $('#product-count').textContent=list.length===6&&!query&&!savedOnly&&category==='all'?'Six pieces. Endless possibilities.':`${list.length} ${list.length===1?'piece':'pieces'} in your edit.`;
  watchReveals();
}
function resetFilters(){category='all';query='';savedOnly=false;renderProducts();}
function toggleSaved(id){
  if(!productById(id))return;
  if(saved.has(id)){saved.delete(id);toast('Removed from your saved edit.');}else{saved.add(id);toast('Saved for a little later.');}
  persist();renderProducts();
  if(activeProduct===id && $('#product-dialog').open){const button=$('[data-detail-save]');if(button){button.classList.toggle('saved',saved.has(id));button.setAttribute('aria-pressed',saved.has(id));button.innerHTML=icon('heart')+(saved.has(id)?'Saved to your edit':'Save for a little later');}}
}
function addToBag(id,qty=1){
  if(!productById(id))return;
  const item=bag.find(item=>item.id===id);
  if(item)item.qty=quantity(item.qty+quantity(qty));else bag.push({id,qty:quantity(qty)});
  persist();renderBag();toast(`${productById(id).name} is in your bag.`);
}
function showProduct(id){
  const p=productById(id);if(!p)return;activeProduct=id;
  $('#product-detail').innerHTML=`<div class="product-detail-layout"><div class="product-detail-image"><img src="assets/${p.id}.webp" alt="${p.name} on a light gray studio background" width="1200" height="1200"></div><div class="product-detail-copy"><span class="eyebrow">${p.category} / THE FORMA COLLECTION</span><h2 id="product-modal-title">${p.name}</h2><p class="detail-price">${money(p.price)}</p><p class="detail-description">${p.description}</p><div class="detail-finish"><span class="color-dot" style="--swatch:${p.colors[0]}"></span><span>Finish: ${p.material}</span></div><div class="detail-add"><div class="quantity-control"><button data-detail-quantity="-1" aria-label="Decrease quantity">${icon('minus')}</button><label class="sr-only" for="detail-quantity">Quantity</label><input id="detail-quantity" type="number" min="1" max="20" value="1"><button data-detail-quantity="1" aria-label="Increase quantity">${icon('plus')}</button></div><button class="button button-dark" data-detail-add="${p.id}">Add to bag ${icon('plus')}</button></div><button class="detail-save ${saved.has(id)?'saved':''}" data-detail-save="${p.id}" aria-pressed="${saved.has(id)}">${icon('heart')}${saved.has(id)?'Saved to your edit':'Save for a little later'}</button><div class="product-specs"><details><summary>Dimensions &amp; materials</summary><p>${p.dimensions}<br><br>${p.construction}</p></details><details><summary>A little care goes a long way</summary><p>${p.care}</p></details><details><summary>Delivery, thoughtfully imagined</summary><p>Concept delivery: $79, or complimentary on an illustrative bag of $1,500 or more. Products are fictional and are not available for purchase.</p></details></div><p class="concept-note">An original fictional design. Price and specifications are illustrative. No real orders or payments.</p></div></div>`;
  openDialog('product-dialog');
}
function renderBag(){
  const count=countBag();$('#drawer-count').textContent=`(${count})`;
  if(!count){$('#bag-content').innerHTML=`<div class="empty-bag">${icon('bag')}<h3>A little room for something good.</h3><p>Your bag is waiting for its first forever piece.</p><button class="button button-dark" data-shop>Explore the collection ${icon('arrow')}</button></div>`;$('#bag-summary').innerHTML='';return;}
  $('#bag-content').innerHTML=bag.map(item=>{const p=productById(item.id);return `<article class="bag-item"><button class="bag-item-image" data-product="${p.id}" aria-label="View ${p.name}"><img src="assets/${p.id}.webp" alt="${p.name}" width="1200" height="1200"></button><div class="bag-item-info"><div class="bag-item-title"><h3>${p.name}</h3><button class="icon-button" data-remove="${p.id}" aria-label="Remove ${p.name} from bag">${icon('close')}</button></div><p>${p.material}</p><div class="bag-item-controls"><div class="quantity-control"><button data-bag-quantity="${p.id}" data-step="-1" aria-label="Decrease ${p.name} quantity" ${item.qty===1?'disabled':''}>${icon('minus')}</button><span aria-label="Quantity ${item.qty}">${item.qty}</span><button data-bag-quantity="${p.id}" data-step="1" aria-label="Increase ${p.name} quantity" ${item.qty===20?'disabled':''}>${icon('plus')}</button></div><span>${money(p.price*item.qty)}</span></div></div></article>`;}).join('');
  const sum=subtotal();
  $('#bag-summary').innerHTML=`<div class="delivery-progress">${sum>=1500?'Complimentary concept delivery unlocked.':`${money(1500-sum)} away from complimentary concept delivery.`}<div class="progress-track"><span style="width:${Math.min(100,sum/15)}%"></span></div></div><div class="total-row subtotal"><span>Subtotal</span><span>${money(sum)}</span></div><div class="total-row"><span>Concept delivery</span><span>${shipping()===0?'Complimentary':money(shipping())}</span></div><button class="button button-dark" data-checkout>Preview demo checkout ${icon('arrow')}</button><p class="concept-note">Fictional products. No real purchases or payments.</p>`;
}
function showCheckout(){
  if(!bag.length)return;
  $('#info-content').innerHTML=`<span class="eyebrow">A PREVIEW OF THE POSSIBILITIES</span><h2 id="info-title">A beautiful choice.</h2><p>Here is your imagined order. This is a storefront demonstration; no personal information or payment is needed.</p><div class="checkout-items">${bag.map(item=>`<div class="checkout-line"><span>${productById(item.id).name} × ${item.qty}</span><span>${money(productById(item.id).price*item.qty)}</span></div>`).join('')}<div class="checkout-line"><span>Concept delivery</span><span>${shipping()===0?'Complimentary':money(shipping())}</span></div><div class="checkout-line total"><strong>Illustrative total</strong><strong>${money(subtotal()+shipping())}</strong></div></div><p class="checkout-note">Demo only. Completing this preview does not purchase products, charge you, or create a real order.</p><button class="button button-dark" data-complete-demo>Complete the demo ${icon('arrow')}</button>`;
  openDialog('info-dialog');
}
function completeDemo(){
  const count=countBag();bag=[];persist();renderBag();
  $('#info-content').innerHTML=`<div class="success-mark">${icon('check')}</div><span class="eyebrow">THANK YOU FOR EXPLORING</span><h2 id="info-title">Room for good things.</h2><p>Your ${count===1?'piece has':'pieces have'} completed the demo journey. Nothing was purchased, and no payment or personal information was collected.</p><p>Your bag is now clear. Your saved pieces will still be here whenever inspiration returns.</p><button class="button button-dark" data-shop>Back to the collection ${icon('arrow')}</button>`;
}
const infoContent={
  delivery:{label:'A LITTLE CARE GOES A LONG WAY',title:'Delivery & care.',body:'Forma is a fictional furniture studio. Delivery prices shown in the bag are illustrative: $79, or complimentary for an imagined subtotal of $1,500 or more. There are no shipments or real orders.',extra:'For the concept materials: dust wood with a soft cloth, use coasters on stone, and blot upholstery spills gently. Product details include a care note for each piece.'},
  materials:{label:'BEAUTY YOU CAN ALMOST FEEL',title:'Naturally expressive.',body:'Our imagined palette brings together caramel velvet, ivory bouclé, pale oak, warm travertine, terracotta, sand linen, and richly grained walnut. Each product image was created for this original collection.',extra:'Material descriptions and dimensions are concept specifications, not verified manufacturing or sustainability claims.'},
  about:{label:'AN ORIGINAL DESIGN CONCEPT',title:'Meet Forma.',body:'Forma explores a softer way to live through sculptural furniture and an editorial shopping experience. The brand, six products, prices, and product specifications are fictional.',extra:'This is an independently created portfolio concept. You can explore, save pieces, and complete a demo shopping journey. The site does not sell furniture or process payments.'},
  privacy:{label:'SIMPLE BY DESIGN',title:'Your space stays yours.',body:'This site does not ask for your name, email, address, or payment details. Your shopping bag and saved pieces are stored only in this browser using local storage. Search terms remain in the page.',extra:'There are no analytics, tracking scripts, or third-party font requests. GitHub Pages may log visitor IP addresses for security under GitHub’s own privacy policy. Clearing your browser’s site data removes your bag and saved edit.'}
};
function showInfo(key){const info=infoContent[key];if(!info)return;$('#info-content').innerHTML=`<span class="eyebrow">${info.label}</span><h2 id="info-title">${info.title}</h2><p>${info.body}</p><p>${info.extra}</p><button class="button button-dark" data-close="info-dialog">Make yourself at home ${icon('arrow')}</button>`;openDialog('info-dialog');}
function renderSearch(){
  const term=$('#search-input').value;
  const list=matchingProducts(term);
  $('#search-results').innerHTML=list.length?list.map(p=>`<button class="search-result" data-product="${p.id}"><img src="assets/${p.id}.webp" alt="" width="1200" height="1200"><span><strong>${p.name}</strong><small>${p.material}</small></span><span>${money(p.price)}</span></button>`).join(''):`<p class="no-results">No pieces match “${escapeHTML(term)}”. Try a material or another name.</p>`;
}
function showSaved(){savedOnly=true;query='';category='all';renderProducts();$('#shop').scrollIntoView({behavior:'smooth'});}
function goShop(){ $$('dialog[open]').forEach(d=>d.close());resetFilters();$('#shop').scrollIntoView({behavior:'smooth'}); }

document.addEventListener('click',event=>{
  const el=event.target.closest('button,a');if(!el)return;
  if(el.dataset.close){$('#'+el.dataset.close)?.close();return;}
  if(el.dataset.product){showProduct(el.dataset.product);return;}
  if(el.dataset.save){toggleSaved(el.dataset.save);return;}
  if(el.dataset.detailSave){toggleSaved(el.dataset.detailSave);return;}
  if(el.dataset.add){addToBag(el.dataset.add);return;}
  if(el.dataset.detailAdd){addToBag(el.dataset.detailAdd,$('#detail-quantity').value);openDialog('bag-dialog');return;}
  if(el.dataset.detailQuantity){const input=$('#detail-quantity');input.value=quantity(Number(input.value)+Number(el.dataset.detailQuantity));return;}
  if(el.dataset.bagQuantity){const item=bag.find(item=>item.id===el.dataset.bagQuantity);if(item){item.qty=quantity(item.qty+Number(el.dataset.step));persist();renderBag();}return;}
  if(el.dataset.remove){bag=bag.filter(item=>item.id!==el.dataset.remove);persist();renderBag();return;}
  if(el.dataset.category){category=el.dataset.category;renderProducts();return;}
  if(el.dataset.info){showInfo(el.dataset.info);return;}
  if(el.hasAttribute('data-reset')){resetFilters();return;}
  if(el.hasAttribute('data-shop')){goShop();return;}
  if(el.hasAttribute('data-checkout')){showCheckout();return;}
  if(el.hasAttribute('data-complete-demo')){completeDemo();return;}
  if(el.closest('#mobile-nav')){$('#mobile-nav').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');}
});
$('#bag-button').addEventListener('click',()=>{renderBag();openDialog('bag-dialog');});
$('#search-button').addEventListener('click',()=>{renderSearch();openDialog('search-dialog');$('#search-input').focus();});
$('#search-input').addEventListener('input',renderSearch);
$('#search-form').addEventListener('submit',event=>{event.preventDefault();query=$('#search-input').value.trim();category='all';savedOnly=false;renderProducts();$('#search-dialog').close();$('#shop').scrollIntoView({behavior:'smooth'});});
$('#wishlist-button').addEventListener('click',showSaved);
$('#mobile-wishlist').addEventListener('click',showSaved);
$('#sort-select').addEventListener('change',event=>{sort=event.target.value;renderProducts();});
$('#clear-filter').addEventListener('click',resetFilters);
$('#menu-button').addEventListener('click',()=>{const nav=$('#mobile-nav');nav.hidden=!nav.hidden;$('#menu-button').setAttribute('aria-expanded',String(!nav.hidden));});
document.addEventListener('change',event=>{if(event.target.id==='detail-quantity')event.target.value=quantity(event.target.value);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#mobile-nav').hidden=true;$('#menu-button').setAttribute('aria-expanded','false');}});
$$('dialog').forEach(dialog=>{dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});});
['.section-top','.approach-intro','.approach-list','.closing-section h2'].forEach(selector=>$$(selector).forEach(el=>el.classList.add('reveal')));
persist();renderProducts();renderBag();watchReveals();
if(location.hash.startsWith('#piece='))showProduct(location.hash.slice(7));
