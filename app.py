from os import path
from pathlib import Path

from flask import Flask, abort, render_template, send_from_directory
from flask_frozen import Freezer


template_folder = path.abspath("./wiki")

app = Flask(__name__, template_folder=template_folder)
app.config["FREEZER_DESTINATION"] = "public"
app.config["FREEZER_RELATIVE_URLS"] = True
app.config["FREEZER_IGNORE_MIMETYPE_WARNINGS"] = True
freezer = Freezer(app)


PAGE_META = {
    "team": {
        "eyebrow": "The people behind ORCA",
        "title": "Meet Our Team",
        "lead": "Introduce every student, advisor, instructor and PI—and make each contribution easy to recognize.",
        "sections": ["Team members", "Advisors & PIs", "How we worked", "References"],
    },
    "description": {
        "eyebrow": "Project",
        "title": "Project Description",
        "lead": "Build the complete case from Alzheimer’s disease and APOE4 to a precise, testable RNA-editing strategy.",
        "sections": ["The unmet need", "Why APOE4", "Our approach", "What is new", "Project roadmap", "References"],
    },
    "engineering": {
        "eyebrow": "Project",
        "title": "Engineering Success",
        "lead": "Document each Design–Build–Test–Learn cycle, including decisions that changed after evidence arrived.",
        "sections": ["Engineering challenge", "Cycle 01", "Cycle 02", "What failed", "What we learned", "References"],
    },
    "results": {
        "eyebrow": "Project",
        "title": "Results",
        "lead": "Bring validated wet-lab and dry-lab evidence together without blurring prediction and measurement.",
        "sections": ["Key findings", "Wet-lab results", "Dry-lab results", "Integrated interpretation", "Limitations", "References"],
    },
    "contribution": {
        "eyebrow": "Project",
        "title": "Contribution",
        "lead": "Explain what future iGEM teams can reuse, reproduce or build upon.",
        "sections": ["Contribution summary", "Reusable materials", "How to reproduce", "Troubleshooting", "License & access", "References"],
    },
    "parts": {
        "eyebrow": "Project",
        "title": "Parts",
        "lead": "Connect every Registry part to its design rationale, construction evidence and intended role.",
        "sections": ["Part collection", "Design rationale", "Basic parts", "Composite parts", "Characterization", "References"],
    },
    "experiments": {
        "eyebrow": "Wet Lab",
        "title": "Experiments",
        "lead": "Record protocols, controls and decision points so another team can reproduce the work.",
        "sections": ["Experimental overview", "Construct assembly", "Cell experiments", "Editing assay", "Controls", "Protocols & references"],
    },
    "notebook": {
        "eyebrow": "Wet Lab",
        "title": "Notebook",
        "lead": "A chronological record of experiments, meetings, decisions and changes across the season.",
        "sections": ["Timeline", "Monthly log", "Experiment index", "Decision log", "Deviations & repeats", "References"],
    },
    "measurement": {
        "eyebrow": "Wet Lab",
        "title": "Measurement",
        "lead": "Define how every readout is acquired, normalized, quality-controlled and interpreted.",
        "sections": ["Measurement goals", "Assays", "Calibration", "Quality control", "Data analysis", "References"],
    },
    "alternative-platform": {
        "eyebrow": "Wet Lab",
        "title": "Alternative Platform",
        "lead": "Describe why the chosen biological platform is appropriate and what evidence demonstrates its utility.",
        "sections": ["Platform rationale", "System design", "Validation strategy", "Performance", "Limitations", "References"],
    },
    "safety-and-security": {
        "eyebrow": "Wet Lab",
        "title": "Safety & Security",
        "lead": "Identify biological, laboratory, environmental and dual-use risks—and the controls used to manage them.",
        "sections": ["Risk overview", "Laboratory safety", "Project-specific risks", "Risk controls", "Responsible research", "References"],
    },
    "hardware": {
        "eyebrow": "Dry Lab",
        "title": "Hardware",
        "lead": "Reserve this page for any physical tool developed to make synthetic biology easier, safer or more reproducible.",
        "sections": ["Need", "Design", "Build", "Validation", "Reproduction guide", "References"],
    },
    "entrepreneurship": {
        "eyebrow": "Engagement",
        "title": "Entrepreneurship",
        "lead": "Connect an unmet need to a credible route for development, translation and responsible adoption.",
        "sections": ["Problem & users", "Value proposition", "Stakeholder discovery", "Development pathway", "Risks & milestones", "References"],
    },
    "human-practices": {
        "eyebrow": "Engagement",
        "title": "Human Practices",
        "lead": "Show how people, values and evidence shaped the project—and how the project responded.",
        "sections": ["Context & values", "Stakeholder map", "Engagements", "Integration into design", "Reflection", "References"],
    },
    "education": {
        "eyebrow": "Engagement",
        "title": "Education",
        "lead": "Document two-way learning activities, the audiences reached and how feedback improved the materials.",
        "sections": ["Learning goals", "Audience", "Activities", "Feedback", "What changed", "Resources & references"],
    },
    "inclusivity": {
        "eyebrow": "Engagement",
        "title": "Inclusivity",
        "lead": "Explain how access, representation and participation were considered throughout the project.",
        "sections": ["Who may be excluded", "Design for access", "Participation", "Evaluation", "Next actions", "References"],
    },
    "sustainability": {
        "eyebrow": "Engagement",
        "title": "Sustainability",
        "lead": "Evaluate the project against relevant Sustainable Development Goals and stakeholder priorities.",
        "sections": ["Relevant SDGs", "Positive impact", "Trade-offs", "Stakeholder input", "Actions & indicators", "References"],
    },
}

CONTENT_PAGES = {
    "dry-lab",
    "model",
    "brain-delivery",
    "offtarget-atlas",
    "software",
}


@app.cli.command()
def freeze():
    freezer.freeze()


@app.cli.command()
def serve():
    freezer.run()


@app.route("/")
def home():
    return render_template("pages/home.html")


@app.route("/assets/<path:filename>")
def assets(filename):
    return send_from_directory(path.join(app.root_path, "assets"), filename)


@app.route("/<page>")
def pages(page):
    page = page.lower()
    if page in PAGE_META:
        return render_template(f"pages/{page}.html", page_meta=PAGE_META[page])
    if page in CONTENT_PAGES:
        return render_template(str(Path("pages")) + "/" + page + ".html")
    abort(404)


@app.errorhandler(404)
def not_found(_error):
    return render_template("pages/404.html"), 404


@app.route("/404.html", endpoint="static_404")
def static_404_page():
    return render_template("pages/404.html")


@freezer.register_generator
def static_404():
    yield {}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080)
