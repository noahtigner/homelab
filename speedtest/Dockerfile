FROM python:3.12-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONBUFFERED 1

# update pip and wheels
RUN pip3 install --no-cache-dir --timeout=1000 --upgrade pip wheel setuptools

# install python packages
COPY ./requirements.txt /app/requirements.txt
RUN pip3 install --no-cache-dir --timeout=1000 --upgrade -r /app/requirements.txt

COPY ./main.py /app/main.py
