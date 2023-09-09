# Projeto de Mercado Online

Este é um projeto de mercado online que consiste em duas partes: a parte do servidor (backend) e a parte do cliente (frontend). Siga as instruções abaixo para configurar e executar o projeto em seu ambiente local.

## Configuração


## Clonando o repositório com HTTPS

1. Abra o terminal ou prompt de comando.

2. Navegue até a pasta onde deseja clonar o repositório.

3. Execute o seguinte comando para clonar o repositório:

```shell
git clone https://github.com/JPedroValarini/market.git
```

### Clonando com SSH

1. Abra o terminal ou prompt de comando.

2. Navegue até a pasta onde deseja clonar o repositório.

3. Execute o seguinte comando para clonar o repositório usando SSH:

```shell
git clone git@github.com:JPedroValarini/market.git
```


### Backend

1. Navegue até a pasta `market`e instale as dependências.

```bash
cd market
npm install
```

### Frontend
2. Navegue até a pasta `front` e instale as dependências.

```bash
cd front
npm install
```

3. Após instalar as dependências você deve executar o servidor em ambas as patas.

```bash
cd market
npm start
local 3001
http://localhost:3001/
```

```bash
cd front
npm start
http://localhost:3000/
```

## Processamento de Arquivos CSV

Ao acessar o frontend em [http://localhost:3000/](http://localhost:3000/), você poderá realizar o processamento de arquivos CSV com os seguintes passos:

1. Escolha um arquivo CSV no formato especificado no teste.

2. Clique no botão "Processar" para iniciar o processo de atualização dos preços dos produtos.


##