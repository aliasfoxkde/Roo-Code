Here’s a **concise yet comprehensive documentation guide** for integrating **Milvus Lite** as a default vector storage solution in your LLM-powered application (e.g., Roo Code for VS Code). The documentation covers installation, setup, core operations, and integration best practices, synthesized from the search results.

---

### **Milvus Lite Documentation for LLM Integration**
*A lightweight, locally runnable vector database for codebase indexing and knowledge retrieval*

#### **1. Overview**
Milvus Lite is an embedded version of the Milvus vector database, designed for **local prototyping, edge devices, and lightweight AI workflows**. It supports:
- **Vector CRUD operations** (insert, search, delete) .
- **Metadata filtering** and hybrid search (dense/sparse vectors) .
- **Persistent storage** via SQLite files (e.g., `./milvus_demo.db`) .
- **Seamless migration** to Milvus Standalone/Distributed for production .

**Ideal for**:
- VS Code extensions (e.g., codebase indexing).
- Retrieval-Augmented Generation (RAG) pipelines .

---

#### **2. Installation**
```bash
pip install -U pymilvus  # Installs Milvus Lite (included since v2.4.2)
```
**Prerequisites**:
- Python 3.7+ (verified on Ubuntu 20.04+, macOS ≥11.0) .
- No Docker or server setup required.

---

#### **3. Quickstart**
##### **Initialize Milvus Lite**
```python
from pymilvus import MilvusClient

# Persistent local storage (creates `./milvus_demo.db`)
client = MilvusClient("./milvus_demo.db")  # Default: no server needed
```

##### **Create a Collection**
```python
client.create_collection(
    collection_name="code_index",
    dimension=384,  # Match your embedding model (e.g., BGE-small: 384)
    # Optional: Enable dynamic schema for metadata (e.g., file paths, code snippets)
    enable_dynamic_field=True
)
```

##### **Insert Vectors**
```python
data = [
    {"id": 1, "vector": [0.1, 0.2, ...], "code": "def hello(): ...", "file": "src/main.py"},
    # Add more code snippets/metadata
]
client.insert(collection_name="code_index", data=data)
```

##### **Semantic Search**
```python
query_vector = [0.1, 0.3, ...]  # Embed your query (e.g., "function to parse JSON")
results = client.search(
    collection_name="code_index",
    data=[query_vector],
    limit=5,
    output_fields=["code", "file"],  # Return matched code snippets
    filter="file LIKE '%utils%'"  # Optional metadata filter
)
```

---

#### **4. Advanced Features**
- **Metadata Filtering**: Use SQL-like syntax (`filter="lang == 'python'"`) .
- **Hybrid Search**: Combine vector + keyword search (e.g., `filter="subject == 'error_handling'"`) .
- **Embedding Integration**:
  ```python
  from sentence_transformers import SentenceTransformer
  encoder = SentenceTransformer("BAAI/bge-small")  # Local embedding model
  vectors = encoder.encode(["def hello(): ..."])
  ```

---

#### **5. Integration with LLM Frameworks**
##### **LangChain**
```python
from langchain_milvus import Milvus
vectorstore = Milvus.from_documents(
    documents=code_chunks,
    embedding=HuggingFaceEmbeddings(),  # Or OpenAI embeddings
    connection_args={"uri": "./milvus_demo.db"},
    drop_old=True  # Overwrite existing collections
)
```

##### **LlamaIndex**
```python
from llama_index.vector_stores.milvus import MilvusVectorStore
vector_store = MilvusVectorStore(
    uri="./milvus_demo.db",
    dim=384,
    overwrite=True
)
```

---

#### **6. Limitations & Best Practices**
- **Scale**: Optimized for <1M vectors; use Milvus Standalone for larger datasets .
- **Persistence**: Data is saved to disk automatically (SQLite file) .
- **Performance**: For production, migrate to Milvus Standalone (Docker/K8s) .

---

#### **7. Example Use Case: Codebase Indexing**
1. **Chunk code** into functions/classes.
2. **Embed chunks** using a local model (e.g., `BAAI/bge-small`).
3. **Store vectors + metadata** (file path, function name) in Milvus Lite.
4. **Retrieve relevant code** via natural language queries (e.g., "How to handle API errors?").

---

#### **8. Resources**
- [Milvus Lite GitHub](https://github.com/milvus-io/milvus-lite) .
- [LangChain-Milvus Integration](https://zilliz.com/blog/how-to-connect-to-milvus-lite-using-langchain-and-llamaindex) .

---

This documentation provides a **ready-to-use template** for your LLM to implement Milvus Lite. For edge cases or advanced configurations, refer to the linked resources. Let me know if you need further customization!
