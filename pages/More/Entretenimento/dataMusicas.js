const dataMusicas = [
    { t: 'VMZ-COLUMBINA', v: 'uWEuyJ0Epog' }, 
    { t: 'LexClash-Caminho Da Dor', v: 'tiP5oB6vBEk' },
    { t: 'CaioLuix-Aroma Doce', v: 'Xpv_SKc8GdA'},
    { t: 'Tipo Uma Flor', v: 'CguWMhZGZ_k'},
    { t: 'Dança Do Caos', v: 'YBqh5iTDGP4'},
    { t: 'Seu Astro', v: 'pdhCJ3v-7mU'},
    { t: 'Meu Pequeno Guaraná', v: '4EoGIUvP_uA'},
    { t: 'Não Tem Perdão', v: '9a56JsnfVSk'},
    { t: 'O que é Amor', v: '8EeiglBYmcU'},
    { t: 'Primeiro Amor', v: 'ap_gt_IyERg'},
    { t: 'Até o Fim', v: 'tQqkwk_ud5o'},
    { t: 'Além do Tempo', v: 'aoduQLwSVnQ'},
    { t: 'Laço Espiritual', v: 'iIQITqKIiLI'},
    { t: 'Só Você', v: 'uL8ShMKlrF8'},
    { t: 'Depois do Fim', v:'s1hFHdIhc8c'},
    { t: 'A Flor e o Beija-flor', v: 'qUX8gNg0IUQ'},
    { t: 'Jura Juradinho', v: 'Yx1krJ3DycU'},
    { t: 'Teu Perfume', v: '-chsVcNpGUQ'},
    { t: 'Auras', v: 'dfmm6ARNl1Q'},
    { t: 'VMZ-Amor(Animes)', v:'NG6jiXWnM8Q'},
    { t: 'Forte Sou(Novela Genesis)', v: 'zfK7h0DbIkY'},
    { t: 'Any-Impacto', v: 'iMbPZLtgQR4'},
    { t: 'Futura Escuridão', v: 'UacOS68B20Q'},

    { t: "Linkin Park - In The End", v: "eVTXPUF4Oz4", genero: "rock" },

    { t: "Player Tauz - Rap do Naruto", v: "z3P_mleiaX0", genero: "geek" },

    { t: "Asian Kung-Fu Generation - Haruka Kanata", v: "nJ6A6GC_WF4", genero: "animes" },

    { t: "Fernandinho - Grandes Coisas", v: "29_S7N_Gv9M", genero: "gospel" },

    { t: "Lofi Girl - Chill Lofi Beats", v: "jfKfPfyJRdk", genero: "Lo-fi" },

    { t: "Beethoven - Fur Elise", v: "wfF0zHeU3Zs", genero: "clássicas" },

    { t: "Michael Jackson - Billie Jean", v: "Zi_XLOBDo_Y", genero: "pop" },

    { t: "Eminem - Lose Yourself", v: "_Yhyp-_hK2s", genero: "hip-hop/rap" },

    { t: "Bruno Mars - Leave The Door Open", v: "adLGHcj_fmA", genero: "R&B (Rhythm and Blues)" },

    { t: "Bob Marley - Three Little Birds", v: "HNBCVM4KbUM", genero: "Reggae" },

    { t: "Sean Paul - Temperature", v: "dW2MmuA1nI4", genero: "Dancehall" },

    { t: "Metallica - Master of Puppets", v: "E0ozmU9cJDg", genero: "Heavy Metal" },

    { t: "The Ramones - Blitzkrieg Bop", v: "268nGCp6NfQ", genero: "Punk Rock" },

    { t: "Arctic Monkeys - Do I Wanna Know?", v: "bpOSxM0rNPM", genero: "Indie / Alternativo" },

    { t: "Nirvana - Smells Like Teen Spirit", v: "hTWKbfoikeg", genero: "Grunge" },

    { t: "Swedish House Mafia - Don't You Worry Child", v: "1y6smkh6c-0", genero: "House" },

    { t: "Amelie Lens - Techno Live Mix", v: "nO95bovfH_8", genero: "Techno" },

    { t: "Armin van Buuren - Blah Blah Blah", v: "mfJhMfOPWdE", genero: "Trance" },

    { t: "Martin Garrix - Animals", v: "gCYcHz2k5x0", genero: "EDM (Electronic Dance Music)" },

    { t: "Skrillex - Scary Monsters and Nice Sprites", v: "WSeNSzJ2-Jw", genero: "Dubstep" },

    { t: "B.B. King - The Thrill Is Gone", v: "4fk2prKnYnI", genero: "Blues" },

    { t: "Miles Davis - So What", v: "ylXk1LBvI8U", genero: "Jazz" },

    { t: "Mozart - Symphony No. 40", v: "JTc1mDieQI8", genero: "Música Clássica / Erudita" },

    { t: "Almir Sater - Tocando em Frente", v: "y67mBv9R918", genero: "Folk / Música Autoral" },

    { t: "Johnny Cash - Hurt", v: "8AHCfZTRGiI", genero: "Country" },

    { t: "Chitãozinho & Xororó - Evidências", v: "e3-5YC_oHjE", genero: "Sertanejo" },

    { t: "Zeca Pagodinho - Deixa a Vida Me Levar", v: "V8G7wY0BIdg", genero: "Samba" },

    { t: "Grupo Revelação - Tá Escrito", v: "4M78mbe_E9E", genero: "Pagode" },

    { t: "DJ Marlboro - Dança da Motinha", v: "E16qjMh2k6A", genero: "Funk Brasileiro" },

    { t: "Luiz Gonzaga - Asa Branca", v: "v7coZ67Z6b4", genero: "Forró" },
    { t: "Luiz Gonzaga - Asa Branca", v: "v7coZ67Z6b4", genero: "Forró" },
    { t: "Falamansa - Xote dos Milagres", v: "c96-V2_52rI", genero: "Forró" },
    { t: "Alceu Valença - Coração Bobo", v: "M5gH49-j3F8", genero: "Forró" },
    { t: "Dominguinhos - Eu Só Quero um Xodó", v: "K4I5Wk68FmY", genero: "Forró" },
    { t: "Mastruz com Leite - Meu Vaqueiro, Meu Peão", v: "P9yF5vR8z-0", genero: "Forró" },
    { t: "Calcinha Preta - Você Não Vale Nada", v: "W8O4zMxB7Yo", genero: "Forró" },
    { t: "Aviões do Forró - Correndo Atrás de Mim", v: "bY1f8R6zX9o", genero: "Forró" },
    { t: "Dorgival Dantas - Destá", v: "fx2z5EV0BPk", genero: "Forró" },
    { t: "Barões da Pisadinha - Recairei", v: "T9v9bXGzX7o", genero: "Forró" },

    
    { t: "Elis Regina - Como Nossos Pais", v: "ZNl8ZEnF8sc", genero: "MPB (Música Popular Brasileira)" },
    { t: "Gal Costa - Baby", v: "uWxRTf4I458", genero: "MPB (Música Popular Brasileira)" },
    { t: "Chico Buarque - Construção", v: "Z3RzUv9L-y8", genero: "MPB (Música Popular Brasileira)" },
    { t: "Caetano Veloso - Sozinho", v: "k4VjZ9eO_r4", genero: "MPB (Música Popular Brasileira)" },
    { t: "Gilberto Gil - Aquele Abraço", v: "T7MhM88fTfk", genero: "MPB (Música Popular Brasileira)" },
    { t: "Alceu Valença - Anunciação", v: "hV_f9bN6zoU", genero: "MPB (Música Popular Brasileira)" },
    { t: "Djavan - Oceano", v: "K1XgN4u0Z8A", genero: "MPB (Música Popular Brasileira)" },
    { t: "Milton Nascimento - Maria, Maria", v: "bA8cZ3X7YoM", genero: "MPB (Música Popular Brasileira)" },
    { t: "Belchior - Apenas um Rapaz Latino-Americano", v: "Z9v9bXGzX7o", genero: "MPB (Música Popular Brasileira)" },
    { t: "Marisa Monte - Amor I Love You", v: "Pl9f8_S_z90", genero: "MPB (Música Popular Brasileira)" },

    { t: "João Gilberto - Garota de Ipanema", v: "c5QfXj8Wd8A", genero: "Bossa Nova" },
    { t: "João Gilberto - Chega de Saudade", v: "5z3uEzPuZLM", genero: "Bossa Nova" },
    { t: "Tom Jobim - Corcovado", v: "iFZyoNa641M", genero: "Bossa Nova" },
    { t: "Sérgio Mendes - Mas Que Nada", v: "cXelMzaCmiQ", genero: "Bossa Nova" },
    { t: "Tom Jobim & Elis Regina - Águas de Março", v: "E1tOV7y94RE", genero: "Bossa Nova" },
    { t: "Vinicius de Moraes - Tarde em Itapoã", v: "3671h8zX9oU", genero: "Bossa Nova" },
    { t: "Toquinho & Vinicius - Samba de Orly", v: "Y5v9bXGzX7o", genero: "Bossa Nova" },
    { t: "Nara Leão - O Barquinho", v: "0bM73wU7_78", genero: "Bossa Nova" },
    { t: "Bebel Gilberto - Samba da Benção", v: "Pl9f8_S_z90", genero: "Bossa Nova" },


    { t: "Ivete Sangalo - Poeira", v: "Wp6M2zE3W8A", genero: "Axé" },
    { t: "Banda Eva - Beleza Rara", v: "wN7wOQyH5pM", genero: "Axé" },
    { t: "Chiclete com Banana - Voa Voa", v: "J3f8wXGzY7o", genero: "Axé" },
    { t: "Asa de Águia - Dança da Manivela", v: "a5lL3u5mT8Y", genero: "Axé" },
    { t: "Olodum - Requebra", v: "z1f8R6zX9oU", genero: "Axé" },
    { t: "Timbalada - Beija-Flor", v: "Pl9f8_S_z90", genero: "Axé" },
    { t: "Daniela Mercury - O Canto da Cidade", v: "0bM73wU7_78", genero: "Axé" },
    { t: "É o Tchan - Segura o Tchan", v: "m_X9W67w_Yo", genero: "Axé" },
    { t: "Margareth Menezes - Faraó Divindade do Egito", v: "tTvhSq9EdDM", genero: "Axé" },


    { t: "Daddy Yankee - Gasolina", v: "q_S9Y-m26E4", genero: "Reggaeton" },
    { t: "Don Omar - Danza Kuduro", v: "BbWY-avjDto", genero: "Reggaeton" },
    { t: "J Balvin & Willy William - Mi Gente", v: "wnJ6LuLYpNj", genero: "Reggaeton" },
    { t: "Bad Bunny - Tití Me Preguntó", v: "Cr8K8NTnS3U", genero: "Reggaeton" },
    { t: "Maluma - Hawái", v: "91vX_Z3X7Yo", genero: "Reggaeton" },
    { t: "Karol G & Nicki Minaj - Tusa", v: "fx2z5EV0BPk", genero: "Reggaeton" },
    { t: "Natti Natasha & Ozuna - Criminal", v: "VqEbCWWFpZs", genero: "Reggaeton" },
    { t: "Farruko - Pepas", v: "y81f8R6zX9o", genero: "Reggaeton" },
    { t: "Anuel AA & Daddy Yankee - China", v: "0bM73wU7_78", genero: "Reggaeton" },


    { t: "Hector Lavoe - El Cantante", v: "4A0mH9Y8B18", genero: "Salsa" },
    { t: "Marc Anthony - Vivir Mi Vida", v: "YXnjy5YlDwk", genero: "Salsa" },
    { t: "Celia Cruz - La Vida Es Un Carnaval", v: "08wUx_NID6A", genero: "Salsa" },
    { t: "Joe Arroyo - Rebelión", v: "Nhtn3HROVgA", genero: "Salsa" },
    { t: "Grupo Niche - Cali Pachanguero", v: "7XW6r26X-Yw", genero: "Salsa" },
    { t: "Willie Colón & Héctor Lavoe - Idilio", v: "2bWwX6zX7Yo", genero: "Salsa" },
    { t: "Frankie Ruiz - Deseándote", v: "bY1f8R6zX9o", genero: "Salsa" },
    { t: "Jerry Rivera - Amores Como El Nuestro", v: "Pl9f8_S_z90", genero: "Salsa" },
    { t: "Gilberto Santa Rosa - Conciencia", v: "0bM73wU7_78", genero: "Salsa" },
    { t: "Oscar D'León - Llorarás", v: "m_X9W67w_Yo", genero: "Salsa" },

    { t: "Prince Royce - Darte un Beso", v: "bdOXnTbyk0g", genero: "Bachata" },
    { t: "Chayanne - Bailando Bachata", v: "dsLjyLn859g", genero: "Bachata" },
    { t: "La Bachata - MTZ", v: "TiM_TFpT_DE", genero: "Bachata" },
    { t: "Romeo Santos - Propuesta Indecente", v: "QFs3PIZb3js", genero: "Bachata" },
    { t: "Aventura - Dile al Amor", v: "IY3U26217qA", genero: "Bachata" },
    { t: "Prince Royce - Recházame", v: "Pl9f8_S_z90", genero: "Bachata" },
    { t: "Juan Luis Guerra - Bachata Rosa", v: "Y8Z2p0zR-mU", genero: "Bachata" },
    { t: "Zacarías Ferreira - Asesina", v: "0bM73wU7_78", genero: "Bachata" },
    { t: "Hector Acosta - Me Voy", v: "Y5v9bXGzX7o", genero: "Bachata" },
    { t: "Monchy & Alexandra - Dos Locos", v: "pY1f8R6zX9o", genero: "Bachata" },


    { t: "Fireboy DML", v: "gCLUIzOsgGg", genero: "Afrobeats" },
    { t: "Pheelz - Finesse", v: "Vcwhe0pY4Bg", genero: "Afrobeats" },
    { t: "Turbulence", v: "cv5chGtfVTg", genero: "Afrobeats" },
    { t: "Roses", v: "gBrkbcKtC4M", genero: "Afrobeats" },
    { t: "Shakabulizzy", v: "cM33s50feL4", genero: "Afrobeats" },
    { t: "With You - Davido", v: "pqVQpOby0VA", genero: "Afrobeats" },
    { t: "Don't Stop Now", v: "j-3M4bkNW6Y", genero: "Afrobeats" },
    { t: "Essence", v: "m77FDcKg96Q", genero: "Afrobeats" },
    { t: "My Side", v: "JYcCjrP9vrc", genero: "Afrobeats" },
    { t: "Black Aura - Deeper", v: "lQjGoPnSqkI", genero: "Afrobeats" },

];

