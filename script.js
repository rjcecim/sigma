document.addEventListener('DOMContentLoaded', () => {
    const activitiesContainer = document.getElementById('activitiesContainer');
    const addActivityBtn = document.getElementById('addActivityBtn');
    const gerarJsonBtn = document.getElementById('gerarJsonBtn');
    const carregarJsonBtn = document.getElementById('carregarJsonBtn');
    const salvarJsonBtn = document.getElementById('salvarJsonBtn');
    const jsonOutput = document.getElementById('jsonOutput');
    const fileInput = document.getElementById('fileInput');
    const totalPontuacaoEl = document.getElementById('totalPontuacao');

    let atividadesData = [];
    let resultadoJSON = {};

    // Formatação de números usando Intl
    const formatNumber = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

    // Carregar atividades do XML e armazenar em atividadesData
    async function carregarAtividadesXML() {
        try {
            const response = await fetch('atividades.xml');
            if (!response.ok) throw new Error('Falha ao carregar atividades.');
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "application/xml");
            const atividades = xmlDoc.getElementsByTagName('atividade');

            atividadesData = Array.from(atividades).map(atividade => ({
                nome: atividade.querySelector('nome').textContent,
                dataValue: atividade.querySelector('data-value').textContent,
                pontuacao: parseFloat(atividade.querySelector('pontuacao').textContent.replace(',', '.')),
                descricao: atividade.querySelector('descricao').textContent
            }));
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar atividades. Verifique o console para mais detalhes.');
        }
    }

    // Formatar entrada numérica
    function formatarEntradaNumerica(campo) {
        const previousValue = campo.dataset.previousValue || '';
        const currentValue = campo.value;

        // Verificar se o usuário está deletando
        if (currentValue.length < previousValue.length) {
            // Usuário está deletando, não formatar imediatamente
            campo.dataset.previousValue = currentValue;
            return;
        }

        // Remover todos os caracteres que não são dígitos
        let valorNumerico = parseFloat(currentValue.replace(/\D/g, '')) || 0;

        // Dividir por 10 para obter uma casa decimal
        let valorFormatado = (valorNumerico / 10).toFixed(1).replace('.', ',');

        campo.value = valorFormatado;
        campo.dataset.previousValue = valorFormatado;

        // Atualizar a pontuação total após formatação
        atualizarPontuacaoTotal();
    }

    // Adicionar nova atividade
    function adicionarNovaAtividade(selectedActivityValue = null, pontuacaoRealizada = '') {
        const activityGroup = document.createElement('div');
        activityGroup.classList.add('activity-group');

        // Criar Input Group
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');

        // Label e Select para Atividade
        const labelAtividade = document.createElement('label');
        const uniqueIdAtividade = `atividadeDropdown-${Date.now()}`;
        labelAtividade.setAttribute('for', uniqueIdAtividade);
        labelAtividade.textContent = 'Selecione uma atividade:';

        const selectAtividade = document.createElement('select');
        selectAtividade.classList.add('atividadeDropdown');
        selectAtividade.setAttribute('id', uniqueIdAtividade);
        selectAtividade.setAttribute('aria-label', 'Selecione uma atividade');

        // Preencher opções
        atividadesData.forEach(atividade => {
            const option = document.createElement('option');
            option.value = atividade.dataValue;
            option.textContent = `${atividade.nome} (${formatNumber.format(atividade.pontuacao)} ponto(s))`;
            selectAtividade.appendChild(option);
        });

        if (selectedActivityValue) {
            selectAtividade.value = selectedActivityValue;
        }

        // Label e Input para Pontuação
        const labelPontuacao = document.createElement('label');
        const uniqueIdPontuacao = `pontuacaoRealizada-${Date.now()}`;
        labelPontuacao.setAttribute('for', uniqueIdPontuacao);
        labelPontuacao.textContent = 'Insira a pontuação que você realizou:';

        const inputPontuacao = document.createElement('input');
        inputPontuacao.type = 'text';
        inputPontuacao.classList.add('pontuacaoRealizada');
        inputPontuacao.setAttribute('id', uniqueIdPontuacao);
        inputPontuacao.placeholder = 'Digite a pontuação realizada';
        inputPontuacao.value = pontuacaoRealizada;
        inputPontuacao.setAttribute('data-previous-value', pontuacaoRealizada);
        inputPontuacao.addEventListener('input', (e) => formatarEntradaNumerica(e.target));

        // Append elementos ao inputGroup
        inputGroup.appendChild(labelAtividade);
        inputGroup.appendChild(selectAtividade);
        inputGroup.appendChild(labelPontuacao);
        inputGroup.appendChild(inputPontuacao);

        // Botão de Remover Atividade
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-activity-btn');
        removeBtn.setAttribute('aria-label', 'Remover Atividade');
        removeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18v2H3V6zm2 3h14v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm3 0v11h2V9H8zm4 0v11h2V9h-2zm4 0v11h2V9h-2zm1-6V1h-8v2H3v2h18V3h-4z"/>
            </svg>
        `;
        removeBtn.addEventListener('click', () => {
            activityGroup.remove();
            atualizarPontuacaoTotal();
        });

        buttonGroup.appendChild(removeBtn);

        // Append inputGroup e buttonGroup ao activityGroup
        activityGroup.appendChild(inputGroup);
        activityGroup.appendChild(buttonGroup);

        // Append activityGroup ao activitiesContainer
        activitiesContainer.appendChild(activityGroup);

        atualizarPontuacaoTotal();
    }

    // Atualizar pontuação total
    function atualizarPontuacaoTotal() {
        const activityGroups = document.querySelectorAll('.activity-group');
        let totalPontuacao = 0;

        activityGroups.forEach(group => {
            const select = group.querySelector('.atividadeDropdown');
            const input = group.querySelector('.pontuacaoRealizada');
            const pontuacaoRealizada = parseFloat(input.value.replace(',', '.')) || 0;

            const atividade = atividadesData.find(a => a.dataValue === select.value);
            if (atividade) {
                totalPontuacao += pontuacaoRealizada * atividade.pontuacao;
            }
        });

        totalPontuacaoEl.textContent = formatNumber.format(totalPontuacao);
    }

    // Gerar JSON
    function gerarJSON() {
        const activityGroups = document.querySelectorAll('.activity-group');
        const atividadesArray = [];

        for (const group of activityGroups) {
            const select = group.querySelector('.atividadeDropdown');
            const input = group.querySelector('.pontuacaoRealizada');
            const pontuacaoRealizada = input.value.trim();

            if (!pontuacaoRealizada) {
                alert('Por favor, insira a pontuação realizada em todas as atividades.');
                input.focus();
                return;
            }

            const pontuacaoNumerica = parseFloat(pontuacaoRealizada.replace(',', '.'));
            if (isNaN(pontuacaoNumerica)) {
                alert('Por favor, insira uma pontuação válida.');
                input.focus();
                return;
            }

            const atividade = atividadesData.find(a => a.dataValue === select.value);
            if (atividade) {
                atividadesArray.push({
                    nome: atividade.nome,
                    pontuacao: formatNumber.format(pontuacaoNumerica),
                    descricao: atividade.descricao,
                    "data-value": atividade.dataValue
                });
            }
        }

        resultadoJSON = { atividades: atividadesArray };
        jsonOutput.style.display = 'block';
        jsonOutput.textContent = JSON.stringify(resultadoJSON, null, 4);
        salvarJsonBtn.style.display = 'block';
    }

    // Salvar JSON como arquivo
    function salvarArquivoJSON() {
        const blob = new Blob([JSON.stringify(resultadoJSON, null, 4)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "atividades.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // Carregar JSON do arquivo
    function carregarArquivoJSON(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const json = JSON.parse(e.target.result);
                    if (!json.atividades) throw new Error('Formato JSON inválido.');

                    activitiesContainer.innerHTML = ''; // Limpa o container
                    json.atividades.forEach(atividade => {
                        adicionarNovaAtividade(atividade["data-value"], atividade.pontuacao);
                    });

                    atualizarPontuacaoTotal();
                } catch (error) {
                    console.error(error);
                    alert('Erro ao carregar JSON. Verifique o formato do arquivo.');
                }
            };
            reader.readAsText(file);
        }
    }

    // Inicializar
    async function init() {
        await carregarAtividadesXML();
        adicionarNovaAtividade(); // Adiciona o primeiro grupo de atividade

        // Eventos
        addActivityBtn.addEventListener('click', () => adicionarNovaAtividade());
        gerarJsonBtn.addEventListener('click', gerarJSON);
        salvarJsonBtn.addEventListener('click', salvarArquivoJSON);
        carregarJsonBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', carregarArquivoJSON);
    }

    init();
});