# API de Geração de Conteúdo com IA - Especificação

## Endpoint
```
POST https://geral-n8n.yzqq8i.easypanel.host/webhook/syllab
```

## Request

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "token": "string (obrigatório)",
  "prompt": "string (obrigatório)"
}
```

**Exemplo:**
```json
{
  "token": "sua-chave-api-aqui",
  "prompt": "Crie um conteúdo explicando os princípios de segurança da informação, incluindo confidencialidade, integridade e disponibilidade. Use exemplos práticos e liste 5 boas práticas."
}
```

## Response

### ✅ Formato Recomendado: HTML

O sistema aceita **HTML formatado** como retorno, que será inserido diretamente no editor Quill. 

**Vantagens:**
- Renderização imediata no WYSIWYG
- Formatação rica (negrito, listas, cores, etc.)
- Compatível com todo o sistema de slides
- Melhor experiência para o usuário

### Opções de Formato de Resposta

O sistema é flexível e aceita múltiplos formatos:

#### Opção 1: Resposta OpenAI (array)
```json
[
  {
    "choices": [
      {
        "message": {
          "content": "<h2>Segurança da Informação</h2><p>..."
        }
      }
    ]
  }
]
```

#### Opção 2: Resposta OpenAI (objeto)
```json
{
  "choices": [
    {
      "message": {
        "content": "<h2>Segurança da Informação</h2><p>..."
      }
    }
  ]
}
```

#### Opção 3: HTML direto (string)
```json
"<h2>Segurança da Informação</h2><p>A segurança da informação baseia-se em três pilares fundamentais...</p><ul><li><strong>Confidencialidade</strong>: ...</li><li><strong>Integridade</strong>: ...</li></ul>"
```

#### Opção 4: Objeto com campo `html`
```json
{
  "html": "<h2>Segurança da Informação</h2><p>..."
}
```

#### Opção 5: Objeto com campo `content`
```json
{
  "content": "<h2>Segurança da Informação</h2><p>..."
}
```

#### Opção 6: Objeto com campo `resultado`
```json
{
  "resultado": "<h2>Segurança da Informação</h2><p>..."
}
```

### Tags HTML Recomendadas

Para melhor formatação no editor, use estas tags:

```html
<!-- Títulos -->
<h1>Título Principal</h1>
<h2>Subtítulo</h2>
<h3>Seção</h3>

<!-- Parágrafos -->
<p>Texto normal do conteúdo...</p>

<!-- Formatação inline -->
<strong>Negrito</strong>
<em>Itálico</em>
<u>Sublinhado</u>

<!-- Listas -->
<ul>
  <li>Item não ordenado</li>
  <li>Outro item</li>
</ul>

<ol>
  <li>Item numerado</li>
  <li>Segundo item</li>
</ol>

<!-- Citações -->
<blockquote>Citação importante</blockquote>

<!-- Código -->
<code>código inline</code>
<pre><code>bloco de código</code></pre>

<!-- Links -->
<a href="https://exemplo.com">Link para recurso</a>

<!-- Cores -->
<span style="color: #2563eb;">Texto azul</span>
<span style="background-color: #fef3c7;">Texto destacado</span>

<!-- Alinhamento -->
<p style="text-align: center;">Texto centralizado</p>
<p style="text-align: right;">Texto à direita</p>
```

## Exemplo Completo de Response

### Request:
```json
{
  "token": "abc123xyz",
  "prompt": "Crie um conteúdo sobre tipos de malware com 3 exemplos"
}
```

### Response Ideal:
```json
{
  "html": "<h2>Tipos de Malware</h2><p>Malware é um termo geral para software malicioso projetado para infiltrar, danificar ou desabilitar computadores e sistemas de computador.</p><h3>Principais Tipos:</h3><ol><li><strong>Vírus</strong><p>Programas que se anexam a arquivos legítimos e se replicam quando executados. Exemplo: vírus de macro em documentos Office.</p></li><li><strong>Ransomware</strong><p>Criptografa arquivos do usuário e exige pagamento para liberar o acesso. Exemplo: WannaCry, que afetou milhares de organizações globalmente.</p></li><li><strong>Trojan</strong><p>Disfarça-se como software legítimo mas executa ações maliciosas. Exemplo: trojans bancários que roubam credenciais financeiras.</p></li></ol><blockquote>Mantenha sempre seu antivírus atualizado e faça backups regulares!</blockquote>"
}
```

### O que o Sistema Faz:

1. **Recebe a resposta** do webhook
2. **Extrai o HTML** (tenta campos: string, html, content, resultado)
3. **Insere no editor** Quill que renderiza o HTML formatado
4. **Mostra feedback** de sucesso para o usuário
5. **Fecha o modal** automaticamente após 1.5s

## Tratamento de Erros

### Erros HTTP
```json
{
  "error": "Mensagem de erro descritiva"
}
```

**Status codes esperados:**
- `200`: Sucesso
- `400`: Request inválido
- `401`: Token inválido
- `500`: Erro interno do servidor

### Timeout
O sistema aguarda até 30 segundos por uma resposta. Após isso, exibe erro de timeout.

## Boas Práticas para o N8N

1. **Validar o token** antes de processar
2. **Limitar o tamanho** da resposta (máx 50KB de HTML)
3. **Sanitizar HTML** para evitar scripts maliciosos
4. **Incluir timeout** nas chamadas à IA (OpenAI, etc.)
5. **Log de requests** para debugging
6. **Rate limiting** por token

## Fluxo Recomendado no N8N

```
1. Webhook recebe POST
2. Valida token
3. Extrai prompt
4. Chama API de IA (OpenAI, Claude, etc.)
5. Formata resposta em HTML
6. Retorna JSON com campo "html"
```

## Exemplo de Prompt Efetivo

Para melhores resultados, instrua a IA a:
- Usar tags HTML semânticas
- Incluir formatação (negrito para termos-chave)
- Criar listas quando apropriado
- Adicionar exemplos práticos
- Manter parágrafos curtos e objetivos

**Exemplo de prompt interno no N8N:**
```
Você é um assistente educacional. Gere conteúdo didático em HTML sobre o tópico solicitado.
Use as seguintes diretrizes:
- Use <h2> para o título principal
- Use <h3> para subtítulos
- Use <strong> para termos importantes
- Use <ul> ou <ol> para listas
- Use <p> para parágrafos
- Inclua exemplos práticos
- Mantenha linguagem clara e objetiva

Tópico solicitado: {prompt do usuário}
```

## Segurança

⚠️ **Importante:**
- Nunca expor tokens de API no frontend
- Validar e sanitizar todo HTML retornado
- Implementar rate limiting
- Usar HTTPS em todas as comunicações
- Não retornar dados sensíveis nos erros

## Melhorias Futuras

- [ ] Permitir escolher tom/estilo do conteúdo
- [ ] Gerar imagens com IA e incluir no HTML
- [ ] Histórico de gerações
- [ ] Templates pré-definidos por tipo de aula
- [ ] Sugestões de melhorias no conteúdo existente
- [ ] Tradução automática
- [ ] Adaptação para diferentes níveis de ensino
