document.getElementById("uploadButton").addEventListener("click", uploadFile);

function uploadFile() {
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

    // Modifiez l'URL en fonction de l'action sélectionnée
    const apiUrl = selectedAction === "upload_clean" ?
        "http://localhost:8000/task/upload_clean" :
        "http://localhost:8000/task/clean_file";

    fetch(apiUrl, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 200) {
                console.log(data.response);
                const resultList = document.getElementById("apiResponse");
                resultList.innerHTML = ""; // Efface le contenu précédent

                const list = document.createElement("ul");

                if (selectedAction === "upload_clean") {
                    // Traitez la réponse pour l'action upload_clean
                    data.response.forEach((item) => {
                        const terms = item.split('\n');
                        terms.forEach((term) => {
                            const listItem = document.createElement("li");
                            listItem.textContent = term;
                            list.appendChild(listItem);
                        });
                    });
                } else if (selectedAction === "clean_file") {
                    // Traitez la réponse pour l'action clean_file
                    const cleanedTerms = data.response.cleaned_terms;
                    cleanedTerms.forEach((term) => {
                        const listItem = document.createElement("li");
                        listItem.textContent = term;
                        list.appendChild(listItem);
                    });
                }

                resultList.appendChild(list);
            } else {
                alert("Une erreur s'est produite lors de l'envoi du fichier.");
            }
        });
}
