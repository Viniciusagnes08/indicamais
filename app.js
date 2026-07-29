'use strict';

/* =========================================================
   INDICA+ ST1 — DASHBOARD AO VIVO
   Fonte: INDICA+ CENTRAL via Google Apps Script
   ========================================================= */

const INDICAMAIS_API_URL =
  'https://script.google.com/macros/s/AKfycbwrM2DIPVTtkpyuIL0Cke2-FC1kxtrPZg0cg8wxFseMAaj7q2KwNc9U5VlvUxWCutYhfg/exec?route=indicamais';

const COMPETITION_GOAL = 20;
const POINTS_PER_SALE = 100;
const REFRESH_INTERVAL_MS = 120000;
const DATA_NOW = new Date();

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const number = new Intl.NumberFormat('pt-BR');

let employees = [];
let referrals = [];
let sales = [];
let lastSnapshot = '';
let lastSyncAt = null;

const territories = [
  { id: 'sao-luis', name: 'São Luís', short: 'SLZ', lat: -2.5307, lng: -44.3068 },
  { id: 'sao-jose-de-ribamar', name: 'São José de Ribamar', short: 'SJR', lat: -2.5610, lng: -44.0543 },
  { id: 'paco-do-lumiar', name: 'Paço do Lumiar', short: 'PÇO', lat: -2.5316, lng: -44.1070 },
  { id: 'raposa', name: 'Raposa', short: 'RPS', lat: -2.4254, lng: -44.0973 },
  { id: 'bacabeira', name: 'Bacabeira', short: 'BAC', lat: -2.9645, lng: -44.3164 }
];

const state = {
  view: 'dashboard',
  period: 'month',
  department: 'all',
  territoryId: 'all',
  search: '',
  metric: 'sales'
};

let map = null;
let markerLayer = null;
const markerByTerritory = new Map();

function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = el(id);
  if (element) element.textContent = String(value ?? '');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function slug(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'sem-identificacao';
}

function initials(value) {
  return String(value || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;

  const raw = String(value ?? '').trim().replace(/[^0-9,.-]/g, '');
  if (!raw) return 0;

  if (raw.includes(',')) {
    return Number(raw.replace(/\./g, '').replace(',', '.')) || 0;
  }

  return Number(raw) || 0;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  const normalized = normalize(value);
  return ['sim', 'true', '1', 'yes', 'venda', 'vendido', 'ganho', 'venda ganha'].includes(normalized);
}

function toIsoDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value).trim();
  const brazilian = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brazilian) return `${brazilian[3]}-${brazilian[2]}-${brazilian[1]}`;

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsed.toISOString().slice(0, 10);
}

function parseDate(value) {
  return new Date(`${toIsoDate(value)}T12:00:00-03:00`);
}

function formatDate(value) {
  return parseDate(value)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '');
}

function pick(object, aliases) {
  if (!object || typeof object !== 'object') return '';
  const keys = Object.keys(object);

  for (const alias of aliases) {
    const expected = normalize(alias);
    const key = keys.find(candidate => normalize(candidate) === expected);
    if (key !== undefined) return object[key];
  }

  return '';
}

function normalizePayloadRows(payload) {
  let rows = payload?.rows
    ?? payload?.data
    ?? payload?.records
    ?? payload?.result
    ?? payload?.indicacoes
    ?? payload?.values
    ?? [];

  if (!Array.isArray(rows)) return [];
  if (!rows.length) return [];

  if (Array.isArray(rows[0])) {
    const [headerRow, ...dataRows] = rows;
    return dataRows.map(row => {
      const object = {};
      headerRow.forEach((header, index) => {
        object[String(header || `COL_${index + 1}`)] = row[index];
      });
      return object;
    });
  }

  return rows.filter(row => row && typeof row === 'object');
}

function normalizeApiRow(source, index) {
  const indicante = pick(source, [
    'indicante',
    'Nome do indicante',
    'Nome do indicador',
    'Indicador'
  ]);

  if (!String(indicante || '').trim()) return null;

  const saleFlag = pick(source, [
    'vendaValida',
    'Venda válida?',
    'Venda valida?',
    'Venda válida',
    'Venda valida'
  ]);

  const stage = pick(source, [
    'Etapa padronizada',
    'Etapa Kommo',
    'Etapa',
    'Status comercial'
  ]);

  const type = pick(source, [
    'Tipo do registro',
    'Tipo',
    'Indicador/Venda',
    'Classificação',
    'Classificacao'
  ]);

  const vendaValida = parseBoolean(saleFlag)
    || normalize(stage).includes('venda ganha')
    || normalize(stage).includes('ganho')
    || normalize(type) === 'venda';

  return {
    registroId: pick(source, ['registroId', 'Registro ID', 'Lead ID Kommo', 'Lead ID', 'ID']) || `INDICA-${index + 1}`,
    indicanteId: pick(source, ['indicanteId', 'Indicante ID', 'ID do indicante', 'Código REF', 'Codigo REF']),
    codigoRef: pick(source, ['codigoRef', 'Código REF', 'Codigo REF']),
    indicante: String(indicante).trim(),
    equipe: String(pick(source, ['equipe', 'Equipe do indicante', 'Equipe', 'Setor', 'Departamento']) || 'Outros').trim(),
    municipio: String(pick(source, ['municipio', 'Município', 'Municipio', 'Cidade']) || '').trim(),
    bairro: String(pick(source, ['bairro', 'Bairro / localidade', 'Bairro', 'Localidade']) || '').trim(),
    plano: String(pick(source, ['plano', 'Plano', 'Plano contratado', 'Produto']) || '').trim(),
    mrr: parseNumber(pick(source, ['mrr', 'MRR', 'Valor', 'Mensalidade', 'Valor da venda'])),
    vendaValida,
    dataVenda: pick(source, ['dataVenda', 'Data da venda', 'Atualizado no Kommo em', 'Última atualização', 'Ultima atualização']),
    dataIndicacao: pick(source, ['dataIndicacao', 'Form enviado em', 'Criado no Kommo em', 'Data da indicação', 'Data da indicacao']),
    latitude: parseNumber(pick(source, ['latitude', 'Latitude', 'Lat'])),
    longitude: parseNumber(pick(source, ['longitude', 'Longitude', 'Lng', 'Lon']))
  };
}

function findOrCreateTerritory(row) {
  const municipality = String(row.municipio || '').trim();
  const normalizedMunicipality = normalize(municipality);

  const existing = territories.find(item => normalize(item.name) === normalizedMunicipality);
  if (existing) return existing.id;

  if (municipality) {
    const id = slug(municipality);
    const alreadyCreated = territories.find(item => item.id === id);
    if (alreadyCreated) return alreadyCreated.id;

    const hasCoordinates = Number.isFinite(row.latitude)
      && Number.isFinite(row.longitude)
      && row.latitude !== 0
      && row.longitude !== 0;

    territories.push({
      id,
      name: municipality,
      short: municipality.slice(0, 3).toUpperCase(),
      lat: hasCoordinates ? row.latitude : -2.55,
      lng: hasCoordinates ? row.longitude : -44.20,
      approximate: !hasCoordinates
    });

    return id;
  }

  let fallback = territories.find(item => item.id === 'sem-territorio');
  if (!fallback) {
    fallback = {
      id: 'sem-territorio',
      name: 'Sem município identificado',
      short: '—',
      lat: -2.55,
      lng: -44.20,
      approximate: true
    };
    territories.push(fallback);
  }

  return fallback.id;
}

function applyLiveRows(rawRows) {
  const rows = rawRows
    .map(normalizeApiRow)
    .filter(Boolean);

  const employeeMap = new Map();
  const nextReferrals = [];
  const nextSales = [];

  rows.forEach((row, index) => {
    const employeeId = slug(row.indicanteId || row.codigoRef || row.indicante);
    const territoryId = findOrCreateTerritory(row);
    const referralDate = toIsoDate(row.dataIndicacao || row.dataVenda);
    const recordId = String(row.registroId || `INDICA-${index + 1}`);

    if (!employeeMap.has(employeeId)) {
      employeeMap.set(employeeId, {
        id: employeeId,
        name: row.indicante,
        department: row.equipe || 'Outros',
        initials: initials(row.indicante)
      });
    }

    nextReferrals.push({
      id: recordId,
      employeeId,
      territoryId,
      date: referralDate,
      status: 'valid'
    });

    if (row.vendaValida) {
      nextSales.push({
        id: recordId,
        employeeId,
        territoryId,
        date: toIsoDate(row.dataVenda || row.dataIndicacao),
        neighborhood: row.bairro || 'Sem localidade',
        plan: row.plano || 'Plano não informado',
        mrr: row.mrr,
        status: 'confirmed'
      });
    }
  });

  employees = [...employeeMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  referrals = nextReferrals;
  sales = nextSales;

  state.department = 'all';
  state.territoryId = 'all';
  state.search = '';
  state.metric = 'sales';

  initSelects();
  renderAll();

  return {
    referrals: referrals.length,
    sales: sales.length,
    mrr: sales.reduce((total, sale) => total + sale.mrr, 0)
  };
}

function updateSourceStatus(status, message) {
  const footer = document.querySelector('.sidebar-footer');
  if (footer) {
    footer.innerHTML = `
      <span class="status-dot"></span>
      <div>
        <strong>${status === 'online' ? 'Dados ao vivo' : 'Falha na integração'}</strong>
        <small>${escapeHtml(message)}</small>
      </div>`;
  }

  const sourceCard = [...document.querySelectorAll('.admin-card')]
    .find(card => normalize(card.textContent).includes('fonte de dados'));

  if (sourceCard) {
    const paragraph = sourceCard.querySelector('p');
    const badge = sourceCard.querySelector('.status-badge');

    if (paragraph) {
      paragraph.textContent = status === 'online'
        ? 'Dados reais sincronizados com Kommo e INDICA+ CENTRAL.'
        : message;
    }

    if (badge) {
      badge.textContent = status === 'online' ? 'AO VIVO' : 'ERRO';
      badge.classList.toggle('success', status === 'online');
      badge.classList.toggle('warning', status !== 'online');
    }
  }
}

async function loadLiveData({ silent = false } = {}) {
  try {
    updateSourceStatus('loading', 'Sincronizando INDICA+ CENTRAL...');

    const separator = INDICAMAIS_API_URL.includes('?') ? '&' : '?';
    const response = await fetch(`${INDICAMAIS_API_URL}${separator}_=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error(`A API respondeu HTTP ${response.status}.`);

    const payload = await response.json();
    if (!payload || payload.ok !== true) {
      throw new Error(payload?.error ? `API: ${payload.error}` : 'A API não retornou ok=true.');
    }

    const rows = normalizePayloadRows(payload);
    const snapshot = JSON.stringify(rows);
    const changed = snapshot !== lastSnapshot;
    lastSnapshot = snapshot;

    const metrics = applyLiveRows(rows);
    lastSyncAt = new Date();

    updateSourceStatus(
      'online',
      `${metrics.referrals} indicações · ${metrics.sales} vendas · ${money.format(metrics.mrr)} de MRR`
    );

    const saleButton = el('openSaleModal');
    if (saleButton) {
      saleButton.disabled = true;
      saleButton.textContent = 'Sincronizado pelo Kommo';
      saleButton.title = 'As vendas são registradas no Kommo e sincronizadas automaticamente.';
    }

    if (changed && !silent) {
      showToast(`Dados atualizados: ${metrics.referrals} indicações e ${metrics.sales} vendas.`);
    }

    console.info('[INDICA+ CENTRAL]', {
      generatedAt: payload.generatedAt,
      source: payload.source,
      metrics,
      lastSyncAt
    });
  } catch (error) {
    employees = [];
    referrals = [];
    sales = [];
    initSelects();
    renderAll();

    updateSourceStatus('error', error.message);
    console.error('Falha ao sincronizar INDICA+ CENTRAL:', error);

    if (!silent) showToast(`Falha ao atualizar os dados: ${error.message}`, true);
  }
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfQuarter(date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

function endOfQuarter(date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 0, 23, 59, 59, 999);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getPeriodRange(period = state.period, previous = false) {
  const now = new Date();

  if (period === 'week') {
    const currentEnd = new Date(now);
    const currentStart = addDays(currentEnd, -6);

    if (!previous) {
      currentStart.setHours(0, 0, 0, 0);
      currentEnd.setHours(23, 59, 59, 999);
      return [currentStart, currentEnd];
    }

    const previousEnd = addDays(currentStart, -1);
    const previousStart = addDays(previousEnd, -6);
    previousStart.setHours(0, 0, 0, 0);
    previousEnd.setHours(23, 59, 59, 999);
    return [previousStart, previousEnd];
  }

  if (period === 'quarter') {
    const currentStart = startOfQuarter(now);
    const currentEnd = endOfQuarter(now);
    if (!previous) return [currentStart, currentEnd];

    const previousReference = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 15);
    return [startOfQuarter(previousReference), endOfQuarter(previousReference)];
  }

  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  if (!previous) return [currentStart, currentEnd];

  const previousReference = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  return [startOfMonth(previousReference), endOfMonth(previousReference)];
}

function inRange(value, range) {
  const date = parseDate(value);
  return date >= range[0] && date <= range[1];
}

function getEmployee(id) {
  return employees.find(item => item.id === id);
}

function getTerritory(id) {
  return territories.find(item => item.id === id);
}

function getSales({ previous = false, ignoreEntityFilters = false } = {}) {
  const range = getPeriodRange(state.period, previous);

  return sales.filter(sale => {
    if (sale.status !== 'confirmed' || !inRange(sale.date, range)) return false;
    const employee = getEmployee(sale.employeeId);
    if (!employee) return false;

    if (!ignoreEntityFilters) {
      if (state.department !== 'all' && employee.department !== state.department) return false;
      if (state.territoryId !== 'all' && sale.territoryId !== state.territoryId) return false;
      if (state.search && !normalize(employee.name).includes(state.search)) return false;
    }

    return true;
  });
}

function getReferrals({ previous = false, ignoreEntityFilters = false } = {}) {
  const range = getPeriodRange(state.period, previous);

  return referrals.filter(referral => {
    if (referral.status !== 'valid' || !inRange(referral.date, range)) return false;
    const employee = getEmployee(referral.employeeId);
    if (!employee) return false;

    if (!ignoreEntityFilters) {
      if (state.department !== 'all' && employee.department !== state.department) return false;
      if (state.territoryId !== 'all' && referral.territoryId !== state.territoryId) return false;
      if (state.search && !normalize(employee.name).includes(state.search)) return false;
    }

    return true;
  });
}

function summarizeEmployee(employee, selectedSales = getSales(), selectedReferrals = getReferrals()) {
  const employeeSales = selectedSales.filter(item => item.employeeId === employee.id);
  const employeeReferrals = selectedReferrals.filter(item => item.employeeId === employee.id);
  const mrr = employeeSales.reduce((total, item) => total + item.mrr, 0);
  const conversion = employeeReferrals.length ? employeeSales.length / employeeReferrals.length : 0;
  const latest = employeeSales.length
    ? Math.max(...employeeSales.map(item => parseDate(item.date).getTime()))
    : 0;

  return {
    ...employee,
    sales: employeeSales.length,
    referrals: employeeReferrals.length,
    mrr,
    conversion,
    ticket: employeeSales.length ? mrr / employeeSales.length : 0,
    points: employeeSales.length * POINTS_PER_SALE,
    latest,
    territories: territories
      .map(territory => ({
        ...territory,
        sales: employeeSales.filter(item => item.territoryId === territory.id).length
      }))
      .filter(item => item.sales > 0)
  };
}

function employeeSummaries() {
  const selectedSales = getSales();
  const selectedReferrals = getReferrals();
  return employees.map(employee => summarizeEmployee(employee, selectedSales, selectedReferrals));
}

function sortSummaries(items = employeeSummaries()) {
  const copy = [...items];
  const valueFor = item => state.metric === 'participants' ? item.sales : item[state.metric];

  copy.sort((a, b) => {
    const metricDifference = (valueFor(b) || 0) - (valueFor(a) || 0);
    if (metricDifference !== 0) return metricDifference;
    if (b.sales !== a.sales) return b.sales - a.sales;
    if (b.mrr !== a.mrr) return b.mrr - a.mrr;
    if (b.conversion !== a.conversion) return b.conversion - a.conversion;
    if (b.latest !== a.latest) return b.latest - a.latest;
    return a.name.localeCompare(b.name, 'pt-BR');
  });

  return copy;
}

function overallMetrics({ previous = false, ignoreEntityFilters = false } = {}) {
  const selectedSales = getSales({ previous, ignoreEntityFilters });
  const selectedReferrals = getReferrals({ previous, ignoreEntityFilters });
  const mrr = selectedSales.reduce((total, item) => total + item.mrr, 0);

  return {
    sales: selectedSales.length,
    mrr,
    referrals: selectedReferrals.length,
    conversion: selectedReferrals.length ? selectedSales.length / selectedReferrals.length : 0,
    ticket: selectedSales.length ? mrr / selectedSales.length : 0,
    participants: new Set(selectedSales.map(item => item.employeeId)).size
  };
}

function percent(value, digits = 1) {
  return `${(Number(value || 0) * 100).toFixed(digits).replace('.', ',')}%`;
}

function growthText(current, previous) {
  if (!previous) return current ? 'Sem base comparável' : 'Sem movimento';
  const delta = ((current - previous) / previous) * 100;
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1).replace('.', ',')}% vs. período anterior`;
}

function metricLabel(metric) {
  return ({
    sales: 'vendas',
    mrr: 'MRR',
    conversion: 'conversão',
    ticket: 'ticket médio',
    participants: 'participação'
  })[metric] || 'vendas';
}

function renderAll() {
  renderFilters();
  updateGoal();
  updateKpis();
  renderPodium();
  renderRankings();
  renderReferrals();
  renderWeeklyChart();
  renderFeed();
  renderTerritoryPreview();
  renderTerritories();
  renderTeams();
  updateMapMarkers();
}

function updateGoal() {
  const monthRange = [startOfMonth(new Date()), endOfMonth(new Date())];
  const monthSales = sales.filter(item => item.status === 'confirmed' && inRange(item.date, monthRange)).length;
  const progress = Math.min(100, (monthSales / COMPETITION_GOAL) * 100);
  const remaining = Math.max(0, COMPETITION_GOAL - monthSales);

  setText('goalSales', monthSales);
  setText('goalTarget', COMPETITION_GOAL);
  setText('goalRemaining', remaining);
  setText('goalPercent', `${progress.toFixed(0)}%`);
  setText('sideSales', monthSales);
  setText('sideGoal', COMPETITION_GOAL);
  setText('goalStatus', progress >= 100 ? 'Meta batida' : progress >= 70 ? 'Reta final' : 'Em ritmo');

  if (el('goalProgress')) el('goalProgress').style.width = `${progress}%`;
  if (el('sideProgress')) el('sideProgress').style.width = `${progress}%`;
}

function updateKpis() {
  const current = overallMetrics();
  const previous = overallMetrics({ previous: true });

  setText('kpiSales', number.format(current.sales));
  setText('kpiMrr', money.format(current.mrr));
  setText('kpiConversion', percent(current.conversion));
  setText('kpiTicket', money.format(current.ticket));
  setText('kpiParticipants', current.participants);
  setText('kpiParticipantsText', `de ${employees.length} elegíveis`);
  setText('kpiSalesDelta', growthText(current.sales, previous.sales));
  setText('kpiMrrDelta', growthText(current.mrr, previous.mrr));

  document.querySelectorAll('.kpi-card').forEach(card => {
    card.classList.toggle('is-active', card.dataset.metric === state.metric);
  });
}

function participantCell(item) {
  return `<span class="participant-cell">
    <span class="mini-avatar">${escapeHtml(item.initials)}</span>
    <span><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.department)}</span></span>
  </span>`;
}

function podiumItem(item, position) {
  return `<button class="podium-item position-${position}" data-profile="${escapeHtml(item.id)}" style="animation-delay:${position * 70}ms">
    <span class="podium-rank">${position}º</span>
    <span class="podium-avatar">${escapeHtml(item.initials)}</span>
    <h4>${escapeHtml(item.name)}</h4>
    <p>${escapeHtml(item.department)}</p>
    <span class="podium-score">${item.sales}<small>VENDAS</small></span>
  </button>`;
}

function renderPodium() {
  const podium = el('podium');
  const compact = el('compactRanking');
  if (!podium || !compact) return;

  const ranked = sortSummaries().filter(item => item.sales > 0);
  if (!ranked.length) {
    podium.innerHTML = '<div class="ranking-empty" style="grid-column:1/-1">Nenhuma venda nesta seleção.</div>';
    compact.innerHTML = '';
    return;
  }

  podium.innerHTML = ranked.slice(0, 3).map((item, index) => podiumItem(item, index + 1)).join('');
  compact.innerHTML = ranked.slice(3, 7).map((item, index) => `
    <button class="compact-row" data-profile="${escapeHtml(item.id)}">
      <span class="compact-position">${index + 4}</span>
      ${participantCell(item)}
      <span class="number-cell">${item.sales}</span>
      <span class="points-cell">${number.format(item.points)} pts</span>
    </button>`).join('');
}

function renderReferrals() {
  const container = el('referralsList');
  if (!container) return;

  const selected = [...getReferrals()]
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
  const saleIds = new Set(sales.map(sale => sale.id));

  setText('referralsCount', `${selected.length} indicações`);

  if (!selected.length) {
    container.innerHTML = '<div class="ranking-empty">Nenhuma indicação nesta seleção.</div>';
    return;
  }

  container.innerHTML = selected.map(referral => {
    const employee = getEmployee(referral.employeeId);
    const isSale = saleIds.has(referral.id);

    return `<div class="referral-row">
      <span class="participant-cell">
        <span class="mini-avatar">${escapeHtml(employee?.initials || '?')}</span>
        <span><strong>${escapeHtml(employee?.name || 'Indicante não identificado')}</strong></span>
      </span>
      <span>${escapeHtml(employee?.department || 'Outros')}</span>
      <span>${escapeHtml(formatDate(referral.date))}</span>
      <span class="referral-status ${isSale ? 'is-sale' : ''}">${isSale ? 'Venda confirmada' : 'Indicação recebida'}</span>
    </div>`;
  }).join('');
}

function renderRankings() {
  const container = el('fullRanking');
  if (!container) return;

  const ranked = sortSummaries().filter(item => !state.search || normalize(item.name).includes(state.search));
  setText('rankingCount', `${ranked.length} participantes`);
  setText('rankingSortLabel', `Ordenado por ${metricLabel(state.metric)}`);

  if (!ranked.length) {
    container.innerHTML = '<div class="ranking-empty">Nenhum participante encontrado.</div>';
    return;
  }

  container.innerHTML = ranked.map((item, index) => `
    <div class="ranking-row ${index < 3 ? 'top-three' : ''}">
      <span class="rank-no">${index + 1}</span>
      <button data-profile="${escapeHtml(item.id)}">${participantCell(item)}</button>
      <span>${escapeHtml(item.department)}</span>
      <span>${item.referrals}</span>
      <span class="number-cell">${item.sales}</span>
      <span>${money.format(item.mrr)}</span>
      <span>${percent(item.conversion)}</span>
      <span class="points-cell">${number.format(item.points)}</span>
    </div>`).join('');
}

function renderWeeklyChart() {
  const chart = el('weeklyChart');
  const summary = el('chartSummary');
  if (!chart || !summary) return;

  const selectedSales = getSales();
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
  const values = days.map(day => selectedSales.filter(sale => parseDate(sale.date).toDateString() === day.toDateString()).length);
  const maximum = Math.max(1, ...values);

  chart.innerHTML = days.map((day, index) => `
    <div class="bar-column">
      <span class="bar-value">${values[index]}</span>
      <span class="bar" style="height:${Math.max(3, (values[index] / maximum) * 88)}%;animation-delay:${index * 60}ms"></span>
      <span class="bar-label">${day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
    </div>`).join('');

  const total = values.reduce((sum, value) => sum + value, 0);
  const best = Math.max(...values);
  const bestIndex = values.indexOf(best);

  summary.innerHTML = `
    <div><span>Total 7 dias</span><strong>${total} vendas</strong></div>
    <div><span>Melhor dia</span><strong>${best ? days[bestIndex].toLocaleDateString('pt-BR', { weekday: 'long' }) : '-'}</strong></div>
    <div><span>Média diária</span><strong>${(total / 7).toFixed(1).replace('.', ',')}</strong></div>`;
}

function renderFeed() {
  const feed = el('salesFeed');
  if (!feed) return;

  const selected = [...getSales()]
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))
    .slice(0, 5);

  if (!selected.length) {
    feed.innerHTML = '<div class="ranking-empty">Sem vendas nesta seleção.</div>';
    return;
  }

  feed.innerHTML = selected.map((sale, index) => {
    const employee = getEmployee(sale.employeeId);
    const territory = getTerritory(sale.territoryId);

    return `<div class="feed-item" style="animation-delay:${index * 60}ms">
      <span class="feed-icon">✓</span>
      <span class="feed-copy">
        <strong>${escapeHtml(employee?.name || 'Indicante')}</strong>
        <span>${escapeHtml(territory?.name || 'Sem município')} · ${escapeHtml(sale.neighborhood)} · ${formatDate(sale.date)}</span>
      </span>
      <span class="feed-value"><strong>${money.format(sale.mrr)}</strong><span>+${POINTS_PER_SALE} pts</span></span>
    </div>`;
  }).join('');
}

function territoryMetrics(territoryId) {
  const original = state.territoryId;
  state.territoryId = territoryId;
  const metrics = overallMetrics();
  state.territoryId = original;
  return metrics;
}

function renderTerritoryPreview() {
  const container = el('territoryPreview');
  if (!container) return;

  const list = territories.map(territory => ({ ...territory, metrics: territoryMetrics(territory.id) }));
  const maximum = Math.max(1, ...list.map(item => item.metrics.sales));

  container.innerHTML = list
    .filter(item => item.metrics.referrals > 0 || item.metrics.sales > 0)
    .sort((a, b) => b.metrics.sales - a.metrics.sales)
    .map(item => `
      <div class="territory-preview-item">
        <button data-territory="${escapeHtml(item.id)}" data-go="territory">${escapeHtml(item.name)}</button>
        <strong>${item.metrics.sales}</strong>
        <div class="preview-bar"><span style="width:${(item.metrics.sales / maximum) * 100}%"></span></div>
      </div>`).join('');
}

function renderMetricBars(id, list, accessor, formatter) {
  const container = el(id);
  if (!container) return;

  const maximum = Math.max(1, ...list.map(accessor));
  container.innerHTML = list
    .filter(item => item.metrics.referrals > 0 || item.metrics.sales > 0)
    .sort((a, b) => accessor(b) - accessor(a))
    .map(item => {
      const value = accessor(item);
      return `<div class="metric-row">
        <span>${escapeHtml(item.name)}</span>
        <strong>${formatter(value)}</strong>
        <div class="metric-track"><span style="width:${(value / maximum) * 100}%"></span></div>
      </div>`;
    }).join('');
}

function renderTerritories() {
  const list = territories.map(territory => ({ ...territory, metrics: territoryMetrics(territory.id) }));
  const visibleList = list.filter(item => item.metrics.referrals > 0 || item.metrics.sales > 0);
  const overall = overallMetrics();
  const selected = state.territoryId === 'all' ? null : getTerritory(state.territoryId);

  setText('selectedTerritoryName', selected ? selected.name : 'Todos os territórios');
  setText('territorySales', overall.sales);
  setText('territoryMrr', money.format(overall.mrr));
  setText('territoryConversion', percent(overall.conversion));
  setText('territoryTicket', money.format(overall.ticket));
  setText('mapSelectionTitle', selected ? selected.name : 'Visão consolidada');
  setText('mapSelectionSubtitle', selected ? 'Filtro territorial aplicado' : 'INDICA+ CENTRAL');

  const territoryList = el('territoryList');
  if (territoryList) {
    territoryList.innerHTML = `
      <button class="territory-button ${state.territoryId === 'all' ? 'is-active' : ''}" data-territory="all">
        <strong>Todos os territórios</strong><span>${overall.sales}</span><small>Visão consolidada</small>
      </button>
      ${visibleList.map(item => `
        <button class="territory-button ${state.territoryId === item.id ? 'is-active' : ''}" data-territory="${escapeHtml(item.id)}">
          <strong>${escapeHtml(item.name)}</strong><span>${item.metrics.sales}</span>
          <small>${money.format(item.metrics.mrr)} · ${percent(item.metrics.conversion)}</small>
        </button>`).join('')}`;
  }

  renderMetricBars('territoryShare', visibleList, item => item.metrics.sales, value => `${value} venda${value === 1 ? '' : 's'}`);
  renderMetricBars('territoryConversionBars', visibleList, item => item.metrics.conversion, value => percent(value));
  renderMetricBars('territoryMrrBars', visibleList, item => item.metrics.mrr, value => money.format(value));
}

function renderTeams() {
  const container = el('teamCards');
  if (!container) return;

  const selectedSales = getSales();
  const selectedReferrals = getReferrals();
  const departments = [...new Set(employees.map(item => item.department))];
  const colors = {
    Comercial: '#ff7600',
    Atendimento: '#7776e9',
    Técnico: '#50db9c',
    Administrativo: '#ffca55',
    Outros: '#7776e9'
  };

  const teams = departments.map(department => {
    const teamEmployees = employees.filter(item => item.department === department);
    const ids = new Set(teamEmployees.map(item => item.id));
    const teamSales = selectedSales.filter(item => ids.has(item.employeeId));
    const teamReferrals = selectedReferrals.filter(item => ids.has(item.employeeId));
    const mrr = teamSales.reduce((total, item) => total + item.mrr, 0);

    return {
      department,
      employees: teamEmployees.length,
      active: new Set(teamSales.map(item => item.employeeId)).size,
      sales: teamSales.length,
      mrr,
      conversion: teamReferrals.length ? teamSales.length / teamReferrals.length : 0
    };
  }).sort((a, b) => b.sales - a.sales || b.mrr - a.mrr);

  if (!teams.length) {
    container.innerHTML = '<div class="ranking-empty">Nenhuma equipe disponível.</div>';
    return;
  }

  container.innerHTML = teams.map((team, index) => `
    <article class="panel team-card" style="--team-color:${colors[team.department] || '#7776e9'}">
      <div class="team-card-head">
        <div><span class="eyebrow">Equipe</span><h3>${escapeHtml(team.department)}</h3><small>${team.active} participantes pontuando</small></div>
        <span class="team-rank">${index + 1}º</span>
      </div>
      <div class="team-stats">
        <div><span>Vendas</span><strong>${team.sales}</strong></div>
        <div><span>MRR</span><strong>${money.format(team.mrr)}</strong></div>
        <div><span>Conversão</span><strong>${percent(team.conversion)}</strong></div>
        <div><span>Média / ativo</span><strong>${team.active ? (team.sales / team.active).toFixed(1).replace('.', ',') : '0'}</strong></div>
      </div>
      <button class="btn btn-ghost" data-department="${escapeHtml(team.department)}" data-go="ranking">Filtrar esta equipe</button>
    </article>`).join('');
}

function renderFilters() {
  const chips = [];
  if (state.department !== 'all') chips.push(`<span class="filter-chip">Equipe: ${escapeHtml(state.department)}</span>`);
  if (state.territoryId !== 'all') chips.push(`<span class="filter-chip">Território: ${escapeHtml(getTerritory(state.territoryId)?.name || '')}</span>`);
  if (state.search) chips.push(`<span class="filter-chip">Busca: ${escapeHtml(state.search)}</span>`);

  const bar = el('activeFilterBar');
  const container = el('activeFilterChips');
  if (bar) bar.hidden = chips.length === 0;
  if (container) container.innerHTML = chips.join('');
}

function initMap() {
  const fallback = el('mapFallback');
  const mapElement = el('commercialMap');
  if (!mapElement) return;

  if (!window.L) {
    if (fallback) fallback.hidden = false;
    mapElement.hidden = true;
    return;
  }

  map = L.map('commercialMap', {
    zoomControl: true,
    scrollWheelZoom: false,
    minZoom: 7,
    maxZoom: 15
  }).setView([-2.55, -44.20], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  updateMapMarkers();
  setTimeout(() => map.invalidateSize(), 100);
}

function updateMapMarkers() {
  if (!map || !markerLayer) return;

  markerLayer.clearLayers();
  markerByTerritory.clear();
  const bounds = [];

  territories.forEach(territory => {
    const metrics = territoryMetrics(territory.id);
    if (!metrics.referrals && !metrics.sales) return;

    const size = 34 + Math.min(30, metrics.sales * 8);
    const selected = state.territoryId === territory.id;
    const icon = L.divIcon({
      className: `territory-marker ${selected ? 'is-selected' : ''}`,
      html: `<span class="territory-marker-inner" style="--marker-size:${size}px">${metrics.sales}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });

    const marker = L.marker([territory.lat, territory.lng], {
      icon,
      keyboard: true,
      title: territory.name
    }).addTo(markerLayer);

    marker.bindPopup(`<div class="map-popup">
      <strong>${escapeHtml(territory.name)}</strong>
      <span>${metrics.sales} vendas · ${money.format(metrics.mrr)} MRR</span>
      <span>Conversão: ${percent(metrics.conversion)}</span>
      ${territory.approximate ? '<small>Localização municipal aproximada</small>' : ''}
    </div>`);

    marker.on('click', () => selectTerritory(territory.id, { keepView: true, openPopup: true }));
    markerByTerritory.set(territory.id, marker);
    bounds.push([territory.lat, territory.lng]);
  });

  if (state.territoryId !== 'all') {
    const territory = getTerritory(state.territoryId);
    if (territory) map.flyTo([territory.lat, territory.lng], 12, { duration: 0.7 });
  } else if (bounds.length) {
    map.fitBounds(bounds, { padding: [38, 38], maxZoom: 10 });
  }
}

function selectTerritory(id, options = {}) {
  state.territoryId = id;
  renderAll();

  if (id !== 'all' && options.openPopup) {
    setTimeout(() => markerByTerritory.get(id)?.openPopup(), 350);
  }

  if (!options.keepView) navigate('territory');
}

function navigate(view) {
  state.view = view;

  document.querySelectorAll('.view').forEach(item => {
    item.classList.toggle('is-active', item.id === `view-${view}`);
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    const active = item.dataset.view === view;
    item.classList.toggle('is-active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });

  const activeView = el(`view-${view}`);
  setText('pageTitle', activeView?.dataset.title || 'Indica+');

  el('sidebar')?.classList.remove('is-open');
  el('mobileMenu')?.setAttribute('aria-expanded', 'false');

  if (view === 'territory' && map) setTimeout(() => map.invalidateSize(), 180);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openProfile(employeeId) {
  const employee = getEmployee(employeeId);
  if (!employee) return;

  const item = summarizeEmployee(employee);
  const content = el('profileContent');
  const modal = el('profileModal');
  if (!content || !modal) return;

  content.innerHTML = `
    <div class="profile-head">
      <span class="profile-big-avatar">${escapeHtml(item.initials)}</span>
      <div><span class="eyebrow">Perfil comercial</span><h2 id="profileName">${escapeHtml(item.name)}</h2><p>${escapeHtml(item.department)}</p></div>
    </div>
    <div class="profile-grid">
      <div><span>Vendas</span><strong>${item.sales}</strong></div>
      <div><span>MRR</span><strong>${money.format(item.mrr)}</strong></div>
      <div><span>Conversão</span><strong>${percent(item.conversion)}</strong></div>
      <div><span>Pontos</span><strong>${number.format(item.points)}</strong></div>
    </div>
    <span class="eyebrow">Vendas por território</span>
    <div class="profile-territories">
      ${item.territories.length
        ? item.territories.map(territory => `<div class="profile-territory"><span>${escapeHtml(territory.name)}</span><strong>${territory.sales}</strong></div>`).join('')
        : '<p style="color:var(--muted)">Sem vendas na seleção atual.</p>'}
    </div>`;

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const modal = el(id);
  if (modal) modal.hidden = true;
  document.body.style.overflow = '';
}

function exportCsv() {
  const ranked = sortSummaries();
  const rows = [['Posição', 'Participante', 'Equipe', 'Indicações válidas', 'Vendas', 'MRR', 'Conversão', 'Pontos']];

  ranked.forEach((item, index) => {
    rows.push([
      index + 1,
      item.name,
      item.department,
      item.referrals,
      item.sales,
      item.mrr.toFixed(2),
      (item.conversion * 100).toFixed(1),
      item.points
    ]);
  });

  const csv = rows
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ranking-indica-plus-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Ranking exportado com os filtros atuais.');
}

function showToast(message, error = false) {
  const region = el('toastRegion');
  if (!region) return;

  const toast = document.createElement('div');
  toast.className = `toast ${error ? 'error' : ''}`;
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function launchConfetti({ duration = 1800, intensity = 1 } = {}) {
  const canvas = el('confetti');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ['#ff7600', '#333399', '#7776e9', '#ffffff', '#ffca55'];
  const count = Math.round(Math.min(240, 110 * intensity));
  const pieces = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.45,
    w: 5 + Math.random() * 8,
    h: 3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 2.5 + Math.random() * 5,
    drift: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    rotationSpeed: -0.12 + Math.random() * 0.24
  }));

  const started = performance.now();

  function frame(now) {
    context.clearRect(0, 0, width, height);

    pieces.forEach(piece => {
      piece.y += piece.speed;
      piece.x += piece.drift + Math.sin(piece.y * 0.02) * 0.45;
      piece.rotation += piece.rotationSpeed;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      context.restore();
    });

    if (now - started < duration && pieces.some(piece => piece.y < height + 30)) {
      requestAnimationFrame(frame);
    } else {
      context.clearRect(0, 0, width, height);
    }
  }

  requestAnimationFrame(frame);
}

function initSelects() {
  const select = el('departmentSelect');
  if (!select) return;

  const departments = [...new Set(employees.map(item => item.department))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  select.innerHTML = '<option value="all">Todas as equipes</option>'
    + departments.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');

  select.value = departments.includes(state.department) ? state.department : 'all';
}

function bindEvents() {
  document.querySelectorAll('.nav-item[data-view]').forEach(button => {
    button.addEventListener('click', () => navigate(button.dataset.view));
  });

  document.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go) navigate(go.dataset.go);

    const profile = event.target.closest('[data-profile]');
    if (profile) openProfile(profile.dataset.profile);

    const territory = event.target.closest('[data-territory]');
    if (territory) {
      selectTerritory(territory.dataset.territory, {
        keepView: territory.closest('#view-territory') !== null
      });
    }

    const department = event.target.closest('[data-department]');
    if (department) {
      state.department = department.dataset.department;
      if (el('departmentSelect')) el('departmentSelect').value = state.department;
      renderAll();
    }

    const close = event.target.closest('[data-close]');
    if (close) closeModal(close.dataset.close);
  });

  el('mobileMenu')?.addEventListener('click', () => {
    const sidebar = el('sidebar');
    if (!sidebar) return;
    const open = sidebar.classList.toggle('is-open');
    el('mobileMenu')?.setAttribute('aria-expanded', String(open));
  });

  el('periodSelect')?.addEventListener('change', event => {
    state.period = event.target.value;
    renderAll();
  });

  el('rankingSearch')?.addEventListener('input', event => {
    state.search = normalize(event.target.value);
    renderAll();
  });

  el('departmentSelect')?.addEventListener('change', event => {
    state.department = event.target.value;
    renderAll();
  });

  el('kpiGrid')?.addEventListener('click', event => {
    const card = event.target.closest('[data-metric]');
    if (!card) return;
    state.metric = card.dataset.metric;
    renderAll();
  });

  el('clearFilters')?.addEventListener('click', () => {
    state.department = 'all';
    state.territoryId = 'all';
    state.search = '';
    if (el('departmentSelect')) el('departmentSelect').value = 'all';
    if (el('rankingSearch')) el('rankingSearch').value = '';
    renderAll();
  });

  el('resetMap')?.addEventListener('click', () => selectTerritory('all', { keepView: true }));
  el('exportCsv')?.addEventListener('click', exportCsv);

  el('openSaleModal')?.addEventListener('click', event => {
    event.preventDefault();
    showToast('As vendas são registradas no Kommo e sincronizadas automaticamente.');
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closeModal(backdrop.id);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(modal => closeModal(modal.id));
    }
  });

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
}

function boot() {
  initSelects();
  bindEvents();
  renderAll();
  initMap();

  const saleButton = el('openSaleModal');
  if (saleButton) {
    saleButton.disabled = true;
    saleButton.textContent = 'Sincronizando...';
  }

  loadLiveData({ silent: true });
  window.setInterval(() => loadLiveData(), REFRESH_INTERVAL_MS);

  setTimeout(() => {
    el('splash')?.classList.add('is-hidden');
  }, 900);
}

document.addEventListener('DOMContentLoaded', boot);


function activatePresentationMode() {
  if (!new URLSearchParams(window.location.search).has('presentation')) return;

  document.body.classList.add('presentation-mode');
  document.title = 'Indica+ ST1 | Apresentação';

  const openPresentation = el('openPresentation');
  if (openPresentation) openPresentation.hidden = true;
}

document.addEventListener('DOMContentLoaded', activatePresentationMode);
