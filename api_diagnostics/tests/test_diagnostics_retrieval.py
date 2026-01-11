from unittest.mock import mock_open, patch

from diagnostics.retrieval import (
    get_cpu_count,
    get_cpu_percent,
    get_cpu_temp,
    get_cpu_usage,
    get_disk_usage,
    get_mem_usage,
    get_pids,
)


class TestCpuTemp:
    """Test CPU temperature reading"""

    @patch("builtins.open", new_callable=mock_open, read_data="45000\n")
    def test_get_cpu_temp_success(self, mock_file):
        """Test successful CPU temperature reading"""
        temp = get_cpu_temp()

        assert temp == 45.0
        mock_file.assert_called_once_with("/sys/class/thermal/thermal_zone0/temp")

    @patch("builtins.open", side_effect=FileNotFoundError)
    def test_get_cpu_temp_file_not_found(self, mock_file):
        """Test CPU temperature when file doesn't exist"""
        temp = get_cpu_temp()

        assert temp is None

    @patch("builtins.open", new_callable=mock_open, read_data="invalid\n")
    def test_get_cpu_temp_invalid_value(self, mock_file):
        """Test CPU temperature with invalid data"""
        temp = get_cpu_temp()

        assert temp is None


class TestCpuFunctions:
    """Test CPU-related functions"""

    @patch("diagnostics.retrieval.psutil.cpu_count")
    def test_get_cpu_count(self, mock_cpu_count):
        """Test CPU count retrieval"""
        mock_cpu_count.return_value = 4

        count = get_cpu_count()

        assert count == 4
        mock_cpu_count.assert_called_once()

    @patch("diagnostics.retrieval.psutil.cpu_percent")
    def test_get_cpu_percent(self, mock_cpu_percent):
        """Test CPU percentage retrieval"""
        mock_cpu_percent.return_value = [10.5, 20.3, 15.8, 25.1]

        result = get_cpu_percent(interval=1.0)

        assert result == [10.5, 20.3, 15.8, 25.1]
        mock_cpu_percent.assert_called_once_with(interval=1.0, percpu=True)

    @patch("diagnostics.retrieval.get_cpu_temp")
    @patch("diagnostics.retrieval.get_cpu_percent")
    @patch("diagnostics.retrieval.get_cpu_count")
    def test_get_cpu_usage(self, mock_count, mock_percent, mock_temp):
        """Test combined CPU usage retrieval"""
        mock_count.return_value = 4
        mock_percent.return_value = [10.5, 20.3, 15.8, 25.1]
        mock_temp.return_value = 45.0

        result = get_cpu_usage(interval=1.0)

        assert result["count"] == 4
        assert result["percent"] == [10.5, 20.3, 15.8, 25.1]
        assert result["temp"] == 45.0
        mock_count.assert_called_once()
        mock_percent.assert_called_once_with(1.0)
        mock_temp.assert_called_once()


class TestMemoryFunctions:
    """Test memory-related functions"""

    @patch("diagnostics.retrieval.psutil.virtual_memory")
    def test_get_mem_usage(self, mock_mem):
        """Test memory usage retrieval"""
        mock_mem.return_value.total = 8589934592  # 8GB
        mock_mem.return_value.used = 4294967296  # 4GB
        mock_mem.return_value.available = 4294967296  # 4GB
        mock_mem.return_value.percent = 50.0

        result = get_mem_usage()

        assert result["total"] == 8589934592
        assert result["used"] == 4294967296
        assert result["available"] == 4294967296
        assert result["percent"] == 50.0
        mock_mem.assert_called_once()


class TestDiskFunctions:
    """Test disk-related functions"""

    @patch("diagnostics.retrieval.psutil.disk_usage")
    def test_get_disk_usage(self, mock_disk):
        """Test disk usage retrieval"""
        mock_disk.return_value.total = 500000000000  # 500GB
        mock_disk.return_value.used = 250000000000  # 250GB
        mock_disk.return_value.free = 250000000000  # 250GB
        mock_disk.return_value.percent = 50.0

        result = get_disk_usage()

        assert result["total"] == 500000000000
        assert result["used"] == 250000000000
        assert result["available"] == 250000000000
        assert result["percent"] == 50.0
        mock_disk.assert_called_once_with("/")


class TestProcessFunctions:
    """Test process-related functions"""

    @patch("diagnostics.retrieval.psutil.pids")
    def test_get_pids(self, mock_pids):
        """Test PIDs retrieval"""
        mock_pids.return_value = [1, 2, 10, 100, 1000]

        result = get_pids()

        assert result == [1, 2, 10, 100, 1000]
        mock_pids.assert_called_once()
