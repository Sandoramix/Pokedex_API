/**Appends all filtered pokemons to card container */
async function displayFilteredList() {
    let limit = (currentPage - 1) * pageLimitSize + pageLimitSize;

    limit = limit < filteredPokemons.length ? limit : filteredPokemons.length;
    for (let i = offset; i < limit; i++) {
        CARDS_CONTAINER.append(filteredPokemons[i].card);
    }
}
/**Removes all cards from cards container */
function clearCardsFromDOM() {
    allPokemons.forEach((val) => {
        val.card.remove();
    });
}

/**
 *
 * @param {object} data
 * @param {boolean} isZoomed is the card zoomed [true], or it is from a list [false]
 * @returns {{name:string,id:number,card:HTMLElement}}
 */
function craftCardPart(data, isZoomed) {
    let name = data.name;
    name = name[0].toUpperCase() + name.substring(1, name.length);

    let id = isZoomed ? getIdByVersion(data.versions) : data.id;

    let card = CARD_TEMPLATE.content.cloneNode(true).children[0];

    let card_number = card.querySelector(`[card_number]`);
    card_number.textContent = id;
    let pokemon_name = card.querySelector(`[pokemon_name]`);
    pokemon_name.textContent = name;

    let img = card.querySelector(`[pokemon_image]`);
    img.setAttribute(`src`, isZoomed ? data.artwork : data.base_sprite);
    img.setAttribute(`alt`, `${name}'s image`);

    if (!isZoomed) {
        img.addEventListener(`mouseover`, () => {
            img.setAttribute(`src`, data.shiny_sprite);
        });
        img.addEventListener(`mouseout`, () => {
            img.setAttribute(`src`, data.base_sprite);
        });
        card.addEventListener(`click`, () => cardZoom(name.toLowerCase()));
    }
    return { name, id, card };
}

/** Zoom clicked card
 * @param {string} name pokemon's name
 */
function cardZoom(name) {
    ZOOMED_CARD_CONTAINER.innerHTML = "";
    let selectedPokemon = fetchedPokemons.get(name);
    if (!selectedPokemon) return;

    let res = craftCardPart(selectedPokemon, true);

    let card = res.card;
    card.setAttribute(`card`, `zoomed`);

    ZOOMED_CARD_CONTAINER.append(card);
    ZOOMED_CARD_CONTAINER.setAttribute(`data-card`, true);
}

/**
 * Preloads all pokemons' data
 * &
 * updates + sorts current version's pokemon list
 */
async function preloadPokemons() {
    for (let i = 0; i < pokemonLinks.length - 1; i++) {
        PAGE_LOADING_OVERLAY.classList.toggle(`disabled`, false);
        toggleScroll(false);

        let name = pokemonLinks[i].name;

        if (fetchedPokemons.has(name)) {
            let selectedPokemon = fetchedPokemons.get(name);

            let id = getIdByVersion(selectedPokemon.versions, version_type);
            if (id === null) continue;
            let data = craftBaseCardData(selectedPokemon, version_type);
            if (!data) continue;

            allPokemons.push(craftCardPart(data));
            allPokemons.sort((a, b) => {
                return a.id - b.id;
            });
            preloadUpdate();
            continue;
        }

        fetch_get(pokemonLinks[i].url)
            .then(async(res) => {
                let name = res.name;
                name = name[0].toUpperCase() + name.substring(1, name.length);
                let full_info = {
                    name,
                    versions: res.game_indices,
                    base_sprite: res.sprites.front_default,
                    shiny_sprite: res.sprites.front_shiny,
                    artwork: res.sprites.other[`official-artwork`].front_default,
                };
                fetchedPokemons.set(res.name, full_info);

                let data = craftBaseCardData(full_info, version_type);
                if (data == null) return;
                allPokemons.push(craftCardPart(data));
                allPokemons.sort((a, b) => {
                    return a.id - b.id;
                });
            })
            .then(async() => {
                preloadUpdate();
            });
    }
}
/**
 * Various updates and resetting the preload ending debounce
 */
function preloadUpdate() {
    updatePageProgress();
    filteredPokemons = allPokemons;

    clearCardsFromDOM();
    displayFilteredList();

    clearTimeout(preloadEnded_timeout);
    preloadEnded_timeout = setTimeout(endedPreloading, 500);
}

/** Get pokemon's id by selected version
 *
 * @param {object[]} game_versions
 * @returns {(number|null)}
 */
function getIdByVersion(game_versions) {
    let indices = game_versions.filter((a) => a.version.name === version_type);
    if (indices.length === 0) return null;
    let id = indices[0].game_index;
    return id;
}
/**
 *
 * @param {object} full_info
 * @returns {{id:number,name:string,base_sprite:string,shiny_sprite:string}}
 */
function craftBaseCardData(full_info) {
    let id = getIdByVersion(full_info.versions, version_type);
    if (id === null) return null;

    let data = {
        id,
        name: full_info.name,
        base_sprite: full_info.base_sprite,
        shiny_sprite: full_info.shiny_sprite,
    };

    return data;
}

/** Runs when the preload is finished */
function endedPreloading() {
    PAGE_LOADING_OVERLAY.classList.toggle(`disabled`, true);
    toggleScroll(true);
}