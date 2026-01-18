class App {
    constructor() {
        this.input = document.getElementById("searchInput");
        this.button = document.getElementById("searchBtn");
        this.loading = document.getElementById("loading");
        this.error = document.getElementById("errorMessage");

        this.sort = "newest";
        this.typeFilter = "all";

        this.yearFrom = document.getElementById("yearFrom");
        this.yearTo = document.getElementById("yearTo");

        this.typeFilterSelect = document.getElementById("typeFilter");

        this.table = new TableRenderer(
            document.getElementById("resultsTable"),
            doc => this.openDetail(doc) 
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

        document.getElementById("sortSelect").addEventListener("change", e => {
            this.sort = e.target.value;
            this.currentPage = 1;
            this.update();
        });

        this.typeFilterSelect.addEventListener("change", e => {
            this.typeFilter = e.target.value;
            this.currentPage = 1;
            this.update();
        });

        this.yearFrom.addEventListener("change", () => {
            this.currentPage = 1;
            this.update();
        });

        this.yearTo.addEventListener("change", () => {
            this.currentPage = 1;
            this.update();
        });

        document.getElementById("exportBtn")
            .addEventListener("click", () => this.exportCSV());
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

            this.populateArticleTypes();
            this.update();
        } catch (error) {
            this.showError(true, error.message);
        } finally {
            this.showLoading(false);
        }
    }

    update() {
        let filteredData = [...this.data];

        if (this.typeFilter !== "all") {
            filteredData = filteredData.filter(
                doc => doc.article_type === this.typeFilter
            );
        }

        const from = parseInt(this.yearFrom.value);
        const to = parseInt(this.yearTo.value);

        filteredData = filteredData.filter(doc => {
            if (!doc.publication_date) return false;
            const year = new Date(doc.publication_date).getFullYear();

            if (from && year < from) return false;
            if (to && year > to) return false;

            return true;
        });

        const total = filteredData.length;

        document.getElementById("resultsCount").textContent =
            total === 0
                ? "No articles found"
                : `Found ${total} articles`;

        filteredData.sort((a, b) => {
            const dA = new Date(a.publication_date || 0);
            const dB = new Date(b.publication_date || 0);
            return this.sort === "oldest" ? dA - dB : dB - dA;
        });

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;

        this.table.render(
            filteredData.slice(start, end),
            this.input.value
        );

        this.pagination.render(
            Math.ceil(total / this.itemsPerPage),
            this.currentPage
        );
    }

    changePage(page) {
        this.currentPage = page;
        this.update();
    }

    openDetail(doc) {
        const modal = document.getElementById("detailModal");
        const body = modal.querySelector(".modal-body");

        body.innerHTML = `
            <h5>${doc.title_display || "No title"}</h5>
            <p><strong>Authors:</strong> ${(doc.author_display || []).join(", ")}</p>
            <p><strong>Publication date:</strong> ${doc.publication_date || "N/A"}</p>
            <p><strong>Article type:</strong> ${doc.article_type || "N/A"}</p>
            <p><strong>Abstract:</strong></p>
            <p>${(doc.abstract || []).join(" ") || "No abstract available"}</p>
            <a href="https://doi.org/${doc.id}" target="_blank">
                View full article
            </a>
        `;

        new bootstrap.Modal(modal).show();
    }

    exportCSV() {
        if (!this.data.length) return;

        const rows = [
            ["Title", "Authors", "Publication Date", "Article Type", "DOI"],
            ...this.data.map(doc => [
                doc.title_display || "",
                (doc.author_display || []).join("; "),
                doc.publication_date || "",
                doc.article_type || "",
                doc.id || ""
            ])
        ];

        const csv = rows.map(r =>
            r.map(v => `"${v}"`).join(",")
        ).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "articles.csv";
        a.click();

        URL.revokeObjectURL(url);
    }

    populateArticleTypes() {
        const types = [...new Set(
            this.data.map(d => d.article_type).filter(Boolean)
        )];

        this.typeFilterSelect.innerHTML =
            `<option value="all">All article types</option>` +
            types.map(t =>
                `<option value="${t}">${t}</option>`
            ).join("");
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
