// MangabaRouter - Shared Utilities
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const SITE_URL = 'https://mangabarouter.online';
const SITE_NAME = 'mangaba.ai';

async function fetchModels() {
  const cached = sessionStorage.getItem('mangaba_models');
  if (cached) { try { return JSON.parse(cached); } catch(e) {} }
  try {
    const res = await fetch(`${OPENROUTER_BASE}/models`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const models = data.data || [];
    sessionStorage.setItem('mangaba_models', JSON.stringify(models));
    return models;
  } catch(err) {
    console.error('fetchModels error:', err);
    return getFallbackModels();
  }
}

function getFallbackModels() {
  return [
    {id:'openai/gpt-4o',name:'GPT-4o',description:'Most capable OpenAI model with vision',context_length:128000,pricing:{prompt:'0.000005',completion:'0.000015'}},
    {id:'openai/gpt-4o-mini',name:'GPT-4o mini',description:'Fast and affordable GPT-4 variant',context_length:128000,pricing:{prompt:'0.00000015',completion:'0.0000006'}},
    {id:'anthropic/claude-3.5-sonnet',name:'Claude 3.5 Sonnet',description:'Anthropic most intelligent model',context_length:200000,pricing:{prompt:'0.000003',completion:'0.000015'}},
    {id:'anthropic/claude-3-haiku',name:'Claude 3 Haiku',description:'Fast and compact Claude model',context_length:200000,pricing:{prompt:'0.00000025',completion:'0.00000125'}},
    {id:'google/gemini-pro-1.5',name:'Gemini Pro 1.5',description:'Google most capable multimodal model',context_length:2000000,pricing:{prompt:'0.0000025',completion:'0.0000075'}},
    {id:'google/gemini-flash-1.5',name:'Gemini Flash 1.5',description:'Fast and cost-efficient Gemini',context_length:1000000,pricing:{prompt:'0.000000075',completion:'0.0000003'}},
    {id:'meta-llama/llama-3.1-70b-instruct',name:'Llama 3.1 70B',description:'Meta large open-source model',context_length:131072,pricing:{prompt:'0.0000008',completion:'0.0000008'}},
    {id:'meta-llama/llama-3.1-8b-instruct:free',name:'Llama 3.1 8B (Free)',description:'Free Meta model',context_length:131072,pricing:{prompt:'0',completion:'0'}},
    {id:'mistralai/mistral-7b-instruct:free',name:'Mistral 7B (Free)',description:'Free Mistral model',context_length:32768,pricing:{prompt:'0',completion:'0'}},
    {id:'mistralai/mixtral-8x7b-instruct',name:'Mixtral 8x7B',description:'Mixture of experts model',context_length:32768,pricing:{prompt:'0.0000006',completion:'0.0000006'}},
    {id:'deepseek/deepseek-chat',name:'DeepSeek Chat V3',description:'DeepSeek frontier model',context_length:65536,pricing:{prompt:'0.00000027',completion:'0.0000011'}},
    {id:'deepseek/deepseek-r1',name:'DeepSeek R1',description:'DeepSeek reasoning model',context_length:65536,pricing:{prompt:'0.00000055',completion:'0.00000219'}},
    {id:'cohere/command-r-plus',name:'Command R+',description:'Cohere enterprise model',context_length:128000,pricing:{prompt:'0.000003',completion:'0.000015'}},
    {id:'microsoft/phi-3-medium-128k-instruct:free',name:'Phi-3 Medium (Free)',description:'Microsoft efficient model',context_length:128000,pricing:{prompt:'0',completion:'0'}},
    {id:'qwen/qwen-2.5-72b-instruct',name:'Qwen 2.5 72B',description:'Alibaba large language model',context_length:131072,pricing:{prompt:'0.00000035',completion:'0.0000004'}},
    {id:'perplexity/llama-3.1-sonar-large-128k-online',name:'Sonar Large Online',description:'Perplexity online search model',context_length:127072,pricing:{prompt:'0.000001',completion:'0.000001'}},
    {id:'nousresearch/hermes-3-llama-3.1-405b',name:'Hermes 3 405B',description:'Nous Research large model',context_length:131072,pricing:{prompt:'0.0000027',completion:'0.0000027'}},
    {id:'x-ai/grok-beta',name:'Grok Beta',description:'xAI conversational model',context_length:131072,pricing:{prompt:'0.000005',completion:'0.000015'}},
  ];
}

function formatPrice(priceStr) {
  const price = parseFloat(priceStr);
  if (isNaN(price) || price === 0) return '<span class="price-free">Gratis</span>';
  const perM = price * 1000000;
  if (perM < 0.01) return '$' + perM.toFixed(4) + '/M';
  return '$' + perM.toFixed(2) + '/M';
}

function formatPricePlain(priceStr) {
  const price = parseFloat(priceStr);
  if (isNaN(price) || price === 0) return 'Gratis';
  const perM = price * 1000000;
  if (perM < 0.01) return '$' + perM.toFixed(4) + '/M';
  return '$' + perM.toFixed(2) + '/M';
}

function formatContext(n) {
  if (!n) return 'N/A';
  if (n >= 1000000) return (n/1000000).toFixed(0) + 'M';
  if (n >= 1000) return (n/1000).toFixed(0) + 'K';
  return n.toString();
}

function getProvider(model) {
  if (model.id) {
    const parts = model.id.split('/');
    if (parts.length > 0) {
      const p = parts[0];
      const map = {openai:'OpenAI',anthropic:'Anthropic',google:'Google',meta:'Meta',mistralai:'Mistral',deepseek:'DeepSeek',cohere:'Cohere',microsoft:'Microsoft',qwen:'Qwen',perplexity:'Perplexity','x-ai':'xAI',nousresearch:'Nous Research'};
      return map[p] || (p.charAt(0).toUpperCase() + p.slice(1));
    }
  }
  return model.name || 'Unknown';
}

function getModelBadge(model) {
  const price = parseFloat(model.pricing && model.pricing.prompt || '0');
  if (price === 0) return '<span class="model-badge badge-free">Gratis</span>';
  if (price * 1000000 < 0.5) return '<span class="model-badge badge-cheap">Barato</span>';
  const id = model.id || '';
  if (id.includes('flash') || id.includes('haiku') || id.includes('mini') || id.includes('turbo')) {
    return '<span class="model-badge badge-fast">Rapido</span>';
  }
  if (id.includes('gpt-4o') || id.includes('claude-3.5') || id.includes('gemini-pro') || id.includes('70b') || id.includes('405b')) {
    return '<span class="model-badge badge-top">Top</span>';
  }
  return '';
}

function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg || 'Copiado!', 'success');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    showToast(msg || 'Copiado!', 'success');
  });
}

function showToast(message, type) {
  type = type || 'default';
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'i';
  toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', function() {
    mobileMenu.classList.toggle('open');
  });
  document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

function renderSkeletons(container, count) {
  container.innerHTML = Array(count).fill(0).map(function() {
    return '<div class="skeleton-card"><div class="skeleton skeleton-line medium"></div><div class="skeleton skeleton-line short" style="margin-top:8px"></div><div class="skeleton skeleton-line long" style="margin-top:16px"></div><div class="skeleton skeleton-line medium" style="margin-top:8px"></div></div>';
  }).join('');
}

function renderModelCards(models, container) {
  if (!models.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div style="font-size:3rem;margin-bottom:16px">&#128269;</div><h3>Nenhum modelo encontrado</h3><p>Tente outro termo de busca ou filtro</p></div>';
    return;
  }
  container.innerHTML = models.map(function(model) {
    const provider = getProvider(model);
    const badge = getModelBadge(model);
    const ctx = formatContext(model.context_length || (model.top_provider && model.top_provider.context_length));
    const inputPrice = formatPricePlain(model.pricing && model.pricing.prompt || '0');
    const outputPrice = formatPricePlain(model.pricing && model.pricing.completion || '0');
    const shortName = (model.name || model.id || '').replace(/^[^/]+\//, '');
    const desc = (model.description || '').slice(0, 80) + ((model.description || '').length > 80 ? '...' : '');
    return '<div class="model-card" onclick="window.location.href=\'playground.html?model=' + encodeURIComponent(model.id) + '\'">' +
      '<div class="model-card-header"><div><div class="model-name">' + shortName + '</div><div class="model-provider">' + provider + '</div></div>' + badge + '</div>' +
      '<div style="font-size:0.8rem;color:var(--foreground-faint);line-height:1.5">' + desc + '</div>' +
      '<div class="model-meta"><span>&#128208; ' + ctx + ' ctx</span></div>' +
      '<div class="model-card-footer"><div class="model-price">Input: <strong>' + inputPrice + '</strong></div><div class="model-price">Output: <strong>' + outputPrice + '</strong></div></div>' +
      '</div>';
  }).join('');
}

function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(a) {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

function animateCounter(el, target, suffix) {
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        obs.unobserve(el);
      }
    });
  }, {threshold: 0.5});
  counters.forEach(function(c) { obs.observe(c); });
}

document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  setActiveNav();
  initCounters();
});
