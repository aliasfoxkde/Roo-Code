# AI/ML Project Template Test Example

import pytest
import numpy as np


def test_example():
    """Example test function."""
    assert 1 + 1 == 2


def test_numpy():
    """Example test with numpy."""
    arr = np.array([1, 2, 3])
    assert len(arr) == 3


class TestExample:
    """Example test class."""
    
    def test_example_method(self):
        """Example test method."""
        assert True

    def test_example_with_fixture(self, sample_data):
        """Example test with fixture."""
        assert len(sample_data) > 0


@pytest.fixture
def sample_data():
    """Sample data fixture."""
    return [1, 2, 3, 4, 5]


if __name__ == "__main__":
    pytest.main(["-v"])