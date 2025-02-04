import time
import json
import getpass  # Importa getpass para leitura segura da senha
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Função para solicitar as credenciais do usuário via terminal
def solicitar_credenciais():
    """
    Solicita as credenciais do usuário (matrícula e senha) via terminal.
    Retorna:
        matricula_usuario (str): Matrícula inserida.
        senha_usuario (str): Senha inserida (oculta no terminal).
    """
    matricula_usuario = input("Digite sua matrícula: ")
    senha_usuario = getpass.getpass("Digite sua senha: ")
    return matricula_usuario, senha_usuario

# Função para capturar atividades em um dropdown identificado por 'dropdown_id'
def capturar_atividades_dropdown(dropdown_id):
    """
    Captura as atividades listadas em um dropdown e retorna uma lista com os detalhes de cada atividade.
    Parâmetros:
        dropdown_id (str): ID do elemento dropdown na página.
    Retorna:
        atividades_encontradas (list): Lista de dicionários contendo os dados das atividades.
    """
    try:
        # Aguarda a presença do dropdown na página
        dropdown = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.ID, dropdown_id))
        )
        # Executa um clique no dropdown para exibir as opções
        driver.execute_script("arguments[0].click();", dropdown)
        time.sleep(2)

        # Coleta todas as atividades dentro do dropdown
        atividades = driver.find_elements(By.CSS_SELECTOR, ".selectize-dropdown-content div")
        atividades_encontradas = []  # Lista para armazenar as atividades processadas
        
        # Processa cada atividade capturada
        for atividade in atividades:
            nome_completo = atividade.text.strip()  # Texto completo da atividade
            data_value = atividade.get_attribute('data-value')  # Atributo 'data-value'
            
            if data_value and nome_completo:
                try:
                    # Processa o nome da atividade e a pontuação
                    nome, restante = nome_completo.split('):')
                    nome = nome + ")"  # Reconstrói o nome completo
                    descricao = restante.strip()  # Descrição da atividade
                    pontuacao = nome.split("(")[-1].replace("ponto(s)", "").strip()  # Extrai a pontuação
                    
                    atividade_info = {
                        "nome": nome.strip(),
                        "pontuacao": pontuacao,
                        "descricao": descricao,
                        "data-value": data_value.strip()
                    }
                    atividades_encontradas.append(atividade_info)
                    print(f"Atividade encontrada: {atividade_info}")
                except Exception as e:
                    print(f"Erro ao processar a atividade '{nome_completo}': {e}")
        
        return atividades_encontradas
    except Exception as e:
        print(f"Erro ao capturar as atividades: {e}")
        return []

# Função para salvar as atividades encontradas em um arquivo 'atividades.txt'
def salvar_atividades_em_txt(atividades):
    """
    Salva a lista de atividades processadas em um arquivo de texto.
    Parâmetros:
        atividades (list): Lista de atividades a serem salvas.
    """
    nome_arquivo = 'atividades.txt'
    try:
        with open(nome_arquivo, 'w', encoding='utf-8') as f:
            for atividade in atividades:
                f.write(f"{json.dumps(atividade, ensure_ascii=False)}\n")
        print(f"Arquivo '{nome_arquivo}' gerado com sucesso.")
    except Exception as e:
        print(f"Erro ao salvar o arquivo: {e}")

# Função para selecionar o primeiro mês da lista de meses de avaliação
def selecionar_primeiro_mes():
    """
    Seleciona o primeiro mês disponível na lista de meses exibidos na página.
    """
    try:
        meses = WebDriverWait(driver, 30).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "input[name='ctl00$ctl00$Conteudo_BaseMaster$ColunaMeio_InternoMaster$rblSubcicloAvaliativo']"))
        )
        if meses:
            meses[0].click()
            print("Primeiro mês selecionado com sucesso.")
        else:
            print("Nenhum mês disponível para seleção.")
        time.sleep(2)
    except Exception as e:
        print(f"Erro ao selecionar o primeiro mês: {e}")

# Função principal que executa o fluxo do programa
def main():
    """
    Coordena a execução do programa: solicita credenciais, configura o navegador, navega pelo sistema,
    captura atividades e as salva em um arquivo.
    """
    # Solicita credenciais do usuário
    matricula_usuario, senha_usuario = solicitar_credenciais()

    # Configurações do navegador (ChromeDriver)
    options = Options()
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    # Abre o navegador maximizado
    options.add_argument("--start-maximized")
    
    # Define o caminho para o ChromeDriver
    service = Service("C:\\chromedriver-win64\\chromedriver.exe")
    global driver  # Torna 'driver' global para uso em outras funções
    driver = webdriver.Chrome(service=service, options=options)
    
    # Redefine a propriedade 'webdriver' para evitar detecção
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    try:
        # Acessa a página de login do sistema
        driver.get("https://projetos.tce.pa/portalsistemas/")
        time.sleep(3)

        # Preenche os campos de matrícula e senha
        matricula = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.NAME, "ctl00$ctl00$Conteudo_BaseMaster$ConteudoPrePagina_SimplesMaster$txtMatricula"))
        )
        senha = driver.find_element(By.NAME, "ctl00$ctl00$Conteudo_BaseMaster$ConteudoPrePagina_SimplesMaster$txtSenha")
        matricula.send_keys(matricula_usuario)
        senha.send_keys(senha_usuario)
        time.sleep(1)

        # Clica no botão "Entrar" para autenticação
        entrar = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.ID, "Conteudo_BaseMaster_ConteudoPrePagina_SimplesMaster_btnEntrar"))
        )
        entrar.click()
        time.sleep(3)

        # Navega para a página de registro de atividades
        driver.execute_script('WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$ctl00$Conteudo_BaseMaster$ColunaMeioConteudo_InternoMaster$rptSistemasInstituicao$ctl09$btnAcessar", "", false, "", "https://projetos.tce.pa/produtividade/principal", false, true))')
        time.sleep(3)

        # Clica no botão "Registro de atividades desempenhadas"
        registro_button = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.LINK_TEXT, "Registro de atividades desempenhadas"))
        )
        registro_button.click()
        time.sleep(3)

        # Seleciona o primeiro mês disponível
        selecionar_primeiro_mes()

        # Captura as atividades a partir do primeiro dropdown (já contém todas as informações necessárias)
        atividades = capturar_atividades_dropdown("Conteudo_BaseMaster_ColunaMeio_InternoMaster_ddlAtividade1-selectized")
        
        # Salva as atividades capturadas em um arquivo
        salvar_atividades_em_txt(atividades)

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
    finally:
        input("Pressione Enter para fechar o navegador...")
        driver.quit()

# Executa a função principal
if __name__ == "__main__":
    main()
