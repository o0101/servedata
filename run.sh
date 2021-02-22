#!/bin/bash

su -c "source /root/.profile; echo $(node -v); npm run start"
