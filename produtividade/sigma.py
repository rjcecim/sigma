import time
import json
import getpass  # Leitura segura da senha.
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def carregar_atividades(json_file='atividades.json'):
    """
    Carrega as atividades a partir de um arquivo JSON.
    O arquivo deve conter um dicionário com a chave 'atividades' e uma lista de atividades.
    """
    with open(json_file, 'r', encoding='utf-8') as file:
        atividades = json.load(file)
    return atividades['atividades']

def selecionar_atividade_por_data_value(driver, data_value, campo_id):
    """
    Seleciona a atividade no formulário via JavaScript, utilizando o data-value.
    """
    try:
        driver.execute_script(f"""
            var selectize = $('#{campo_id}')[0].selectize;
            selectize.setValue({data_value});
        """)
        print(f"Atividade com data-value '{data_value}' selecionada.")
        return True
    except Exception as e:
        print(f"Erro ao selecionar a atividade com data-value '{data_value}': {e}")
        return False

def preencher_atividades(driver, atividades, inicio):
    """
    Preenche três atividades no formulário, a partir do índice 'inicio' da lista de atividades.
    """
    for i in range(3):
        if inicio + i >= len(atividades):
            break
        
        atividade = atividades[inicio + i]
        atividade_index = i + 1  # Os IDs dos campos começam em 1
        
        if not selecionar_atividade_por_data_value(
            driver,
            atividade['data-value'],
            f"Conteudo_BaseMaster_ColunaMeio_InternoMaster_ddlAtividade{atividade_index}"
        ):
            print(f"Falha ao selecionar a Atividade {atividade_index}")
        
        # Preenche o campo de pontuação
        quantidade_field = driver.find_element(
            By.ID, f"Conteudo_BaseMaster_ColunaMeio_InternoMaster_txtQuantidade{atividade_index}"
        )
        quantidade_field.clear()
        quantidade_field.send_keys(atividade['pontuacao'])
        
        # Preenche o campo de observação/descrição
        observacao_field = driver.find_element(
            By.ID, f"Conteudo_BaseMaster_ColunaMeio_InternoMaster_txtObservacao{atividade_index}"
        )
        observacao_field.clear()
        observacao_field.send_keys(atividade['descricao'])

def salvar_atividades(driver):
    """
    Aciona o botão de salvar atividades por meio de JavaScript.
    """
    try:
        driver.execute_script("document.getElementById('Conteudo_BaseMaster_ColunaMeio_InternoMaster_btnAdicionar').click();")
        print("Atividades salvas com sucesso.")
        # Aguarda alguns segundos para que o salvamento seja concluído
        time.sleep(3)
    except Exception as e:
        print(f"Erro ao tentar salvar atividades: {e}")

def main():
    # Solicita as credenciais do usuário
    matricula_usuario = input("Digite sua matrícula: ")
    senha_usuario = getpass.getpass("Digite sua senha: ")

    # Configurações do navegador Chrome
    options = Options()
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) "
                         "Chrome/92.0.4515.159 Safari/537.36")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    # *** Melhoria: Abrir o navegador maximizado ***
    options.add_argument("--start-maximized")

    service = Service("C:\\chromedriver-win64\\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)

    # Remove a propriedade 'webdriver' para evitar detecção de automação.
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    try:
        # Acessa a página de login
        driver.get("https://projetos.tce.pa/portalsistemas/")
        
        # Aguarda o carregamento do campo de matrícula
        matricula = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located(
                (By.NAME, "ctl00$ctl00$Conteudo_BaseMaster$ConteudoPrePagina_SimplesMaster$txtMatricula")
            )
        )
        senha = driver.find_element(By.NAME, "ctl00$ctl00$Conteudo_BaseMaster$ConteudoPrePagina_SimplesMaster$txtSenha")
        
        # Insere as credenciais de login
        matricula.send_keys(matricula_usuario)
        senha.send_keys(senha_usuario)
        
        # Clica no botão de "Entrar" utilizando JavaScript
        driver.execute_script("document.getElementById('Conteudo_BaseMaster_ConteudoPrePagina_SimplesMaster_btnEntrar').click();")
        
        # Acessa a funcionalidade "Registro de atividades desempenhadas" via JavaScript
        driver.execute_script(
            'WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("ctl00$ctl00$Conteudo_BaseMaster$ColunaMeioConteudo_InternoMaster$rptSistemasInstituicao$ctl09$btnAcessar", "", false, "", "https://projetos.tce.pa/produtividade/principal", false, true))'
        )
        
        # Aguarda e clica no link "Registro de atividades desempenhadas"
        WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.LINK_TEXT, "Registro de atividades desempenhadas"))
        ).click()
        
        # Aguarda o carregamento dos elementos de seleção de mês
        meses = WebDriverWait(driver, 30).until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, "input[name='ctl00$ctl00$Conteudo_BaseMaster$ColunaMeio_InternoMaster$rblSubcicloAvaliativo']")
            )
        )
        if meses:
            meses[0].click()  # Seleciona o primeiro mês
            print("Primeiro mês selecionado com sucesso.")
        else:
            print("Nenhum mês disponível para seleção.")
        
        # Aguarda a página atualizar após a seleção do mês
        time.sleep(2)
        
        # Carrega as atividades a partir do arquivo JSON
        atividades = carregar_atividades()
        total_atividades = len(atividades)
        
        # Processa as atividades em lotes de 3
        for i in range(0, total_atividades, 3):
            preencher_atividades(driver, atividades, i)
            salvar_atividades(driver)
    
    except Exception as e:
        print(f"Ocorreu um erro: {e}")
    finally:
        input("Pressione Enter para fechar o navegador...")
        driver.quit()

if __name__ == "__main__":
    main()
