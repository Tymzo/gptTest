import openai
import os
import  time
os.environ["REQUESTS_CA_BUNDLE"] = 'C:\\Users\\antonije\\Downloads\\ITU_Root_Authority.crt'
os.environ["SSL_CERT_FILE"] = 'C:\\Users\\antonije\\Downloads\\ITU_Root_Authority.crt'
os.environ["OPENAI_API_KEY"] = "023660028984431ba43b6df026a3170f"

openai.api_type = "azure"
openai.api_base = "https://z-openai-openai4is-dev-frc.openai.azure.com/"
openai.api_version = "2023-03-15-preview"
openai.api_key = os.getenv("OPENAI_API_KEY")
all_terms = []
def clear_and_extract_chunk_from_raw(chunk):
    # Replace this with the function you want to send the chunks to
    # Call the prompt here
    response = openai.ChatCompletion.create(
        engine="GPT-4",
        messages=[
            {
                "role": "system",
                "content": f"You are a professional terminologist. Your job is to extract important terms from a"
                           f" given text. limit yourself to 5 terms per a given text"
                           f"Make sure to return them as a list of terms without numbering them."
            },
            {
                "role": "user",
                "content": chunk
            }
        ],
        temperature=0.7,
        max_tokens=2000,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None
    )
    cleaned_response = response.choices[0]['message']['content'].replace('\n', '').split('. ')[1:]
    cleaned_terms = [term.strip() for term in cleaned_response]
    print(cleaned_terms)
    all_terms.append(cleaned_terms)
    #clean_list_of_terms(cleaned_response)


def clean_list_of_terms(list):
    # Call second prompt
    print(list)
    #save to text
def read_and_process_files(file_list):
    for file_path in file_list:
        with open(file_path, 'r') as file:
            text = file.read()
            words = text.split()
            chunks = [words[i:i + 500] for i in range(0, len(words), 500)]

            for chunk in chunks:
                print(chunk)
                clear_and_extract_chunk_from_raw(" ".join(chunk))
                time.sleep(15)

files_list = ["tmp/D18-TDAG24-C-0002!!MSW-E.txt"]
read_and_process_files(files_list)
clean_list_of_terms(all_terms)