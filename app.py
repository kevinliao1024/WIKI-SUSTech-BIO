from os import path
from flask import Flask, abort, render_template, send_from_directory, url_for
from flask_frozen import Freezer
from markupsafe import Markup

from wiki_content import CONTENT_PAGES, NAVIGATION, load_markdown_content


template_folder = path.abspath("./wiki")

app = Flask(__name__, template_folder=template_folder)
app.config["FREEZER_DESTINATION"] = "public"
app.config["FREEZER_RELATIVE_URLS"] = True
app.config["FREEZER_IGNORE_MIMETYPE_WARNINGS"] = True
freezer = Freezer(app)


@freezer.register_generator
def pages():
    for page in sorted(CONTENT_PAGES):
        yield {"page": page}
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
    page_config = CONTENT_PAGES.get(page)
    if page_config:
        content = load_markdown_content(
            page_config.markdown_path,
            asset_url=lambda filename: url_for("assets", filename=filename),
        )
        return render_template(
            page_config.template,
            content=content,
            rendered_markdown=Markup(content.html),
        )
    abort(404)


@app.context_processor
def inject_navigation():
    return {"navigation_groups": NAVIGATION}


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
