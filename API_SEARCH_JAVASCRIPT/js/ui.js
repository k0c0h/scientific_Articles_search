class DateFormatter {
    static format(date) {
        if (!date) return "No date";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric"
        });
    }
}

class TableRenderer {
    constructor(element, onRowClick) {
        this.element = element;
        this.onRowClick = onRowClick;
    }

    highlight(text, query) {
        if (!query) return text;
        return text.replace(new RegExp(`(${query})`, "gi"), "<mark>$1</mark>");
    }

    render(data, query) {
        this.element.innerHTML = "";

        if (!data.length) {
            this.element.innerHTML = `
                <tr><td colspan="4" class="text-center">No results</td></tr>`;
            return;
        }

        data.forEach(doc => {
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";

            tr.innerHTML = `
                <td>
                    ${this.highlight(doc.title_display || "No title", query)}
                    <br>
                    ${doc.article_type ? `<span class="badge bg-info">${doc.article_type}</span>` : ""}
                </td>
                <td>${doc.author_display?.join(", ") || "No authors"}</td>
                <td>${DateFormatter.format(doc.publication_date)}</td>
                <td>
                    ${doc.id
                        ? `<a href="https://doi.org/${doc.id}" target="_blank"
                             onclick="event.stopPropagation()">${doc.id}</a>`
                        : "No DOI"}
                </td>
            `;

            tr.addEventListener("click", () => this.onRowClick(doc));
            this.element.appendChild(tr);
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
