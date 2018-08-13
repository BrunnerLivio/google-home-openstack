# Google Home Openstack

Application which creates Openstack Virtual Machines when
command Google Home to.

## Getting Started

Clone the repo and make sure you have NodeJS 9.x.x installed.

```bash

# Edit configuration
vi config.yml
CONFIG="$(pwd)/config.yml" npm install
npm start

```

## Docker

```bash

# Run container
docker build -t $USER/google-home-openstack .

# Start container
# Do not forget environment variables if needed!
docker run \
  -v "$(pwd)/config.yml:/var/lib/google-home-openstack/config.yml" \
  -ti $USER/google-home-openstack

```

## Environment Variables

| Variable Name | Description                                                                | Type    | Example                    | Default |
|:--------------|:---------------------------------------------------------------------------|:--------|:---------------------------|:--------|
| CONFIG        | The absolute path to the config file                                       | string  | CONFIG="$(pwd)/config.yml" | -       |
| DRY_RUN       | If should only simulate this app (not actually alter anything permanently) | boolean | DRY_RUN=true               | false   |
| NO_EMOJI      | Do not print any emojis                                                    | boolean | NO_EMOJI=true              | false   |
| LOG_LEVEL     | The level of the log (error, warn, info, debug, silly)                     | string  | LOG_LEVEL=silly            | info    |
