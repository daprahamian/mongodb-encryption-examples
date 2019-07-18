# Node Driver examples for Client Side Encryption

## Installation

First, ensure that you have libbson and libmongocryptd installed globally (requires `wget` and `cmake`):

```sh
# Installs libbson
wget https://github.com/mongodb/mongo-c-driver/releases/download/1.14.0/mongo-c-driver-1.14.0.tar.gz
tar xzf mongo-c-driver-1.14.0.tar.gz
cd mongo-c-driver-1.14.0
mkdir cmake-build && cd cmake-build
cmake -DENABLE_MONGOC=OFF -DCMAKE_C_FLAGS="-fPIC" ../
make -j8 install

cd ../../

# Installs libmongocrypt
git clone git@github.com:10gen/libmongocrypt.git
cd libmongocrypt
mkdir cmake-build && cd cmake-build
cmake -DCMAKE_C_FLAGS="-fPIC" ../
make -j8 install

cd ../../
```

Now, you can run `npm install`:

```sh
npm install
```

## Running the demo

1. Ensure that you have `mongocryptd` running at `localhost:27020`, and a `mongod` of version 4.2.0 running at `localhost:27017`
2. Save your AWS KMS credentials to a file named `env.sh` in the following format:

    ```sh
    #/usr/bin/bash

    export KMSKID="xxxxxxxxxxxxxxxxxxxx"
    export KMSKEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    export KMSARN="arn:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" #
    ```

3. Run the following command

    ```sh
    npm run demo
    ```
