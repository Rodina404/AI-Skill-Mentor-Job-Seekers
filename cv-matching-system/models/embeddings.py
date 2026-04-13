import logging
from langchain_community.embeddings import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)

def get_embeddings():
    """
    Get HuggingFace embeddings model.
    
    Returns:
        HuggingFaceEmbeddings instance
        
    Raises:
        Exception: If embeddings cannot be loaded
    """
    try:
        logger.info("Loading HuggingFace embeddings model: sentence-transformers/all-MiniLM-L6-v2")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        logger.info("Embeddings model loaded successfully")
        return embeddings
    except Exception as e:
        logger.error(f"Failed to load embeddings model: {str(e)}")
        raise