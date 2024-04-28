FROM python:3.12-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONBUFFERED 1

# install requirements for psutil
RUN apt-get update --yes && \
    apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends \
    python3-dev \
    gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# install requirements for pyproject.toml-based projects
RUN pip install --no-cache-dir --upgrade setuptools wheel


# install python packages
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
