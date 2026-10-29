const CATS = {baloes:"Balões", cafe:"Café da manhã", cestas:"Cestas personalizadas", casal:"Presentes para casal", kids:"Kids"};
const $ = id => document.getElementById(id);
let state = {products: [], settings: {}}, dirty = false, uploadTarget = null;
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const imgSrc = p => p.image ? (/^https?:/.test(p.image) ? p.image : "site/" + p.image) : "";

function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000);}
function setStatus(s, text){$("status").dataset.state=s;$("statusText").textContent=text;$("saveBtn").disabled=s!=="dirty";}
function markDirty(){dirty=true;setStatus("dirty","Alterações não salvas");}
function reloadPreview(){$("previewFrame").src="site/?v="+Date.now();}

function renderList(){
  const q=$("search").value.trim().toLowerCase(), cat=$("catFilter").value;
  const items=state.products.map((p,i)=>({p,i})).filter(({p})=>(!cat||p.cat===cat)&&`${p.name} ${p.desc}`.toLowerCase().includes(q));
  $("productCount").textContent=`(${state.products.length})`;
  $("emptyList").hidden=items.length>0;
  $("productList").innerHTML=items.map(({p,i})=>`
    <article class="item" data-i="${i}">
      <img src="${esc(imgSrc(p))}" alt="">
      <div class="fields">
        <label class="full">Nome<input data-f="name" value="${esc(p.name)}"></label>
        <label>Categoria<select data-f="cat">${Object.entries(CATS).map(([k,v])=>`<option value="${k}"${k===p.cat?" selected":""}>${v}</option>`).join("")}</select></label>
        <label>Preço (R$)<input data-f="price" type="number" min="0" step="0.01" value="${esc(p.price)}"></label>
        <label class="full">Descrição<textarea data-f="desc" rows="2">${esc(p.desc)}</textarea></label>
        <div class="row">
          <label><input type="checkbox" data-f="best"${p.best?" checked":""}> Selo “Melhor presente!”</label>
          <button class="mini" data-act="image">Trocar imagem</button>
          <button class="mini" data-act="up">↑</button><button class="mini" data-act="down">↓</button>
          <button class="mini danger" data-act="del">Excluir</button>
        </div>
      </div>
    </article>`).join("");
}
function renderSettings(){document.querySelectorAll("[data-setting]").forEach(el=>el.value=state.settings[el.dataset.setting]??"");}

async function load(){
  try{
    const r=await fetch("/api/catalog");if(!r.ok)throw new Error();
    state=await r.json();dirty=false;renderList();renderSettings();setStatus("saved","Tudo salvo");reloadPreview();
  }catch{setStatus("error","Não foi possível carregar os dados");}
}
async function save(){
  setStatus("loading","Salvando…");
  try{
    const r=await fetch("/api/catalog",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(state)});
    const data=await r.json();if(!r.ok)throw new Error(data.error||"Erro ao salvar.");
    state=data;dirty=false;renderList();renderSettings();setStatus("saved","Tudo salvo");
    reloadPreview();toast("Alterações salvas! A prévia foi atualizada.");
    window.open("site/?v="+Date.now(),"maiaPreview");
  }catch(e){setStatus("dirty","Alterações não salvas");toast(e.message);}
}

$("productList").addEventListener("input",e=>{
  const f=e.target.dataset.f;if(!f)return;const p=state.products[e.target.closest(".item").dataset.i];
  p[f]=f==="best"?e.target.checked:f==="price"?Number(e.target.value):e.target.value;markDirty();
});
$("productList").addEventListener("click",e=>{
  const act=e.target.dataset.act;if(!act)return;const i=Number(e.target.closest(".item").dataset.i),list=state.products;
  if(act==="del"){if(!confirm(`Excluir “${list[i].name}”?`))return;list.splice(i,1);}
  else if(act==="up"&&i>0)[list[i-1],list[i]]=[list[i],list[i-1]];
  else if(act==="down"&&i<list.length-1)[list[i+1],list[i]]=[list[i],list[i+1]];
  else if(act==="image"){uploadTarget=i;$("imageInput").click();return;}
  else return;
  markDirty();renderList();
});
$("imageInput").addEventListener("change",async()=>{
  const file=$("imageInput").files[0];$("imageInput").value="";if(!file||uploadTarget==null)return;
  const fd=new FormData();fd.append("file",file);toast("Enviando imagem…");
  const r=await fetch("/api/uploads",{method:"POST",body:fd});const data=await r.json();
  if(!r.ok)return toast(data.error||"Erro ao enviar imagem.");
  state.products[uploadTarget].image=data.image;markDirty();renderList();
});
$("addBtn").addEventListener("click",()=>{
  state.products.unshift({id:"produto-"+Date.now(),cat:$("catFilter").value||"baloes",name:"Novo produto",price:0,image:"",desc:"",best:false});
  $("search").value="";markDirty();renderList();
});
document.querySelectorAll("[data-setting]").forEach(el=>el.addEventListener("input",()=>{state.settings[el.dataset.setting]=el.value;markDirty();}));
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));
  document.querySelectorAll(".panel-section").forEach(s=>s.hidden=s.id!=="tab-"+t.dataset.tab);
}));
document.querySelectorAll("[data-device]").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("[data-device]").forEach(x=>x.classList.toggle("active",x===b));
  $("previewFrameWrap").classList.toggle("mobile",b.dataset.device==="mobile");
}));
$("catFilter").innerHTML=`<option value="">Todas as categorias</option>`+Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join("");
$("search").addEventListener("input",renderList);$("catFilter").addEventListener("change",renderList);
$("saveBtn").addEventListener("click",save);
$("previewBtn").addEventListener("click",()=>{if(dirty)toast("A prévia mostra a versão salva. Salve para ver as alterações.");window.open("site/?v="+Date.now(),"maiaPreview");});
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue="";}});

// Exporta o site completo (HTML, CSS, JS, catálogo e imagens) em um .zip pronto para publicar.
$("exportBtn").addEventListener("click",async()=>{
  if(dirty&&!confirm("Há alterações não salvas. Exportar a versão salva mesmo assim?"))return;
  const btn=$("exportBtn");btn.disabled=true;btn.textContent="Gerando arquivo…";
  try{
    const zip=new JSZip(),bust="?v="+Date.now();
    const get=async(path,type="text")=>{const r=await fetch("site/"+path+bust);if(!r.ok)throw new Error("Falha ao baixar "+path);return type==="text"?r.text():r.blob();};
    for(const f of["index.html","styles.css","app.js","config.js","products.js","readme.txt"])zip.file(f,await get(f));
    const {products}=await (await fetch("/api/catalog")).json();
    const images=[...new Set(products.map(p=>p.image).filter(i=>i&&!/^https?:/.test(i)))];
    if(!images.includes("assets/catalogo-56.jpg"))images.push("assets/catalogo-56.jpg");
    for(const img of images)zip.file(img,await get(img,"blob"));
    const blob=await zip.generateAsync({type:"blob"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`maia-balloons-site-${new Date().toISOString().slice(0,10)}.zip`;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast("Arquivo do site exportado!");
  }catch(e){toast(e.message||"Erro ao exportar.");}
  finally{btn.disabled=false;btn.textContent="Exportar site (.zip) ↓";}
});
load();
