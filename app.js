import { fetchJSON
} from "./api.js";

import {
    renderStudents,
    renderEvents,
    renderFAQs
} from "./ui.js";

const dataContainer =
    document.getElementById("dataContainer");


const searchInput =
    document.getElementById("searchInput");


const filterSelect =
    document.getElementById("filterSelect");


const sortSelect =
    document.getElementById("sortSelect");


const resetBtn =
    document.getElementById("resetBtn");


const loadingMessage =
    document.getElementById("loadingMessage");


const errorMessage =
    document.getElementById("errorMessage");


const successMessage =
    document.getElementById("successMessage");


const currentData =
    document.getElementById("currentData");


const totalRecords =
    document.getElementById("totalRecords");


const displayedRecords =
    document.getElementById("displayedRecords");


const previousBtn =
    document.getElementById("previousBtn");


const nextBtn =
    document.getElementById("nextBtn");


const pageNumbers =
    document.getElementById("pageNumbers");


const dataButtons =
    document.querySelectorAll(".data-btn");


let currentType = "students";

let allRecords = [];

let filteredRecords = [];

let currentPage = 1;

const recordsPerPage = 6;


const dataFiles = {

    students: "data/students.json",

    events: "data/events.json",

    faqs: "data/faqs.json"
};


async function loadData(type) {

    try {

        showLoading();


        hideError();


        const data =
            await fetchJSON(dataFiles[type
        ]);


        allRecords = data;


        currentPage = 1;

        updateFilterOptions();


        processRecords();



        showSuccess(
            `${data.length
        } records loaded successfully.`
        );
    }

    catch (error) {

        console.error(error);


        allRecords = [];

        filteredRecords = [];


        showError(
            "Unable to load JSON data. " +
            "Please check the file path or run the project using Live Server."
        );


        dataContainer.innerHTML = "";


        updateInformation();

        updatePagination();
    }

    finally {

        hideLoading();
    }
}


function processRecords() {

    let records = [...allRecords
    ];

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    if (searchValue !== "") {

        records = records.filter(record => {

            return Object.values(record)
                .some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(searchValue)
                );
        });
    }


    const filterValue =
        filterSelect.value;


    if (
        filterValue !== "all" &&
        filterValue !== ""
    ) {

        records = records.filter(record => {

            return getFilterValue(record)
                === filterValue;
        });
    }

    const sortValue =
        sortSelect.value;


    if (sortValue === "asc") {

        records.sort((a, b) => {

            return getSortValue(a)
                .localeCompare(
                    getSortValue(b)
                );
        });
    }


    if (sortValue === "desc") {

        records.sort((a, b) => {

            return getSortValue(b)
                .localeCompare(
                    getSortValue(a)
                );
        });
    }

    filteredRecords = records;


    const totalPages =
        Math.ceil(
            filteredRecords.length /
            recordsPerPage
        );


    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {

        currentPage = totalPages;
    }



    renderCurrentPage();


    updateInformation();


    updatePagination();
}

function getFilterValue(record) {

    if (currentType === "students") {

        return record.course;
    }


    if (currentType === "events") {

        return record.category;
    }


    if (currentType === "faqs") {

        return record.category;
    }


    return "";
}
function getSortValue(record) {

    if (currentType === "students") {

        return record.name;
    }


    if (currentType === "events") {

        return record.title;
    }


    if (currentType === "faqs") {

        return record.question;
    }


    return "";
}

function updateFilterOptions() {

    filterSelect.innerHTML = `
        <option value="all">
            All Records
        </option>
    `;


    const values =
        allRecords.map(record =>
            getFilterValue(record)
        );


    const uniqueValues =
        [...new Set(values)
    ]
            .filter(value => value);


    uniqueValues.sort();


    uniqueValues.forEach(value => {

        const option =
            document.createElement("option");


        option.value = value;

        option.textContent = value;


        filterSelect.appendChild(option);
    });
}

function renderCurrentPage() {

    const startIndex =
        (currentPage - 1) *
        recordsPerPage;


    const endIndex =
        startIndex +
        recordsPerPage;


    const pageRecords =
        filteredRecords.slice(
            startIndex,
            endIndex
        );


    if (currentType === "students") {

        renderStudents(
            pageRecords,
            dataContainer
        );
    }


    else if (currentType === "events") {

        renderEvents(
            pageRecords,
            dataContainer
        );
    }


    else if (currentType === "faqs") {

        renderFAQs(
            pageRecords,
            dataContainer
        );
    }
}


function updatePagination() {

    const totalPages =
        Math.ceil(
            filteredRecords.length /
            recordsPerPage
        );


    pageNumbers.innerHTML = "";


    previousBtn.disabled =
        currentPage === 1 ||
        totalPages === 0;


    nextBtn.disabled =
        currentPage === totalPages ||
        totalPages === 0;


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement("button");


        button.className =
            "page-number";


        button.textContent = page;


        if (page === currentPage) {

            button.classList.add("active");
        }


        button.addEventListener(
            "click",
            () => {

                currentPage = page;

                renderCurrentPage();

                updatePagination();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
            });
        }
        );


        pageNumbers.appendChild(button);
    }
}


previousBtn.addEventListener(
    "click",
    () => {

        if (currentPage > 1) {

            currentPage--;

            renderCurrentPage();

            updatePagination();
    }
}
);


nextBtn.addEventListener(
    "click",
    () => {

        const totalPages =
            Math.ceil(
                filteredRecords.length /
                recordsPerPage
            );


        if (currentPage < totalPages) {

            currentPage++;

            renderCurrentPage();

            updatePagination();
    }
}
);

searchInput.addEventListener(
    "input",
    () => {

        currentPage = 1;

        processRecords();
}
);


filterSelect.addEventListener(
    "change",
    () => {

        currentPage = 1;

        processRecords();
}
);


sortSelect.addEventListener(
    "change",
    () => {

        currentPage = 1;

        processRecords();
}
);


resetBtn.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        filterSelect.value = "all";

        sortSelect.value = "default";

        currentPage = 1;

        processRecords();
}
);

dataButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {


            dataButtons.forEach(btn => {

                btn.classList.remove("active");
        });

            button.classList.add("active");
            currentType =
                button.dataset.type;
            currentData.textContent =
                capitalize(currentType);
            searchInput.value = "";
            sortSelect.value = "default";
            loadData(currentType);
    }
    );
});


function updateInformation() {

    totalRecords.textContent =
        allRecords.length;


    displayedRecords.textContent =
        filteredRecords.length;
}


function showLoading() {

    loadingMessage.style.display =
        "block";
}

function hideLoading() {

    loadingMessage.style.display =
        "none";
}

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";
}


function hideError() {

    errorMessage.style.display =
        "none";
}


function showSuccess(message) {

    successMessage.textContent =
        message;

    successMessage.style.display =
        "block";


    setTimeout(() => {

        successMessage.style.display =
            "none";
    },
    2500);
}

function capitalize(text) {

    return text.charAt(0).toUpperCase()
        + text.slice(1);
}
loadData("students");