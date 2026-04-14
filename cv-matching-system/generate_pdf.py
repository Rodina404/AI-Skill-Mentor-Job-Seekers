"""
Convert HTML documentation to PDF
Run: python generate_pdf.py
"""

import sys

def generate_pdf():
    """Generate PDF from HTML documentation"""
    try:
        from weasyprint import HTML
        
        print("📄 Converting System_Documentation.html to PDF...")
        print("-" * 60)
        
        # Convert HTML to PDF
        HTML('System_Documentation.html').write_pdf('CV_Matching_System_Documentation.pdf')
        
        print("✓ PDF generated successfully!")
        print("-" * 60)
        print("📁 File: CV_Matching_System_Documentation.pdf")
        print("📊 Ready for presentation!")
        
    except ImportError:
        print("❌ weasyprint not installed!")
        print("\nInstall with:")
        print("  pip install weasyprint")
        print("\nOr use alternative method:")
        print("  1. Open System_Documentation.html in browser")
        print("  2. Press Ctrl+P")
        print('  3. Select "Save as PDF"')
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_pdf()
