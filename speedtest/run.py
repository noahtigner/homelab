import subprocess
import time
import logging
import json


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


if __name__ == '__main__':
    logger.info('startup')

    while True:
        result = subprocess.run(
            ['speedtest', '--json'],
            capture_output = True,
            text = True
        )

        try:
            data = json.loads(result.stdout)
            logger.info(json.dumps(data))
        except:
            logger.error('Invalid JSON')
        if result.stderr:
            logger.error(result.stderr)

        time.sleep(60 * 5)
