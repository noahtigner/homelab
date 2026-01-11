from unittest.mock import MagicMock, patch

from main import Commands, SlackBot


class TestCommands:
    """Test the Commands class"""

    def test_commands_initialization(self):
        """Test that Commands class initializes with expected commands"""
        commands = Commands()

        assert "help" in commands.commands
        assert "time" in commands.commands
        assert "greet" in commands.commands
        assert "get_service_statuses" in commands.commands

        # Verify command structure
        assert "description" in commands.commands["help"]
        assert "usage" in commands.commands["help"]
        assert "method" in commands.commands["help"]
        assert "sync" in commands.commands["help"]

    def test_help_command(self):
        """Test that help command returns list of available commands"""
        commands = Commands()

        result = commands.help()

        assert "Available commands:" in result
        assert "help" in result
        assert "time" in result
        assert "greet" in result
        assert "get_service_statuses" in result

    def test_greet_command(self):
        """Test the greet command"""
        commands = Commands()

        result = commands.commands["greet"]["method"]("U12345")

        assert result == "Hello <@U12345>!"


class TestSlackBot:
    """Test the SlackBot class"""

    @patch("main.SocketModeClient")
    @patch("main.WebClient")
    def test_slackbot_initialization(self, mock_web_client, mock_socket_client):
        """Test that SlackBot initializes correctly"""
        app_token = "xapp-test-token"
        bot_token = "xoxb-test-token"

        bot = SlackBot(app_token, bot_token)

        mock_web_client.assert_called_once_with(token=bot_token)
        mock_socket_client.assert_called_once_with(
            app_token=app_token, web_client=mock_web_client.return_value
        )
        assert bot.web_client == mock_web_client.return_value
        assert bot.socket_client == mock_socket_client.return_value

    @patch("main.SocketModeClient")
    @patch("main.WebClient")
    def test_slackbot_start(self, mock_web_client, mock_socket_client):
        """Test that SlackBot start method sets up listeners and connects"""
        app_token = "xapp-test-token"
        bot_token = "xoxb-test-token"

        bot = SlackBot(app_token, bot_token)
        bot.start()

        # Verify socket client connects
        bot.socket_client.connect.assert_called_once()
        # Verify API test is called
        bot.web_client.api_test.assert_called_once()
        # Verify startup message is posted
        bot.web_client.chat_postMessage.assert_called_once()

    @patch("main.SocketModeClient")
    @patch("main.WebClient")
    def test_process_help_command(self, mock_web_client, mock_socket_client):
        """Test processing a help command mention"""
        mock_client = MagicMock()
        mock_client.web_client = MagicMock()

        mock_request = MagicMock()
        mock_request.type = "events_api"
        mock_request.envelope_id = "test-envelope-id"
        mock_request.payload = {
            "event": {
                "type": "app_mention",
                "channel": "C12345",
                "user": "U12345",
                "text": "help please",
                "ts": "1234567890.123456",
            }
        }

        SlackBot.process(mock_client, mock_request)

        # Verify response was sent
        mock_client.send_socket_mode_response.assert_called_once()
        # Verify reaction was added
        mock_client.web_client.reactions_add.assert_called_once()
        # Verify message was posted
        mock_client.web_client.chat_postMessage.assert_called()

    @patch("main.SocketModeClient")
    @patch("main.WebClient")
    def test_process_unrecognized_command(self, mock_web_client, mock_socket_client):
        """Test processing an unrecognized command"""
        mock_client = MagicMock()
        mock_client.web_client = MagicMock()

        mock_request = MagicMock()
        mock_request.type = "events_api"
        mock_request.envelope_id = "test-envelope-id"
        mock_request.payload = {
            "event": {
                "type": "app_mention",
                "channel": "C12345",
                "user": "U12345",
                "text": "unknown command xyz",
                "ts": "1234567890.123456",
            }
        }

        SlackBot.process(mock_client, mock_request)

        # Verify error message about unrecognized command is posted
        calls = mock_client.web_client.chat_postMessage.call_args_list
        assert any(
            "don't understand" in str(call) or "Try `help`" in str(call)
            for call in calls
        )
