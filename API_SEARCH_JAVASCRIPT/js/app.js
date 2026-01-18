class App {
    constructor() {
        this.input = document.getElementById("searchInput");
        this.button = document.getElementById("searchBtn");
        this.loading = document.getElementById("loading");
        this.error = document.getElementById("errorMessage");

        this.table = new TableRenderer(
            document.getElementById("resultsTable")
        );

        this.pagination = new Pagination(
            document.getElementById("pagination"),
            page => this.changePage(page)
        );

        this.data = [];
        this.currentPage = 1;
        this.itemsPerPage = 5;

        this.initEvents();
    }

    initEvents() {
        this.button.addEventListener("click", () => this.search());
        this.input.addEventListener("keydown", e => {
            if (e.key === "Enter") this.search();
        });
    }

    async search() {
        const query = this.input.value.trim();
        if (!query) return;

        this.showLoading(true);
        this.showError(false);

        try {
            const result = await PlosService.search(query);
            this.data = result.response.docs || [];
            this.currentPage = 1;
            this.update();
        } catch (error) {
            this.showError(true, error.message);
        } finally {
            this.showLoading(false);
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.update();
    }

    update() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;

        this.table.render(this.data.slice(start, end));
        this.pagination.render(
            Math.ceil(this.data.length / this.itemsPerPage),
            this.currentPage
        );
    }

    showLoading(show) {
        this.loading.classList.toggle("d-none", !show);
    }

    showError(show, message = "") {
        this.error.textContent = message;
        this.error.classList.toggle("d-none", !show);
    }
}

new App();
