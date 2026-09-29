# Team SUSTech 2026 Wiki

The SUSTech ORCA site uses a custom ocean-current editorial design and a Markdown-first
content workflow. Team members maintain page text in [`docs/`](docs/README.md);
the `wiki/` and `static/` directories are the presentation layer. Read
[CONTENT_GUIDE.md](CONTENT_GUIDE.md) before publishing any page. Local development
and verification use the existing `xbx_env` Conda environment.

This repository **MUST** contain all coding assets to generate your team's wiki (HTML, CSS, JavaScript, TypeScript, Python, etc).

Images, photos, icons and fonts **MUST** be stored on `static.igem.wiki` using [the uploads tool](https://teams.igem.org/go/deliverables/wiki/uploads), and Videos **must** be embedded from [iGEM Video Universe](https://video.igem.org); see [the Video & Audio page](https://teams.igem.org/go/deliverables/wiki/videos-and-audios) for guidance on adding video and audio.

**Everything your wiki loads (CSS, JavaScript, fonts, images) must be served from iGEM infrastructure.** Do not link to external or third-party CDNs (for example Google Fonts, jsDelivr, cdnjs) — upload the files you need via [the uploads tool](https://teams.igem.org/go/deliverables/wiki/uploads) and reference them from `static.igem.wiki` instead.

For up-to-date requirements, resources, help and guidance, visit [teams.igem.org/go/deliverables/wiki](https://teams.igem.org/go/deliverables/wiki).

> **Using an AI assistant (e.g. Claude Code)?** Please read [.claude/RESPONSIBLE_AI_USE.md](.claude/RESPONSIBLE_AI_USE.md) first. You remain fully responsible for everything you publish: never fabricate scientific results, data, or citations.

## Getting started

For normal content work, edit only the matching Markdown file under `docs/` and add page images under `assets/images/`.
1. Open the Web IDE
2. Follow the simple [content editing guide](docs/README.md)
3. Preview the page or ask a Wiki developer to review it
4. Review the changes you made
5. Save the changes through the team's normal commit and Pull Request workflow
6. After merge, the automated pipeline builds, tests and deploys the Wiki

## About this Template

### Files

Page copy lives in `docs/`. The visual assets are in `assets/` and `static/`, while layout and presentation templates live in `wiki/`. Unless you are maintaining the Wiki system, edit only the documented content files.

    |__ docs/               -> Markdown page content and the editing guide
    |__ assets/images/      -> images referenced by Markdown content
    |__ static/             -> presentation assets, CSS and JavaScript
    |__ wiki/               -> Main directory for the pages and layouts
        |__ footer.html     -> Footer that will appear in all the pages
        |__ layout.html     -> Main layout of your wiki. All the pages will follow its structure
        |__ menu.html       -> Menu that will appear in all the pages
        |__ pages/          -> Shared and custom presentation templates
    |__ .gitignore          -> Tells GitLab which files/directories should not be uploaded to the repository
    |__ .gitlab-ci.yml      -> Automated flow for building, testing and deploying your website.
    |__ LICENSE             -> License CC-by-4.0, all wikis are required to have this license - DO NOT MODIFY
    |__ README.md           -> File containing the text you are reading right now
    |__ app.py              -> Python code managing your wiki
    |__ dependencies.txt    -> Software dependencies from the Python code

### Technologies

  * [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/)
  * [Python](https://www.python.org): Programming language
  * [Flask](https://palletsprojects.com/projects/flask): Python framework
  * [Frozen-Flask](https://pypi.org/project/Frozen-Flask): Library that builds the wiki to be deployed as a static website
  * [Bootstrap](https://getbootstrap.com/docs/5.3/components): CSS and JS components used

### Building locally (advanced users)

To work locally with this project, follow the steps below:

#### Important

Ensure you are using Python `>=3.10` (Python 3.12 recommended) to avoid compatibility issues. You can check your Python version by running `python3 --version` in your terminal.

#### Install
```bash
git clone https://gitlab.igem.org/2026/sustech.git
cd sustech
conda activate xbx_env
python -m pip install -r dependencies.txt
```

#### Execute
```bash
conda run -n xbx_env python app.py
```
