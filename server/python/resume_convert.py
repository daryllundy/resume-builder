# resumebackend/convert.py
import subprocess, tempfile, pathlib, magic
import pdfplumber  # For extracting text from PDF

def convert(uploaded_path: pathlib.Path) -> pathlib.Path:
    """Convert uploaded file to PDF format"""
    mime = magic.from_file(str(uploaded_path), mime=True)
    outdir = tempfile.mkdtemp()
    if mime.startswith("application/pdf"):
        out = pathlib.Path(outdir) / "resume.pdf"
        subprocess.run(["gs", "-dNOPAUSE", "-dBATCH",
                        "-sDEVICE=pdfwrite", "-sOutputFile="+str(out),
                        "-dPDFSETTINGS=/prepress", str(uploaded_path)],
                        check=True)
    elif "word" in mime:
        subprocess.run(["soffice","--headless","--convert-to","pdf:writer_pdf_Export",
                        "--outdir", outdir, str(uploaded_path)], check=True)
        out = next(pathlib.Path(outdir).glob("*.pdf"))
    else:  # assume markdown
        out = pathlib.Path(outdir) / "resume.pdf"
        subprocess.run(["pandoc", str(uploaded_path), "-o", str(out),
                        "--pdf-engine=xelatex"], check=True)
    return out

def extract_text(pdf_path: pathlib.Path) -> str:
    """Extract text from a PDF file using pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
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
                 "-sOutputFile=-", str(pdf_path)],
                stderr=subprocess.STDOUT,
                text=True
            )
            return output
        except Exception as e2:
            print(f"Fallback text extraction failed: {e2}")
            raise Exception(f"Could not extract text from PDF: {e}, {e2}")