const API = `https://pokeapi.co/api/v2/`;

const GET = {
    method: `GET`,
    redirect: `follow`,
};

const ENDPOINT = {
    POKEMON: `${API}pokemon`,
    POKE_FORM: `${API}pokemon-form`,
};

/**
 *
 * @param {string} link
 * @returns {Promise}
 */
async function fetch_get(link) {
    return fetch(link, GET).then(async(res) => {
        if (!res.ok) {
            return null;
        }
        return res.json();
    });
}