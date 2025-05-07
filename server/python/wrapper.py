#!/usr/bin/env python3
# wrapper.py - Command-line interface for resume conversion and text extraction

import sys
import os
import tempfile
import pathlib
import json
from resume_convert import convert, extract_text

def main():
    # Check command args
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Invalid arguments. Usage: wrapper.py <command> <file_path>"
        }))
        sys.exit(1)
    
    command = sys.argv[1]
    file_path = sys.argv[2]
    
    try:
        file_path = pathlib.Path(file_path)
        
        if not file_path.exists():
            print(json.dumps({
                "error": f"File not found: {file_path}"
            }))
            sys.exit(1)
            
        if command == "convert":
            # Convert to PDF and extract text
            pdf_path = convert(file_path)
            text = extract_text(pdf_path)
            
            print(json.dumps({
                "success": True,
                "text": text,
                "pdf_path": str(pdf_path)
            }))
            
        elif command == "extract_text":
            # Check if file is text or PDF
            import magic
            mime = magic.from_file(str(file_path), mime=True)
            
            if mime.startswith("text/"):
                # For text files, just read the content directly
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            elif mime.startswith("application/pdf"):
                # For PDFs, use our extraction function
                text = extract_text(file_path)
            else:
                # For other files, try to convert first
                pdf_path = convert(file_path)
                text = extract_text(pdf_path)
            
            print(json.dumps({
                "success": True,
                "text": text
            }))
            
        else:
            print(json.dumps({
                "error": f"Unknown command: {command}"
            }))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()