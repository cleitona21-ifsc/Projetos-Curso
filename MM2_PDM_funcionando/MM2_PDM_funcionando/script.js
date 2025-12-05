// Variáveis Globais
let estabelecimentos = []; // Armazena a lista de estabelecimentos carregados
let reservas = [];
let estabelecimentoSelecionadoId = null;
let quadraSelecionada = null;

// ---------------------- Helpers de Imagem & Path ----------------------
function normalizeImgPath(path) {
    if (!path) return '/imagens/placeholder.png';
    if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
    return path.replace(/^\.\//, '');
}

function setImgWithFallback(imgEl, src) {
    imgEl.src = src;
    imgEl.onerror = function () {
        console.warn('Falha ao carregar imagem:', src);
        this.onerror = null;
        this.src = '/imagens/placeholder.png';
    };
}

// ---------------------- Navegação ----------------------
function navegar(destino) {
    const origem = document.querySelector('.tela.show')?.id || 'tela-home';
    const telas = document.querySelectorAll('.tela');
    telas.forEach(tela => {
        tela.classList.remove('show');
        tela.classList.add('collapse');
    });
    const telaDestino = document.getElementById(destino);
    if (telaDestino) {
        telaDestino.classList.remove('collapse');
        telaDestino.classList.add('show');
        console.log(`Navegando para: ${destino} Vindo de: ${origem}`);
    }
}

function voltar() {
    if (document.getElementById('tela-detalhe-quadra').classList.contains('show')) {
        mostrarQuadrasDoEstabelecimento(estabelecimentoSelecionadoId);
    } else if (document.getElementById('tela-lista-quadras').classList.contains('show')) {
        navegar('tela-home');
    } else if (document.getElementById('tela-minhas-reservas').classList.contains('show')) {
        navegar('tela-home');
    } else if (document.getElementById('tela-contato').classList.contains('show')) {
        navegar('tela-home');
    } else {
        navegar('tela-home');
    }
}

// ---------------------- Fetch com timeout ----------------------
function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
}

// ---------------------- Carregar Dados ----------------------
async function carregarDadosEEstabelecimentos() {
    console.log("-> Tentando carregar dados do servidor...");
    try {
        const [estabResponse, reservasResponse] = await Promise.all([
            fetchWithTimeout('http://127.0.0.1:3000/estabelecimentos'),
            fetchWithTimeout('http://127.0.0.1:3000/reservas')
        ]);

        if (!estabResponse.ok || !reservasResponse.ok) {
            throw new Error(`Erro HTTP. Estabelecimentos: ${estabResponse.status} ${estabResponse.statusText}, Reservas: ${reservasResponse.status} ${reservasResponse.statusText}`);
        }

        const dadosEstabelecimentos = await estabResponse.json();
        const dadosReservas = await reservasResponse.json();

        // Popula as variáveis globais (garantindo arrays)
        estabelecimentos = Array.isArray(dadosEstabelecimentos) ? dadosEstabelecimentos : [];
        reservas = Array.isArray(dadosReservas) ? dadosReservas : [];

        console.log(`Dados carregados. Estabelecimentos: ${estabelecimentos.length}, Reservas: ${reservas.length}`);

        renderizarEstabelecimentos();
    } catch (error) {
        console.error("❌ Falha ao carregar os dados:", error);
        document.getElementById("lista-estabelecimentos").innerHTML =
            "<p class='text-danger text-center'>❌ Não foi possível conectar ao servidor. Verifique o JSON Server na porta 3000.</p>";
    }
}

// ---------------------- Renderizar Estabelecimentos ----------------------
function renderizarEstabelecimentos() {
    const telaLista = document.getElementById("lista-estabelecimentos");
    telaLista.innerHTML = "";

    console.log("Conteúdo de 'estabelecimentos' antes de renderizar:", estabelecimentos.length);

    if (!Array.isArray(estabelecimentos) || estabelecimentos.length === 0) {
        telaLista.innerHTML = "<p class='text-danger text-center'>Nenhum estabelecimento encontrado.</p>";
        navegar('tela-home');
        return;
    }

    estabelecimentos.forEach(est => {
        const cardCol = document.createElement("div");
        cardCol.className = "col";

        const card = document.createElement('div');
        card.className = "card h-100 shadow-sm";
        card.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.className = "card-img-top";
        img.style.height = "200px";
        img.style.objectFit = "cover";
        img.alt = est.nome || 'Imagem';
        setImgWithFallback(img, normalizeImgPath(est.imagem));

        const body = document.createElement('div');
        body.className = "card-body";
        body.innerHTML = `<h5 class="card-title">${est.nome}</h5><p class="card-text">${est.endereco}</p>`;

        card.appendChild(img);
        card.appendChild(body);
        card.addEventListener('click', () => mostrarQuadrasDoEstabelecimento(est.id));
        cardCol.appendChild(card);
        telaLista.appendChild(cardCol);
    });

    navegar('tela-home');
}

// ---------------------- Mostrar Quadras ----------------------
function mostrarQuadrasDoEstabelecimento(id) {
    console.log('✅ mostrarQuadrasDoEstabelecimento - ID Recebido:', id);
    const numericId = Number(id);
    estabelecimentoSelecionadoId = numericId;

    console.log("Estabelecimentos no momento do clique (Total):", estabelecimentos.length);
    console.table(estabelecimentos.map(e => ({ id: e.id, idType: typeof e.id, nome: e.nome })));

    // comparação robusta (garante coerência string/number)
    const est = estabelecimentos.find(e => Number(e.id) === numericId);

    if (!est) {
        console.error("❌ Erro: Estabelecimento não encontrado para o ID:", id);
        console.error("Conteúdo completo de 'estabelecimentos':", JSON.parse(JSON.stringify(estabelecimentos)));
        return;
    }

    const nomeElemento = document.getElementById('nome-estabelecimento');
    if (nomeElemento) nomeElemento.innerText = est.nome || 'Quadras Disponíveis';

    const cardsContainer = document.getElementById('cards-quadras');
    cardsContainer.innerHTML = '';

    const quadras = Array.isArray(est.quadrasDisponiveis) ? est.quadrasDisponiveis : [];
    if (quadras.length === 0) {
        cardsContainer.innerHTML = '<p class="text-muted">Nenhuma quadra disponível.</p>';
    } else {
        quadras.forEach(q => {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = 'card h-100 shadow-sm';
            card.style.cursor = 'pointer';

            const img = document.createElement('img');
            img.className = 'card-img-top';
            img.style.height = '200px';
            img.style.objectFit = 'cover';
            img.alt = q.nome || 'Quadra';
            setImgWithFallback(img, normalizeImgPath(q.imagem));

            const body = document.createElement('div');
            body.className = 'card-body';
            body.innerHTML = `<h5 class="card-title">${q.nome}</h5><p class="card-text">${q.tipo} — R$ ${Number(q.precoHora).toFixed(2)}</p>`;

            card.appendChild(img);
            card.appendChild(body);
            card.addEventListener('click', () => mostrarDetalheQuadra(est.id, q.id));
            col.appendChild(card);
            cardsContainer.appendChild(col);
        });
    }

    navegar('tela-lista-quadras');
}

// ---------------------- Helpers de Datas/Conflito ----------------------
function parseDateTimeLocal(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const s = `${dateStr}T${timeStr}:00`;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}

function sobreposicao(inicioA, fimA, inicioB, fimB) {
    return inicioA < fimB && inicioB < fimA;
}

// ---------------------- Verificar Disponibilidade (consulta servidor) ----------------------
async function verificarDisponibilidade(estId, quadId, inicioISO, fimISO) {
    try {
        const resp = await fetch('http://127.0.0.1:3000/reservas');
        if (!resp.ok) throw new Error('Falha ao buscar reservas do servidor');
        const todasReservas = await resp.json();

        const mesmas = (Array.isArray(todasReservas) ? todasReservas : []).filter(r =>
            Number(r.estabelecimentoId) === Number(estId) &&
            Number(r.quadraId) === Number(quadId)
        );

        const inicio = (typeof inicioISO === 'string') ? new Date(inicioISO) : new Date(inicioISO);
        const fim = (typeof fimISO === 'string') ? new Date(fimISO) : new Date(fimISO);

        for (const r of mesmas) {
            let rInicio = r.inicio ? new Date(r.inicio) : (r.data ? new Date(r.data) : null);
            let rFim = r.fim ? new Date(r.fim) : null;
            if (!rInicio) continue;
            if (!rFim) rFim = new Date(rInicio.getTime() + (60 * 60 * 1000));
            if (sobreposicao(inicio, fim, rInicio, rFim)) {
                return { disponivel: false, conflito: r };
            }
        }
        return { disponivel: true };
    } catch (err) {
        console.error('Erro ao verificar disponibilidade:', err);
        return { disponivel: false, erro: err };
    }
}

// ---------------------- Mostrar Detalhe + Form Reserva ----------------------
function mostrarDetalheQuadra(estId, quadId) {
    const numericEstId = Number(estId);
    const numericQuadId = Number(quadId);
    const est = estabelecimentos.find(e => Number(e.id) === numericEstId);
    if (!est) return console.error("❌ Estabelecimento não encontrado ao abrir detalhe da quadra:", estId);
    const quad = (est.quadrasDisponiveis || []).find(q => Number(q.id) === numericQuadId);
    if (!quad) return console.error("❌ Quadra não encontrada:", quadId, "no estabelecimento", estId);

    quadraSelecionada = { estabelecimentoId: numericEstId, quadraId: numericQuadId };

    const detalhe = document.getElementById('detalhes-quadra');
    detalhe.innerHTML = `
        <div class="card shadow-sm">
            <img src="${normalizeImgPath(quad.imagem)}" class="card-img-top" style="height:300px;object-fit:cover" alt="${quad.nome}">
            <div class="card-body">
                <h3 class="card-title">${quad.nome}</h3>
                <p><strong>Tipo:</strong> ${quad.tipo}</p>
                <p>${quad.descricao || ''}</p>
                <p><strong>Valor por hora:</strong> R$ ${Number(quad.precoHora).toFixed(2)}</p>

                <hr />

                <div class="row g-2 align-items-end">
                    <div class="col-sm-4">
                        <label class="form-label">Data</label>
                        <input id="reserva-data" class="form-control" type="date" />
                    </div>
                    <div class="col-sm-4">
                        <label class="form-label">Hora de início</label>
                        <input id="reserva-hora" class="form-control" type="time" />
                    </div>
                    <div class="col-sm-3">
                        <label class="form-label">Duração (h)</label>
                        <select id="reserva-duracao" class="form-select">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                    <div class="col-sm-1">
                        <button id="btn-check" class="btn btn-outline-primary" title="Verificar">OK</button>
                    </div>
                </div>

                <div id="reserva-msg" class="mt-3"></div>

                <div class="mt-3">
                    <button id="btn-reservar" class="btn btn-primary" disabled>Reservar</button>
                </div>
            </div>
        </div>
    `;

    // aplica fallback na imagem do detalhe (criada via innerHTML acima)
    const detalheImg = detalhe.querySelector('img.card-img-top');
    if (detalheImg) setImgWithFallback(detalheImg, normalizeImgPath(quad.imagem));

    document.getElementById('btn-check').addEventListener('click', async () => {
        const date = document.getElementById('reserva-data').value;
        const time = document.getElementById('reserva-hora').value;
        const dur = Number(document.getElementById('reserva-duracao').value);

        const msgEl = document.getElementById('reserva-msg');
        msgEl.innerHTML = '';
        document.getElementById('btn-reservar').disabled = true;

        const inicioDate = parseDateTimeLocal(date, time);
        if (!inicioDate) {
            msgEl.innerHTML = `<div class="alert alert-warning">Selecione data e hora válidas.</div>`;
            return;
        }
        const agora = new Date();
        if (inicioDate < agora) {
            msgEl.innerHTML = `<div class="alert alert-warning">A data/horário deve ser no futuro.</div>`;
            return;
        }
        const fimDate = new Date(inicioDate.getTime() + dur * 60 * 60 * 1000);

        msgEl.innerHTML = `<div class="text-muted">Verificando disponibilidade...</div>`;
        const resultado = await verificarDisponibilidade(numericEstId, numericQuadId, inicioDate.toISOString(), fimDate.toISOString());

        if (resultado.disponivel) {
            msgEl.innerHTML = `<div class="alert alert-success">Disponível! Clique em "Reservar" para confirmar.</div>`;
            document.getElementById('btn-reservar').disabled = false;
        } else {
            if (resultado.conflito) {
                const r = resultado.conflito;
                const inicioConflito = r.inicio ? new Date(r.inicio) : new Date(r.data);
                const fimConflito = r.fim ? new Date(r.fim) : new Date(inicioConflito.getTime() + (60*60*1000));
                msgEl.innerHTML = `<div class="alert alert-danger">Conflito com reserva existente em ${inicioConflito.toLocaleString()} — ${fimConflito.toLocaleString()}.</div>`;
            } else if (resultado.erro) {
                msgEl.innerHTML = `<div class="alert alert-danger">Não foi possível verificar disponibilidade. Tente novamente.</div>`;
            } else {
                msgEl.innerHTML = `<div class="alert alert-danger">Horário indisponível.</div>`;
            }
            document.getElementById('btn-reservar').disabled = true;
        }
    });

    document.getElementById('btn-reservar').addEventListener('click', reservarQuadra);

    navegar('tela-detalhe-quadra');
}

// ---------------------- Reservar (POST) ----------------------
async function reservarQuadra() {
    if (!quadraSelecionada) {
        alert('Nenhuma quadra selecionada para reserva.');
        return;
    }

    const date = document.getElementById('reserva-data').value;
    const time = document.getElementById('reserva-hora').value;
    const dur = Number(document.getElementById('reserva-duracao').value);
    const msgEl = document.getElementById('reserva-msg');
    msgEl.innerHTML = '';

    const inicioDate = parseDateTimeLocal(date, time);
    if (!inicioDate) {
        msgEl.innerHTML = `<div class="alert alert-warning">Selecione data e hora válidas antes de reservar.</div>`;
        return;
    }
    const agora = new Date();
    if (inicioDate < agora) {
        msgEl.innerHTML = `<div class="alert alert-warning">A data/horário deve ser no futuro.</div>`;
        return;
    }
    const fimDate = new Date(inicioDate.getTime() + dur * 60 * 60 * 1000);

    msgEl.innerHTML = `<div class="text-muted">Confirmando disponibilidade...</div>`;
    const check = await verificarDisponibilidade(quadraSelecionada.estabelecimentoId, quadraSelecionada.quadraId, inicioDate.toISOString(), fimDate.toISOString());
    if (!check.disponivel) {
        if (check.conflito) {
            const r = check.conflito;
            const inicioConflito = r.inicio ? new Date(r.inicio) : new Date(r.data);
            const fimConflito = r.fim ? new Date(r.fim) : new Date(inicioConflito.getTime() + (60*60*1000));
            msgEl.innerHTML = `<div class="alert alert-danger">Conflito com reserva existente em ${inicioConflito.toLocaleString()} — ${fimConflito.toLocaleString()}.</div>`;
        } else {
            msgEl.innerHTML = `<div class="alert alert-danger">Horário indisponível. Atualize e tente outro horário.</div>`;
        }
        return;
    }

    const payload = {
        estabelecimentoId: quadraSelecionada.estabelecimentoId,
        quadraId: quadraSelecionada.quadraId,
        usuario: 'usuario-teste',
        inicio: inicioDate.toISOString(),
        fim: fimDate.toISOString()
    };

    try {
        const resp = await fetch('http://127.0.0.1:3000/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) throw new Error('Falha ao salvar reserva no servidor.');

        const novaReserva = await resp.json();
        reservas.push(novaReserva);

        msgEl.innerHTML = `<div class="alert alert-success">Reserva realizada com sucesso para ${inicioDate.toLocaleString()} — ${fimDate.toLocaleString()}.</div>`;
        document.getElementById('btn-reservar').disabled = true;

        setTimeout(() => {
            mostrarMinhasReservas();
        }, 900);
    } catch (err) {
        console.error('Erro ao reservar:', err);
        msgEl.innerHTML = `<div class="alert alert-danger">Não foi possível realizar a reserva. Verifique o servidor e tente novamente.</div>`;
    }
}

// ---------------------- Minhas Reservas ----------------------
function renderizarMinhasReservas() {
    const lista = document.getElementById('lista-minhas-reservas');
    lista.innerHTML = '';

    if (!Array.isArray(reservas) || reservas.length === 0) {
        lista.innerHTML = '<p class="text-muted">Nenhuma reserva encontrada.</p>';
        return;
    }

    reservas.forEach(r => {
        const est = estabelecimentos.find(e => Number(e.id) === Number(r.estabelecimentoId));
        const quad = est?.quadrasDisponiveis?.find(q => Number(q.id) === Number(r.quadraId));
        const inicio = r.inicio ? new Date(r.inicio) : (r.data ? new Date(r.data) : null);
        const fim = r.fim ? new Date(r.fim) : (inicio ? new Date(inicio.getTime() + 60*60*1000) : null);

        const card = document.createElement('div');
        card.className = 'card mb-2 p-2';
        card.innerHTML = `
            <div>
                <strong>${est?.nome || 'Estabelecimento'}</strong> — ${quad?.nome || 'Quadra'}
                <div><small>${inicio ? inicio.toLocaleString() : ''} ${fim ? '— ' + fim.toLocaleString() : ''}</small></div>
            </div>
        `;
        lista.appendChild(card);
    });
}

function mostrarMinhasReservas() {
    fetch('http://127.0.0.1:3000/reservas')
        .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
        .then(dados => {
            reservas = Array.isArray(dados) ? dados : [];
            renderizarMinhasReservas();
            navegar('tela-minhas-reservas');
        })
        .catch(err => {
            console.error('Erro ao atualizar reservas:', err);
            renderizarMinhasReservas();
            navegar('tela-minhas-reservas');
        });
}

// ---------------------- PWA / inicialização ----------------------
function installApp() {
    // placeholder
}

window.addEventListener('online', () => console.log('Conexão restaurada'));
window.addEventListener('offline', () => console.log('Você está offline'));

document.addEventListener('DOMContentLoaded', carregarDadosEEstabelecimentos);