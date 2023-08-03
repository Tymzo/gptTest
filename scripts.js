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
        .then((response) => {
            if (response.headers.get("Content-Type") === "application/json") {
                return response.json();
            } else {
                throw new Error("La réponse de l'API n'est pas au format JSON");
            }
        })
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
    const resultFileInput = document.getElementById("compareFileInput1");
    const compareFileInput = document.getElementById("compareFileInput2");

    if (!resultFileInput.files[0] || !compareFileInput.files[0]) {
        alert("Veuillez choisir les deux fichiers à comparer.");
        return;
    }

    Promise.all([
        readFileContent(resultFileInput.files[0]),
        readFileContent(compareFileInput.files[0]),
    ])
        .then(([resultContent, compareContent]) => {
            const resultTerms = resultContent.split("\n");
            const compareTerms = compareContent.split("\n");

            const resultList = document.getElementById("comparaisonResult");
            resultList.innerHTML = "";

            const list = document.createElement("ol");

            let matchingTerms = 0;

            resultTerms.forEach((term) => {
                const listItem = document.createElement("li");
                listItem.textContent = term;

                if (compareTerms.includes(term)) {
                    listItem.style.color = "green";
                    matchingTerms += 1;
                } else {
                    listItem.style.color = "red";
                }

                list.appendChild(listItem);
            });

            resultList.appendChild(list);

            const similarityPercentage = (matchingTerms / resultTerms.length) * 100;
            const similarityDisplay = document.createElement("h2");
            similarityDisplay.textContent = `Pourcentage de similitude : ${similarityPercentage.toFixed(2)}%`;
            resultList.appendChild(similarityDisplay);
        })
        .catch((error) => {
            console.error("Erreur lors de la lecture des fichiers :", error);
        });
}

