# question → retrieval → LLM → answer
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from ingest import embeddings


load_dotenv()


llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You answer questions using ONLY the context below.\n"
     "If the context does not contain the answer, reply exactly: CANNOT_ANSWER\n"
     "Mention the page number(s) you used.\n\n"
     "Context:\n{context}"),
    ("human", "{question}"),
])

chain = prompt| llm | StrOutputParser()



def ask(question):
    # Open the saved database (inside the function, so it always sees the latest PDF)
    vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embeddings)
    results = vectorstore.similarity_search_with_score(question, k=3)

    if not results:
        return "Please upload a PDF first."

    # Build the context
    context = ""
    for doc, score in results:
        page = doc.metadata["page"] + 1
        context += f"[Page {page}] {doc.page_content}\n"

    return chain.invoke({"context": context, "question": question})