export async function fetchJSON(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Unable to load data. HTTP Status: ${response.status}`
        );
    }

    const data = await response.json();
    return data;
}