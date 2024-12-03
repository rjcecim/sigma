// script.js

document.addEventListener('DOMContentLoaded', () => {
    const addActivityBtn = document.getElementById('addActivityBtn');
    const activitiesContainer = document.getElementById('activitiesContainer');
    const totalPontuacao = document.getElementById('totalPontuacao');
    const gerarJsonBtn = document.getElementById('gerarJsonBtn');
    const carregarJsonBtn = document.getElementById('carregarJsonBtn');
    const jsonOutput = document.getElementById('jsonOutput');
    const salvarJsonBtn = document.getElementById('salvarJsonBtn');
    const fileInput = document.getElementById('fileInput');
    const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
    const resetBtn = document.getElementById('resetBtn');
    let atividades = [];
    let atividadesData = [];

    const toastNotification = new bootstrap.Toast(document.getElementById('toastNotification'));

    const atualizarPontuacao = () => {
        let total = 0;
        atividades.forEach(atividade => {
            total += atividade.pontuacaoTotal || 0;
        });
        totalPontuacao.textContent = total.toFixed(1).replace('.', ',');
    };

    const adicionarNovaAtividade = () => {
        const atividade = {
            id: Date.now(),
            nome: '',
            quantidade: null,
            pontuacaoBase: 0,
            pontuacaoTotal: 0,
            descricao: '',
            'data-value': ''
        };
        atividades.push(atividade);
        renderizarAtividades();
    };

    const removerAtividade = (id) => {
        atividades = atividades.filter(atividade => atividade.id !== id);
        renderizarAtividades();
    };

    const renderizarAtividades = () => {
        activitiesContainer.innerHTML = '';
        atividades.forEach(atividade => {
            const atividadeDiv = document.createElement('div');
            atividadeDiv.classList.add('atividade', 'd-flex', 'flex-column', 'shadow-sm');
            atividadeDiv.setAttribute('data-id', atividade.id);

            const select = document.createElement('select');
            select.classList.add('form-select');
            select.setAttribute('aria-label', 'Seleção de Atividade');
            select.innerHTML = `
                <option value="" disabled ${atividade.nome === '' ? 'selected' : ''}>Selecione uma atividade</option>
            `;
            atividadesData.forEach(item => {
                const option = document.createElement('option');
                option.value = item.nome;
                option.textContent = item.nome;
                if (item.nome === atividade.nome) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            select.required = true;
            select.addEventListener('change', (e) => {
                atividade.nome = e.target.value;
                const atividadeSelecionada = atividadesData.find(item => item.nome === e.target.value);
                if (atividadeSelecionada) {
                    const pontuacaoBaseStr = atividadeSelecionada.pontuacao.replace(',', '.');
                    const pontuacaoBaseFloat = parseFloat(pontuacaoBaseStr);
                    atividade.pontuacaoBase = pontuacaoBaseFloat;
                    atividade.descricao = atividadeSelecionada.descricao;
                    atividade['data-value'] = atividadeSelecionada['data-value'];
                    if (atividade.quantidade === null || isNaN(atividade.quantidade)) {
                        atividade.quantidade = null;
                        atividade.pontuacaoTotal = 0;
                    } else {
                        atividade.pontuacaoTotal = atividade.pontuacaoBase * atividade.quantidade;
                    }
                    inputPontuacaoTotal.value = atividade.pontuacaoTotal > 0 ? atividade.pontuacaoTotal.toFixed(1).replace('.', ',') : '';
                    inputDescricao.value = atividade.descricao;
                } else {
                    atividade.pontuacaoBase = 0;
                    atividade.descricao = '';
                    atividade['data-value'] = '';
                    atividade.quantidade = null;
                    atividade.pontuacaoTotal = 0;
                    inputPontuacaoTotal.value = '';
                    inputDescricao.value = '';
                }
                atualizarPontuacao();
            });

            atividadeDiv.appendChild(select);

            const rowDiv = document.createElement('div');
            rowDiv.classList.add('row', 'g-3');

            const colPontuacao = document.createElement('div');
            colPontuacao.classList.add('col-md-6');

            const inputPontuacao = document.createElement('input');
            inputPontuacao.type = 'number';
            inputPontuacao.classList.add('form-control');
            inputPontuacao.placeholder = 'Pontuação';
            inputPontuacao.value = atividade.quantidade !== null ? atividade.quantidade : '';
            inputPontuacao.addEventListener('input', (e) => {
                const pontuacao = parseFloat(e.target.value.replace(',', '.'));
                atividade.quantidade = isNaN(pontuacao) || pontuacao < 0 ? 0 : pontuacao;
                atividade.pontuacaoTotal = atividade.pontuacaoBase * atividade.quantidade;
                inputPontuacaoTotal.value = atividade.pontuacaoTotal > 0 ? atividade.pontuacaoTotal.toFixed(1).replace('.', ',') : '';
                atualizarPontuacao();
            });

            colPontuacao.appendChild(inputPontuacao);
            rowDiv.appendChild(colPontuacao);

            const colPontuacaoTotal = document.createElement('div');
            colPontuacaoTotal.classList.add('col-md-6');

            const inputPontuacaoTotal = document.createElement('input');
            inputPontuacaoTotal.type = 'text';
            inputPontuacaoTotal.classList.add('form-control');
            inputPontuacaoTotal.placeholder = 'Pontuação Total';
            inputPontuacaoTotal.readOnly = true;
            inputPontuacaoTotal.value = atividade.pontuacaoTotal > 0 ? atividade.pontuacaoTotal.toFixed(1).replace('.', ',') : '';

            colPontuacaoTotal.appendChild(inputPontuacaoTotal);
            rowDiv.appendChild(colPontuacaoTotal);

            atividadeDiv.appendChild(rowDiv);

            const inputDescricao = document.createElement('textarea');
            inputDescricao.classList.add('form-control');
            inputDescricao.placeholder = 'Descrição';
            inputDescricao.value = atividade.descricao;
            inputDescricao.rows = 3;
            inputDescricao.addEventListener('input', (e) => {
                atividade.descricao = e.target.value;
            });

            atividadeDiv.appendChild(inputDescricao);

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('removeActivityBtn', 'btn', 'btn-danger', 'mt-2');
            removeBtn.setAttribute('aria-label', 'Remover atividade');
            removeBtn.innerHTML = `<i class="bi bi-trash me-2" aria-hidden="true"></i> Remover`;
            removeBtn.addEventListener('click', () => removerAtividade(atividade.id));

            atividadeDiv.appendChild(removeBtn);

            activitiesContainer.appendChild(atividadeDiv);
        });
        atualizarPontuacao();
    };

    const gerarJSON = () => {
        const jsonData = JSON.stringify({
            atividades: atividades.map(atividade => ({
                nome: atividade.nome,
                pontuacao: atividade.quantidade,
                descricao: atividade.descricao,
                'data-value': atividade['data-value']
            }))
        }, null, 4);
        jsonOutput.textContent = jsonData;
        salvarJsonBtn.style.display = 'inline-block';
    };

    const salvarJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonOutput.textContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "atividades.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toastNotification.show();
    };

    const carregarJSON = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target.result);
                if (loadedData.atividades && Array.isArray(loadedData.atividades)) {
                    const novasAtividades = loadedData.atividades.map(item => {
                        const atividadeSelecionada = atividadesData.find(data => data.nome === item.nome);
                        const pontuacaoBase = atividadeSelecionada ? parseFloat(atividadeSelecionada.pontuacao.replace(',', '.')) : 0;
                        const quantidade = item.pontuacao ? parseFloat(item.pontuacao) : 0;
                        const pontuacaoTotal = pontuacaoBase * quantidade;

                        return {
                            id: Date.now() + Math.random(),
                            nome: item.nome || '',
                            pontuacaoBase: pontuacaoBase,
                            quantidade: quantidade,
                            pontuacaoTotal: pontuacaoTotal,
                            descricao: item.descricao || '',
                            'data-value': item['data-value'] || ''
                        };
                    });
                    atividades = atividades.concat(novasAtividades);
                    renderizarAtividades();
                } else {
                    throw new Error("Formato inválido");
                }
            } catch (error) {
                alert("Erro ao carregar o JSON. Verifique o formato do arquivo.");
            }
        };
        reader.readAsText(file);
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            toggleDarkModeBtn.innerHTML = `<i class="bi bi-sun-fill me-2" aria-hidden="true"></i> Modo Claro`;
        } else {
            toggleDarkModeBtn.innerHTML = `<i class="bi bi-moon-fill me-2" aria-hidden="true"></i> Modo Escuro`;
        }
    };

    const resetAtividades = () => {
        atividades = [];
        renderizarAtividades();
        jsonOutput.textContent = '';
        salvarJsonBtn.style.display = 'none';
    };

    const carregarAtividadesXML = () => {
        fetch('atividades.xml')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao carregar o XML: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "application/xml");
                const atividadesXML = xmlDoc.getElementsByTagName('atividade');
                atividadesData = [];
                for (let i = 0; i < atividadesXML.length; i++) {
                    const atividade = atividadesXML[i];
                    const nome = atividade.getElementsByTagName('nome')[0]?.textContent || '';
                    const pontuacao = atividade.getElementsByTagName('pontuacao')[0]?.textContent || '0,00';
                    const descricao = atividade.getElementsByTagName('descricao')[0]?.textContent || '';
                    const dataValue = atividade.getElementsByTagName('data-value')[0]?.textContent || '';
                    atividadesData.push({ nome, pontuacao, descricao, 'data-value': dataValue });
                }
                renderizarAtividades();
            })
            .catch(error => {
                console.error(error);
                alert("Não foi possível carregar as atividades do XML.");
            });
    };

    addActivityBtn.addEventListener('click', adicionarNovaAtividade);
    gerarJsonBtn.addEventListener('click', gerarJSON);
    salvarJsonBtn.addEventListener('click', salvarJSON);
    carregarJsonBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', carregarJSON);
    toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
    resetBtn.addEventListener('click', resetAtividades);

    carregarAtividadesXML();
});
