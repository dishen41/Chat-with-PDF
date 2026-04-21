import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# LangChain
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# =========================
# APP SETUP
# =========================
app = FastAPI()

@app.get("/")
def root():
    return {"status": "Online", "message": "Neural interface backend is active! Please return to your React app to interact."}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow frontend
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create folders
os.makedirs("temp", exist_ok=True)
os.makedirs("db", exist_ok=True)

# Initialize Embeddings globally to avoid cold starts on every request
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-small-en"
)

# =========================
# LOAD FILE (PDF / TXT)
# =========================
def load_documents(file_path):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext == ".txt":
        loader = TextLoader(file_path, encoding="utf-8")
    else:
        raise ValueError("Only PDF and TXT files allowed")

    return loader.load()

# =========================
# SPLIT TEXT INTO CHUNKS
# =========================
def split_documents(documents):
    splitter = CharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(documents)

# =========================
# CREATE VECTOR DATABASE
# =========================
def create_vector_store(chunks):
    db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="db/chroma_db"
    )

    return db

# =========================
# LOAD VECTOR DATABASE
# =========================
def load_vector_store():
    db = Chroma(
        persist_directory="db/chroma_db",
        embedding_function=embeddings
    )

    return db

# =========================
# API: UPLOAD FILE
# =========================
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file
        if not (file.filename.endswith(".pdf") or file.filename.endswith(".txt")):
            raise HTTPException(
                status_code=400,
                detail="Only PDF and TXT files are allowed"
            )

        # Save file
        file_path = f"temp/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process file
        documents = load_documents(file_path)
        chunks = split_documents(documents)
        create_vector_store(chunks)

        return {
            "message": "File uploaded and processed successfully ✅"
        }

    except Exception as e:
        return {"error": str(e)}

# =========================
# API: ASK QUESTION
# =========================
@app.post("/ask/")
async def ask_question(question: str = Form(...)):
    try:
        # Check if DB exists to prevent errors on empty state
        if not os.path.exists("db/chroma_db"):
            return {
                "answer": "❌ Error: No context loaded. Please upload a document first.",
                "chunks": []
            }

        # Load DB
        db = load_vector_store()

        # Retriever
        retriever = db.as_retriever(search_kwargs={"k": 3})

        # Get relevant chunks (invoke is standard in newer Langchain)
        docs = retriever.invoke(question)

        if not docs:
            return {
                "answer": "❌ No relevant answer found in uploaded document.",
                "chunks": []
            }

        chunks_list = [
            f"{doc.page_content}\n(Source: {os.path.basename(doc.metadata.get('source', 'Unknown'))})"
            for doc in docs
        ]

        # Combine chunk text
        context_text = "\n\n---\n\n".join(chunks_list)

        # Return retrieved context as answer and chunks for frontend display
        return {
            "answer": f"📄 Based on the uploaded documents, here are the most relevant context chunks:\n\n{context_text}",
            "chunks": chunks_list
        }

    except Exception as e:
        return {"error": str(e)}

        
    
