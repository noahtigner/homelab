import json
from unittest.mock import MagicMock, patch

import pytest
from pydantic import ValidationError

from main import SpeedTestModel, speedtest


class TestSpeedTestModel:
    """Test the SpeedTestModel Pydantic model"""

    def test_speedtest_model_valid(self):
        """Test that a valid speedtest result can be parsed"""
        valid_data = {
            "download": 100.5,
            "upload": 50.2,
            "ping": 10.5,
            "server": {
                "url": "http://example.com",
                "lat": "40.7128",
                "lon": "-74.0060",
                "name": "Test Server",
                "country": "US",
                "cc": "US",
                "sponsor": "Test ISP",
                "id": "12345",
                "host": "example.com:8080",
                "d": 10.5,
                "latency": 5.2,
            },
            "timestamp": "2024-01-01T12:00:00.000000Z",
            "bytes_sent": 1000000,
            "bytes_received": 5000000,
            "share": "http://speedtest.net/result/123",
            "client": {
                "ip": "1.2.3.4",
                "lat": "40.7128",
                "lon": "-74.0060",
                "isp": "Test ISP",
                "isprating": "3.5",
                "rating": "0",
                "ispdlavg": "0",
                "ispulavg": "0",
                "loggedin": "0",
                "country": "US",
            },
        }
        model = SpeedTestModel(**valid_data)
        assert model.download == 100.5
        assert model.upload == 50.2
        assert model.ping == 10.5
        assert model.server.name == "Test Server"
        assert model.client.isp == "Test ISP"

    def test_speedtest_model_none_share(self):
        """Test that share field can be None"""
        valid_data = {
            "download": 100.5,
            "upload": 50.2,
            "ping": 10.5,
            "server": {
                "url": "http://example.com",
                "lat": "40.7128",
                "lon": "-74.0060",
                "name": "Test Server",
                "country": "US",
                "cc": "US",
                "sponsor": "Test ISP",
                "id": "12345",
                "host": "example.com:8080",
                "d": 10.5,
                "latency": 5.2,
            },
            "timestamp": "2024-01-01T12:00:00.000000Z",
            "bytes_sent": 1000000,
            "bytes_received": 5000000,
            "share": None,
            "client": {
                "ip": "1.2.3.4",
                "lat": "40.7128",
                "lon": "-74.0060",
                "isp": "Test ISP",
                "isprating": "3.5",
                "rating": "0",
                "ispdlavg": "0",
                "ispulavg": "0",
                "loggedin": "0",
                "country": "US",
            },
        }
        model = SpeedTestModel(**valid_data)
        assert model.share is None

    def test_speedtest_model_missing_required_field(self):
        """Test that missing required fields raise validation error"""
        invalid_data = {
            "download": 100.5,
            "upload": 50.2,
            # missing ping
        }
        with pytest.raises(ValidationError):
            SpeedTestModel(**invalid_data)


class TestSpeedtestFunction:
    """Test the speedtest function"""

    @patch("main.subprocess.run")
    def test_speedtest_success(self, mock_run):
        """Test successful speedtest execution"""
        mock_result = MagicMock()
        mock_result.stderr = ""
        mock_result.stdout = json.dumps(
            {
                "download": 100000000.0,
                "upload": 50000000.0,
                "ping": 10.5,
                "server": {
                    "url": "http://example.com",
                    "lat": "40.7128",
                    "lon": "-74.0060",
                    "name": "Test Server",
                    "country": "US",
                    "cc": "US",
                    "sponsor": "Test ISP",
                    "id": "12345",
                    "host": "example.com:8080",
                    "d": 10.5,
                    "latency": 5.2,
                },
                "timestamp": "2024-01-01T12:00:00.000000Z",
                "bytes_sent": 1000000,
                "bytes_received": 5000000,
                "share": None,
                "client": {
                    "ip": "1.2.3.4",
                    "lat": "40.7128",
                    "lon": "-74.0060",
                    "isp": "Test ISP",
                    "isprating": "3.5",
                    "rating": "0",
                    "ispdlavg": "0",
                    "ispulavg": "0",
                    "loggedin": "0",
                    "country": "US",
                },
            }
        )
        mock_run.return_value = mock_result

        result = speedtest()

        mock_run.assert_called_once_with(
            ["speedtest", "--json"], capture_output=True, text=True
        )
        assert isinstance(result, SpeedTestModel)
        assert result.download == 100000000.0
        assert result.upload == 50000000.0

    @patch("main.subprocess.run")
    def test_speedtest_stderr_raises_exception(self, mock_run):
        """Test that stderr from speedtest command raises an exception"""
        mock_result = MagicMock()
        mock_result.stderr = "Error: Could not connect to server"
        mock_result.stdout = ""
        mock_run.return_value = mock_result

        with pytest.raises(Exception) as exc_info:
            speedtest()

        assert "Error: Could not connect to server" in str(exc_info.value)
