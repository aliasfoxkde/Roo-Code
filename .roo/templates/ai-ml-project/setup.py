from setuptools import setup, find_packages

with open('README.md', 'r', encoding='utf-8') as f:
    long_description = f.read()

with open('requirements/base.txt', 'r', encoding='utf-8') as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith('#') and not line.startswith('-')]

setup(
    name='ai-ml-project-template',
    version='0.1.0',
    author='Your Name',
    author_email='your.email@example.com',
    description='A comprehensive template for AI and machine learning projects',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/yourusername/ai-ml-project-template',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    python_requires='>=3.8',
    install_requires=requirements,
    extras_require={
        'dev': [
            'pytest>=6.2.0',
            'pytest-cov>=2.11.0',
            'flake8>=3.8.0',
            'black>=21.0.0',
            'mypy>=0.812',
        ],
        'docs': [
            'sphinx>=3.5.0',
            'sphinx-rtd-theme>=0.5.0',
        ],
    },
    entry_points={
        'console_scripts': [
            'ai-ml-train=src.models.training:main',
            'ai-ml-evaluate=src.models.evaluation:main',
            'ai-ml-serve=src.api.app:main',
        ],
    },
)