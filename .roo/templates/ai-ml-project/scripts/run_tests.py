#!/usr/bin/env python3
"""
Run AI/ML Project Tests

This script runs all tests for the AI/ML project.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path


def run_tests(test_path=None, coverage=False, html_report=False):
    """Run tests using pytest."""
    # Ensure we're in the project root
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    # Build pytest command
    cmd = ["python", "-m", "pytest"]
    
    if test_path:
        cmd.append(test_path)
    else:
        cmd.append("tests/")
    
    # Add coverage options
    if coverage:
        cmd.extend(["--cov=src", "--cov-report=term-missing"])
    
    # Add HTML report option
    if html_report:
        cmd.append("--html=reports/test_report.html")
    
    # Add verbose output
    cmd.append("-v")
    
    print(f"Running tests with command: {' '.join(cmd)}")
    
    try:
        # Run pytest
        result = subprocess.run(cmd, check=True)
        print("\nTests completed successfully!")
        return result.returncode
    except subprocess.CalledProcessError as e:
        print(f"\nTests failed with return code {e.returncode}")
        return e.returncode
    except FileNotFoundError:
        print("Error: pytest not found. Please install it with 'pip install pytest'")
        return 1


def main():
    parser = argparse.ArgumentParser(description="Run AI/ML project tests")
    parser.add_argument("test_path", nargs="?", help="Path to specific test file or directory")
    parser.add_argument("--coverage", "-c", action="store_true", help="Generate coverage report")
    parser.add_argument("--html-report", "-r", action="store_true", help="Generate HTML report")
    args = parser.parse_args()
    
    # Create reports directory if needed
    if args.html_report:
        Path("reports").mkdir(exist_ok=True)
    
    # Run tests
    exit_code = run_tests(args.test_path, args.coverage, args.html_report)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
