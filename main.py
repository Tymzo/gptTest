from flask import Flask, request, jsonify
import openai
import os
import nltk
from nltk.tokenize import sent_tokenize

nltk.download("punkt")

app = Flask(__name__)

os.environ["OPENAI_API_KEY"] = "023660028984431ba43b6df026a3170f"

openai.api_type = "azure"
openai.api_base = "https://z-openai-openai4is-dev-frc.openai.azure.com/"
openai.api_version = "2023-03-15-preview"
openai.api_key = os.getenv("OPENAI_API_KEY")


@app.route('/task/<action>', methods=['POST'])
def upload_file(action):
    if 'file' not in request.files:
        return 'No file part in the request', 400

    file = request.files['file']

    if file.filename == '':
        return 'No file selected for uploading', 400

    save_path = os.path.join('./tmp', file.filename)
    file.save(save_path)

    res = upload_clean(save_path)
    res_clean_file = clean_file(res)

    if action == 'upload_clean':
        return res
    elif action == 'clean_file':
        return res_clean_file
    else:
        return "Action not found", 404


def split_text(text, chunk_size):
    words = text.split()
    print(len(words))
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = ' '.join(words[i: i + chunk_size])
        chunks.append(chunk)

    return chunks


def upload_clean(file_path):
    with open(file_path, 'r', encoding='ISO-8859-1') as f:
        file_content = f.read()

    chunk_size = 1000
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
    gpt_responses = []
    to_clean = '\n'.join(response)
    response = openai.ChatCompletion.create(
        engine="GPT-4",
        messages=[
            {
                "role": "system",
                "content": f"You are a professional terminologist. Your job is to clean a list of terms keeping "
                           f"only essential and important terms from a given list of terms"
                           f"Make sure to return them as a list of terms highly sophisticated"
            },
            {
                "role": "user",
                "content": to_clean
            }
        ],
        temperature=0.6,
        max_tokens=300,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None
    )
    gpt_responses.append(response.choices[0]['message']['content'])
    return gpt_responses


if __name__ == '__main__':
    app.run(host="localhost", port=8000)
