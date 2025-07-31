#!/usr/bin/env python3
"""
Initialize AI/ML Project Structure

This script creates the necessary directories and files for a new AI/ML project
based on the template structure.
"""

import os
import sys
import argparse
from pathlib import Path


def create_directory(path):
    """Create a directory if it doesn't exist."""
    Path(path).mkdir(parents=True, exist_ok=True)
    print(f"Created directory: {path}")


def create_file(path, content=""):
    """Create a file with optional content."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created file: {path}")


def create_gitkeep(path):
    """Create a .gitkeep file in a directory."""
    create_file(os.path.join(path, ".gitkeep"))


def init_project_structure(project_name):
    """Initialize the project structure."""
    # Create main project directory
    project_root = Path(project_name)
    project_root.mkdir(exist_ok=True)
    
    # Change to project directory
    os.chdir(project_root)
    
    # Create main directories
    directories = [
        "data/raw",
        "data/processed",
        "data/external",
        "models",
        "notebooks",
        "src/data",
        "src/models",
        "src/utils",
        "src/api",
        "tests",
        "config",
        "docs",
        "scripts",
        "logs"
    ]
    
    for directory in directories:
        create_directory(directory)
    
    # Create .gitkeep files in data directories
    gitkeep_dirs = ["data/raw", "data/processed", "data/external", "models", "logs"]
    for directory in gitkeep_dirs:
        create_gitkeep(directory)
    
    # Create basic files
    create_file("README.md", f"# {project_name}\n\nAI/ML Project based on the template structure.\n")
    create_file(".gitignore", "# Byte-compiled / optimized / DLL files\n__pycache__/\n*.py[cod]\n*$py.class\n\n# C extensions\n*.so\n\n# Distribution / packaging\n.Python\nbuild/\ndevelop-eggs/\ndist/\ndownloads/\neggs/\n.eggs/\nlib/\nlib64/\nparts/\nsdist/\nvar/\nwheels/\nshare/python-wheels/\n*.egg-info/\n.installed.cfg\n*.egg\nMANIFEST\n\n# PyInstaller\n#  Usually these files are written by a python script from a template\n#  before PyInstaller builds the exe, so as to inject date/other infos into it.\n*.manifest\n*.spec\n\n# Installer logs\npip-log.txt\npip-delete-this-directory.txt\n\n# Unit test / coverage reports\nhtmlcov/\n.tox/\n.nox/\n.coverage\n.coverage.*\n.cache\nnosetests.xml\ncoverage.xml\n*.cover\n*.py,cover\n.hypothesis/\n.pytest_cache/\ncover/\n\n# Translations\n*.mo\n*.pot\n\n# Django stuff:\n*.log\nlocal_settings.py\ndb.sqlite3\ndb.sqlite3-journal\n\n# Flask stuff:\ninstance/\n.webassets-cache\n\n# Scrapy stuff:\n.scrapy\n\n# Sphinx documentation\ndocs/_build/\n\n# PyBuilder\n.pybuilder/\ntarget/\n\n# Jupyter Notebook\n.ipynb_checkpoints\n\n# IPython\nprofile_default/\nipython_config.py\n\n# pyenv\n#   For a library or package, you might want to ignore these files since the code is\n#   intended to run in multiple environments; otherwise, check them in:\n.python-version\n\n# pipenv\n#   According to pypa/pipenv#598, it is recommended to include Pipfile.lock in version control.\n#   However, in case of collaboration, if having platform-specific dependencies or dependencies\n#   having no cross-platform support, pipenv may install dependencies that don't work, or not\n#   install all needed dependencies.\nPipfile.lock\n\n# poetry\n#   Similar to Pipfile.lock, it is generally recommended to include poetry.lock in version control.\n#   This is especially recommended for binary packages to ensure reproducibility, and is more\n#   commonly ignored for libraries.\n#   https://python-poetry.org/docs/basic-usage/#commit-your-poetrylock-file-to-version-control\n#poetry.lock\n\n# pdm\n#   Similar to Pipfile.lock, it is generally recommended to include pdm.lock in version control.\n#pdm.lock\n#   pdm stores project-wide configurations in .pdm.toml, but it is recommended to not include it\n#   in version control.\n#   https://pdm.fming.dev/#use-with-ide\n.pdm.toml\n\n# PEP 582; used by e.g. github.com/David-OConnor/pyflow and github.com/pdm-project/pdm\n__pypackages__/\n\n# Celery stuff\ncelerybeat-schedule\ncelerybeat.pid\n\n# SageMath parsed files\n*.sage.py\n\n# Environments\n.env\n.venv\nenv/\nvenv/\nENV/\nenv.bak/\nvenv.bak/\n\n# Spyder project settings\n.spyderproject\n.spyproject\n\n# Rope project settings\n.ropeproject\n\n# mkdocs documentation\n/site\n\n# mypy\n.mypy_cache/\n.dmypy.json\ndmypy.json\n\n# Pyre type checker\n.pyre/\n\n# pytype static type analyzer\n.pytype/\n\n# Cython debug symbols\ncython_debug/\n\n# PyCharm\n#  JetBrains specific template is maintained in a separate JetBrains.gitignore that can\n#  be found at https://github.com/github/gitignore/blob/main/Global/JetBrains.gitignore\n#  and can be added to the global gitignore or merged into this file.  For a more nuclear\n#  option (not recommended) you can uncomment the following to ignore the entire idea folder.\n#.idea/\n\n# Data directories\n.data/\n/mlruns/\n/mlartifacts/\n\n# Model artifacts\nmodels/*\n!models/.gitkeep\n\n# Logs\nlogs/\n*.log\n\n# Temporary files\ntmp/\n.temp/\n\n# OS generated files\n.DS_Store\n.DS_Store?\n._*\n.Spotlight-V100\n.Trashes\nehthumbs.db\nThumbs.db\n\n# IDE files\n.vscode/\n.idea/\n\n# Jupyter Notebook files\n.ipynb_checkpoints/\n\n# DVC files\n.dvc/\ndvc.lock\ndvc.db\n\n# MLflow files\nmlruns/\nmlartifacts/\n\n# Conda\nconda-meta/\n\n# Docker\ndocker-compose.override.yml\n\n# Local configuration files\nconfig/local.yaml\n\n# Notebook output\n.notebookcheckpoints/\n\n# TensorBoard logs\ntensorboard_logs/")
    create_file("requirements.txt", "# Project requirements\n# Add your project-specific requirements here\n")
    
    print(f"\nProject '{project_name}' initialized successfully!")
    print("Next steps:")
    print("1. cd", project_name)
    print("2. python -m venv venv")
    print("3. source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
    print("4. pip install -r requirements.txt")


def main():
    parser = argparse.ArgumentParser(description="Initialize AI/ML project structure")
    parser.add_argument("project_name", help="Name of the project to initialize")
    args = parser.parse_args()
    
    init_project_structure(args.project_name)


if __name__ == "__main__":
    main()
