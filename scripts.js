document.getElementById("uploadButton").addEventListener("click", function () {
    const fileInput = document.getElementById("fileInput");
    const files = fileInput.files;
    const actionSelect = document.getElementById("actionSelect");
    const selectedAction = actionSelect.value;

    if (files.length === 0) {
        alert("Veuillez choisir au moins un fichier à télécharger.");
        return;
    }

    const formData = new FormData();

    for (const file of files) {
        formData.append("files[]", file);
    }

    fetch(`http://localhost:8000/task/${selectedAction}`, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 200) {
                console.log(data.response);
                document.getElementById("apiResponse").textContent = JSON.stringify(data.response, null, 2);
            } else {
                alert("Une erreur s'est produite lors de l'envoi des fichiers.");
            }
        })
        .catch((error) => {
            console.error("Erreur :", error);
            alert("Une erreur s'est produite lors de l'envoi des fichiers.");
        });
});  
