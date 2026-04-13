import logging
import os
from langchain_community.vectorstores import FAISS
from models.embeddings import get_embeddings
import config

logger = logging.getLogger(__name__)

def build_vector_store(texts, metadatas, rebuild=False):
    """
    Build or load FAISS vector store from texts.
    Supports persistence to avoid rebuilding on every run.
    
    Args:
        texts: List of text documents
        metadatas: List of metadata dictionaries
        rebuild: Force rebuild even if cached version exists
        
    Returns:
        FAISS vector store or None if error
    """
    try:
        if not texts or len(texts) == 0:
            logger.warning("No texts provided for vector store")
            return None
        
        # Check if we should load cached vector store
        store_path = config.VECTOR_STORE_PATH
        if config.VECTOR_STORE_PERSIST and not rebuild and os.path.exists(store_path):
            try:
                logger.info(f"Loading cached vector store from {store_path}")
                embeddings = get_embeddings()
                vector_store = FAISS.load_local(store_path, embeddings)
                logger.info("Cached vector store loaded successfully")
                return vector_store
            except Exception as e:
                logger.warning(f"Failed to load cached vector store: {str(e)}. Rebuilding...")
        
        # Build new vector store
        logger.info(f"Building vector store with {len(texts)} documents")
        embeddings = get_embeddings()
        
        vector_store = FAISS.from_texts(texts, embeddings, metadatas=metadatas)
        logger.info(f"Vector store built successfully with {len(texts)} documents")
        
        # Save for future use
        if config.VECTOR_STORE_PERSIST:
            try:
                os.makedirs(store_path, exist_ok=True)
                vector_store.save_local(store_path)
                logger.info(f"Vector store persisted to {store_path}")
            except Exception as e:
                logger.warning(f"Failed to persist vector store: {str(e)}")
        
        return vector_store
    except Exception as e:
        logger.error(f"Error building vector store: {str(e)}")
        raise