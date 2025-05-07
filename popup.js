
const comandos = [
  {
    "setor": "Estoque",
    "descricao": "Zerar quantidade bloqueada em estoque",
    "palavrasChave": ["zerar", "quantidade", "bloqueada", "estoque", "liberar"],
    "sql": "update mk_estoque_atual_setor set estoque_bloq_saida='0' where estoque_bloq_saida<>'0';",
    "parametros": []
  },

  {
    "setor": "Estoque",
    "descricao": "Ajustar tipo de retirada desconhecido",
    "palavrasChave": ["ajustar", "tipo", "retirada", "desconhecido", "ajuste"],
    "sql": "update mk_estoque_retiradas set tipo_retirada = :tipo_retirada  where codestretirada in :codestretirada;",
    "parametros": [
      {
        "nome": "Tipo de retirada (1- Baixa 2- Manutencao 3- Troca 4- Cancelamento)", 
        "tipo": "number",
        "min": 1,
        "max": 4
      },
      {
        "nome": "codestretirada", "validacao": "numerosLista"
      }
    
    ]
  },


  {
    "setor": "Workspace",
    "descricao": "Reativar workspace de usuário",
    "palavrasChave": [
      "reativar",
      "workspace",
      "usuario",
      "liberar"
    ],
    "sql": "UPDATE workspace_usuario SET ativo = 1 WHERE codusuario = :codusuario",
    "parametros": [
      {
        "nome": "codusuario",
        "tipo": "number",
        "min": 1
      }
    ]
  },
  
  {
    "setor": "Integradores",
    "descricao": "Remover lead duplicado do Watch",
    "palavrasChave": [
      "remover",
      "lead",
      "duplicado",
      "watch"
    ],
    "sql": "DELETE FROM integrador_watch_leads WHERE codlead = :codlead",
    "parametros": [
      {
        "nome": "codlead",
        "tipo": "number",
        "min": 1
      }
    ]
  },
  {
    "setor": "CRM",
    "descricao": "Corrigir nome de cliente",
    "palavrasChave": [
      "corrigir",
      "nome",
      "cliente",
      "crm"
    ],
    "sql": "UPDATE crm_clientes SET nome = :nome WHERE codcliente = :codcliente",
    "parametros": [
      {
        "nome": "nome",
        "tipo": "text",
        "maxLength": 80
      },
      {
        "nome": "codcliente",
        "tipo": "number",
        "min": 1
      }
    ]
  }
];

function criarBotaoComando(comando) {
  const div = document.createElement('div');
  div.className = "comando-item";
  div.innerHTML = `<strong>${comando.descricao}</strong><br><code>${comando.sql}</code>`;
  div.onclick = () => gerarFormulario(comando);
  return div;
}

function gerarFormulario(comando) {
  const formulario = document.getElementById('formulario');
  const resultado = document.getElementById('resultado');
  formulario.innerHTML = "";
  resultado.value = "";

  comando.parametros.forEach(param => {
    const input = document.createElement('input');
    input.placeholder = param.nome;
    input.id = param.nome;
    input.type = param.tipo || "text";
    if (param.min !== undefined) input.min = param.min;
    if (param.max !== undefined) input.max = param.max;
    if (param.maxLength !== undefined) input.maxLength = param.maxLength;
    if (param.pattern !== undefined) input.pattern = param.pattern;
    formulario.appendChild(input);
  });

  const btn = document.createElement('button');
  btn.innerText = "Gerar SQL";
  btn.onclick = () => {
    let sql = comando.sql;
    comando.parametros.forEach(param => {
      const valor = document.getElementById(param.nome).value.trim();

      if (param.validacao === "numerosLista") {
        const lista = valor.split(",").map(s => s.trim()).filter(s => /^\d+$/.test(s));
        sql = sql.replace(`:${param.nome}`, `(${lista.join(",")})`);
      } else {
        sql = sql.replace(`:${param.nome}`, `'${valor}'`);
      }
    });
    resultado.value = sql;
  };
  formulario.appendChild(btn);
}

document.getElementById('buscarBtn').addEventListener('click', () => {
  const entrada = document.getElementById('erroInput').value.toLowerCase();
  const setorSelecionado = document.getElementById('filtroSetor').value;

  const resultados = comandos.filter(cmd =>
    cmd.palavrasChave.some(p => entrada.includes(p)) &&
    (setorSelecionado === "" || cmd.setor === setorSelecionado)
  );

  const resultado = document.getElementById('resultado');
  const formulario = document.getElementById('formulario');
  resultado.value = "";
  formulario.innerHTML = "";

  if (resultados.length === 0) {
    resultado.value = "Nenhum comando encontrado.";
    return;
  }

  resultados.forEach(cmd => formulario.appendChild(criarBotaoComando(cmd)));
});

document.getElementById('copiarBtn').addEventListener('click', () => {
  const texto = document.getElementById('resultado').value;
  navigator.clipboard.writeText(texto).then(() => alert("SQL copiado!"));
});