# PDF → chunks → embeddings → ChromaDB
from pathlib import Path
import sys

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

def ingest_pdf(file_path):
     # 1. Load
    loader = PyPDFLoader(file_path)
    doc = loader.load()
    len(doc)
    print(f"Loaded {len(doc)} pages")


    # 2. Split
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_documents(doc)
    print(len(chunks))
    if chunks:
        print(chunks[0].metadata)

    if not chunks:
        raise ValueError("No text found in this PDF.")


    # Vector Embeddings” and “Vector DB” part
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"  )

    vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory=str(BASE_DIR / "chroma_db"),
    )
    print(vectorstore._collection.count())


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python ingest.py <pdf-path>")
    ingest_pdf(sys.argv[1])

