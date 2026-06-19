import sys
import os
from pdf2docx import Converter

def convert_pdf_to_docx(pdf_path, docx_path):
    try:
        # Validate paths
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Input PDF file not found: {pdf_path}")
            
        print(f"Starting conversion: {pdf_path} -> {docx_path}")
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        print("Conversion completed successfully.")
    except Exception as e:
        print(f"Error converting PDF to Word: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pdf_to_docx.py <input_pdf_path> <output_docx_path>", file=sys.stderr)
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]
    convert_pdf_to_docx(pdf_path, docx_path)
