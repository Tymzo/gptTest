document.getElementById("uploadButton").addEventListener("click", function() {
    var selectedAction = document.getElementById("actionSelect").value;
    if (selectedAction === "upload_clean" || selectedAction === "clean_file") {
        uploadFile(selectedAction);
    }
});

document.getElementById("compareButton").addEventListener("click", compareFiles);

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

    document.getElementById("loadingSpinner").style.display = "block";

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
    const resultFileInput = document.getElementById("resultFileInput");
    const compareFileInput = document.getElementById("compareFileInput");

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
    // Créez un objet DiffMatchPatch
    var dmp = new diff_match_patch();

    // Calculez les différences entre les deux fichiers
    var diffs = dmp.diff_main(resultFileContent, compareFileContent);

    // Appliquez un surlignage en jaune pour les termes similaires
    dmp.diff_cleanupSemantic(diffs);

    // Générez le code HTML pour afficher les différences
    var html = dmp.diff_prettyHtml(diffs);

    // Insérez le code HTML dans les éléments <div> appropriés
    document.getElementById("file1").innerHTML = html;
}
