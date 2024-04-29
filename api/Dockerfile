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

# install requirements for pandas
RUN apt-get update --yes && \
    apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends \
    cmake \
    python3-numpy && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# update pip and wheels
RUN pip3 install --no-cache-dir --timeout=1000 --upgrade pip wheel setuptools

# install python packages
COPY ./requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir --timeout=1000 --upgrade -r /app/requirements.txt
