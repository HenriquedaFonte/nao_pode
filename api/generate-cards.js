const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { themeLabels, exclude, count } = req.body || {};

  const system = `Você cria cartas para um jogo de tabuleiro tipo "Taboo" em português do Brasil.
Cada carta tem: uma palavra-alvo (curta, conhecida, sem ser um nome próprio muito obscuro) e exatamente 5 palavras proibidas fortemente associadas a ela.
Gere cartas dos temas: ${themeLabels}.
Misture dificuldades fácil, média e difícil.
NÃO repita nenhuma destas palavras já usadas: ${exclude || '(nenhuma ainda)'}.
Responda SOMENTE com um array JSON válido, sem markdown, sem texto extra, no formato:
[{"palavra":"EXEMPLO","proibidas":["a","b","c","d","e"],"categoria":"Geral","dificuldade":"facil"}]`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: `Gere ${count} cartas novas agora.` }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    res.status(200).json({ text });
  } catch (err) {
    console.error("Erro ao chamar Claude:", err);
    res.status(502).json({ error: "Falha ao gerar cartas" });
  }
};
