
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


/* 
Milestone 2

Trasformiamo la stringa statica della lingua in una vera e propria bandiera della nazione corrispondente, gestendo il caso in cui non abbiamo la bandiera della nazione ritornata dall’API.

!!! class: flag-icon-XX" sarà v-bind tamite mappatura lingua-paese

cosa mi serve dei risultati di ritorno?
            Movie:
            1. Titolo - .title
            2. Titolo Originale - .original_title
            3. Lingua - .original_language
            4. Voto - .vote_average


*/

/* 
Milestone 3:
In questa milestone come prima cosa aggiungiamo la copertina del film o della serie
al nostro elenco. Ci viene passata dall’API solo la parte finale dell’URL, questo
perché poi potremo generare da quella porzione di URL tante dimensioni diverse.
Dovremo prendere quindi l’URL base delle immagini di TMDB:
https://image.tmdb.org/t/p/ per poi aggiungere la dimensione che vogliamo generare -
componenti url img : base_url, a file_size and a file_path.

Trasformiamo poi il voto da 1 a 10 decimale in un numero intero da 1 a 5, così da
permetterci di stampare a schermo un numero di stelle piene che vanno da 1 a 5,
lasciando le restanti vuote (troviamo le icone in FontAwesome).
Arrotondiamo sempre per eccesso all’unità successiva, non gestiamo icone mezze
piene.

*/

new Vue({
    el: '#root',


    data: {
        //mi metto in variabile api_key
        DMDApiKey: '569d019eeee55f5bc12206acd16c8153',
        // v-model per verifica valori inseriti dall'user che saranno parte della mia chiamata API
        queryToSearch: "",
        // arrays vuoti dove inserire i risultati della ricerca - inseriti entrabi per film e serie TV poichè le chiamate differiscono
        filmsList: null,
        tvSeriesList: null,
        img_baseUrl: "https://image.tmdb.org/t/p/",
        noImg_Url : "img/noposter.png",
        // condizione per mostrare info film 
        getInfo : false,
        currentShow : null,
        //pagina iniziale
        popularFilmList : [],
        //milestone 6
        //genresList : [],

    },

    methods: {
        doSearch() {
            this.axiosForSearch("movie");
            this.axiosForSearch("tv");
            console.log(this.filmsList);
            console.log(this.tvSeriesList);
            this.queryToSearch = "";
        },
        axiosForSearch(type) {
            // mi salvo i parametri di ricerca in const a parte - inizio con soli film
            const APIParams = {
                params: {
                    api_key: this.DMDApiKey,
                    query: this.queryToSearch,
                    language: "it-IT",
                }
            };
            if( this.queryToSearch == "") {
                return
            } else {
                // //viene fatta la chiamata API con valore input utente
                axios.get("https://api.themoviedb.org/3/search/" + type, APIParams)
                //condizione per movie e condizione per tv show in risposta
                .then((resp) => {
                    if (type == "movie") {
                        // inserisco risposta in array filmsList
                        this.filmsList = resp.data.results;
                    } else if (type == "tv") {
                        // inserisco risposta in array tvSeriesList

                        // ci sono però dati che differiscono per avere un solo elemento in stampa html- mappo tvSeriesList - in modo da avere anche lì .original_title .title e non .name
                        this.tvSeriesList = resp.data.results.map((TVshow) => {
                            TVshow.title = TVshow.name 
                            TVshow.original_title = TVshow.original_name;
                            TVshow.tvSeries = true;
                            return TVshow
                        })
                    }
                })
            }
       
        },
        //stampo poster qui formato 500px
        getPoster(show) {
            const posterSize = "w342"
            const posterPath = show.poster_path
            const completePosterPath = this.img_baseUrl + posterSize + posterPath;
            return completePosterPath
        },
        //stampo bandiera con v-bind su classe 
        getFlag(show) {

            //mi inserisco mappatura x stampa flags
            const langToCountry = {

                'en': ['us', 'gb', 'ca'],
                'es': ['es', 'ar', 'co'],
                'it': ['it'],
                'fr': ['fr'],
                'tr': ['tr'],
                'zh': ['cn'],
                'ja': ['jp'],
            };
            //la mia bandiera di ripiego é US
            const fallbackFlag = 'xx';
            //devo verificare con risposta API .original_language
            const queryOriginalLang = show.original_language;
            //devo verificare che la queryOriginalLang coincida con una chiave di langToCountry               
            // Object.keys(obj) – ritorno un array di key su cui posso usare metodo incoldes()
            const chooseCountry = Object.keys(langToCountry).includes(queryOriginalLang) ? langToCountry[queryOriginalLang][0] : fallbackFlag;
            //ritorno prima bandiera - più tardi implemento + bandiere?
            return "flag-icon-" + chooseCountry

        },
        // trasformo film average in stelline - voglio ciclare in un v-for di 5
        starVote(show, index) {
            const halfAverage = Math.ceil(show.vote_average/2);
                if (index + 1 <= halfAverage) {
                    return 'fa fa-star gold-star'
                } else {
                    return 'fa fa-star white-star'                
            }
        },
        // limita parole overview
        trimmedOverview(show){
            const overview = show.overview;
            //slice per prendere primi 80 caratteri
            let trimmedOverview = overview.slice(0, 80);
            if (overview.length > 80) {
                return trimmedOverview + '...'
            } else {
                return overview;
            }
        },
        //milestone 5 mostrare primi 5 attori
        getCast(show){
        //variabile per selezionare il film preso in analisi
           this.currentShow = show
            const APIParams = {
                params: {
                    api_key: this.DMDApiKey,
                    language: "it-IT",
                }
            };
            const showType = show.tvSeries ? "tv" : "movie";
            //chiamata per credits
            axios.get(`https://api.themoviedb.org/3/${showType}/${show.id}/credits`, APIParams)

            .then((resp) => {
                //applico direttamente metodo slice() per recuperare primi 5 attori da cast completo
                this.currentShow.actors = resp.data.cast

                if(this.currentShow.actors.length == 0){
                    return "n.d"
                } else {
                    return this.currentShow.actors = resp.data.cast.slice(0, 5);
                }
            })

        },
        //ritorna a pg iniziale
        welcomePage(){
            this.filmsList = null;
            this.tvSeriesList = null;
        },
        //filtro per generi attivi?
        getGenreCodes(showList){
 
        }
    },
    mounted(){
        //pagina iniziale
        const APIParams = {
            params: {
                api_key: this.DMDApiKey,
                language: "it-IT",
            }
        };
        //chiamata per credits
        axios.get(`https://api.themoviedb.org/3/movie/popular`, APIParams)

        .then((resp) => {
            //recuperi risultato che salvo in costante
            this.popularFilmList = resp.data.results
            console.log(this.popularFilmList);
        });

    },


})

