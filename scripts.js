document.getElementById("uploadButton").addEventListener("click", function () {
    uploadFile();
});

document.getElementById("compareButton").addEventListener("click", function () {
    compareFiles();
});


function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = event => resolve(event.target.result);
        fileReader.onerror = error => reject(error);
        fileReader.readAsText(file);
    });
}

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Veuillez choisir un fichier à télécharger.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const actionSelect = document.getElementById("actionSelect");
    const selectedAction = actionSelect.value;

    const apiUrl = selectedAction === "upload_clean" ?
        "http://localhost:8000/task/upload_clean" :
        "http://localhost:8000/task/clean_file";

    document.getElementById("loadingSpinner").style.display = "inline-block";

    fetch(apiUrl, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("loadingSpinner").style.display = "none";

            if (data.status === 200) {
                console.log("API response:", data.response);
                const resultList = document.getElementById("apiResponse");
                const downloadButton = document.getElementById("downloadButton");

                resultList.innerHTML = "";

                const list = document.createElement("ol");

                if (selectedAction === "upload_clean") {
                    data.response.forEach((item) => {
                        const terms = item.split('\n');
                        terms.forEach((term) => {
                            const listItem = document.createElement("li");
                            listItem.textContent = term;
                            list.appendChild(listItem);
                        });
                    });
                } else if (selectedAction === "clean_file") {
                    const cleanedTerms = data.response.cleaned_terms;
                    console.log("Cleaned terms:", cleanedTerms);

                    cleanedTerms.forEach((term) => {
                        console.log("Adding term:", term);
                        const listItem = document.createElement("li");
                        listItem.textContent = term;
                        list.appendChild(listItem);
                    });
                }
                downloadButton.classList.remove("btn-disabled");
                resultList.appendChild(list);
            } else {
                alert("Une erreur s'est produite lors de l'envoi du fichier.");
            }
        })
        .catch((error) => {
            document.getElementById("loadingSpinner").style.display = "none";
            console.error("Erreur lors de l'envoi du fichier :", error);
        });

    document.getElementById("downloadButton").addEventListener("click", downloadResult);

    function downloadResult() {
        const resultList = document.getElementById("apiResponse");
        const terms = Array.from(resultList.getElementsByTagName("li")).map(li => li.textContent);
        const termsText = terms.join('\n');

        const blob = new Blob([termsText], {type: 'text/plain;charset=utf-8'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'result.txt';
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

function compareFiles() {
    const resultFileInput = document.getElementById("compareFileInput1"); // Modification ici
    const compareFileInput = document.getElementById("compareFileInput2"); // Modification ici

    if (!resultFileInput.files[0] || !compareFileInput.files[0]) {
        alert("Veuillez sélectionner les deux fichiers à comparer.");
        return;
    }

    Promise.all([
        readFileContent(resultFileInput.files[0]),
        readFileContent(compareFileInput.files[0]),
    ]).then(([resultFileContent, compareFileContent]) => {
        displayComparisonResults(resultFileContent, compareFileContent);
    }).catch((error) => {
        console.error("Erreur lors de la lecture des fichiers :", error);
        alert("Une erreur s'est produite lors de la lecture des fichiers. Veuillez réessayer.");
    });
}

function displayComparisonResults(resultFileContent, compareFileContent) {
    const resultLines = resultFileContent.split('\n');
    const compareLines = compareFileContent.split('\n');

    const resultContainer = document.getElementById("comparisonResult");
    resultContainer.classList.remove('hidden')
    resultContainer.innerHTML = "";

    const list = document.createElement("ul");

    resultLines.forEach((line, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = line;

        if (line !== compareLines[index]) {
            listItem.style.color = "red";
        }

        list.appendChild(listItem);
    });

    resultContainer.appendChild(list);
}


