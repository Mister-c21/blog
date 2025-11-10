export const DADOS_CHARACTERS = [
    {
        id: 1,
        title: "Sherlock Holmes",
        category: "Protagonista", 
        image: "https://portalpopline.com.br/wp-content/uploads/2022/04/sherlock.jpg", 
        
        profile: {
            bannerUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXKjPGSmFVJVAMTHaSkXNg8K5u073cdmD3W2zkSfJwLvoeMkOClrRufFA&s=10", 
            avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMCqao9B5U_-XKBgd1fHGABEZbd0VjoZsbe00DSdfAkAMu9iU-vNRUuQk&s=10", 
            username: "@221B_Consultant",
            
            bio: "Sou apenas um cérebro; o resto é apêndice. Meu trabalho é saber o que os outros não sabem.", 
            
            status: "Vivo", 
            ocupacao: "Detetive Consultor",
            localidade: "221B Baker Street, Londres",
            
            spotifyTrackId: "0tKhPnZtEj36zIkZvSaGGV", 

            links: [
                { 
                    title: "Biografia Completa (eBiografia)", 
                    url: "https://www.ebiografia.com/sherlock_holmes/", 
                    iconClass: "fas fa-user-circle" 
                },
                { 
                    title: "Wikipedia: Sherlock Holmes", 
                    url: "https://pt.wikipedia.org/wiki/Sherlock_Holmes", 
                    iconClass: "fas fa-globe" 
                },
            ],
            
            amigos: [
                { name: "Dr. John H. Watson", username: "@DrJW_Author", link: "#" },
            ],
            familia: [
                { parentesco: "Irmão Mais Velho", name: "Mycroft Holmes" },
            ],
            historia: [
                {
                    title: "Origem e Habilidades",
                    content: "Holmes utiliza a ciência da Dedução para resolver crimes. Sua metodologia é rigorosa e inclui vasta experiência em química, caligrafia, criptografia e toxicologia. Sua primeira aparição foi em 1887 na obra 'Um Estudo em Vermelho'.",
                },
            ],
        },
    },
    {
        id: 2,
        title: "Professor James Moriarty",
        category: "Antagonista", 
        image: "caminho/para/card_moriarty.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_matematica.jpg",
            avatarUrl: "caminho/para/avatar_moriarty.jpg",
            username: "@TheCrimeNapoleon",
            
            bio: "Um gênio com mente brilhante o suficiente para ser o oposto moral de Sherlock Holmes. O cérebro do crime de Londres.", 
            
            status: "Morto (Presumido)", 
            ocupacao: "Professor Universitário de Matemática (Frente) / Mente Criminosa",
            localidade: "Localização Secreta",
            
            spotifyTrackId: "2XyD4qX3oUjA9eS2d7r6zX", 
            
            links: [
                { 
                    title: "Wikipedia: Professor Moriarty", 
                    url: "https://pt.wikipedia.org/wiki/Professor_Moriarty", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Sobre 'O Problema Final'", 
                    url: "https://www.arthur-conan-doyle.com/index.php/James_Moriarty", 
                    iconClass: "fas fa-book" 
                },
            ],
            
            amigos: [],
            familia: [
                { parentesco: "Irmão", name: "Nome Desconhecido" },
            ],
            historia: [
                {
                    title: "O Primeiro Contato",
                    content: "Moriarty é introduzido por Holmes como o maior organizador de crimes em Londres, uma figura sombria que controla os fios de praticamente todos os atos malignos da cidade.",
                },
            ],
        },
    },
    {
        id: 3,
        title: "Irene Adler",
        category: "Anti-Herói", 
        image: "caminho/para/card_irene.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_irene.jpg", 
            avatarUrl: "caminho/para/avatar_irene.jpg", 
            username: "@TheWoman",
            
            bio: "Uma mulher de suprema inteligência, que só foi derrotada por ela mesma. Sou a única 'A Mulher' para ele.", 
            
            status: "Vivo", 
            ocupacao: "Aventureira e Cantora",
            localidade: "Europa (Localização Variável)",
            
            spotifyTrackId: "1P8gT3K4rXkFwT7N5u3yV0",
            
            links: [
                 { 
                    title: "Wikipedia: Irene Adler", 
                    url: "https://pt.wikipedia.org/wiki/Irene_Adler", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Análise da Personagem", 
                    url: "http://sherlockbrasil.blogspot.com/2015/03/a-irene-adler-do-moffat.html", 
                    iconClass: "fas fa-comments" 
                },
            ], 
            
            amigos: [],
            familia: [],
            historia: [
                {
                    title: "A Única Derrota",
                    content: "É a única pessoa que conseguiu superar Sherlock Holmes, um feito que a fez ganhar o respeito do detetive.",
                },
            ],
        },
    },
    {
        id: 4,
        title: "Sra. Hudson",
        category: "Coadjuvante", 
        image: "caminho/para/card_hudson.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_chaleira.jpg",
            avatarUrl: "caminho/para/avatar_hudson.jpg",
            username: "@BestLandlady",
            
            bio: "Sou a proprietária de 221B Baker Street. Mantenho a ordem e, o mais importante, a chaleira cheia.", 
            
            status: "Vivo", 
            ocupacao: "Proprietária (Landlady)",
            localidade: "221B Baker Street, Londres",
            
            spotifyTrackId: null, 
            
            links: [
                 { 
                    title: "Wikipedia: Mrs. Hudson", 
                    url: "https://pt.wikipedia.org/wiki/Mrs._Hudson", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Sobre 221B Baker Street", 
                    url: "https://www.221bakerstreet.com/", 
                    iconClass: "fas fa-home" 
                },
            ], 
            
            amigos: [
                { name: "Sherlock Holmes", username: "@221B_Consultant", link: "#" },
            ],
            familia: [],
            historia: [
                {
                    title: "A Paciente Anfitriã",
                    content: "A Sra. Hudson tolera as excentricidades de Holmes, incluindo seus experimentos químicos e o constante fluxo de clientes, mostrando grande afeto pela dupla.",
                },
            ],
        },
    },
    {
        id: 5,
        title: "Mycroft Holmes",
        category: "Mentor", 
        image: "caminho/para/card_mycroft.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_diogenes.jpg",
            avatarUrl: "caminho/para/avatar_mycroft.jpg",
            username: "@DiogenesClub",
            
            bio: "Sou o mais velho e, devo admitir, o mais inteligente dos irmãos. Eu sou o governo britânico.", 
            
            status: "Vivo", 
            ocupacao: "Funcionário do Governo Britânico (Alto Escalão)",
            localidade: "Diogenes Club, Londres",
            
            spotifyTrackId: "7qJ4n8K9n9s5t5l8M3r9J9",
            
            links: [
                { 
                    title: "Wikipedia: Mycroft Holmes", 
                    url: "https://pt.wikipedia.org/wiki/Mycroft_Holmes", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Informações Detalhadas (Doyle Encyclopedia)", 
                    url: "https://www.arthur-conan-doyle.com/index.php/Mycroft_Holmes", 
                    iconClass: "fas fa-university" 
                },
            ],
            
            amigos: [],
            familia: [
                { parentesco: "Irmão Mais Novo", name: "Sherlock Holmes" },
            ],
            historia: [
                {
                    title: "O Cérebro do Governo",
                    content: "Mycroft possui poderes de dedução ainda maiores que os de Sherlock, mas lhe falta a energia para aplicá-los. Ele essencialmente 'é' o governo britânico.",
                },
            ],
        },
    },
    {
        id: 6,
        title: "Dr. John H. Watson",
        category: "Aliado", 
        image: "caminho/para/card_watson.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_watson.jpg",
            avatarUrl: "caminho/para/avatar_watson.jpg",
            username: "@DrJW_Author",
            
            bio: "Sou apenas o humilde biógrafo do maior detetive que o mundo já viu. Médico e ex-militar.", 
            
            status: "Vivo", 
            ocupacao: "Médico e Escritor/Biógrafo",
            localidade: "221B Baker Street, Londres",
            
            spotifyTrackId: "3tT3Kj2s7hC1s5l4d5F6P8",
            
            links: [
                { 
                    title: "Wikipedia: Dr. John H. Watson", 
                    url: "https://pt.wikipedia.org/wiki/Dr._Watson", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Função como Biógrafo", 
                    url: "http://www.guiadosquadrinhos.com/personagem/dr-watson-(john-hamish-watson)/4313", 
                    iconClass: "fas fa-stethoscope" 
                },
            ],
            
            amigos: [
                { name: "Sherlock Holmes", username: "@221B_Consultant", link: "#" },
            ],
            familia: [
                { parentesco: "Esposa", name: "Mary Morstan" },
            ],
            historia: [
                {
                    title: "O Cronista",
                    content: "Sua principal função na vida de Holmes foi documentar e publicar as aventuras, tornando o detetive uma figura pública e lendária.",
                },
            ],
        },
    },
    {
        id: 7,
        title: "Monkey D. Luffy",
        category: "Protagonista", 
        image: "caminho/para/card_luffy.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_onepiece.jpg", 
            avatarUrl: "caminho/para/avatar_luffy.jpg", 
            username: "@StrawHatCaptain",
            
            bio: "Eu vou ser o Rei dos Piratas! Tenho uma promessa a cumprir e um chapéu de palha para proteger. Não sei navegar, mas sei chutar bundas!", 
            
            status: "Vivo", 
            ocupacao: "Capitão Pirata",
            localidade: "Alto Mar (Thousand Sunny)",
            
            spotifyTrackId: "643c5bTqH7jH7g5tYk6M2k", // Exemplo: Abertura "We Are!"
            
            links: [
                { 
                    title: "Wikipedia: Monkey D. Luffy", 
                    url: "https://pt.wikipedia.org/wiki/Monkey_D._Luffy", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Fandom One Piece", 
                    url: "https://onepiece.fandom.com/pt/wiki/Monkey_D._Luffy", 
                    iconClass: "fas fa-anchor" 
                },
            ],
            
            amigos: [
                { name: "Roronoa Zoro", username: "@Mugiwara_Hunter", link: "#" },
                { name: "Nami", username: "@Mugiwara_Navigator", link: "#" },
            ],
            familia: [
                { parentesco: "Avô", name: "Monkey D. Garp" },
                { parentesco: "Pai", name: "Monkey D. Dragon" },
            ],
            historia: [
                {
                    title: "Akuma no Mi",
                    content: "Luffy ganhou seus poderes de borracha após comer acidentalmente a Gomu Gomu no Mi, que na verdade se revelou ser a Hito Hito no Mi, Modelo: Nika.",
                },
            ],
        },
    },
    {
        id: 8,
        title: "Geralt de Rívia",
        category: "Anti-Herói", 
        image: "caminho/para/card_geralt.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_bruxo.jpg", 
            avatarUrl: "caminho/para/avatar_geralt.jpg", 
            username: "@WhiteWolf_Butcher",
            
            bio: "Um bruxo. Caçador de monstros por dinheiro. Odeio portais. 'Humm'.", 
            
            status: "Vivo", 
            ocupacao: "Bruxo (Witcher)",
            localidade: "Kaer Morhen / O Caminho",
            
            spotifyTrackId: "5F9vXb2sVn4z9S4Q7yqC4g", // Exemplo: The Wolven Storm
            
            links: [
                { 
                    title: "Wikipedia: Geralt de Rívia", 
                    url: "https://pt.wikipedia.org/wiki/Geralt_de_Rivia", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Guia de Personagens Witcher", 
                    url: "https://thewitcher.fandom.com/pt/wiki/Geralt_de_Rivia", 
                    iconClass: "fas fa-swords" 
                },
            ],
            
            amigos: [
                { name: "Dandelion (Jaskier)", username: "@Troubador_Jaskier", link: "#" },
                { name: "Yennefer de Vengerberg", username: "@Sorceress_Yen", link: "#" },
            ],
            familia: [
                { parentesco: "Filha adotiva", name: "Ciri" },
            ],
            historia: [
                {
                    title: "Teste das Ervas",
                    content: "Geralt passou por mutações extremas durante o 'Teste das Ervas', que o transformaram em um bruxo, conferindo-lhe força, velocidade e sentidos aprimorados.",
                },
            ],
        },
    },
    {
        id: 9,
        title: "Eleven (Onze)",
        category: "Protagonista", 
        image: "caminho/para/card_eleven.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_strangerthings.jpg", 
            avatarUrl: "caminho/para/avatar_eleven.jpg", 
            username: "@El_011",
            
            bio: "Amigos não mentem. Uso meus poderes para proteger as pessoas que eu amo. Batatas Fritas e Eggos.", 
            
            status: "Vivo", 
            ocupacao: "Estudante / Telecinética",
            localidade: "Hawkins, Indiana",
            
            spotifyTrackId: "0o9YcK1K2XwE47P8wK003g", // Exemplo: Stranger Things Theme
            
            links: [
                { 
                    title: "Wikipedia: Eleven (Stranger Things)", 
                    url: "https://pt.wikipedia.org/wiki/Eleven_(Stranger_Things)", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Fandom Stranger Things", 
                    url: "https://strangerthings.fandom.com/pt/wiki/Eleven", 
                    iconClass: "fas fa-bolt" 
                },
            ],
            
            amigos: [
                { name: "Mike Wheeler", username: "@ThePaladin_Mike", link: "#" },
                { name: "Dustin Henderson", username: "@TheBard_Dustin", link: "#" },
            ],
            familia: [
                { parentesco: "Pai Adotivo", name: "Jim Hopper" },
                { parentesco: "Mãe", name: "Terry Ives" },
            ],
            historia: [
                {
                    title: "Origem dos Poderes",
                    content: "Eleven foi sequestrada e criada no Laboratório Nacional de Hawkins, onde seus poderes psicocinéticos e telecinéticos foram desenvolvidos através de experimentos.",
                },
            ],
        },
    },
    {
        id: 10,
        title: "Izuku Midoriya (Deku)",
        category: "Protagonista", 
        image: "caminho/para/card_deku.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_deku.jpg", 
            avatarUrl: "caminho/para/avatar_deku.jpg", 
            username: "@Deku_PlusUltra",
            
            bio: "Sou o herói que vai salvar a todos com um sorriso! Meu corpo ainda não aguenta o poder, mas minha vontade aguenta tudo.", 
            
            status: "Vivo", 
            ocupacao: "Estudante de Herói Profissional",
            localidade: "UA High School, Japão",
            
            spotifyTrackId: "2443vG2uJtq9qfV5wX1Qy7", // Exemplo: Música de MHA
            
            links: [
                { 
                    title: "Wikipedia: Izuku Midoriya", 
                    url: "https://pt.wikipedia.org/wiki/Izuku_Midoriya", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "MHA Fandom", 
                    url: "https://bokunoheroacademia.fandom.com/pt/wiki/Izuku_Midoriya", 
                    iconClass: "fas fa-fist-raised" 
                },
            ],
            
            amigos: [
                { name: "Katsuki Bakugo", username: "@GreatExplosion", link: "#" },
            ],
            familia: [
                { parentesco: "Mãe", name: "Inko Midoriya" },
            ],
            historia: [
                {
                    title: "One For All",
                    content: "Midoriya nasceu sem uma 'Quirk' (individualidade), mas herdou o poder lendário 'One For All' de seu ídolo, All Might.",
                },
            ],
        },
    },
    {
        id: 11,
        title: "Kratos",
        category: "Protagonista", 
        image: "caminho/para/card_kratos.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_kratos.jpg", 
            avatarUrl: "caminho/para/avatar_kratos.jpg", 
            username: "@GhostOfSparta",
            
            bio: "Sou um Fantasma de Esparta. Fui um Deus da Guerra. Agora sou apenas um pai... mas não me teste.", 
            
            status: "Vivo", 
            ocupacao: "Guerreiro / Pai",
            localidade: "Mitologia Nórdica",
            
            spotifyTrackId: "650G79o3w5wR3wFp5iP0l7", // Exemplo: Música de God of War
            
            links: [
                { 
                    title: "Wikipedia: Kratos", 
                    url: "https://pt.wikipedia.org/wiki/Kratos_(God_of_War)", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "God of War Fandom", 
                    url: "https://godofwar.fandom.com/pt/wiki/Kratos", 
                    iconClass: "fas fa-axe" 
                },
            ],
            
            amigos: [
                { name: "Mimir", username: "@TheSmartestMan", link: "#" },
            ],
            familia: [
                { parentesco: "Filho", name: "Atreus" },
            ],
            historia: [
                {
                    title: "Vingança contra os Deuses",
                    content: "Após ser traído e manipulado por Ares, Kratos embarcou em uma sangrenta jornada de vingança que resultou na queda do Panteão Grego.",
                },
            ],
        },
    },
    {
        id: 12,
        title: "Thanos",
        category: "Antagonista", 
        image: "caminho/para/card_thanos.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_thanos.jpg", 
            avatarUrl: "caminho/para/avatar_thanos.jpg", 
            username: "@TheMadTitan",
            
            bio: "O universo tem recursos finitos e eu sou o único com a coragem para restaurar o equilíbrio. O estalo é inevitável.", 
            
            status: "Morto", 
            ocupacao: "Senhor da Guerra / Filósofo",
            localidade: "Titã (Original) / Nave Santuário II",
            
            spotifyTrackId: "2XyD4qX3oUjA9eS2d7r6zX", // Música de vilão
            
            links: [
                { 
                    title: "Wikipedia: Thanos", 
                    url: "https://pt.wikipedia.org/wiki/Thanos", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "MCU Fandom", 
                    url: "https://marvelcinematicuniverse.fandom.com/pt/wiki/Thanos", 
                    iconClass: "fas fa-gem" 
                },
            ],
            
            amigos: [],
            familia: [
                { parentesco: "Filha adotiva", name: "Gamora" },
            ],
            historia: [
                {
                    title: "A Busca pelas Joias",
                    content: "Thanos dedicou sua vida a reunir as seis Joias do Infinito para realizar um genocídio universal, acreditando que isso salvaria o universo da superpopulação e do colapso.",
                },
            ],
    },
    },
    {
        id: 13,
        title: "Sephiroth",
        category: "Antagonista", 
        image: "caminho/para/card_sephiroth.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_sephiroth.jpg", 
            avatarUrl: "caminho/para/avatar_sephiroth.jpg", 
            username: "@OneWingedAngel",
            
            bio: "O que eu quero... é voltar para casa. Vou me tornar o Deus da calamidade e me vingar dos que me fizeram sofrer.", 
            
            status: "Morto (Recorrente)", 
            ocupacao: "Ex-Soldado de Primeira Classe / Entidade Celestial",
            localidade: "Lifestream / Planeta",
            
            spotifyTrackId: "6N9w577oB3zI0h94hK9r7f", // Exemplo: Tema do Sephiroth
            
            links: [
                { 
                    title: "Wikipedia: Sephiroth", 
                    url: "https://pt.wikipedia.org/wiki/Sephiroth", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Final Fantasy Wiki", 
                    url: "https://finalfantasy.fandom.com/pt/wiki/Sephiroth", 
                    iconClass: "fas fa-sword" 
                },
            ],
            
            amigos: [],
            familia: [
                { parentesco: "Mãe Biológica", name: "Jenova" },
            ],
            historia: [
                {
                    title: "O Incidente de Nibelheim",
                    content: "Após descobrir a verdade sobre sua origem, Sephiroth enlouqueceu, queimou a vila de Nibelheim e iniciou sua busca pela destruição do planeta.",
                },
            ],
        },
    },
    {
        id: 14,
        title: "Venom (Eddie Brock)",
        category: "Anti-Herói", 
        image: "caminho/para/card_venom.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_venom.jpg", 
            avatarUrl: "caminho/para/avatar_venom.jpg", 
            username: "@WeAreVenom",
            
            bio: "Nós somos Venom. O simbionte alienígena mais letal do universo. Não somos bons, mas defendemos os inocentes... do nosso jeito.", 
            
            status: "Vivo", 
            ocupacao: "Jornalista (Eddie) / Protetor Letal (Venom)",
            localidade: "São Francisco, EUA",
            
            spotifyTrackId: "25oP2XwW0oP7E7W1xM2f7J", // Exemplo: Música de Venom
            
            links: [
                { 
                    title: "Wikipedia: Venom", 
                    url: "https://pt.wikipedia.org/wiki/Venom", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "Marvel Database", 
                    url: "https://marvel.fandom.com/pt-br/wiki/Venom", 
                    iconClass: "fas fa-spider" 
                },
            ],
            
            amigos: [],
            familia: [],
            historia: [
                {
                    title: "A União Simbionte",
                    content: "Eddie Brock se uniu ao simbionte Venom após ser desacreditado como jornalista, encontrando um propósito sombrio, mas heroico, em sua nova forma.",
                },
            ],
        },
    },
    {
        id: 15,
        title: "John Wick",
        category: "Anti-Herói", 
        image: "caminho/para/card_johnwick.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_wick.jpg", 
            avatarUrl: "caminho/para/avatar_wick.jpg", 
            username: "@BabaYaga",
            
            bio: "Um homem de foco, compromisso e pura vontade. O Bicho-Papão. Você sabe quem eu sou.", 
            
            status: "Desconhecido (Presumido Morto)", 
            ocupacao: "Assassino Aposentado / Agente Livre",
            localidade: "Nova York, EUA",
            
            spotifyTrackId: "3m9lEa4GqK9R674tG3F5hH", // Exemplo: Música de John Wick
            
            links: [
                { 
                    title: "Wikipedia: John Wick", 
                    url: "https://pt.wikipedia.org/wiki/John_Wick", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "John Wick Fandom", 
                    url: "https://johnwick.fandom.com/pt-br/wiki/John_Wick", 
                    iconClass: "fas fa-gun" 
                },
            ],
            
            amigos: [
                { name: "Winston", username: "@TheContinentalNY", link: "#" },
            ],
            familia: [
                { parentesco: "Esposa (Falecida)", name: "Helen Wick" },
            ],
            historia: [
                {
                    title: "O Cão e a Vingança",
                    content: "Seu retorno ao mundo dos assassinos foi desencadeado pelo roubo de seu carro e, principalmente, pela morte do cão, o último presente de sua esposa falecida.",
                },
            ],
        },
    },
    {
        id: 16,
        title: "Alfred Pennyworth",
        category: "Coadjuvante", 
        image: "caminho/para/card_alfred.jpg",
        
        profile: {
            bannerUrl: "caminho/para/banner_manor.jpg", 
            avatarUrl: "caminho/para/avatar_alfred.jpg", 
            username: "@TheButler",
            
            bio: "Mordomo, confidente e conselheiro. Um ex-militar que ainda consegue curar um ferimento de bala com um chá forte.", 
            
            status: "Vivo", 
            ocupacao: "Mordomo / Conselheiro",
            localidade: "Mansão Wayne, Gotham",
            
            spotifyTrackId: null, // Sem música específica
            
            links: [
                { 
                    title: "Wikipedia: Alfred Pennyworth", 
                    url: "https://pt.wikipedia.org/wiki/Alfred_Pennyworth", 
                    iconClass: "fas fa-globe" 
                },
                { 
                    title: "DC Database", 
                    url: "https://dc.fandom.com/pt/wiki/Alfred_Pennyworth", 
                    iconClass: "fas fa-cross" 
                },
            ],
            
            amigos: [
                { name: "Bruce Wayne (Batman)", username: "@TheDarkKnight", link: "#" },
            ],
            familia: [
                { parentesco: "Filho Adotivo", name: "Bruce Wayne" },
            ],
            historia: [
                {
                    title: "Serviço Secreto",
                    content: "Antes de servir à família Wayne, Alfred serviu ao exército britânico, dando-lhe as habilidades médicas e de combate necessárias para ajudar Batman.",
                },
            ],
        },
    },
];
