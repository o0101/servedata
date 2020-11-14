# :crystal_ball: [ServeData](https://github.com/cris691/servedata) ![downloads](https://img.shields.io/npm/dt/servedata) ![version](https://img.shields.io/npm/v/servedata?label=version)

**Around 3000 source lines of code** (see stats folder)

## What is ServeData / Capi.click?

A simple server based on [SirDB](https://github.com/cris691/stubdb) with a [schema-driven](https://buf.build/blog/api-design-is-stuck-in-the-past) API, for serving all types of data, while attempting to meet [ROCA](https://roca-style.org/) guidelines.

Already includes schemas, users, groups, authentication, authorization and permissions. 


## Using this template

You need to populate the secrets directory, with a G Suite/GMail API key with sender permissions, and (if you want fun error pages), a Giphy API key.

Also right now there's some places in the templates where I used my email (cris@dosycorp.com), so you probably want to replace that.

Also to use payments, you need Stripe keys. 


## Use cases

This uses the SirDB as a database. This would be acceptable for user account related use cases for a moderate number of users (up to 100k), or for user content and data related use cases for a smaller number of less frequent users (up to 5k). Mitigations such as vertical scaling, and using a ramdisk (with scheduled saves to hard disk) can increase performance.

For apps with a large number of users performing many operations on data and content, a separate database for content and data (separate to user account data) will be good.

## Features

- Automatic CRUD for tables
- Permissions for users and groups
- Custom actions for updating multiple tables or using 3rd party APIs
- Views for showing result of simple operations
- Custom selections to grab data from multiple tables or 3rd party APIs and display

Examples of all the above can be found in the code.

You can use whatever view framework you like. For convenience here I use bepis.

