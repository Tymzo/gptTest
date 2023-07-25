function uploadFiles(event) {
    event.preventDefault();

    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);
    const endpointSelect = document.getElementById('endpointSelect');
    const selectedEndpoint = endpointSelect.value;

    fetch(`http://localhost:8000/task/${selectedEndpoint}`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            const resultElement = document.getElementById('result');

            // Access the 'response' property of the JSON object
            const responseObj = data.response;

            // Access the 'cleaned_terms' property of the responseObj
            const results = responseObj.cleaned_terms;

            // Convert the results array to a formatted JSON string
            const resultText = JSON.stringify(results, null, 2);
            resultElement.innerHTML = resultText;

            // Create a downloadable text file
            const textFileBlob = new Blob([resultText], {type: 'text/plain'});
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(textFileBlob);
            downloadLink.download = 'response.txt';
            downloadLink.textContent = 'Télécharger la réponse en format .txt';
            resultElement.appendChild(downloadLink);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
