class DateFormatter {
    static format(dateString) {
        if (!dateString) return "No date available";

        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

class TableRenderer {
    constructor(element) {
        this.element = element;
    }

    render(data) {
        this.element.innerHTML = "";

        if (!data.length) {
            this.element.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        No results found
                    </td>
                </tr>`;
            return;
        }

        data.forEach(doc => {
            const title = doc.title_display || "No title available";

            const authors = doc.author_display?.join(", ")
                || "No authors available";

            const publicationDate = DateFormatter.format(doc.publication_date);

            const doi = doc.id
                ? `<a href="https://doi.org/${doc.id}" target="_blank">
                        ${doc.id}
                   </a>`
                : "No DOI available";

            this.element.innerHTML += `
                <tr>
                    <td>${title}</td>
                    <td>${authors}</td>
                    <td>${publicationDate}</td>
                    <td>${doi}</td>
                </tr>`;
        });
    }
}

class Pagination {
    constructor(element, onPageChange) {
        this.element = element;
        this.onPageChange = onPageChange;
    }

    render(totalPages, currentPage) {
        this.element.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            this.element.innerHTML += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <button class="page-link">${i}</button>
                </li>`;
        }

        [...this.element.children].forEach((li, index) => {
            li.addEventListener("click", () =>
                this.onPageChange(index + 1)
            );
        });
    }
}
