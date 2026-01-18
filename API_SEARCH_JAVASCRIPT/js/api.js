class PlosService {
    static BASE_URL = "https://api.plos.org/search?q=title:";

    static async search(query) {
        const response = await fetch(
            `${this.BASE_URL}${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Error while fetching data from PLOS API");
        }

        return response.json();
    }
}
