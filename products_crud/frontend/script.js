/* ============ ICONS ============ */
const ICO = {
  edit:'<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/><path d="M14 7l3 3"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M5 7h14M9.5 7V5h5v2M7 7l1 13h8l1-13"/></svg>'
};

/* ============ STATE / STORAGE ============ */
const KEY = 'crud_produtos_v1';
const PAGE_SIZE = 7;
let products = [];
let editingId = null;
let filterStatus = 'all';
let searchTerm = '';
let page = 1;
let currentImg = null;

const SEED = [
  {nome:'Ergonomic Mesh Chair', sku:'PRD-00041', categoria:'Furniture', marca:'Flexform', precoCents:89990, qtd:42, status:'Active', descricao:'Adjustable lumbar support', img:null},
  {nome:'Bluetooth Pro Headphones', sku:'PRD-00088', categoria:'Electronics', marca:'Soundax', precoCents:34900, qtd:128, status:'Active', descricao:'Noise cancellation', img:null},
  {nome:'Thermal Flask 1L', sku:'PRD-00112', categoria:'Accessories', marca:'ThermoGo', precoCents:8990, qtd:0, status:'Inactive', descricao:'Double-wall stainless', img:null},
  {nome:'RGB Mechanical Keyboard', sku:'PRD-00130', categoria:'Electronics', marca:'KeyForge', precoCents:45900, qtd:7, status:'Active', descricao:'Tactile switch', img:null},
  {nome:'LED Desk Lamp', sku:'PRD-00155', categoria:'Furniture', marca:'Lumio', precoCents:15990, qtd:63, status:'Active', descricao:'3 color temperatures', img:null},
  {nome:'Anti-theft Slim Backpack', sku:'PRD-00163', categoria:'Accessories', marca:'UrbanPack', precoCents:21900, qtd:5, status:'Inactive', descricao:'Built-in USB port', img:null},
  {nome:'Monitor 27” QHD', sku:'PRD-00177', categoria:'Electronics', marca:'ViewMax', precoCents:159900, qtd:23, status:'Active', descricao:'144Hz IPS', img:null}
];

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw){ products = JSON.parse(raw); }
    else { products = SEED.map((p,i)=>({id:'p'+(i+1), ...p})); save(); }
  }catch(e){ products = SEED.map((p,i)=>({id:'p'+(i+1), ...p})); }
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(products)); }catch(e){} }

/* ============ HELPERS ============ */
const $ = s => document.querySelector(s);
function brl(cents){ return (cents/100).toLocaleString('en-US',{style:'currency',currency:'USD'}); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ============ FORM ELEMENTS ============ */
const els = {
  nome:$('#f-nome'), sku:$('#f-sku'), cat:$('#f-cat'), marca:$('#f-marca'),
  preco:$('#f-preco'), qtd:$('#f-qtd'), status:$('#f-status'), desc:$('#f-desc')
};
const editBadge = $('#editBadge'), btnSave = $('#btnSave'), btnCancel = $('#btnCancel'), formMsg = $('#formMsg'), headHint = $('#headHint');

/* currency mask */
els.preco.addEventListener('input', e=>{
  let d = e.target.value.replace(/\D/g,'');
  if(d===''){ e.target.value=''; e.target.dataset.cents='0'; return; }
  const cents = parseInt(d,10);
  e.target.dataset.cents = cents;
  e.target.value = brl(cents);
});

/* clear invalid on input */
Object.values(els).forEach(el=>el.addEventListener('input',()=>{ el.closest('.field').classList.remove('invalid'); formMsg.classList.remove('show'); }));

/* ============ IMAGE UPLOAD ============ */
const imgDrop = $('#imgDrop'), imgInput = $('#imgInput'), imgBtn = $('#imgBtn'), imgRemove = $('#imgRemove');
function setImage(dataUrl){
  currentImg = dataUrl;
  if(dataUrl){ imgDrop.classList.add('has-img'); imgDrop.style.backgroundImage = `url('${dataUrl}')`; imgRemove.style.display=''; imgBtn.textContent='Change image'; }
  else { imgDrop.classList.remove('has-img'); imgDrop.style.backgroundImage=''; imgRemove.style.display='none'; imgBtn.textContent='Select image'; }
}
function readImageFile(file){
  if(!file || !file.type.startsWith('image/')) return;
  const r = new FileReader();
  r.onload = ()=> setImage(r.result);
  r.readAsDataURL(file);
}
imgBtn.addEventListener('click', ()=>imgInput.click());
imgDrop.addEventListener('click', ()=>imgInput.click());
imgInput.addEventListener('change', e=>readImageFile(e.target.files[0]));
imgRemove.addEventListener('click', ()=>{ setImage(null); imgInput.value=''; });
imgDrop.addEventListener('dragover', e=>{ e.preventDefault(); imgDrop.classList.add('drag'); });
imgDrop.addEventListener('dragleave', ()=>imgDrop.classList.remove('drag'));
imgDrop.addEventListener('drop', e=>{ e.preventDefault(); imgDrop.classList.remove('drag'); readImageFile(e.dataTransfer.files[0]); });

/* ============ SAVE / EDIT / CLEAR ============ */
$('#prodForm').addEventListener('submit', e=>{ e.preventDefault(); onSave(); });
$('#btnClear').addEventListener('click', resetForm);
btnCancel.addEventListener('click', resetForm);

function onSave(){
  const cents = parseInt(els.preco.dataset.cents||'0',10);
  let ok = true;
  function mark(name,bad){ els[name].closest('.field').classList.toggle('invalid',bad); if(bad) ok=false; }
  mark('nome', els.nome.value.trim()==='');
  mark('cat', els.cat.value==='');
  mark('preco', !(cents>0));
  if(!ok){ formMsg.classList.add('show'); return; }

  const data = {
    nome: els.nome.value.trim(),
    sku: els.sku.value.trim() || '—',
    categoria: els.cat.value,
    marca: els.marca.value.trim() || '—',
    precoCents: cents,
    qtd: Math.max(0, parseInt(els.qtd.value||'0',10) || 0),
    status: els.status.value,
    descricao: els.desc.value.trim(),
    img: currentImg
  };

  if(editingId){
    const p = products.find(x=>x.id===editingId);
    Object.assign(p, data);
    toast('Product updated');
  } else {
    products.unshift({ id:'p'+Date.now(), ...data });
    page = 1;
    toast('Product registered');
  }
  save();
  resetForm();
  render();
}

function editProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  editingId = id;
  els.nome.value = p.nome; els.sku.value = p.sku==='—'?'':p.sku;
  els.cat.value = p.categoria; els.marca.value = p.marca==='—'?'':p.marca;
  els.preco.dataset.cents = p.precoCents; els.preco.value = brl(p.precoCents);
  els.qtd.value = p.qtd; els.status.value = p.status; els.desc.value = p.descricao;
  setImage(p.img);
  Object.values(els).forEach(el=>el.closest('.field').classList.remove('invalid'));
  formMsg.classList.remove('show');
  editBadge.style.display=''; editBadge.textContent = 'Editing';
  btnSave.textContent = 'Update product';
  btnCancel.style.display='';
  headHint.textContent = 'editing: '+p.sku;
}

function resetForm(){
  editingId = null;
  $('#prodForm').reset();
  els.preco.dataset.cents = '0';
  setImage(null); imgInput.value='';
  Object.values(els).forEach(el=>el.closest('.field').classList.remove('invalid'));
  formMsg.classList.remove('show');
  editBadge.style.display='none';
  btnSave.textContent = 'Save product';
  btnCancel.style.display='none';
  headHint.textContent = 'new product';
}

/* ============ DELETE (modal) ============ */
const modal = $('#modal'), modalText = $('#modalText');
let pendingDelete = null;
function askDelete(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  pendingDelete = id;
  modalText.innerHTML = `Are you sure you want to delete <b>${esc(p.nome)}</b>? This action cannot be undone.`;
  modal.classList.add('show');
}
$('#modalCancel').addEventListener('click', ()=>{ modal.classList.remove('show'); pendingDelete=null; });
$('#modalOk').addEventListener('click', ()=>{
  if(pendingDelete){
    if(editingId===pendingDelete) resetForm();
    products = products.filter(x=>x.id!==pendingDelete);
    save(); render(); toast('Product deleted','danger');
  }
  modal.classList.remove('show'); pendingDelete=null;
});
modal.addEventListener('click', e=>{ if(e.target===modal){ modal.classList.remove('show'); pendingDelete=null; } });

/* ============ FILTERS ============ */
$('#search').addEventListener('input', e=>{ searchTerm = e.target.value.trim().toLowerCase(); page=1; render(); });
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click', ()=>{
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));
  c.classList.add('on'); filterStatus = c.dataset.status; page=1; render();
}));

function getFiltered(){
  return products.filter(p=>{
    if(filterStatus==='active' && p.status!=='Active') return false;
    if(filterStatus==='inactive' && p.status!=='Inactive') return false;
    if(searchTerm){ const hay=(p.nome+' '+p.sku+' '+p.categoria+' '+p.marca).toLowerCase(); if(!hay.includes(searchTerm)) return false; }
    return true;
  });
}

/* ============ RENDER ============ */
const tbody = $('#tbody'), countEl = $('#count'), footInfo = $('#footInfo'), pager = $('#pager');

function rowHTML(p){
  const sc = p.qtd===0 ? 'zero' : (p.qtd<=10 ? 'low' : '');
  const sl = p.status==='Active' ? 'active' : 'inactive';
  const thumb = p.img ? `<div class="thumb" style="background-image:url('${p.img}')"></div>` : `<div class="thumb empty"></div>`;
  return `<tr>
    <td>${thumb}</td>
    <td class="cell-name">${esc(p.nome)}<small>${esc(p.sku)}</small></td>
    <td>${esc(p.categoria)}</td>
    <td class="price">${brl(p.precoCents)}</td>
    <td><span class="stock ${sc}">${p.qtd}</span></td>
    <td><span class="pill ${sl}">${p.status}</span></td>
    <td><div class="acoes">
      <button class="act-btn" data-act="edit" data-id="${p.id}" title="Edit">${ICO.edit}</button>
      <button class="act-btn del" data-act="del" data-id="${p.id}" title="Delete">${ICO.trash}</button>
    </div></td>
  </tr>`;
}

function render(){
  const list = getFiltered();
  const pages = Math.max(1, Math.ceil(list.length/PAGE_SIZE));
  if(page>pages) page = pages;
  const start = (page-1)*PAGE_SIZE;
  const slice = list.slice(start, start+PAGE_SIZE);

  if(slice.length){
    tbody.innerHTML = slice.map(rowHTML).join('');
  } else {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No products found<div class="es-sub">${products.length? 'Adjust the search or filters.' : 'Register the first product above.'}</div></div></td></tr>`;
  }
  countEl.textContent = products.length;
  footInfo.textContent = list.length ? `Showing ${start+1}—${Math.min(start+PAGE_SIZE, list.length)} of ${list.length} product${list.length>1?'s':''}` : 'No results';
  renderPager(pages);
}

function renderPager(pages){
  if(pages<=1){ pager.innerHTML=''; return; }
  let html = `<div class="pg ${page===1?'disabled':''}" data-pg="${page-1}">‹</div>`;
  for(let i=1;i<=pages;i++) html += `<div class="pg ${i===page?'on':''}" data-pg="${i}">${i}</div>`;
  html += `<div class="pg ${page===pages?'disabled':''}" data-pg="${page+1}">›</div>`;
  pager.innerHTML = html;
}

/* event delegation for table + pager */
tbody.addEventListener('click', e=>{
  const b = e.target.closest('.act-btn'); if(!b) return;
  if(b.dataset.act==='edit') editProduct(b.dataset.id);
  else askDelete(b.dataset.id);
});
pager.addEventListener('click', e=>{
  const pg = e.target.closest('.pg'); if(!pg || pg.classList.contains('disabled')) return;
  page = parseInt(pg.dataset.pg,10); render();
});

/* ============ TOAST ============ */
let toastT;
function toast(msg, kind){
  const t = $('#toast'); $('#toastText').textContent = msg;
  t.classList.toggle('danger', kind==='danger');
  t.classList.add('show'); clearTimeout(toastT);
  toastT = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ============ SCALE ============ */
function scale(){
  const s = Math.min(window.innerWidth/1440, window.innerHeight/900);
  $('#canvas').style.transform = `scale(${s})`;
}
window.addEventListener('resize', scale);

/* ============ INIT ============ */
load();
render();
resetForm();
scale();
