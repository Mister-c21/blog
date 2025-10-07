// quotesService.js

// URL para o arquivo JSON "raw" (bruto) no GitHub
// **ATENÇÃO:** Substitua esta URL pela URL do seu arquivo quotes.json no GitHub.
const GITHUB_QUOTES_DATA_URL = 'https://raw.githubusercontent.com/Mister-c21/Dados/refs/heads/main/Quotes.json';

// Variável para armazenar os dados das citações após o carregamento
let quotesData = null;

/**
 * Carrega os dados das citações do GitHub (ou outra API).
 * Implementa o padrão Singleton: os dados são carregados apenas na primeira chamada.
 * @returns {Promise<Array>} Uma promessa que resolve para a lista de citações.
 */
const loadQuotesData = async () => {
    if (quotesData) {
        // Se já carregado, retorna imediatamente
        return quotesData;
    }

    try {
        console.log('Buscando dados das citações do GitHub...');
        const response = await fetch(GITHUB_QUOTES_DATA_URL);

        if (!response.ok) {
            // Lança um erro se a resposta HTTP não for bem-sucedida (status 404, 500, etc.)
            throw new Error(`Erro ao carregar os dados das citações: ${response.statusText}`);
        }

        // Armazena os dados carregados para futuras chamadas
        quotesData = await response.json();
        console.log('Citações carregadas com sucesso.');
        return quotesData;

    } catch (error) {
        console.error('Falha ao carregar o banco de dados de citações:', error);
        // Em caso de falha, retorna um array vazio
        return []; 
    }
};


/**
 * Busca citações com base em uma query e no idioma desejado.
 * Primeiro, garante que os dados foram carregados.
 * @param {string} query O termo de busca.
 * @param {string} language O idioma desejado ('en', 'es', 'pt-br').
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de citações filtradas.
 */
export async function searchQuotes(query, language = 'pt-br') {
    // 1. Garante que os dados foram carregados de forma assíncrona
    const data = await loadQuotesData();

    if (!data || data.length === 0) {
        return [];
    }

    // 2. Realiza a busca nos dados carregados
    const normalizedQuery = query.toLowerCase();

    // Filtra as citações que contêm a query no texto de qualquer idioma, no autor ou nas tags
    const filteredQuotes = data.filter(quote =>
        // Busca em todos os textos (pt-br, en, es)
        Object.values(quote.text || {}).some(t => t.toLowerCase().includes(normalizedQuery)) ||
        // Busca em todos os autores (pt-br, en, es)
        Object.values(quote.author || {}).some(a => a.toLowerCase().includes(normalizedQuery)) ||
        // Busca nas tags
        (quote.tags && quote.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
    );

    // Adiciona um tipo para que o script.js saiba como renderizar
    return filteredQuotes.map(quote => ({ ...quote, type: 'quote' }));
}
