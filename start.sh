#!/bin/bash

mkdir -p secrets
mkdir -p sslcerts

cp dummy_secrets/* secrets/

cp ~/certs/* sslcerts/
