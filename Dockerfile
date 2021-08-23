FROM  node:14.17.5

WORKDIR /usr/src/facerecog-api

COPY ./ ./

RUN npm install 

CMD ["/bin/bash"]