from flask import Flask, request, jsonify
import openai
import os
import nltk
from nltk.tokenize import sent_tokenize

nltk.download("punkt")

app = Flask(__name__)

os.environ["OPENAI_API_KEY"] = "023660028984431ba43b6df026a3170f"


def split_text(text, chunk_size):
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = []
    words = text.split(" ")

    for word in words:
        current_chunk.append(word)
        if len(current_chunk) == chunk_size:
            
        if len(current_chunk) + len(sentence.split()) <= chunk_size:
            current_chunk.append(sentence)
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part in the request', 400

    file = request.files['file']

    if file.filename == '':
        return 'No file selected for uploading', 400

    save_path = os.path.join('./tmp', file.filename)
    file.save(save_path)
    print_content(save_path)

    return 'File uploaded and saved successfully', 200


def print_content(file_path):
    with open(file_path, 'r') as f:
        file_content = f.read()
        # print('File content:')
        # print(file_content)

    openai.api_type = "azure"
    openai.api_base = "https://z-openai-openai4is-dev-frc.openai.azure.com/"
    openai.api_version = "2023-03-15-preview"
    openai.api_key = os.getenv("OPENAI_API_KEY")

    chunk_size = 1000
    text_chunks = split_text(file_content, chunk_size)

    gpt_responses = []



    for i, chunk in enumerate(text_chunks):
        print("********************************************")
        print(len(chunk))
        print(chunk[:3])
        if len(chunk) < 1005:
            response = openai.ChatCompletion.create(
                engine="GPT-4",
                messages=[
                    {
                        "role": "user",
                        "content": f"Voici le contenu du fichier (partie {i + 1}):"
                    },
                    {
                        "role": "user",
                        "content": chunk
                    },
                    {
                        "role": "user",
                        "content": "Liste de termes et occurrences, nettoyer bruit, termes inutiles ou non pertinents."
                    }
                ],
                temperature=0.7,
                max_tokens=100,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None
            )

        gpt_responses.append(response.choices[0]['message']['content'])

    print("Réponses GPT pour chaque morceau :")
    for i, response in enumerate(gpt_responses):
        print(f"Réponse {i + 1}:")
        print(response)
        print()


if __name__ == '__main__':
    app.run(host="localhost", port=8000)
