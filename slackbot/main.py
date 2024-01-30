import logging
import signal
from threading import Event

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.request import SocketModeRequest
from slack_sdk.socket_mode.response import SocketModeResponse

from commands import get_docker_stats, get_service_statuses, get_time
from config import Settings

logging.basicConfig(level=logging.DEBUG)


class Commands:
    def __init__(self):
        self.commands = {
            "help": {
                "description": "List available commands",
                "usage": "help",
                "method": self.help,
                "sync": True,
            },
            "time": {
                "description": "Get the current time",
                "usage": "time",
                "method": get_time,
                "sync": True,
            },
            "greet": {
                "description": "Greet a user",
                "usage": "greet",
                "method": lambda username: f"Hello <@{username}>!",
                "sync": True,
            },
            "get_service_statuses": {
                "description": "Get the current Homelab service statuses",
                "usage": "get_service_statuses",
                "method": get_service_statuses,
                "sync": False,
            },
            "get_docker_stats": {
                "description": "Get the current Homelab Docker stats",
                "usage": "get_docker_stats",
                "method": get_docker_stats,
                "sync": False,
            },
        }

    def help(self) -> str:
        response_text = "Available commands:\n"
        for command in self.commands:
            response_text += (
                f'\t`{command}` - {self.commands[command]["description"]}\n'
            )

        return response_text


class SlackBot:
    def __init__(self, app_token: str, bot_token: str):
        self.web_client = WebClient(token=bot_token)
        self.socket_client = SocketModeClient(
            app_token=app_token, web_client=self.web_client
        )

    def start(self):
        # add the process function to the socket_client
        self.socket_client.socket_mode_request_listeners.append(self.process)

        # establish a WebSocket connection to the Socket Mode servers
        self.socket_client.connect()

        # test the web_client connection
        self.web_client.api_test()

        # post a message to the channel
        self.web_client.chat_postMessage(
            channel="#general",
            text="Startup complete!",
            blocks=[
                {
                    "type": "section",
                    "text": {"type": "plain_text", "text": "Startup complete!"},
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": Commands().help()},
                },
                {
                    "type": "section",
                    "text": {"type": "plain_text", "text": "How may I help you?"},
                },
            ],
        )

    @staticmethod
    def process(client: SocketModeClient, req: SocketModeRequest):
        def handle_sync_command(channel: str, method, *args):
            client.web_client.chat_postMessage(channel=channel, text=method(*args))

        def handle_generator_command(channel: str, method, *args):
            initial_message = None
            for i, message in enumerate(method(*args)):
                if i == 0 or initial_message is None:
                    initial_message = client.web_client.chat_postMessage(
                        channel=channel, text=message
                    )
                elif i == 1:
                    client.web_client.chat_update(
                        channel=channel,
                        ts=initial_message["ts"],
                        text=message,
                    )
                else:
                    client.web_client.chat_postMessage(channel=channel, text=message)

        if req.type == "events_api":
            # Acknowledge the request anyway
            response = SocketModeResponse(envelope_id=req.envelope_id)
            client.send_socket_mode_response(response)

            event = req.payload["event"]
            if event["type"] == "app_mention":
                channel_id = event.get("channel")
                user = event.get("user")

                # react with an emoji
                client.web_client.reactions_add(
                    name="wave",
                    channel=req.payload["event"]["channel"],
                    timestamp=req.payload["event"]["ts"],
                )

                try:
                    # parse the message into tokens
                    # tokens = set(event.get("text", "").lower().split())
                    text = event.get("text", "").lower()

                    commands = Commands().commands
                    handled = False

                    # execute the appropriate command(s)
                    if "help" in text:
                        handle_sync_command(channel_id, commands["help"]["method"])
                        handled = True
                    if "time" in text:
                        handle_sync_command(channel_id, commands["time"]["method"])
                        handled = True
                    if "hello" in text or "hi" in text:
                        handle_sync_command(
                            channel_id, commands["greet"]["method"], user
                        )
                        handled = True
                    if "service" in text or "status" in text:
                        handle_generator_command(
                            channel_id, commands["get_service_statuses"]["method"]
                        )
                        handled = True
                    if "docker" in text:
                        handle_generator_command(
                            channel_id, commands["get_docker_stats"]["method"]
                        )
                        handled = True
                    if not handled:
                        client.web_client.chat_postMessage(
                            channel=channel_id,
                            text="Sorry, I don't understand. Try `help` to see what I can do.",
                        )

                except SlackApiError as e:
                    logging.error(e.response["error"])
                    client.web_client.chat_postMessage(
                        channel=channel_id,
                        text="An unexpected error occurred",
                        blocks=[
                            {
                                "type": "section",
                                "text": {
                                    "type": "plain_text",
                                    "text": """An unexpected error occurred while
                                        processing your request.""",
                                },
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": f"```{e.response['error']}```",
                                },
                            },
                        ],
                    )


def handle_sigterm(*args):
    raise KeyboardInterrupt


if __name__ == "__main__":
    slackbot = None

    signal.signal(signal.SIGTERM, handle_sigterm)

    try:
        slackbot = SlackBot(Settings.SLACK_APP_TOKEN, Settings.SLACK_BOT_TOKEN)
        slackbot.start()

        # keep the program running
        Event().wait()
    except SlackApiError as e:
        logging.error(e.response["error"])
    except KeyboardInterrupt:
        logging.info("Gracefully shutting down...")
        if slackbot:
            slackbot.web_client.chat_postMessage(
                channel="#general",
                text="Gracefully shutting down... goodbye!",
            )
            slackbot.socket_client.close()
        exit(0)
