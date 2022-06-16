//setTimeout variable for callback fn when Preload is finished
var preloadEnded_timeout;

//all fetched pokemons' endpoints
var pokemonLinks;

//limit cards count per page
var pageLimitSize;

//fetch all pokemons endpoints
fetch_get(`${ENDPOINT.POKEMON}?offset=0&limit=1126`).then((data) => {
    if (!data) {
        return alert(`Connection error!`);
    }
    pokemonLinks = data.results;
    //main function
    main();
});
/*DOM ELEMENTS  */
const SUB_BODY = document.querySelector(`#body`);
const POKEMON_VERSION_SELECT = document.querySelector(`#versionSelect`);

const SEARCHBAR_INPUT = document.querySelector(`[pokemonSearchBar]`);

const CARDS_CONTAINER = document.querySelector(`[cardsContainer]`);
//card template
const CARD_TEMPLATE = document.querySelector(`[template_card]`);

const PAGE_PROGRESS_TEXT = document.querySelector(`[page-progress]`);
const PAGE_BACK_BTN = document.querySelector(`[back-button]`);
const PAGE_FORWARD_BTN = document.querySelector(`[forward-button]`);
const PAGE_LIMIT_SELECT = document.querySelector(`#listSize`);
const PAGE_LOADING_OVERLAY = document.querySelector(`#loading`);

const ZOOMED_CARD_CONTAINER = document.querySelector(`[data-card]`);
const ZOOMED_CARD_TEMPLATE = document.querySelector(`[zoomedPokemon]`);
/*--------------------------------------------------------------------*/

//pokemon version
var version_type = `red`;

//all fetched data about all pokemons
var fetchedPokemons = new Map();

var allPokemons = [];
var filteredPokemons = [];

var offset = 0;
var totPages = 1;
var currentPage = 1;

function main() {
    updateListSize();
    preloadPokemons();
}

function updatePageProgress() {
    totPages = Math.ceil(filteredPokemons.length / pageLimitSize);
    PAGE_PROGRESS_TEXT.textContent = `${currentPage}/${totPages}`;
}

function updateListSize() {
    pageLimitSize = parseInt(PAGE_LIMIT_SELECT.selectedOptions[0].innerHTML);
}

SEARCHBAR_INPUT.addEventListener(`input`, () => {
    let query = SEARCHBAR_INPUT.value.toLowerCase();

    filteredPokemons = allPokemons.filter((a) => a.name.toLowerCase().includes(query) || a.id == parseInt(query));

    offset = 0;
    currentPage = 1;

    updatePageProgress();

    clearCardsFromDOM();
    displayFilteredList();
});

PAGE_LIMIT_SELECT.addEventListener(`change`, () => {
    offset = 0;
    currentPage = 1;

    let oldSize = pageLimitSize;
    updateListSize();

    updatePageProgress();

    if (pageLimitSize < oldSize) {
        let pokemonArray = allPokemons;
        for (let i = pokemonArray.length - 1; i >= pageLimitSize; i--) {
            pokemonArray[i].card.remove();
        }
    }

    displayFilteredList();
    scrollTop(SUB_BODY);
});

PAGE_BACK_BTN.addEventListener(`click`, async() => {
    if (currentPage - 1 <= 0) return;
    currentPage--;
    updatePageProgress();

    offset = offset - pageLimitSize < 0 ? 0 : offset - pageLimitSize;
    clearCardsFromDOM();
    displayFilteredList();
});
PAGE_FORWARD_BTN.addEventListener(`click`, async() => {
    if (currentPage + 1 > totPages) return;
    currentPage++;

    updatePageProgress();

    offset += pageLimitSize;
    clearCardsFromDOM();
    displayFilteredList();
});

POKEMON_VERSION_SELECT.addEventListener(`change`, () => {
    version_type = versionSelect.selectedOptions[0].innerHTML;
    SEARCHBAR_INPUT.value = "";

    clearCardsFromDOM();
    allPokemons = [];
    filteredPokemons = [];
    preloadPokemons(version_type);
    scrollTop(SUB_BODY);
});

window.addEventListener(`click`, (ev) => {
    let target = ev.target;

    if (target == ZOOMED_CARD_CONTAINER) ZOOMED_CARD_CONTAINER.setAttribute(`data-card`, false);
});

/**
 *
 * @param {Boolean} bool -> True: can scroll ; False can't
 */
function toggleScroll(bool) {
    document.body.classList.toggle(`no-overflow`, !bool);
}

function scrollTop(el) {
    el.scrollTo({ top: 0, behaviour: `smooth` });
}