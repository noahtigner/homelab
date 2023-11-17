import psutil

def get_cpu_temp() -> float:
    f = open('/sys/class/thermal/thermal_zone0/temp')
    raw_temp = f.readline()
    f.close()
    return float(raw_temp) / 1000

def get_cpu_count() -> int:
    return psutil.cpu_count()

def get_cpu_percent(interval: float) -> float:
    return psutil.cpu_percent(interval=interval, percpu=True)

def get_cpu_usage(interval: float) -> dict:
    return {
        "count": get_cpu_count(),
        "percent": get_cpu_percent(interval),
        "temp": get_cpu_temp(),
    }

def get_mem_usage() -> dict:
    mem_usage = psutil.virtual_memory()
    return {
        "total": mem_usage.total,
        "used": mem_usage.used,
        "available": mem_usage.available,
        "percent": mem_usage.percent,
    }

def get_disk_usage() -> dict:
    disk_usage = psutil.disk_usage("/")
    return {
        "total": disk_usage.total,
        "used": disk_usage.used,
        "free": disk_usage.free,
        "percent": disk_usage.percent,
    }

def get_pids() -> list[int]:
    return psutil.pids()
