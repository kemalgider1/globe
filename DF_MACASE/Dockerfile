FROM python:3.9-buster

ENV PYTHONUNBUFFERED=1

# Install extra packages for the OS
# RUN apk --no-cache add vim

# Install Python libraries
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt --no-cache-dir

# Create a new user to run as non-root
ENV USER selma_user
ENV UID 10001
ENV GROUP selma
ENV GID 10001
ENV HOME /home/$USER
RUN groupadd -g $GID $GROUP && useradd -u $UID -G $GROUP $USER

# Copy your Python code
WORKDIR $HOME
COPY --chown=$UID:$GID app $HOME/app/

EXPOSE 8501

ENV PYTHONPATH /$HOME/
ENV APP_SETTINGS deploy

USER $UID:$GID
