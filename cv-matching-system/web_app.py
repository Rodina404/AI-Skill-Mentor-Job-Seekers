"""
Flask web application for CV Matching System
Provides a simple UI for matching candidates to job descriptions
"""

import sys
import logging
from flask import Flask, render_template, request, jsonify
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('web_app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import matching functions
from services.matcher import match_candidates
from data.candidates import candidates

# Create Flask app
app = Flask(__name__)
app.secret_key = 'cv-matcher-secret-key-2024'
app.config['JSON_SORT_KEYS'] = False

@app.route('/')
def index():
    """Home page."""
    logger.info("User accessed homepage")
    return render_template('index.html', candidates_count=len(candidates))


@app.route('/candidates')
def candidates_page():
    """Display all candidates."""
    logger.info("User accessed candidates page")
    candidates_list = sorted(candidates, key=lambda x: x['name'])
    return render_template('candidates.html', candidates=candidates_list)


@app.route('/api/match', methods=['POST'])
def api_match():
    """
    API endpoint to match candidates.
    Expected JSON: {"job_description": "..."}
    """
    try:
        data = request.get_json()
        
        if not data or 'job_description' not in data:
            return jsonify({'error': 'Missing job_description field'}), 400
        
        job_description = data['job_description'].strip()
        
        if not job_description or len(job_description) < 10:
            return jsonify({'error': 'Job description too short (min 10 characters)'}), 400
        
        logger.info(f"API match request received (length: {len(job_description)})")
        
        # Run matching
        results = match_candidates(job_description, candidates)
        
        logger.info(f"Matching completed: {len(results)} candidates ranked")
        
        return jsonify({
            'success': True,
            'timestamp': datetime.now().isoformat(),
            'job_description_length': len(job_description),
            'candidates_count': len(results),
            'results': results
        }), 200
    
    except Exception as e:
        logger.error(f"Error in API match: {str(e)}", exc_info=True)
        return jsonify({
            'error': f'Matching failed: {str(e)}',
            'success': False
        }), 500


@app.route('/api/candidates', methods=['GET'])
def api_candidates():
    """API endpoint to get all candidates."""
    try:
        candidates_list = sorted(candidates, key=lambda x: x['name'])
        return jsonify({
            'success': True,
            'count': len(candidates_list),
            'candidates': candidates_list
        }), 200
    except Exception as e:
        logger.error(f"Error in API candidates: {str(e)}")
        return jsonify({'error': str(e), 'success': False}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'candidates_loaded': len(candidates),
        'timestamp': datetime.now().isoformat()
    }), 200


@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors."""
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(e)}")
    return render_template('500.html'), 500


@app.context_processor
def inject_app_info():
    """Inject app info into templates."""
    return {
        'app_version': '1.0.0',
        'candidates_count': len(candidates),
        'app_name': 'CV Matcher'
    }


if __name__ == '__main__':
    import time
    
    logger.info("Starting CV Matching System Web Application")
    logger.info(f"Loaded {len(candidates)} candidates")
    
    # Initialize embedding model at startup
    logger.info("Initializing embedding model...")
    start_time = time.time()
    try:
        from models.embeddings import embedder
        embedder.initialize_model()
        init_time = time.time() - start_time
        logger.info(f"[OK] Embedding model initialized in {init_time:.2f}s")
    except Exception as e:
        logger.error(f"[FAIL] Failed to initialize embedding model: {e}")
    
    # Show parser configuration
    logger.info(f"Using parser: Hybrid Parser (regex + transformers)")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=True
    )
