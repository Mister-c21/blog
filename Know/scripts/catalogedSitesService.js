// scripts/catalogedSitesService.js

// URL para o arquivo JSON "raw" (bruto) no GitHub
// **ATENÇÃO:** Você deve substituir esta URL pela URL do seu arquivo JSON no GitHub.
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/Mister-c21/Dados/refs/heads/main/Sites.json';

// Variável para armazenar os dados após o carregamento
let catalogedSitesData = null;

/**
 * Carrega os dados catalogados do GitHub (ou outra URL de API).
 * Implementa o padrão Singleton: os dados são carregados apenas na primeira chamada.
 * @returns {Promise<Array>} Uma promessa que resolve para a lista de sites catalogados.
 */
const loadCatalogedSitesData = async () => {
    if (catalogedSitesData) {
        // Se já carregado, retorna imediatamente
        return catalogedSitesData;
    }

    try {
        console.log('Buscando dados do GitHub...');
        const response = await fetch(GITHUB_DATA_URL);

        if (!response.ok) {
            throw new Error(`Erro ao carregar os dados: ${response.statusText}`);
        }

        // Armazena os dados carregados para futuras chamadas
        catalogedSitesData = await response.json();
        console.log('Dados carregados com sucesso.');
        return catalogedSitesData;

    } catch (error) {
        console.error('Falha ao carregar os sites catalogados:', error);
        // Em caso de falha, retorna um array vazio ou lança um erro, dependendo do que for preferível
        return []; 
    }
};

/**
 * Busca na lista de sites catalogados (agora carregada de forma assíncrona).
 * @param {string} query - O termo de busca.
 * @returns {Promise<Array>} Uma promessa que resolve para uma lista de resultados.
 */
export const searchCatalogedSites = async (query) => {
    // 1. Garante que os dados foram carregados
    const data = await loadCatalogedSitesData();

    if (!data || data.length === 0) {
        return [];
    }

    // 2. Realiza a busca nos dados carregados
    const lowerCaseQuery = query.toLowerCase();
    
    // Filtra os sites baseados no título, snippet (descrição) ou tags
    const results = data.filter(site =>
        site.title.toLowerCase().includes(lowerCaseQuery) ||
        site.snippet.toLowerCase().includes(lowerCaseQuery) ||
        site.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    ).map(site => ({ ...site, type: 'catalogedSite' })); // Adiciona o tipo

    // Retorna os resultados de forma síncrona (após o carregamento inicial dos dados)
    // Não é necessário o setTimeout aqui, pois o fetch já é uma operação assíncrona.
    return results;
};
