# resumebackend/convert.py
import subprocess, tempfile, pathlib, magic
import pdfplumber  # For extracting text from PDF

def convert(uploaded_path: pathlib.Path) -> pathlib.Path:
    """Convert uploaded file to PDF format"""
    mime = magic.from_file(str(uploaded_path), mime=True)
    outdir = tempfile.mkdtemp()

    # For text files, we'll create a simple text file with the content
    if mime.startswith("text/"):
        out = pathlib.Path(outdir) / "resume.txt"
        with open(uploaded_path, 'r', encoding='utf-8') as src:
            with open(out, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        return out
    
    # For PDFs, optimize them
    elif mime.startswith("application/pdf"):
        out = pathlib.Path(outdir) / "resume.pdf"
        subprocess.run(["gs", "-dNOPAUSE", "-dBATCH",
                        "-sDEVICE=pdfwrite", "-sOutputFile="+str(out),
                        "-dPDFSETTINGS=/prepress", str(uploaded_path)],
                        check=True)
    # For Word documents
    elif "word" in mime:
        subprocess.run(["soffice","--headless","--convert-to","pdf:writer_pdf_Export",
                        "--outdir", outdir, str(uploaded_path)], check=True)
        out = next(pathlib.Path(outdir).glob("*.pdf"))
    # For other file types (assume markdown/text)
    else:
        out = pathlib.Path(outdir) / "resume.pdf"
        try:
            subprocess.run(["pandoc", str(uploaded_path), "-o", str(out),
                           "--pdf-engine=xelatex"], check=True)
        except Exception as e:
            # Fallback to copying as text if conversion fails
            print(f"Conversion error: {e}, falling back to text copy")
            out = pathlib.Path(outdir) / "resume.txt"
            with open(uploaded_path, 'rb') as src:
                with open(out, 'wb') as dst:
                    dst.write(src.read())
    
    return out

def extract_text(file_path: pathlib.Path) -> str:
    """Extract text from a file - supports PDF and text files"""
    mime = magic.from_file(str(file_path), mime=True)
    
    # For text files, just read the content
    if mime.startswith("text/") or file_path.suffix.lower() == ".txt":
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            # Try with binary mode if UTF-8 fails
            with open(file_path, 'rb') as f:
                return f.read().decode('utf-8', errors='replace')
    
    # For PDF files, use pdfplumber
    elif mime.startswith("application/pdf"):
        text = ""
        try:
            with pdfplumber.open(str(file_path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    text += page_text + "\n\n"
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            # Fallback to direct text extraction if pdfplumber fails
            try:
                # Try using gs to extract text
                output = subprocess.check_output(
                    ["gs", "-dNOPAUSE", "-dBATCH", "-sDEVICE=txtwrite", 
                     "-sOutputFile=-", str(file_path)],
                    stderr=subprocess.STDOUT,
                    text=True
                )
                return output
            except Exception as e2:
                print(f"Fallback text extraction failed: {e2}")
                raise Exception(f"Could not extract text from PDF: {e}, {e2}")
    
    # For other file types, try to extract as text
    else:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                return f.read()
        except Exception as e:
            raise Exception(f"Could not extract text from file: {e}")