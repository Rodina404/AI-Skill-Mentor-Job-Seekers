import os
import sys
import logging
from services.matcher import match_candidates
from data.candidates import candidates

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('cv_matcher.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


def main():
    """Main entry point for CV matching system."""
    try:
        logger.info("=" * 60)
        logger.info("Starting CV Matching System")
        logger.info("=" * 60)
        
        # Job description
        job_description = """
        Looking for Machine Learning Engineer with Python, SQL,
        and 2+ years experience. Experience with TensorFlow is required.
        Strong background in Deep Learning and Statistics preferred.
        Must have experience with cloud platforms like AWS or GCP.
        """
        
        logger.info(f"Processing job description (length: {len(job_description)} chars)")
        
        # Validate candidates
        if not candidates or len(candidates) == 0:
            logger.error("No candidates loaded")
            sys.exit(1)
        
        logger.info(f"Loaded {len(candidates)} candidates")
        
        # Match candidates
        results = match_candidates(job_description, candidates)
        
        # Display results
        print("\n" + "=" * 60)
        print("MATCHED CANDIDATES (Ranked by Score)")
        print("=" * 60 + "\n")
        
        if not results:
            print("No matches found")
            logger.warning("No matches found for job description")
        else:
            for i, result in enumerate(results, 1):
                print(f"{i}. {result['name']}")
                print(f"   Score: {result['score']}%")
                print(f"   Experience: {result['experience']} years")
                print(f"   Skills: {', '.join(result.get('skills', [])[:3])}")
                print()
        
        logger.info(f"Matching completed successfully. Found {len(results)} candidates")
        print("=" * 60)
        
    except Exception as e:
        logger.error(f"Error in main: {str(e)}", exc_info=True)
        print(f"\nError: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()