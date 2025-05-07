# resumebackend/convert.py
import subprocess, tempfile, pathlib, magic

def convert(uploaded_path: pathlib.Path) -> pathlib.Path:
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
