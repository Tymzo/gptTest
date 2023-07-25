from flask import Flask, request, jsonify
import openai
import os
import json

os.environ["REQUESTS_CA_BUNDLE"] = 'C:\\Users\\antonije\\Downloads\\ITU_Root_Authority.crt'
os.environ["SSL_CERT_FILE"] = 'C:\\Users\\antonije\\Downloads\\ITU_Root_Authority.crt'

app = Flask(__name__)

os.environ["OPENAI_API_KEY"] = "023660028984431ba43b6df026a3170f"

openai.api_type = "azure"
openai.api_base = "https://z-openai-openai4is-dev-frc.openai.azure.com/"
openai.api_version = "2023-03-15-preview"
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/task/<action>', methods=['POST'])
def upload_files(action):
    if 'file' not in request.files:
        return 'No file part in the request', 400

    files = request.files.getlist('file')
    results = []

    for file in files:
        if file.filename == '':
            return 'No file selected for uploading', 400

        save_path = os.path.join('./tmp', file.filename)
        file.save(save_path)

        res_upload_clean = upload_clean(save_path)
        res_clean_file = clean_file(res_upload_clean)

        if action == 'upload_clean':
            results.append(jsonify(response=res_upload_clean, status=200))
        elif action == 'clean_file':
            results.append(jsonify(response=res_clean_file, status=200))
        else:
            return "Action not found", 404

    return jsonify(results)


def split_text(text, chunk_size):
    words = text.split()
    print(len(words))
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i: i + chunk_size])
        chunks.append(chunk)

    return chunks


def upload_clean(file_path):
    with open(file_path, 'r', encoding='iso-8859-1') as f:
        file_content = f.read()

    chunk_size = 500
    text_chunks = split_text(file_content, chunk_size)

    gpt_responses = []
    for chunk in text_chunks:
        response = openai.ChatCompletion.create(
            engine="GPT-4",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a professional terminologist. Your job is to extract important terms from a"
                               f" given text. limit yourself to 5 terms per a given text"
                               f"Make sure to return them as a list of terms highly sophisticated"
                },
                {
                    "role": "user",
                    "content": chunk
                }
            ],
            temperature=0.6,
            max_tokens=50,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )
        gpt_responses.append(response.choices[0]['message']['content'])
    return gpt_responses


def clean_file(response):
    to_clean = '\n'.join(response)
    response = openai.ChatCompletion.create(
        engine="GPT-4",
        messages=[
            {
                "role": "system",
                "content": "You are a professional terminologist. Your job is to clean a list of terms keeping "
                           "only essential and important terms from a given list of terms"
                           "Make sure to return them as json format {'cleaned_terms': [term1, term2 ...]} to be parsed"
                           " in the frontend, limit yourself to 5 terms "
            },
            {
                "role": "user",
                "content": to_clean
            }
        ],
        temperature=0.6,
        max_tokens=100,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None
    )
    print(response.choices[0]['message']['content'])
    res = json.loads(response.choices[0]['message']['content'])
    return jsonify(response=res, status=200)


if __name__ == '__main__':
    app.run(host="localhost", port=8000)
