from unittest.mock import patch

from commands import get_time


class TestGetTime:
    """Test the get_time function"""

    @patch("commands.datetime")
    def test_get_time_returns_formatted_time(self, mock_datetime):
        """Test that get_time returns properly formatted time string"""
        mock_datetime.now.return_value.strftime.return_value = "14:30:45"

        result = get_time()

        assert result == "\nIt is currently 14:30:45"
        mock_datetime.now.return_value.strftime.assert_called_once_with("%H:%M:%S")


class TestGetServiceStatuses:
    """Test the get_service_statuses generator function"""

    @patch("commands.requests.get")
    def test_get_service_statuses_all_running(self, mock_get):
        """Test service statuses when all services are running"""
        mock_response = mock_get.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "ok"}

        from commands import get_service_statuses

        messages = list(get_service_statuses())

        assert messages[0] == "Checking services..."
        # Check that success messages are generated
        assert any("docker" in msg and "is running" in msg for msg in messages)
        assert any("pihole" in msg and "is running" in msg for msg in messages)
        assert any("cache" in msg and "is running" in msg for msg in messages)

    @patch("commands.requests.get")
    def test_get_service_statuses_service_down(self, mock_get):
        """Test service statuses when a service returns error"""
        mock_response = mock_get.return_value
        mock_response.status_code = 500
        mock_response.json.return_value = {"detail": "Service unavailable"}

        from commands import get_service_statuses

        messages = list(get_service_statuses())

        assert messages[0] == "Checking services..."
        # Check that warning messages are generated
        assert any(
            "is not running or did not respond" in msg and "Service unavailable" in msg
            for msg in messages
        )

    @patch("commands.requests.get")
    def test_get_service_statuses_connection_error(self, mock_get):
        """Test service statuses when connection fails"""
        mock_get.side_effect = Exception("Connection refused")

        from commands import get_service_statuses

        messages = list(get_service_statuses())

        assert messages[0] == "Checking services..."
        # Check that warning messages are generated for connection errors
        assert any(
            "is not running or did not respond" in msg and "Connection refused" in msg
            for msg in messages
        )
