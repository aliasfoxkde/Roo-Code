Contributing
============

This document provides guidelines for contributing to the AI/ML Project Template.

Code of Conduct
---------------

Please follow our Code of Conduct when contributing:

* Be respectful and inclusive
* Provide constructive feedback
* Focus on what is best for the community
* Show empathy towards other community members

Getting Started
---------------

1. Fork the repository
2. Clone your fork:

   .. code-block:: bash

      git clone https://github.com/your-username/ai-ml-project-template.git
      cd ai-ml-project-template

3. Create a virtual environment:

   .. code-block:: bash

      python -m venv venv
      source venv/bin/activate  # On Windows: venv\Scripts\activate

4. Install development dependencies:

   .. code-block:: bash

      pip install -e .[dev]

5. Create a new branch for your feature or bug fix:

   .. code-block:: bash

      git checkout -b feature/your-feature-name

Development Workflow
--------------------

1. Make your changes
2. Write tests for your changes
3. Run all tests:

   .. code-block:: bash

      make test

4. Check code style:

   .. code-block:: bash

      make check

5. Commit your changes:

   .. code-block:: bash

      git commit -am "Add feature: your feature description"

6. Push to your fork:

   .. code-block:: bash

      git push origin feature/your-feature-name

7. Create a pull request

Coding Standards
----------------

Follow these coding standards:

* **PEP 8** - Python style guide
* **Type hints** - Use type annotations
* **Docstrings** - Document all public functions
* **Naming conventions** - Use descriptive names
* **Code organization** - Follow project structure

Example:

.. code-block:: python

   def calculate_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
       """Calculate classification accuracy.
       
       Args:
           y_true: True labels
           y_pred: Predicted labels
           
       Returns:
           float: Accuracy score between 0 and 1
       """
       return np.mean(y_true == y_pred)

Testing
-------

All contributions must include tests:

* **Unit tests** - Test individual functions
* **Integration tests** - Test component interactions
* **Coverage** - Maintain 90%+ test coverage

Run tests with:

.. code-block:: bash

   make test
   # or
   pytest

Documentation
-------------

Update documentation when making changes:

* **Docstrings** - Update function documentation
* **README** - Update project documentation
* **Docs** - Update detailed documentation

Build documentation with:

.. code-block:: bash

   make docs

Pull Request Process
-------------------

1. Ensure all tests pass
2. Update documentation
3. Follow the pull request template
4. Request review from maintainers
5. Address feedback
6. Merge when approved

Pull Request Template
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: markdown

   ## Description
   
   Brief description of changes
   
   ## Type of Change
   
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Checklist
   
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] Code follows style guidelines
   - [ ] Self-review completed

Code Review Process
-------------------

All pull requests are reviewed by maintainers:

* **Automated checks** - CI pipeline validation
* **Manual review** - Code quality assessment
* **Documentation review** - Documentation quality
* **Security review** - Security vulnerability check

Review Criteria
~~~~~~~~~~~~~~~

Reviewers check for:

* Code correctness
* Performance considerations
* Security implications
* Test coverage
* Documentation quality
* Code style compliance
* Best practices adherence

Reporting Issues
----------------

Report issues using GitHub Issues:

1. Check existing issues
2. Use issue templates
3. Provide detailed information
4. Include reproduction steps
5. Add relevant labels

Issue Templates
~~~~~~~~~~~~~~~

* **Bug Report** - Report software bugs
* **Feature Request** - Request new features
* **Documentation Issue** - Report documentation problems
* **Security Vulnerability** - Report security issues

Security Issues
~~~~~~~~~~~~~~~

Report security vulnerabilities privately:

1. Email maintainers directly
2. Do not disclose publicly
3. Wait for response before publishing

Community
---------

Join our community:

* **GitHub Discussions** - Project discussions
* **Slack** - Real-time chat
* **Mailing List** - Announcements
* **Stack Overflow** - Q&A

Communication Channels
~~~~~~~~~~~~~~~~~~~~~~

* **GitHub Issues** - Bug reports and feature requests
* **GitHub Discussions** - General discussions
* **Slack** - Real-time communication
* **Email** - Direct contact with maintainers

Recognition
-----------

Contributors are recognized for their work:

* **GitHub contributors** - Automatic recognition
* **Release notes** - Mention in release notes
* **Hall of Fame** - Featured contributors
* **Swag** - Contributor rewards

License
-------

By contributing, you agree that your contributions will be licensed
under the MIT License.

Questions
---------

If you have questions:

1. Check the documentation
2. Search existing issues
3. Ask in GitHub Discussions
4. Contact maintainers

Thank you for contributing to the AI/ML Project Template!

Next Steps
----------

For implementation details, see:

* :doc:`testing` - Testing strategies
* :doc:`deployment` - Deployment options
* :doc:`api` - API endpoints