from docker import from_env as get_docker_client
from docker.errors import APIError as DockerAPIError, DockerException
from api.docker.models import DockerContainerStatsModel, DockerStatsModel

def ping_docker() -> bool:
    try:
        client = get_docker_client()
        return client.ping()
    except (DockerAPIError, DockerException) as e:
        print('ERROR: Could not connect to Docker daemon')
        return False

def get_container_stats() -> DockerStatsModel:
    # connect to Docker daemon and fetch containers
    client = get_docker_client()
    containers = client.containers.list()
    # set initial values
    system_cpu_usage: int = 0
    container_stats: list[DockerContainerStatsModel] = []
    # iterate over containers
    for container in containers:
        # fetch container stats using Docker SDK
        stats_raw = container.stats(stream=False)
        # parse block I/O (amount of data the container has written to and read from block devices)
        try:
            block_io_raw = stats_raw['blkio_stats']['io_service_bytes_recursive']
            block_in = block_io_raw[0]['value'] or 0
            block_out = block_io_raw[1]['value'] or 0
        except (KeyError, IndexError) as e:
            print('ERROR: Could not read block I/O')
            block_in = 0
            block_out = 0
        # parse memory usage
        # Note: `docker stats` command does not return memory usage on Raspberry Pis by default
        # see: https://forums.raspberrypi.com/viewtopic.php?t=203128
        try:
            memory_usage = stats_raw['memory_stats']['usage']
            memory_limit = stats_raw['memory_stats']['limit']
        except KeyError as e:
            print('ERROR: Could not read memory usage')
            memory_usage = 0
            memory_limit = 0

        # create container stats model
        container_stat: DockerContainerStatsModel = DockerContainerStatsModel(
            id=container.id,
            name=container.name,
            cpu_usage=stats_raw['cpu_stats']['cpu_usage']['total_usage'],
            memory_usage=memory_usage,
            memory_limit=memory_limit,
            network_in=stats_raw['networks']['eth0']['rx_bytes'],
            network_out=stats_raw['networks']['eth0']['tx_bytes'],
            network_dropped=stats_raw['networks']['eth0']['rx_dropped'] + stats_raw['networks']['eth0']['tx_dropped'],
            block_in=block_in,
            block_out=block_out,
            pids=stats_raw['pids_stats']['current'],
        )
        # add container stats to list
        container_stats.append(container_stat)
        system_cpu_usage = max(system_cpu_usage, stats_raw['cpu_stats']['system_cpu_usage'])

    return DockerStatsModel(
        containers=container_stats,
        system_cpu_usage=system_cpu_usage,
    )
        