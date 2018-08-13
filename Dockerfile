
FROM node:9.6.1

WORKDIR /var/lib/google-home-openstack

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
