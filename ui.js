export function renderStudents(records, container) {

    if (records.length === 0) {

        showNoData(container);

        return;
    }


    container.innerHTML = records.map(student => {

        return `
            <article class="record-card">

                <h3>${student.name}</h3>

                <p>
                    <strong>ID:</strong>
                    ${student.id}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${student.email}
                </p>

                <p>
                    <strong>Course:</strong>
                    ${student.course}
                </p>

                <p>
                    <strong>Year:</strong>
                    ${student.year}
                </p>

                <p>
                    <strong>City:</strong>
                    ${student.city}
                </p>

                <span class="badge">
                    Marks: ${student.marks}
                </span>

            </article>
        `;

    }).join("");
}

export function renderEvents(records, container) {

    if (records.length === 0) {

        showNoData(container);

        return;
    }


    container.innerHTML = records.map(event => {

        return `
            <article class="record-card">

                <h3>${event.title}</h3>

                <p>
                    <strong>Date:</strong>
                    ${formatDate(event.date)}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${event.category}
                </p>

                <p>
                    <strong>Venue:</strong>
                    ${event.venue}
                </p>

                <p>
                    <strong>Organizer:</strong>
                    ${event.organizer}
                </p>

                <span class="badge">
                    ${event.category}
                </span>

            </article>
        `;

    }).join("");
}

export function renderFAQs(records, container) {

    if (records.length === 0) {

        showNoData(container);

        return;
    }


    container.innerHTML = records.map(faq => {

        return `
            <article class="record-card faq-card">

                <h3 class="faq-question">
                    ${faq.question}
                </h3>

                <p class="faq-answer">
                    ${faq.answer}
                </p>

                <span class="badge">
                    ${faq.category}
                </span>

            </article>
        `;

    }).join("");
}

function showNoData(container) {

    container.innerHTML = `
        <div class="no-data">

            <h3>No records found</h3>

            <p>
                Try changing your search or filter.
            </p>

        </div>
    `;
}


function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}