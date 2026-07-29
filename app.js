'use strict';

const DATA_NOW = new Date('2026-07-29T03:37:00-03:00');
const COMPETITION_GOAL = 20;
const POINTS_PER_SALE = 100;
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('pt-BR');

const employees = [
  { id: 'maria', name: 'Maria Reis', department: 'Comercial', initials: 'MR' },
  { id: 'valberta', name: 'Valberta Bastos', department: 'Atendimento', initials: 'VB' },
  { id: 'rayane', name: 'Rayane Nunes', department: 'Comercial', initials: 'RN' },
  { id: 'wallas', name: 'Wallas Dias', department: 'Técnico', initials: 'WD' },
  { id: 'laydianne', name: 'Laydianne Costa', department: 'Atendimento', initials: 'LC' },
  { id: 'vinicius', name: 'Vinicius Marques', department: 'Administrativo', initials: 'VM' },
  { id: 'joao', name: 'João Silva', department: 'Técnico', initials: 'JS' },
  { id: 'ana', name: 'Ana Paula', department: 'Comercial', initials: 'AP' },
  { id: 'carlos', name: 'Carlos Eduardo', department: 'Administrativo', initials: 'CE' },
  { id: 'bruna', name: 'Bruna Martins', department: 'Atendimento', initials: 'BM' }
];

const territories = [
  { id: 'sao-luis', name: 'São Luís', short: 'SLZ', lat: -2.5307, lng: -44.3068 },
  { id: 'sao-jose-de-ribamar', name: 'São José de Ribamar', short: 'SJR', lat: -2.5610, lng: -44.0543 },
  { id: 'paco-do-lumiar', name: 'Paço do Lumiar', short: 'PÇO', lat: -2.5316, lng: -44.1070 },
  { id: 'raposa', name: 'Raposa', short: 'RPS', lat: -2.4254, lng: -44.0973 },
  { id: 'bacabeira', name: 'Bacabeira', short: 'BAC', lat: -2.9645, lng: -44.3164 }
];

let sales = [
  { id: 'KMO-662858', employeeId: 'maria', date: '2026-07-28', territoryId: 'sao-luis', neighborhood: 'Turu', plan: 'Plano 109', mrr: 109, status: 'confirmed' },
  { id: 'KMO-662886', employeeId: 'maria', date: '2026-07-26', territoryId: 'sao-jose-de-ribamar', neighborhood: 'Araçagy', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-663011', employeeId: 'valberta', date: '2026-07-25', territoryId: 'sao-luis', neighborhood: 'Cohama', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-663061', employeeId: 'valberta', date: '2026-07-23', territoryId: 'paco-do-lumiar', neighborhood: 'Maiobão', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-663100', employeeId: 'rayane', date: '2026-07-22', territoryId: 'sao-luis', neighborhood: 'Renascença', plan: 'Plano 109', mrr: 109, status: 'confirmed' },
  { id: 'KMO-663112', employeeId: 'wallas', date: '2026-07-20', territoryId: 'raposa', neighborhood: 'Vila Bom Viver', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-663018', employeeId: 'laydianne', date: '2026-07-18', territoryId: 'sao-luis', neighborhood: 'Cidade Operária', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-663008', employeeId: 'vinicius', date: '2026-07-16', territoryId: 'paco-do-lumiar', neighborhood: 'Mocajituba', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-662880', employeeId: 'ana', date: '2026-07-13', territoryId: 'sao-jose-de-ribamar', neighborhood: 'Parque Vitória', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'KMO-662977', employeeId: 'carlos', date: '2026-07-10', territoryId: 'sao-luis', neighborhood: 'Anil', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'JUN-901', employeeId: 'maria', date: '2026-06-27', territoryId: 'sao-luis', neighborhood: 'Calhau', plan: 'Plano 109', mrr: 109, status: 'confirmed' },
  { id: 'JUN-902', employeeId: 'valberta', date: '2026-06-23', territoryId: 'paco-do-lumiar', neighborhood: 'Maiobão', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'JUN-903', employeeId: 'rayane', date: '2026-06-19', territoryId: 'sao-luis', neighborhood: 'Centro', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'JUN-904', employeeId: 'wallas', date: '2026-06-15', territoryId: 'raposa', neighborhood: 'Centro', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'JUN-905', employeeId: 'laydianne', date: '2026-06-12', territoryId: 'sao-jose-de-ribamar', neighborhood: 'Centro', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'JUN-906', employeeId: 'vinicius', date: '2026-06-08', territoryId: 'sao-luis', neighborhood: 'Cohatrac', plan: 'Plano 89', mrr: 89, status: 'confirmed' },
  { id: 'JUN-907', employeeId: 'ana', date: '2026-06-03', territoryId: 'sao-luis', neighborhood: 'Forquilha', plan: 'Plano 89', mrr: 89, status: 'confirmed' }
];

let referrals = [
  ...createReferralRows('maria', 9, ['sao-luis', 'sao-jose-de-ribamar', 'paco-do-lumiar']),
  ...createReferralRows('valberta', 8, ['sao-luis', 'paco-do-lumiar']),
  ...createReferralRows('rayane', 6, ['sao-luis', 'sao-jose-de-ribamar']),
  ...createReferralRows('wallas', 6, ['raposa', 'sao-luis']),
  ...createReferralRows('laydianne', 5, ['sao-luis', 'sao-jose-de-ribamar']),
  ...createReferralRows('vinicius', 4, ['paco-do-lumiar', 'sao-luis']),
  ...createReferralRows('joao', 3, ['bacabeira', 'sao-luis']),
  ...createReferralRows('ana', 3, ['sao-jose-de-ribamar', 'raposa']),
  ...createReferralRows('carlos', 2, ['sao-luis']),
  ...createReferralRows('bruna', 2, ['bacabeira', 'paco-do-lumiar'])
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

function createReferralRows(employeeId, count, territoryIds) {
  return Array.from({ length: count }, (_, index) => ({
    id: `REF-${employeeId}-${index + 1}`,
    employeeId,
    territoryId: territoryIds[index % territoryIds.length],
    date: `2026-07-${String(2 + ((index * 3 + employeeId.length) % 27)).padStart(2, '0')}`,
    status: 'valid'
  }));
}

function parseDate(value) {
  return new Date(`${value}T12:00:00-03:00`);
}

function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function endOfMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59); }
function startOfQuarter(date) { return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1); }
function endOfQuarter(date) { return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + 3, 0, 23, 59, 59); }
function addDays(date, days) { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; }

function getPeriodRange(period = state.period, previous = false) {
  if (period === 'week') {
    const currentEnd = new Date(DATA_NOW);
    const currentStart = addDays(currentEnd, -6);
    if (!previous) return [new Date(currentStart.setHours(0, 0, 0, 0)), new Date(currentEnd.setHours(23, 59, 59, 999))];
    const previousEnd = addDays(currentStart, -1);
    const previousStart = addDays(previousEnd, -6);
    return [new Date(previousStart.setHours(0, 0, 0, 0)), new Date(previousEnd.setHours(23, 59, 59, 999))];
  }
  if (period === 'quarter') {
    const currentStart = startOfQuarter(DATA_NOW);
    const currentEnd = endOfQuarter(DATA_NOW);
    if (!previous) return [currentStart, currentEnd];
    const previousRef = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 15);
    return [startOfQuarter(previousRef), endOfQuarter(previousRef)];
  }
  const currentStart = startOfMonth(DATA_NOW);
  const currentEnd = endOfMonth(DATA_NOW);
  if (!previous) return [currentStart, currentEnd];
  const previousRef = new Date(DATA_NOW.getFullYear(), DATA_NOW.getMonth() - 1, 15);
  return [startOfMonth(previousRef), endOfMonth(previousRef)];
}

function inRange(value, range) {
  const date = parseDate(value);
  return date >= range[0] && date <= range[1];
}

function getEmployee(id) { return employees.find(item => item.id === id); }
function getTerritory(id) { return territories.find(item => item.id === id); }

function getSales({ previous = false, ignoreEntityFilters = false } = {}) {
  const range = getPeriodRange(state.period, previous);
  return sales.filter(sale => {
    if (sale.status !== 'confirmed' || !inRange(sale.date, range)) return false;
    const employee = getEmployee(sale.employeeId);
    if (!employee) return false;
    if (!ignoreEntityFilters) {
      if (state.department !== 'all' && employee.department !== state.department) return false;
      if (state.territoryId !== 'all' && sale.territoryId !== state.territoryId) return false;
      if (state.search && !employee.name.toLocaleLowerCase('pt-BR').includes(state.search)) return false;
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
      if (state.search && !employee.name.toLocaleLowerCase('pt-BR').includes(state.search)) return false;
    }
    return true;
  });
}

function summarizeEmployee(employee, selectedSales = getSales(), selectedReferrals = getReferrals()) {
  const employeeSales = selectedSales.filter(item => item.employeeId === employee.id);
  const employeeReferrals = selectedReferrals.filter(item => item.employeeId === employee.id);
  const mrr = employeeSales.reduce((sum, item) => sum + item.mrr, 0);
  const conversion = employeeReferrals.length ? employeeSales.length / employeeReferrals.length : 0;
  const latest = employeeSales.length ? Math.max(...employeeSales.map(item => parseDate(item.date).getTime())) : 0;
  return {
    ...employee,
    sales: employeeSales.length,
    referrals: employeeReferrals.length,
    mrr,
    conversion,
    ticket: employeeSales.length ? mrr / employeeSales.length : 0,
    points: employeeSales.length * POINTS_PER_SALE,
    latest,
    territories: territories.map(territory => ({
      ...territory,
      sales: employeeSales.filter(item => item.territoryId === territory.id).length
    })).filter(item => item.sales > 0)
  };
}

function employeeSummaries() {
  const selectedSales = getSales();
  const selectedReferrals = getReferrals();
  return employees.map(employee => summarizeEmployee(employee, selectedSales, selectedReferrals));
}

function sortSummaries(items = employeeSummaries()) {
  const copy = [...items];
  const metric = state.metric;
  const valueFor = item => metric === 'participants' ? item.sales : item[metric];
  copy.sort((a, b) => {
    const metricDiff = valueFor(b) - valueFor(a);
    if (metricDiff !== 0) return metricDiff;
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
  const mrr = selectedSales.reduce((sum, item) => sum + item.mrr, 0);
  const participants = new Set(selectedSales.map(item => item.employeeId)).size;
  return {
    sales: selectedSales.length,
    mrr,
    referrals: selectedReferrals.length,
    conversion: selectedReferrals.length ? selectedSales.length / selectedReferrals.length : 0,
    ticket: selectedSales.length ? mrr / selectedSales.length : 0,
    participants
  };
}

function growthText(current, previous) {
  if (!previous) return current ? 'Sem base comparável' : 'Sem movimento';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1).replace('.', ',')}% vs. período anterior`;
}

function percent(value, digits = 1) {
  return `${(value * 100).toFixed(digits).replace('.', ',')}%`;
}

function metricLabel(metric) {
  return ({ sales: 'vendas', mrr: 'MRR', conversion: 'conversão', ticket: 'ticket médio', participants: 'participação' })[metric] || 'vendas';
}

function renderAll() {
  renderFilters();
  updateGoal();
  updateKpis();
  renderPodium();
  renderRankings();
  renderWeeklyChart();
  renderFeed();
  renderTerritoryPreview();
  renderTerritories();
  renderTeams();
  updateMapMarkers();
}

function updateGoal() {
  const monthRange = [startOfMonth(DATA_NOW), endOfMonth(DATA_NOW)];
  const monthSales = sales.filter(item => item.status === 'confirmed' && inRange(item.date, monthRange)).length;
  const progress = Math.min(100, (monthSales / COMPETITION_GOAL) * 100);
  const remaining = Math.max(0, COMPETITION_GOAL - monthSales);
  setText('goalSales', monthSales);
  setText('goalTarget', COMPETITION_GOAL);
  setText('goalRemaining', remaining);
  setText('goalPercent', `${progress.toFixed(0)}%`);
  setText('sideSales', monthSales);
  setText('sideGoal', COMPETITION_GOAL);
  document.getElementById('goalProgress').style.width = `${progress}%`;
  document.getElementById('sideProgress').style.width = `${progress}%`;
  setText('goalStatus', progress >= 100 ? 'Meta batida' : progress >= 70 ? 'Reta final' : 'Em ritmo');
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
  document.querySelectorAll('.kpi-card').forEach(card => card.classList.toggle('is-active', card.dataset.metric === state.metric));
}

function renderPodium() {
  const podium = document.getElementById('podium');
  const compact = document.getElementById('compactRanking');
  const ranked = sortSummaries().filter(item => item.sales > 0);
  if (!ranked.length) {
    podium.innerHTML = '<div class="ranking-empty" style="grid-column:1/-1">Nenhuma venda nesta seleção.</div>';
    compact.innerHTML = '';
    return;
  }
  podium.innerHTML = ranked.slice(0, 3).map((item, index) => podiumItem(item, index + 1)).join('');
  compact.innerHTML = ranked.slice(3, 7).map((item, index) => `
    <button class="compact-row" data-profile="${item.id}">
      <span class="compact-position">${index + 4}</span>
      ${participantCell(item)}
      <span class="number-cell">${item.sales}</span>
      <span class="points-cell">${number.format(item.points)} pts</span>
    </button>`).join('');
}

function podiumItem(item, position) {
  return `<button class="podium-item position-${position}" data-profile="${item.id}" style="animation-delay:${position * 70}ms">
    <span class="podium-rank">${position}º</span>
    <span class="podium-avatar">${item.initials}</span>
    <h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.department)}</p>
    <span class="podium-score">${item.sales}<small>VENDAS</small></span>
  </button>`;
}

function participantCell(item) {
  return `<span class="participant-cell"><span class="mini-avatar">${item.initials}</span><span><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.department)}</span></span></span>`;
}

function renderRankings() {
  const ranked = sortSummaries().filter(item => !state.search || item.name.toLocaleLowerCase('pt-BR').includes(state.search));
  const container = document.getElementById('fullRanking');
  setText('rankingCount', `${ranked.length} participantes`);
  setText('rankingSortLabel', `Ordenado por ${metricLabel(state.metric)}`);
  if (!ranked.length) {
    container.innerHTML = '<div class="ranking-empty">Nenhum participante encontrado.</div>';
    return;
  }
  container.innerHTML = ranked.map((item, index) => `
    <div class="ranking-row ${index < 3 ? 'top-three' : ''}">
      <span class="rank-no">${index + 1}</span>
      <button data-profile="${item.id}">${participantCell(item)}</button>
      <span>${escapeHtml(item.department)}</span>
      <span>${item.referrals}</span>
      <span class="number-cell">${item.sales}</span>
      <span>${money.format(item.mrr)}</span>
      <span>${percent(item.conversion)}</span>
      <span class="points-cell">${number.format(item.points)}</span>
    </div>`).join('');
}

function renderWeeklyChart() {
  const chart = document.getElementById('weeklyChart');
  const allCurrent = getSales();
  const days = Array.from({ length: 7 }, (_, index) => addDays(DATA_NOW, index - 6));
  const values = days.map(day => allCurrent.filter(sale => {
    const parsed = parseDate(sale.date);
    return parsed.toDateString() === day.toDateString();
  }).length);
  const max = Math.max(1, ...values);
  chart.innerHTML = days.map((day, index) => `
    <div class="bar-column">
      <span class="bar-value">${values[index]}</span>
      <span class="bar" style="height:${Math.max(3, (values[index] / max) * 88)}%;animation-delay:${index * 60}ms"></span>
      <span class="bar-label">${day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
    </div>`).join('');
  const total = values.reduce((sum, value) => sum + value, 0);
  const best = Math.max(...values);
  const bestIndex = values.indexOf(best);
  document.getElementById('chartSummary').innerHTML = `
    <div><span>Total 7 dias</span><strong>${total} vendas</strong></div>
    <div><span>Melhor dia</span><strong>${best ? days[bestIndex].toLocaleDateString('pt-BR', { weekday: 'long' }) : '-'}</strong></div>
    <div><span>Média diária</span><strong>${(total / 7).toFixed(1).replace('.', ',')}</strong></div>`;
}

function renderFeed() {
  const selected = [...getSales()].sort((a, b) => parseDate(b.date) - parseDate(a.date)).slice(0, 5);
  const feed = document.getElementById('salesFeed');
  if (!selected.length) {
    feed.innerHTML = '<div class="ranking-empty">Sem vendas nesta seleção.</div>';
    return;
  }
  feed.innerHTML = selected.map((sale, index) => {
    const employee = getEmployee(sale.employeeId);
    const territory = getTerritory(sale.territoryId);
    return `<div class="feed-item" style="animation-delay:${index * 60}ms"><span class="feed-icon">✓</span><span class="feed-copy"><strong>${escapeHtml(employee.name)}</strong><span>${escapeHtml(territory.name)} · ${escapeHtml(sale.neighborhood)} · ${formatDate(sale.date)}</span></span><span class="feed-value"><strong>${money.format(sale.mrr)}</strong><span>+100 pts</span></span></div>`;
  }).join('');
}

function territoryMetrics(territoryId, { ignoreGlobalTerritory = true } = {}) {
  const original = state.territoryId;
  if (ignoreGlobalTerritory) state.territoryId = territoryId;
  const metrics = overallMetrics();
  if (ignoreGlobalTerritory) state.territoryId = original;
  return metrics;
}

function renderTerritoryPreview() {
  const list = territories.map(territory => ({ ...territory, metrics: territoryMetrics(territory.id) }));
  const max = Math.max(1, ...list.map(item => item.metrics.sales));
  document.getElementById('territoryPreview').innerHTML = list.slice().sort((a, b) => b.metrics.sales - a.metrics.sales).map(item => `
    <div class="territory-preview-item"><button data-territory="${item.id}" data-go="territory">${escapeHtml(item.name)}</button><strong>${item.metrics.sales}</strong><div class="preview-bar"><span style="width:${(item.metrics.sales / max) * 100}%"></span></div></div>`).join('');
}

function renderTerritories() {
  const list = territories.map(territory => ({ ...territory, metrics: territoryMetrics(territory.id) }));
  const overall = overallMetrics();
  const selected = state.territoryId === 'all' ? null : getTerritory(state.territoryId);
  setText('selectedTerritoryName', selected ? selected.name : 'Todos os territórios');
  setText('territorySales', overall.sales);
  setText('territoryMrr', money.format(overall.mrr));
  setText('territoryConversion', percent(overall.conversion));
  setText('territoryTicket', money.format(overall.ticket));
  setText('mapSelectionTitle', selected ? selected.name : 'Grande São Luís');
  setText('mapSelectionSubtitle', selected ? 'Filtro territorial aplicado' : 'Visão consolidada');
  document.getElementById('territoryList').innerHTML = `
    <button class="territory-button ${state.territoryId === 'all' ? 'is-active' : ''}" data-territory="all"><strong>Todos os territórios</strong><span>${overallMetrics({ ignoreEntityFilters: false }).sales}</span><small>Visão consolidada</small></button>
    ${list.map(item => `<button class="territory-button ${state.territoryId === item.id ? 'is-active' : ''}" data-territory="${item.id}"><strong>${escapeHtml(item.name)}</strong><span>${item.metrics.sales}</span><small>${money.format(item.metrics.mrr)} · ${percent(item.metrics.conversion)}</small></button>`).join('')}`;
  renderMetricBars('territoryShare', list, item => item.metrics.sales, value => `${value} venda${value === 1 ? '' : 's'}`);
  renderMetricBars('territoryConversionBars', list, item => item.metrics.conversion, value => percent(value));
  renderMetricBars('territoryMrrBars', list, item => item.metrics.mrr, value => money.format(value));
}

function renderMetricBars(id, list, accessor, formatter) {
  const max = Math.max(1, ...list.map(accessor));
  document.getElementById(id).innerHTML = list.slice().sort((a, b) => accessor(b) - accessor(a)).map(item => {
    const value = accessor(item);
    return `<div class="metric-row"><span>${escapeHtml(item.name)}</span><strong>${formatter(value)}</strong><div class="metric-track"><span style="width:${(value / max) * 100}%"></span></div></div>`;
  }).join('');
}

function renderTeams() {
  const selectedSales = getSales();
  const selectedReferrals = getReferrals();
  const departments = [...new Set(employees.map(item => item.department))];
  const colors = { Comercial: '#ff7600', Atendimento: '#7776e9', 'Técnico': '#50db9c', Administrativo: '#ffca55' };
  const teams = departments.map(department => {
    const teamEmployees = employees.filter(item => item.department === department);
    const employeeIds = new Set(teamEmployees.map(item => item.id));
    const teamSales = selectedSales.filter(item => employeeIds.has(item.employeeId));
    const teamReferrals = selectedReferrals.filter(item => employeeIds.has(item.employeeId));
    const mrr = teamSales.reduce((sum, item) => sum + item.mrr, 0);
    return { department, employees: teamEmployees.length, active: new Set(teamSales.map(item => item.employeeId)).size, sales: teamSales.length, mrr, conversion: teamReferrals.length ? teamSales.length / teamReferrals.length : 0 };
  }).sort((a, b) => b.sales - a.sales || b.mrr - a.mrr);
  document.getElementById('teamCards').innerHTML = teams.map((team, index) => `
    <article class="panel team-card" style="--team-color:${colors[team.department] || '#7776e9'}">
      <div class="team-card-head"><div><span class="eyebrow">Equipe</span><h3>${escapeHtml(team.department)}</h3><small>${team.active} participantes pontuando</small></div><span class="team-rank">${index + 1}º</span></div>
      <div class="team-stats"><div><span>Vendas</span><strong>${team.sales}</strong></div><div><span>MRR</span><strong>${money.format(team.mrr)}</strong></div><div><span>Conversão</span><strong>${percent(team.conversion)}</strong></div><div><span>Média / ativo</span><strong>${team.active ? (team.sales / team.active).toFixed(1).replace('.', ',') : '0'}</strong></div></div>
      <button class="btn btn-ghost" data-department="${escapeAttribute(team.department)}" data-go="ranking">Filtrar esta equipe</button>
    </article>`).join('');
}

function renderFilters() {
  const chips = [];
  if (state.department !== 'all') chips.push(`<span class="filter-chip">Equipe: ${escapeHtml(state.department)}</span>`);
  if (state.territoryId !== 'all') chips.push(`<span class="filter-chip">Território: ${escapeHtml(getTerritory(state.territoryId)?.name || '')}</span>`);
  if (state.search) chips.push(`<span class="filter-chip">Busca: ${escapeHtml(state.search)}</span>`);
  const bar = document.getElementById('activeFilterBar');
  bar.hidden = chips.length === 0;
  document.getElementById('activeFilterChips').innerHTML = chips.join('');
}

function initMap() {
  const fallback = document.getElementById('mapFallback');
  if (!window.L) {
    fallback.hidden = false;
    document.getElementById('commercialMap').hidden = true;
    return;
  }
  map = L.map('commercialMap', { zoomControl: true, scrollWheelZoom: false, minZoom: 8, maxZoom: 15 }).setView([-2.55, -44.2], 10);
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
    const size = 34 + Math.min(30, metrics.sales * 8);
    const selected = state.territoryId === territory.id;
    const icon = L.divIcon({
      className: `territory-marker ${selected ? 'is-selected' : ''}`,
      html: `<span class="territory-marker-inner" style="--marker-size:${size}px">${metrics.sales}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
    const marker = L.marker([territory.lat, territory.lng], { icon, keyboard: true, title: territory.name }).addTo(markerLayer);
    marker.bindPopup(`<div class="map-popup"><strong>${escapeHtml(territory.name)}</strong><span>${metrics.sales} vendas · ${money.format(metrics.mrr)} MRR</span><span>Conversão: ${percent(metrics.conversion)}</span></div>`);
    marker.on('click', () => selectTerritory(territory.id, { keepView: true, openPopup: true }));
    markerByTerritory.set(territory.id, marker);
    bounds.push([territory.lat, territory.lng]);
  });
  if (state.territoryId !== 'all') {
    const territory = getTerritory(state.territoryId);
    if (territory) map.flyTo([territory.lat, territory.lng], 12, { duration: .7 });
  } else if (bounds.length) {
    map.fitBounds(bounds, { padding: [38, 38], maxZoom: 10 });
  }
}

function selectTerritory(id, options = {}) {
  state.territoryId = id;
  renderAll();
  if (id !== 'all' && options.openPopup) setTimeout(() => markerByTerritory.get(id)?.openPopup(), 350);
  if (!options.keepView) navigate('territory');
}

function navigate(view) {
  state.view = view;
  document.querySelectorAll('.view').forEach(item => item.classList.toggle('is-active', item.id === `view-${view}`));
  document.querySelectorAll('.nav-item').forEach(item => {
    const active = item.dataset.view === view;
    item.classList.toggle('is-active', active);
    active ? item.setAttribute('aria-current', 'page') : item.removeAttribute('aria-current');
  });
  const activeView = document.getElementById(`view-${view}`);
  setText('pageTitle', activeView?.dataset.title || 'Indica+');
  document.getElementById('sidebar').classList.remove('is-open');
  document.getElementById('mobileMenu').setAttribute('aria-expanded', 'false');
  if (view === 'territory' && map) setTimeout(() => map.invalidateSize(), 180);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSaleModal() {
  document.getElementById('saleModal').hidden = false;
  populateSaleForm();
  launchConfetti({ duration: 850, intensity: .65 });
  document.body.style.overflow = 'hidden';
}

function populateSaleForm() {
  const employeeSelect = document.getElementById('saleEmployee');
  employeeSelect.innerHTML = employees.map(item => `<option value="${item.id}">${escapeHtml(item.name)} · ${escapeHtml(item.department)}</option>`).join('');
  const territorySelect = document.getElementById('saleMunicipality');
  territorySelect.innerHTML = territories.map(item => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('');
  if (state.territoryId !== 'all') territorySelect.value = state.territoryId;
  document.getElementById('saleReference').value = `KMO-${Date.now().toString().slice(-6)}`;
}

function closeModal(id) {
  document.getElementById(id).hidden = true;
  document.body.style.overflow = '';
}

function handleSaleSubmit(event) {
  event.preventDefault();
  const employeeId = document.getElementById('saleEmployee').value;
  const mrr = Number(document.getElementById('salePlan').value);
  const territoryId = document.getElementById('saleMunicipality').value;
  const neighborhood = document.getElementById('saleNeighborhood').value.trim();
  const reference = document.getElementById('saleReference').value.trim();
  if (!employeeId || !territoryId || !neighborhood || !reference || !Number.isFinite(mrr)) {
    showToast('Preencha todos os campos da venda.', true);
    return;
  }
  if (sales.some(item => item.id.toLocaleLowerCase() === reference.toLocaleLowerCase())) {
    showToast('Este identificador de venda já existe.', true);
    return;
  }
  const plan = document.getElementById('salePlan').selectedOptions[0].text.split(' · ')[0];
  sales.push({ id: reference, employeeId, date: '2026-07-29', territoryId, neighborhood, plan, mrr, status: 'confirmed' });
  referrals.push({ id: `REF-${reference}`, employeeId, territoryId, date: '2026-07-29', status: 'valid' });
  closeModal('saleModal');
  state.period = 'month';
  document.getElementById('periodSelect').value = 'month';
  state.department = 'all';
  state.territoryId = 'all';
  state.search = '';
  state.metric = 'sales';
  renderAll();
  celebrateSale(employeeId, mrr);
  event.target.reset();
}

function celebrateSale(employeeId, mrr) {
  const employee = getEmployee(employeeId);
  setText('celebrationText', `${employee.name} confirmou ${money.format(mrr)} em MRR`);
  const layer = document.getElementById('saleCelebration');
  layer.classList.remove('is-active');
  void layer.offsetWidth;
  layer.classList.add('is-active');
  launchConfetti({ duration: 3000, intensity: 1.6 });
  setTimeout(() => layer.classList.remove('is-active'), 2900);
  showToast(`Venda confirmada para ${employee.name}. Ranking recalculado.`);
}

function openProfile(employeeId) {
  const item = summarizeEmployee(getEmployee(employeeId));
  if (!item) return;
  document.getElementById('profileContent').innerHTML = `
    <div class="profile-head"><span class="profile-big-avatar">${item.initials}</span><div><span class="eyebrow">Perfil comercial</span><h2 id="profileName">${escapeHtml(item.name)}</h2><p>${escapeHtml(item.department)}</p></div></div>
    <div class="profile-grid"><div><span>Vendas</span><strong>${item.sales}</strong></div><div><span>MRR</span><strong>${money.format(item.mrr)}</strong></div><div><span>Conversão</span><strong>${percent(item.conversion)}</strong></div><div><span>Pontos</span><strong>${number.format(item.points)}</strong></div></div>
    <span class="eyebrow">Vendas por território</span><div class="profile-territories">${item.territories.length ? item.territories.map(territory => `<div class="profile-territory"><span>${escapeHtml(territory.name)}</span><strong>${territory.sales}</strong></div>`).join('') : '<p style="color:var(--muted)">Sem vendas na seleção atual.</p>'}</div>`;
  document.getElementById('profileModal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function exportCsv() {
  const ranked = sortSummaries();
  const rows = [['Posição', 'Participante', 'Equipe', 'Indicações válidas', 'Vendas', 'MRR', 'Conversão', 'Pontos']];
  ranked.forEach((item, index) => rows.push([index + 1, item.name, item.department, item.referrals, item.sales, item.mrr.toFixed(2), (item.conversion * 100).toFixed(1), item.points]));
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ranking-indica-plus-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast('Ranking exportado com os filtros atuais.');
}

function launchConfetti({ duration = 1800, intensity = 1 } = {}) {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#ff7600', '#333399', '#7776e9', '#ffffff', '#ffca55'];
  const count = Math.round(Math.min(240, 110 * intensity));
  const pieces = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * .45,
    w: 5 + Math.random() * 8,
    h: 3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 2.5 + Math.random() * 5,
    drift: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    rotationSpeed: -.12 + Math.random() * .24,
    wave: Math.random() * 10
  }));
  const started = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, width, height);
    pieces.forEach(piece => {
      piece.y += piece.speed;
      piece.x += piece.drift + Math.sin(piece.y * .02) * .45;
      piece.rotation += piece.rotationSpeed;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      ctx.restore();
    });
    if (now - started < duration && pieces.some(piece => piece.y < height + 30)) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, width, height);
  }
  requestAnimationFrame(frame);
}

function showToast(message, error = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${error ? 'error' : ''}`;
  toast.textContent = message;
  document.getElementById('toastRegion').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}
function formatDate(value) { return parseDate(value).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
function escapeAttribute(value) { return escapeHtml(value); }

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view)));
  document.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go) navigate(go.dataset.go);
    const profile = event.target.closest('[data-profile]');
    if (profile) openProfile(profile.dataset.profile);
    const territory = event.target.closest('[data-territory]');
    if (territory) selectTerritory(territory.dataset.territory, { keepView: territory.closest('#view-territory') !== null });
    const department = event.target.closest('[data-department]');
    if (department) {
      state.department = department.dataset.department;
      document.getElementById('departmentSelect').value = state.department;
      renderAll();
    }
    const close = event.target.closest('[data-close]');
    if (close) closeModal(close.dataset.close);
  });
  document.getElementById('mobileMenu').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const open = sidebar.classList.toggle('is-open');
    document.getElementById('mobileMenu').setAttribute('aria-expanded', String(open));
  });
  document.getElementById('periodSelect').addEventListener('change', event => { state.period = event.target.value; renderAll(); });
  document.getElementById('rankingSearch').addEventListener('input', event => { state.search = event.target.value.trim().toLocaleLowerCase('pt-BR'); renderAll(); });
  document.getElementById('departmentSelect').addEventListener('change', event => { state.department = event.target.value; renderAll(); });
  document.getElementById('kpiGrid').addEventListener('click', event => {
    const card = event.target.closest('[data-metric]');
    if (!card) return;
    state.metric = card.dataset.metric;
    renderAll();
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    state.department = 'all'; state.territoryId = 'all'; state.search = '';
    document.getElementById('departmentSelect').value = 'all';
    document.getElementById('rankingSearch').value = '';
    renderAll();
  });
  document.getElementById('resetMap').addEventListener('click', () => selectTerritory('all', { keepView: true }));
  document.getElementById('openSaleModal').addEventListener('click', openSaleModal);
  document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(backdrop.id); }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(modal => closeModal(modal.id));
  });
  window.addEventListener('resize', () => { if (map) map.invalidateSize(); });
}

function initSelects() {
  const departments = [...new Set(employees.map(item => item.department))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  document.getElementById('departmentSelect').innerHTML = '<option value="all">Todas as equipes</option>' + departments.map(item => `<option value="${escapeAttribute(item)}">${escapeHtml(item)}</option>`).join('');
}

function boot() {
  initSelects();
  bindEvents();
  renderAll();
  initMap();
  setTimeout(() => {
    document.getElementById('splash').classList.add('is-hidden');
    launchConfetti({ duration: 2600, intensity: 1.15 });
  }, 1450);
}

document.addEventListener('DOMContentLoaded', boot);
