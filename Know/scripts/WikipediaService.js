// scripts/wikipediaService.js

/**
 * Busca artigos da Wikipedia com base em um termo de pesquisa e idioma.
 * @param {string} query O termo de pesquisa.
 * @param {string} lang O idioma para a busca (ex: 'pt-br', 'en').
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de resultados.
 */
export async function searchWikipedia(query, lang) {
    if (!query) {
        return [];
    }

    // Mapeia o idioma da página para o subdomínio da Wikipedia
    // Ex: 'pt-br' -> 'pt', 'en' -> 'en', 'es' -> 'es'
    const wikipediaLang = lang.split('-')[0];
    const WIKIPEDIA_API_URL = `https://${wikipediaLang}.wikipedia.org/w/api.php`;

    const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*' // Necessário para contornar problemas de CORS em navegadores
    });

    try {
        const response = await fetch(`${WIKIPEDIA_API_URL}?${params.toString()}`);
        const data = await response.json();

        if (!data.query || data.query.search.length === 0) {
            return [];
        }

        // Formata os resultados para o formato que já usamos no projeto
        return data.query.search.map(item => ({
            type: 'wikipedia',
            title: item.title,
            snippet: item.snippet.replace(/<span class="searchmatch">/g, '').replace(/<\/span>/g, ''),
            // O link agora usa o subdomínio dinâmico do idioma
            link: `https://${wikipediaLang}.wikipedia.org/wiki/${encodeURIComponent(item.title)}`
        }));
    } catch (error) {
        console.error('Erro ao buscar da Wikipedia:', error);
        return [];
    }
}
