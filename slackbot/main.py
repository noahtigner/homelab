import logging
from datetime import datetime
from threading import Event

from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.request import SocketModeRequest
from slack_sdk.socket_mode.response import SocketModeResponse

from config import Settings

logging.basicConfig(level=logging.DEBUG)


class Commands:
    def __init__(self):
        self.commands = {
            "help": {
                "description": "List available commands",
                "usage": "help",
                "method": self.help,
            },
            "time": {
                "description": "Get the current time",
                "usage": "time",
                "method": lambda: f"\nIt is currently {datetime.now().strftime('%H:%M:%S')}",
            },
            "greet": {
                "description": "Greet the bot",
                "usage": "greet",
                "method": lambda username: f"Hello <@{username}>!",
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

                # respond with a message
                text = event.get("text", "")
                commands = Commands().commands

                if "help" in text:
                    response_text = commands["help"]["method"]()
                elif "time" in text:
                    response_text = commands["time"]["method"]()
                elif "hello" in text or "hi" in text:
                    response_text = commands["greet"]["method"](user)
                else:
                    response_text = (
                        "Sorry, I don't understand. Try `help` to see what I can do."
                    )

                client.web_client.chat_postMessage(
                    channel=channel_id, text=response_text
                )


if __name__ == "__main__":
    try:
        slackbot = SlackBot(Settings.SLACK_APP_TOKEN, Settings.SLACK_BOT_TOKEN)
        slackbot.start()

        # keep the program running
        Event().wait()
    except SlackApiError as e:
        logging.error(e.response["error"])
