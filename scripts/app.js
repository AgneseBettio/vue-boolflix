
/* 
Milestone 1:

Creare un layout base con una searchbar (una input e un button) in cui possiamo
scrivere completamente o parzialmente il nome di un film. Possiamo, cliccando il
bottone, cercare sull’API tutti i film che contengono ciò che ha scritto l’utente.

Vogliamo dopo la risposta dell’API visualizzare a schermo i seguenti valori per ogni
film trovato:
1. Titolo
2. Titolo Originale
3. Lingua
4. Voto 
*/

// es. chiamata API x serie tv https://api.themoviedb.org/3/search/tv?api_key=569d019eeee55f5bc12206acd16c8153&query=back future&language=it-ITA

new Vue({
    el: '#root',


    data: {
        //mi metto in variabile api_key
        DMDApiKey: '569d019eeee55f5bc12206acd16c8153',

        // v-model per verifica valori inseriti dall'user che saranno parte della mia chiamata API
        queryToSearch: "",
        // arrays vuoti dove inserire i risultati della ricerca - inseriti entrabi per film e serie TV poichè le chiamate differiscono
        filmsList: [],
        tvSeriesList: [],

    },

    methods: {
        doSearch() {
            // mi salvo i parametri di ricerca in const a parte - inizio con soli film
            const APIParams = {
                params: {
                    api_key: this.DMDApiKey,
                    query: this.queryToSearch,
                    language: "it-IT",
                }

            };
            //viene fatta la chiamata API con valore input utente
            axios.get("https://api.themoviedb.org/3/search/movie", APIParams)
                .then((resp) => {
                    // inserisco risposta in array filmsList
                    this.filmsList = resp.data.results;
                    
                });
            console.log(this.filmsList)
            return this.filmsList

            /* cosa mi serve dei risultati di ritorno?
            Movie:
            1. Titolo - .title
            2. Titolo Originale - .original_title
            3. Lingua - .original_language
            4. Voto - .vote_average
            */
        },
    }
})