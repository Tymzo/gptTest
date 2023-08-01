document.getElementById("uploadButton").addEventListener("click", uploadFile);
// document.getElementById("compareButton").addEventListener("click", compareDocuments);

function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = event => resolve(event.target.result);
        fileReader.onerror = error => reject(error);
        fileReader.readAsText(file);
    });
}

function compareStrings(a, b) {
    return a.localeCompare(b);
}

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const actionSelect = document.getElementById("actionSelect");
    const selectedAction = actionSelect.value;

    if (!file) {
        alert("Veuillez choisir un fichier à télécharger.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = selectedAction === "upload_clean" ?
        "http://localhost:8000/task/upload_clean" :
        "http://localhost:8000/task/clean_file";

    // Affiche le spinner
    document.getElementById("loadingSpinner").style.display = "block";

    fetch(apiUrl, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            // Masque le spinner
            document.getElementById("loadingSpinner").style.display = "none";

            if (data.status === 200) {
                console.log("API response:", data.response);
                const resultList = document.getElementById("apiResponse");
                resultList.innerHTML = ""; // Efface le contenu précédent

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

                resultList.appendChild(list);
            } else {
                alert("Une erreur s'est produite lors de l'envoi du fichier.");
            }
        })
        .catch((error) => {
            // Masque le spinner en cas d'erreur
            document.getElementById("loadingSpinner").style.display = "none";
            console.error("Erreur lors de l'envoi du fichier :", error);
        });

    document.getElementById("downloadButton").addEventListener("click", downloadResult);

    function downloadResult() {
        const resultList = document.getElementById("apiResponse");
        const terms = Array.from(resultList.getElementsByTagName("li")).map(li => li.textContent);
        const termsText = terms.join('\n');

        const blob = new Blob([termsText], { type: 'text/plain;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'result.txt';
        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}


// async function compareDocuments() {
//     const fileInput = document.getElementById("fileInput");
//     const file = fileInput.files[0];
//
//     const compareFileInput = document.getElementById("compareFileInput");
//     const compareFile = compareFileInput.files[0];
//
//     if (!file || !compareFile) {
//         alert("Veuillez choisir les deux fichiers à comparer.");
//         return;
//     }
//
//     const fileContent = await readFileContent(file);
//     const compareFileContent = await readFileContent(compareFile);
//
//     const comparisonResult = compareStrings(fileContent, compareFileContent);
//     console.log("Résultat de la comparaison :", comparisonResult);
//
//     const apiResponse = document.getElementById("apiResponse");
//     apiResponse.textContent = "Résultat de la comparaison : " + comparisonResult;
// }
