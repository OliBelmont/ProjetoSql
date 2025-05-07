const comandos = [
  {
    setor: "Estoque",
    descricao: "Zerar quantidade bloqueada em estoque",
    palavrasChave: ["zerar", "quantidade", "bloqueada", "estoque", "liberar"],
    sql: "update mk_estoque_atual_setor set estoque_bloq_saida='0' where estoque_bloq_saida<>'0';",
    parametros: []
  },
  {
    setor: "Estoque",
    descricao: "Ajustar tipo de retirada desconhecido",
    palavrasChave: ["ajustar", "tipo", "retirada", "desconhecido", "ajuste"],
    sql: "update mk_estoque_retiradas set tipo_retirada = :tipo_retirada  where codestretirada in :codestretirada;",
    parametros: [
      {
        nome: "tipo_retirada",
        tipo: "number",
        min: 1,
        max: 4,
        comentario: "1- Baixa 2- Manutencao 3- Troca 4- Cancelamento"
      },
      {
        nome: "codestretirada",
        validacao: "numerosLista",
        comentario: "Digite os códigos separados por vírgula. Ex: 123, 456, 789"
      }
    ]
  },
  {
    setor: "Workspace",
    descricao: "Reativar workspace de usuário",
    palavrasChave: ["quantidade", "workspace", "usuario", "liberar"],
    sql: "UPDATE workspace_usuario SET ativo = 1 WHERE codusuario = :codusuario",
    parametros: [
      {
        nome: "codusuario",
        tipo: "number",
        min: 1,
        comentario: "Código do usuário para reativação do workspace."
      }
    ]
  },
  {
    setor: "Integradores",
    descricao: "Remover lead duplicado do Watch",
    palavrasChave: ["remover", "lead", "duplicado", "watch"],
    sql: "DELETE FROM integrador_watch_leads WHERE codlead = :codlead",
    parametros: [
      {
        nome: "codlead",
        tipo: "number",
        min: 1,
        comentario: "Código do lead duplicado a ser removido."
      }
    ]
  },
  {
    setor: "CRM",
    descricao: "Corrigir nome de cliente",
    palavrasChave: ["corrigir", "nome", "cliente", "crm"],
    sql: "UPDATE crm_clientes SET nome = :nome WHERE codcliente = :codcliente",
    parametros: [
      {
        nome: "nome",
        tipo: "text",
        maxLength: 80,
        comentario: "Nome correto do cliente para atualização."
      },
      {
        nome: "codcliente",
        tipo: "number",
        min: 1,
        comentario: "Código do cliente no CRM."
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
    const inputId = param.nome.replace(/[^a-zA-Z0-9_]/g, "_");
    param._inputId = inputId;

    const container = document.createElement('div');
    container.style.marginBottom = "14px";

    const input = document.createElement('input');
    input.placeholder = param.nome;
    input.id = inputId;
    input.type = param.tipo || "text";
    if (param.min !== undefined) input.min = param.min;
    if (param.max !== undefined) input.max = param.max;
    if (param.maxLength !== undefined) input.maxLength = param.maxLength;

    container.appendChild(input);

    if (param.comentario) {
      const help = document.createElement('small');
      help.innerText = param.comentario;
      help.style.display = "block";
      help.style.marginTop = "4px";
      help.style.color = "#666";
      help.style.fontSize = "12px";
      container.appendChild(help);
    }

    formulario.appendChild(container);
  });

  const btn = document.createElement('button');
  btn.innerText = "Gerar SQL";
  btn.onclick = () => {
    let sql = comando.sql;
    let valido = true;

    comando.parametros.forEach(param => {
      const input = document.getElementById(param._inputId);
      const valor = input.value.trim();
      input.classList.remove("erro");

      let valorFormatado;

      if (param.tipo === "number") {
        const num = Number(valor);
        if (
          isNaN(num) ||
          (param.min !== undefined && num < param.min) ||
          (param.max !== undefined && num > param.max)
        ) {
          valido = false;
          input.classList.add("erro");
          return;
        }
        valorFormatado = valor;
      }

      if (param.validacao === "numerosLista") {
        const lista = valor.split(",").map(s => s.trim());
        if (!lista.every(s => /^\d+$/.test(s))) {
          valido = false;
          input.classList.add("erro");
          return;
        }
        valorFormatado = `(${lista.join(",")})`;
      }

      if (!valorFormatado) {
        valorFormatado = `'${valor}'`;
      }

      sql = sql.replaceAll(`:${param.nome}`, valorFormatado);
    });

    if (!valido) {
      alert("Verifique os campos destacados. Alguns valores estão fora do padrão.");
      return;
    }

    resultado.value = sql;
  };

  formulario.appendChild(btn);
}

document.getElementById('buscarBtn').addEventListener('click', () => {
  const entrada = document.getElementById('erroInput').value.toLowerCase().trim();
  const setorSelecionado = document.getElementById('filtroSetor').value;

  let resultados;

  if (entrada && setorSelecionado === "") {
    resultados = comandos.filter(cmd =>
      entrada.split(" ").every(palavra =>
        cmd.palavrasChave.some(tag => tag.includes(palavra))
      )
    );
  } else if (!entrada && setorSelecionado === "") {
    resultados = comandos.filter(cmd =>
      cmd.sql.toLowerCase().includes("update")
    );
  } else if (!entrada && setorSelecionado !== "") {
    resultados = comandos.filter(cmd => cmd.setor === setorSelecionado);
  } else {
    resultados = comandos.filter(cmd =>
      cmd.setor === setorSelecionado &&
      entrada.split(" ").every(palavra =>
        cmd.palavrasChave.some(tag => tag.includes(palavra))
      )
    );
  }

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

document.getElementById('limparBtn').addEventListener('click', () => {
  document.getElementById('erroInput').value = "";
  document.getElementById('filtroSetor').value = "";
  document.getElementById('resultado').value = "";
  document.getElementById('formulario').innerHTML = "";
});
