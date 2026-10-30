// Os textos e o WhatsApp comercial (somente números com DDI + DDD) são editados pelo painel e ficam em config.js.
const SITE_CONFIG = window.SITE_CONFIG || {};
const WHATSAPP_NUMBER = String(SITE_CONFIG.whatsapp || "5511952909882").replace(/\D/g,"");
if(SITE_CONFIG.announcement) document.getElementById("announcement").textContent = SITE_CONFIG.announcement;
if(SITE_CONFIG.heroText) document.getElementById("heroText").textContent = SITE_CONFIG.heroText;
const categoryLabels = {baloes:"Balões", cafe:"Café da manhã", cestas:"Cestas personalizadas", casal:"Presentes para casal", kids:"Kids"};
const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
let activeFilter = "todos";
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = value => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function renderProducts(){
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const list = window.PRODUCTS.filter(p => (activeFilter === "todos" || p.cat === activeFilter) &&
    `${p.name} ${p.desc} ${categoryLabels[p.cat]}`.toLocaleLowerCase("pt-BR").includes(query));
  resultsCount.textContent = `${list.length} ${list.length === 1 ? "presente" : "presentes"}`;
  emptyState.hidden = list.length !== 0;
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-photo" data-product="${escapeHtml(p.id)}">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
        <span class="product-category">${categoryLabels[p.cat]}</span>${p.best ? '<span class="product-badge">♡ Melhor presente!</span>' : ""}
      </div>
      <div class="product-info">
        <h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc)}</p>
        <div class="product-bottom"><span class="price">${money(p.price)}</span>
          <button class="order-button" data-order="${escapeHtml(p.id)}">Quero esse ↗</button>
        </div>
      </div>
    </article>`).join("");
}
function selectFilter(filter){
  activeFilter = filter;
  document.querySelectorAll(".filter").forEach(btn => btn.classList.toggle("active",btn.dataset.filter === filter));
  renderProducts();
}
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click",()=>selectFilter(btn.dataset.filter)));
document.querySelectorAll("[data-filter]").forEach(link => {
  if(link.classList.contains("filter")) return;
  link.addEventListener("click",()=>{selectFilter(link.dataset.filter || "todos");document.getElementById("mainNav").classList.remove("open");document.getElementById("menuToggle").setAttribute("aria-expanded","false");});
});
searchInput.addEventListener("input",renderProducts);
grid.addEventListener("click",event=>{
  const btn = event.target.closest("[data-order]");
  const photo = event.target.closest("[data-product]");
  const id = btn?.dataset.order || photo?.dataset.product;
  if(!id) return;
  const product = window.PRODUCTS.find(p=>p.id===id);
  const message = `Olá! Gostaria de consultar disponibilidade para: ${product.name} — ${money(product.price)}. Poderia me passar os detalhes, por favor?`;
  if(!WHATSAPP_NUMBER || WHATSAPP_NUMBER === "5511999999999"){
    const toast = document.getElementById("toast");
    toast.textContent = "Antes de publicar, configure o número de WhatsApp no painel.";
    toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),3500);
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");
});
const menuToggle = document.getElementById("menuToggle");
menuToggle.addEventListener("click",()=>{
  const nav=document.getElementById("mainNav");
  const open=nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
});
renderProducts();
