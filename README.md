# Google Home Openstack

**Application which creates Openstack Virtual Machines when
command Google Home to.**

[![Gitter](https://badges.gitter.im/brunnel/google-home-openstack.svg)](https://gitter.im/google-home-openstack/)
[![Circle CI Status](https://circleci.com/gh/BRUNNEL6/google-home-openstack.png?circle-token=2c7bd0eebaeb959c02572c8990b17d5836ac51c5&style=shield)](https://circleci.com/gh/BRUNNEL6/google-home-openstack)

![Architecture](assets/architecture.svg)

## Purpose

`google-home-openstack` lets you control your Openstack setup with your Google Home. This application was split into multiple parts; [internet-part](https://github.com/brunnel6/dialogflow-adafruit-forwarder) and intranet-part (this appliaction).

Thanks to this architecture it is possible to control your Openstack setup, without connecting it to the internet.

The main purpose of this package is validating the incoming parameters from Dialogflow, sending the correct request(s) to the Openstack API, and sending a human-readable anwser back.

## Getting Started

### From Source

To build it from source, make sure you have NodeJS 9.x.x and Git installed.

```bash

# Clone the repository
git clone https://github.com/brunnel6/google-home-openstack
# Edit configuration
vi config.yml
# Install dependencies
npm install
# Build the application
npm run build
# Run it
CONFIG="$(pwd)/config.yml" npm start

```

### Docker

You can use Docker 18.x.x-ce to run the application, without installing NodeJS on your
machine.

```bash

# Edit configuration
wget https://raw.githubusercontent.com/BRUNNEL6/google-home-openstack/master/config.yml
vi config.yml

# Start container
# Do not forget environment variables if needed!
docker run \
  -v "$(pwd)/config.yml:/var/lib/google-home-openstack/config.yml" \
  -ti brunnel6/google-home-openstack:latest

```

### docker-compose (+automatic container updates)

This `docker-compose` configuration starts [v2tec/watchtower](https://github.com/v2tec/watchtower) in addition to `google-home-openstack`. Watchtower watches over the docker image and updates it, if a new docker image version is public.

```bash

# Edit configuration
cp config.yml my-config.yml
vi my-config.yml

# Start applications
docker-compose up

```

## Environment Variables

| Variable Name | Description                                                                | Type    | Example                    | Default |
|:--------------|:---------------------------------------------------------------------------|:--------|:---------------------------|:--------|
| CONFIG        | The absolute path to the config file                                       | string  | CONFIG="$(pwd)/config.yml" | -       |
| DRY_RUN       | If should only simulate this app (not actually alter anything permanently) | boolean | DRY_RUN=true               | false   |
| NO_EMOJI      | Do not print any emojis                                                    | boolean | NO_EMOJI=true              | false   |
| LOG_LEVEL     | The level of the log (error, warn, info, debug, silly)                     | string  | LOG_LEVEL=silly            | info    |

## Related

- [dialogflow-adafruit-forwarder](https://github.com/BRUNNEL6/dialogflow-adafruit-forwarder): The application which forwards messages from Dialogflow to Adafruit.

## People

- [Livio Brunner](https://github.com/BrunnerLivio) - Author
- [Eric Keller](https://github.com/erickellerek1) - Idea
